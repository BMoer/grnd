import { useState, useCallback, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// FOUNDER'S DILEMMA v3
// Class-based startup roguelike with variance, world events, and Excel export
// ═══════════════════════════════════════════════════════════════════════════════

const CLASSES = {
  saas: {
    id: "saas", name: "The SaaS", icon: "⌘",
    tagline: "Recurring revenue. Recurring problems.",
    description: "You sell software monthly. Your game is retention: every churned user is revenue lost forever. Grow fast, but not faster than your product can keep users.",
    color: "#4ade80",
    model: { revenueType: "MRR", keyMetric: "Churn Rate", deathBy: "Churn spiral", winBy: "Net negative churn" },
    initial: { month: 0, cash: 100000, burnRate: 8000, revenue: 0, customers: 0, pipeline: 12, price: 0, cac: 0, ltv: 0, churn: 0, product: 30, pmf: 0, teamSize: 2, mrrPerCustomer: 0, activationRate: 50 },
    headers: ["Month", "Cash", "MRR", "Customers", "Churn%", "CAC", "Burn", "PMF"],
    getRow: (s) => [s.month, s.cash, s.revenue, s.customers, s.churn, s.cac || 0, s.burnRate, s.pmf],
    formatRow: (r) => [`M${r[0]}`, `€${r[1].toLocaleString()}`, `€${r[2]}`, r[3], `${r[4]}%`, r[5] ? `€${r[5]}` : "-", `€${r[6].toLocaleString()}`, `${r[7]}/60`],
  },
  marketplace: {
    id: "marketplace", name: "The Marketplace", icon: "⇄",
    tagline: "Two sides. Zero margin for error.",
    description: "You connect supply and demand. Your nightmare is the cold start: neither side joins without the other. Solve the chicken-and-egg, or die trying.",
    color: "#a78bfa",
    model: { revenueType: "Take Rate on GMV", keyMetric: "Liquidity", deathBy: "Cold start death", winBy: "Self-reinforcing liquidity" },
    initial: { month: 0, cash: 100000, burnRate: 8000, revenue: 0, customers: 0, pipeline: 0, price: 0, cac: 0, ltv: 0, churn: 0, product: 25, pmf: 0, teamSize: 2, supply: 0, demand: 0, gmv: 0, takeRate: 10, liquidity: 0 },
    headers: ["Month", "Cash", "Revenue", "Supply", "Demand", "GMV", "Liquidity%", "PMF"],
    getRow: (s) => [s.month, s.cash, s.revenue, s.supply, s.demand, s.gmv, s.liquidity, s.pmf],
    formatRow: (r) => [`M${r[0]}`, `€${r[1].toLocaleString()}`, `€${r[2]}`, r[3], r[4], `€${r[5]}`, `${r[6]}%`, `${r[7]}/60`],
  },
  service: {
    id: "service", name: "The Service", icon: "⚡",
    tagline: "People-powered. Margin-constrained.",
    description: "You sell human expertise, maybe augmented by tech. Revenue is easy, margin is hard. Every new client needs more people. Can you escape the linear trap?",
    color: "#fb923c",
    model: { revenueType: "Project / Retainer", keyMetric: "Gross Margin", deathBy: "Margin compression", winBy: "Productized service at 60%+ margin" },
    initial: { month: 0, cash: 60000, burnRate: 6000, revenue: 0, customers: 0, pipeline: 5, price: 0, cac: 0, ltv: 0, churn: 0, product: 20, pmf: 0, teamSize: 2, margin: 0, utilization: 0, avgProject: 0, repeatRate: 0 },
    headers: ["Month", "Cash", "Revenue", "Clients", "Margin%", "Util%", "Team", "PMF"],
    getRow: (s) => [s.month, s.cash, s.revenue, s.customers, s.margin, s.utilization || 0, s.teamSize, s.pmf],
    formatRow: (r) => [`M${r[0]}`, `€${r[1].toLocaleString()}`, `€${r[2]}`, r[3], `${r[4]}%`, `${r[5]}%`, r[6], `${r[7]}/60`],
  }
};

// ─── VARIANCE ENGINE ─────────────────────────────────────────────────────────
// Each numeric effect gets ±30% randomness
function applyVariance(base, variance = 0.3) {
  if (typeof base !== "number" || base === 0) return base;
  const factor = 1 + (Math.random() * 2 - 1) * variance;
  return Math.round(base * factor);
}

function applyEffectsWithVariance(effects, state) {
  const result = effects(state);
  const varied = { ...result };
  const numericKeys = ["revenue", "customers", "cash", "burnRate", "pipeline", "supply", "demand", "gmv", "liquidity", "margin", "utilization", "product", "pmf", "cac", "mrrPerCustomer", "avgProject", "churn", "activationRate", "repeatRate"];
  for (const key of numericKeys) {
    if (result[key] !== undefined && state[key] !== undefined && result[key] !== state[key]) {
      const delta = result[key] - state[key];
      const variedDelta = applyVariance(delta, 0.3);
      varied[key] = Math.max(0, Math.round(state[key] + variedDelta));
    }
  }
  // PMF and product can be negative change but floor at 0
  if (varied.pmf !== undefined) varied.pmf = Math.max(0, varied.pmf);
  if (varied.product !== undefined) varied.product = Math.max(0, varied.product);
  if (varied.churn !== undefined) varied.churn = Math.max(0, varied.churn);
  return varied;
}

// ─── WORLD EVENTS ────────────────────────────────────────────────────────────
const WORLD_EVENTS = [
  {
    id: "recession_scare",
    title: "📉 Market Downturn",
    text: "Tech layoffs hit the news. Enterprise budgets freeze. Consumer spending tightens. The mood has shifted.",
    effect: (s, cls) => {
      if (cls === "saas") return { ...s, pipeline: Math.max(0, s.pipeline - 5), churn: s.churn + 3, pmf: Math.max(0, s.pmf - 2) };
      if (cls === "marketplace") return { ...s, demand: Math.max(0, s.demand - 8), gmv: Math.max(0, Math.floor(s.gmv * 0.8)), revenue: Math.max(0, Math.floor(s.revenue * 0.8)) };
      return { ...s, pipeline: Math.max(0, s.pipeline - 3), customers: Math.max(0, s.customers - 1), revenue: Math.max(0, Math.floor(s.revenue * 0.85)) };
    },
    flavor: (cls) => cls === "saas" ? "Two prospects ghosted you this week. Budget freezes." : cls === "marketplace" ? "Transaction volume dropped 20%. People are hesitant." : "A client paused their project. 'Let's revisit next quarter.'"
  },
  {
    id: "ai_hype",
    title: "🤖 AI Hype Wave",
    text: "Everyone wants AI. Investors, customers, your neighbor. If your product touches AI, doors open. If it doesn't, you're suddenly 'legacy'.",
    effect: (s, cls) => {
      if (cls === "saas") return { ...s, pipeline: s.pipeline + 8, pmf: s.pmf + 2 };
      if (cls === "marketplace") return { ...s, demand: s.demand + 10, supply: s.supply + 5 };
      return { ...s, pipeline: s.pipeline + 4, avgProject: Math.floor((s.avgProject || 3000) * 1.15) };
    },
    flavor: () => "A prospect asked if you use AI. You said yes. (Everyone says yes.)"
  },
  {
    id: "regulation_shift",
    title: "⚖️ New EU Regulation",
    text: "Brussels published new rules. Compliance costs money. But it also kills competitors who can't adapt. Double-edged sword.",
    effect: (s, cls) => {
      const complianceCost = cls === "marketplace" ? 8000 : 5000;
      return { ...s, cash: s.cash - complianceCost, product: s.product + 4, pmf: s.pmf + 2 };
    },
    flavor: () => "Legal review: €5K. Competitive advantage of being compliant while others scramble: harder to quantify but real."
  },
  {
    id: "viral_moment",
    title: "🔥 Unexpected Virality",
    text: "Someone with a large following posted about your product. Your server is sweating. Your inbox is full. This might not last, but right now it's real.",
    effect: (s, cls) => {
      if (cls === "saas") return { ...s, customers: s.customers + applyVariance(8, 0.5), pipeline: s.pipeline + 20, burnRate: s.burnRate + 500 };
      if (cls === "marketplace") return { ...s, demand: s.demand + applyVariance(25, 0.5), supply: s.supply + 3, liquidity: Math.max(0, s.liquidity - 5) };
      return { ...s, pipeline: s.pipeline + 10, customers: s.customers + 1 };
    },
    flavor: (cls) => cls === "marketplace" ? "Demand flooded in. Supply can't keep up. Liquidity actually dropped because of the imbalance." : "Traffic spiked 10x. Most won't stick. But some will. The question is which ones."
  },
  {
    id: "key_hire_market",
    title: "👤 Talent Market Shift",
    text: "Big tech layoffs mean great engineers are suddenly available. But everyone else is hiring them too.",
    effect: (s) => ({ ...s, product: s.product + 3, burnRate: s.burnRate + 1500, teamSize: s.teamSize + 0.5 }),
    flavor: () => "You got a part-time senior engineer at 60% of market rate. They're overqualified and restless. This is a 3-month window at best."
  },
  {
    id: "competitor_funding",
    title: "💰 Competitor Raised",
    text: "Your main competitor just announced a funding round. The amount is uncomfortably large. Their LinkedIn is all celebrating emojis.",
    effect: (s, cls) => {
      if (cls === "saas") return { ...s, churn: s.churn + 2, pipeline: Math.max(0, s.pipeline - 3), pmf: Math.max(0, s.pmf - 1) };
      if (cls === "marketplace") return { ...s, supply: Math.max(0, s.supply - 5), demand: Math.max(0, s.demand - 3) };
      return { ...s, pipeline: Math.max(0, s.pipeline - 2) };
    },
    flavor: () => "Your team is rattled. One advisor texted 'Saw the news. You okay?' The answer is: it depends on what you do next."
  },
  {
    id: "currency_move",
    title: "💱 EUR/USD Shift",
    text: "Euro weakened against the dollar. If you sell internationally, you just got cheaper. If you buy US services, you just got more expensive.",
    effect: (s) => ({ ...s, burnRate: s.burnRate + 400 }),
    flavor: () => "Your AWS bill went up 8%. Small thing, but it adds up when runway matters."
  },
  {
    id: "conference_season",
    title: "🎪 Conference Season",
    text: "Three relevant conferences this month. Booths are €3K each. Speaking slots are free but require prep time. Or you could skip them all and ship.",
    effect: (s) => ({ ...s, pipeline: s.pipeline + 5, cash: s.cash - 2000, product: Math.max(0, s.product - 1) }),
    flavor: () => "You went to one, skipped two. Met 4 interesting people. Whether any convert is a 3-month question."
  },
];

// ─── DECISION EVENTS ─────────────────────────────────────────────────────────
const EVENTS = [
  {
    months: [1, 2], id: "pricing_v2",
    title: "The Pricing Question",
    text: "Your product exists, people use it, but nobody pays. The price tag is still a blank field. Time to fill it in.",
    getChoices: (cls) => {
      if (cls === "saas") return [
        { text: "€29/mo - low friction, high volume play", effects: (s) => ({ ...s, price: 29, mrrPerCustomer: 29, customers: s.customers + 6, revenue: 174, cac: 40, pipeline: s.pipeline + 20, pmf: s.pmf + 3 }), feedback: "6 signups in week one. Low price means low switching cost though - they'll leave just as easily as they came." },
        { text: "€99/mo - premium, fewer but committed users", effects: (s) => ({ ...s, price: 99, mrrPerCustomer: 99, customers: s.customers + 2, revenue: 198, cac: 120, pmf: s.pmf + 5 }), feedback: "2 customers, both using the product daily. Higher price attracted people with real pain. But your pipeline just got thinner." },
        { text: "Usage-based - let customers self-select their value", effects: (s) => ({ ...s, price: 0, mrrPerCustomer: 45, customers: s.customers + 4, revenue: 180, cac: 70, pipeline: s.pipeline + 10, pmf: s.pmf + 2, burnRate: s.burnRate + 500 }), feedback: "Top user pays €120/mo, bottom pays €8. The spread tells you who needs this. But billing complexity just became a real cost." },
      ];
      if (cls === "marketplace") return [
        { text: "0% take rate - subsidize to get liquidity", effects: (s) => ({ ...s, takeRate: 0, supply: s.supply + 25, demand: s.demand + 30, gmv: 3000, liquidity: 15, burnRate: s.burnRate + 3000, revenue: 0 }), feedback: "Both sides showed up. Because it's free. The moment you turn on monetization, you'll find out who was here for the product and who was here for the subsidy." },
        { text: "12% take rate from day one", effects: (s) => ({ ...s, takeRate: 12, supply: s.supply + 8, demand: s.demand + 12, gmv: 1800, liquidity: 8, revenue: 216, pmf: s.pmf + 4 }), feedback: "Fewer participants, but every transaction is real. A marketplace that makes money from transaction one has different DNA." },
        { text: "Charge supply side only, demand is free", effects: (s) => ({ ...s, takeRate: 15, supply: s.supply + 5, demand: s.demand + 40, gmv: 1200, liquidity: 5, revenue: 180, pmf: s.pmf + 2, burnRate: s.burnRate + 1000 }), feedback: "Demand flooded in. Supply is thin and getting bombarded. Power imbalance that might work - or might implode." },
      ];
      return [
        { text: "€3,000 fixed-price projects", effects: (s) => ({ ...s, price: 3000, avgProject: 3000, customers: s.customers + 2, revenue: 6000, margin: 55, utilization: 60, pmf: s.pmf + 3 }), feedback: "Two clients signed. Fixed price is comfortable for buyers. You underestimated scope on one of them. Classic." },
        { text: "€150/hour - bill for actual time", effects: (s) => ({ ...s, price: 150, avgProject: 4500, customers: s.customers + 1, revenue: 4500, margin: 65, utilization: 50, pmf: s.pmf + 2 }), feedback: "One client. They're careful with hours. Margin is healthy but utilization is low." },
        { text: "€800/mo retainer - recurring, service-style", effects: (s) => ({ ...s, price: 800, avgProject: 800, customers: s.customers + 3, revenue: 2400, margin: 40, utilization: 70, pmf: s.pmf + 4, churn: 5 }), feedback: "Three retainer clients. Revenue recurs but the work doesn't - each month brings new requests." },
      ];
    }
  },
  {
    months: [1, 2, 3], id: "first_feedback",
    title: "The First Honest Feedback",
    text: "Someone you respect gave you unsolicited feedback. It's uncomfortable because part of you knows they might be right.",
    getChoices: (cls) => {
      if (cls === "saas") return [
        { text: "Cut features to focus - do 1 thing brilliantly", effects: (s) => ({ ...s, product: s.product + 12, churn: Math.max(0, s.churn - 3), customers: Math.max(0, s.customers - 1), pmf: s.pmf + 6 }), feedback: "You killed 6 features. One customer left. Remaining users spend 3x more time in the product. Less surface, more depth." },
        { text: "Stay the course - they don't see the vision", effects: (s) => ({ ...s, product: s.product + 2 }), feedback: "Maybe they're wrong. Maybe your platform play IS the moat. But platform plays need execution and funding you don't have yet." },
        { text: "Ask 10 users which ONE thing they'd keep", effects: (s) => ({ ...s, product: s.product + 6, pmf: s.pmf + 8 }), feedback: "7 out of 10 named the same feature. Not the one you expected. The data is humbling but clarifying." },
      ];
      if (cls === "marketplace") return [
        { text: "Focus on supply quality - curate hard", effects: (s) => ({ ...s, supply: s.supply + 10, demand: Math.max(0, s.demand - 5), product: s.product + 8, liquidity: s.liquidity + 5, pmf: s.pmf + 5 }), feedback: "Rejected 40% of applicants. Remaining suppliers are better. Demand noticed. Conversion rates doubled." },
        { text: "Focus on demand volume first", effects: (s) => ({ ...s, demand: s.demand + 20, supply: s.supply + 2, burnRate: s.burnRate + 1500, liquidity: Math.max(0, s.liquidity - 3) }), feedback: "Demand poured in. Suppliers overwhelmed. Demand without supply isn't a marketplace, it's a waiting room." },
        { text: "Pick one narrow vertical and own it", effects: (s) => ({ ...s, supply: s.supply + 5, demand: s.demand + 8, liquidity: s.liquidity + 12, product: s.product + 5, pmf: s.pmf + 7, pipeline: s.pipeline + 5 }), feedback: "Went narrow. Within that niche, you're the obvious choice. Everyone in the vertical knows each other - liquidity shot up." },
      ];
      return [
        { text: "Switch to value-based pricing", effects: (s) => ({ ...s, margin: Math.min(80, s.margin + 15), revenue: Math.floor(s.revenue * 1.3), avgProject: Math.floor((s.avgProject || 3000) * 1.3), pmf: s.pmf + 4, customers: Math.max(0, s.customers - 1) }), feedback: "One client pushed back. The other two didn't flinch. When you frame outcomes, price anchoring changes." },
        { text: "Keep hourly - transparency builds trust", effects: (s) => ({ ...s, customers: s.customers + 1, revenue: s.revenue + (s.avgProject || 2000), utilization: Math.min(100, (s.utilization || 0) + 10) }), feedback: "New client signed for the transparency. Hourly builds trust with price-sensitive buyers. But it caps upside." },
        { text: "Create a productized package with fixed scope", effects: (s) => ({ ...s, margin: Math.min(80, s.margin + 8), product: s.product + 10, customers: s.customers + 2, revenue: s.revenue + Math.floor((s.avgProject || 3000) * 1.6), pmf: s.pmf + 6 }), feedback: "Two new clients bought the package. Fixed scope means you can optimize delivery. This is how services become products." },
      ];
    }
  },
  {
    months: [2, 3, 4], id: "build_or_learn",
    title: "Build vs. Learn",
    text: "30 items on the backlog. Users want features. But you have this nagging feeling you're building on unvalidated ground.",
    getChoices: (cls) => {
      if (cls === "saas") return [
        { text: "Ship the top 3 requested features", effects: (s) => ({ ...s, product: s.product + 8, burnRate: s.burnRate + 1000, customers: s.customers + 2, revenue: s.revenue + (s.mrrPerCustomer || 29) * 2, churn: Math.max(0, s.churn - 2) }), feedback: "Users are happier. Two new signups. But you still don't know if these are nice-to-haves or must-haves." },
        { text: "Freeze dev. Talk to 30 users instead.", effects: (s) => ({ ...s, pmf: s.pmf + 12, product: s.product + 3, churn: s.churn + 2 }), feedback: "60% of users have a problem you didn't know about. The features they request are workarounds for THAT problem. Churn ticked up but you know what to build." },
        { text: "Split: half builds, half interviews", effects: (s) => ({ ...s, pmf: s.pmf + 6, product: s.product + 5, customers: s.customers + 1, revenue: s.revenue + (s.mrrPerCustomer || 29) }), feedback: "Moved on both fronts, neither with full conviction. Sometimes splitting focus means splitting impact." },
      ];
      if (cls === "marketplace") return [
        { text: "Build better matching algorithm", effects: (s) => ({ ...s, product: s.product + 10, burnRate: s.burnRate + 2000, liquidity: s.liquidity + 3 }), feedback: "Match quality improved. But not enough participants to match. You optimized the engine of a car without enough fuel." },
        { text: "Manually match supply and demand - do things that don't scale", effects: (s) => ({ ...s, liquidity: s.liquidity + 15, pmf: s.pmf + 10, supply: s.supply + 3, demand: s.demand + 5, revenue: s.revenue + Math.floor(s.gmv * 0.05) }), feedback: "Exhausting. Illuminating. You matched 20 pairs manually, 17 completed. Your algorithm would have found 8 of those." },
        { text: "Focus supply acquisition only", effects: (s) => ({ ...s, supply: s.supply + 15, demand: s.demand + 3, burnRate: s.burnRate + 1500, liquidity: Math.max(0, s.liquidity - 5), pmf: s.pmf + 2 }), feedback: "Supply up but restless. No transactions means no revenue for them. You're on a clock." },
      ];
      return [
        { text: "Take another client - revenue first", effects: (s) => ({ ...s, customers: s.customers + 1, revenue: s.revenue + (s.avgProject || 3000), utilization: Math.min(100, (s.utilization || 0) + 20), margin: Math.max(0, s.margin - 5) }), feedback: "Revenue up, calendar full. Haven't thought strategically in 3 weeks. You're busy, not growing." },
        { text: "Templatize your delivery process", effects: (s) => ({ ...s, product: s.product + 15, margin: Math.min(80, s.margin + 10), pmf: s.pmf + 5 }), feedback: "Short-term pain. Next delivery was 40% faster. You're building a machine, not just doing work." },
        { text: "Hire junior for delivery, you focus on sales", effects: (s) => ({ ...s, teamSize: s.teamSize + 1, burnRate: s.burnRate + 3000, customers: s.customers + 2, revenue: s.revenue + (s.avgProject || 3000) * 2, margin: Math.max(0, s.margin - 12) }), feedback: "Revenue doubled. Margin dropped. You're managing now, not building. Is that what you want?" },
      ];
    }
  },
  {
    months: [3, 4, 5], id: "big_opportunity",
    title: "The Big Fish",
    text: "A company 10x your current size reached out. They want what you sell, but bigger, faster, and slightly different.",
    getChoices: (cls) => {
      if (cls === "saas") return [
        { text: "Build custom features for them", effects: (s) => ({ ...s, revenue: s.revenue + 800, customers: s.customers + 1, product: s.product + 3, burnRate: s.burnRate + 2000, pmf: s.pmf - 3 }), feedback: "They signed. MRR jumped. But 3 features nobody else wanted. Your product is now shaped like one org chart." },
        { text: "Offer standard product, no customization", effects: (s) => s.product > 40 ? { ...s, revenue: s.revenue + 500, customers: s.customers + 1, pmf: s.pmf + 8 } : { ...s, pmf: s.pmf + 3 }, dynamicFeedback: (s) => s.product > 40 ? "They accepted your standard offering. That's a PMF signal." : "They passed. Your product isn't ready for their needs. But you held your ground." },
        { text: "Paid pilot - 3 months, €2K/mo, defined scope", effects: (s) => ({ ...s, revenue: s.revenue + 2000, customers: s.customers + 1, pmf: s.pmf + 5, product: s.product + 4 }), feedback: "They agreed. Paying pilots give better feedback than free ones. You'll know in 90 days." },
      ];
      if (cls === "marketplace") return [
        { text: "Anchor tenant - exclusive terms, special treatment", effects: (s) => ({ ...s, supply: s.supply + 1, demand: s.demand + 40, gmv: s.gmv + 8000, revenue: s.revenue + Math.floor(8000 * s.takeRate / 100), liquidity: s.liquidity + 10, burnRate: s.burnRate + 1500 }), feedback: "Demand flooded in. They represent 60% of GMV. If they leave, your marketplace collapses. Cold start traded for concentration risk." },
        { text: "Standard terms for everyone", effects: (s) => ({ ...s, demand: s.demand + 15, gmv: s.gmv + 3000, revenue: s.revenue + Math.floor(3000 * s.takeRate / 100), liquidity: s.liquidity + 5, pmf: s.pmf + 4 }), feedback: "Less spectacular, no dependency created. Organic growth over engineered growth." },
        { text: "Decline - they'll dominate marketplace dynamics", effects: (s) => ({ ...s, pmf: s.pmf + 2 }), feedback: "Disciplined, possibly too cautious. Early marketplaces need any liquidity they can get." },
      ];
      return [
        { text: "Take the project and staff up", effects: (s) => ({ ...s, customers: s.customers + 1, revenue: s.revenue + (s.avgProject || 3000) * 3, teamSize: s.teamSize + 1, burnRate: s.burnRate + 4000, margin: Math.max(0, s.margin - 8) }), feedback: "Revenue looks great. You hired under pressure, new person isn't onboarded, client expects your A-team." },
        { text: "Refer elsewhere - not ready for this scale", effects: (s) => ({ ...s, pmf: s.pmf + 2, pipeline: s.pipeline + 3 }), feedback: "The referral came back as two smaller referrals. Sometimes the best business development is knowing when to say no." },
        { text: "Phased approach - start small, expand if it works", effects: (s) => ({ ...s, customers: s.customers + 1, revenue: s.revenue + Math.floor((s.avgProject || 3000) * 1.5), margin: s.margin + 2, pmf: s.pmf + 5 }), feedback: "Phase 1 went well. They saw professionalism. Phase 2 discussed at higher budget. Controlled growth." },
      ];
    }
  },
  {
    months: [4, 5, 6], id: "churn_crisis",
    title: "The Quiet Exodus",
    text: "People are leaving. Not dramatically. They just stop showing up. Your dashboard shows a pattern you've been avoiding.",
    getChoices: (cls) => {
      if (cls === "saas") return [
        { text: "Call every churned user and ask why", effects: (s) => ({ ...s, churn: Math.max(0, s.churn - 5), pmf: s.pmf + 10, product: s.product + 6 }), feedback: "8 out of 15 replied. Same pattern: they solved the acute problem and didn't need you anymore. Fundamental model question." },
        { text: "Build retention features - streaks, notifications", effects: (s) => ({ ...s, churn: Math.max(0, s.churn - 2), burnRate: s.burnRate + 800, product: s.product + 2 }), feedback: "Marginal improvement. More engaging hamster wheel, same fundamental question." },
        { text: "Switch to annual plans with a discount", effects: (s) => ({ ...s, cash: s.cash + s.revenue * 8, churn: Math.max(0, s.churn - 4), revenue: Math.floor(s.revenue * 0.85) }), feedback: "Cash upfront improved runway. Annual plans reduce churn mechanically. But you're masking the problem, not solving it." },
      ];
      if (cls === "marketplace") return [
        { text: "Survey both sides - find the friction", effects: (s) => ({ ...s, pmf: s.pmf + 8, liquidity: s.liquidity + 5, product: s.product + 5 }), feedback: "Supply: 'Not enough quality demand.' Demand: 'Too slow to match.' Classic marketplace friction. Neither side wrong." },
        { text: "Subsidize to keep them active", effects: (s) => ({ ...s, burnRate: s.burnRate + 3000, supply: s.supply + 5, demand: s.demand + 8, liquidity: s.liquidity + 3, revenue: Math.max(0, s.revenue - 200) }), feedback: "Activity ticked up. Subsidized activity isn't real activity. You're paying people to pretend." },
        { text: "Manually curate matches - concierge mode", effects: (s) => ({ ...s, liquidity: s.liquidity + 12, pmf: s.pmf + 7, product: s.product + 8 }), feedback: "Exhausting. You matched 20 pairs, 17 completed. Your algorithm found 8. The gap between tech and reality is bigger than you thought." },
      ];
      return [
        { text: "Call every client - satisfaction check", effects: (s) => ({ ...s, customers: Math.max(0, s.customers - 1), pmf: s.pmf + 8, repeatRate: (s.repeatRate || 0) + 10 }), feedback: "One was shopping alternatives. Saved two others. The one you lost was a bad fit anyway." },
        { text: "Build a case study showing ROI", effects: (s) => ({ ...s, pipeline: s.pipeline + 5, product: s.product + 3, pmf: s.pmf + 3 }), feedback: "Forced you to quantify your own value. Best client seeing 4x ROI. Lead with that number everywhere." },
        { text: "Lower prices to compete on cost", effects: (s) => ({ ...s, margin: Math.max(0, s.margin - 15), customers: s.customers + 1, revenue: s.revenue + Math.floor((s.avgProject || 3000) * 0.7) }), feedback: "Won a client on price. They'll leave the moment someone cheaper shows up." },
      ];
    }
  },
  {
    months: [5, 6, 7], id: "team_crisis",
    title: "The Human Factor",
    text: "Your co-founder is burning out. Late-night messages turned into missed standups turned into a hard conversation over coffee.",
    getChoices: () => [
      { text: "Restructure responsibilities - find what energizes each of you", effects: (s) => ({ ...s, product: s.product + 5, pmf: s.pmf + 3, burnRate: s.burnRate + 500 }), feedback: "Swapping tasks made both of you more productive and less miserable. Should've done this earlier." },
      { text: "Push through - startups are hard", effects: (s) => ({ ...s, product: Math.max(0, s.product - 3), pmf: Math.max(0, s.pmf - 2) }), feedback: "They pushed another month, then crashed. Energy gone. Hustle culture doesn't scale." },
      { text: "Bring in a third person", effects: (s) => ({ ...s, teamSize: s.teamSize + 1, burnRate: s.burnRate + 4000, product: s.product + 4, cash: s.cash - 2000 }), feedback: "Fresh energy, different skills. But three opinions on everything. Decision speed dropped." },
    ]
  },
  {
    months: [5, 6, 7], id: "data_signal",
    title: "The Numbers Tell a Story",
    text: "You finally looked at the real data. Not the vanity dashboard. What you found surprised you.",
    getChoices: (cls) => {
      if (cls === "saas") return [
        { text: "Double down on the afterthought feature power users love", effects: (s) => ({ ...s, pmf: s.pmf + 12, product: s.product + 8, customers: Math.max(0, Math.floor(s.customers * 0.8)), revenue: Math.floor(s.revenue * 0.9) }), feedback: "Lost 20% of users, remaining ones are 5x more engaged. Revenue dipped but trajectory changed." },
        { text: "Fix the activation bottleneck - same acquisition, more retained", effects: (s) => ({ ...s, churn: Math.max(0, s.churn - 4), product: s.product + 10, activationRate: Math.min(90, s.activationRate + 15), pmf: s.pmf + 5 }), feedback: "Activation jumped from 50% to 65%. You didn't need more users - you needed to stop losing the ones you had." },
        { text: "Rewrite marketing for the persona that actually converts", effects: (s) => ({ ...s, cac: Math.max(20, (s.cac || 80) - 25), pipeline: s.pipeline + 15, pmf: s.pmf + 6 }), feedback: "CAC dropped 30%. Specific marketing speaks to someone and converts. Generic marketing speaks to everyone and convinces nobody." },
      ];
      if (cls === "marketplace") return [
        { text: "Focus on power users - 20% drive 80% of GMV", effects: (s) => ({ ...s, liquidity: s.liquidity + 10, gmv: Math.floor(s.gmv * 1.4), revenue: Math.floor(s.revenue * 1.3), pmf: s.pmf + 8 }), feedback: "GMV concentrated further but total volume grew. Your marketplace runs on whales. Serve them well." },
        { text: "Introduce quality scores for supply", effects: (s) => ({ ...s, supply: Math.max(0, s.supply - 5), liquidity: s.liquidity + 8, product: s.product + 8, pmf: s.pmf + 5 }), feedback: "Lost some supply, every remaining participant is better. Sometimes growth means subtraction." },
        { text: "Expand to a new city", effects: (s) => ({ ...s, burnRate: s.burnRate + 3000, supply: s.supply + 8, demand: s.demand + 10, liquidity: Math.max(0, s.liquidity - 8), pmf: Math.max(0, s.pmf - 3) }), feedback: "Back to zero in the new city. Meanwhile home market still fragile. Multi-city is exponentially harder." },
      ];
      return [
        { text: "Specialize in the 3x margin service line", effects: (s) => ({ ...s, margin: Math.min(80, s.margin + 15), customers: Math.max(0, s.customers - 1), revenue: Math.floor(s.revenue * 0.9), pmf: s.pmf + 10, product: s.product + 8 }), feedback: "Dropped low-margin services. Lost a client. Remaining work is profitable and repeatable." },
        { text: "Invest in referral program - cheapest acquisition", effects: (s) => ({ ...s, pipeline: s.pipeline + 8, pmf: s.pmf + 6, repeatRate: Math.min(80, (s.repeatRate || 0) + 15), burnRate: s.burnRate + 1000 }), feedback: "Referral rate doubled. Making existing customers successful enough to recommend you is the cheapest growth." },
        { text: "Automate delivery for fastest-growing segment", effects: (s) => ({ ...s, product: s.product + 12, burnRate: s.burnRate + 2000, margin: Math.min(80, s.margin + 5), pmf: s.pmf + 4 }), feedback: "Automated 40% of delivery. Margin improved, can serve more clients without hiring. The bridge from service to product." },
      ];
    }
  },
  {
    months: [6, 7, 8], id: "inflection",
    title: "The Inflection Point",
    text: "Something changed. People reach out instead of the other way around. It's not easier, just different. A corner might be turning.",
    getChoices: (cls) => [
      {
        text: "Pour fuel on it - 3x spend, hire, accelerate",
        effects: (s) => s.pmf > 30
          ? { ...s, revenue: Math.floor(s.revenue * 2), customers: Math.floor(s.customers * 1.8), burnRate: s.burnRate + 5000, pmf: s.pmf + 12, ...(cls === "marketplace" ? { gmv: Math.floor(s.gmv * 2), supply: Math.floor(s.supply * 1.5), demand: Math.floor(s.demand * 1.8) } : {}), ...(cls === "service" ? { teamSize: s.teamSize + 1 } : {}) }
          : { ...s, burnRate: s.burnRate + 5000, customers: s.customers + 2, revenue: s.revenue + 300, pmf: Math.max(0, s.pmf - 4) },
        dynamicFeedback: (s) => s.pmf > 30
          ? "It was real. Growth compounded. Revenue doubled. This is what finding the moment feels like."
          : "It was a blip. You scaled spend before validating. Burn jumped, growth didn't follow. Premature scaling kills."
      },
      { text: "Validate - is this a trend or a blip? 4 more weeks.", effects: (s) => ({ ...s, pmf: s.pmf + 6, product: s.product + 3 }), feedback: "4 weeks later: real, but concentrated in one segment. The patience bought you precision." },
      {
        text: "Fundraise on the momentum",
        effects: (s) => s.pmf > 25 ? { ...s, cash: s.cash + 80000, pmf: s.pmf + 2 } : { ...s, cash: s.cash + 30000, pmf: s.pmf + 1 },
        dynamicFeedback: (s) => s.pmf > 25
          ? "€80K raised on real momentum. Smart timing."
          : "€30K raised on a good story. Less than hoped, but the process sharpened your pitch."
      },
    ]
  },
  {
    months: [7, 8, 9], id: "scale_decision",
    title: "The Scaling Question",
    text: "Things are working. Not perfectly, not consistently, but working. The question isn't whether to grow, it's how.",
    getChoices: (cls) => {
      if (cls === "saas") return [
        { text: "Go upmarket - enterprise, higher ACV", effects: (s) => ({ ...s, revenue: s.revenue + 2000, burnRate: s.burnRate + 3000, customers: s.customers + 1, product: s.product + 5, pmf: s.pmf + 3 }), feedback: "First enterprise client pays more than 20 SMB. But SLAs, integrations, QBRs. Different company now." },
        { text: "Go wider - new segment, same product", effects: (s) => ({ ...s, customers: s.customers + 5, revenue: s.revenue + (s.mrrPerCustomer || 29) * 5, burnRate: s.burnRate + 2000, pmf: Math.max(0, s.pmf - 2) }), feedback: "New segment, different expectations. Activation dropped. 'Same product, new market' is never actually the same product." },
        { text: "Go deeper - more features for existing users", effects: (s) => ({ ...s, revenue: Math.floor(s.revenue * 1.4), product: s.product + 8, pmf: s.pmf + 7, churn: Math.max(0, s.churn - 3) }), feedback: "Users pay more, churn less. LTV improved without changing CAC. Quiet path to profitability." },
      ];
      if (cls === "marketplace") return [
        { text: "New city", effects: (s) => ({ ...s, burnRate: s.burnRate + 5000, supply: s.supply + 10, demand: s.demand + 15, liquidity: Math.max(0, s.liquidity - 10), gmv: s.gmv + 2000, revenue: s.revenue + Math.floor(2000 * s.takeRate / 100) }), feedback: "Playbook works 60%. Other 40% is local nuance. Every city is a mini cold-start." },
        { text: "Adjacent category on same marketplace", effects: (s) => ({ ...s, supply: s.supply + 8, demand: s.demand + 12, gmv: s.gmv + 3000, revenue: s.revenue + Math.floor(3000 * s.takeRate / 100), liquidity: s.liquidity + 3, pmf: s.pmf + 4 }), feedback: "Cross-pollination. Participants found new reasons to come back." },
        { text: "Increase take rate", effects: (s) => ({ ...s, takeRate: s.takeRate + 3, revenue: Math.floor(s.gmv * (s.takeRate + 3) / 100), supply: Math.max(0, s.supply - 3), pmf: s.pmf + 2 }), feedback: "Revenue jumped. Nobody left yet. High liquidity absorbs price increases." },
      ];
      return [
        { text: "Productize into SaaS", effects: (s) => ({ ...s, burnRate: s.burnRate + 5000, product: s.product + 15, margin: Math.min(80, s.margin + 5), pmf: s.pmf + 5 }), feedback: "6 months dev for a tool replacing 30% of manual work. Hybrid model is messy but real." },
        { text: "Franchise - train others to deliver", effects: (s) => ({ ...s, revenue: s.revenue + Math.floor((s.avgProject || 3000) * 0.3), customers: s.customers + 3, margin: Math.min(80, s.margin + 10), pmf: s.pmf + 3 }), feedback: "Partners deliver at 70% your quality. But you scale without hiring." },
        { text: "Raise the price", effects: (s) => ({ ...s, avgProject: Math.floor((s.avgProject || 3000) * 1.4), revenue: Math.floor(s.revenue * 1.3), margin: Math.min(80, s.margin + 8), customers: Math.max(0, s.customers - 1), pmf: s.pmf + 4 }), feedback: "Lost one price-sensitive client, kept everyone else. Premium positioning flywheel." },
      ];
    }
  },
  {
    months: [8, 9, 10], id: "endgame",
    title: "The Mirror",
    text: "Month 8+. Before the final stretch: what kind of company are you actually building?",
    getChoices: () => [
      { text: "Venture-scale - growth above all", effects: (s) => ({ ...s, revenue: Math.floor(s.revenue * 1.5), burnRate: s.burnRate + 4000, customers: Math.floor(s.customers * 1.4), pmf: s.pmf + 5 }), feedback: "Growth accelerated, burn too. You'll need to raise within 6 months. The metrics look investable." },
      { text: "Profitable small business - sustainable, mine", effects: (s) => ({ ...s, burnRate: Math.max(3000, s.burnRate - 3000), pmf: s.pmf + 8, product: s.product + 5 }), feedback: "Cut burn, focused on margin. Not every startup needs to be a unicorn." },
      { text: "I don't know yet - keep options open", effects: (s) => ({ ...s, pmf: s.pmf + 3, product: s.product + 2, revenue: Math.floor(s.revenue * 1.1) }), feedback: "Honest. The company will tell you what it wants to be if you listen to the data." },
    ]
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function pickRandom(arr) { return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null; }
function getAvailable(month, used) { return EVENTS.filter(e => e.months.includes(month) && !used.includes(e.id)); }

// ─── EXCEL EXPORT ────────────────────────────────────────────────────────────
function generateCSV(classId, history, decisions) {
  const cls = CLASSES[classId];
  const headers = cls.headers;
  let csv = "FOUNDER'S DILEMMA - Game Export\n";
  csv += `Class: ${cls.name}\n`;
  csv += `Result: ${history.length > 0 ? (history[history.length-1].pmf >= 60 ? "PMF Achieved" : history[history.length-1].cash <= 0 ? "Game Over" : "Survived") : "Unknown"}\n\n`;
  csv += "=== BUSINESS MODEL TABLE ===\n";
  csv += headers.join(",") + "\n";
  history.forEach(s => {
    csv += cls.getRow(s).join(",") + "\n";
  });
  csv += "\n=== DECISIONS LOG ===\n";
  csv += "Month,Event,Decision,Outcome\n";
  decisions.forEach(d => {
    csv += `${d.month},"${d.event}","${d.choice}","${d.feedback.replace(/"/g, '""')}"\n`;
  });
  csv += "\n=== WORLD EVENTS ===\n";
  csv += "Month,Event,Impact\n";
  decisions.filter(d => d.isWorld).forEach(d => {
    csv += `${d.month},"${d.event}","${d.feedback.replace(/"/g, '""')}"\n`;
  });
  return csv;
}

function downloadCSV(data, filename) {
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#08080b", surface: "#0f0f14", raised: "#161620", border: "#222230",
  borderHi: "#333345", text: "#d4d2cf", dim: "#7a7888", muted: "#4a4858",
  green: "#4ade80", yellow: "#fbbf24", red: "#ef4444", blue: "#60a5fa",
  purple: "#a78bfa", orange: "#fb923c",
};
const mono = "'JetBrains Mono', 'Fira Code', monospace";
const sans = "'Space Grotesk', 'DM Sans', sans-serif";

// ─── UI COMPONENTS ───────────────────────────────────────────────────────────
function Badge({ children, color = C.dim }) {
  return <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 3, background: `${color}15`, color, fontFamily: mono, textTransform: "uppercase", letterSpacing: "0.08em" }}>{children}</span>;
}

function Bar({ label, value, max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: C.muted, fontFamily: mono }}>{label}</span>
        <span style={{ fontSize: 12, color, fontFamily: mono, fontWeight: 700 }}>{value}{label === "RUNWAY" ? " mo" : "/60"}</span>
      </div>
      <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

function BizTable({ classId, history }) {
  const cls = CLASSES[classId];
  if (!history.length) return null;
  return (
    <div style={{ overflowX: "auto", fontSize: 11, fontFamily: mono }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>{cls.headers.map((h, i) => (
            <th key={i} style={{ textAlign: i === 0 ? "left" : "right", padding: "5px 6px", color: C.muted, fontWeight: 400, fontSize: 9, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {history.map((s, ri) => {
            const row = cls.formatRow(cls.getRow(s));
            const isLast = ri === history.length - 1;
            return (
              <tr key={ri} style={{ background: isLast ? C.raised : "transparent" }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ textAlign: ci === 0 ? "left" : "right", padding: "4px 6px", color: C.text, borderBottom: `1px solid ${C.border}08`, fontVariantNumeric: "tabular-nums" }}>
                    {isLast ? <strong>{cell}</strong> : cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WorldEventBanner({ event, flavor, onDismiss }) {
  return (
    <div style={{ background: `${C.yellow}08`, border: `1px solid ${C.yellow}30`, borderRadius: 6, padding: 12, marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{event.title}</div>
      <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.5, marginBottom: 4 }}>{event.text}</div>
      <div style={{ fontSize: 11, color: C.yellow, fontFamily: mono, marginBottom: 8 }}>{flavor}</div>
      <button onClick={onDismiss} style={{ background: C.raised, border: `1px solid ${C.border}`, color: C.text, fontSize: 11, padding: "6px 14px", borderRadius: 4, cursor: "pointer", fontFamily: mono }}>Continue →</button>
    </div>
  );
}

function LogPanel({ lines }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [lines]);
  return (
    <div ref={ref} style={{ background: "#04040608", borderRadius: 4, padding: 8, fontFamily: mono, fontSize: 10, lineHeight: 1.7, maxHeight: 140, overflowY: "auto" }}>
      {lines.map((l, i) => (
        <div key={i} style={{ color: l.c || C.dim }}>{l.p && <span style={{ color: C.green, marginRight: 5 }}>{l.p}</span>}{l.t}</div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

export default function FoundersDilemmaV3() {
  const [screen, setScreen] = useState("title");
  const [classId, setClassId] = useState(null);
  const [state, setState] = useState(null);
  const [history, setHistory] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [event, setEvent] = useState(null);
  const [worldEvent, setWorldEvent] = useState(null);
  const [usedEvents, setUsedEvents] = useState([]);
  const [usedWorlds, setUsedWorlds] = useState([]);
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const addLog = useCallback((t, c, p) => setLog(prev => [...prev, { t, c, p }]), []);

  const startGame = useCallback((id) => {
    const c = CLASSES[id];
    setClassId(id);
    const init = { ...c.initial };
    setState(init);
    setHistory([init]);
    setDecisions([]);
    setUsedEvents([]);
    setUsedWorlds([]);
    setResult(null);
    setFeedback(null);
    setWorldEvent(null);
    setLog([
      { t: `[${c.name}] initialized`, c: c.color, p: "$" },
      { t: c.description, c: C.dim },
      { t: `Win condition: ${c.model.winBy}`, c: c.color, p: "★" },
      { t: `Death condition: ${c.model.deathBy}`, c: C.red, p: "✗" },
      { t: `Outcomes have ±30% variance. The market doesn't care about your plans.`, c: C.yellow, p: "!" },
      { t: "", c: C.muted },
    ]);
    setScreen("game");
    setTimeout(() => {
      const avail = getAvailable(1, []);
      setEvent(pickRandom(avail));
    }, 100);
  }, []);

  const checkWorldEvent = useCallback((month, currentState) => {
    // 40% chance of world event each month (after month 2)
    if (month < 3 || Math.random() > 0.4) return null;
    const available = WORLD_EVENTS.filter(w => !usedWorlds.includes(w.id));
    return pickRandom(available);
  }, [usedWorlds]);

  const advanceMonth = useCallback((newState) => {
    const next = newState.month + 1;
    const monthly = { ...newState, month: next, cash: newState.cash - newState.burnRate + newState.revenue };
    
    // Check for world event BEFORE updating state
    const we = checkWorldEvent(next, monthly);
    if (we) {
      const impacted = we.effect(monthly, classId);
      const flavor = we.flavor(classId);
      setState(impacted);
      setHistory(prev => [...prev, impacted]);
      setUsedWorlds(prev => [...prev, we.id]);
      setDecisions(prev => [...prev, { month: next, event: we.title, choice: "World Event", feedback: flavor, isWorld: true }]);
      addLog(`── Month ${next} ──`, CLASSES[classId]?.color, "▸");
      addLog(`⚡ ${we.title}`, C.yellow, "!");
      setWorldEvent({ ...we, flavor });
      
      // Check end after world event
      if (impacted.cash <= 0) { setResult("dead"); addLog("DEAD.", C.red, "✗"); return; }
      if (impacted.pmf >= 60) { setResult("pmf"); addLog("PMF.", C.green, "★"); return; }
      if (next >= 12) { setResult("survived"); addLog("12 months.", C.yellow, "★"); return; }
      return;
    }

    setState(monthly);
    setHistory(prev => [...prev, monthly]);
    addLog(`── Month ${next} ──`, CLASSES[classId]?.color, "▸");

    if (monthly.cash <= 0) { setResult("dead"); addLog("DEAD.", C.red, "✗"); return; }
    if (monthly.pmf >= 60) { setResult("pmf"); addLog("PMF.", C.green, "★"); return; }
    if (next >= 12) { setResult("survived"); addLog("12 months.", C.yellow, "★"); return; }

    const avail = getAvailable(next, usedEvents);
    const ev = pickRandom(avail);
    if (ev) setEvent(ev);
    else setTimeout(() => advanceMonth(monthly), 100);
  }, [classId, usedEvents, usedWorlds, addLog, checkWorldEvent]);

  const dismissWorldEvent = useCallback(() => {
    setWorldEvent(null);
    const avail = getAvailable(state.month, usedEvents);
    const ev = pickRandom(avail);
    if (ev) setEvent(ev);
    else advanceMonth(state);
  }, [state, usedEvents, advanceMonth]);

  const makeChoice = useCallback((choice) => {
    const newState = applyEffectsWithVariance(choice.effects, state);
    const fb = choice.dynamicFeedback ? choice.dynamicFeedback(state) : choice.feedback;
    setFeedback(fb);
    setDecisions(prev => [...prev, { month: state.month, event: event.title, choice: choice.text, feedback: fb, isWorld: false }]);
    addLog(`> ${choice.text}`, C.blue);
    addLog(fb, C.dim, " ");
    setUsedEvents(prev => [...prev, event.id]);
    setEvent(null);
    setTimeout(() => { setFeedback(null); advanceMonth(newState); }, 0);
  }, [state, event, advanceMonth, addLog]);

  const exportGame = useCallback(() => {
    const csv = generateCSV(classId, history, decisions);
    downloadCSV(csv, `founders_dilemma_${classId}_${Date.now()}.csv`);
  }, [classId, history, decisions]);

  // ─── TITLE ───────────────────────────────────────────────────────────────
  if (screen === "title") {
    return (
      <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: sans, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@400;500;700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
        <div style={{ maxWidth: 520, width: "100%" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.15em", marginBottom: 14, textTransform: "uppercase" }}>Select your class</div>
          <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.03em" }}>FOUNDER'S DILEMMA</h1>
          <p style={{ fontSize: 11, color: C.dim, fontFamily: mono, marginBottom: 6 }}>Different models. Different games. Same goal: survive.</p>
          <p style={{ fontSize: 10, color: C.muted, fontFamily: mono, marginBottom: 24 }}>± 30% outcome variance · random market events · export to spreadsheet</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(CLASSES).map(([key, c]) => (
              <button key={key} onClick={() => startGame(key)} style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                padding: "14px 16px", textAlign: "left", cursor: "pointer", color: C.text, transition: "all 0.15s",
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.background = C.raised; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{c.name}</span>
                  <Badge color={c.color}>{c.id}</Badge>
                </div>
                <div style={{ fontSize: 12, color: C.dim, marginBottom: 6, fontStyle: "italic" }}>{c.tagline}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, fontSize: 10, fontFamily: mono, color: C.muted }}>
                  <div>Revenue: <span style={{color: C.dim}}>{c.model.revenueType}</span></div>
                  <div>Key: <span style={{color: C.dim}}>{c.model.keyMetric}</span></div>
                  <div style={{ color: C.green }}>Win: {c.model.winBy}</div>
                  <div style={{ color: C.red }}>Death: {c.model.deathBy}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── GAME ────────────────────────────────────────────────────────────────
  const cls = CLASSES[classId];
  const accent = cls?.color || C.green;
  const netBurn = Math.max(0, (state?.burnRate || 0) - (state?.revenue || 0));
  const runway = netBurn > 0 ? Math.floor((state?.cash || 0) / netBurn) : 99;
  const runwayColor = runway > 8 ? C.green : runway > 4 ? C.yellow : C.red;
  const pmfColor = (state?.pmf || 0) >= 50 ? C.green : (state?.pmf || 0) >= 25 ? C.yellow : C.blue;

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: sans, display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@400;500;700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "8px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>{cls.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{cls.name}</span>
          <Badge color={accent}>M{state?.month || 0}</Badge>
          {result && <Badge color={result === "pmf" ? C.green : result === "dead" ? C.red : C.yellow}>{result === "pmf" ? "PMF!" : result === "dead" ? "DEAD" : "SURVIVED"}</Badge>}
        </div>
        <div style={{display:"flex", gap: 6}}>
          {result && <button onClick={exportGame} style={{ background: accent, color: C.bg, border: "none", fontSize: 10, padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontFamily: mono, fontWeight: 700 }}>EXPORT CSV</button>}
          <button onClick={() => setScreen("title")} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, fontSize: 10, padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontFamily: mono }}>RESTART</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 6 }}>
            <Bar label="RUNWAY" value={Math.min(runway, 24)} max={12} color={runwayColor} />
            <Bar label="PMF" value={state?.pmf || 0} max={60} color={pmfColor} />
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: 14 }}>
            {result ? (
              <div style={{ textAlign: "center", paddingTop: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: result === "pmf" ? C.green : result === "dead" ? C.red : C.yellow, marginBottom: 6 }}>
                  {result === "pmf" ? "Product-Market Fit" : result === "dead" ? "Game Over" : "Survived"}
                </div>
                <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6, maxWidth: 380, margin: "0 auto 12px" }}>
                  {result === "pmf" && "Users pull the product from your hands. Revenue grows organically. This is the moment."}
                  {result === "dead" && `Month ${state.month}. Cash hit zero. ${state.pmf > 25 ? "Something was building, but the money ran out first." : "The core assumptions never validated."}`}
                  {result === "survived" && `€${state.cash.toLocaleString()} left. PMF: ${state.pmf}/60. ${state.pmf > 35 ? "Close." : "Alive, but the hard questions remain."}`}
                </div>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: mono, marginBottom: 16 }}>
                  {decisions.filter(d => !d.isWorld).length} decisions made · {decisions.filter(d => d.isWorld).length} world events survived
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={exportGame} style={{ background: accent, color: C.bg, border: "none", padding: "10px 20px", borderRadius: 6, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>
                    📊 Export Spreadsheet
                  </button>
                  <button onClick={() => setScreen("title")} style={{ background: C.raised, color: C.text, border: `1px solid ${C.border}`, padding: "10px 20px", borderRadius: 6, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>
                    Play Again
                  </button>
                </div>
              </div>
            ) : worldEvent ? (
              <WorldEventBanner event={worldEvent} flavor={worldEvent.flavor} onDismiss={dismissWorldEvent} />
            ) : event ? (
              <div>
                <div style={{ fontSize: 10, color: accent, fontFamily: mono, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.1em" }}>Decision</div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 5px", lineHeight: 1.3 }}>{event.title}</h2>
                <p style={{ fontSize: 12, color: C.dim, lineHeight: 1.6, margin: "0 0 12px" }}>{event.text}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {(event.getChoices ? event.getChoices(classId) : []).map((ch, i) => (
                    <button key={i} onClick={() => makeChoice(ch)} style={{
                      background: C.raised, border: `1px solid ${C.border}`, borderRadius: 6,
                      padding: "10px 12px", textAlign: "left", cursor: "pointer", color: C.text,
                      fontSize: 12, lineHeight: 1.4, transition: "all 0.15s",
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = accent; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = C.border; }}
                    >
                      <span style={{ color: accent, fontFamily: mono, marginRight: 6, fontSize: 10, fontWeight: 700 }}>[{String.fromCharCode(65 + i)}]</span>
                      {ch.text}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: 9, color: C.muted, fontFamily: mono }}>
                  ⚡ Outcomes vary ±30% each run
                </div>
              </div>
            ) : feedback ? (
              <div style={{ padding: 12, background: C.raised, borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, color: C.text, lineHeight: 1.6 }}>{feedback}</div>
            ) : (
              <div style={{ color: C.muted, fontSize: 11, fontFamily: mono }}>Processing...</div>
            )}
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, padding: 8, flexShrink: 0 }}>
            <LogPanel lines={log} />
          </div>
        </div>

        {/* Right: Table */}
        <div style={{ width: 320, borderLeft: `1px solid ${C.border}`, overflow: "auto", padding: 10, background: C.surface, flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: C.muted, fontFamily: mono, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Business Model</div>
          <div style={{ marginBottom: 10, padding: 6, background: C.raised, borderRadius: 4, fontSize: 10, fontFamily: mono, color: C.dim, lineHeight: 1.5 }}>
            <div>Revenue: <span style={{ color: accent }}>{cls.model.revenueType}</span></div>
            <div>Key: <span style={{ color: C.text }}>{cls.model.keyMetric}</span></div>
          </div>
          <BizTable classId={classId} history={history} />
          {history.length > 1 && (() => {
            const curr = history[history.length - 1];
            const prev = history[history.length - 2];
            return (
              <div style={{ marginTop: 10, padding: 6, background: C.raised, borderRadius: 4, fontSize: 10, fontFamily: mono }}>
                <div style={{ color: C.muted, marginBottom: 3 }}>DELTA</div>
                <div style={{ color: curr.cash - prev.cash >= 0 ? C.green : C.red }}>Cash: {curr.cash - prev.cash >= 0 ? "+" : ""}€{(curr.cash - prev.cash).toLocaleString()}</div>
                <div style={{ color: curr.revenue - prev.revenue >= 0 ? C.green : C.yellow }}>Revenue: {curr.revenue - prev.revenue >= 0 ? "+" : ""}€{curr.revenue - prev.revenue}</div>
                <div style={{ color: C.text }}>Net burn: €{Math.max(0, curr.burnRate - curr.revenue).toLocaleString()}/mo</div>
              </div>
            );
          })()}
          {decisions.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: mono, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Decision Log</div>
              {decisions.slice(-5).map((d, i) => (
                <div key={i} style={{ fontSize: 10, color: d.isWorld ? C.yellow : C.dim, marginBottom: 4, lineHeight: 1.4, padding: "3px 0", borderBottom: `1px solid ${C.border}08` }}>
                  <span style={{ color: C.muted }}>M{d.month}</span>{" "}
                  {d.isWorld ? `⚡ ${d.event}` : d.choice.slice(0, 50) + (d.choice.length > 50 ? "..." : "")}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
