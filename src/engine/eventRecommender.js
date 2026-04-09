// ═══════════════════════════════════════════════════════════════
// EVENT RECOMMENDER — Suggests best-fit world event per player
// Pure function: recommendEvent(player) → { event, reason } | null
// ═══════════════════════════════════════════════════════════════

import { WORLD_EVENTS } from "../events/worldEvents.js";

const MIN_SCORE = 30;

/**
 * Scoring rules — one per event ID.
 * Each rule receives a player telemetry object and returns { score, reason }
 * or null if the rule doesn't apply.
 */
const SCORING_RULES = {
	cash_crunch_rumor: (p) => {
		const lowCash = (p.cash ?? 0) < 15000;
		const lowRunway = (p.runway ?? 99) < 3;
		if (lowCash && lowRunway)
			return { score: 90, reason: "Cash < €15K and runway < 3 months" };
		if (lowCash) return { score: 70, reason: "Cash below €15K" };
		if (lowRunway) return { score: 70, reason: "Runway under 3 months" };
		return null;
	},

	pivot_pressure: (p) => {
		if ((p.pmf ?? 100) < 40 && (p.month ?? 0) > 10)
			return { score: 80, reason: `PMF at ${p.pmf ?? 0} after M${p.month}` };
		return null;
	},

	investor_interest: (p) => {
		if ((p.month ?? 0) >= 6 && (p.cash ?? 0) < 20000)
			return { score: 60, reason: "Struggling mid-game, could use a boost" };
		return null;
	},

	cofounder_conflict: (p) => {
		const m = p.month ?? 0;
		if (m >= 8 && m <= 12 && (p.pmf ?? 0) > 50 && (p.churn ?? 99) < 8)
			return { score: 65, reason: "Comfortable mid-game — time to shake things up" };
		return null;
	},

	tech_stack_shift: (p) => {
		if ((p.burnRate ?? 0) > 7000 && (p.month ?? 0) >= 8)
			return { score: 55, reason: `High burn (€${p.burnRate?.toLocaleString()}) at M${p.month}` };
		return null;
	},

	key_employee_quits: (p) => {
		let score = 0;
		let reason = "";
		if ((p.burnRate ?? 0) > 6000 && (p.month ?? 0) >= 6) {
			score = 60;
			reason = "High burn, team stretched";
		}
		if (p.classId === "service" && (p.utilization ?? 0) > 100) {
			score += 20;
			reason = reason
				? `${reason} + utilization at ${p.utilization}%`
				: `Service utilization at ${p.utilization}%`;
		}
		return score >= MIN_SCORE ? { score, reason } : null;
	},

	labor_shortage: (p) => {
		if ((p.churn ?? 0) > 12)
			return { score: 65, reason: `High churn at ${p.churn?.toFixed?.(1) ?? p.churn}%` };
		return null;
	},

	government_subsidy: (p) => {
		if ((p.pipeline ?? 99) < 10 && (p.month ?? 0) >= 4)
			return { score: 60, reason: "Weak pipeline — subsidy would help" };
		return null;
	},

	food_trend_wave: (p) => {
		const m = p.month ?? 0;
		if ((p.pipeline ?? 99) < 8 && m >= 4 && m <= 12)
			return { score: 55, reason: "Pipeline needs a boost" };
		return null;
	},

	customer_goes_viral: (p) => {
		if ((p.product ?? 0) > 60)
			return { score: 55, reason: `Strong product (${p.product}) deserves reward` };
		return null;
	},

	viral_moment: (p) => {
		if ((p.product ?? 0) > 55 && (p.month ?? 0) >= 6)
			return { score: 50, reason: "Good product mid-game — reward virality" };
		return null;
	},

	market_downturn: (p) => {
		if ((p.pipeline ?? 0) > 20 && (p.month ?? 0) >= 4)
			return { score: 55, reason: `High pipeline (${p.pipeline}) — market correction` };
		return null;
	},

	competitor_raised: (p) => {
		const m = p.month ?? 0;
		if ((p.pipeline ?? 0) > 15 && m >= 6 && m <= 18)
			return { score: 50, reason: "Comfortable pipeline — add competitive pressure" };
		return null;
	},

	eu_regulation: (p) => {
		if ((p.month ?? 0) >= 8 && (p.burnRate ?? 0) > 5000)
			return { score: 45, reason: "Mid-game cost pressure from regulation" };
		return null;
	},

	ai_hype: (p) => {
		const m = p.month ?? 0;
		if (m >= 3 && m <= 8 && (p.pmf ?? 100) < 30)
			return { score: 50, reason: "Early game, low PMF — AI hype lifts all boats" };
		return null;
	},

	currency_inflation: (p) => {
		if ((p.churn ?? 0) > 10 && (p.month ?? 0) >= 6)
			return { score: 45, reason: `Churn already at ${p.churn?.toFixed?.(1) ?? p.churn}% — inflation adds pressure` };
		return null;
	},
};

/**
 * Recommend the best-fit world event for a player based on telemetry.
 * @param {Object} player - Player telemetry object from admin dashboard
 * @returns {{ event: Object, reason: string } | null}
 */
export function recommendEvent(player) {
	if (!player) return null;

	let bestScore = 0;
	let bestEventId = null;
	let bestReason = "";

	for (const event of WORLD_EVENTS) {
		const rule = SCORING_RULES[event.id];
		if (!rule) continue;

		const result = rule(player);
		if (result && result.score > bestScore) {
			bestScore = result.score;
			bestEventId = event.id;
			bestReason = result.reason;
		}
	}

	if (bestScore < MIN_SCORE) return null;

	const event = WORLD_EVENTS.find((e) => e.id === bestEventId);
	return event ? { event, reason: bestReason } : null;
}
