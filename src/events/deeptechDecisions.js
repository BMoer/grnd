// ═══════════════════════════════════════════════════════════════
// DECISION EVENTS — Deep-Tech Class (NanoSense)
// R&D milestones, certification, grants, LOIs, lab life
// ═══════════════════════════════════════════════════════════════

export const DEEPTECH_EVENTS = [
  {
    id: 'dt_lab_vs_market',
    speaker: 'Thomas Huber',
    speakerRole: 'Co-founder, Food Safety',
    months: [1, 2, 3],
    title: 'Lab or Market First?',
    text: '"Sarah wants to perfect the sensor accuracy to 99.9%. I think we should talk to food manufacturers now with 95% accuracy. Both are valid — but we can\'t do both."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, product: Math.max(10, s.product - 1) }),
      feedback: 'Neither happened well. Sarah tinkered in the lab. Thomas made half-hearted calls. The worst of both worlds.',
    },
    getChoices: () => [
      {
        text: 'Lab first — the science must be bulletproof before we talk to anyone',
        dynamicFeedback: (s) => (s.certProgress ?? 0) > 20
          ? 'Certification is already progressing. More lab time improved accuracy from 95% to 98.2%. But the food manufacturers you didn\'t call signed LOIs with a competitor.'
          : 'Smart at this stage. The extra month in the lab found a calibration error that would have torpedoed the first pilot. Foundation before walls.',
        effects: (s) => (s.certProgress ?? 0) > 20
          ? { ...s, product: s.product + 5, pilotConversations: Math.max(0, (s.pilotConversations ?? 0) - 1) }
          : { ...s, product: s.product + 7, certProgress: Math.min(100, (s.certProgress ?? 0) + 3) },
      },
      {
        text: 'Market first — 95% accuracy is enough to start conversations',
        dynamicFeedback: (s) => (s.product ?? 20) < 30
          ? 'The demo failed in front of the first prospect. 95% accuracy in the lab turned out to be 82% on a real production line. You demoed too early.'
          : 'Two food manufacturers agreed to discuss pilots. They don\'t need 99.9% — they need "better than what we have now." The bar was lower than Sarah thought.',
        effects: (s) => (s.product ?? 20) < 30
          ? { ...s, product: Math.max(10, s.product - 2), pilotConversations: (s.pilotConversations ?? 0) + 1 }
          : { ...s, pilotConversations: (s.pilotConversations ?? 0) + 2, pipeline: (s.pipeline ?? 3) + 1, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.3) },
      },
    ],
  },

  {
    id: 'dt_patent',
    speaker: 'Dr. Sarah Lindström',
    speakerRole: 'Co-founder, Materials Science',
    months: [2, 3, 4],
    title: 'The Patent Question',
    text: '"We should file a patent. The molecular binding mechanism is novel. But patent attorneys cost €8-15K, and the process takes 18 months. Do we need it now?"',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'No patent filed. If a competitor reverse-engineers your sensor, you have no legal protection. IP is the moat in deep-tech.',
    },
    getChoices: () => [
      {
        text: 'File now — IP is the moat',
        effects: (s) => ({
          ...s,
          cash: s.cash - 10000,
          ipFilings: (s.ipFilings ?? 0) + 1,
          product: s.product + 2,
        }),
        feedback: '€10K for the filing. 18 months to grant. But "patent pending" on your pitch deck changes how investors and partners perceive you. IP = defensibility.',
      },
      {
        text: 'Provisional patent — cheaper, buys 12 months',
        effects: (s) => ({
          ...s,
          cash: s.cash - 3000,
          ipFilings: (s.ipFilings ?? 0) + 1,
        }),
        feedback: '€3K for a provisional. Clock starts ticking — you have 12 months to file the full patent. Buys time and "patent pending" status at 70% lower cost.',
      },
      {
        text: 'Skip — trade secrets are enough for now',
        effects: (s) => ({
          ...s,
          product: s.product + 2,
        }),
        feedback: 'Saved €10K. But if someone publishes similar research, you lose the ability to patent. In deep-tech, timing is everything.',
      },
    ],
  },

  {
    id: 'dt_cert_setback',
    speaker: 'Dr. Sarah Lindström',
    speakerRole: 'Co-founder, Materials Science',
    months: [4, 5, 6, 7, 8],
    title: 'Certification Setback',
    getText: (s) => {
      const cert = Math.round(s.certProgress ?? 0);
      return `"The testing lab flagged an issue with our biocompatibility data. Certification progress: ${cert}%. We need to redo 6 weeks of testing. Or we can challenge the finding — it might be a misinterpretation."`;
    },
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s, certProgress: Math.max(0, (s.certProgress ?? 0) - 10), product: Math.max(10, s.product - 3) }),
      feedback: 'You did nothing. The flag became a formal objection. Certification set back 10%. In regulated industries, ignoring problems makes them bigger.',
    },
    getChoices: () => [
      {
        text: 'Redo the testing — do it right, no shortcuts',
        apCost: 2,
        effects: (s) => ({
          ...s,
          certProgress: Math.max(0, (s.certProgress ?? 0) - 5),
          cash: s.cash - 5000,
          product: s.product + 4,
        }),
        feedback: '6 weeks. €5K in lab costs. The redo confirmed your original data AND found a way to improve the biocompatibility score. The setback became an improvement.',
      },
      {
        text: 'Challenge the finding — bring in an independent expert',
        dynamicFeedback: (s) => (s.product ?? 20) > 45
          ? 'The expert reviewed your data and sided with you. The testing lab accepted the challenge. No setback. €3K for the expert was cheap insurance.'
          : 'The expert found the lab was right — your data had a gap. The challenge backfired. Now the lab views you as adversarial. Added 2 months to the timeline.',
        effects: (s) => (s.product ?? 20) > 45
          ? { ...s, cash: s.cash - 3000, product: s.product + 2 }
          : { ...s, cash: s.cash - 3000, certProgress: Math.max(0, (s.certProgress ?? 0) - 12), product: Math.max(10, s.product - 2) },
      },
    ],
  },

  {
    id: 'dt_first_loi',
    speaker: 'Thomas Huber',
    speakerRole: 'Co-founder, Food Safety',
    months: [5, 6, 7, 8, 9],
    title: 'The First LOI',
    text: '"A dairy company in Upper Austria wants a Letter of Intent for 10 sensors. It\'s non-binding, but it\'s the first real signal of commercial interest. They want to see certification progress."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You didn\'t follow up. The dairy company\'s procurement cycle moved on. In deep-tech, windows close slowly but permanently.',
    },
    getChoices: () => [
      {
        text: 'Visit them on-site — show the prototype in their production line',
        dynamicFeedback: (s) => (s.certProgress ?? 0) > 40
          ? 'The QA manager held the sensor. "This changes everything for our recall prevention." LOI signed same day. When certification is credible, demo visits convert.'
          : 'They were impressed by the science but worried about certification timeline. "Come back when you\'re closer to approval." The visit built relationship capital, not an LOI.',
        effects: (s) => (s.certProgress ?? 0) > 40
          ? { ...s, lois: (s.lois ?? 0) + 1, pilotConversations: (s.pilotConversations ?? 0) + 2, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.4) }
          : { ...s, pilotConversations: (s.pilotConversations ?? 0) + 1, salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.2) },
      },
      {
        text: 'Send documentation — let the science speak',
        effects: (s) => ({
          ...s,
          pilotConversations: (s.pilotConversations ?? 0) + 1,
        }),
        feedback: 'They read the whitepaper. Asked 3 follow-up questions. No LOI yet but they\'re in the pipeline. In enterprise sales, patience is a currency.',
      },
    ],
  },

  {
    id: 'dt_grant_extension',
    speaker: 'Dr. Sarah Lindström',
    speakerRole: 'Co-founder, Materials Science',
    months: [8, 9, 10, 11, 12],
    title: 'The Grant Extension',
    getText: (s) => {
      const grantRem = Math.round((s.grantRemaining ?? 0) / 1000);
      return `"FFG offers a grant extension: €100K more, but they want to see certification above 60% and at least 1 LOI. We have ${Math.round(s.certProgress ?? 0)}% certification and ${s.lois ?? 0} LOIs. Grant remaining: €${grantRem}K."`;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You didn\'t apply. The €100K went to another deep-tech startup. Grant money is the cheapest capital you\'ll ever see.',
    },
    getChoices: () => [
      {
        text: 'Apply for the extension — we meet the criteria',
        dynamicFeedback: (s) => ((s.certProgress ?? 0) > 55 && (s.lois ?? 0) >= 1)
          ? 'Approved. €100K non-dilutive. Runway extended by 6+ months. The grant committee noted your "clear path to commercialization."'
          : 'Rejected. "Insufficient progress toward milestones." The application consumed a week of Sarah\'s time. Sometimes you\'re not ready, and that\'s information too.',
        effects: (s) => ((s.certProgress ?? 0) > 55 && (s.lois ?? 0) >= 1)
          ? { ...s, cash: s.cash + 100000, grantRemaining: (s.grantRemaining ?? 0) + 100000, grantTotal: (s.grantTotal ?? 300000) + 100000 }
          : { ...s, product: s.product + 1 },
      },
      {
        text: 'Not ready — focus on hitting the milestones first',
        effects: (s) => ({
          ...s,
          product: s.product + 3,
          certProgress: Math.min(100, (s.certProgress ?? 0) + 2),
        }),
        feedback: 'Discipline. You know you\'re not ready. Better to come back strong than submit a weak application.',
      },
    ],
  },

  {
    id: 'dt_hire_researcher',
    speaker: 'Dr. Sarah Lindström',
    speakerRole: 'Co-founder, Materials Science',
    months: [4, 5, 6, 7],
    title: 'The Key Hire',
    text: '"A postdoc from ETH Zurich applied. Specialist in molecular sensors. She\'d accelerate our R&D by 6 months. But she costs €6K/month and wants to know we have 18 months of runway."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'She joined a competitor. The 6-month acceleration you didn\'t buy will now work against you.',
    },
    getChoices: () => [
      {
        text: 'Hire her — the science justifies the cost',
        dynamicFeedback: (s) => (s.runway ?? 12) > 12
          ? 'She started in 2 weeks. By month 2, she\'d optimized the sensor coating process. R&D velocity jumped 40%. The right hire at the right stage transforms everything.'
          : 'She started, but the runway question haunted every standup. At 10 months of runway, adding €6K/month burn means you run out 3 months sooner. Great hire, terrifying timing.',
        effects: (s) => ({
          ...s,
          rdBurn: (s.rdBurn ?? 15000) + 6000,
          burnRate: (s.burnRate ?? 15000) + 6000,
          product: s.product + 5,
          certProgress: Math.min(100, (s.certProgress ?? 0) + 4),
          teamSize: (s.teamSize ?? 2) + 1,
          cash: s.cash - 3000,
        }),
      },
      {
        text: 'Offer a 3-month contract — test the fit first',
        effects: (s) => ({
          ...s,
          rdBurn: (s.rdBurn ?? 15000) + 6000,
          burnRate: (s.burnRate ?? 15000) + 6000,
          product: s.product + 3,
          certProgress: Math.min(100, (s.certProgress ?? 0) + 2),
        }),
        feedback: '3 months. She delivered, but held back — why invest fully in a temp gig? You got 60% of her potential. Contract hiring is risk management with a talent cost.',
      },
    ],
  },

  {
    id: 'dt_conference_demo',
    speaker: 'Thomas Huber',
    speakerRole: 'Co-founder, Food Safety',
    months: [6, 7, 8, 9, 10, 11],
    title: 'The Industry Conference',
    text: '"Food Safety Summit in Munich. 500 QA managers from food manufacturers. A booth costs €5K. A speaking slot costs nothing but requires a published paper."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You skipped the conference. Your competitors didn\'t. They collected 30 business cards from your future customers.',
    },
    getChoices: () => [
      {
        text: 'Book the booth — €5K for 500 potential customers',
        effects: (s) => ({
          ...s,
          cash: s.cash - 5000,
          pilotConversations: (s.pilotConversations ?? 0) + 4,
          pipeline: Math.min(10, (s.pipeline ?? 3) + 2),
          salesEffort: Math.min(1, (s.salesEffort ?? 0) + 0.5),
        }),
        feedback: '4 serious conversations. One QA manager said "I\'ve been looking for exactly this for 3 years." The booth paid for itself in pipeline.',
      },
      {
        text: 'Submit a paper and get the speaking slot — free',
        apCost: 2,
        effects: (s) => ({
          ...s,
          product: s.product + 3,
          pilotConversations: (s.pilotConversations ?? 0) + 3,
          pipeline: Math.min(10, (s.pipeline ?? 3) + 2),
          ipFilings: (s.ipFilings ?? 0) + (Math.random() > 0.5 ? 1 : 0),
        }),
        feedback: 'The paper took 2 weeks but the talk positioned you as the scientific authority. 3 companies approached you afterward. Credibility in deep-tech is your best sales tool.',
      },
    ],
  },

  {
    id: 'dt_investor_interest',
    speaker: 'Deep-Tech VC Partner',
    speakerRole: 'Investor',
    months: [10, 11, 12, 13, 14, 15],
    title: 'The VC Meeting',
    getText: (s) => {
      const cert = Math.round(s.certProgress ?? 0);
      const lois = s.lois ?? 0;
      return `"We invest in deep-tech. Your sensor is interesting. Certification at ${cert}%, ${lois} LOIs. We typically invest €500K-€2M at this stage. Want to explore?"`;
    },
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You didn\'t engage. The VC invested in a competing sensor company. In deep-tech, the funding windows are narrow.',
    },
    getChoices: () => [
      {
        text: 'Take the meeting — start the fundraise process',
        apCost: 2,
        dynamicFeedback: (s) => {
          const cert = s.certProgress ?? 0;
          const lois = s.lois ?? 0;
          if (cert > 65 && lois >= 2) return `€800K raised. Your certification progress and LOIs told a compelling story. The funding buys 12+ months and credibility.`;
          if (cert > 40 || lois >= 1) return `€300K bridge round. They want to see certification complete before the full round. It buys time.`;
          return 'They passed. "Come back post-certification." Two months of distracted leadership for no check. But you know what they need.';
        },
        effects: (s) => {
          const cert = s.certProgress ?? 0;
          const lois = s.lois ?? 0;
          if (cert > 65 && lois >= 2) return { ...s, cash: s.cash + 800000, burnRate: (s.burnRate ?? 15000) + 1000 };
          if (cert > 40 || lois >= 1) return { ...s, cash: s.cash + 300000 };
          return { ...s, product: Math.max(10, s.product - 1) };
        },
      },
      {
        text: 'Not yet — certification first, then fundraise from strength',
        effects: (s) => ({
          ...s,
          product: s.product + 3,
          certProgress: Math.min(100, (s.certProgress ?? 0) + 2),
        }),
        feedback: 'Discipline. Deep-tech VCs respect founders who know their milestones. You\'ll get a better valuation post-certification.',
      },
    ],
  },

  {
    id: 'dt_production_decision',
    speaker: 'Thomas Huber',
    speakerRole: 'Co-founder, Food Safety',
    months: [12, 13, 14, 15, 16, 17],
    title: 'The Production Question',
    text: '"Certification is approaching. We need to decide: build production in-house (control + margin, €50K setup) or contract manufacture (faster, lower upfront, higher unit cost)?"',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You didn\'t decide. When certification completes, you\'ll have LOIs and no way to fulfill them. Planning production in advance is not premature — it\'s necessary.',
    },
    getChoices: () => [
      {
        text: 'In-house production — invest €50K now',
        apCost: 2,
        effects: (s) => ({
          ...s,
          cash: s.cash - 50000,
          unitCost: Math.round((s.unitCost ?? 500) * 0.7),
          product: s.product + 3,
        }),
        feedback: 'Lab-to-production line in 8 weeks. Unit cost dropped 30%. You control quality and timeline. But €50K upfront when cash is tight.',
      },
      {
        text: 'Contract manufacturer — faster, lower risk',
        effects: (s) => ({
          ...s,
          unitCost: Math.round((s.unitCost ?? 500) * 1.2),
          cash: s.cash - 5000,
          product: s.product + 1,
        }),
        feedback: 'Partner found in 2 weeks. Unit cost 20% higher but no setup investment. You can start producing immediately post-certification. Flexibility over margin.',
      },
    ],
  },

  {
    id: 'dt_regulatory_change',
    speaker: 'Dr. Sarah Lindström',
    speakerRole: 'Co-founder, Materials Science',
    months: [8, 9, 10, 11, 12, 13, 14],
    title: 'Regulatory Landscape Shift',
    text: '"The EU just updated the food contact materials regulation. New requirements for sensor devices used in food production. Our certification path may need adjustment."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, certProgress: Math.max(0, (s.certProgress ?? 0) - 8) }),
      feedback: 'You ignored the regulatory change. The certification body flagged it during review. 8% progress lost. In deep-tech, regulatory awareness is survival.',
    },
    getChoices: () => [
      {
        text: 'Hire a regulatory consultant — understand the impact immediately',
        effects: (s) => ({
          ...s,
          cash: s.cash - 5000,
          certProgress: Math.max(0, (s.certProgress ?? 0) - 3),
          product: s.product + 2,
        }),
        feedback: 'The consultant found that 80% of your existing work still applies. Only the packaging material needs retesting. €5K and 3% setback instead of 15%.',
      },
      {
        text: 'Adapt ourselves — read the regulation, adjust the submission',
        effects: (s) => ({
          ...s,
          certProgress: Math.max(0, (s.certProgress ?? 0) - 6),
          product: s.product + 3,
        }),
        feedback: 'Took 3 weeks to understand the changes. You learned the regulatory landscape deeply. But the self-assessment missed one clause that cost you another 3%.',
      },
    ],
  },

  {
    id: 'dt_first_sale',
    speaker: 'Thomas Huber',
    speakerRole: 'Co-founder, Food Safety',
    months: [14, 15, 16, 17, 18, 19, 20, 21],
    title: 'The First Commercial Order',
    getText: (s) => {
      if (!(s.certComplete)) return '"A large food manufacturer wants to buy 5 sensors — but only after certification is complete. They\'re willing to sign a binding purchase order conditional on CE marking."';
      return '"Certification is done. The dairy company that signed the LOI wants to order 5 sensors. This is the first real commercial sale. How do we price it?"';
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You hesitated. The manufacturer went with a competitor\'s less accurate but already certified device. Timing matters more than perfection.',
    },
    getChoices: () => [
      {
        text: 'Standard pricing — €2,000/unit, standard terms',
        dynamicFeedback: (s) => (s.certComplete)
          ? 'They ordered 5 units. €10,000 in revenue. Your first commercial sale. The invoice had Sarah\'s hands shaking. "This is real now."'
          : 'Purchase order signed, conditional on certification. It\'s not revenue yet, but it\'s commitment. And it turns your LOI into a binding order.',
        effects: (s) => (s.certComplete)
          ? { ...s, unitsSold: (s.unitsSold ?? 0) + 5, customers: (s.customers ?? 0) + 1, revenue: (s.revenue ?? 0) + 10000, cash: s.cash + 10000, lois: Math.max(0, (s.lois ?? 0) - 1) }
          : { ...s, lois: (s.lois ?? 0) + 1, pipeline: Math.min(10, (s.pipeline ?? 3) + 1) },
      },
      {
        text: 'Discount for first customer — €1,500/unit, build the reference',
        effects: (s) => (s.certComplete)
          ? { ...s, unitsSold: (s.unitsSold ?? 0) + 5, customers: (s.customers ?? 0) + 1, revenue: (s.revenue ?? 0) + 7500, cash: s.cash + 7500, lois: Math.max(0, (s.lois ?? 0) - 1), pipeline: Math.min(10, (s.pipeline ?? 3) + 2) }
          : { ...s, lois: (s.lois ?? 0) + 1, pipeline: Math.min(10, (s.pipeline ?? 3) + 2) },
        feedback: '25% discount. But the reference value is worth 10x the margin you gave up. "If [Company X] uses it, we should look at it too."',
      },
    ],
  },
];
