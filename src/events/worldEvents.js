// ═══════════════════════════════════════════════════════════════
// WORLD EVENTS
// Exogenous market events. You don't choose these — they choose you.
// 4 curated events, each with real impact and memorable flavor.
// ═══════════════════════════════════════════════════════════════

export const WORLD_EVENTS = [
  {
    id: 'market_downturn',
    title: 'Market Downturn',
    text: 'Tech layoffs hit the news. Enterprise budgets freeze. Consumer spending tightens. The mood has shifted.',
    flavor: 'Two prospects ghosted you this week. Budget freezes. Your pipeline just got longer — not in a good way.',
    effect: (s) => ({
      ...s,
      pipeline: Math.max(0, s.pipeline - 5),
      churn: s.churn + 3,
      pmf: Math.max(0, s.pmf - 2),
    }),
  },

  {
    id: 'ai_hype',
    title: 'AI Hype Wave',
    text: 'Everyone wants AI. Investors, customers, your neighbor. If your product touches AI, doors open. If it doesn\'t, you\'re suddenly "legacy".',
    flavor: 'A prospect asked if you use AI. You said yes. (Everyone says yes.)',
    effect: (s) => ({
      ...s,
      pipeline: s.pipeline + 8,
      pmf: s.pmf + 2,
    }),
  },

  {
    id: 'viral_moment',
    title: 'Unexpected Virality',
    text: 'Someone with a large following posted about your product. Your server is sweating. Your inbox is full. This might not last, but right now it\'s real.',
    flavor: 'Traffic spiked 10x. Most won\'t stick. But some will. The question is which ones.',
    effect: (s) => ({
      ...s,
      customers: s.customers + Math.round(5 + Math.random() * 10),
      pipeline: s.pipeline + 20,
      totalMRR: (s.totalMRR ?? 0) + Math.round((5 + Math.random() * 10) * (s.price ?? 49)),
      burnRate: s.burnRate + 500,
    }),
  },

  {
    id: 'competitor_raised',
    title: 'Competitor Raised',
    text: 'Your main competitor just announced a funding round. The amount is uncomfortably large. Their LinkedIn is celebrating.',
    flavor: 'Your team is rattled. One advisor texted "Saw the news. You okay?" The answer depends on what you do next.',
    effect: (s) => ({
      ...s,
      churn: s.churn + 2,
      pipeline: Math.max(0, s.pipeline - 3),
      pmf: Math.max(0, s.pmf - 1),
    }),
  },
];
