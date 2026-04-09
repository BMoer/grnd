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
    id: 'first_feedback',
    speaker: 'Lisa, Restaurant Owner',
    speakerRole: 'Beta User',
    months: [1, 2, 3],
    title: 'The First Honest Feedback',
    text: '"I like your tool but I\'m using maybe 10% of it. The rest confuses me. My sous chef refuses to touch it." Lisa is one of your first 5 users. She\'s being kind. Others just left quietly.',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, product: Math.max(10, s.product - 4), churn: Math.min(20, s.churn + 1.5) }),
      feedback: 'You thanked her and changed nothing. The problem she named got worse. Two more users hit the same wall and left without telling you why.',
    },
    getChoices: () => [
      {
        text: 'Cut features aggressively — do one thing brilliantly',
        dynamicFeedback: (s) => (s.customers ?? 0) > 8
          ? 'You killed 6 features. Three customers who used those features are angry. One left. But the core experience improved dramatically. Risky with a larger customer base — some of them depended on what you removed.'
          : 'You killed 6 features. With only a few customers, nobody missed them. The core experience improved dramatically. Easier to simplify early than late.',
        effects: (s) => (s.customers ?? 0) > 8
          ? { ...s, product: s.product + 6, churn: Math.min(20, s.churn + 1), customers: Math.max(0, s.customers - 1) }
          : { ...s, product: s.product + 8, churn: Math.max(3, s.churn - 0.5) },
      },
      {
        text: 'Keep the features but redesign the onboarding flow',
        effects: (s) => ({
          ...s,
          product: s.product + 4,
          burnRate: s.burnRate + 300,
          activationRate: Math.min(90, (s.activationRate ?? 50) + 8),
        }),
        feedback: 'Two weeks rebuilding the first-run experience. Lisa\'s sous chef completed onboarding on the second try. "Oh, NOW I see it." The features were fine \u2014 the problem was the door, not the room.',
      },
      {
        text: 'Ask 10 users which ONE thing they\'d keep if they could only keep one',
        effects: (s) => ({
          ...s,
          product: s.product + 5,
          conversionRate: Math.min(30, s.conversionRate + 1),
        }),
        feedback: '7 out of 10 named the same feature. Not the one you expected. The data is humbling but clarifying. You still have to decide what to do with this information.',
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
        dynamicFeedback: (s) => (s.pipeline ?? 12) < 8
          ? 'Product improved, but your pipeline dried up. Good product nobody knows about is a tree falling in an empty forest.'
          : 'Jonas isn\'t happy but trusts the logic. Two weeks later, activation rate jumped. Hard to argue with that.',
        effects: (s) => (s.pipeline ?? 12) < 8
          ? { ...s, product: s.product + 7, pipeline: Math.max(2, s.pipeline - 3), churn: Math.max(3, s.churn - 0.5) }
          : { ...s, product: s.product + 7, churn: Math.max(3, s.churn - 0.5), activationRate: Math.min(90, (s.activationRate ?? 50) + 5) },
      },
      {
        text: 'Sales first — "revenue validates faster than features"',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 10, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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
          pipeline: s.pipeline + 4, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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
        apCost: 2,
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
        apCost: 2,
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
        feedback: 'Moved on both fronts, neither with full conviction. The weekly standup between interview notes and sprint tasks felt productive. Whether it was is a different question.',
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
          if ((s.product ?? 30) > threshold) {
            // Grant approved — cash arrives in 2 months
            const pending = [...(s.pendingEffects ?? []), { month: (s.month ?? 0) + 2, changes: { cash: 50000 } }];
            return { ...s, pendingEffects: pending, burnRate: s.burnRate + 200 };
          }
          return { ...s, product: s.product + 2 };
        },
      },
      {
        text: 'Apply but keep building — Jonas writes, Mira codes',
        effects: (s) => {
          const approved = Math.random() > 0.5;
          if (approved) {
            const pending = [...(s.pendingEffects ?? []), { month: (s.month ?? 0) + 2, changes: { cash: 50000 } }];
            return { ...s, pendingEffects: pending, product: s.product + 1, _grantApproved: true };
          }
          return { ...s, product: s.product + 1, _grantApproved: false };
        },
        dynamicFeedback: (s) => s._grantApproved
          ? 'Split attention, mediocre application. But it got approved — €50K arrives in 2 months.'
          : 'Split attention, mediocre application. Rejected. The time spent was wasted.',
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
        apCost: 2,
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
        apCost: 2,
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
        dynamicFeedback: (s) => (s.product ?? 30) < 35
          ? 'Hired. But Jonas spent 60% of his time onboarding instead of building. Net velocity actually DROPPED for 2 months. Hiring when the product isn\'t ready means teaching someone to build the wrong thing.'
          : 'Hired. €3K upfront. Takes 6 weeks to ramp. But the backlog starts moving and Jonas can finally think instead of just code.',
        effects: (s) => (s.product ?? 30) < 35
          ? { ...s, cash: s.cash - 3000, burnRate: s.burnRate + 3500, product: s.product + 1, teamSize: (s.teamSize ?? 2) + 1 }
          : { ...s, cash: s.cash - 3000, burnRate: s.burnRate + 3500, product: s.product + 4, teamSize: (s.teamSize ?? 2) + 1 },
      },
      {
        text: 'Customer success person — reduce churn',
        effects: (s) => ({
          ...s,
          cash: s.cash - 2500, // recruitment
          burnRate: s.burnRate + 3000,
          churn: Math.max(3, s.churn - 1.5),
          supportCost: Math.max(2, (s.supportCost ?? 5) - 2),
          teamSize: (s.teamSize ?? 2) + 1,
          activationRate: Math.min(90, (s.activationRate ?? 50) + 5),
        }),
        feedback: 'Hired. €2.5K recruitment cost. She calls every user who goes quiet. Churn drops. This is the unsexy work that compounds.',
      },
      {
        text: 'Part-time sales freelancer — grow pipeline',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 2000,
          pipeline: s.pipeline + 8, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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
        apCost: 2,
        dynamicFeedback: (s) => (s.customers ?? 0) > 15
          ? 'You called 20 people. Took a full week. The insights are gold, but you shipped nothing else this month. At scale, personal calls don\'t work — you need systems.'
          : '8 out of 15 replied. Same pattern: onboarding is confusing and the core value takes 3 weeks to see. Now you know where to dig.',
        effects: (s) => (s.customers ?? 0) > 15
          ? { ...s, churn: Math.max(3, s.churn - 1), product: s.product + 4, pipeline: Math.max(2, s.pipeline - 2) }
          : { ...s, churn: Math.max(3, s.churn - 2), product: s.product + 6, conversionRate: Math.min(30, s.conversionRate + 1) },
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
        apCost: 2,
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
          pipeline: s.pipeline + 6, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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
        apCost: 2,
        dynamicFeedback: (s) => (s.product ?? 30) > 40
          ? 'It was real. Growth compounded. This is what finding the moment feels like.'
          : 'It was a blip. You scaled spend before validating. Burn jumped, growth didn\'t follow.',
        effects: (s) => (s.product ?? 30) > 40
          ? {
              ...s,
              pipeline: s.pipeline + 15, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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
        feedback: '4 weeks later: the inbound was real, but concentrated in fast-casual. The patience bought you a wedge — one segment where you\'re the obvious choice.',
      },
      {
        text: 'Fundraise on the momentum',
        apCost: 2,
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
        apCost: 2,
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
        apCost: 2,
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
          pipeline: s.pipeline + 6, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
        }),
        feedback: 'New segment, different expectations. Conversion dropped. "Same product, new market" is never actually the same product.',
      },
      {
        text: 'Go deeper — more value for existing users',
        dynamicFeedback: (s) => (s.customers ?? 0) < 10
          ? 'You\'re deepening a product for 8 people. The improvements are real but the market signal is thin. Are these 8 representative or just early adopters?'
          : 'Users pay more, churn less. LTV improved without changing CAC. The quiet path to profitability.',
        effects: (s) => (s.customers ?? 0) < 10
          ? { ...s, product: s.product + 5, churn: Math.max(3, s.churn - 1) }
          : { ...s, product: s.product + 7, churn: Math.max(3, s.churn - 2), totalMRR: Math.round((s.totalMRR ?? 0) * 1.15), revenue: Math.round((s.revenue ?? 0) * 1.15) },
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
        apCost: 2,
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
          pipeline: s.pipeline + 3, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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
        apCost: 2,
        dynamicFeedback: (s) => (s.runway ?? 12) < 6
          ? 'You spent 2 months building a moat while running out of cash. The feature is great. The timing wasn\'t. Moats don\'t matter if you drown first.'
          : 'Deep integrations and industry-specific workflows. Harder to build, harder to copy. The moat gets a little wider.',
        effects: (s) => (s.runway ?? 12) < 6
          ? { ...s, product: s.product + 6, burnRate: s.burnRate + 500, cash: s.cash - 2000 }
          : { ...s, product: s.product + 6, burnRate: s.burnRate + 500, churn: Math.max(3, s.churn - 0.5) },
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
        apCost: 2,
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
          pipeline: s.pipeline + 10, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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
          pipeline: s.pipeline + 4, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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
        apCost: 2,
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
          pipeline: s.pipeline + 8, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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
        apCost: 2,
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 2000,
          pipeline: s.pipeline + 8, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
          customers: s.customers + 2,
          totalMRR: (s.totalMRR ?? 0) + (s.mrrPerCustomer || 49) * 2,
          revenue: (s.revenue ?? 0) + (s.mrrPerCustomer || 49) * 2,
        }),
        feedback: 'Spending into growth. Revenue is growing but so is burn. You need the growth rate to outrun the cash drain.',
      },
      {
        text: 'Optimize unit economics first, then grow',
        dynamicFeedback: (s) => (s.ltvCacRatio ?? 0) > 3
          ? 'Your unit economics are already healthy. Optimizing further has diminishing returns. This felt productive but you were polishing something that was already shining.'
          : 'Boring work: churn analysis, CAC optimization, onboarding improvement. No press release. But LTV:CAC improved 20%. When economics are broken, this is the highest-leverage work.',
        effects: (s) => (s.ltvCacRatio ?? 0) > 3
          ? { ...s, churn: Math.max(3, s.churn - 0.3), product: s.product + 1 }
          : { ...s, churn: Math.max(3, s.churn - 1), cac: Math.max(30, (s.cac || 80) - 15), product: s.product + 3 },
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
        apCost: 2,
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
    saasOnly: true,
    months: [16, 17, 18],
    title: 'Acqui-hire Offer',
    getText: (s) => {
      const cash = s.cash ?? 0;
      return `A mid-size food-tech company wants to buy your team. Offer: €200K + jobs for everyone. Your cash is €${cash.toLocaleString('en-US')}. `;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You didn\'t respond. The offer expired. Whether that\'s the right call depends on what the next 6 months look like.',
    },
    getChoices: () => [
      {
        text: 'Take it — this is the responsible exit',
        dynamicFeedback: (s) => (s.totalMRR ?? 0) > 3000
          ? 'You sold a business doing €' + (s.totalMRR ?? 0) + '/mo for a flat €200K. The math says you left money on the table. But certainty has value too.'
          : 'You took the offer. Not the outcome you dreamed of, but everyone gets paid, nobody goes bankrupt, and the tech lives on.',
        effects: (s) => ({
          ...s,
          cash: s.cash + 200000,
          acquired: true,
        }),
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
          pipeline: s.pipeline + 10, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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
    saasOnly: true,
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
        apCost: 2,
        effects: (s) => ({
          ...s,
          product: s.product + 5,
          burnRate: s.burnRate + 1500,
          pipeline: s.pipeline + 4, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
        }),
        feedback: 'AI demand prediction — your differentiator. Big companies can\'t move this fast. But you\'re betting on a feature advantage that might be temporary.',
      },
      {
        text: 'Approach them — could we be the third piece?',
        dynamicFeedback: (s) => (s.totalMRR ?? 0) > 8000
          ? 'They\'re interested. Your technology is complementary. Acquisition talks begin. Not the exit you planned, but possibly the right one.'
          : 'They passed. "We\'ll build it internally." You just showed your hand without getting a card.',
        effects: (s) => (s.totalMRR ?? 0) > 8000
          ? { ...s, cash: s.cash + 100000, pipeline: s.pipeline + 5, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5) }
          : { ...s, product: Math.max(10, s.product - 1) },
      },
    ],
  },

  {
    id: 'international',
    saasOnly: true,
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
        apCost: 2,
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 12, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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
        apCost: 2,
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 3000,
          pipeline: s.pipeline + 10, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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
      return `Month ${s.month}. €${mrr}/mo MRR, ${customers} customers, €${cash.toLocaleString('en-US')} in the bank. The end of the simulation approaches. What are you building toward?`;
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
          pipeline: s.pipeline + 5, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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
          pipeline: s.pipeline + 8, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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
    saasOnly: true,
    months: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    title: 'Support Escalation',
    getText: (s) => {
      const variants = [
        `Your Slack is blowing up. ${Math.max(1, Math.round((s.customers ?? 5) * 0.2))} customers have the same issue: the inventory sync broke after last night's deploy. They're losing money right now.`,
        `A critical bug: the demand prediction algorithm recommended double-ordering for ${Math.max(1, Math.round((s.customers ?? 5) * 0.15))} restaurants. Fridges are full, margins are gone, and your phone won't stop ringing.`,
        `The payment integration went down for 6 hours overnight. ${Math.max(1, Math.round((s.customers ?? 5) * 0.1))} restaurants couldn't process supplier orders this morning. They found out from their suppliers, not from you.`,
        `A data migration corrupted menu prices for several customers. Some charged their guests €0.50 for a main course. The screenshots are making the rounds in a restaurant owners' WhatsApp group.`,
      ];
      return variants[Math.floor(Math.random() * variants.length)];
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        churn: Math.min(20, s.churn + 1.5),
        product: Math.max(10, s.product - 2),
      }),
      feedback: 'It took 48 hours to acknowledge the issue. Trust doesn\'t recover from silence. Two customers started evaluating alternatives.',
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
        text: 'Roll back, post status update, offer credit',
        effects: (s) => ({
          ...s,
          product: s.product + 1,
          cash: s.cash - Math.round((s.customers ?? 5) * 20),
          churn: Math.max(3, s.churn - 0.3),
        }),
        feedback: 'Rolled back in 2 hours. The credit cost money but showed accountability. Professional response, but nobody felt personally cared for.',
      },
    ],
  },

  {
    id: 'upsell_opportunity',
    saasOnly: true,
    months: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    title: 'Upsell Opportunity',
    getText: (s) => {
      const mrr = s.mrrPerCustomer || s.price || 49;
      const variants = [
        `Three of your most active customers asked for the same thing: a premium analytics dashboard. They'd pay €${Math.round(mrr * 0.5)} more per month for it.`,
        `A customer called: "I'd pay double if you could predict staffing needs too." Two others emailed the same week with similar requests. Pattern?`,
        `Your usage data shows a segment of power users hitting the API limits daily. They'd clearly pay for a higher tier. The question is whether to build it.`,
        `Restaurant chains keep asking for multi-location reporting. Single-location customers don't need it. A premium tier could capture both without alienating either.`,
      ];
      return variants[Math.floor(Math.random() * variants.length)];
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You noted it and moved on. The feature request sits in a spreadsheet next to 40 others. Sometimes the biggest revenue opportunities look like small requests.',
    },
    getChoices: () => [
      {
        text: 'Build it — charge extra for premium tier',
        apCost: 2,
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
    saasOnly: true,
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
        apCost: 2,
        effects: (s) => {
          const addedMRR = (s.mrrPerCustomer || 49) * 3;
          return {
            ...s,
            pipeline: s.pipeline + 15, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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
          pipeline: s.pipeline + 8, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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
    saasOnly: true,
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
    saasOnly: true,
    months: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    title: 'The Cash Conversation',
    getText: (s) => {
      const runway = s.runway ?? 12;
      const cash = s.cash ?? 50000;
      if (runway < 4) return `${runway} months. That's not a runway, that's a countdown. Jonas checked the bank account three times today. Mira stopped talking about next quarter.`;
      if (runway < 6) return `${runway} months of runway. You and Mira had THE conversation last night. The one where you look at the bank account and do the math in silence.`;
      if (runway < 10) return `€${cash.toLocaleString('en-US')} in the bank. Not critical, but the burn rate ticks upward every month. What's the plan?`;
      return `€${cash.toLocaleString('en-US')} in the bank. Comfortable, but comfort breeds complacency. Every month without growth investment is a month your competitors use to catch up.`;
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
          pipeline: s.pipeline + 6, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
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

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL EVENTS — Expanding the event pool
  // ═══════════════════════════════════════════════════════════════

  // ─── PHASE 2-3: Validation / Growth ───

  {
    id: 'marketing_channel',
    months: [4, 5, 6, 7, 8],
    title: 'Marketing Channel Decision',
    text: 'You\'ve been growing mostly through word-of-mouth. But organic growth has a ceiling. Time to invest in a real channel.',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        pipeline: Math.max(2, s.pipeline - 2),
      }),
      feedback: 'No marketing investment. Pipeline depends entirely on referrals, which depend on having customers, which depend on pipeline. The chicken-and-egg problem continues.',
    },
    getChoices: () => [
      {
        text: 'Content marketing — blog, SEO, thought leadership',
        dynamicFeedback: (s) => (s.runway ?? 12) < 8
          ? 'SEO takes 4-6 months to compound. With your runway, you may not see the payoff. Content is the right long-term play at the wrong time.'
          : 'Slow burn. SEO takes 4-6 months. But the content educates your market and positions you as the expert. Compounding channel — worth it if you have the runway.',
        effects: (s) => (s.runway ?? 12) < 8
          ? { ...s, pipeline: s.pipeline + 2, burnRate: s.burnRate + 500, product: s.product + 1 }
          : { ...s, pipeline: s.pipeline + 5, burnRate: s.burnRate + 500, product: s.product + 1 },
      },
      {
        text: 'Paid ads — Google/Meta, immediate pipeline',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 10, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
          burnRate: s.burnRate + 1500,
          cac: (s.cac || 80) + 20,
        }),
        feedback: 'Pipeline jumped. But CAC went up too — paid channels get expensive fast. The moment you stop spending, the leads stop coming.',
      },
      {
        text: 'Community — local restaurant meetups, WhatsApp groups',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 6, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.3),
          conversionRate: Math.min(30, s.conversionRate + 1.5),
        }),
        feedback: 'Slow but high-trust. Restaurant owners trust other restaurant owners. The conversion rate from community leads is 2x higher than paid.',
      },
    ],
  },

  {
    id: 'onboarding_problem',
    months: [5, 6, 7, 8],
    title: 'The Onboarding Wall',
    getText: (s) => {
      const activation = s.activationRate ?? 50;
      return `Only ${activation}% of new signups complete setup. The others give up after 10 minutes. Your product works — for people who survive the first hour.`;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        activationRate: Math.max(20, (s.activationRate ?? 50) - 3),
        churn: Math.min(20, s.churn + 0.5),
      }),
      feedback: 'You left the onboarding as-is. More users bounced. The product got better but nobody sticks around long enough to notice.',
    },
    getChoices: () => [
      {
        text: 'Guided setup wizard — hold their hand through day 1',
        apCost: 2,
        dynamicFeedback: (s) => (s.product ?? 30) > 55
          ? 'The wizard helps, but your product is complex enough that a wizard can\'t cover it. Activation improved 8 points — half what you hoped. Some problems need humans, not flows.'
          : 'Activation jumped 15 points. At your current complexity level, a wizard handles most setup questions. Step by step works.',
        effects: (s) => (s.product ?? 30) > 55
          ? { ...s, activationRate: Math.min(90, (s.activationRate ?? 50) + 8), product: s.product + 2, burnRate: s.burnRate + 300 }
          : { ...s, activationRate: Math.min(90, (s.activationRate ?? 50) + 15), product: s.product + 4, burnRate: s.burnRate + 300 },
      },
      {
        text: 'Personal onboarding calls for every new user',
        effects: (s) => ({
          ...s,
          activationRate: Math.min(90, (s.activationRate ?? 50) + 10),
          churn: Math.max(3, s.churn - 1),
          burnRate: s.burnRate + 800,
          supportCost: (s.supportCost ?? 5) + 2,
        }),
        feedback: 'Expensive but effective. Every call reveals a usability issue you didn\'t know about. The cost doesn\'t scale, but the insights do.',
      },
      {
        text: 'Simplify — remove 50% of setup steps',
        effects: (s) => ({
          ...s,
          activationRate: Math.min(90, (s.activationRate ?? 50) + 8),
          product: s.product + 2,
        }),
        feedback: 'Less configuration, more assumptions. Most users don\'t need all those options. The 80/20 rule applies to setup too.',
      },
    ],
  },

  {
    id: 'team_culture',
    months: [7, 8, 9, 10, 11],
    title: 'Culture at a Crossroads',
    getText: (s) => {
      const team = s.teamSize ?? 2;
      return `Team grew to ${team}. The scrappy energy of the early days is fading. Two people had a passive-aggressive Slack exchange. Someone asked about "work-life balance." The startup vibe is changing.`;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        product: Math.max(10, s.product - 2),
      }),
      feedback: 'You ignored the culture shift. The tension didn\'t resolve — it just went underground. Quiet quitting is invisible until velocity drops.',
    },
    getChoices: () => [
      {
        text: 'Team offsite — reset, align, reconnect',
        effects: (s) => ({
          ...s,
          cash: s.cash - 2000,
          product: s.product + 3,
        }),
        feedback: '2 days, €2K. Everyone aired frustrations. Jonas and the new dev finally aligned on architecture. Expensive? Yes. Cheaper than replacing someone.',
      },
      {
        text: 'Implement structured 1:1s and feedback loops',
        effects: (s) => ({
          ...s,
          product: s.product + 2,
          burnRate: s.burnRate + 100,
        }),
        feedback: 'Weekly 1:1s, bi-weekly retros. Boring process. But the engineer who was about to quit mentioned it "finally feels like someone listens."',
      },
      {
        text: 'Let it sort itself out — focus on product',
        effects: (s) => ({
          ...s,
          product: s.product + 1,
          churn: Math.min(20, s.churn + 0.3),
        }),
        feedback: 'Sometimes teams do self-correct. Sometimes they don\'t. This time: one person checked out mentally. Output dropped 20%.',
      },
    ],
  },

  {
    id: 'data_privacy_scare',
    saasOnly: true,
    months: [8, 9, 10, 11, 12],
    title: 'The Data Privacy Scare',
    text: 'A customer\'s accountant asked: "Where is our data stored? Are you GDPR compliant?" You\'re pretty sure you are. Pretty sure.',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        churn: Math.min(20, s.churn + 1),
        product: Math.max(10, s.product - 1),
      }),
      feedback: 'You mumbled something about AWS Frankfurt. The accountant wasn\'t convinced. The restaurant owner forwarded the email to three other owners in his network.',
    },
    getChoices: () => [
      {
        text: 'Full GDPR audit + privacy page + DPA template',
        apCost: 2,
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 500,
          product: s.product + 2,
          churn: Math.max(3, s.churn - 0.5),
          conversionRate: Math.min(30, s.conversionRate + 0.5),
        }),
        feedback: 'Expensive and boring. But enterprise customers require it. And the audit found 2 actual issues you didn\'t know about.',
      },
      {
        text: 'Quick fix — privacy page and standard DPA',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 100,
          product: s.product + 1,
        }),
        feedback: 'Good enough for now. The accountant was satisfied. But if a real audit comes, this won\'t hold up.',
      },
    ],
  },

  // ─── PHASE 4-5: Maturity / Late Game ───

  {
    id: 'product_vision',
    saasOnly: true,
    months: [12, 13, 14, 15, 16],
    title: 'Product Vision Fork',
    text: 'Two paths: AI-powered demand prediction (sexy, differentiated, risky) or bulletproof operations toolkit (boring, reliable, needed). The market wants both but you can only build one well.',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        product: Math.max(10, s.product - 2),
      }),
      feedback: 'No clear product direction. The team built a little of both. Neither was good enough to matter.',
    },
    getChoices: () => [
      {
        text: 'AI prediction — the moat play',
        apCost: 2,
        effects: (s) => ({
          ...s,
          product: s.product + 8,
          pipeline: s.pipeline + 5,
          burnRate: s.burnRate + 1000,
          churn: Math.min(20, s.churn + 0.5),
        }),
        feedback: 'The AI feature is genuinely impressive. Demo converts prospects on the spot. But it\'s fragile — bad predictions destroy trust faster than good ones build it.',
      },
      {
        text: 'Operations toolkit — the retention play',
        effects: (s) => ({
          ...s,
          product: s.product + 5,
          churn: Math.max(3, s.churn - 2),
          activationRate: Math.min(90, (s.activationRate ?? 50) + 5),
        }),
        feedback: 'Not exciting. But restaurants that use your ops tools daily don\'t leave. Boring software that works is the ultimate moat.',
      },
    ],
  },

  {
    id: 'investor_update',
    months: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    title: 'The Investor Update',
    getText: (s) => {
      const mrr = s.totalMRR ?? 0;
      const growth = s.month > 1 ? Math.round(((mrr - (s.previousMRR ?? mrr * 0.9)) / Math.max(1, s.previousMRR ?? mrr * 0.9)) * 100) : 0;
      return `Monthly investor update due. MRR: €${mrr}. Your angel investors expect transparency. What do you share?`;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
      }),
      feedback: 'No update sent. Silence from founders is the #1 red flag for investors. Your reputation just took a hit.',
    },
    getChoices: () => [
      {
        text: 'Honest update — good and bad, with asks',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 3,
        }),
        feedback: 'Investors appreciate honesty. Two forwarded intros from their network. One offered to help with a specific problem you mentioned.',
      },
      {
        text: 'Highlight wins, downplay risks',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 1,
        }),
        feedback: 'They replied "looks great!" But they didn\'t offer help. Because you didn\'t ask. The relationship stays transactional.',
      },
    ],
  },

  {
    id: 'hiring_senior',
    months: [10, 11, 12, 13, 14, 15],
    title: 'Senior Hire Opportunity',
    text: 'A VP of Sales from a competitor is available. She\'d transform your go-to-market. But she costs €8K/month and wants equity.',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You passed. She joined your competitor instead. Six months later, their pipeline tripled.',
    },
    getChoices: () => [
      {
        text: 'Hire her — full package, €8K + 2% equity',
        apCost: 2,
        dynamicFeedback: (s) => (s.totalMRR ?? 0) < 2000
          ? 'She\'s brilliant, but €8K/mo on a team making €' + ((s.totalMRR ?? 0)) + '/mo MRR? She burned through 3 months of runway before the pipeline caught up. Great hire, terrible timing.'
          : 'Expensive. But she brought her rolodex, her playbook, and her credibility. Pipeline tripled in 2 months. At your MRR level, the ROI is clear.',
        effects: (s) => (s.totalMRR ?? 0) < 2000
          ? { ...s, burnRate: s.burnRate + 8000, pipeline: s.pipeline + 10, teamSize: (s.teamSize ?? 2) + 1 }
          : { ...s, burnRate: s.burnRate + 8000, pipeline: s.pipeline + 15, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5), cac: Math.max(30, (s.cac || 80) - 20), conversionRate: Math.min(30, s.conversionRate + 2), teamSize: (s.teamSize ?? 2) + 1 },
      },
      {
        text: 'Offer consulting — 2 days/week, no equity',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 3000,
          pipeline: s.pipeline + 6, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.3),
          cac: Math.max(30, (s.cac || 80) - 8),
        }),
        feedback: 'Part-time means part-commitment. She helps, but the real transformation requires full immersion. Half-measures in hiring rarely work.',
      },
    ],
  },

  {
    id: 'pricing_revisit',
    months: [10, 11, 12, 13, 14],
    title: 'Pricing Revisited',
    getText: (s) => {
      const price = s.price ?? 49;
      const customers = s.customers ?? 0;
      return `You\'ve been at €${price}/mo since launch. ${customers} customers at this price. Your most engaged users would pay more. Your least engaged are looking for cheaper alternatives. Time to rethink?`;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'Price unchanged. The market will eventually decide your pricing for you — usually downward.',
    },
    getChoices: () => [
      {
        text: 'Raise prices 30% for new customers',
        effects: (s) => ({
          ...s,
          price: Math.round((s.price ?? 49) * 1.3),
          mrrPerCustomer: Math.round((s.mrrPerCustomer || 49) * 1.3),
          conversionRate: Math.max(3, s.conversionRate - 1.5),
          churn: Math.max(3, s.churn - 0.5),
        }),
        feedback: 'New customers pay more. Conversion dipped slightly. But the ones who convert are more committed. ARPU went up without losing existing customers.',
      },
      {
        text: 'Introduce tiered pricing — Basic / Pro / Enterprise',
        apCost: 2,
        effects: (s) => ({
          ...s,
          totalMRR: Math.round((s.totalMRR ?? 0) * 1.15),
          revenue: Math.round((s.revenue ?? 0) * 1.15),
          mrrPerCustomer: Math.round((s.mrrPerCustomer || 49) * 1.15),
          product: s.product + 2,
          burnRate: s.burnRate + 300,
        }),
        feedback: '15% MRR increase from existing customers upgrading to Pro. The tier structure also makes sales conversations easier — "which plan fits your needs?"',
      },
      {
        text: 'Keep prices, add annual discount',
        effects: (s) => ({
          ...s,
          cash: s.cash + Math.round((s.totalMRR ?? 0) * 3),
          churn: Math.max(3, s.churn - 1),
          totalMRR: Math.round((s.totalMRR ?? 0) * 0.95),
          revenue: Math.round((s.revenue ?? 0) * 0.95),
        }),
        feedback: 'Cash infusion from annual conversions. Churn dropped mechanically (annual = locked in). But you left money on the table by not raising.',
      },
    ],
  },

  {
    id: 'referral_program',
    months: [8, 9, 10, 11, 12, 13, 14],
    title: 'Referral Program',
    text: 'Your best customers love you. But they\'re not actively recommending you. A structured referral program could change that.',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'No referral program. Your happiest customers kept the secret to themselves. Word-of-mouth without incentive is a hope strategy.',
    },
    getChoices: () => [
      {
        text: '"Give €50, get €50" — cash referral bonus',
        dynamicFeedback: (s) => (s.churn ?? 5) > 8
          ? 'Your customers referred friends... who then saw the same issues your existing customers complain about. 3 signups, 2 churned within a month. Referrals amplify your product quality — good or bad.'
          : 'Simple, effective. Referred customers have 2x lower churn than cold leads. Your happy customers are your best salespeople.',
        effects: (s) => (s.churn ?? 5) > 8
          ? { ...s, pipeline: s.pipeline + 3, burnRate: s.burnRate + 400, churn: Math.min(20, s.churn + 0.5) }
          : { ...s, pipeline: s.pipeline + 8, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.3), cac: Math.max(30, (s.cac || 80) - 15), burnRate: s.burnRate + 400 },
      },
      {
        text: 'Free month for both — low-cost, high-trust',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 5,
          churn: Math.max(3, s.churn - 0.3),
          totalMRR: Math.round((s.totalMRR ?? 0) * 0.97),
          revenue: Math.round((s.revenue ?? 0) * 0.97),
        }),
        feedback: 'Lower cost per referral. Existing customers feel rewarded. New customers feel welcomed. The math works if the referred customers stick.',
      },
    ],
  },

  {
    id: 'strategic_pivot',
    saasOnly: true,
    months: [14, 15, 16, 17, 18, 19],
    title: 'The Pivot Question',
    getText: (s) => {
      const pmf = s.pmf ?? 0;
      return pmf < 30
        ? `PMF score at ${pmf}/100. After ${s.month} months. The hard question: is this a timing problem, an execution problem, or a market problem?`
        : `PMF at ${pmf}/100. Not bad, but not breakthrough. Could a pivot unlock more? Or would it reset all the progress you\'ve made?`;
    },
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        product: Math.max(10, s.product - 1),
      }),
      feedback: 'You stayed the course without conviction. Not pivoting is also a decision — make sure it\'s a deliberate one.',
    },
    getChoices: () => [
      {
        text: 'Pivot — new segment, same technology',
        apCost: 2,
        effects: (s) => ({
          ...s,
          pipeline: Math.round(s.pipeline * 0.5) + 10,
          customers: Math.max(0, s.customers - Math.round(s.customers * 0.3)),
          totalMRR: Math.round((s.totalMRR ?? 0) * 0.7),
          revenue: Math.round((s.revenue ?? 0) * 0.7),
          product: s.product + 5,
          conversionRate: Math.min(30, s.conversionRate + 3),
        }),
        feedback: 'Lost 30% of customers but the new segment converts 3x better. The technology transfers, the brand awareness doesn\'t. Risky but potentially transformative.',
      },
      {
        text: 'Double down — this IS the market, we need more time',
        effects: (s) => ({
          ...s,
          product: s.product + 4,
          churn: Math.max(3, s.churn - 0.5),
        }),
        feedback: 'Conviction. Every improvement compounds. The question is whether you have the runway to let it compound long enough.',
      },
      {
        text: 'Micro-pivot — same segment, different pain point',
        effects: (s) => ({
          ...s,
          product: s.product + 3,
          pipeline: s.pipeline + 4,
          conversionRate: Math.min(30, s.conversionRate + 1.5),
        }),
        feedback: 'Not a full pivot — a refocus. Same restaurants, different core problem. Less risky, less transformative, but preserves what you\'ve built.',
      },
    ],
  },

  {
    id: 'talent_retention',
    months: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    title: 'Talent Market Pressure',
    getText: (s) => {
      const team = s.teamSize ?? 2;
      const variants = [
        `Your lead developer got a LinkedIn message from Google. She showed you — not to threaten, but to be honest. "I\'m not looking, but I\'m also not not-looking."`,
        `Glassdoor alert: a competitor posted a role identical to your CS lead\'s — at 40% higher salary. Your team sees LinkedIn. They know.`,
        `Two people on the team asked for raises in the same week. Coincidence? Maybe. Or maybe they talked.`,
        `A recruiter is systematically approaching your engineers. The first one laughed it off. The second took the call.`,
      ];
      return variants[Math.floor(Math.random() * variants.length)];
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        product: Math.max(10, s.product - 2),
      }),
      feedback: 'You pretended it wasn\'t happening. Morale dropped. The best people always have options — and they\'re the first to leave.',
    },
    getChoices: () => [
      {
        text: 'Proactive raises + equity refresh',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 1500,
          product: s.product + 2,
        }),
        feedback: 'Expensive. But cheaper than replacing someone. The team noticed you acted before they asked. That builds loyalty money can\'t buy.',
      },
      {
        text: 'Improve non-monetary benefits — flexibility, growth',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 200,
          product: s.product + 1,
        }),
        feedback: '4-day weeks, learning budgets, meaningful ownership. Not everyone optimizes for salary. But some do — and they\'ll leave eventually.',
      },
    ],
  },

  {
    id: 'press_opportunity',
    saasOnly: true,
    months: [10, 11, 12, 13, 14, 15, 16],
    title: 'Press Opportunity',
    text: 'A journalist from a food industry magazine wants to profile your startup. Great exposure — but she wants to shadow you for a week. A WEEK.',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You declined. The article featured your competitor instead. PR is free — if you\'re willing to pay with time.',
    },
    getChoices: () => [
      {
        text: 'Full access — let her see everything',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 10,
          product: Math.max(10, s.product - 1),
        }),
        feedback: 'The article was authentic and compelling. Inbound leads spiked. But the week of distraction cost you a sprint. Worth it for the brand.',
      },
      {
        text: 'Controlled access — curated story',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 5,
        }),
        feedback: 'Nice article but generic. She\'s written this startup story before. The controlled access produced controlled results.',
      },
    ],
  },

  {
    id: 'automation_vs_manual',
    months: [13, 14, 15, 16, 17, 18],
    title: 'Automate or Hire?',
    getText: (s) => {
      const customers = s.customers ?? 0;
      return `${customers} customers. Support volume is growing linearly. You can automate common workflows (expensive upfront, scales infinitely) or hire another CS person (quick, doesn\'t scale).`;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        supportCost: (s.supportCost ?? 5) + 1,
        churn: Math.min(20, s.churn + 0.5),
      }),
      feedback: 'Neither. Support quality degraded as volume grew. Response times went from hours to days. Customers noticed.',
    },
    getChoices: () => [
      {
        text: 'Build automation — self-serve knowledge base + chatbot',
        apCost: 2,
        effects: (s) => ({
          ...s,
          supportCost: Math.max(2, (s.supportCost ?? 5) - 3),
          product: s.product + 3,
          burnRate: s.burnRate + 500,
        }),
        feedback: '60% of tickets deflected. Support cost per customer dropped. But the 40% that need humans REALLY need humans. Quality where it counts.',
      },
      {
        text: 'Hire — personal touch scales trust',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 3000,
          churn: Math.max(3, s.churn - 1),
          teamSize: (s.teamSize ?? 2) + 1,
          supportCost: Math.max(2, (s.supportCost ?? 5) - 1),
        }),
        feedback: 'New CS hire. Response time under 1 hour. Churn dropped. But you\'ll need another hire at 50 customers, and another at 100.',
      },
    ],
  },

  {
    id: 'legal_threat',
    months: [15, 16, 17, 18, 19, 20],
    title: 'Legal Threat',
    text: 'A cease and desist letter from a larger competitor. They claim your feature X infringes on their patent. Your lawyer says it\'s probably baseless. Probably.',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        product: Math.max(10, s.product - 3),
        pipeline: Math.max(2, s.pipeline - 3),
      }),
      feedback: 'You ignored it. The threat escalated. Even baseless legal threats create FUD (Fear, Uncertainty, Doubt) in the market.',
    },
    getChoices: () => [
      {
        text: 'Lawyer up — fight it properly',
        effects: (s) => ({
          ...s,
          cash: s.cash - 8000,
          product: s.product + 1,
        }),
        feedback: 'Your lawyer\'s response was surgical. The claim was indeed baseless. €8K for peace of mind and a precedent. Startups need to stand their ground.',
      },
      {
        text: 'Redesign the feature — avoid the fight',
        effects: (s) => ({
          ...s,
          product: Math.max(10, s.product - 1),
          burnRate: s.burnRate + 300,
        }),
        feedback: 'Redesigned in 2 weeks. The new version is actually better. Sometimes external pressure forces good decisions.',
      },
    ],
  },

  {
    id: 'seasonal_dip',
    saasOnly: true,
    months: [6, 7, 8, 14, 15, 16, 20, 21, 22],
    title: 'Seasonal Slowdown',
    getText: (s) => {
      const variants = [
        'Summer. Half your restaurant customers are on vacation or running skeleton crews. New signups dropped 40%. Pipeline is a ghost town.',
        'Holiday season. Restaurants are too busy serving customers to think about software. Your sales emails go unanswered. Pipeline froze.',
        'January slump. Restaurant owners reviewing budgets after the holidays. Three asked to downgrade. Two "paused" their accounts.',
      ];
      return variants[Math.floor(Math.random() * variants.length)];
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        pipeline: Math.max(2, Math.round(s.pipeline * 0.7)),
        churn: Math.min(20, s.churn + 1),
      }),
      feedback: 'The dip hit and you weren\'t prepared. Seasonality is predictable — your response to it doesn\'t have to be reactive.',
    },
    getChoices: () => [
      {
        text: 'Use the quiet time to build — product sprint',
        dynamicFeedback: (s) => (s.product ?? 30) > 65
          ? 'You polished an already good product. Marginal improvements. The quiet time might have been better spent on relationships or rest.'
          : 'Pipeline shrunk but product improved significantly. When the season picks back up, you\'ll have something better to sell.',
        effects: (s) => (s.product ?? 30) > 65
          ? { ...s, product: s.product + 2, pipeline: Math.max(2, Math.round(s.pipeline * 0.8)) }
          : { ...s, product: s.product + 5, pipeline: Math.max(2, Math.round(s.pipeline * 0.8)) },
      },
      {
        text: 'Seasonal promotion — discount for annual commitment',
        effects: (s) => ({
          ...s,
          cash: s.cash + Math.round((s.totalMRR ?? 0) * 2),
          churn: Math.max(3, s.churn - 1),
          totalMRR: Math.round((s.totalMRR ?? 0) * 0.93),
          revenue: Math.round((s.revenue ?? 0) * 0.93),
        }),
        feedback: 'Annual conversions during the dip. Smart — lock them in when they\'re worried about costs. Cash upfront, reduced churn.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL EVENTS — Fill gaps in early/late months, more variety
  // ═══════════════════════════════════════════════════════════════

  // ─── EARLY GAME (Months 1-4) ───

  {
    id: 'first_demo',
    speaker: 'Maria, Restaurant Owner',
    speakerRole: 'Prospect',
    months: [1, 2, 3],
    title: 'The First Real Demo',
    text: '"Can you show me how this works? I have 20 minutes before the lunch rush." Maria runs a family restaurant in Kreuzberg. You\'ve been preparing this demo for a week. Your instinct says: show her everything.',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, pipeline: Math.max(2, s.pipeline - 2) }),
      feedback: 'You rescheduled twice and she stopped replying. Word travels fast in tight communities.',
    },
    getChoices: () => [
      {
        text: 'Walk her through the full product — she should see everything we built',
        dynamicFeedback: (s) => (s.product ?? 30) > 45
          ? 'She was impressed by the depth. Signed up and told her accountant to set it up. When the product is strong, showing more works.'
          : 'Her eyes glazed over at feature 4. "This is a lot." She said she\'d think about it. She won\'t. You showed her a product, not a solution to her problem.',
        effects: (s) => (s.product ?? 30) > 45
          ? { ...s, customers: s.customers + 1, totalMRR: (s.totalMRR ?? 0) + (s.price || 49), pipeline: s.pipeline + 2 }
          : { ...s, pipeline: s.pipeline + 1 },
      },
      {
        text: 'Ask what keeps her up at night — then show only that',
        effects: (s) => ({
          ...s,
          customers: s.customers + 1,
          totalMRR: (s.totalMRR ?? 0) + (s.price || 49),
          conversionRate: Math.min(30, s.conversionRate + 0.5),
        }),
        feedback: '"Food waste. I throw away 20% of what I order." Five minutes on demand prediction. She signed up before you left. Listening first always feels slower than it is.',
      },
      {
        text: 'Bring your laptop and just set it up together on the spot',
        effects: (s) => ({
          ...s,
          customers: s.customers + 1,
          totalMRR: (s.totalMRR ?? 0) + (s.price || 49),
          product: s.product + 2,
          churn: Math.max(3, s.churn - 0.3),
        }),
        feedback: 'Messy. Slow WiFi, two bugs. But she saw her own data in the tool. "Oh. That\'s what it does." The bugs didn\'t matter — the reality did. You also found two UX issues you never would have noticed in your office.',
      },
    ],
  },
  {
    id: 'advisor_offer',
    speaker: 'Klaus, Serial Entrepreneur',
    speakerRole: 'Advisor Candidate',
    months: [2, 3, 4],
    title: 'An Advisor Knocks',
    text: '"I sold my food-tech startup in 2019. I\'d love to help. I can do 2 hours a month — no equity needed right now. But I\'ll be honest."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You never replied. Klaus moved on. His network of restaurant chains would have been useful around month 6.',
    },
    getChoices: () => [
      {
        text: 'Accept — experienced advice is invaluable early on',
        dynamicFeedback: (s) => (s.pipeline ?? 12) > 20
          ? 'Klaus gives good advice, but you already know most of it. His network overlaps with yours. The 2 hours/month is nice but not transformative.'
          : 'First call: "Your pricing page is broken on mobile." He was right. His first intro became your 4th customer. When your network is thin, one connector changes everything.',
        effects: (s) => (s.pipeline ?? 12) > 20
          ? { ...s, pipeline: s.pipeline + 2, product: s.product + 1 }
          : { ...s, pipeline: s.pipeline + 5, conversionRate: Math.min(30, s.conversionRate + 1), product: s.product + 2 },
      },
      {
        text: 'Decline — we need to figure this out ourselves first',
        effects: (s) => ({
          ...s,
          product: s.product + 1,
        }),
        feedback: 'Principled. Maybe wise, maybe stubborn. You\'ll learn the lessons he already learned — just slower and more expensive.',
      },
    ],
  },

  {
    id: 'coworking_encounter',
    speaker: 'Sophie, Fellow Founder',
    speakerRole: 'Coworking Neighbor',
    months: [1, 2, 3, 4],
    title: 'The Coworking Coffee',
    text: '"Hey, I overheard you talking about restaurant software. My boyfriend runs a catering company. He\'s looking for exactly this. Want an intro?"',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You were too heads-down to look up. The intro that would have cost you nothing went to nobody.',
    },
    getChoices: () => [
      {
        text: 'Yes! And while we\'re at it, who else in this space do you know?',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 6,
          customers: s.customers + 1,
          totalMRR: (s.totalMRR ?? 0) + (s.price || 49),
          salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.3),
        }),
        feedback: 'The boyfriend signed up that week. Sophie introduced you to a food-tech meetup with 50 people. Three became trial users. Networking isn\'t a dirty word — it\'s distribution.',
      },
      {
        text: 'Take the intro, but stay focused — one contact is enough',
        effects: (s) => ({
          ...s,
          customers: s.customers + 1,
          totalMRR: (s.totalMRR ?? 0) + (s.price || 49),
        }),
        feedback: 'He signed up. Good product-founder communication — you explained the value in 2 sentences. But you left pipeline on the table.',
      },
    ],
  },

  {
    id: 'first_bug_report',
    speaker: 'Thomas, Restaurant Owner',
    speakerRole: 'Early Customer',
    months: [2, 3, 4],
    title: 'The Angry Email',
    text: '"Your system ordered 200kg of tomatoes instead of 20. My kitchen is literally full of tomatoes. Fix this NOW or I\'m cancelling."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        customers: Math.max(0, s.customers - 1),
        totalMRR: Math.max(0, (s.totalMRR ?? 0) - (s.price || 49)),
        churn: Math.min(20, s.churn + 1),
      }),
      feedback: "Thomas cancelled. Told everyone in the restaurant owners' group chat. Two prospects went cold.",
    },
    getChoices: () => [
      {
        text: 'Drive to his restaurant personally. Apologize. Fix it on his laptop.',
        effects: (s) => ({
          ...s,
          product: s.product + 4,
          churn: Math.max(3, s.churn - 1),
        }),
        feedback: '"You came here? In person?" Thomas was shocked. You fixed the bug in his kitchen while he made you espresso. He\'s now your most vocal advocate. "This is why I chose a small company."',
      },
      {
        text: 'Hotfix the bug immediately, send a detailed postmortem email',
        effects: (s) => ({
          ...s,
          product: s.product + 3,
        }),
        feedback: 'Bug fixed in 4 hours. Thomas appreciated the transparency. "At least you\'re honest about what went wrong." He stayed. But he\'s watching closely now.',
      },
      {
        text: 'Fix it and offer one month free as compensation',
        effects: (s) => ({
          ...s,
          product: s.product + 2,
          totalMRR: Math.max(0, (s.totalMRR ?? 0) - (s.price || 49)),
        }),
        feedback: 'Money helps, but it\'s not what he wanted. He wanted to know it won\'t happen again. The free month bought time, not trust.',
      },
    ],
  },

  // ─── MID GAME (Months 5-12) ───

  {
    id: 'customer_interview_insight',
    speaker: 'Mira Chen',
    speakerRole: 'Co-founder, Product',
    months: [5, 6, 7, 8],
    title: 'The Unexpected Discovery',
    text: '"I just finished 8 customer calls this week. Three of them use our tool for something we never designed it for — staff scheduling. They\'re hacking it with the inventory system."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You noted it and moved on. The market was telling you something, but you were too busy to listen.',
    },
    getChoices: () => [
      {
        text: 'Build a basic scheduling module — follow the demand signal',
        apCost: 2,
        effects: (s) => ({
          ...s,
          product: s.product + 5,
          pipeline: s.pipeline + 4,
          churn: Math.max(3, s.churn - 1),
          burnRate: s.burnRate + 500,
        }),
        feedback: 'Shipped in 3 weeks. The 3 customers who were hacking it are now power users. Two recommended you to their networks. "Finally someone who listens."',
      },
      {
        text: 'Don\'t build it — stay focused on core demand prediction',
        effects: (s) => ({
          ...s,
          product: s.product + 2,
        }),
        feedback: 'Discipline. You can\'t chase every signal. But you filed it for later — if 3 more customers ask, it becomes a pattern.',
      },
    ],
  },

  {
    id: 'payment_failure',
    speaker: 'Anna, Support Lead',
    speakerRole: 'Customer Support',
    months: [5, 6, 7, 8, 9, 10],
    title: 'The Payment Problem',
    text: '"Five customers had failed payments this month. Two didn\'t even notice. Three are annoyed. Our retry logic is... nonexistent."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        customers: Math.max(0, s.customers - 2),
        totalMRR: Math.max(0, (s.totalMRR ?? 0) - (s.price || 49) * 2),
        churn: Math.min(20, s.churn + 1),
      }),
      feedback: 'Two customers silently disappeared. Involuntary churn — the kind you don\'t see until it\'s too late.',
    },
    getChoices: () => [
      {
        text: 'Build proper dunning flow — retry, notify, recover',
        effects: (s) => ({
          ...s,
          product: s.product + 2,
          churn: Math.max(3, s.churn - 0.5),
        }),
        feedback: 'Implemented: 3 retry attempts, friendly email sequence, one-click update. Recovered 4 out of 5 failed payments. Boring infrastructure, critical impact.',
      },
      {
        text: 'Manual outreach — call each failed payment personally',
        effects: (s) => ({
          ...s,
          churn: Math.max(3, s.churn - 0.5),
          customers: s.customers + 1,
          totalMRR: (s.totalMRR ?? 0) + (s.price || 49),
        }),
        feedback: '"Oh, my card expired. Thanks for calling!" All 5 recovered. One was so impressed by the personal touch she referred a friend. Doesn\'t scale, but it works.',
      },
    ],
  },

  {
    id: 'competitor_feature',
    saasOnly: true,
    speaker: 'Jonas Richter',
    speakerRole: 'Co-founder, Tech',
    months: [6, 7, 8, 9, 10],
    title: 'The Feature War',
    text: '"Our competitor just shipped AI-generated menu suggestions. It\'s all over LinkedIn. Three prospects asked if we have it. We don\'t."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        pipeline: Math.max(2, s.pipeline - 3),
        churn: Math.min(20, s.churn + 0.5),
      }),
      feedback: 'You said nothing. Two prospects chose the competitor citing "more innovative." Features don\'t always win, but silence always loses.',
    },
    getChoices: () => [
      {
        text: 'Build a better version — we know the domain deeper',
        apCost: 2,
        effects: (s) => ({
          ...s,
          product: s.product + 4,
          pipeline: s.pipeline + 3,
          burnRate: s.burnRate + 500,
        }),
        feedback: 'Shipped in 4 weeks. Your version uses actual restaurant data, theirs is generic GPT wrapper. Two of the competitor\'s customers switched to you.',
      },
      {
        text: 'Ignore it — features don\'t win, distribution does',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 4,
          salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.4),
        }),
        feedback: 'You doubled down on sales calls instead. Pipeline grew. The feature hype died in 3 weeks. Most prospects never used the competitor\'s AI feature anyway.',
      },
      {
        text: 'Write a blog post: "Why AI menu suggestions are a gimmick"',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 6,
          product: s.product + 1,
        }),
        feedback: 'Went semi-viral in the food-tech community. "Finally someone said it." The post drove more signups than 2 months of paid ads.',
      },
    ],
  },

  {
    id: 'employee_conflict',
    saasOnly: true,
    speaker: 'Lisa, Junior Developer',
    speakerRole: 'Employee',
    months: [7, 8, 9, 10, 11, 12],
    title: 'The Quiet Complaint',
    text: '"I joined because I believed in the mission. But Jonas reviews my PRs with one word: \'fine.\' I haven\'t learned anything in 2 months. Is this going to change?"',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        product: Math.max(10, s.product - 2),
        burnRate: s.burnRate + 500,
      }),
      feedback: 'Lisa started looking for other jobs. Quiet quitting is expensive — you\'re paying full salary for half the output. And the next hire will cost €5K+ to recruit.',
    },
    getChoices: () => [
      {
        text: 'Talk to Jonas — code reviews need to be learning moments',
        effects: (s) => ({
          ...s,
          product: s.product + 3,
        }),
        feedback: 'Jonas was surprised. "I thought \'fine\' was a compliment." He started pairing with Lisa 2x/week. Her velocity doubled in a month. Team culture is built in small moments.',
      },
      {
        text: 'Pair Lisa with an external mentor — invest in her growth',
        effects: (s) => ({
          ...s,
          product: s.product + 2,
          burnRate: s.burnRate + 300,
        }),
        feedback: 'The mentor costs €300/mo but Lisa shipped her first feature solo 3 weeks later. She presented it at the team standup. Jonas clapped.',
      },
    ],
  },

  {
    id: 'logo_customer',
    saasOnly: true,
    speaker: 'Mira Chen',
    speakerRole: 'Co-founder, Product',
    months: [8, 9, 10, 11, 12],
    title: 'The Logo Customer',
    text: '"Remember the Michelin-starred place in Mitte? They want to try our product. Zero revenue impact — they\'d pay standard price. But imagine that logo on our website."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'The Michelin chef went with a competitor. You\'ll never know if it would have mattered.',
    },
    getChoices: () => [
      {
        text: 'Roll out the red carpet — white-glove onboarding',
        apCost: 2,
        effects: (s) => ({
          ...s,
          customers: s.customers + 1,
          totalMRR: (s.totalMRR ?? 0) + (s.price || 49),
          pipeline: s.pipeline + 8,
          product: s.product + 2,
        }),
        feedback: 'They signed. The logo on your website doubled inbound leads for 3 weeks. "If Restaurant XY uses it, it must be good." Social proof is a real growth lever.',
      },
      {
        text: 'Standard onboarding — treat them like any customer',
        effects: (s) => ({
          ...s,
          customers: s.customers + 1,
          totalMRR: (s.totalMRR ?? 0) + (s.price || 49),
          product: s.product + 1,
        }),
        feedback: 'They signed up through the normal flow. Took 3 weeks to get active. You added their logo to the website anyway. Lower effort, lower impact.',
      },
    ],
  },

  // ─── LATE GAME (Months 13-24) ───

  {
    id: 'pricing_pressure',
    saasOnly: true,
    speaker: 'Thomas, Restaurant Owner',
    speakerRole: 'Long-term Customer',
    months: [13, 14, 15, 16, 17, 18],
    title: 'The Discount Request',
    text: '"Look, I love the product. But I just saw your competitor is €20/mo cheaper. I don\'t want to switch, but my margins are thin. Can you match it?"',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        customers: Math.max(0, s.customers - 1),
        totalMRR: Math.max(0, (s.totalMRR ?? 0) - (s.price || 49)),
        churn: Math.min(20, s.churn + 0.5),
      }),
      feedback: 'Thomas switched. He\'ll be back in 6 months when the competitor\'s product breaks. But that\'s 6 months of MRR you\'ll never get back.',
    },
    getChoices: () => [
      {
        text: 'Show the ROI — "Let me show you what you saved last month"',
        effects: (s) => ({
          ...s,
          churn: Math.max(3, s.churn - 0.5),
          product: s.product + 1,
        }),
        feedback: '"€1,200 in waste reduction, and you\'re worried about €20?" Thomas laughed. He stayed. Note to self: build an ROI dashboard into the product.',
      },
      {
        text: 'Offer annual plan — 2 months free, same price per month',
        effects: (s) => ({
          ...s,
          cash: s.cash + (s.price || 49) * 4,
          churn: Math.max(3, s.churn - 0.5),
        }),
        feedback: 'Thomas locked in for 12 months. Cash upfront, lower churn. You didn\'t drop the price — you changed the frame.',
      },
      {
        text: 'Hold the line — "We\'re not the cheapest, we\'re the best"',
        effects: (s) => ({
          ...s,
          product: s.product + 1,
        }),
        feedback: 'Thomas grumbled but stayed. For now. Price confidence matters — once you start discounting, everyone expects it.',
      },
    ],
  },

  {
    id: 'team_growing_pains',
    saasOnly: true,
    speaker: 'Jonas Richter',
    speakerRole: 'Co-founder, Tech',
    months: [10, 11, 12, 13, 14],
    title: 'The Process Question',
    text: '"We\'re 5 people now and everything is chaos. No standup, no sprint planning, no documentation. Lisa merged to main without testing yesterday. We need process."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        product: Math.max(10, s.product - 3),
      }),
      feedback: 'A production bug slipped through. Two customers saw wrong data for 6 hours. "Move fast and break things" sounds cool until you break trust.',
    },
    getChoices: () => [
      {
        text: 'Light process — daily standup, PR reviews, nothing more',
        effects: (s) => ({
          ...s,
          product: s.product + 3,
        }),
        feedback: 'The 15-minute standup became the team\'s favorite ritual. Bugs caught in review, everyone knows what everyone\'s doing. Lightweight structure, outsized impact.',
      },
      {
        text: 'Full agile setup — sprints, retros, backlog grooming',
        effects: (s) => ({
          ...s,
          product: s.product + 2,
          burnRate: s.burnRate + 200,
        }),
        feedback: 'Sprint 1 felt bureaucratic. Sprint 3 felt natural. By sprint 5, the team shipped 2x what they used to. Process isn\'t the enemy of speed — chaos is.',
      },
    ],
  },

  {
    id: 'customer_case_study',
    saasOnly: true,
    speaker: 'Mira Chen',
    speakerRole: 'Co-founder, Product',
    months: [10, 11, 12, 13, 14, 15],
    title: 'The Success Story',
    text: '"Thomas saved €14,000 in food waste last year using our product. He\'d do a video testimonial if we ask. Should we invest in a proper case study?"',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'The story stayed untold. Your best marketing asset is sitting in a customer\'s kitchen, unrecorded.',
    },
    getChoices: () => [
      {
        text: 'Professional video + landing page — invest €2K',
        effects: (s) => ({
          ...s,
          cash: s.cash - 2000,
          pipeline: s.pipeline + 10,
          conversionRate: Math.min(30, s.conversionRate + 1),
        }),
        feedback: '"€14,000 saved" in the headline. The video converted 3x better than your homepage. Thomas became a mini-celebrity in the restaurant scene.',
      },
      {
        text: 'Simple written case study — Mira writes it over the weekend',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 5,
          conversionRate: Math.min(30, s.conversionRate + 0.5),
        }),
        feedback: 'Published on your blog. Picked up by a restaurant industry newsletter. Low effort, meaningful pipeline impact.',
      },
    ],
  },

  {
    id: 'burnout_warning',
    saasOnly: true,
    speaker: 'Mira Chen',
    speakerRole: 'Co-founder, Product',
    months: [14, 15, 16, 17, 18],
    title: 'The Late Night',
    text: '"Jonas, when did you last take a day off?" "...I don\'t remember." He\'s been shipping features at 2am. The code quality is declining. He snapped at Lisa in standup.',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        product: Math.max(10, s.product - 4),
        maxAP: Math.max(2, (s.maxAP ?? 3) - 1),
      }),
      feedback: 'Jonas burned out. Took 3 weeks off. The codebase nobody else fully understood. Production went sideways. Founder burnout is the startup killer nobody talks about.',
    },
    getChoices: () => [
      {
        text: 'Force a week off — now. We\'ll cover.',
        effects: (s) => ({
          ...s,
          product: s.product + 2,
        }),
        feedback: 'Jonas came back different. Rested, focused, kind again. He rewrote the most fragile module in 3 days. "I should have done this months ago." Prevention is cheaper than recovery.',
      },
      {
        text: 'Redistribute workload — hire a freelancer for 2 months',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 1500,
          product: s.product + 3,
        }),
        feedback: 'The freelancer took the boring maintenance work. Jonas could focus on architecture. Cost €3K, but the alternative — a broken co-founder — would have cost everything.',
      },
    ],
  },

  {
    id: 'expansion_opportunity',
    saasOnly: true,
    speaker: 'Klaus, Advisor',
    speakerRole: 'Advisor',
    months: [16, 17, 18, 19, 20],
    title: 'The Adjacent Market',
    text: '"Hotels have the exact same inventory waste problem. I know the GM of a 4-star chain. One call and you have a pilot. But hotel operations are different from restaurants."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You stayed in restaurants. Safe. Smart? Maybe. But the restaurant market has a ceiling, and you\'re approaching it.',
    },
    getChoices: () => [
      {
        text: 'Take the meeting — explore, don\'t commit',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 5,
          product: s.product + 1,
        }),
        feedback: 'The hotel GM was excited. "90% of what you built works for us." The 10% that doesn\'t is a 2-week build. New market, same product. Rare opportunity.',
      },
      {
        text: 'Go all in — adapt the product for hotels',
        apCost: 2,
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 10,
          product: s.product + 3,
          burnRate: s.burnRate + 1000,
          customers: s.customers + 2,
          totalMRR: (s.totalMRR ?? 0) + (s.price || 49) * 2,
        }),
        feedback: 'Two hotel clients in month one. The TAM just tripled. But you\'re now maintaining two product variants. The codebase groans.',
      },
    ],
  },

  {
    id: 'churn_interview',
    saasOnly: true,
    speaker: 'Mira Chen',
    speakerRole: 'Co-founder, Product',
    months: [8, 9, 10, 11, 12, 13, 14, 15, 16],
    title: 'The Exit Interview',
    getText: (s) => {
      if ((s.churn ?? 5) > 8) return '"We lost 3 customers last month. I called all of them. The pattern is clear — they all said the same thing."';
      return '"Our best customer just cancelled. I need to find out why. This one hurts."';
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        churn: Math.min(20, s.churn + 1),
      }),
      feedback: 'You let them go without asking why. The information that would have prevented the next 5 cancellations walked out the door.',
    },
    getChoices: () => [
      {
        text: 'Call every churned customer personally this week',
        effects: (s) => ({
          ...s,
          churn: Math.max(3, s.churn - 1.5),
          product: s.product + 3,
          conversionRate: Math.min(30, s.conversionRate + 0.5),
        }),
        feedback: '"I switched because your onboarding took too long." "The reports weren\'t what my accountant needed." "I just forgot to use it." Three different problems, three fixable problems. Two agreed to come back after you fix their issue.',
      },
      {
        text: 'Send a churn survey — scale the feedback gathering',
        effects: (s) => ({
          ...s,
          churn: Math.max(3, s.churn - 0.5),
          product: s.product + 2,
        }),
        feedback: '40% response rate. The data is clear: onboarding and reporting are the top two reasons. Quantified churn reasons are gold for product roadmap prioritization.',
      },
    ],
  },

  {
    id: 'platform_opportunity',
    saasOnly: true,
    speaker: 'Laura, BD Manager',
    speakerRole: 'Food Delivery Platform',
    months: [15, 16, 17, 18, 19, 20],
    title: 'The Platform Call',
    text: '"We\'re building a marketplace for restaurant tools. If you integrate with our API, we\'ll feature you to 2,000 restaurants. But we take 20% of referred revenue."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'The platform launched with your competitor instead. 2,000 restaurants saw their product, not yours.',
    },
    getChoices: () => [
      {
        text: 'Integrate — 80% of something is better than 100% of nothing',
        apCost: 2,
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 15,
          customers: s.customers + 3,
          totalMRR: (s.totalMRR ?? 0) + (s.price || 49) * 3,
          burnRate: s.burnRate + 500,
        }),
        feedback: 'Integration took 2 weeks. 47 trial signups in the first month. 3 converted. The 20% cut stings, but the distribution is real. Channel partnerships scale differently than direct sales.',
      },
      {
        text: 'Negotiate — 10% or no deal',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 8,
          customers: s.customers + 1,
          totalMRR: (s.totalMRR ?? 0) + (s.price || 49),
        }),
        feedback: 'They agreed to 12%. You got better terms because your product had traction. Leverage comes from having something people want.',
      },
    ],
  },

  {
    id: 'founder_equity_talk',
    saasOnly: true,
    speaker: 'Jonas Richter',
    speakerRole: 'Co-founder, Tech',
    months: [18, 19, 20, 21, 22],
    title: 'The Equity Conversation',
    text: '"Mira, we need to talk about equity. I\'ve been writing 80% of the code. You\'ve been doing 80% of the sales. But we split 50/50. Is that still fair?"',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({
        ...s,
        product: Math.max(10, s.product - 3),
        pipeline: Math.max(2, s.pipeline - 3),
      }),
      feedback: 'The conversation you avoided became the elephant in every room. Resentment compounded monthly. Equity conversations don\'t get easier with time — they get worse.',
    },
    getChoices: () => [
      {
        text: 'Open discussion — what does "fair" mean for both of us?',
        effects: (s) => ({
          ...s,
          product: s.product + 2,
          pipeline: s.pipeline + 2,
        }),
        feedback: 'Three hours in a coffee shop. Uncomfortable, necessary. You agreed: 50/50 stays, but with a vesting acceleration clause tied to milestones. Both felt heard. The company is stronger for it.',
      },
      {
        text: 'Bring in a mediator — this is too important to wing',
        effects: (s) => ({
          ...s,
          cash: s.cash - 2000,
          product: s.product + 2,
          pipeline: s.pipeline + 2,
        }),
        feedback: 'The mediator asked questions neither of you would have asked. Restructured to 55/45 with clear role definitions. €2K for the session. Cheap insurance against a co-founder breakup.',
      },
    ],
  },

  {
    id: 'end_of_runway_clarity',
    saasOnly: true,
    speaker: 'Mira Chen',
    speakerRole: 'Co-founder, Product',
    months: [20, 21, 22, 23, 24],
    title: 'The Honest Conversation',
    getText: (s) => {
      const runway = s.runway ?? 12;
      const mrr = s.totalMRR ?? 0;
      if (runway < 6) return `"${runway} months of runway. €${mrr}/mo MRR. We need to decide: raise, sell, or get profitable. There\'s no fourth option."`;
      return `"We\'ve been at this for ${s.month} months. The metrics are ${mrr > 5000 ? 'strong' : mrr > 2000 ? 'okay' : 'concerning'}. What\'s the 3-year vision? Are we building a venture-scale business or a profitable niche tool?"`;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You avoided the question. It didn\'t go away. Your team, your investors, and your own midnight thoughts all want an answer.',
    },
    getChoices: () => [
      {
        text: 'Go for growth — raise money, hire, expand',
        effects: (s) => ({
          ...s,
          pipeline: s.pipeline + 6,
          burnRate: s.burnRate + 1000,
          salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
        }),
        feedback: 'The team is energized. A clear direction, even a risky one, is better than drift. Now you need to execute.',
      },
      {
        text: 'Go for profit — cut costs, focus on unit economics',
        effects: (s) => ({
          ...s,
          burnRate: Math.max(3000, s.burnRate - 2000),
          churn: Math.max(3, s.churn - 0.5),
          product: s.product + 2,
        }),
        feedback: 'Leaner. More focused. The team is smaller but every person matters. Profitability isn\'t sexy, but it\'s freedom.',
      },
    ],
  },
];
