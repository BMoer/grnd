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
    hint: 'Push when market feels too easy, M4+',
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
    hint: 'Good early-game boost, M3-M8',
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
    hint: 'Reward teams with good product, M6+',
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
    hint: 'Push when teams get complacent, M6-M18',
    effect: (s) => ({
      ...s,
      churn: Math.min(20, s.churn + 1.5),
      pipeline: Math.max(2, Math.round(s.pipeline * 0.8)),
      teamMorale: Math.max(0.3, (s.teamMorale ?? 1) - 0.15),
    }),
  },

  {
    id: 'eu_regulation',
    title: 'New EU Regulation',
    text: 'The EU AI Act just published implementation guidelines. Food-tech companies handling customer data need a compliance review. Your competitors are scrambling.',
    flavor: 'Compliance cost: real. Competitive advantage for those who get it right first: also real.',
    hint: 'Push mid-game M8+, adds cost pressure',
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
    hint: 'Good pipeline boost if cash allows, M4+',
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
    hint: 'Opportunity event, anytime after M3',
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
    hint: 'Push when margins are thin, M6+',
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
    hint: 'Push when revenue depends on few customers',
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
    text: 'A major tech publication featured you in "10 Food-Tech Startups to Watch." The article is fair, accurate, and your inbox is full.',
    flavor: 'Inbound leads tripled this week. Most are tire-kickers. But some are real. The signal-to-noise ratio is your problem now.',
    hint: 'Reward good product/marketing decisions',
    effect: (s) => ({
      ...s,
      pipeline: s.pipeline + 12,
      conversionRate: Math.min(30, s.conversionRate + 0.5),
    }),
  },

  // ═══ Additional World Events ═══

  {
    id: 'supply_chain_crisis',
    title: 'Supply Chain Disruption',
    text: 'Global supply chain issues hit the restaurant industry. Ingredient costs up 20%. Your customers are in survival mode.',
    flavor: 'Every restaurant owner is recalculating margins. Software subscriptions are the first thing they cut — unless you can prove ROI today.',
    hint: 'Push when things are going too smoothly',
    effect: (s) => ({
      ...s,
      churn: Math.min(20, s.churn + 2),
      pipeline: Math.max(2, Math.round(s.pipeline * 0.8)),
      // But demand prediction becomes more valuable
      product: s.product + 2,
    }),
  },

  {
    id: 'food_trend_wave',
    title: 'Food Trend Explosion',
    text: 'A new food trend went viral on TikTok. Restaurants scrambling to adapt their menus. Demand prediction suddenly feels essential.',
    flavor: 'Three restaurant owners called asking if your tool can help them ride the trend. It can — kind of. Good enough to demo.',
    hint: 'Boost for struggling teams, M4-M12',
    effect: (s) => ({
      ...s,
      pipeline: s.pipeline + 8,
      conversionRate: Math.min(30, s.conversionRate + 1.5),
      customers: s.customers + 1,
      totalMRR: (s.totalMRR ?? 0) + (s.price ?? 49),
    }),
  },

  {
    id: 'competitor_scandal',
    title: 'Competitor Data Breach',
    text: 'Your main competitor had a data breach. Customer payment data leaked. The restaurant WhatsApp groups are on fire.',
    flavor: 'Three of their customers emailed you today. Switching costs just dropped to zero. But trust in food-tech SaaS just took a collective hit.',
    hint: 'Double-edged: pipeline boost + trust erosion',
    effect: (s) => ({
      ...s,
      pipeline: s.pipeline + 10,
      customers: s.customers + 2,
      totalMRR: (s.totalMRR ?? 0) + (s.price ?? 49) * 2,
      churn: Math.min(20, s.churn + 0.5), // general trust erosion
    }),
  },

  {
    id: 'energy_crisis',
    title: 'Energy Price Spike',
    text: 'Energy prices doubled. Restaurants\'  biggest cost after labor just exploded. Everyone is looking for efficiency tools.',
    flavor: 'Silver lining: your demand prediction reduces waste, which reduces energy costs. The pitch just got easier.',
    hint: 'Mixed: costs up but conversion up too',
    effect: (s) => ({
      ...s,
      pipeline: s.pipeline + 5,
      burnRate: s.burnRate + 300, // your own costs went up too
      conversionRate: Math.min(30, s.conversionRate + 1),
    }),
  },

  {
    id: 'government_subsidy',
    title: 'Digitalization Grant Program',
    text: 'The government announced a €5K digitalization voucher for SMBs. Restaurants can use it for — surprise — software like yours.',
    flavor: 'Every restaurant owner just got €5K earmarked for software. Your phone is ringing. The subsidy expires in 3 months.',
    hint: 'Strong boost, push when pipeline is weak',
    effect: (s) => ({
      ...s,
      pipeline: s.pipeline + 15,
      customers: s.customers + 2,
      totalMRR: (s.totalMRR ?? 0) + (s.price ?? 49) * 2,
      revenue: (s.revenue ?? 0) + (s.price ?? 49) * 2,
      cac: Math.max(30, (s.cac || 80) - 20),
    }),
  },

  {
    id: 'tech_stack_shift',
    title: 'Platform Dependency Risk',
    text: 'The cloud provider you built on just raised prices 30%. Or you can migrate to a cheaper alternative — which takes a month of engineering.',
    flavor: 'Platform risk is real. Every dependency is a bet on someone else\'s roadmap.',
    hint: 'Push when burn is already high, M8+',
    effect: (s) => ({
      ...s,
      burnRate: s.burnRate + 800,
      product: Math.max(10, (s.product ?? 30) - 1),
    }),
  },

  {
    id: 'labor_shortage',
    title: 'Restaurant Labor Shortage',
    text: 'Staff shortages hit the restaurant industry hard. Owners desperate for efficiency tools. Your product suddenly saves not just money — but the labor they can\'t hire.',
    flavor: 'The value proposition shifted from "nice to have" to "survival tool." Position accordingly.',
    hint: 'Positive event, use when churn is rising',
    effect: (s) => ({
      ...s,
      pipeline: s.pipeline + 7,
      churn: Math.max(3, s.churn - 1),
      conversionRate: Math.min(30, s.conversionRate + 1),
    }),
  },

  // ═══ Facilitator-focused injectable events ═══

  {
    id: 'investor_interest',
    title: 'Investor Interest',
    text: 'A VC wants to meet. They saw your pitch somewhere. Due diligence prep will eat time and focus, but the upside is real.',
    flavor: 'Your inbox has a Sequoia email. It\'s probably spam. But what if it isn\'t?',
    hint: 'Push when team is struggling, M6+',
    effect: (s) => ({
      ...s,
      pipeline: s.pipeline + 6,
      burnRate: s.burnRate + 500,
      teamMorale: Math.min(1.3, (s.teamMorale ?? 1) + 0.1),
    }),
  },

  {
    id: 'cofounder_conflict',
    title: 'Co-founder Conflict',
    text: 'Disagreement on direction. One wants to double down on the current approach, the other wants to pivot. The team notices.',
    flavor: 'You used to finish each other\'s sentences. Now you can\'t finish a meeting without an argument.',
    hint: 'Push mid-game M8-M12 when things get comfortable',
    effect: (s) => ({
      ...s,
      teamMorale: Math.max(0.3, (s.teamMorale ?? 1) - 0.2),
      product: Math.max(10, (s.product ?? 30) - 3),
      pipeline: Math.max(2, s.pipeline - 2),
    }),
  },

  {
    id: 'key_employee_quits',
    title: 'Key Employee Quits',
    text: 'Your best engineer just handed in their notice. They got an offer they couldn\'t refuse. Knowledge walks out the door in two weeks.',
    flavor: 'They were the only one who understood the payment integration. The documentation is... aspirational.',
    hint: 'Push when burn is high and team is stretched',
    effect: (s) => ({
      ...s,
      teamMorale: Math.max(0.3, (s.teamMorale ?? 1) - 0.15),
      product: Math.max(10, (s.product ?? 30) - 4),
      burnRate: Math.max(3000, s.burnRate - 800),
      teamCapacity: s.teamCapacity ? Math.max(160, s.teamCapacity - 80) : undefined,
    }),
  },

  {
    id: 'customer_goes_viral',
    title: 'Customer Goes Viral',
    text: 'A customer publicly praised your product on LinkedIn. The post got 50K views. Your brand just got a free megaphone.',
    flavor: 'Someone tagged you in a post: "This tool saved our restaurant €3K/month." The comments are full of "tell me more."',
    hint: 'Reward teams making good product decisions',
    effect: (s) => ({
      ...s,
      pipeline: s.pipeline + 10,
      conversionRate: Math.min(30, s.conversionRate + 1.5),
      teamMorale: Math.min(1.3, (s.teamMorale ?? 1) + 0.1),
    }),
  },

  {
    id: 'pivot_pressure',
    title: 'Pivot Pressure',
    text: 'Your advisor calls an emergency meeting. "The numbers aren\'t working. You need to pivot." The team overhears and morale drops.',
    flavor: 'Is the advisor right? Maybe. But pivoting costs months. Staying the course might cost everything.',
    hint: 'Push when PMF < 40 after M10',
    effect: (s) => ({
      ...s,
      teamMorale: Math.max(0.3, (s.teamMorale ?? 1) - 0.15),
      product: Math.max(10, (s.product ?? 30) - 2),
      pipeline: Math.max(2, Math.round(s.pipeline * 0.85)),
    }),
  },

  {
    id: 'cash_crunch_rumor',
    title: 'Cash Crunch Rumor',
    text: 'Word on the street is you\'re running out of money. Competitors are telling your prospects. Some clients are hedging.',
    flavor: 'A prospect called to "verify" you\'re still around. Three clients asked about data export. The narrative is shifting.',
    hint: 'Push when cash < €15K or runway < 3',
    effect: (s) => ({
      ...s,
      pipeline: Math.max(2, Math.round(s.pipeline * 0.7)),
      churn: Math.min(20, s.churn + 3),
      teamMorale: Math.max(0.3, (s.teamMorale ?? 1) - 0.1),
    }),
  },
];
