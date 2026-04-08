// ═══════════════════════════════════════════════════════════════
// INSIGHT CARDS — Quarterly teaching moments
// After each board meeting, the game checks the last 3 months
// and surfaces a card that names what just happened.
// These concepts map to the Revenue Model Canvas workshop.
// ═══════════════════════════════════════════════════════════════

/**
 * Each card:
 *   id       — unique key (also dedup: shown at most once per run)
 *   title    — the concept name (matches Revenue Model Canvas)
 *   what     — one sentence: what is this concept?
 *   experienced — one sentence: what the player just lived through
 *   why      — one sentence: why it matters in real startups
 *   trigger  — function(state, history, quarter, classId) → bool
 *   classes  — which class IDs can trigger this (null = all)
 */

const INSIGHT_CARDS = [
	// ── 1. Churn Spiral ──────────────────────────────────────────
	{
		id: "churn-spiral",
		title: "Churn Spiral",
		what: "When monthly churn exceeds new customer growth, the customer base shrinks every month — and shrinks faster over time.",
		experienced: (s) =>
			`Your churn rose from ${s._qStart.churn?.toFixed(1) ?? "?"}% to ${s.churn?.toFixed(1) ?? "?"}% this quarter while your customer base ${s.customers < (s._qStart.customers ?? 0) ? "shrank" : "barely grew"}.`,
		why: "Most startups die from churn, not from lack of sales. A 2% monthly churn difference compounds to 27% annual difference in retained revenue.",
		trigger: (state, history, quarter) => {
			const qMonths = getQuarterMonths(history, quarter);
			if (qMonths.length < 2) return false;
			const churnStart = qMonths[0].churn ?? 0;
			const churnEnd = qMonths[qMonths.length - 1].churn ?? 0;
			// Churn increased by ≥1.5pp AND is above 6%
			return churnEnd - churnStart >= 1.5 && churnEnd >= 6;
		},
		classes: ["saas", "consumer", "service"],
	},

	// ── 2. Pricing Cliff ─────────────────────────────────────────
	{
		id: "pricing-cliff",
		title: "Pricing Cliff",
		what: "Every market has a price threshold above which conversion drops sharply. This isn't linear — it's a cliff.",
		experienced: (s) =>
			`Your price is €${s.price ?? "?"}/mo and conversion dropped to ${(s.conversionRate ?? 0).toFixed(1)}%. The market is telling you where the cliff is.`,
		why: "Founders set prices based on value delivered. Customers pay based on alternatives available. The gap between these two is where pricing cliffs live.",
		trigger: (state, history, quarter) => {
			const qMonths = getQuarterMonths(history, quarter);
			if (qMonths.length < 2) return false;
			const convStart = qMonths[0].conversionRate ?? 15;
			const convEnd = qMonths[qMonths.length - 1].conversionRate ?? 15;
			const price = state.price ?? 49;
			// Conversion dropped ≥4pp AND price is above moderate
			return convStart - convEnd >= 4 && price > 60;
		},
		classes: ["saas", "consumer"],
	},

	// ── 3. Unit Economics Underwater ──────────────────────────────
	{
		id: "unit-economics-underwater",
		title: "Unit Economics Underwater",
		what: "When you spend more to acquire a customer than they'll ever pay you back, every sale makes you poorer.",
		experienced: (s) =>
			`Your LTV:CAC ratio is ${(s.ltvCacRatio ?? 0).toFixed(1)}x. Every new customer costs you money. Growth is accelerating your death.`,
		why: "Negative unit economics can hide behind top-line growth for months. By the time the cash runs out, the habit of unprofitable growth is hard to break.",
		trigger: (state) => {
			return (state.ltvCacRatio ?? 999) < 1.5 && (state.customers ?? 0) > 3;
		},
		classes: ["saas", "consumer", "marketplace"],
	},

	// ── 4. Death Zone ────────────────────────────────────────────
	{
		id: "death-zone",
		title: "Death Zone",
		what: "The death zone starts at ~6 months runway, not at zero. Below 6 months, you can't fundraise, hire, or negotiate from strength.",
		experienced: (s) => {
			const runway = s.runway ?? 0;
			return `You have ${runway} months of runway. You're not dead yet — but you've lost the ability to make long-term decisions. Every move is now about survival.`;
		},
		why: "Fundraising takes 3-6 months. If you start at 6 months runway, you're negotiating with a gun to your head. The death zone is a negotiating problem, not a cash problem.",
		trigger: (state, history, quarter) => {
			const qMonths = getQuarterMonths(history, quarter);
			if (qMonths.length < 2) return false;
			const cashStart = qMonths[0].cash ?? 100000;
			const cashEnd = qMonths[qMonths.length - 1].cash ?? 100000;
			const cashDrop = ((cashStart - cashEnd) / cashStart) * 100;
			const runway = state.runway ?? 99;
			// Cash dropped ≥25% this quarter AND runway < 8 months
			return cashDrop >= 25 && runway < 8;
		},
		classes: null, // all classes
	},

	// ── 5. Burn Spiral ───────────────────────────────────────────
	{
		id: "burn-spiral",
		title: "Burn Spiral",
		what: "When costs grow faster than revenue, each month shortens your runway more than the last. The spiral accelerates.",
		experienced: (s) => {
			const burn = s.burnRate ?? s.totalBurn ?? 0;
			const mrr = s.totalMRR ?? s.revenue ?? 0;
			return `Your burn is €${burn.toLocaleString("en-US")}/mo against €${mrr.toLocaleString("en-US")}/mo revenue. The gap is widening.`;
		},
		why: "Founders hire for the revenue they expect, not the revenue they have. Every hire is a bet that growth will catch up to costs. Most of the time, it doesn't.",
		trigger: (state, history, quarter) => {
			const qMonths = getQuarterMonths(history, quarter);
			if (qMonths.length < 2) return false;
			const burnStart = qMonths[0].burnRate ?? qMonths[0].totalBurn ?? 4500;
			const burnEnd =
				qMonths[qMonths.length - 1].burnRate ??
				qMonths[qMonths.length - 1].totalBurn ??
				4500;
			const mrrEnd = state.totalMRR ?? state.revenue ?? 0;
			// Burn increased ≥20% this quarter AND burn > revenue
			return burnEnd > burnStart * 1.2 && burnEnd > mrrEnd;
		},
		classes: ["saas", "consumer", "service"],
	},

	// ── 6. Vanity vs Value Metrics ───────────────────────────────
	{
		id: "vanity-metrics",
		title: "Vanity vs Value Metrics",
		what: "Pipeline and signups feel like progress but aren't revenue. The only metric that validates your model is money that stays.",
		experienced: (s) => {
			const pipeline = s.pipeline ?? 0;
			const conv = s.conversionRate ?? 0;
			return `Your pipeline is ${pipeline} but conversion is only ${conv.toFixed(1)}%. You have attention, not commitment.`;
		},
		why: "Vanity metrics (signups, downloads, followers) let you tell a growth story without having a business. Investors know the difference. Your bank account knows the difference.",
		trigger: (state) => {
			const pipeline = state.pipeline ?? 0;
			const conv = state.conversionRate ?? 15;
			const customers = state.customers ?? 0;
			// High pipeline but low conversion — lots of leads, no sales
			return pipeline > 25 && conv < 8 && customers < 20;
		},
		classes: ["saas", "consumer"],
	},

	// ── 7. Cold Start Trap (Marketplace) ─────────────────────────
	{
		id: "cold-start-trap",
		title: "Cold Start Trap",
		what: "A marketplace with no supply has no value for demand. A marketplace with no demand has no value for supply. Both sides wait for the other.",
		experienced: (s) => {
			const supply = s.supplyUsers ?? 0;
			const demand = s.demandUsers ?? 0;
			const liquidity = s.liquidity ?? 0;
			return `Supply: ${supply}, Demand: ${demand}, Liquidity: ${liquidity}%. Neither side has enough reason to stay.`;
		},
		why: 'Every marketplace faces the chicken-and-egg problem. The solution is never "build it and they will come." It\'s always: subsidize one side, constrain geography, or fake supply.',
		trigger: (state) => {
			const liquidity = state.liquidity ?? 0;
			const month = state.month ?? 0;
			// Low liquidity after several months
			return liquidity < 15 && month >= 4;
		},
		classes: ["marketplace"],
	},

	// ── 8. Liquidity Death Spiral (Marketplace) ──────────────────
	{
		id: "liquidity-death-spiral",
		title: "Liquidity Death Spiral",
		what: "When match rate drops, supply churns. When supply churns, match rate drops further. The spiral feeds itself.",
		experienced: (s) => {
			const supplyChurn = s.supplyChurn ?? 0;
			const demandChurn = s.demandChurn ?? 0;
			const liquidity = s.liquidity ?? 0;
			return `Supply churn: ${supplyChurn.toFixed(1)}%, Demand churn: ${demandChurn.toFixed(1)}%, Liquidity: ${liquidity}%. Both sides are leaving because the other side left.`;
		},
		why: "Marketplace death spirals are the two-sided version of churn spirals. They're harder to stop because you're losing trust on both sides simultaneously.",
		trigger: (state, history, quarter) => {
			const qMonths = getQuarterMonths(history, quarter);
			if (qMonths.length < 2) return false;
			const liqStart = qMonths[0].liquidity ?? 0;
			const liqEnd = qMonths[qMonths.length - 1].liquidity ?? 0;
			const supplyChurn = state.supplyChurn ?? 0;
			// Liquidity dropped AND supply churn is high
			return liqStart - liqEnd >= 5 && supplyChurn > 15;
		},
		classes: ["marketplace"],
	},

	// ── 9. Pilot Trap (Deep-Tech) ────────────────────────────────
	{
		id: "pilot-trap",
		title: "Pilot Trap",
		what: 'Enterprise pilots that never convert to contracts. The customer gets free R&D, you get "learnings" and no revenue.',
		experienced: (s) => {
			const lois = s.lois ?? 0;
			const customers = s.customers ?? 0;
			return `${lois} LOIs, ${customers} paying customers. Your pipeline is full of interest and empty of commitment.`;
		},
		why: 'Deep-tech founders confuse "we\'re in talks" with "we have a customer." An LOI is a maybe. A purchase order is a yes. Everything else is politeness.',
		trigger: (state) => {
			const lois = state.lois ?? 0;
			const customers = state.customers ?? 0;
			const month = state.month ?? 0;
			// Many LOIs but few actual customers after several months
			return lois >= 3 && customers <= 1 && month >= 6;
		},
		classes: ["deeptech"],
	},

	// ── 10. Grant Dependency ─────────────────────────────────────
	{
		id: "grant-dependency",
		title: "Grant Dependency",
		what: "When grants fund >80% of your burn, you're not building a business — you're executing a research project with a business plan attached.",
		experienced: (s) => {
			const grantRemaining = s.grantRemaining ?? 0;
			const revenue = s.totalMRR ?? s.revenue ?? 0;
			const burn = s.burnRate ?? s.totalBurn ?? 0;
			return `Grant: €${grantRemaining.toLocaleString("en-US")} remaining. Revenue: €${revenue.toLocaleString("en-US")}/mo. Burn: €${burn.toLocaleString("en-US")}/mo. What happens when the grant runs out?`;
		},
		why: "FFG grants are runway, not validation. The moment the grant ends, your unit economics have to work. Most deep-tech teams find out too late that the transition from grant-funded to revenue-funded is the hardest phase.",
		trigger: (state) => {
			const grantRemaining = state.grantRemaining ?? 0;
			const revenue = state.totalMRR ?? state.revenue ?? 0;
			const burn = state.burnRate ?? state.totalBurn ?? 0;
			const month = state.month ?? 0;
			// Still heavily grant-dependent after 6+ months
			return month >= 6 && grantRemaining > 0 && revenue < burn * 0.2;
		},
		classes: ["deeptech"],
	},

	// ── 11. CAC Payback Inversion ────────────────────────────────
	{
		id: "cac-payback-inversion",
		title: "CAC Payback Inversion",
		what: "When it takes longer to earn back acquisition cost than the average customer stays, you're paying for customers who leave before they're profitable.",
		experienced: (s) => {
			const cac = s.cac ?? 0;
			const mrr = s.mrrPerCustomer ?? s.price ?? 49;
			const churn = s.churn ?? 5;
			const paybackMonths = mrr > 0 ? Math.round(cac / mrr) : 99;
			const avgLifetime = churn > 0 ? Math.round(100 / churn) : 99;
			return `CAC payback: ${paybackMonths} months. Average customer lifetime: ${avgLifetime} months. ${paybackMonths > avgLifetime ? "Customers leave before they pay off." : "Tight, but viable."}`;
		},
		why: "CAC payback period is the bridge between unit economics and cash flow. Even with positive LTV:CAC, if payback takes 12 months and you have 6 months runway, the math kills you before the model works.",
		trigger: (state) => {
			const cac = state.cac ?? 0;
			const mrr = state.mrrPerCustomer ?? state.price ?? 49;
			const churn = state.churn ?? 5;
			if (cac <= 0 || mrr <= 0 || churn <= 0) return false;
			const paybackMonths = cac / mrr;
			const avgLifetime = 100 / churn; // 1/churn in months (churn is %)
			return paybackMonths > avgLifetime * 0.8;
		},
		classes: ["saas", "consumer"],
	},

	// ── 12. Utilization Burnout Trap (Service) ───────────────────
	{
		id: "utilization-burnout",
		title: "Utilization Burnout Trap",
		what: "At 100% utilization, there's no capacity for sales, product improvement, or recovery from mistakes. The team breaks before the business does.",
		experienced: (s) => {
			const util = s.utilization ?? 0;
			const morale = s.teamMorale ?? 1;
			return `Utilization: ${util}%. Team morale: ${Math.round(morale * 100)}%. You're shipping everything and building nothing. The team is running on fumes.`;
		},
		why: "Service businesses that optimize for utilization optimize for today's revenue at the expense of tomorrow's capacity. The burnout isn't just human — it's structural.",
		trigger: (state, history, quarter) => {
			const qMonths = getQuarterMonths(history, quarter);
			// Utilization > 90% for 2+ months this quarter
			const highUtil = qMonths.filter((m) => (m.utilization ?? 0) > 90);
			return highUtil.length >= 2;
		},
		classes: ["service"],
	},

	// ── 13. Margin Compression (Service) ─────────────────────────
	{
		id: "margin-compression",
		title: "Margin Compression",
		what: "When project revenue grows but margins shrink, you're selling more work for less profit. Scale amplifies the problem.",
		experienced: (s) => {
			const margin = s.grossMargin ?? 0;
			const revenue = s.totalMRR ?? s.revenue ?? 0;
			return `Revenue: €${revenue.toLocaleString("en-US")}/mo. Gross margin: ${margin}%. You're working harder and keeping less.`;
		},
		why: "Service businesses that grow by adding people hit margin compression because each hire adds overhead (management, coordination, training) that doesn't bill. The escape is productization.",
		trigger: (state, history, quarter) => {
			const qMonths = getQuarterMonths(history, quarter);
			if (qMonths.length < 2) return false;
			const marginStart = qMonths[0].grossMargin ?? 50;
			const marginEnd = qMonths[qMonths.length - 1].grossMargin ?? 50;
			const revenue = state.totalMRR ?? state.revenue ?? 0;
			// Margin dropped ≥5pp while revenue grew
			return marginStart - marginEnd >= 5 && revenue > 5000;
		},
		classes: ["service"],
	},

	// ── 14. Viral Coefficient Illusion (Consumer) ────────────────
	{
		id: "viral-illusion",
		title: "Viral Coefficient Illusion",
		what: "Viral coefficient measures sharing, not buying. High virality with low repeat rate means lots of one-time users who tell their friends to also try once.",
		experienced: (s) => {
			const viral = (s.viralCoeff ?? 0) / 100;
			const repeat = s.repeatRate ?? 0;
			return `Viral coefficient: ${viral.toFixed(2)}. Repeat rate: ${repeat.toFixed(1)}%. People share your product but don't come back. Your growth is wide and shallow.`;
		},
		why: "D2C brands confuse awareness with retention. Viral growth only works when the product creates a habit. Without repeat, viral is just an expensive way to generate one-time revenue.",
		trigger: (state) => {
			const viral = (state.viralCoeff ?? 0) / 100;
			const repeat = state.repeatRate ?? 0;
			return viral > 0.15 && repeat < 12;
		},
		classes: ["consumer"],
	},

	// ── 15. Planning Fallacy (universal, early-game catch-all) ───
	{
		id: "planning-fallacy",
		title: "Planning Fallacy",
		what: "Founders systematically overestimate growth and underestimate costs. This is not a character flaw — it is a documented cognitive bias that affects every plan.",
		experienced: (s) => {
			const planned = s._qStart?.totalMRR ?? 0;
			const actual = s.totalMRR ?? s.revenue ?? 0;
			const cashPlanned = s._qStart?.cash ?? 100000;
			const cashActual = s.cash ?? 0;
			if (actual < planned) {
				return `Your revenue is below what your initial assumptions predicted. Your cash dropped from €${cashPlanned.toLocaleString("en-US")} to €${cashActual.toLocaleString("en-US")} this quarter. The gap between plan and reality is already open.`;
			}
			return `Your cash went from €${cashPlanned.toLocaleString("en-US")} to €${cashActual.toLocaleString("en-US")} this quarter. Even when revenue tracks, costs surprise.`;
		},
		why: "Kahneman and Tversky showed that people anchor to best-case scenarios. In startups, the planning fallacy kills more companies than bad products — because the plan is the basis for every hire, every spend, every fundraise.",
		trigger: (state, history, quarter) => {
			// Triggers at Q1+ when cash has dropped at all — very easy to trigger
			const qMonths = getQuarterMonths(history, quarter);
			if (qMonths.length < 2) return false;
			const cashStart = qMonths[0].cash ?? 100000;
			const cashEnd = qMonths[qMonths.length - 1].cash ?? 100000;
			return cashEnd < cashStart * 0.9; // Cash dropped by >10%
		},
		classes: null, // all classes
	},
];

// ─── Helper ────────────────────────────────────────────────────

function getQuarterMonths(history, quarter) {
	const startMonth = (quarter - 1) * 3 + 1;
	const endMonth = quarter * 3;
	return history.filter((h) => h.month >= startMonth && h.month <= endMonth);
}

/**
 * Check all cards against current state and return the most relevant one.
 * Returns null if no card triggers.
 * @param {Object} state - current game state
 * @param {Array} history - full game history
 * @param {number} quarter - current quarter number
 * @param {string} classId - player's class
 * @param {Array} shownCardIds - IDs of cards already shown this run
 */
export function getInsightCard(
	state,
	history,
	quarter,
	classId,
	shownCardIds = [],
) {
	// Attach quarter-start state for dynamic text
	const qMonths = getQuarterMonths(history, quarter);
	const stateWithQStart = { ...state, _qStart: qMonths[0] ?? state };

	const candidates = INSIGHT_CARDS.filter((card) => {
		// Already shown?
		if (shownCardIds.includes(card.id)) return false;
		// Class filter
		if (card.classes && !card.classes.includes(classId)) return false;
		// Trigger check
		try {
			return card.trigger(state, history, quarter, classId);
		} catch {
			return false;
		}
	});

	if (candidates.length === 0) return null;

	// Pick the first matching card (priority = array order)
	const card = candidates[0];
	return {
		id: card.id,
		title: card.title,
		what: card.what,
		experienced:
			typeof card.experienced === "function"
				? card.experienced(stateWithQStart)
				: card.experienced,
		why: card.why,
	};
}
