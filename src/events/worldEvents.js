// ═══════════════════════════════════════════════════════════════
// WORLD EVENTS
// Exogenous market events. You don't choose these — they choose you.
// 4 curated events. They hit hard — this is the market being the market.
// ═══════════════════════════════════════════════════════════════

export const WORLD_EVENTS = [
  {
    id: 'market_downturn',
    title: 'Market Downturn',
    text: 'Tech layoffs hit the news. Enterprise budgets freeze. Consumer spending tightens. The mood has shifted.',
    flavor: 'Two prospects ghosted you this week. Budget freezes. Your pipeline just got longer — not in a good way.',
    effect: (s) => ({
      ...s,
      pipeline: Math.max(0, Math.round(s.pipeline * 0.6)),
      churn: s.churn + 4,
      pmf: Math.max(0, s.pmf - 3),
      burnRate: s.burnRate + 300, // can't cut costs instantly
    }),
  },

  {
    id: 'ai_hype',
    title: 'AI Hype Wave',
    text: 'Everyone wants AI. Investors, customers, your neighbor. If your product touches AI, doors open. If it doesn\'t, you\'re suddenly "legacy".',
    flavor: 'A prospect asked if you use AI. You said yes. (Everyone says yes.)',
    effect: (s) => ({
      ...s,
      pipeline: s.pipeline + 6,
      pmf: s.pmf + 1,
      // Hype inflates expectations — burn increases as you chase the narrative
      burnRate: s.burnRate + 500,
    }),
  },

  {
    id: 'viral_moment',
    title: 'Unexpected Virality',
    text: 'Someone with a large following posted about your product. Your server is sweating. Your inbox is full. This might not last, but right now it\'s real.',
    flavor: 'Traffic spiked 10x. Most won\'t stick. But some will. The question is which ones.',
    effect: (s) => {
      // Viral = lots of unqualified signups. Most churn immediately.
      const newUsers = Math.round(3 + Math.random() * 8);
      return {
        ...s,
        customers: s.customers + newUsers,
        pipeline: s.pipeline + 15,
        totalMRR: (s.totalMRR ?? 0) + newUsers * (s.price ?? 0),
        burnRate: s.burnRate + 800, // infra costs spike
        churn: s.churn + 3, // unqualified users churn fast
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
      churn: s.churn + 3,
      pipeline: Math.max(0, Math.round(s.pipeline * 0.7)),
      pmf: Math.max(0, s.pmf - 2),
    }),
  },
];
