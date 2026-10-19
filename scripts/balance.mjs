#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// BALANCE SIMULATOR
// Plays full games with the same rules as the browser store
// (src/engine/gameRules.js) and reports outcome distributions per
// class and player type.
//
// Player types:
//   passive — never decides, every event resolves to its default
//   random  — picks a random affordable choice (15% skip)
//   smart   — tries each option a few months ahead and takes the best
//   mixed   — 50/50 smart or random per decision (typical participant)
//
// Usage:
//   node scripts/balance.mjs                 # all classes, 150 runs each
//   node scripts/balance.mjs service 300     # one class, 300 runs
//   node scripts/balance.mjs all 150 --json  # machine-readable output
//   SEED=7 node scripts/balance.mjs          # different seed
// ═══════════════════════════════════════════════════════════════

import { CLASSES } from "../src/classes/index.js";
import { calculateDeltas, isBoardMeetingMonth } from "../src/engine/boardMeeting.js";
import { checkEndCondition, pickRandom } from "../src/engine/gameEngine.js";
import {
	applyBoardOutcome,
	applyMonthlyPressure,
	buildInitialState,
	drawMonthEvents,
	effectiveAP,
	getAdvanceMonth,
	getCalculatePMF,
	getGenerateForecast,
	WORLD_EVENT_CHANCE,
	WORLD_EVENT_FROM_MONTH,
} from "../src/engine/gameRules.js";
import { applyLeverValues, getBoardLevers } from "../src/engine/boardLevers.js";
import { applyEffectsWithVariance } from "../src/engine/varianceEngine.js";
import { WORLD_EVENTS } from "../src/events/worldEvents.js";

// ─── Seeded RNG (engines call Math.random directly) ───
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
Math.random = mulberry32(Number(process.env.SEED ?? 42));

const MAX_MONTHS = 24;

function defaultAssumptions(config) {
	return Object.fromEntries(config.assumptions.map((a) => [a.key, a.default]));
}

// ─── Look-ahead used by the smart player ───
function rolloutScore(classId, config, start, months) {
	const advance = getAdvanceMonth(classId);
	const pmfOf = getCalculatePMF(classId);
	if (start.acquired) return 70;
	let s = start;
	for (let i = 0; i < months; i++) {
		const next = applyMonthlyPressure(advance(s, config));
		next.pmf = pmfOf(next);
		s = next;
		if (s.cash <= 0) return -150 + i * 10;
	}
	const runway = Math.min(s.runway ?? 0, 18);
	return s.pmf + runway * 1.2;
}

function evaluateOption(classId, config, state, effects, rollouts, horizon) {
	let total = 0;
	for (let i = 0; i < rollouts; i++) {
		const after = applyEffectsWithVariance(effects, state);
		total += rolloutScore(classId, config, after, horizon);
	}
	return total / rollouts;
}

const POLICIES = {
	// Proxy for a typical workshop participant: every decision is either
	// thought through (smart) or a gut call (random), 50/50.
	mixed: (ctx) => (Math.random() < 0.5 ? POLICIES.smart(ctx) : POLICIES.random(ctx)),
	passive: () => null,
	random: ({ affordable }) =>
		affordable.length && Math.random() > 0.15 ? pickRandom(affordable) : null,
	smart: ({ classId, config, state, event, affordable }) => {
		const options = [
			{ choice: null, effects: event.defaultOutcome.effects },
			...affordable.map((c) => ({ choice: c, effects: c.effects })),
		];
		let best = options[0];
		let bestScore = -Infinity;
		for (const opt of options) {
			const score = evaluateOption(classId, config, state, opt.effects, 6, 4);
			// Small AP-saving bias so free skips win ties
			const adj = opt.choice ? score - 0.5 * (opt.choice.apCost ?? 1) : score;
			if (adj > bestScore) {
				bestScore = adj;
				best = opt;
			}
		}
		return best.choice;
	},
};

// ─── Board meeting decisions ───
function leverCandidates(lever, state, config) {
	const cur = lever.read(state);
	const lo = lever.min(state, config);
	const hi = lever.max(state, config);
	const steps = [-4, -2, -1, 1, 2, 4];
	return [...new Set(steps.map((k) => Math.max(lo, Math.min(hi, cur + k * lever.step))))].filter(
		(v) => v !== cur,
	);
}

const BOARD_POLICIES = {
	mixed: (ctx, state) =>
		Math.random() < 0.5 ? BOARD_POLICIES.smart(ctx, state) : BOARD_POLICIES.random(ctx, state),
	passive: (_ctx, state) => state,
	random: ({ classId, config }, state) => {
		if (Math.random() > 0.4) return state;
		const lever = pickRandom(getBoardLevers(classId));
		const value = pickRandom(leverCandidates(lever, state, config));
		return value === null ? state : applyLeverValues(classId, state, { [lever.key]: value });
	},
	smart: ({ classId, config }, state) => {
		const score = (s) => {
			let t = 0;
			for (let i = 0; i < 6; i++) t += rolloutScore(classId, config, s, 6);
			return t / 6;
		};
		let best = state;
		let bestScore = score(state);
		for (let round = 0; round < 2; round++) {
			let improved = false;
			for (const lever of getBoardLevers(classId)) {
				for (const v of leverCandidates(lever, best, config)) {
					const cand = applyLeverValues(classId, best, { [lever.key]: v });
					const sc = score(cand);
					if (sc > bestScore + 1) {
						bestScore = sc;
						best = cand;
						improved = true;
					}
				}
			}
			if (!improved) break;
		}
		return best;
	},
};

function playEvents(ctx, state, events, ap, policy) {
	let s = state;
	let apLeft = ap;
	const decisions = [];
	for (const event of events) {
		const choices = event.getChoices ? event.getChoices(ctx.classId) : [];
		const affordable = choices.filter((c) => apLeft >= (c.apCost ?? 1));
		const pick = policy({ ...ctx, state: s, event, affordable });
		const month = s.month;
		if (pick) {
			const feedback = pick.dynamicFeedback ? pick.dynamicFeedback(s) : pick.feedback;
			s = applyEffectsWithVariance(pick.effects, s);
			apLeft -= pick.apCost ?? 1;
			decisions.push({ month, event: event.title, choice: pick.text, feedback, isWorld: false, wasDefault: false });
		} else {
			s = applyEffectsWithVariance(event.defaultOutcome.effects, s);
			decisions.push({ month, event: event.title, choice: "[Skipped]", feedback: event.defaultOutcome.feedback, isWorld: false, wasDefault: true });
		}
		s.pmf = ctx.pmfOf(s);
		ctx.used.push(event.id);
	}
	return { state: s, decisions };
}

export function simulateGame(classId, policyName, trace = null) {
	return simulateGameDetailed(classId, policyName, trace).summary;
}

/** Full game record: history, decisions, forecast and assumptions. */
export function simulateGameDetailed(classId, policyName, trace = null) {
	const config = CLASSES[classId];
	const policy = POLICIES[policyName];
	const assumptions = defaultAssumptions(config);
	const forecast = getGenerateForecast(classId)(assumptions);
	const advance = getAdvanceMonth(classId);
	const pmfOf = getCalculatePMF(classId);
	const ctx = { classId, config, pmfOf, used: [] };
	const usedWorlds = [];
	const allDecisions = [];
	const record = (result, s, maxPmf) => ({
		summary: summarize(result, s, maxPmf),
		result,
		history,
		decisions: allDecisions,
		forecast,
		assumptions,
	});

	let state = buildInitialState(classId, config, assumptions, null);
	const history = [state];
	let maxPmf = 0;

	for (let guard = 0; guard < MAX_MONTHS + 2; guard++) {
		const advanced = advance(state, config);
		advanced.pmf = pmfOf(advanced);
		let monthly = applyMonthlyPressure(advanced);
		const ap = effectiveAP(monthly, 3);

		if (monthly.month >= WORLD_EVENT_FROM_MONTH && Math.random() < WORLD_EVENT_CHANCE) {
			const world = pickRandom(WORLD_EVENTS.filter((w) => !usedWorlds.includes(w.id)));
			if (world) {
				monthly = world.effect(monthly);
				monthly.pmf = pmfOf(monthly);
				usedWorlds.push(world.id);
				allDecisions.push({ month: monthly.month, event: world.title, choice: "World Event", feedback: world.flavor, isWorld: true });
			}
		}
		history.push(monthly);
		state = monthly;
		if (trace) trace(state);
		maxPmf = Math.max(maxPmf, state.pmf ?? 0);

		let end = checkEndCondition(state, history);
		if (end) return record(end, state, maxPmf);

		if (isBoardMeetingMonth(state.month)) {
			const deltas = calculateDeltas(forecast, state, state.month, classId);
			state = applyBoardOutcome({ deltas }, state, config).state;
			state = BOARD_POLICIES[policyName](ctx, state);
		}

		const events = drawMonthEvents(state.month, ctx.used, classId);
		const played = playEvents(ctx, state, events, ap, policy);
		state = played.state;
		allDecisions.push(...played.decisions);

		end = checkEndCondition(state, history);
		if (end) return record(end, state, maxPmf);
	}
	return record("survived", state, maxPmf);
}

function summarize(result, state, maxPmf) {
	return {
		result,
		month: state.month,
		cash: state.cash,
		revenue: state.revenue ?? state.totalMRR ?? 0,
		pmf: state.pmf ?? 0,
		maxPmf,
	};
}

function runBatch(classId, policyName, runs) {
	const counts = { dead: 0, pmf: 0, survived: 0, acquired: 0 };
	const deathMonths = [];
	const pmfMonths = [];
	let maxPmfSum = 0;
	let revenueSum = 0;
	for (let i = 0; i < runs; i++) {
		const r = simulateGame(classId, policyName);
		counts[r.result]++;
		if (r.result === "dead") deathMonths.push(r.month);
		if (r.result === "pmf") pmfMonths.push(r.month);
		maxPmfSum += r.maxPmf;
		revenueSum += r.revenue;
	}
	const median = (arr) => {
		if (!arr.length) return null;
		const s = [...arr].sort((a, b) => a - b);
		return s[Math.floor(s.length / 2)];
	};
	const pct = (k) => Math.round((counts[k] / runs) * 100);
	return {
		dead: pct("dead"),
		pmf: pct("pmf"),
		survived: pct("survived"),
		acquired: pct("acquired"),
		deathMonth: median(deathMonths),
		pmfMonth: median(pmfMonths),
		avgMaxPmf: Math.round(maxPmfSum / runs),
		avgEndRevenue: Math.round(revenueSum / runs),
	};
}

// ─── CLI ───
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
	const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
	const asJson = process.argv.includes("--json");
	const classArg = args[0] && args[0] !== "all" ? [args[0]] : Object.keys(CLASSES);
	const runs = Number(args[1] ?? 150);
	const out = {};
	for (const classId of classArg) {
		if (!CLASSES[classId]) {
			console.error(`Unknown class: ${classId}`);
			process.exit(1);
		}
		out[classId] = {};
		for (const p of ["passive", "random", "mixed", "smart"]) out[classId][p] = runBatch(classId, p, runs);
	}
	const traceKeys = process.argv.find((a) => a.startsWith("--trace="));
	if (traceKeys) {
		const keys = traceKeys.slice(8).split(",");
		const policy = args[2] ?? "smart";
		const r = simulateGame(classArg[0], policy, (st) =>
			console.log(
				`M${String(st.month).padStart(2)} ` +
					keys.map((k) => `${k}=${typeof st[k] === "number" ? Math.round(st[k] * 10) / 10 : st[k]}`).join(" "),
			),
		);
		console.log("→", r);
		process.exit(0);
	}
	if (asJson) {
		console.log(JSON.stringify(out, null, 2));
	} else {
		for (const [classId, rows] of Object.entries(out)) {
			console.log(`\n═══ ${CLASSES[classId].name} (${classId}) — ${runs} runs ═══`);
			for (const [p, r] of Object.entries(rows)) {
				console.log(
					`  ${p.padEnd(7)} Dead ${String(r.dead).padStart(3)}% (M${r.deathMonth ?? "-"}) | PMF ${String(r.pmf).padStart(3)}% (M${r.pmfMonth ?? "-"}) | Surv ${String(r.survived).padStart(3)}% | Acq ${String(r.acquired).padStart(3)}% | maxPMF ${r.avgMaxPmf} | endRev €${r.avgEndRevenue}`,
				);
			}
		}
	}
}
