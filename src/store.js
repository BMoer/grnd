// ═══════════════════════════════════════════════════════════════
// GAME STORE (Zustand)
// Single source of truth for all game state.
//
// Monthly flow:
//   1. Month advances, financials calculated
//   2. World event check → banner if triggered
//   3. AP resets to 3, draw 2-3 decision events
//   4. Events shown one at a time:
//      - Enough AP → player picks choice (costs AP)
//      - Not enough AP → auto-default (painful)
//      - Player can also explicitly skip → default
//   5. All events resolved → next month
// ═══════════════════════════════════════════════════════════════

import { create } from "zustand";
import { getClass } from "./classes/index.js";
import { DECISION_EVENTS } from "./events/decisions.js";

// Class-aware dispatchers
function getAdvanceMonth(classId) {
	if (classId === "consumer") return advanceConsumerMonth;
	if (classId === "deeptech") return advanceDeepTechMonth;
	if (classId === "marketplace") return advanceMarketplaceMonth;
	if (classId === "service") return advanceServiceMonth;
	return engineAdvance;
}
function getGenerateForecast(classId) {
	if (classId === "consumer") return generateConsumerForecast;
	if (classId === "deeptech") return generateDeepTechForecast;
	if (classId === "marketplace") return generateMarketplaceForecast;
	if (classId === "service") return generateServiceForecast;
	return generateSaaSForecast;
}
function getCalculatePMF(classId) {
	if (classId === "consumer") return calculateConsumerPMF;
	if (classId === "deeptech") return calculateDeepTechPMF;
	if (classId === "marketplace") return calculateMarketplacePMF;
	if (classId === "service") return calculateServicePMF;
	return calculateSaaSPMF;
}
function getAllEvents(classId) {
	if (classId === "consumer")
		return [
			...CONSUMER_EVENTS,
			...DECISION_EVENTS.filter((e) => e.months.some((m) => m > 8)),
		];
	if (classId === "deeptech")
		return [
			...DEEPTECH_EVENTS,
			...DECISION_EVENTS.filter((e) => e.months.some((m) => m > 12)),
		];
	if (classId === "marketplace")
		return [
			...MARKETPLACE_EVENTS,
			...DECISION_EVENTS.filter((e) => e.months.some((m) => m > 10)),
		];
	if (classId === "service")
		return [
			...SERVICE_EVENTS,
			...DECISION_EVENTS.filter((e) => e.months.some((m) => m > 8)),
		];
	return DECISION_EVENTS;
}

import { getInsightCard } from "./data/insightCards.js";
import {
	calculateDeltas,
	generateBoardFeedback,
	getBoardPhase,
	isBoardMeetingMonth,
} from "./engine/boardMeeting.js";
import {
	advanceConsumerMonth,
	calculateConsumerPMF,
	generateConsumerForecast,
} from "./engine/consumerEngine.js";
import {
	advanceDeepTechMonth,
	calculateDeepTechPMF,
	generateDeepTechForecast,
} from "./engine/deeptechEngine.js";
import { generateSaaSForecast } from "./engine/forecastEngine.js";
import {
	checkEndCondition,
	advanceMonth as engineAdvance,
	getAvailableEvents,
	pickRandom,
} from "./engine/gameEngine.js";
import { getHint } from "./engine/hintEngine.js";
import {
	advanceMarketplaceMonth,
	calculateMarketplacePMF,
	generateMarketplaceForecast,
} from "./engine/marketplaceEngine.js";
import { calculateSaaSPMF } from "./engine/pmfCalculator.js";
import {
	advanceServiceMonth,
	calculateServicePMF,
	generateServiceForecast,
} from "./engine/serviceEngine.js";
import {
	clearGameState,
	consumeInjectedEvent,
	getPlayerId,
	loadGameState,
	pollInjectedEvent,
	saveGameState,
	sendTelemetry,
} from "./engine/telemetry.js";
import { applyEffectsWithVariance } from "./engine/varianceEngine.js";
import { CONSUMER_EVENTS } from "./events/consumerDecisions.js";
import { DEEPTECH_EVENTS } from "./events/deeptechDecisions.js";
import { MARKETPLACE_EVENTS } from "./events/marketplaceDecisions.js";
import { SERVICE_EVENTS } from "./events/serviceDecisions.js";
import { WORLD_EVENTS } from "./events/worldEvents.js";

/**
 * Calculate meaningful state deltas for feedback display.
 */
function calculateStateDelta(before, after) {
	const keys = [
		{ key: "totalMRR", label: "MRR", prefix: "€", round: true },
		{ key: "customers", label: "Customers", round: true },
		{ key: "churn", label: "Churn", suffix: "%", decimals: 1 },
		{ key: "product", label: "Produkt", round: true },
		{ key: "pipeline", label: "Pipeline", round: true },
		{ key: "cash", label: "Cash", prefix: "€", round: true },
		{ key: "burnRate", label: "Burn", prefix: "€", round: true },
		{ key: "conversionRate", label: "Conversion", suffix: "%", decimals: 1 },
		{ key: "cac", label: "CAC", prefix: "€", round: true },
	];
	const result = [];
	for (const { key, label, prefix, suffix, round, decimals } of keys) {
		const bv = before[key] ?? 0;
		const av = after[key] ?? 0;
		const delta = av - bv;
		if (Math.abs(delta) < 0.05) continue;
		const formatted = round
			? Math.round(delta)
			: Number(delta.toFixed(decimals ?? 1));
		result.push({
			label,
			delta: formatted,
			display: `${formatted > 0 ? "+" : ""}${prefix ?? ""}${formatted}${suffix ?? ""}`,
			positive:
				key === "churn" || key === "cac" || key === "burnRate"
					? delta < 0
					: delta > 0,
		});
	}
	return result;
}

/**
 * Draw 1-3 events for a month from the available pool.
 * Weighted: month 1-3 → 1-2 events, month 4+ → 2-3 events.
 */
function drawMonthEvents(month, usedEventIds, classId) {
	const available = getAvailableEvents(
		getAllEvents(classId),
		month,
		usedEventIds,
	);
	if (available.length === 0) return [];

	const maxDraw = month <= 3 ? 2 : 3;
	const minDraw = month <= 2 ? 1 : 2;
	const count = Math.min(
		available.length,
		minDraw + Math.floor(Math.random() * (maxDraw - minDraw + 1)),
	);

	// Shuffle and take
	const shuffled = [...available].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
}

export const useGameStore = create((set, get) => ({
	// ─── Screen state ───
	screen: "title", // title | setup | game | board | end

	// ─── Game config ───
	classId: null,
	classConfig: null,
	founderProfile: null,
	assumptions: {},
	forecast: [],

	// ─── Game state ───
	state: null,
	history: [],
	decisions: [],
	log: [],

	// ─── AP state ───
	ap: 3,
	maxAP: 3,

	// ─── Event state ───
	monthEvents: [], // all events drawn for this month
	monthEventIndex: 0, // which event we're showing
	currentEvent: null,
	currentWorldEvent: null,
	usedEvents: [],
	usedWorlds: [],
	lastFeedback: null, // feedback from last choice/default (shown briefly)

	// ─── Hints ───
	currentHint: null,
	shownHints: {},

	// ─── Result ───
	result: null,

	// ─── Board meeting ───
	boardData: null,
	boardPopup: false,
	shownInsightCards: [],
	currentInsightCard: null,

	// ─── Actions ───

	selectClass: (classId) => {
		const config = getClass(classId);
		if (!config) return;
		const defaults = {};
		config.assumptions.forEach((a) => {
			defaults[a.key] = a.default;
		});
		set({
			classId,
			classConfig: config,
			assumptions: defaults,
			screen: "character",
		});
	},

	setFounderProfile: (profile) => {
		set({ founderProfile: profile, screen: "setup" });
	},

	updateAssumption: (key, value) => {
		set((s) => ({ assumptions: { ...s.assumptions, [key]: value } }));
	},

	startGame: () => {
		const { classId, classConfig, assumptions, founderProfile } = get();
		if (!classConfig) return;

		const forecast = getGenerateForecast(classId)(assumptions);
		const em = founderProfile?.engineModifiers ?? {};

		// Apply founder modifiers to initial state
		const startingCashDelta = em.startingCashDelta ?? 0;
		const apMod = em.apModifier ?? 0;
		const basePipeline =
			assumptions.pipelineGrowth ?? classConfig.initial.pipeline ?? 12;

		const initial = {
			...classConfig.initial,
			price: assumptions.price ?? classConfig.initial.price,
			churn: assumptions.churnRate ?? classConfig.initial.churn ?? 5,
			cac: assumptions.targetCAC ?? classConfig.initial.cac ?? 80,
			conversionRate:
				assumptions.conversionRate ?? classConfig.initial.conversionRate ?? 15,
			supportCost:
				assumptions.supportCost ?? classConfig.initial.supportCost ?? 5,
			pipeline: basePipeline + (em.pipelineBonus ?? 0),
			pipelineGrowth: basePipeline,
			mrrPerCustomer: assumptions.price ?? classConfig.initial.price ?? 49,
			cash: (classConfig.initial.cash ?? 100000) + startingCashDelta,
			maxAP: Math.max(2, 3 + apMod),
			// Store engine modifiers for ongoing use
			founderMods: em,
		};

		set({
			state: initial,
			history: [initial],
			decisions: [],
			usedEvents: [],
			usedWorlds: [],
			result: null,
			currentEvent: null,
			currentWorldEvent: null,
			monthEvents: [],
			monthEventIndex: 0,
			ap: 3,
			maxAP: 3,
			boardData: null,
			boardPopup: false,
			lastFeedback: null,
			forecast,
			log: [
				{
					text: `${classConfig.name} initialized`,
					color: classConfig.color,
					prefix: "$",
				},
				{ text: classConfig.tagline, color: "muted" },
				...(founderProfile
					? [
							{
								text: `Difficulty: ${founderProfile.difficulty}/10 | Fundraising: ×${(em.fundraisingSuccessRate ?? 1).toFixed(2)}`,
								color: em.fundraisingSuccessRate < 0.8 ? "danger" : "muted",
								prefix: "◆",
							},
							...(em.partTime
								? [
										{
											text: "Part-time for first 6 months (−1 AP)",
											color: "caution",
											prefix: "!",
										},
									]
								: []),
						]
					: []),
				{
					text: `Win: ${classConfig.model.winBy}`,
					color: classConfig.color,
					prefix: "★",
				},
				{
					text: `Death: ${classConfig.model.deathBy}`,
					color: "danger",
					prefix: "✗",
				},
				{
					text: `${initial.maxAP} AP per month. Choose wisely — what you skip resolves badly.`,
					color: "caution",
					prefix: "!",
				},
			],
			screen: "game",
		});

		// Start month 1
		setTimeout(() => get()._startMonth(initial), 200);
	},

	/**
	 * Internal: begin a new month. Calculates financials, checks world events, draws events.
	 */
	_startMonth: async (prevState) => {
		const { classConfig, usedWorlds, forecast, maxAP } = get();

		// Advance month + calculate financials
		const monthly = getAdvanceMonth(get().classId)(prevState, classConfig);
		monthly.pmf = getCalculatePMF(get().classId)(monthly);

		// Natural churn pressure: churn drifts up slightly each month if product isn't improving
		if (monthly.month > 3 && (monthly.product ?? 30) < 40) {
			monthly.churn = Math.min(20, (monthly.churn ?? 5) + 0.5);
		}

		// Reset AP (maxAP can be modified by events like burnout)
		let effectiveMaxAP = monthly.maxAP ?? maxAP;
		// Part-time founders lose 1 AP for first N months
		const fm = monthly.founderMods || {};
		if (fm.partTime && monthly.month <= (fm.partTimeMonths ?? 6)) {
			effectiveMaxAP = Math.max(1, effectiveMaxAP - 1);
		}
		const ap = effectiveMaxAP;

		// ─── Telemetry: send state + poll for injected events ───
		sendTelemetry(monthly, get().classId, classConfig);

		// Check for admin-injected world event first
		let worldEvent = null;
		const injected = await pollInjectedEvent();
		if (injected) {
			// Admin sent a targeted event — use it instead of random
			worldEvent = injected;
			await consumeInjectedEvent();
		} else if (monthly.month >= 3 && Math.random() < 0.4) {
			// Normal random world event (40% chance after month 2)
			const availWorlds = WORLD_EVENTS.filter(
				(w) => !usedWorlds.includes(w.id),
			);
			worldEvent = pickRandom(availWorlds);
		}

		if (worldEvent) {
			const impacted = worldEvent.effect(monthly);
			impacted.pmf = getCalculatePMF(get().classId)(impacted);
			const newHistory = [...get().history, impacted];

			set((s) => ({
				state: impacted,
				history: newHistory,
				ap,
				usedWorlds: [...s.usedWorlds, worldEvent.id],
				currentWorldEvent: worldEvent,
				currentEvent: null,
				monthEvents: [],
				monthEventIndex: 0,
				lastFeedback: null,
				decisions: [
					...s.decisions,
					{
						month: monthly.month,
						event: worldEvent.title,
						choice: "World Event",
						feedback: worldEvent.flavor,
						isWorld: true,
					},
				],
				log: [
					...s.log,
					{
						text: `── Month ${monthly.month} ──`,
						color: classConfig.color,
						prefix: "▸",
					},
					{ text: `AP: ${ap}/${effectiveMaxAP}`, color: "muted" },
					{ text: `${worldEvent.title}`, color: "caution", prefix: "!" },
				],
			}));

			saveGameState(get());

			// Check end
			const end = checkEndCondition(impacted, newHistory);
			if (end) {
				set({ result: end, screen: "end" });
				return;
			}
			return; // wait for dismissWorldEvent
		}

		// No world event — save state and draw events
		const newHistory = [...get().history, monthly];

		set((s) => ({
			state: monthly,
			history: newHistory,
			ap,
			lastFeedback: null,
			log: [
				...s.log,
				{
					text: `── Month ${monthly.month} ──`,
					color: classConfig.color,
					prefix: "▸",
				},
				{ text: `AP: ${ap}/${effectiveMaxAP}`, color: "muted" },
			],
		}));

		saveGameState(get());

		// Check end
		const end = checkEndCondition(monthly, newHistory);
		if (end) {
			set({ result: end, screen: "end" });
			return;
		}

		// Check board meeting — show popup interstitial first (stay on game screen)
		if (isBoardMeetingMonth(monthly.month)) {
			const deltas = calculateDeltas(forecast, monthly, monthly.month);
			const phase = getBoardPhase(monthly.month, false);
			const feedback = generateBoardFeedback(
				deltas,
				phase,
				monthly.month,
				monthly,
			);
			const quarter = Math.ceil(monthly.month / 3);
			const insightCard = getInsightCard(
				monthly,
				get().history,
				quarter,
				get().classId,
				get().shownInsightCards,
			);
			set((s) => ({
				boardData: { deltas, phase, feedback, quarter },
				boardPopup: true,
				currentInsightCard: insightCard,
				shownInsightCards: insightCard
					? [...s.shownInsightCards, insightCard.id]
					: s.shownInsightCards,
			}));
			return;
		}

		// Draw events for this month
		get()._drawMonthEvents();
	},

	/**
	 * Internal: draw events for this month and present first one.
	 */
	_drawMonthEvents: () => {
		const { state, usedEvents, history, shownHints } = get();
		const events = drawMonthEvents(state.month, usedEvents, get().classId);

		// Check for contextual hint
		const hint = getHint(state, history, shownHints);
		if (hint) {
			set((s) => ({
				currentHint: hint,
				shownHints: { ...s.shownHints, [hint.id]: state.month },
			}));
		} else {
			set({ currentHint: null });
		}

		if (events.length === 0) {
			// No events available — auto-advance
			get()._startMonth(state);
			return;
		}

		set({
			monthEvents: events,
			monthEventIndex: 0,
			currentEvent: events[0],
		});
	},

	/**
	 * Player makes a choice on current event (costs AP).
	 */
	makeChoice: (choice) => {
		const { state, currentEvent, ap } = get();

		// Apply effects with variance
		const newState = applyEffectsWithVariance(choice.effects, state);
		newState.pmf = getCalculatePMF(get().classId)(newState);

		const feedback = choice.dynamicFeedback
			? choice.dynamicFeedback(state)
			: choice.feedback;

		const newAP = ap - (choice.apCost ?? 1);

		// Calculate deltas for feedback display
		const deltas = calculateStateDelta(state, newState);

		set((s) => ({
			state: newState,
			ap: newAP,
			lastFeedback: { text: feedback, type: "choice", deltas },
			decisions: [
				...s.decisions,
				{
					month: state.month,
					event: currentEvent.title,
					choice: choice.text,
					feedback,
					isWorld: false,
					wasDefault: false,
				},
			],
			usedEvents: [...s.usedEvents, currentEvent.id],
			currentEvent: null,
			log: [
				...s.log,
				{ text: `> ${choice.text}`, color: "plan" },
				{ text: feedback, color: "muted", prefix: " " },
			],
		}));

		// Wait for player to click Continue (feedback persists)
	},

	/**
	 * Player skips current event (or forced by insufficient AP) → default outcome.
	 */
	skipEvent: () => {
		const { state, currentEvent, ap } = get();
		if (!currentEvent) return;

		const def = currentEvent.defaultOutcome;
		const newState = applyEffectsWithVariance(def.effects, state);
		newState.pmf = getCalculatePMF(get().classId)(newState);
		const choices = currentEvent.getChoices
			? currentEvent.getChoices(get().classId)
			: [];
		const forced = !choices.some((ch) => ap >= (ch.apCost ?? 1));

		const skipDeltas = calculateStateDelta(state, newState);

		set((s) => ({
			state: newState,
			lastFeedback: { text: def.feedback, type: "default", deltas: skipDeltas },
			decisions: [
				...s.decisions,
				{
					month: state.month,
					event: currentEvent.title,
					choice: forced ? "[No AP — unaddressed]" : "[Skipped]",
					feedback: def.feedback,
					isWorld: false,
					wasDefault: true,
				},
			],
			usedEvents: [...s.usedEvents, currentEvent.id],
			currentEvent: null,
			log: [
				...s.log,
				{
					text: forced
						? `✗ ${currentEvent.title} — no AP`
						: `✗ ${currentEvent.title} — skipped`,
					color: "danger",
				},
				{ text: def.feedback, color: "danger", prefix: " " },
			],
		}));

		// Wait for player to click Continue
	},

	/**
	 * Player acknowledges feedback and proceeds to next event or month.
	 */
	continuePastFeedback: () => {
		set({ lastFeedback: null });
		get()._nextEventOrMonth();
	},

	/**
	 * Internal: present next event or end the month.
	 */
	_nextEventOrMonth: () => {
		const { monthEvents, monthEventIndex, state } = get();
		const nextIdx = monthEventIndex + 1;

		if (nextIdx < monthEvents.length) {
			const nextEvent = monthEvents[nextIdx];
			set({
				monthEventIndex: nextIdx,
				currentEvent: nextEvent,
				lastFeedback: null,
			});

			// No auto-default — player always sees events and chooses.
			// If they can't afford any choice, they must skip manually.
		} else {
			// All events resolved → next month
			set({ lastFeedback: null });

			// Check end after all events
			const { history } = get();
			const end = checkEndCondition(state, history);
			if (end) {
				set({ result: end, screen: "end" });
				return;
			}

			setTimeout(() => get()._startMonth(state), 200);
		}
	},

	dismissWorldEvent: () => {
		const { state, forecast } = get();
		set({ currentWorldEvent: null });

		// Check end
		const { history } = get();
		const end = checkEndCondition(state, history);
		if (end) {
			set({ result: end, screen: "end" });
			return;
		}

		// Check board meeting — show popup interstitial first (stay on game screen)
		if (isBoardMeetingMonth(state.month)) {
			const deltas = calculateDeltas(forecast, state, state.month);
			const phase = getBoardPhase(state.month, false);
			const feedback = generateBoardFeedback(deltas, phase, state.month, state);
			const dQuarter = Math.ceil(state.month / 3);
			const dInsightCard = getInsightCard(
				state,
				get().history,
				dQuarter,
				get().classId,
				get().shownInsightCards,
			);
			set((s) => ({
				boardData: {
					deltas,
					phase,
					feedback,
					quarter: dQuarter,
				},
				boardPopup: true,
				currentInsightCard: dInsightCard,
				shownInsightCards: dInsightCard
					? [...s.shownInsightCards, dInsightCard.id]
					: s.shownInsightCards,
			}));
			return;
		}

		get()._drawMonthEvents();
	},

	adjustState: (changes) => {
		set((s) => ({
			state: { ...s.state, ...changes },
			log: [
				...s.log,
				{
					text: `Strategic adjustment: ${Object.entries(changes)
						.map(([k, v]) => `${k}=${v}`)
						.join(", ")}`,
					color: "plan",
					prefix: "▸",
				},
			],
		}));
	},

	reviseForecast: (newAssumptions) => {
		const forecast = getGenerateForecast(get().classId)(newAssumptions);
		set((s) => ({
			assumptions: newAssumptions,
			forecast,
			log: [
				...s.log,
				{ text: "Forecast revised. New plan set.", color: "plan", prefix: "▸" },
			],
		}));
	},

	/**
	 * Transition from popup to full board meeting screen.
	 */
	startBoardMeeting: () => {
		set({ boardPopup: false, screen: "board" });
	},

	/**
	 * Close board meeting → apply outcome effects for next quarter → continue.
	 */
	closeBoardMeeting: () => {
		const { boardData, state } = get();

		// Derive board effects from meeting outcome
		const effects = [];
		if (boardData) {
			const misses = boardData.deltas.filter((d) => d.status === "below");
			const wins = boardData.deltas.filter((d) => d.status === "above");
			const mrrDelta = boardData.deltas.find((d) => d.key === "totalMRR");
			const churnDelta = boardData.deltas.find((d) => d.key === "churn");

			const mods = {};

			if (wins.length >= 3) {
				// Strong quarter → momentum bonus
				effects.push({ label: "Momentum: +10% pipeline", positive: true });
				mods.pipelineBonus = Math.round((state.pipeline ?? 12) * 0.1);
			} else if (wins.length >= 2 && misses.length === 0) {
				effects.push({ label: "Confidence: +5% conversion", positive: true });
				mods.conversionBonus = 0.5;
			}

			if (misses.length >= 3) {
				// Bad quarter → pressure
				effects.push({
					label: "Pressure: +€500 burn (oversight)",
					positive: false,
				});
				mods.burnPenalty = 500;
				effects.push({ label: "Scrutiny: -5% pipeline", positive: false });
				mods.pipelinePenalty = Math.round((state.pipeline ?? 12) * 0.05);
			} else if (misses.length >= 2) {
				effects.push({
					label: "Concern: +€200 burn (reporting)",
					positive: false,
				});
				mods.burnPenalty = 200;
			}

			if (churnDelta?.status === "below") {
				effects.push({
					label: "Churn alert: +1% churn pressure",
					positive: false,
				});
				mods.churnPressure = 1;
			}

			if (mrrDelta?.status === "above" && Math.abs(mrrDelta.deltaPct) > 30) {
				effects.push({
					label: "Revenue beat: -€300 burn efficiency",
					positive: true,
				});
				mods.burnReduction = 300;
			}

			// Apply effects to state
			const newState = { ...state };
			if (mods.pipelineBonus)
				newState.pipeline = (newState.pipeline ?? 12) + mods.pipelineBonus;
			if (mods.conversionBonus)
				newState.conversionRate = Math.min(
					30,
					(newState.conversionRate ?? 15) + mods.conversionBonus,
				);
			if (mods.burnPenalty)
				newState.burnRate = (newState.burnRate ?? 8000) + mods.burnPenalty;
			if (mods.pipelinePenalty)
				newState.pipeline = Math.max(
					2,
					(newState.pipeline ?? 12) - mods.pipelinePenalty,
				);
			if (mods.churnPressure)
				newState.churn = Math.min(
					20,
					(newState.churn ?? 5) + mods.churnPressure,
				);
			if (mods.burnReduction)
				newState.burnRate = Math.max(
					5000,
					(newState.burnRate ?? 8000) - mods.burnReduction,
				);
			newState.boardEffects = effects.length > 0 ? effects : null;

			set((s) => ({
				state: newState,
				boardData: null,
				boardPopup: false,
				currentInsightCard: null,
				screen: "game",
				log: [
					...s.log,
					...effects.map((e) => ({
						text: e.label,
						color: e.positive ? "growth" : "danger",
						prefix: e.positive ? "▲" : "▼",
					})),
				],
			}));
		} else {
			set({
				boardData: null,
				boardPopup: false,
				currentInsightCard: null,
				screen: "game",
			});
		}

		get()._drawMonthEvents();
	},

	restart: () => {
		set({
			screen: "title",
			classId: null,
			classConfig: null,
			founderProfile: null,
			assumptions: {},
			forecast: [],
			state: null,
			history: [],
			decisions: [],
			log: [],
			ap: 3,
			maxAP: 3,
			monthEvents: [],
			monthEventIndex: 0,
			currentEvent: null,
			currentWorldEvent: null,
			usedEvents: [],
			usedWorlds: [],
			lastFeedback: null,
			result: null,
			boardData: null,
			boardPopup: false,
			currentHint: null,
			shownHints: {},
			shownInsightCards: [],
			currentInsightCard: null,
		});
		clearGameState();
	},

	/**
	 * Restore game from localStorage (after browser refresh).
	 */
	restoreGame: () => {
		const saved = loadGameState();
		if (!saved || !saved.classId || !saved.state) return false;

		const config = getClass(saved.classId);
		if (!config) return false;

		set({
			screen: saved.screen === "end" ? "end" : "game",
			classId: saved.classId,
			classConfig: config,
			founderProfile: saved.founderProfile ?? null,
			assumptions: saved.assumptions ?? {},
			forecast: saved.forecast ?? [],
			state: saved.state,
			history: saved.history ?? [],
			decisions: saved.decisions ?? [],
			log: saved.log ?? [],
			ap: saved.ap ?? 3,
			maxAP: saved.maxAP ?? 3,
			usedEvents: saved.usedEvents ?? [],
			usedWorlds: saved.usedWorlds ?? [],
			result: saved.result ?? null,
			shownInsightCards: saved.shownInsightCards ?? [],
			shownHints: saved.shownHints ?? {},
			// Reset transient state
			currentEvent: null,
			currentWorldEvent: null,
			monthEvents: [],
			monthEventIndex: 0,
			lastFeedback: null,
			boardData: null,
			boardPopup: false,
			currentInsightCard: null,
			currentHint: null,
		});

		// If game was in progress, draw events for current month
		if (saved.screen === "game" && saved.state && !saved.result) {
			setTimeout(() => get()._drawMonthEvents(), 200);
		}

		return true;
	},

	/**
	 * Check if there's a saved game to restore.
	 */
	hasSavedGame: () => {
		const saved = loadGameState();
		return !!(saved?.classId && saved?.state);
	},

	/**
	 * Get player ID (for telemetry UI).
	 */
	getPlayerId,
}));
