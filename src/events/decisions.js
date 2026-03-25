// ═══════════════════════════════════════════════════════════════
// DECISION EVENTS
// 8 curated events for SaaS. Each is a real startup moment.
// Quality > quantity. Every choice should feel like a real trade-off.
// ═══════════════════════════════════════════════════════════════

export const DECISION_EVENTS = [
  {
    id: 'pricing',
    months: [1, 2],
    title: 'The Pricing Question',
    text: 'Your product exists, people use it, but nobody pays. The price tag is still a blank field. Time to fill it in.',
    apCost: 1,
    getChoices: () => [
      {
        text: '€29/mo — low friction, high volume play',
        effects: (s) => ({
          ...s,
          price: 29,
          mrrPerCustomer: 29,
          customers: s.customers + 6,
          totalMRR: (s.totalMRR ?? 0) + 174,
          revenue: (s.revenue ?? 0) + 174,
          cac: 40,
          pipeline: s.pipeline + 20,
          pmf: s.pmf + 3,
        }),
        feedback: '6 signups in week one. Low price means low switching cost — they\'ll leave just as easily as they came.',
      },
      {
        text: '€99/mo — premium, fewer but committed users',
        effects: (s) => ({
          ...s,
          price: 99,
          mrrPerCustomer: 99,
          customers: s.customers + 2,
          totalMRR: (s.totalMRR ?? 0) + 198,
          revenue: (s.revenue ?? 0) + 198,
          cac: 120,
          pmf: s.pmf + 5,
        }),
        feedback: '2 customers, both using the product daily. Higher price attracted people with real pain. But your pipeline just got thinner.',
      },
      {
        text: 'Usage-based — let customers self-select their value',
        effects: (s) => ({
          ...s,
          price: 45,
          mrrPerCustomer: 45,
          customers: s.customers + 4,
          totalMRR: (s.totalMRR ?? 0) + 180,
          revenue: (s.revenue ?? 0) + 180,
          cac: 70,
          pipeline: s.pipeline + 10,
          pmf: s.pmf + 2,
          burnRate: s.burnRate + 500,
        }),
        feedback: 'Top user pays €120/mo, bottom pays €8. The spread tells you who needs this. But billing complexity just became a real cost.',
      },
    ],
  },

  {
    id: 'first_feedback',
    months: [1, 2, 3],
    title: 'The First Honest Feedback',
    text: 'Someone you respect gave you unsolicited feedback. It\'s uncomfortable because part of you knows they might be right.',
    apCost: 1,
    getChoices: () => [
      {
        text: 'Cut features to focus — do one thing brilliantly',
        effects: (s) => ({
          ...s,
          product: s.product + 12,
          churn: Math.max(0, s.churn - 3),
          customers: Math.max(0, s.customers - 1),
          pmf: s.pmf + 6,
        }),
        feedback: 'You killed 6 features. One customer left. Remaining users spend 3x more time in the product. Less surface, more depth.',
      },
      {
        text: 'Stay the course — they don\'t see the vision yet',
        effects: (s) => ({
          ...s,
          product: s.product + 2,
        }),
        feedback: 'Maybe they\'re wrong. Maybe your platform play IS the moat. But platform plays need execution and funding you don\'t have yet.',
      },
      {
        text: 'Ask 10 users which ONE thing they\'d keep',
        effects: (s) => ({
          ...s,
          product: s.product + 6,
          pmf: s.pmf + 8,
        }),
        feedback: '7 out of 10 named the same feature. Not the one you expected. The data is humbling but clarifying.',
      },
    ],
  },

  {
    id: 'build_or_learn',
    months: [2, 3, 4],
    title: 'Build vs. Learn',
    text: '30 items on the backlog. Users want features. But you have this nagging feeling you\'re building on unvalidated ground.',
    apCost: 2,
    getChoices: () => [
      {
        text: 'Ship the top 3 requested features',
        effects: (s) => ({
          ...s,
          product: s.product + 8,
          burnRate: s.burnRate + 1000,
          customers: s.customers + 2,
          totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 29) * 2,
          revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 29) * 2,
          churn: Math.max(0, s.churn - 2),
        }),
        feedback: 'Users are happier. Two new signups. But you still don\'t know if these are nice-to-haves or must-haves.',
      },
      {
        text: 'Freeze dev. Talk to 30 users instead.',
        effects: (s) => ({
          ...s,
          pmf: s.pmf + 12,
          product: s.product + 3,
          churn: s.churn + 2,
        }),
        feedback: '60% of users have a problem you didn\'t know about. The features they request are workarounds for THAT problem. Churn ticked up while you listened.',
      },
      {
        text: 'Split: half builds, half interviews',
        effects: (s) => ({
          ...s,
          pmf: s.pmf + 6,
          product: s.product + 5,
          customers: s.customers + 1,
          totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 29),
          revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 29),
        }),
        feedback: 'Moved on both fronts, neither with full conviction. Sometimes splitting focus means splitting impact.',
      },
    ],
  },

  {
    id: 'big_fish',
    months: [3, 4, 5],
    title: 'The Big Fish',
    text: 'A restaurant chain with 40 locations reached out. They want what you sell, but bigger, faster, and slightly different.',
    apCost: 2,
    getChoices: () => [
      {
        text: 'Build custom features for them',
        effects: (s) => ({
          ...s,
          totalMRR: (s.totalMRR ?? 0) + 800,
          revenue: (s.revenue ?? 0) + 800,
          customers: s.customers + 1,
          product: s.product + 3,
          burnRate: s.burnRate + 2000,
          pmf: Math.max(0, s.pmf - 3),
        }),
        feedback: 'They signed. MRR jumped. But 3 features nobody else wanted. Your product is now shaped like one org chart.',
      },
      {
        text: 'Offer standard product, no customization',
        dynamicFeedback: (s) => s.product > 40
          ? 'They accepted your standard offering. That\'s a PMF signal — the product is good enough without bending.'
          : 'They passed. Your product isn\'t ready for their needs. But you held your ground.',
        effects: (s) => s.product > 40
          ? { ...s, totalMRR: (s.totalMRR ?? 0) + 500, revenue: (s.revenue ?? 0) + 500, customers: s.customers + 1, pmf: s.pmf + 8 }
          : { ...s, pmf: s.pmf + 3 },
      },
      {
        text: 'Paid pilot — 3 months, €2K/mo, defined scope',
        effects: (s) => ({
          ...s,
          totalMRR: (s.totalMRR ?? 0) + 2000,
          revenue: (s.revenue ?? 0) + 2000,
          customers: s.customers + 1,
          pmf: s.pmf + 5,
          product: s.product + 4,
        }),
        feedback: 'They agreed. Paying pilots give better feedback than free ones. You\'ll know in 90 days if this is real.',
      },
    ],
  },

  {
    id: 'churn_crisis',
    months: [4, 5, 6],
    title: 'The Quiet Exodus',
    text: 'People are leaving. Not dramatically — they just stop showing up. Your dashboard shows a pattern you\'ve been avoiding.',
    apCost: 2,
    getChoices: () => [
      {
        text: 'Call every churned user and ask why',
        effects: (s) => ({
          ...s,
          churn: Math.max(0, s.churn - 5),
          pmf: s.pmf + 10,
          product: s.product + 6,
        }),
        feedback: '8 out of 15 replied. Same pattern: they solved the acute problem and didn\'t need you anymore. Fundamental model question.',
      },
      {
        text: 'Build retention features — streaks, notifications',
        effects: (s) => ({
          ...s,
          churn: Math.max(0, s.churn - 2),
          burnRate: s.burnRate + 800,
          product: s.product + 2,
        }),
        feedback: 'Marginal improvement. More engaging hamster wheel, same fundamental question underneath.',
      },
      {
        text: 'Switch to annual plans with a discount',
        effects: (s) => ({
          ...s,
          cash: s.cash + (s.totalMRR ?? 0) * 8,
          churn: Math.max(0, s.churn - 4),
          totalMRR: Math.round((s.totalMRR ?? 0) * 0.85),
          revenue: Math.round((s.revenue ?? 0) * 0.85),
        }),
        feedback: 'Cash upfront improved runway. Annual plans reduce churn mechanically. But you\'re masking the problem, not solving it.',
      },
    ],
  },

  {
    id: 'data_signal',
    months: [5, 6, 7],
    title: 'The Numbers Tell a Story',
    text: 'You finally looked at the real data. Not the vanity dashboard. What you found surprised you.',
    apCost: 1,
    getChoices: () => [
      {
        text: 'Double down on the feature power users love',
        effects: (s) => ({
          ...s,
          pmf: s.pmf + 12,
          product: s.product + 8,
          customers: Math.max(0, Math.floor(s.customers * 0.8)),
          totalMRR: Math.round((s.totalMRR ?? 0) * 0.9),
          revenue: Math.round((s.revenue ?? 0) * 0.9),
        }),
        feedback: 'Lost 20% of users, remaining ones are 5x more engaged. Revenue dipped but trajectory changed.',
      },
      {
        text: 'Fix the activation bottleneck',
        effects: (s) => ({
          ...s,
          churn: Math.max(0, s.churn - 4),
          product: s.product + 10,
          activationRate: Math.min(90, s.activationRate + 15),
          pmf: s.pmf + 5,
        }),
        feedback: 'Activation jumped from 50% to 65%. You didn\'t need more users — you needed to stop losing the ones you had.',
      },
      {
        text: 'Rewrite marketing for the persona that actually converts',
        effects: (s) => ({
          ...s,
          cac: Math.max(20, (s.cac || 80) - 25),
          pipeline: s.pipeline + 15,
          pmf: s.pmf + 6,
        }),
        feedback: 'CAC dropped 30%. Specific messaging speaks to someone. Generic messaging speaks to everyone and convinces nobody.',
      },
    ],
  },

  {
    id: 'inflection',
    months: [6, 7, 8],
    title: 'The Inflection Point',
    text: 'Something changed. People reach out instead of the other way around. It\'s not easier, just different. A corner might be turning.',
    apCost: 2,
    getChoices: () => [
      {
        text: 'Pour fuel on it — 3x spend, hire, accelerate',
        dynamicFeedback: (s) => (s.pmf ?? 0) > 30
          ? 'It was real. Growth compounded. Revenue doubled. This is what finding the moment feels like.'
          : 'It was a blip. You scaled spend before validating. Burn jumped, growth didn\'t follow. Premature scaling kills.',
        effects: (s) => (s.pmf ?? 0) > 30
          ? {
              ...s,
              totalMRR: Math.round((s.totalMRR ?? 0) * 2),
              revenue: Math.round((s.revenue ?? 0) * 2),
              customers: Math.round(s.customers * 1.8),
              burnRate: s.burnRate + 5000,
              pmf: s.pmf + 12,
            }
          : {
              ...s,
              burnRate: s.burnRate + 5000,
              customers: s.customers + 2,
              totalMRR: (s.totalMRR ?? 0) + 300,
              revenue: (s.revenue ?? 0) + 300,
              pmf: Math.max(0, s.pmf - 4),
            },
      },
      {
        text: 'Validate — is this a trend or a blip? 4 more weeks.',
        effects: (s) => ({
          ...s,
          pmf: s.pmf + 6,
          product: s.product + 3,
        }),
        feedback: '4 weeks later: real, but concentrated in one segment. The patience bought you precision.',
      },
      {
        text: 'Fundraise on the momentum',
        dynamicFeedback: (s) => (s.pmf ?? 0) > 25
          ? '€80K raised on real momentum. Smart timing — investors fund trajectories, not snapshots.'
          : '€30K raised on a good story. Less than hoped, but the process sharpened your pitch.',
        effects: (s) => (s.pmf ?? 0) > 25
          ? { ...s, cash: s.cash + 80000, pmf: s.pmf + 2 }
          : { ...s, cash: s.cash + 30000, pmf: s.pmf + 1 },
      },
    ],
  },

  {
    id: 'scale_decision',
    months: [7, 8, 9, 10],
    title: 'The Scaling Question',
    text: 'Things are working. Not perfectly, not consistently, but working. The question isn\'t whether to grow — it\'s how.',
    apCost: 2,
    getChoices: () => [
      {
        text: 'Go upmarket — enterprise, higher ACV',
        effects: (s) => ({
          ...s,
          totalMRR: (s.totalMRR ?? 0) + 2000,
          revenue: (s.revenue ?? 0) + 2000,
          burnRate: s.burnRate + 3000,
          customers: s.customers + 1,
          product: s.product + 5,
          pmf: s.pmf + 3,
        }),
        feedback: 'First enterprise client pays more than 20 SMBs. But SLAs, integrations, QBRs. You\'re building a different company now.',
      },
      {
        text: 'Go wider — new vertical, same product',
        effects: (s) => ({
          ...s,
          customers: s.customers + 5,
          totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 29) * 5,
          revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 29) * 5,
          burnRate: s.burnRate + 2000,
          pmf: Math.max(0, s.pmf - 2),
        }),
        feedback: 'New segment, different expectations. Activation dropped. "Same product, new market" is never actually the same product.',
      },
      {
        text: 'Go deeper — more value for existing users',
        effects: (s) => ({
          ...s,
          totalMRR: Math.round((s.totalMRR ?? 0) * 1.4),
          revenue: Math.round((s.revenue ?? 0) * 1.4),
          product: s.product + 8,
          pmf: s.pmf + 7,
          churn: Math.max(0, s.churn - 3),
        }),
        feedback: 'Users pay more, churn less. LTV improved without changing CAC. The quiet path to profitability.',
      },
    ],
  },
];
