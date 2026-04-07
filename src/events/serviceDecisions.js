// ═══════════════════════════════════════════════════════════════
// SERVICE EVENTS — StrategyForge
// Consulting: client relationships, margins, utilization, productization
// ═══════════════════════════════════════════════════════════════

export const SERVICE_EVENTS = [
  {
    id: 'sv_scope_creep',
    speaker: 'David Ashworth',
    speakerRole: 'Co-founder, Strategy',
    months: [1, 2, 3],
    title: 'The Scope Creep',
    text: '"The client loves the work but keeps adding requests. \'Can you also do the competitor analysis? And the financial projections?\' We quoted €5K. We\'ve done €8K of work."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, grossMargin: Math.max(10, (s.grossMargin ?? 45) - 8), utilization: Math.min(120, (s.utilization ?? 50) + 15) }),
      feedback: 'You did the extra work for free. Margin collapsed. The client is happy, your bank account isn\'t. Scope creep is the silent margin killer in consulting.',
    },
    getChoices: () => [
      {
        text: 'Push back — "That\'s a separate engagement. Here\'s a quote."',
        dynamicFeedback: (s) => (s.activeClients ?? 2) > 4
          ? 'They respected the boundary. Signed the additional scope as a new €3K project. When you have multiple clients, you can afford to be firm.'
          : 'They paused. "We thought this was included." Awkward. They signed eventually but the relationship cooled. When they\'re your only client, pushback is risky.',
        effects: (s) => (s.activeClients ?? 2) > 4
          ? { ...s, revenue: (s.revenue ?? 8000) + 3000, cash: s.cash + 3000, grossMargin: Math.min(75, (s.grossMargin ?? 45) + 3) }
          : { ...s, revenue: (s.revenue ?? 8000) + 2000, cash: s.cash + 2000, repeatRate: Math.max(3, (s.repeatRate ?? 20) - 3) },
      },
      {
        text: 'Do it, but use it as the AI template for future clients',
        effects: (s) => ({
          ...s,
          product: s.product + 5,
          grossMargin: Math.max(10, (s.grossMargin ?? 45) - 3),
          utilization: Math.min(120, (s.utilization ?? 50) + 10),
        }),
        feedback: 'Margin hit on this project. But you templated the competitor analysis with AI. Next client gets it in 2 hours instead of 20. The productization play.',
      },
      {
        text: 'Split the difference — do half for free, quote the rest',
        effects: (s) => ({
          ...s,
          revenue: (s.revenue ?? 8000) + 1500, cash: s.cash + 1500,
          repeatRate: Math.min(60, (s.repeatRate ?? 20) + 2),
          grossMargin: Math.max(10, (s.grossMargin ?? 45) - 2),
        }),
        feedback: 'Client felt cared for but not taken advantage of. The relationship deepened. Not optimal economics but good long-term play.',
      },
    ],
  },

  {
    id: 'sv_productize',
    speaker: 'Priya Sharma',
    speakerRole: 'Co-founder, AI/ML',
    months: [2, 3, 4, 5],
    title: 'The Productization Question',
    text: '"I can automate 60% of the strategy analysis with AI. It would take 2 months. During that time, our delivery capacity drops. But after: each project takes half the time."',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s, utilization: Math.min(120, (s.utilization ?? 50) + 5) }),
      feedback: 'No productization. Each new client takes the same manual effort. You\'re selling hours, not value. The hamster wheel speeds up.',
    },
    getChoices: () => [
      {
        text: 'Build it — 2 months of reduced capacity for long-term leverage',
        apCost: 2,
        dynamicFeedback: (s) => (s.activeClients ?? 2) > 5
          ? 'Risky with 6 clients. Priya disappeared into the code. David handled clients alone. Two deliveries were late. But month 3: the AI tool halved delivery time.'
          : 'Good timing. With only a few clients, the capacity hit was manageable. The AI tool shipped in 6 weeks. Delivery time dropped 50%.',
        effects: (s) => ({
          ...s,
          product: s.product + 8,
          grossMargin: Math.min(75, (s.grossMargin ?? 45) + 10),
          utilization: Math.max(0, (s.utilization ?? 50) - 20),
          burnRate: s.burnRate + 500,
        }),
      },
      {
        text: 'Incremental — automate one module at a time while delivering',
        effects: (s) => ({
          ...s,
          product: s.product + 4,
          grossMargin: Math.min(75, (s.grossMargin ?? 45) + 4),
        }),
        feedback: 'Slower but safer. Each sprint automated one analysis module. After 4 months, 40% automated. No capacity disruption. The tortoise approach.',
      },
    ],
  },

  {
    id: 'sv_big_client',
    speaker: 'David Ashworth',
    speakerRole: 'Co-founder, Strategy',
    months: [3, 4, 5, 6],
    title: 'The Dream Client',
    text: '"A Fortune 500 company wants a strategy project. €30K budget. But they need dedicated attention for 6 weeks. That\'s 80% of our capacity for one client."',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You passed. The €30K went to a competitor. They now have that logo on their website. In consulting, references compound.',
    },
    getChoices: () => [
      {
        text: 'Take it — this is the logo that opens doors',
        dynamicFeedback: (s) => (s.utilization ?? 50) > 70
          ? 'You took it but were already at 70%+ utilization. Other clients suffered. Two complained about delayed deliverables. The €30K cost you €12K in churn.'
          : 'Delivered beautifully. The VP of Strategy recommended you to 3 other companies. One became your next client. The logo effect is real in consulting.',
        effects: (s) => (s.utilization ?? 50) > 70
          ? { ...s, cash: s.cash + 30000, revenue: (s.revenue ?? 8000) + 30000, utilization: 120, repeatRate: Math.max(3, (s.repeatRate ?? 20) - 5), activeClients: Math.max(1, (s.activeClients ?? 2) - 1) }
          : { ...s, cash: s.cash + 30000, revenue: (s.revenue ?? 8000) + 30000, pipeline: (s.pipeline ?? 5) + 4, utilization: Math.min(120, (s.utilization ?? 50) + 30), product: s.product + 3 },
      },
      {
        text: 'Counter: phased approach over 3 months instead of 6 weeks',
        effects: (s) => ({
          ...s,
          cash: s.cash + 15000,
          revenue: (s.revenue ?? 8000) + 15000,
          pipeline: (s.pipeline ?? 5) + 2,
          utilization: Math.min(120, (s.utilization ?? 50) + 15),
        }),
        feedback: 'They agreed to a smaller Phase 1. Less revenue but manageable capacity. If Phase 1 goes well, Phase 2 is a €20K upsell.',
      },
    ],
  },

  {
    id: 'sv_utilization_crisis',
    speaker: 'David Ashworth',
    speakerRole: 'Co-founder, Strategy',
    months: [5, 6, 7, 8, 9],
    title: 'The Burnout Edge',
    getText: (s) => {
      const util = s.utilization ?? 50;
      if (util > 100) return `"${util}% utilization. We\'re working evenings and weekends. Priya missed a deadline for the first time ever. Something has to give."`;
      if (util > 80) return `"${util}% utilization. We\'re busy but manageable. The question: do we take on one more client or invest in capacity?"`;
      return `"${util}% utilization. We have headroom but revenue is flat. We need more clients or we need to raise prices."`;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, burnoutMonths: (s.burnoutMonths ?? 0) + ((s.utilization ?? 50) > 100 ? 1 : 0) }),
      feedback: 'Status quo. If utilization is above 100%, every month you don\'t act costs quality, health, and eventually clients.',
    },
    getChoices: () => [
      {
        text: 'Hire a senior consultant — €6K/mo, adds 160h capacity',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 6000,
          teamCapacity: (s.teamCapacity ?? 320) + 160,
          teamSize: (s.teamSize ?? 2) + 1,
          utilization: Math.round((s.billableHours ?? 160) / ((s.teamCapacity ?? 320) + 160) * 100),
          cash: s.cash - 4000,
        }),
        feedback: 'Capacity jump. Utilization dropped 30 points. But burn increased €6K/mo. You need to fill that capacity or you\'re burning cash for idle hours.',
      },
      {
        text: 'Raise prices 25% — same work, better economics',
        dynamicFeedback: (s) => (s.repeatRate ?? 20) > 25
          ? 'Existing clients accepted the increase. Strong relationships absorb price hikes. Revenue per project jumped without adding hours.'
          : 'Two pipeline prospects ghosted after seeing the new rate. When repeat is weak, price increases thin the funnel.',
        effects: (s) => ({
          ...s,
          avgProject: Math.round((s.avgProject ?? 5000) * 1.25),
          price: Math.round((s.avgProject ?? 5000) * 1.25),
          grossMargin: Math.min(75, (s.grossMargin ?? 45) + 8),
          closeRate: Math.max(5, (s.closeRate ?? 25) - 3),
        }),
      },
      {
        text: 'Drop the worst client — free up capacity for better ones',
        effects: (s) => ({
          ...s,
          activeClients: Math.max(1, (s.activeClients ?? 2) - 1),
          utilization: Math.max(0, (s.utilization ?? 50) - 25),
          grossMargin: Math.min(75, (s.grossMargin ?? 45) + 5),
          burnoutMonths: Math.max(0, (s.burnoutMonths ?? 0) - 1),
        }),
        feedback: 'Fired a client. Feels wrong but freed 40h/month. Used the time to improve the AI tool. Sometimes subtraction is the growth move.',
      },
    ],
  },

  {
    id: 'sv_retainer_offer',
    speaker: 'Client',
    speakerRole: 'Existing Client',
    months: [6, 7, 8, 9, 10],
    title: 'The Retainer Request',
    text: '"We love working with you. Instead of project-by-project, can we do a €3K/month retainer? We\'d get 15 hours of your time guaranteed."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You didn\'t respond. They found another consultant who offered a retainer. Predictable revenue walked away.',
    },
    getChoices: () => [
      {
        text: 'Accept — predictable revenue is worth the commitment',
        effects: (s) => ({
          ...s,
          repeatRate: Math.min(60, (s.repeatRate ?? 20) + 5),
          revenue: (s.revenue ?? 8000) + 3000,
          totalMRR: (s.totalMRR ?? 8000) + 3000,
          utilization: Math.min(120, (s.utilization ?? 50) + 10),
        }),
        feedback: 'Monthly retainer locked in. Predictable cash flow changed planning entirely. But 15h/month is committed regardless of other demands.',
      },
      {
        text: 'Counter: €4K/month for 20 hours — value your time correctly',
        dynamicFeedback: (s) => (s.product ?? 40) > 50
          ? 'They accepted. Your AI-augmented delivery means 20 hours produces €6K+ worth of output. They\'re getting a bargain and they know it.'
          : 'They negotiated to €3.5K for 18 hours. Reasonable. The retainer gives you stability, the slightly higher rate protects margins.',
        effects: (s) => ({
          ...s,
          repeatRate: Math.min(60, (s.repeatRate ?? 20) + 4),
          revenue: (s.revenue ?? 8000) + 3500,
          avgProject: Math.round((s.avgProject ?? 5000) * 0.95 + 3500 * 0.05),
        }),
      },
    ],
  },

  {
    id: 'sv_ai_vs_human',
    speaker: 'Priya Sharma',
    speakerRole: 'Co-founder, AI/ML',
    months: [8, 9, 10, 11, 12],
    title: 'The AI Disclosure Dilemma',
    text: '"Our clients think David personally writes every strategy report. Actually, 40% is AI-generated and David edits. Should we disclose? One client asked directly."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'No disclosure. For now. But the risk grows with every AI-generated deliverable. If a client discovers it independently, trust evaporates.',
    },
    getChoices: () => [
      {
        text: 'Disclose and rebrand — "AI-augmented strategy consulting"',
        dynamicFeedback: (s) => (s.product ?? 40) > 55
          ? 'Clients were impressed, not worried. "So you can do in 2 days what others take 2 weeks for?" The AI became a selling point, not a liability.'
          : 'Mixed reactions. One client loved the transparency. Another asked for a discount "since it\'s AI-generated." Positioning matters.',
        effects: (s) => (s.product ?? 40) > 55
          ? { ...s, pipeline: (s.pipeline ?? 5) + 3, product: s.product + 3, avgProject: Math.round((s.avgProject ?? 5000) * 1.1) }
          : { ...s, product: s.product + 2, avgProject: Math.round((s.avgProject ?? 5000) * 0.95) },
      },
      {
        text: 'Keep quiet — clients pay for outcomes, not methods',
        effects: (s) => ({
          ...s,
          grossMargin: Math.min(75, (s.grossMargin ?? 45) + 2),
        }),
        feedback: 'Business as usual. The margin advantage of AI stays invisible. But every month without disclosure is another month of accumulating risk.',
      },
    ],
  },

  {
    id: 'sv_competitor_undercut',
    speaker: 'David Ashworth',
    speakerRole: 'Co-founder, Strategy',
    months: [10, 11, 12, 13, 14],
    title: 'The Race to the Bottom',
    text: '"A new AI-native consulting firm is offering similar services at 40% of our price. They\'re fast, cheap, and good enough. Our pipeline is slowing."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, pipeline: Math.max(1, (s.pipeline ?? 5) - 2), closeRate: Math.max(5, (s.closeRate ?? 25) - 3) }),
      feedback: 'You ignored them. Two prospects chose them instead of you. The market is shifting and pretending otherwise is expensive.',
    },
    getChoices: () => [
      {
        text: 'Go upmarket — deeper relationships, higher-touch, C-suite access',
        effects: (s) => ({
          ...s,
          avgProject: Math.round((s.avgProject ?? 5000) * 1.4),
          price: Math.round((s.avgProject ?? 5000) * 1.4),
          closeRate: Math.max(5, (s.closeRate ?? 25) - 5),
          repeatRate: Math.min(60, (s.repeatRate ?? 20) + 5),
          product: s.product + 3,
        }),
        feedback: 'Fewer clients, higher value. The AI competitor can\'t replicate David sitting in a board meeting. Relationships are the moat AI can\'t cross.',
      },
      {
        text: 'Match their pricing — use AI advantage to maintain margins',
        effects: (s) => ({
          ...s,
          avgProject: Math.round((s.avgProject ?? 5000) * 0.65),
          price: Math.round((s.avgProject ?? 5000) * 0.65),
          pipeline: (s.pipeline ?? 5) + 4,
          closeRate: Math.min(50, (s.closeRate ?? 25) + 5),
          grossMargin: Math.max(10, (s.grossMargin ?? 45) - 5),
        }),
        feedback: 'Volume up, price down. Your AI makes the math work at lower prices. But you\'re now competing on price, and there\'s always someone cheaper.',
      },
    ],
  },

  {
    id: 'sv_team_scaling',
    speaker: 'Priya Sharma',
    speakerRole: 'Co-founder, AI/ML',
    months: [10, 11, 12, 13, 14, 15, 16],
    title: 'The Scaling Decision',
    text: '"We\'re at capacity. Every new client means saying no to another. We can hire consultants (expensive, slow to ramp) or license our AI tool to other firms (passive income, lose control)."',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You stayed at capacity. Revenue plateaued. The constraint you didn\'t address became the ceiling you live under.',
    },
    getChoices: () => [
      {
        text: 'Hire two junior consultants — grow the team',
        effects: (s) => ({
          ...s,
          burnRate: s.burnRate + 8000,
          teamCapacity: (s.teamCapacity ?? 320) + 320,
          teamSize: (s.teamSize ?? 2) + 2,
          cash: s.cash - 6000,
          grossMargin: Math.max(10, (s.grossMargin ?? 45) - 8),
        }),
        feedback: 'Capacity doubled. But juniors need 3 months to ramp, quality drops initially, and your margin shrinks. The consulting scaling dilemma.',
      },
      {
        text: 'License the AI tool — SaaS revenue from other consultants',
        apCost: 2,
        effects: (s) => ({
          ...s,
          product: s.product + 5,
          burnRate: s.burnRate + 2000,
          revenue: (s.revenue ?? 8000) + 2000,
          totalMRR: (s.totalMRR ?? 8000) + 2000,
          pipeline: (s.pipeline ?? 5) + 3,
        }),
        feedback: 'Passive revenue stream. Other consulting firms pay €2K/month for your AI tool. You\'re becoming a SaaS company through the back door.',
      },
      {
        text: 'Stay boutique — raise prices, cap at 6 clients',
        effects: (s) => ({
          ...s,
          avgProject: Math.round((s.avgProject ?? 5000) * 1.5),
          price: Math.round((s.avgProject ?? 5000) * 1.5),
          grossMargin: Math.min(75, (s.grossMargin ?? 45) + 10),
          closeRate: Math.max(5, (s.closeRate ?? 25) - 5),
        }),
        feedback: 'Fewer clients, higher revenue per client. The boutique model: quality over quantity. Sustainable if your reputation supports premium pricing.',
      },
    ],
  },
];
