// ═══════════════════════════════════════════════════════════════
// GAME RULES — pure, framework-free game flow logic
//
// Shared by the Zustand store (browser) and the balance simulator
// (scripts/balance.mjs), so that playtests run exactly the rules the
// players see. Anything that changes game outcomes belongs here, not
// in the store.
// ═══════════════════════════════════════════════════════════════

import {
	advanceConsumerMonth,
	calculateConsumerPMF,
	generateConsumerForecast,
} from "./consumerEngine.js";
import {
	advanceDeepTechMonth,
	calculateDeepTechPMF,
	generateDeepTechForecast,
} from "./deeptechEngine.js";
import { generateSaaSForecast } from "./forecastEngine.js";
import { advanceMonth as advanceSaaSMonth, getAvailableEvents } from "./gameEngine.js";
import {
	advanceMarketplaceMonth,
	calculateMarketplacePMF,
	generateMarketplaceForecast,
} from "./marketplaceEngine.js";
import { calculateSaaSPMF } from "./pmfCalculator.js";
import {
	advanceServiceMonth,
	calculateServicePMF,
	generateServiceForecast,
} from "./serviceEngine.js";
import { CONSUMER_EVENTS } from "../events/consumerDecisions.js";
import { DECISION_EVENTS } from "../events/decisions.js";
import { DEEPTECH_EVENTS } from "../events/deeptechDecisions.js";
import { MARKETPLACE_EVENTS } from "../events/marketplaceDecisions.js";
import { SERVICE_EVENTS } from "../events/serviceDecisions.js";

// Chance per month (from month 3) that a random world event fires.
export const WORLD_EVENT_CHANCE = 0.4;
export const WORLD_EVENT_FROM_MONTH = 3;

const ENGINES = {
	saas: {
		advance: advanceSaaSMonth,
		forecast: generateSaaSForecast,
		pmf: calculateSaaSPMF,
	},
	consumer: {
		advance: advanceConsumerMonth,
		forecast: generateConsumerForecast,
		pmf: calculateConsumerPMF,
	},
	deeptech: {
		advance: advanceDeepTechMonth,
		forecast: generateDeepTechForecast,
		pmf: calculateDeepTechPMF,
	},
	marketplace: {
		advance: advanceMarketplaceMonth,
		forecast: generateMarketplaceForecast,
		pmf: calculateMarketplacePMF,
	},
	service: {
		advance: advanceServiceMonth,
		forecast: generateServiceForecast,
		pmf: calculateServicePMF,
	},
};

const engineFor = (classId) => ENGINES[classId] ?? ENGINES.saas;

export const getAdvanceMonth = (classId) => engineFor(classId).advance;
export const getGenerateForecast = (classId) => engineFor(classId).forecast;
export const getCalculatePMF = (classId) => engineFor(classId).pmf;

/**
 * Event pool per class: class-specific events plus the shared late-game
 * events (SaaS-only events excluded).
 */
export function getAllEvents(classId) {
	const shared = (minMonth) =>
		DECISION_EVENTS.filter(
			(e) => !e.saasOnly && e.months.some((m) => m > minMonth),
		);
	if (classId === "consumer") return [...CONSUMER_EVENTS, ...shared(8)];
	if (classId === "deeptech") return [...DEEPTECH_EVENTS, ...shared(12)];
	if (classId === "marketplace") return [...MARKETPLACE_EVENTS, ...shared(10)];
	if (classId === "service") return [...SERVICE_EVENTS, ...shared(8)];
	return DECISION_EVENTS;
}

/**
 * Draw 1-3 events for a month from the available pool.
 * Month 1-2 → 1-2 events, month 3 → 2 events, month 4+ → 2-3 events.
 */
export function drawMonthEvents(month, usedEventIds, classId, rng = Math.random) {
	const available = getAvailableEvents(getAllEvents(classId), month, usedEventIds);
	if (available.length === 0) return [];

	const maxDraw = month <= 3 ? 2 : 3;
	const minDraw = month <= 2 ? 1 : 2;
	const count = Math.min(
		available.length,
		minDraw + Math.floor(rng() * (maxDraw - minDraw + 1)),
	);

	const shuffled = [...available].sort(() => rng() - 0.5);
	return shuffled.slice(0, count);
}

/**
 * Pricing lever per class: the assumption key the player sets on the
 * setup screen that is a *decision* (their price), not a guess about
 * the market. It is applied to the starting state; everything else in
 * the assumptions only feeds the forecast.
 */
export const PRICE_LEVERS = {
	saas: { assumption: "price", stateKeys: ["price", "mrrPerCustomer"] },
	consumer: { assumption: "aov", stateKeys: ["aov", "price"] },
	deeptech: { assumption: "unitPrice", stateKeys: ["unitPrice", "price"] },
	marketplace: { assumption: "takeRate", stateKeys: ["takeRate"] },
	service: { assumption: "avgProject", stateKeys: ["avgProject", "price"] },
};

/**
 * Build the month-0 state from class config, setup assumptions and the
 * founder profile.
 */
export function buildInitialState(classId, classConfig, assumptions, founderProfile) {
	const em = founderProfile?.engineModifiers ?? {};
	const startingCashDelta = em.startingCashDelta ?? 0;
	const apMod = em.apModifier ?? 0;
	const basePipeline = assumptions.pipelineGrowth ?? classConfig.initial.pipeline ?? 12;

	const initial = {
		...classConfig.initial,
		price: assumptions.price ?? classConfig.initial.price,
		churn: assumptions.churnRate ?? classConfig.initial.churn ?? 5,
		cac: assumptions.targetCAC ?? classConfig.initial.cac ?? 80,
		conversionRate: assumptions.conversionRate ?? classConfig.initial.conversionRate ?? 15,
		supportCost: assumptions.supportCost ?? classConfig.initial.supportCost ?? 5,
		pipeline: basePipeline + (em.pipelineBonus ?? 0),
		pipelineGrowth: basePipeline,
		mrrPerCustomer: assumptions.price ?? classConfig.initial.price ?? 49,
		cash: (classConfig.initial.cash ?? 100000) + startingCashDelta,
		maxAP: Math.max(2, 3 + apMod),
		founderMods: em,
	};

	const lever = PRICE_LEVERS[classId];
	const leverValue = lever ? assumptions[lever.assumption] : undefined;
	if (typeof leverValue === "number") {
		for (const key of lever.stateKeys) initial[key] = leverValue;
	}
	return initial;
}

/**
 * Pressure applied in the store after the engine advanced a month:
 * churn creeps up while the product is weak.
 */
export function applyMonthlyPressure(monthly) {
	if (monthly.month > 3 && (monthly.product ?? 30) < 40) {
		return { ...monthly, churn: Math.min(20, (monthly.churn ?? 5) + 0.5) };
	}
	return monthly;
}

/**
 * Effective AP for a month (burnout can lower maxAP, part-time founders
 * lose one AP in the first months).
 */
export function effectiveAP(monthly, fallbackMaxAP = 3) {
	let ap = monthly.maxAP ?? fallbackMaxAP;
	const fm = monthly.founderMods || {};
	if (fm.partTime && monthly.month <= (fm.partTimeMonths ?? 6)) {
		ap = Math.max(1, ap - 1);
	}
	return ap;
}

/**
 * Board-meeting consequences for the next quarter, derived from
 * forecast-vs-actual deltas. Returns the new state and the effect labels.
 */
export function applyBoardOutcome(boardData, state, classConfig) {
	const effects = [];
	const misses = boardData.deltas.filter((d) => d.status === "below");
	const wins = boardData.deltas.filter((d) => d.status === "above");
	const mrrDelta = boardData.deltas.find((d) => d.key === "totalMRR");
	const churnDelta = boardData.deltas.find((d) => d.key === "churn");
	const initialBurn = classConfig?.initial?.burnRate ?? 4500;
	const next = { ...state };

	if (wins.length >= 3) {
		effects.push({ label: "Momentum: +10% pipeline", positive: true });
		next.pipeline = (next.pipeline ?? 12) + Math.round((state.pipeline ?? 12) * 0.1);
	} else if (wins.length >= 2 && misses.length === 0) {
		effects.push({ label: "Confidence: +5% conversion", positive: true });
		next.conversionRate = Math.min(30, (next.conversionRate ?? 15) + 0.5);
	}

	if (misses.length >= 3) {
		effects.push({ label: "Pressure: +€500 burn (oversight)", positive: false });
		next.burnRate = (next.burnRate ?? initialBurn) + 500;
		effects.push({ label: "Scrutiny: -5% pipeline", positive: false });
		next.pipeline = Math.max(2, (next.pipeline ?? 12) - Math.round((state.pipeline ?? 12) * 0.05));
	} else if (misses.length >= 2) {
		effects.push({ label: "Concern: +€200 burn (reporting)", positive: false });
		next.burnRate = (next.burnRate ?? initialBurn) + 200;
	}

	if (churnDelta?.status === "below") {
		effects.push({ label: "Churn alert: +1% churn pressure", positive: false });
		next.churn = Math.min(20, (next.churn ?? 5) + 1);
	}

	if (mrrDelta?.status === "above" && Math.abs(mrrDelta.deltaPct) > 30) {
		effects.push({ label: "Revenue beat: -€300 burn efficiency", positive: true });
		// Floor relative to the class's own starting burn (was a flat €5,000,
		// which *raised* burn for classes that start below that).
		next.burnRate = Math.max(
			Math.round(initialBurn * 0.5),
			(next.burnRate ?? initialBurn) - 300,
		);
	}

	next.boardEffects = effects.length > 0 ? effects : null;
	return { state: next, effects };
}
