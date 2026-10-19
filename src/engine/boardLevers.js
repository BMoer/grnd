// ═══════════════════════════════════════════════════════════════
// BOARD LEVERS — class-specific strategic adjustments
//
// Shown in the quarterly board meeting ("Strategic Adjustments").
// Each lever reads its current value from state and writes back a
// partial state via toState(). Pure: used by the UI and the balance
// simulator alike.
//
// Design rule: every lever is a real trade-off. Raising price lowers
// conversion/retention in the engine, hiring raises burn, cutting
// budget hits morale. No lever is free money.
// ═══════════════════════════════════════════════════════════════

const burnLever = (fallback, max) => ({
	key: "burnRate",
	label: "Team budget (burn)",
	unit: "€",
	step: 500,
	min: (s, cfg) => Math.round((cfg?.initial?.burnRate ?? fallback) * 0.5),
	max: () => max,
	read: (s) => s.burnRate ?? fallback,
	toState: (v) => ({ burnRate: v }),
	note: (s, v) =>
		v < (s.burnRate ?? fallback)
			? "Cuts → morale hit, slower delivery"
			: v > (s.burnRate ?? fallback) * 1.3
				? "Fast growth → onboarding overhead"
				: "",
});

const HOURS_PER_HIRE = 160;
const COST_PER_HIRE = 4500;

export const BOARD_LEVERS = {
	saas: [
		{
			key: "price",
			label: "Price/mo",
			unit: "€",
			step: 5,
			min: () => 19,
			max: () => 299,
			read: (s) => s.price ?? 49,
			toState: (v) => ({ price: v, mrrPerCustomer: v }),
			note: (s, v) => (v > 100 ? "Above €100 restaurants hesitate hard" : ""),
		},
		burnLever(4500, 15000),
		{
			key: "pipelineGrowth",
			label: "Sales/marketing intensity",
			unit: "",
			step: 1,
			min: () => 5,
			max: () => 50,
			read: (s) => Math.round(s.pipelineGrowth ?? 12),
			toState: (v) => ({ pipelineGrowth: v }),
		},
		{
			key: "supportCost",
			label: "Support investment/customer",
			unit: "€",
			step: 1,
			min: () => 2,
			max: () => 30,
			read: (s) => s.supportCost ?? 5,
			toState: (v) => ({ supportCost: v }),
		},
	],

	consumer: [
		{
			key: "aov",
			label: "Price per order (AOV)",
			unit: "€",
			step: 1,
			min: () => 15,
			max: () => 90,
			read: (s) => s.aov ?? 35,
			toState: (v) => ({ aov: v, price: v }),
			note: (s, v) =>
				v > 50 ? "Premium price → fewer buyers per ad euro, fewer reorders" : "",
		},
		{
			key: "adSpend",
			label: "Ad spend / month",
			unit: "€",
			step: 500,
			min: () => 0,
			max: () => 20000,
			read: (s) => s.adSpend ?? 5000,
			toState: (v) => ({ adSpend: v }),
			note: (s, v) =>
				v > 8000 ? "Scaling ads → CAC rises (you buy worse audiences)" : "",
		},
		{
			key: "retentionSpend",
			label: "Retention budget / month",
			unit: "€",
			step: 500,
			min: () => 0,
			max: () => 6000,
			read: (s) => s.retentionSpend ?? 0,
			toState: (v) => ({ retentionSpend: v }),
			note: (s, v) =>
				v > 0 ? "CRM, onboarding, product work → more reorders, slowly" : "",
		},
		burnLever(3500, 12000),
	],

	deeptech: [
		{
			key: "rdBurn",
			label: "R&D budget / month",
			unit: "€",
			step: 1000,
			min: () => 8000,
			max: () => 25000,
			read: (s) => s.rdBurn ?? 15000,
			toState: (v) => ({ rdBurn: v }),
			note: (s, v) =>
				v > (s.rdBurn ?? 15000)
					? "Faster TRL + certification, shorter runway"
					: v < (s.rdBurn ?? 15000)
						? "Longer runway, slower science"
						: "",
		},
		{
			key: "customerFocus",
			label: "Founder time with customers",
			unit: "%",
			step: 10,
			min: () => 0,
			max: () => 60,
			read: (s) => s.customerFocus ?? 10,
			toState: (v) => ({ customerFocus: v }),
			note: (s, v) =>
				v >= 30
					? "More pilots and LOIs, less lab time"
					: v === 0
						? "Pure lab mode — nobody is talking to buyers"
						: "",
		},
		{
			key: "unitPrice",
			label: "Price per sensor unit",
			unit: "€",
			step: 250,
			min: () => 1000,
			max: () => 8000,
			read: (s) => s.unitPrice ?? 2000,
			toState: (v) => ({ unitPrice: v, price: v }),
			note: (s, v) => (v > 4000 ? "Industrial buyers need a clear ROI story" : ""),
		},
	],

	marketplace: [
		{
			key: "takeRate",
			label: "Take rate",
			unit: "%",
			step: 1,
			min: () => 3,
			max: () => 25,
			read: (s) => s.takeRate ?? 10,
			toState: (v) => ({ takeRate: v }),
			note: (s, v) => (v > 15 ? "Supply side starts to leave or go around you" : ""),
		},
		{
			key: "adSpend",
			label: "Marketing budget / month",
			unit: "€",
			step: 250,
			min: () => 0,
			max: () => 8000,
			read: (s) => s.adSpend ?? 1500,
			toState: (v) => ({ adSpend: v }),
		},
		{
			key: "supplySplit",
			label: "Budget share to supply side",
			unit: "%",
			step: 10,
			min: () => 10,
			max: () => 90,
			read: (s) => Math.round((s.supplySplit ?? 0.5) * 100),
			toState: (v) => ({ supplySplit: v / 100 }),
			note: (s, v) => (v >= 70 ? "Anchor supply first" : v <= 30 ? "Buy demand first" : ""),
		},
	],

	service: [
		{
			key: "avgProject",
			label: "Price per client / month",
			unit: "€",
			step: 500,
			min: () => 1500,
			max: () => 15000,
			read: (s) => s.avgProject ?? 5000,
			toState: (v) => ({ avgProject: v, price: v }),
			note: (s, v) => (v > 7000 ? "Premium pricing → lower close rate" : ""),
		},
		{
			key: "teamCapacity",
			label: "Delivery team (hours/month)",
			unit: "h",
			step: HOURS_PER_HIRE,
			min: () => 320,
			max: () => 1600,
			read: (s) => s.teamCapacity ?? 320,
			// Each extra 160h is a hire; the hire's cost goes into burn.
			toState: (v, s) => {
				const hiresDelta = (v - (s.teamCapacity ?? 320)) / HOURS_PER_HIRE;
				return {
					teamCapacity: v,
					burnRate: Math.max(0, (s.burnRate ?? 6000) + hiresDelta * COST_PER_HIRE),
				};
			},
			note: (s, v) => {
				const diff = (v - (s.teamCapacity ?? 320)) / HOURS_PER_HIRE;
				if (diff > 0) return `+${diff} hire(s): +€${diff * COST_PER_HIRE}/mo burn`;
				if (diff < 0) return `${diff} person(s): −€${-diff * COST_PER_HIRE}/mo burn, morale hit`;
				return "";
			},
		},
		{
			key: "productTime",
			label: "Time on productization",
			unit: "%",
			step: 10,
			min: () => 0,
			max: () => 50,
			read: (s) => s.productTime ?? 0,
			toState: (v) => ({ productTime: v }),
			note: (s, v) =>
				v > 0 ? "Builds the reusable product; blocks billable hours" : "",
		},
	],
};

export function getBoardLevers(classId) {
	return BOARD_LEVERS[classId] ?? BOARD_LEVERS.saas;
}

/** Apply a map of { leverKey: value } to state, in lever order. */
export function applyLeverValues(classId, state, values) {
	let next = { ...state };
	for (const lever of getBoardLevers(classId)) {
		if (values[lever.key] === undefined) continue;
		if (values[lever.key] === lever.read(state)) continue;
		next = { ...next, ...lever.toState(values[lever.key], next) };
	}
	return next;
}
