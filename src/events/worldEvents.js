// ═══════════════════════════════════════════════════════════════
// WORLD EVENTS
// Exogenous market events. You don't choose these — they choose you.
// 10 events. They hit hard — this is the market being the market.
// ═══════════════════════════════════════════════════════════════

export const WORLD_EVENTS = [
  {
    id: 'market_downturn',
    title: 'Market Downturn',
    text: 'Tech layoffs hit the news. Enterprise budgets freeze. Consumer spending tightens. The mood has shifted.',
    flavor: 'Two prospects ghosted you this week. Budget freezes. Your pipeline just got longer — not in a good way.',
    effect: (s) => ({
      ...s,
      pipeline: Math.max(2, Math.round(s.pipeline * 0.65)),
      churn: Math.min(20, s.churn + 2.5),
      burnRate: s.burnRate + 300,
    }),
  },

  {
    id: 'ai_hype',
    title: 'AI Hype Wave',
    text: 'Everyone wants AI. Investors, customers, your neighbor. If your product touches AI, doors open. If it doesn\'t, you\'re suddenly "legacy".',
    flavor: 'A prospect asked if you use AI. You said yes. (Everyone says yes.) But your AI actually works.',
    effect: (s) => ({
      ...s,
      pipeline: s.pipeline + 5,
      conversionRate: Math.min(30, s.conversionRate + 1),
      burnRate: s.burnRate + 400,
    }),
  },

  {
    id: 'viral_moment',
    title: 'Unexpected Virality',
    text: 'Someone with a large following posted about your product. Your server is sweating. Your inbox is full.',
    flavor: 'Traffic spiked 10x. Most won\'t stick. But some will. The question is which ones.',
    effect: (s) => {
      const newUsers = 2 + Math.round(Math.random() * 4);
      return {
        ...s,
        customers: s.customers + newUsers,
        pipeline: s.pipeline + 10,
        totalMRR: (s.totalMRR ?? 0) + newUsers * (s.price ?? 0),
        burnRate: s.burnRate + 600,
        churn: Math.min(20, s.churn + 2),
      };
    },
  },

  {
    id: 'competitor_raised',
    title: 'Competitor Raised',
    text: 'Your main competitor just announced a funding round. The amount is uncomfortably large. Their LinkedIn is celebrating.',
    flavor: 'Your team is rattled. One advisor texted "Saw the news. You okay?" The answer depends on what you do next.',
    effect: (s) => ({
      ...s,
      churn: Math.min(20, s.churn + 1.5),
      pipeline: Math.max(2, Math.round(s.pipeline * 0.8)),
    }),
  },

  {
    id: 'eu_regulation',
    title: 'New EU Regulation',
    text: 'The EU AI Act just published implementation guidelines. Food-tech companies handling customer data need a compliance review. Your competitors are scrambling.',
    flavor: 'Compliance cost: real. Competitive advantage for those who get it right first: also real.',
    effect: (s) => ({
      ...s,
      burnRate: s.burnRate + 1500,
      churn: Math.min(20, s.churn + 1),
      product: Math.max(10, (s.product ?? 30) - 2),
      pipeline: s.pipeline + 3,
    }),
  },

  {
    id: 'conference_season',
    title: 'Conference Season',
    text: 'Gastro-Tech Summit in Berlin next month. €2K for a booth, €500 for travel. The entire industry will be there.',
    flavor: 'Your competitor has a bigger booth. But you have a better demo. Conferences are theater — and you know your lines.',
    effect: (s) => ({
      ...s,
      cash: s.cash - 2500,
      pipeline: s.pipeline + 8,
      product: s.product + 1,
    }),
  },

  {
    id: 'talent_shift',
    title: 'Talent Market Shift',
    text: 'A mid-size food-tech startup in Berlin just laid off 40 people. Your inbox is full of resumes from experienced engineers and sales people.',
    flavor: 'Buyer\'s market for talent. For once, the best people are available. If you can afford them.',
    effect: (s) => ({
      ...s,
      // Opportunity — slightly positive, the benefit comes from decision events
      pipeline: s.pipeline + 2,
      product: s.product + 1,
    }),
  },

  {
    id: 'currency_inflation',
    title: 'Inflation Spike',
    text: 'Restaurant input costs up 12%. Your customers are squeezing every supplier — including you. "Can we get a discount?"',
    flavor: 'Three customers asked for price breaks this week. Your tool saves them money, but right now everything feels like a cost.',
    effect: (s) => ({
      ...s,
      churn: Math.min(20, s.churn + 2),
      cac: Math.min(300, (s.cac || 80) + 15),
      burnRate: s.burnRate + 400,
    }),
  },

  {
    id: 'key_bankruptcy',
    title: 'Key Customer Bankruptcy',
    text: 'Your second-largest customer filed for insolvency. Three months of unpaid invoices. The restaurant industry giveth and taketh.',
    flavor: 'You liked the owner. His food was great. Turns out great food doesn\'t guarantee a great business. Sound familiar?',
    effect: (s) => {
      const lostMRR = Math.round((s.totalMRR ?? 0) * 0.15);
      return {
        ...s,
        customers: Math.max(0, s.customers - 1),
        totalMRR: Math.max(0, (s.totalMRR ?? 0) - lostMRR),
        revenue: Math.max(0, (s.revenue ?? 0) - lostMRR),
        cash: s.cash - Math.round(lostMRR * 2),
        churn: Math.min(20, s.churn + 1),
      };
    },
  },

  {
    id: 'positive_press',
    title: 'Positive Press',
    text: 'Gründerszene featured you in "10 Food-Tech Startups to Watch." The article is fair, accurate, and your inbox is full.',
    flavor: 'Inbound leads tripled this week. Most are tire-kickers. But some are real. The signal-to-noise ratio is your problem now.',
    effect: (s) => ({
      ...s,
      pipeline: s.pipeline + 12,
      conversionRate: Math.min(30, s.conversionRate + 0.5),
    }),
  },
];
