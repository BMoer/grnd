// ═══════════════════════════════════════════════════════════════
// MARKETPLACE EVENTS — SwapCircle
// Cold start, two-sided dynamics, liquidity, network effects
// ═══════════════════════════════════════════════════════════════

export const MARKETPLACE_EVENTS = [
  {
    id: 'mp_chicken_egg',
    speaker: 'Lena Kowalski',
    speakerRole: 'Co-founder, Ops',
    months: [1, 2, 3],
    title: 'The Chicken-and-Egg Problem',
    text: '"We have 15 providers and 8 seekers. Providers complain there aren\'t enough seekers. Seekers complain there aren\'t enough providers. Classic marketplace cold start. Which side do we subsidize first?"',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, supply: Math.max(0, (s.supply ?? 15) - 2), demand: Math.max(0, (s.demand ?? 8) - 1) }),
      feedback: 'Both sides shrank. Without a deliberate strategy for the cold start, marketplaces die in the cradle.',
    },
    getChoices: () => [
      {
        text: 'Subsidize supply — pay providers to list, demand follows quality',
        dynamicFeedback: (s) => (s.demand ?? 8) > 12
          ? 'Smart. You already have reasonable demand. Adding quality supply created matches immediately. 3 transactions in week one.'
          : 'Providers listed but nobody hired them. Supply without demand is a ghost town. You subsidized the wrong side.',
        effects: (s) => (s.demand ?? 8) > 12
          ? { ...s, supply: (s.supply ?? 15) + 8, matches: (s.matches ?? 0) + 3, cash: s.cash - 2000, product: s.product + 2 }
          : { ...s, supply: (s.supply ?? 15) + 8, cash: s.cash - 2000, supplyChurn: Math.min(30, (s.supplyChurn ?? 12) + 2) },
      },
      {
        text: 'Subsidize demand — free credits for seekers, supply follows demand',
        dynamicFeedback: (s) => (s.supply ?? 15) > 15
          ? 'Seekers flooded in with free credits. Existing providers got busy immediately. First real liquidity spike.'
          : 'Seekers signed up but there weren\'t enough quality providers. Bad first experiences = they won\'t come back.',
        effects: (s) => (s.supply ?? 15) > 15
          ? { ...s, demand: (s.demand ?? 8) + 10, matches: (s.matches ?? 0) + 2, cash: s.cash - 1500, liquidity: Math.min(40, (s.liquidity ?? 0) + 5) }
          : { ...s, demand: (s.demand ?? 8) + 10, cash: s.cash - 1500, demandChurn: Math.min(30, (s.demandChurn ?? 15) + 3) },
      },
      {
        text: 'Seed both sides manually — curate 10 high-quality matches yourself',
        effects: (s) => ({
          ...s,
          supply: (s.supply ?? 15) + 3, demand: (s.demand ?? 8) + 3,
          matches: (s.matches ?? 0) + 4, transactions: (s.transactions ?? 0) + 3,
          product: s.product + 4,
          liquidity: Math.min(40, (s.liquidity ?? 0) + 8),
        }),
        feedback: 'Manual matchmaking. Unscalable but it works. 3 completed exchanges in week one. Both sides saw the platform work. That\'s the seed of trust.',
      },
    ],
  },

  {
    id: 'mp_quality_control',
    speaker: 'Marco Di Stefano',
    speakerRole: 'Co-founder, Design',
    months: [2, 3, 4],
    title: 'The Quality Problem',
    text: '"Two providers delivered terrible work. The seekers are furious. If we don\'t quality-gate supply, bad providers will kill trust. But gatekeeping limits growth."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, demandChurn: Math.min(30, (s.demandChurn ?? 15) + 3), product: Math.max(10, s.product - 3) }),
      feedback: 'No quality control. Word spread. Three seekers left. Trust is the foundation — without it, the marketplace is just a list.',
    },
    getChoices: () => [
      {
        text: 'Strict vetting — portfolio review + test project for all providers',
        effects: (s) => ({
          ...s,
          supply: Math.max(0, Math.round((s.supply ?? 15) * 0.7)),
          product: s.product + 6,
          matchRate: Math.min(40, (s.matchRate ?? 15) + 3),
          demandChurn: Math.max(3, (s.demandChurn ?? 15) - 2),
        }),
        feedback: 'Lost 30% of supply. The remaining providers are excellent. Match success rate jumped. Sometimes smaller supply with higher quality beats larger supply with noise.',
      },
      {
        text: 'Rating system — let the market self-regulate',
        effects: (s) => ({
          ...s,
          product: s.product + 3,
          burnRate: s.burnRate + 200,
        }),
        feedback: 'Ratings take time to accumulate. First 3 months: noise. After: self-regulation works. But you need enough transactions for ratings to be meaningful.',
      },
      {
        text: 'Guarantee — refund if quality is below standard',
        effects: (s) => ({
          ...s,
          cash: s.cash - Math.round((s.transactions ?? 2) * 50),
          demand: (s.demand ?? 8) + 3,
          demandChurn: Math.max(3, (s.demandChurn ?? 15) - 3),
          product: s.product + 2,
        }),
        feedback: 'Costs money upfront. But "satisfaction guaranteed" is powerful for marketplace trust. Demand-side conversion jumped 25%.',
      },
    ],
  },

  {
    id: 'mp_supply_focus',
    speaker: 'Lena Kowalski',
    speakerRole: 'Co-founder, Ops',
    months: [3, 4, 5, 6],
    title: 'The Niche vs. Broad Question',
    text: '"We started with all freelance skills. But our best matches are in design↔development swaps. Should we niche down to creative-tech, or stay broad?"',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You stayed broad by default. No category dominated. Users couldn\'t figure out what the platform was "for." Positioning matters.',
    },
    getChoices: () => [
      {
        text: 'Niche: creative-tech only — own one vertical before expanding',
        dynamicFeedback: (s) => (s.supply ?? 15) > 30
          ? 'You cut 40% of supply but tripled match rate in the remaining category. Liquidity spiked. At your scale, focus beats breadth.'
          : 'Niche makes sense early. Your 15 providers became 10, but they match 3x better. Smaller but alive beats bigger and dead.',
        effects: (s) => ({
          ...s,
          supply: Math.round((s.supply ?? 15) * 0.6),
          demand: Math.round((s.demand ?? 8) * 0.7),
          matchRate: Math.min(40, (s.matchRate ?? 15) + 5),
          product: s.product + 4,
          liquidity: Math.min(40, (s.liquidity ?? 0) + 8),
        }),
      },
      {
        text: 'Stay broad — network effects need volume',
        effects: (s) => ({
          ...s,
          supply: (s.supply ?? 15) + 3,
          demand: (s.demand ?? 8) + 2,
          matchRate: Math.max(2, (s.matchRate ?? 15) - 2),
        }),
        feedback: 'More categories, more users, worse matching. The breadth diluted your matching algorithm. Volume without density = low liquidity.',
      },
    ],
  },

  {
    id: 'mp_pricing_model',
    speaker: 'Marco Di Stefano',
    speakerRole: 'Co-founder, Design',
    months: [4, 5, 6, 7],
    title: 'The Monetization Moment',
    text: '"We\'ve been free. 0% take rate. Users love it. But we need revenue. When do we start charging, and how much?"',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, cash: s.cash - 1000 }),
      feedback: 'Still free. Cash drains. Free is a strategy, not a business model. At some point you need to flip the switch.',
    },
    getChoices: () => [
      {
        text: 'Start at 5% — barely noticeable, test the reaction',
        effects: (s) => ({
          ...s,
          takeRate: 5,
          revenue: Math.round((s.gmv ?? 0) * 0.05),
          supplyChurn: Math.min(30, (s.supplyChurn ?? 12) + 1),
        }),
        feedback: 'Mild grumbling. Two providers asked "why?" Most didn\'t notice. 5% is below pain threshold for most freelancers.',
      },
      {
        text: 'Go to 10% immediately — if they stay, the value is real',
        dynamicFeedback: (s) => (s.liquidity ?? 0) > 15
          ? 'When liquidity is strong, users pay for access. Churn ticked up 2% then stabilized. The platform is worth 10% to people who are actually getting matched.'
          : '15% of providers left immediately. Liquidity was already weak — charging made it worse. You monetized before proving value.',
        effects: (s) => (s.liquidity ?? 0) > 15
          ? { ...s, takeRate: 10, supplyChurn: Math.min(30, (s.supplyChurn ?? 12) + 2), demandChurn: Math.min(30, (s.demandChurn ?? 15) + 1) }
          : { ...s, takeRate: 10, supply: Math.round((s.supply ?? 15) * 0.85), supplyChurn: Math.min(30, (s.supplyChurn ?? 12) + 4) },
      },
    ],
  },

  {
    id: 'mp_network_effect',
    speaker: 'Lena Kowalski',
    speakerRole: 'Co-founder, Ops',
    months: [6, 7, 8, 9],
    title: 'The Network Effect Moment',
    getText: (s) => {
      const liq = s.liquidity ?? 0;
      return liq > 15
        ? '"Something shifted. Users are inviting other users. Organic signups doubled last week. This might be the network effect kicking in."'
        : '"We\'re stuck. Same users, same matches, no growth. The network effect isn\'t happening. What breaks the loop?"';
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, pipeline: Math.max(0, (s.pipeline ?? 5) - 2) }),
      feedback: 'The window passed. Network effects are momentum — if you don\'t feed them, they stall.',
    },
    getChoices: () => [
      {
        text: 'Referral program — both sides get credits for inviting',
        effects: (s) => ({
          ...s,
          supply: (s.supply ?? 15) + 5,
          demand: (s.demand ?? 8) + 5,
          cash: s.cash - 1500,
          viralCoeff: Math.min(150, (s.viralCoeff ?? 0) + 10),
        }),
        feedback: 'Credits cost money but referred users have 2x better retention. They come with social proof from someone they trust.',
      },
      {
        text: 'Community events — bring both sides together IRL',
        effects: (s) => ({
          ...s,
          cash: s.cash - 2000,
          product: s.product + 4,
          matchRate: Math.min(40, (s.matchRate ?? 15) + 2),
          liquidity: Math.min(40, (s.liquidity ?? 0) + 5),
          supply: (s.supply ?? 15) + 3, demand: (s.demand ?? 8) + 3,
        }),
        feedback: 'Freelancers met in person. 4 matches happened at the event. The trust built in 2 hours would have taken months online.',
      },
    ],
  },

  {
    id: 'mp_competitor',
    speaker: 'Marco Di Stefano',
    speakerRole: 'Co-founder, Design',
    months: [8, 9, 10, 11],
    title: 'The Multi-Homing Problem',
    text: '"Users are listing on our platform AND two competitors simultaneously. They compare offers across platforms. We have no lock-in."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, supplyChurn: Math.min(30, (s.supplyChurn ?? 12) + 2), demandChurn: Math.min(30, (s.demandChurn ?? 15) + 2) }),
      feedback: 'Multi-homing continued. Your platform became one of three tabs. Without differentiation, you compete on price — and you\'re the smallest.',
    },
    getChoices: () => [
      {
        text: 'Build switching costs — project history, reputation, portfolio on-platform',
        apCost: 2,
        effects: (s) => ({
          ...s,
          product: s.product + 5,
          supplyChurn: Math.max(3, (s.supplyChurn ?? 12) - 2),
          demandChurn: Math.max(3, (s.demandChurn ?? 15) - 2),
          burnRate: s.burnRate + 500,
        }),
        feedback: 'Invested in on-platform identity. Providers built portfolios they don\'t want to recreate elsewhere. The lock-in is soft but real.',
      },
      {
        text: 'Exclusive deals — premium providers commit to us only',
        effects: (s) => ({
          ...s,
          supply: Math.max(0, Math.round((s.supply ?? 15) * 0.8)),
          matchRate: Math.min(40, (s.matchRate ?? 15) + 3),
          product: s.product + 2,
        }),
        feedback: 'Lost 20% of supply but the remaining are exclusive. Demand knows they can only find these providers here. Scarcity creates value.',
      },
    ],
  },

  {
    id: 'mp_trust_incident',
    speaker: 'Support Team',
    speakerRole: 'Customer Support',
    months: [5, 6, 7, 8, 9, 10, 11, 12],
    title: 'The Trust Breach',
    getText: () => {
      const variants = [
        '"A provider took payment and disappeared. The seeker wants a refund. We don\'t have an escrow system."',
        '"A seeker got a deliverable that was clearly AI-generated, not the custom work they paid for. Both sides are angry."',
        '"Two users had a payment dispute that escalated to threats. We need a resolution process."',
      ];
      return variants[Math.floor(Math.random() * variants.length)];
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, demandChurn: Math.min(30, (s.demandChurn ?? 15) + 3), product: Math.max(10, s.product - 3), liquidity: Math.max(0, (s.liquidity ?? 0) - 5) }),
      feedback: 'No resolution. The seeker posted on social media. Trust is the oxygen of marketplaces — one unresolved dispute poisons the well.',
    },
    getChoices: () => [
      {
        text: 'Build escrow + dispute resolution system',
        apCost: 2,
        effects: (s) => ({
          ...s,
          product: s.product + 5,
          burnRate: s.burnRate + 500,
          demandChurn: Math.max(3, (s.demandChurn ?? 15) - 2),
          matchRate: Math.min(40, (s.matchRate ?? 15) + 1),
        }),
        feedback: 'Expensive but necessary. Escrow means seekers pay with confidence. Dispute resolution means both sides feel protected. Trust infrastructure.',
      },
      {
        text: 'Refund from company funds + personal apology',
        effects: (s) => ({
          ...s,
          cash: s.cash - Math.round((s.avgTransaction ?? 300) * 1.5),
          product: s.product + 2,
          demand: (s.demand ?? 8) + 1,
        }),
        feedback: 'Handled it personally. The seeker stayed and told friends about the experience. But you can\'t do this for every dispute.',
      },
    ],
  },

  {
    id: 'mp_expansion',
    speaker: 'Lena Kowalski',
    speakerRole: 'Co-founder, Ops',
    months: [12, 13, 14, 15, 16, 17],
    title: 'The Geography Question',
    text: '"We\'re strong in Berlin but skill exchanges need proximity (or at least timezone overlap). Vienna is asking. Do we expand or deepen Berlin first?"',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'Stayed in Berlin by default. The network density is good but the ceiling is approaching. Geography is a natural expansion lever for marketplaces.',
    },
    getChoices: () => [
      {
        text: 'Expand to Vienna — replay the cold start in a new city',
        apCost: 2,
        effects: (s) => ({
          ...s,
          supply: (s.supply ?? 15) + 8,
          demand: (s.demand ?? 8) + 6,
          cash: s.cash - 5000,
          burnRate: s.burnRate + 1000,
          matchRate: Math.max(2, (s.matchRate ?? 15) - 3), // diluted across cities initially
        }),
        feedback: 'Cold start again. Vienna has different dynamics. Match rate dropped because the algorithm now pools two cities. But TAM just doubled.',
      },
      {
        text: 'Deepen Berlin — dominate one market before expanding',
        effects: (s) => ({
          ...s,
          supply: (s.supply ?? 15) + 4,
          demand: (s.demand ?? 8) + 4,
          matchRate: Math.min(40, (s.matchRate ?? 15) + 2),
          liquidity: Math.min(40, (s.liquidity ?? 0) + 3),
          product: s.product + 3,
        }),
        feedback: 'Density first. More providers + demand in one city = better matching = higher liquidity. The network effect compounds in a dense market.',
      },
    ],
  },

  {
    id: 'mp_platform_play',
    speaker: 'Marco Di Stefano',
    speakerRole: 'Co-founder, Design',
    months: [14, 15, 16, 17, 18, 19, 20],
    title: 'The Platform Evolution',
    text: '"We could add payment processing, contracts, invoicing — become the full freelancer OS. Or stay focused on matching. Platform plays are tempting but complex."',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'Stayed as a matching platform. Simple, but the value capture is limited. Users match here, then work and pay off-platform.',
    },
    getChoices: () => [
      {
        text: 'Build the freelancer OS — payments, contracts, invoicing',
        apCost: 2,
        effects: (s) => ({
          ...s,
          product: s.product + 5,
          burnRate: s.burnRate + 2000,
          takeRate: Math.min(25, (s.takeRate ?? 10) + 3),
          supplyChurn: Math.max(3, (s.supplyChurn ?? 12) - 3),
          demandChurn: Math.max(3, (s.demandChurn ?? 15) - 3),
        }),
        feedback: 'Massive investment. But now users have no reason to leave the platform. Payments on-platform means you see every transaction. Take rate justified by the full stack.',
      },
      {
        text: 'Stay focused on matching — do one thing brilliantly',
        effects: (s) => ({
          ...s,
          matchRate: Math.min(40, (s.matchRate ?? 15) + 3),
          product: s.product + 4,
        }),
        feedback: 'The matching algorithm got 30% better. Users still pay off-platform sometimes, but the matches are so good they keep coming back. Focus is a competitive advantage.',
      },
    ],
  },
];
