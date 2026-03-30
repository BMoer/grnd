// ═══════════════════════════════════════════════════════════════
// DECISION EVENTS — SaaS Class
// 20 curated events spanning months 1-24.
// 
// Design rules:
// - NO direct PMF manipulation (PMF is calculated from metrics)
// - Events affect underlying metrics: product, churn, pipeline,
//   customers, MRR, burn, CAC, conversionRate, activationRate
// - Every choice has a real trade-off
// - Default outcomes are painful but not instant-death
// - Dynamic text references actual game state where possible
// ═══════════════════════════════════════════════════════════════

export const DECISION_EVENTS = [
  // ─── PHASE 1: Discovery (Months 1-4) ───

  {
    id: 'pricing',
    months: [1, 2],
    title: 'The Pricing Question',
    text: 'Your product exists, people use it, but nobody pays. The price tag is still a blank field. Time to fill it in.',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        price: 0,
        mrrPerCustomer: 0,
        customers: s.customers + 3,
        churn: Math.min(20, s.churn + 2),
      }),
      feedback: 'You didn\'t set a price. Three people signed up for free. They\'ll expect it to stay free. You just trained the market that your product has no value.',
    },
    getChoices: () => [
      {
        text: '€29/mo — low friction, high volume play',
        effects: (s) => ({
          ...s,
          price: 29,
          mrrPerCustomer: 29,
          customers: s.customers + 5,
          totalMRR: (s.totalMRR ?? 0) + 145,
          revenue: (s.revenue ?? 0) + 145,
          cac: Math.max(30, (s.cac || 80) - 15),
          pipeline: s.pipeline + 8,
          product: s.product + 2,
        }),
        feedback: '5 signups in week one. Low price means low switching cost — they\'ll leave just as easily as they came.',
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
          cac: (s.cac || 80) + 30,
          churn: Math.max(3, s.churn - 1),
          product: s.product + 3,
        }),
        feedback: '2 customers, both using the product daily. Higher price attracted people with real pain. But your pipeline just got thinner.',
      },
      {
        text: 'Usage-based — let customers self-select their value',
        effects: (s) => ({
          ...s,
          price: 55,
          mrrPerCustomer: 55,
          customers: s.customers + 3,
          totalMRR: (s.totalMRR ?? 0) + 165,
          revenue: (s.revenue ?? 0) + 165,
          cac: (s.cac || 80),
          pipeline: s.pipeline + 4,
          burnRate: s.burnRate + 500,
          product: s.product + 1,
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
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        product: Math.max(10, s.product - 4),
        churn: Math.min(20, s.churn + 1.5),
      }),
      feedback: 'You ignored the feedback. The problem they pointed out didn\'t go away — it got worse. Two more users hit the same wall and left.',
    },
    getChoices: () => [
      {
        text: 'Cut features to focus — do one thing brilliantly',
        effects: (s) => ({
          ...s,
          product: s.product + 8,
          churn: Math.max(3, s.churn - 1),
          customers: Math.max(0, s.customers - 1),
        }),
        feedback: 'You killed 6 features. One customer left. Remaining users spend 3x more time in the product. Less surface, more depth.',
      },
      {
        text: 'Stay the course — they don\'t see the vision yet',
        effects: (s) => ({
          ...s,
          product: s.product + 1,
        }),
        feedback: 'Maybe they\'re wrong. Maybe your platform play IS the moat. But platform plays need execution and funding you don\'t have yet.',
      },
      {
        text: 'Ask 10 users which ONE thing they\'d keep',
        effects: (s) => ({
          ...s,
          product: s.product + 5,
          conversionRate: Math.min(30, s.conversionRate + 1),
        }),
        feedback: '7 out of 10 named the same feature. Not the one you expected. The data is humbling but clarifying.',
      },
    ],
  },

  {
    id: 'cofounder_alignment',
    months: [2, 3],
    title: 'Co-founder Alignment Check',
    text: 'Mira wants to double down on product. Jonas wants to build sales infrastructure. You have budget for one.',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        product: Math.max(10, s.product - 2),
        pipeline: Math.max(2, s.pipeline - 3),
      }),
      feedback: 'Nobody decided. Both spent a week on their own priority. Nothing was done well. The tension didn\'t go away — it just became the background noise.',
    },
    getChoices: () => [
      {
        text: 'Product first — "we can\'t sell what doesn\'t work"',
        effects: (s) => ({
          ...s,
          product: s.product + 7,
          churn: Math.max(3, s.churn - 0.5),
          activationRate: Math.min(90, (s.activationRate ?? 50) + 5),
        }),
        feedback: 'Jonas isn\'t happy but trusts the logic. Two weeks later, activation rate jumped. Hard to argue with that.',
      },
      {
        text: 'Sales first — "revenue validates faster than features"',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 10,
          cac: Math.max(30, (s.cac || 80) - 10),
          burnRate: s.burnRate + 500,
        }),
        feedback: 'Pipeline grew. Mira\'s frustrated. But real customer conversations revealed three bugs the product team missed.',
      },
      {
        text: '50/50 split with weekly sync',
        effects: (s) => ({
          ...s,
          product: s.product + 3,
          pipeline: s.pipeline + 4,
        }),
        feedback: 'Both fronts moved. Neither dramatically. The weekly sync became the most useful meeting you have.',
      },
    ],
  },

  // ─── PHASE 2: Validation (Months 3-7) ───

  {
    id: 'build_or_learn',
    months: [3, 4, 5],
    title: 'Build vs. Learn',
    text: '30 items on the backlog. Users want features. But you have this nagging feeling you\'re building on unvalidated ground.',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        product: Math.max(10, s.product - 3),
        churn: Math.min(20, s.churn + 2),
      }),
      feedback: 'Backlog grew. Nothing shipped, no conversations had. Two users churned waiting for fixes you never made.',
    },
    getChoices: () => [
      {
        text: 'Ship the top 3 requested features',
        effects: (s) => ({
          ...s,
          product: s.product + 6,
          burnRate: s.burnRate + 800,
          customers: s.customers + 1,
          totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 49),
          revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 49),
          churn: Math.max(3, s.churn - 0.5),
        }),
        feedback: 'Users are happier. One new signup came through word of mouth. But you still don\'t know if these are nice-to-haves or must-haves.',
      },
      {
        text: 'Freeze dev. Talk to 30 users instead.',
        effects: (s) => ({
          ...s,
          product: s.product + 3,
          conversionRate: Math.min(30, s.conversionRate + 2),
          churn: Math.min(20, s.churn + 1),
          activationRate: Math.min(90, (s.activationRate ?? 50) + 8),
        }),
        feedback: '60% of users have a problem you didn\'t know about. The features they request are workarounds for THAT problem. Churn ticked up while you listened.',
      },
      {
        text: 'Split: half builds, half interviews',
        effects: (s) => ({
          ...s,
          product: s.product + 4,
          conversionRate: Math.min(30, s.conversionRate + 1),
        }),
        feedback: 'Moved on both fronts, neither with full conviction. Sometimes splitting focus means splitting impact.',
      },
    ],
  },

  {
    id: 'grant_opportunity',
    months: [3, 4],
    title: 'The Grant Opportunity',
    text: 'An FFG call for "AI in Gastronomy" just opened. €50K non-dilutive. Application deadline in 10 days. The paperwork is soul-crushing.',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You let the deadline pass. €50K in non-dilutive capital, gone. Sometimes the boring work is the most valuable.',
    },
    getChoices: () => [
      {
        text: 'Drop everything and apply',
        dynamicFeedback: (s) => {
          const grantBonus = s.founderMods?.grantBonus ?? 0;
          const threshold = Math.max(25, 35 - grantBonus * 30); // diversity criteria help
          return (s.product ?? 30) > threshold
            ? `Approved. €50K hits your account in 6 weeks.${grantBonus > 0 ? ' The diversity criteria in the call worked in your favor.' : ' Your product story was compelling because it\'s real.'}`
            : 'Rejected. "Insufficient market validation." The reviewers weren\'t wrong. But the application forced you to articulate your model clearly.';
        },
        effects: (s) => {
          const grantBonus = s.founderMods?.grantBonus ?? 0;
          const threshold = Math.max(25, 35 - grantBonus * 30);
          return (s.product ?? 30) > threshold
            ? { ...s, cash: s.cash + 50000, burnRate: s.burnRate + 200 }
            : { ...s, product: s.product + 2 };
        },
      },
      {
        text: 'Apply but keep building — Jonas writes, Mira codes',
        effects: (s) => ({
          ...s,
          cash: Math.random() > 0.5 ? s.cash + 50000 : s.cash,
          product: s.product + 1,
        }),
        feedback: 'Split attention, mediocre application. 50/50 odds.',
      },
    ],
  },

  {
    id: 'big_fish',
    months: [4, 5, 6],
    title: 'The Big Fish',
    text: 'A restaurant chain with 40 locations reached out. They want what you sell, but bigger, faster, and slightly different.',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        pipeline: Math.max(2, s.pipeline - 3),
      }),
      feedback: 'You didn\'t respond for two weeks. They went with your competitor. Word got around that you\'re slow to respond.',
    },
    getChoices: () => [
      {
        text: 'Build custom features for them',
        effects: (s) => ({
          ...s,
          totalMRR: (s.totalMRR ?? 0) + 800,
          revenue: (s.revenue ?? 0) + 800,
          customers: s.customers + 1,
          product: Math.max(10, s.product - 2), // product becomes less general
          burnRate: s.burnRate + 2000,
          churn: Math.min(20, s.churn + 1), // other customers feel neglected
        }),
        feedback: 'They signed. MRR jumped. But 3 features nobody else wanted. Your product is now shaped like one org chart.',
      },
      {
        text: 'Offer standard product, no customization',
        dynamicFeedback: (s) => (s.product ?? 30) > 45
          ? 'They accepted your standard offering. That\'s a signal — the product works at scale.'
          : 'They passed. Your product isn\'t ready for their scale. But you held your ground.',
        effects: (s) => (s.product ?? 30) > 45
          ? { ...s, totalMRR: (s.totalMRR ?? 0) + 500, revenue: (s.revenue ?? 0) + 500, customers: s.customers + 1, product: s.product + 3 }
          : { ...s, product: s.product + 1 },
      },
      {
        text: 'Paid pilot — 3 months, €2K/mo, defined scope',
        effects: (s) => ({
          ...s,
          totalMRR: (s.totalMRR ?? 0) + 2000,
          revenue: (s.revenue ?? 0) + 2000,
          customers: s.customers + 1,
          product: s.product + 4,
        }),
        feedback: 'They agreed. Paying pilots give better feedback than free ones. You\'ll know in 90 days if this is real.',
      },
    ],
  },

  {
    id: 'first_hire',
    months: [3, 4, 5],
    title: 'First Hire Decision',
    text: 'You can\'t do everything yourselves anymore. The question isn\'t whether to hire — it\'s who.',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        product: Math.max(10, s.product - 1),
      }),
      feedback: 'No hire. You\'re spreading thinner each month. The quality of everything slowly degrades as context-switching becomes your main skill.',
    },
    getChoices: () => [
      {
        text: 'Junior developer — build faster, burn more',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 3500,
          product: s.product + 4,
          teamSize: (s.teamSize ?? 2) + 1,
        }),
        feedback: 'Hired. Takes 6 weeks to ramp. But the backlog starts moving. Jonas can finally think instead of just code.',
      },
      {
        text: 'Customer success person — reduce churn',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 3000,
          churn: Math.max(3, s.churn - 1.5),
          supportCost: Math.max(2, (s.supportCost ?? 5) - 2),
          teamSize: (s.teamSize ?? 2) + 1,
          activationRate: Math.min(90, (s.activationRate ?? 50) + 5),
        }),
        feedback: 'Hired. She calls every user who goes quiet. Churn drops. Users feel heard. This is the unsexy work that compounds.',
      },
      {
        text: 'Part-time sales freelancer — grow pipeline',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 2000,
          pipeline: s.pipeline + 8,
          cac: Math.max(30, (s.cac || 80) - 10),
        }),
        feedback: 'Hired. Pipeline grows 40% in first month. But freelancers don\'t build institutional knowledge.',
      },
    ],
  },

  {
    id: 'churn_crisis',
    months: [5, 6, 7],
    title: 'The Quiet Exodus',
    getText: (s) => {
      const churn = s.churn ?? 5;
      const customers = s.customers ?? 0;
      return `People are leaving. Not dramatically — they just stop showing up. ${churn}% monthly means you replace your entire customer base every ${Math.round(100/Math.max(1,churn))} months. Your dashboard shows a pattern you've been avoiding.`;
    },
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        churn: Math.min(20, s.churn + 3),
        customers: Math.max(0, s.customers - Math.ceil(s.customers * 0.1)),
        totalMRR: Math.round((s.totalMRR ?? 0) * 0.9),
        revenue: Math.round((s.revenue ?? 0) * 0.9),
      }),
      feedback: 'You watched the churn dashboard and did nothing. 10% of your customers left this month. The ones who stayed noticed the empty Slack channel.',
    },
    getChoices: () => [
      {
        text: 'Call every churned user and ask why',
        effects: (s) => ({
          ...s,
          churn: Math.max(3, s.churn - 2),
          product: s.product + 6,
          conversionRate: Math.min(30, s.conversionRate + 1),
        }),
        feedback: '8 out of 15 replied. Same pattern: onboarding is confusing and the core value takes 3 weeks to see. Now you know where to dig.',
      },
      {
        text: 'Build retention features — streaks, notifications',
        effects: (s) => ({
          ...s,
          churn: Math.max(3, s.churn - 0.5),
          burnRate: s.burnRate + 600,
          product: s.product + 2,
        }),
        feedback: 'Marginal improvement. More engaging hamster wheel, same fundamental question underneath.',
      },
      {
        text: 'Switch to annual plans with a discount',
        effects: (s) => ({
          ...s,
          cash: s.cash + Math.round((s.totalMRR ?? 0) * 4),
          churn: Math.max(3, s.churn - 1.5),
          totalMRR: Math.round((s.totalMRR ?? 0) * 0.88),
          revenue: Math.round((s.revenue ?? 0) * 0.88),
        }),
        feedback: 'Cash upfront improved runway. Annual plans reduce churn mechanically. But you discounted 12% and masked the core problem.',
      },
    ],
  },

  {
    id: 'data_signal',
    months: [5, 6, 7, 8],
    title: 'The Numbers Tell a Story',
    getText: (s) => {
      const churnPct = s.churn ?? 5;
      const customers = s.customers ?? 0;
      const activationPct = s.activationRate ?? 50;
      if (churnPct > 8) {
        return `You dug into the data. ${churnPct}% monthly churn means you replace your entire customer base every ${Math.round(100/churnPct)} months. Of your ${customers} customers, the top 20% generate 70% of usage. The rest barely log in.`;
      }
      if (activationPct < 60) {
        return `You dug into the data. Only ${activationPct}% of trial users complete onboarding. Of those who do, churn is just ${Math.max(2, churnPct - 2)}%. The product works — for people who get past the first 10 minutes.`;
      }
      return `You dug into the data. ${customers} customers, but 3 of them generate 40% of your MRR. Your best users found a workflow you didn't design for. Your worst users never got past setup.`;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        churn: Math.min(20, s.churn + 1),
        product: Math.max(10, s.product - 2),
      }),
      feedback: 'You kept looking at the vanity dashboard. The real signal was in the data you didn\'t check. Another month of flying blind.',
    },
    getChoices: () => [
      {
        text: 'Double down on the feature power users love',
        effects: (s) => ({
          ...s,
          product: s.product + 8,
          customers: Math.max(0, Math.round(s.customers * 0.85)),
          totalMRR: Math.round((s.totalMRR ?? 0) * 0.9),
          revenue: Math.round((s.revenue ?? 0) * 0.9),
          churn: Math.max(3, s.churn - 1.5),
        }),
        feedback: 'Lost 15% of users, remaining ones are 3x more engaged. Revenue dipped but trajectory changed.',
      },
      {
        text: 'Fix the activation bottleneck',
        effects: (s) => ({
          ...s,
          product: s.product + 5,
          activationRate: Math.min(90, (s.activationRate ?? 50) + 10),
          conversionRate: Math.min(30, s.conversionRate + 2),
        }),
        feedback: 'Activation jumped 10 points. You didn\'t need more users — you needed to stop losing the ones you had at the door.',
      },
      {
        text: 'Rewrite marketing for the persona that actually converts',
        effects: (s) => ({
          ...s,
          cac: Math.max(30, (s.cac || 80) - 15),
          pipeline: s.pipeline + 6,
          conversionRate: Math.min(30, s.conversionRate + 1),
        }),
        feedback: 'CAC dropped. Specific messaging speaks to someone. Generic messaging speaks to everyone and convinces nobody.',
      },
    ],
  },

  // ─── PHASE 3: Growth (Months 6-12) ───

  {
    id: 'inflection',
    months: [7, 8, 9],
    title: 'The Inflection Point',
    text: 'Something changed. People reach out instead of the other way around. It\'s not easier, just different. A corner might be turning.',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        pipeline: Math.max(2, s.pipeline - 5),
        product: Math.max(10, s.product - 2),
      }),
      feedback: 'The window opened and you didn\'t walk through it. Inbound interest dried up as fast as it appeared. Momentum is perishable.',
    },
    getChoices: () => [
      {
        text: 'Pour fuel on it — 2x spend, accelerate',
        dynamicFeedback: (s) => (s.product ?? 30) > 40
          ? 'It was real. Growth compounded. This is what finding the moment feels like.'
          : 'It was a blip. You scaled spend before validating. Burn jumped, growth didn\'t follow.',
        effects: (s) => (s.product ?? 30) > 40
          ? {
              ...s,
              pipeline: s.pipeline + 15,
              customers: s.customers + 4,
              totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 49) * 4,
              revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 49) * 4,
              burnRate: s.burnRate + 3000,
              product: s.product + 3,
            }
          : {
              ...s,
              burnRate: s.burnRate + 3000,
              customers: s.customers + 1,
              totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 49),
              revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 49),
              product: Math.max(10, s.product - 3),
            },
      },
      {
        text: 'Validate — is this a trend or a blip? 4 more weeks.',
        effects: (s) => ({
          ...s,
          product: s.product + 4,
          conversionRate: Math.min(30, s.conversionRate + 1),
        }),
        feedback: '4 weeks later: real, but concentrated in one segment. The patience bought you precision.',
      },
      {
        text: 'Fundraise on the momentum',
        dynamicFeedback: (s) => (s.totalMRR ?? 0) > 1500
          ? '€80K raised on real numbers. Smart timing — investors fund trajectories, not snapshots.'
          : '€30K raised on a story. Less than hoped, but the process sharpened your pitch.',
        effects: (s) => (s.totalMRR ?? 0) > 1500
          ? { ...s, cash: s.cash + 80000 }
          : { ...s, cash: s.cash + 30000 },
      },
    ],
  },

  {
    id: 'team_burnout',
    months: [6, 7, 8, 9],
    title: 'Team Burnout',
    getText: (s) => {
      const months = s.month ?? 6;
      return `Month ${months}. Jonas hasn't taken a day off since launch. Mira works weekends. The energy that made the first months electric is becoming something brittle.`;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        product: Math.max(10, s.product - 4),
        churn: Math.min(20, s.churn + 1),
        maxAP: Math.max(2, (s.maxAP ?? 3) - 1),
      }),
      feedback: 'You pushed through. The output dropped anyway. Bugs slip through. Customer replies take 3 days. You lost an AP — exhaustion has a concrete cost.',
    },
    getChoices: () => [
      {
        text: 'Forced 1-week break for the whole team',
        effects: (s) => ({
          ...s,
          product: s.product + 2,
          churn: Math.min(20, s.churn + 0.5),
        }),
        feedback: 'A week of silence. Support tickets pile up. But when everyone comes back, the clarity is palpable. Sometimes stopping IS the productive choice.',
      },
      {
        text: 'Hire to reduce the load',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 3500,
          product: s.product + 2,
          teamSize: (s.teamSize ?? 2) + 1,
        }),
        feedback: 'New hire takes 6 weeks to ramp. But the ceiling just got higher. Burn jumped — make sure revenue follows.',
      },
      {
        text: 'Cut scope — do 30% less, but sustainably',
        effects: (s) => ({
          ...s,
          product: s.product + 1,
          pipeline: Math.max(2, s.pipeline - 2),
          churn: Math.max(3, s.churn - 0.5),
        }),
        feedback: 'Fewer features, fewer promises, fewer late nights. The product gets simpler. Some users leave, but the remaining ones get a better product.',
      },
    ],
  },

  {
    id: 'scale_decision',
    months: [8, 9, 10, 11],
    title: 'The Scaling Question',
    text: 'Things are working. Not perfectly, not consistently, but working. The question isn\'t whether to grow — it\'s how.',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        churn: Math.min(20, s.churn + 1),
        pipeline: Math.max(2, s.pipeline - 3),
        burnRate: s.burnRate + 300,
      }),
      feedback: 'You didn\'t decide how to scale. Your team built what they thought was right. Your best customer asked for a roadmap. You didn\'t have one.',
    },
    getChoices: () => [
      {
        text: 'Go upmarket — enterprise, higher ACV',
        effects: (s) => ({
          ...s,
          totalMRR: (s.totalMRR ?? 0) + 1500,
          revenue: (s.revenue ?? 0) + 1500,
          burnRate: s.burnRate + 2500,
          customers: s.customers + 1,
          product: s.product + 2,
          cac: (s.cac || 80) + 40,
        }),
        feedback: 'First enterprise client pays more than 20 SMBs. But SLAs, integrations, QBRs. You\'re building a different company now.',
      },
      {
        text: 'Go wider — new vertical, same product',
        effects: (s) => ({
          ...s,
          customers: s.customers + 3,
          totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 49) * 3,
          revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 49) * 3,
          burnRate: s.burnRate + 1500,
          conversionRate: Math.max(3, s.conversionRate - 2),
          pipeline: s.pipeline + 6,
        }),
        feedback: 'New segment, different expectations. Conversion dropped. "Same product, new market" is never actually the same product.',
      },
      {
        text: 'Go deeper — more value for existing users',
        effects: (s) => ({
          ...s,
          product: s.product + 7,
          churn: Math.max(3, s.churn - 2),
          totalMRR: Math.round((s.totalMRR ?? 0) * 1.15),
          revenue: Math.round((s.revenue ?? 0) * 1.15),
        }),
        feedback: 'Users pay more, churn less. LTV improved without changing CAC. The quiet path to profitability.',
      },
    ],
  },

  {
    id: 'fundraise_angel',
    months: [6, 7, 8, 9],
    title: 'Angel Investment Opportunity',
    getText: (s) => {
      const mrr = s.totalMRR ?? 0;
      return `An angel investor saw your LinkedIn post. She wants to meet. You have ${mrr > 0 ? `€${mrr} MRR` : 'no revenue yet'} and a story. Is it enough?`;
    },
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You didn\'t take the meeting. Maybe the timing wasn\'t right. But meetings with people who write checks are never wasted.',
    },
    getChoices: () => [
      {
        text: 'Take the meeting — pitch for €100K',
        dynamicFeedback: (s) => {
          const mrr = s.totalMRR ?? 0;
          const product = s.product ?? 30;
          const fundRate = s.founderMods?.fundraisingSuccessRate ?? 1;
          const fundAmt = s.founderMods?.fundraisingAmountMultiplier ?? 1;
          // Lower fundraising rate = higher thresholds needed
          const mrrThreshHigh = Math.round(1000 / Math.max(0.3, fundRate));
          const mrrThreshLow = Math.round(500 / Math.max(0.3, fundRate));
          if (mrr > mrrThreshHigh && product > 35) {
            const amount = Math.round(100000 * fundAmt);
            return `She's in. €${(amount/1000).toFixed(0)}K for ${Math.round(8/fundAmt)}% equity.${fundRate < 0.8 ? ' It took twice as many meetings as it should have.' : ''} But the cash buys you oxygen.`;
          }
          if (mrr > mrrThreshLow || product > 40) {
            const amount = Math.round(50000 * fundAmt);
            return `€${(amount/1000).toFixed(0)}K. She likes the product but wants more traction.${fundRate < 0.8 ? ' The meeting felt harder than it should have been.' : ''}`;
          }
          return `She passed.${fundRate < 0.8 ? ' You noticed the questions focused on risks, not opportunity.' : ''} "Come back with more traction."`;
        },
        effects: (s) => {
          const mrr = s.totalMRR ?? 0;
          const product = s.product ?? 30;
          const fundRate = s.founderMods?.fundraisingSuccessRate ?? 1;
          const fundAmt = s.founderMods?.fundraisingAmountMultiplier ?? 1;
          const mrrThreshHigh = Math.round(1000 / Math.max(0.3, fundRate));
          const mrrThreshLow = Math.round(500 / Math.max(0.3, fundRate));
          if (mrr > mrrThreshHigh && product > 35) return { ...s, cash: s.cash + Math.round(100000 * fundAmt), burnRate: s.burnRate + 200 };
          if (mrr > mrrThreshLow || product > 40) return { ...s, cash: s.cash + Math.round(50000 * fundAmt) };
          return { ...s, product: s.product + 1 };
        },
      },
      {
        text: 'Take the meeting but don\'t pitch — just learn',
        effects: (s) => ({
          ...s,
          product: s.product + 2,
          pipeline: s.pipeline + 3,
        }),
        feedback: 'She introduced you to 3 restaurant owners in her network. No check, but warm leads from a credible source. Sometimes the network is worth more.',
      },
    ],
  },

  {
    id: 'competitor_move',
    months: [7, 8, 9, 10],
    title: 'The Competitor',
    getText: (s) => {
      const customers = s.customers ?? 0;
      return `A competitor launched a free version of your core feature. Your ${customers} customers haven't noticed yet. But they will.`;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        churn: Math.min(20, s.churn + 2),
        pipeline: Math.max(2, s.pipeline - 4),
      }),
      feedback: 'You pretended they don\'t exist. Two customers asked about it. You didn\'t have a good answer. The silence said everything.',
    },
    getChoices: () => [
      {
        text: 'Differentiate — build what they can\'t copy',
        effects: (s) => ({
          ...s,
          product: s.product + 6,
          burnRate: s.burnRate + 500,
          churn: Math.max(3, s.churn - 0.5),
        }),
        feedback: 'Deep integrations and industry-specific workflows. Harder to build, harder to copy. The moat gets a little wider.',
      },
      {
        text: 'Compete on service — make switching unthinkable',
        effects: (s) => ({
          ...s,
          churn: Math.max(3, s.churn - 2),
          supportCost: (s.supportCost ?? 5) + 3,
          burnRate: s.burnRate + 800,
        }),
        feedback: 'Every customer gets a named contact. Response time under 2 hours. It\'s expensive but no one is leaving.',
      },
      {
        text: 'Ignore them — focus on your own users',
        effects: (s) => ({
          ...s,
          product: s.product + 3,
          churn: Math.min(20, s.churn + 0.5),
        }),
        feedback: 'Discipline. But two prospects chose them because "free." You need to win on value, not just ignore the market.',
      },
    ],
  },

  // ─── PHASE 4: Maturity (Months 10-18) ───

  {
    id: 'enterprise_vs_smb',
    months: [10, 11, 12, 13],
    title: 'Enterprise vs. SMB',
    text: 'Your biggest customer pays 10x your average. Your smallest 50 customers pay 2x total. Which direction is the business?',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        churn: Math.min(20, s.churn + 1),
        product: Math.max(10, s.product - 1),
      }),
      feedback: 'You served both and pleased neither. Enterprise wanted dedicated support. SMBs wanted simpler onboarding. You delivered a compromise nobody loved.',
    },
    getChoices: () => [
      {
        text: 'All in on enterprise — fewer, bigger deals',
        effects: (s) => ({
          ...s,
          price: Math.round((s.price ?? 49) * 2.5),
          mrrPerCustomer: Math.round((s.mrrPerCustomer || 49) * 2.5),
          totalMRR: Math.round((s.totalMRR ?? 0) * 1.3),
          revenue: Math.round((s.revenue ?? 0) * 1.3),
          customers: Math.max(1, Math.round(s.customers * 0.4)),
          churn: Math.max(3, s.churn - 2),
          cac: (s.cac || 80) + 60,
          burnRate: s.burnRate + 2000,
          product: s.product + 3,
        }),
        feedback: 'Lost 60% of customers. MRR went UP. Enterprise churn is lower. But your pipeline just became 5 companies, not 50.',
      },
      {
        text: 'Double down on SMB — self-serve, low touch',
        effects: (s) => ({
          ...s,
          cac: Math.max(20, (s.cac || 80) - 25),
          pipeline: s.pipeline + 10,
          conversionRate: Math.min(30, s.conversionRate + 3),
          product: s.product + 4,
          burnRate: s.burnRate + 500,
        }),
        feedback: 'Self-serve onboarding reduced CAC by 30%. Pipeline opened up. But LTV per customer stays low. It\'s a volume game now.',
      },
      {
        text: 'Two tiers — SMB self-serve, enterprise high-touch',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 1500,
          product: Math.max(10, s.product - 1),
          pipeline: s.pipeline + 4,
        }),
        feedback: 'Two products, one team. Engineering velocity dropped. But revenue diversification reduces concentration risk.',
      },
    ],
  },

  {
    id: 'key_customer_risk',
    months: [10, 11, 12, 13],
    title: 'Key Customer at Risk',
    getText: (s) => {
      const mrr = s.totalMRR ?? 0;
      const loss = Math.round(mrr * 0.25);
      return `Your biggest customer represents 25% of MRR. They're restructuring. Their new CTO "wants to evaluate alternatives." That's €${loss}/mo at risk.`;
    },
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        customers: Math.max(0, s.customers - 1),
        totalMRR: Math.round((s.totalMRR ?? 0) * 0.75),
        revenue: Math.round((s.revenue ?? 0) * 0.75),
        churn: Math.min(20, s.churn + 1),
      }),
      feedback: 'They left. 25% of MRR gone overnight. Concentration risk is the silent killer nobody talks about until it happens.',
    },
    getChoices: () => [
      {
        text: 'Fight for it — on-site meeting, custom roadmap',
        dynamicFeedback: (s) => (s.product ?? 30) > 45
          ? 'They stayed. Your product is too embedded in their workflows. But you just spent 2 AP on one customer.'
          : 'They stayed for now. But the custom roadmap commits you to 3 months of features only they need.',
        effects: (s) => (s.product ?? 30) > 45
          ? { ...s, product: s.product + 2, churn: Math.max(3, s.churn - 0.5) }
          : { ...s, burnRate: s.burnRate + 1000, product: Math.max(10, s.product - 2) },
      },
      {
        text: 'Let them go — diversify instead',
        effects: (s) => ({
          ...s,
          customers: Math.max(0, s.customers - 1),
          totalMRR: Math.round((s.totalMRR ?? 0) * 0.75),
          revenue: Math.round((s.revenue ?? 0) * 0.75),
          pipeline: s.pipeline + 8,
          cac: Math.max(30, (s.cac || 80) - 10),
        }),
        feedback: 'Painful. But 25% concentration was the real problem. You redirected that energy into pipeline. Healthier long-term.',
      },
    ],
  },

  {
    id: 'profitability_crossroads',
    months: [11, 12, 13, 14],
    title: 'Profitability vs. Growth',
    getText: (s) => {
      const mrr = s.totalMRR ?? 0;
      const burn = s.totalBurn ?? s.burnRate ?? 8000;
      const gap = burn - mrr;
      return gap > 0
        ? `You burn €${gap}/mo more than you earn. Cut costs to break even, or invest to grow faster?`
        : `You\'re close to break-even. €${mrr} MRR vs €${burn} burn. Push for profitability or reinvest?`;
    },
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        burnRate: s.burnRate + 500,
      }),
      feedback: 'Costs crept up. No deliberate choice about the trade-off. The default is always "spend more" — that\'s gravity.',
    },
    getChoices: () => [
      {
        text: 'Cut to profitability — sustainable > scalable',
        effects: (s) => ({
          ...s,
          burnRate: Math.max(5000, s.burnRate - 3000),
          product: Math.max(10, s.product - 2),
          pipeline: Math.max(2, s.pipeline - 3),
        }),
        feedback: 'Burn dropped. You let the freelancer go, cancelled 4 SaaS tools, moved to a cheaper office. It hurts but the runway doubled.',
      },
      {
        text: 'Invest in growth — raise or die trying',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 2000,
          pipeline: s.pipeline + 8,
          customers: s.customers + 2,
          totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 49) * 2,
          revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 49) * 2,
        }),
        feedback: 'Spending into growth. Revenue is growing but so is burn. You need the growth rate to outrun the cash drain.',
      },
      {
        text: 'Optimize unit economics first, then grow',
        effects: (s) => ({
          ...s,
          churn: Math.max(3, s.churn - 1),
          cac: Math.max(30, (s.cac || 80) - 15),
          product: s.product + 3,
        }),
        feedback: 'Boring work: churn analysis, CAC optimization, onboarding improvement. No press release. But LTV:CAC improved 20%.',
      },
    ],
  },

  {
    id: 'series_a_readiness',
    months: [12, 13, 14, 15],
    title: 'Series A Readiness',
    getText: (s) => {
      const mrr = s.totalMRR ?? 0;
      const churn = s.churn ?? 5;
      const ltvCac = s.ltvCacRatio ?? 0;
      return `A VC firm noticed you. They want to see: €10K+ MRR (you have €${mrr}), <5% churn (you have ${churn}%), LTV:CAC > 3 (you have ${ltvCac}x). How close are you?`;
    },
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You didn\'t engage. The VC moved on. These windows don\'t stay open — warm interest cools fast.',
    },
    getChoices: () => [
      {
        text: 'Start the fundraise — commit 2 months',
        dynamicFeedback: (s) => {
          const mrr = s.totalMRR ?? 0;
          const churn = s.churn ?? 10;
          const ltvCac = s.ltvCacRatio ?? 0;
          const fundRate = s.founderMods?.fundraisingSuccessRate ?? 1;
          const fundAmt = s.founderMods?.fundraisingAmountMultiplier ?? 1;
          const tone = s.founderMods?.investorTone ?? 'neutral';
          // Adjust thresholds based on fundraising rate
          const t1 = Math.round(8000 / Math.max(0.3, fundRate));
          const t2 = Math.round(4000 / Math.max(0.3, fundRate));
          const toneNote = tone === 'prevention' ? ' The partners kept asking about downside scenarios.' : '';
          if (mrr > t1 && churn < 6 && ltvCac > 2.5) {
            const amount = Math.round(500000 * fundAmt);
            return `€${(amount/1000).toFixed(0)}K raised.${toneNote} The cash changes everything — and so do the expectations.`;
          }
          if (mrr > t2 || (churn < 7 && ltvCac > 2)) {
            const amount = Math.round(200000 * fundAmt);
            return `€${(amount/1000).toFixed(0)}K bridge round.${toneNote} Not a full Series A but it buys time.`;
          }
          return `They passed.${toneNote} Two months of distracted leadership for nothing. But you know what they need to see.`;
        },
        effects: (s) => {
          const mrr = s.totalMRR ?? 0;
          const churn = s.churn ?? 10;
          const ltvCac = s.ltvCacRatio ?? 0;
          const fundRate = s.founderMods?.fundraisingSuccessRate ?? 1;
          const fundAmt = s.founderMods?.fundraisingAmountMultiplier ?? 1;
          const t1 = Math.round(8000 / Math.max(0.3, fundRate));
          const t2 = Math.round(4000 / Math.max(0.3, fundRate));
          if (mrr > t1 && churn < 6 && ltvCac > 2.5)
            return { ...s, cash: s.cash + Math.round(500000 * fundAmt), burnRate: s.burnRate + 500 };
          if (mrr > t2 || (churn < 7 && ltvCac > 2))
            return { ...s, cash: s.cash + Math.round(200000 * fundAmt) };
          return { ...s, product: Math.max(10, s.product - 2) };
        },
      },
      {
        text: '"Not yet" — get metrics right first',
        effects: (s) => ({
          ...s,
          product: s.product + 3,
          conversionRate: Math.min(30, s.conversionRate + 1),
        }),
        feedback: 'Discipline. You know you\'re not ready. Better to come back strong than to fumble the pitch.',
      },
    ],
  },

  // ─── PHASE 5: Late Game (Months 14-24) ───

  {
    id: 'acquihire_offer',
    months: [14, 15, 16, 17],
    title: 'Acqui-hire Offer',
    getText: (s) => {
      const cash = s.cash ?? 0;
      return `A mid-size food-tech company wants to buy your team. Offer: €200K + jobs for everyone. Your cash is €${cash.toLocaleString('de-DE')}. `;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You didn\'t respond. The offer expired. Whether that\'s the right call depends on what the next 6 months look like.',
    },
    getChoices: () => [
      {
        text: 'Take it — this is the responsible exit',
        effects: (s) => ({
          ...s,
          cash: s.cash + 200000,
          // Game effectively ends well
        }),
        feedback: 'You took the offer. Not the outcome you dreamed of, but everyone gets paid, nobody goes bankrupt, and the tech lives on.',
      },
      {
        text: 'Decline — we\'re building something bigger',
        dynamicFeedback: (s) => (s.totalMRR ?? 0) > 5000
          ? 'Bold, but the numbers support it. Your MRR trajectory says the acqui-hire undervalued you.'
          : 'Bold. Possibly reckless. Your MRR doesn\'t yet justify the bet. But then again, neither did most successful startups at this stage.',
        effects: (s) => ({
          ...s,
          product: s.product + 2,
        }),
      },
      {
        text: 'Counter: strategic partnership instead of acquisition',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 10,
          customers: s.customers + 3,
          totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 49) * 3,
          revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 49) * 3,
        }),
        feedback: 'They agreed to a distribution deal. Their 200 restaurant clients get introduced to your product. No acquisition, but a channel that money can\'t buy.',
      },
    ],
  },

  {
    id: 'key_person_departure',
    months: [14, 15, 16, 17, 18],
    title: 'Key Person Departure',
    text: 'Your best engineer got an offer from a BigTech company. 2.5x the salary. She\'s apologetic but honest — "I need financial security."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        product: Math.max(10, s.product - 5),
        burnRate: Math.max(5000, s.burnRate - 2000),
        teamSize: Math.max(2, (s.teamSize ?? 3) - 1),
      }),
      feedback: 'She left. Institutional knowledge walked out the door. Three features are now maintained by nobody. The codebase just became a risk.',
    },
    getChoices: () => [
      {
        text: 'Match the offer — equity + raise',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 2500,
          product: s.product + 2,
        }),
        feedback: 'She stayed. But the salary bump set a new baseline. The next person to ask will expect the same.',
      },
      {
        text: 'Let her go gracefully + hire replacement',
        effects: (s) => ({
          ...s,
          product: Math.max(10, s.product - 3),
          burnRate: s.burnRate + 500,
          teamSize: Math.max(2, (s.teamSize ?? 3)),
        }),
        feedback: 'She left on good terms. Replacement takes 3 months to ramp. Product velocity drops 40% in the interim.',
      },
      {
        text: 'Counteroffer: 4-day week + meaningful equity',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 800,
          product: s.product + 1,
        }),
        feedback: 'She stayed. Different currency, different value proposition. Not everyone optimizes for salary. But output drops 20% with 4-day weeks.',
      },
    ],
  },

  {
    id: 'market_consolidation',
    months: [16, 17, 18, 19],
    title: 'Market Consolidation',
    text: 'Two of your competitors just merged. The combined entity has 10x your customer base and announced aggressive pricing. The market is shrinking to fewer, bigger players.',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        pipeline: Math.max(2, Math.round(s.pipeline * 0.7)),
        churn: Math.min(20, s.churn + 2),
      }),
      feedback: 'You watched and waited. Pipeline shrunk as prospects chose "the safe bet." Your churn ticked up as customers worried about your longevity.',
    },
    getChoices: () => [
      {
        text: 'Niche down hard — own one segment completely',
        effects: (s) => ({
          ...s,
          product: s.product + 6,
          churn: Math.max(3, s.churn - 2),
          pipeline: Math.max(2, Math.round(s.pipeline * 0.7)),
          conversionRate: Math.min(30, s.conversionRate + 3),
        }),
        feedback: 'Smaller market, higher share. You\'re the obvious choice for fast-casual restaurants. The merged competitor is too generic for your niche.',
      },
      {
        text: 'Compete on innovation — ship what they can\'t',
        effects: (s) => ({
          ...s,
          product: s.product + 5,
          burnRate: s.burnRate + 1500,
          pipeline: s.pipeline + 4,
        }),
        feedback: 'AI demand prediction — your differentiator. Big companies can\'t move this fast. But you\'re betting on a feature advantage that might be temporary.',
      },
      {
        text: 'Approach them — could we be the third piece?',
        dynamicFeedback: (s) => (s.totalMRR ?? 0) > 8000
          ? 'They\'re interested. Your technology is complementary. Acquisition talks begin. Not the exit you planned, but possibly the right one.'
          : 'They passed. "We\'ll build it internally." You just showed your hand without getting a card.',
        effects: (s) => (s.totalMRR ?? 0) > 8000
          ? { ...s, cash: s.cash + 100000, pipeline: s.pipeline + 5 }
          : { ...s, product: Math.max(10, s.product - 1) },
      },
    ],
  },

  {
    id: 'international',
    months: [16, 17, 18, 19, 20],
    title: 'International Expansion',
    text: 'A restaurant group in Vienna wants your product. Then one in Zurich emails. DACH market is calling. But localization, support hours, compliance...',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You stayed local. The DACH inquiries went unanswered. Focus is a valid strategy. But those were warm leads from a market that values German-engineered software.',
    },
    getChoices: () => [
      {
        text: 'Expand to DACH — German-speaking markets first',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 12,
          customers: s.customers + 3,
          totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 49) * 3,
          revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 49) * 3,
          burnRate: s.burnRate + 2000,
          cac: (s.cac || 80) + 20,
        }),
        feedback: 'Three markets, one language (mostly). Pipeline tripled. But support tickets now come at 6am and compliance differs per country.',
      },
      {
        text: 'Single pilot in Vienna — test before committing',
        effects: (s) => ({
          ...s,
          customers: s.customers + 1,
          totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 49),
          revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 49),
          product: s.product + 2,
        }),
        feedback: 'One pilot, clear scope, 3-month evaluation. If it works, you have proof. If it doesn\'t, you learned cheaply.',
      },
    ],
  },

  {
    id: 'the_mirror',
    months: [18, 19, 20, 21],
    title: 'The Mirror',
    getText: (s) => {
      const mrr = s.totalMRR ?? 0;
      const customers = s.customers ?? 0;
      const months = s.month ?? 18;
      return `Month ${months}. €${mrr}/mo MRR, ${customers} customers. Is this a venture-scale business or a profitable lifestyle company? Both are valid. But they require different decisions from here.`;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You avoided the question. But not deciding IS a decision — it\'s choosing the default path, which is usually lifestyle with VC expectations.',
    },
    getChoices: () => [
      {
        text: 'Venture path — growth above everything',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 3000,
          pipeline: s.pipeline + 10,
          customers: s.customers + 2,
          totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 49) * 2,
          revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 49) * 2,
        }),
        feedback: 'All in on growth. Burn jumped. But the MRR trajectory changed. This only works if the unit economics hold at scale.',
      },
      {
        text: 'Lifestyle path — profitability, sustainability',
        effects: (s) => ({
          ...s,
          burnRate: Math.max(5000, s.burnRate - 2500),
          product: s.product + 3,
          churn: Math.max(3, s.churn - 1),
        }),
        feedback: 'Cut to sustainable. No more "growth at all costs." Revenue needs to cover burn. The team is smaller but calmer.',
      },
      {
        text: 'Hybrid — grow efficiently, earn the right to scale',
        effects: (s) => ({
          ...s,
          product: s.product + 2,
          conversionRate: Math.min(30, s.conversionRate + 1),
          churn: Math.max(3, s.churn - 0.5),
        }),
        feedback: 'The middle path. Optimize unit economics while growing. Not as exciting as pure growth. Not as safe as pure profit. But realistic.',
      },
    ],
  },

  {
    id: 'exit_question',
    months: [20, 21, 22, 23],
    title: 'The Exit Question',
    getText: (s) => {
      const mrr = s.totalMRR ?? 0;
      const cash = s.cash ?? 0;
      const customers = s.customers ?? 0;
      return `Month ${s.month}. €${mrr}/mo MRR, ${customers} customers, €${cash.toLocaleString('de-DE')} in the bank. The end of the simulation approaches. What are you building toward?`;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'The clock is ticking. No explicit strategy means you\'re optimizing for survival, not for an outcome.',
    },
    getChoices: () => [
      {
        text: 'Build to sell — maximize metrics for acquisition',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 5,
          product: s.product + 3,
          churn: Math.max(3, s.churn - 0.5),
        }),
        feedback: 'Every decision now filtered through "how does this look to a buyer." Clarifying, if limiting.',
      },
      {
        text: 'Build to last — this is year 1 of 10',
        effects: (s) => ({
          ...s,
          product: s.product + 5,
          churn: Math.max(3, s.churn - 1),
          burnRate: Math.max(5000, s.burnRate - 500),
        }),
        feedback: 'Long game. Invest in product, reduce burn, compound slowly. Not every startup needs a 5-year exit timeline.',
      },
      {
        text: 'Build to raise — prep the Series A pitch',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 8,
          burnRate: s.burnRate + 1000,
          customers: s.customers + 2,
          totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 49) * 2,
          revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 49) * 2,
        }),
        feedback: 'Growth mode. Make the numbers look irresistible for the next round. The pressure shifts from survival to performance.',
      },
    ],
  },
  // ─── RECURRING EVENTS (can fire in empty months) ───

  {
    id: 'support_escalation',
    repeatable: true,
    months: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    title: 'Support Escalation',
    getText: (s) => `Your Slack is blowing up. ${Math.max(1, Math.round((s.customers ?? 5) * 0.2))} customers have the same issue: the inventory sync broke after last night's deploy. They're losing money right now.`,
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        churn: Math.min(20, s.churn + 1.5),
        product: Math.max(10, s.product - 2),
      }),
      feedback: 'It took 48 hours to acknowledge the issue. Two restaurants over-ordered €3K in produce. Trust doesn\'t recover from silence.',
    },
    getChoices: () => [
      {
        text: 'All hands — fix it now, apologize personally',
        effects: (s) => ({
          ...s,
          product: s.product + 3,
          churn: Math.max(3, s.churn - 0.5),
          burnRate: s.burnRate + 200,
        }),
        feedback: 'Fixed in 4 hours. Personal calls to every affected customer. One said "this is why I chose a small company." The crisis became a retention moment.',
      },
      {
        text: 'Roll back the deploy, post a status page update',
        effects: (s) => ({
          ...s,
          product: s.product + 1,
          churn: Math.min(20, s.churn + 0.5),
        }),
        feedback: 'Rolled back in 2 hours. Professional, but impersonal. One customer tweeted about it. Not great.',
      },
    ],
  },

  {
    id: 'upsell_opportunity',
    repeatable: true,
    months: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    title: 'Upsell Opportunity',
    getText: (s) => {
      const mrr = s.mrrPerCustomer || s.price || 49;
      return `Three of your most active customers asked for the same thing: a premium analytics dashboard. They'd pay ${Math.round(mrr * 0.5)} more per month for it.`;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You noted it and moved on. The feature request sits in a spreadsheet next to 40 others. Sometimes the biggest revenue opportunities look like small requests.',
    },
    getChoices: () => [
      {
        text: 'Build it — charge extra for premium tier',
        effects: (s) => ({
          ...s,
          totalMRR: Math.round((s.totalMRR ?? 0) * 1.1),
          revenue: Math.round((s.revenue ?? 0) * 1.1),
          product: s.product + 3,
          burnRate: s.burnRate + 400,
          mrrPerCustomer: Math.round((s.mrrPerCustomer || s.price || 49) * 1.1),
        }),
        feedback: 'Premium tier launched. 30% of existing customers upgraded within 2 weeks. ARPU increased without new acquisition.',
      },
      {
        text: 'Build it free — strengthen the core product',
        effects: (s) => ({
          ...s,
          product: s.product + 5,
          churn: Math.max(3, s.churn - 1),
        }),
        feedback: 'Free for everyone. Product got stickier. Churn dropped. You chose retention over revenue expansion.',
      },
    ],
  },

  {
    id: 'partnership_offer',
    months: [10, 11, 12, 13, 14, 15, 16, 17, 18],
    title: 'Partnership Offer',
    text: 'A POS (Point of Sale) system used by 2,000 restaurants wants to integrate with your product. They want a revenue share deal.',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You didn\'t follow up. The POS company partnered with your competitor instead. Distribution partnerships don\'t wait.',
    },
    getChoices: () => [
      {
        text: 'Accept — 20% revenue share for distribution',
        effects: (s) => {
          const addedMRR = (s.mrrPerCustomer || 49) * 3;
          return {
            ...s,
            pipeline: s.pipeline + 15,
            customers: s.customers + 3,
            totalMRR: Math.round(((s.totalMRR ?? 0) + addedMRR) * 0.85),
            revenue: Math.round(((s.revenue ?? 0) + addedMRR) * 0.85),
            burnRate: s.burnRate + 500,
          };
        },
        feedback: 'Pipeline tripled but you give up 20% forever. Channel partnerships are leverage — and leverage has a cost.',
      },
      {
        text: 'Counter — flat fee per referral, no revenue share',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 8,
          customers: s.customers + 1,
          totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 49),
          revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 49),
        }),
        feedback: 'They agreed to a smaller deal. Less pipeline but you keep your margins. Smart if you can drive your own growth.',
      },
    ],
  },

  {
    id: 'technical_debt',
    months: [9, 10, 11, 12, 13, 14, 15, 16],
    title: 'Technical Debt Reckoning',
    getText: (s) => `The codebase that was "good enough" 6 months ago is now slowing everything down. Deploy times tripled. Bug reports up 40%. Jonas wants 3 weeks to refactor. Mira wants to ship the feature that closes a €${(s.mrrPerCustomer || 49) * 5} deal.`,
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        product: Math.max(10, s.product - 3),
        churn: Math.min(20, s.churn + 0.5),
      }),
      feedback: 'Neither happened. The debt compounded. Next month\'s deploy will be even scarier.',
    },
    getChoices: () => [
      {
        text: 'Refactor — 3 weeks, no new features',
        effects: (s) => ({
          ...s,
          product: s.product + 6,
          churn: Math.min(20, s.churn + 0.5),
        }),
        feedback: 'Three weeks of invisible work. Users noticed nothing. Engineers noticed everything. Ship speed doubled after the cleanup.',
      },
      {
        text: 'Ship the feature, schedule refactor for "later"',
        effects: (s) => ({
          ...s,
          customers: s.customers + 1,
          totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 49),
          revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 49),
          product: Math.max(10, s.product - 2),
        }),
        feedback: 'Deal closed. Codebase got worse. "Later" is startup code for "never." But revenue is real and debt is abstract.',
      },
      {
        text: 'Parallel: hire a contractor for refactoring',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 2000,
          product: s.product + 3,
        }),
        feedback: 'Expensive but both happened. The contractor found 3 security issues nobody knew about. Money well spent.',
      },
    ],
  },

  {
    id: 'cash_crunch',
    repeatable: true,
    months: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    title: 'The Cash Conversation',
    getText: (s) => {
      const runway = s.runway ?? 12;
      const cash = s.cash ?? 50000;
      return runway < 6
        ? `${runway} months of runway. You and Mira had THE conversation last night. The one where you look at the bank account and do the math in silence.`
        : `€${cash.toLocaleString('de-DE')} in the bank. You're not dying, but you're not comfortable either. Time to make a conscious choice about the next 6 months.`;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        burnRate: s.burnRate + 300,
      }),
      feedback: 'Costs crept up again. The default is always "spend more." Financial discipline requires active decisions.',
    },
    getChoices: () => [
      {
        text: 'Emergency cost cuts — survive at all costs',
        effects: (s) => ({
          ...s,
          burnRate: Math.max(5000, s.burnRate - 2500),
          product: Math.max(10, s.product - 2),
          pipeline: Math.max(2, s.pipeline - 3),
        }),
        feedback: 'Cut marketing, cancelled tools, reduced everything non-essential. Runway extended 4+ months. Growth slowed, but you\'re alive.',
      },
      {
        text: 'Revenue push — 100% focus on closing deals',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 6,
          customers: s.customers + 1,
          totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 49),
          revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 49),
          product: Math.max(10, s.product - 1),
        }),
        feedback: 'All energy on sales. Product roadmap frozen. One new deal closed, pipeline growing. But the product isn\'t getting better.',
      },
      {
        text: 'Bridge round — find €50K to buy 6 months',
        dynamicFeedback: (s) => (s.totalMRR ?? 0) > 2000
          ? 'Closed a €50K bridge in 2 weeks. Your metrics told a story worth betting on.'
          : 'Took 6 weeks and a lot of rejection. €25K from an old contact. Better than nothing.',
        effects: (s) => (s.totalMRR ?? 0) > 2000
          ? { ...s, cash: s.cash + 50000 }
          : { ...s, cash: s.cash + 25000 },
      },
    ],
  },
];
