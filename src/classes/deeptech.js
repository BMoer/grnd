// ═══════════════════════════════════════════════════════════════
// DEEP-TECH CLASS — "NanoSense"
// Molecular sensors for food safety. Long road, deep moat.
// ═══════════════════════════════════════════════════════════════

export const deeptech = {
  id: 'deeptech',
  name: 'NanoSense',
  icon: '⬡', // Hexagon — molecular, science
  shape: 'hexagon',
  tagline: 'Molecular sensors for food safety. Long road, deep moat.',
  color: '#2D5DA1',

  backstory: `A materials science PhD and a food safety engineer developed a sensor that detects pathogens in food 10x faster than lab tests. The science works in the lab. Now they need to get it from lab bench to production line, through EU certification, and into the hands of food manufacturers who move at glacial speed. They have an FFG grant for €300K over 2 years and zero revenue.`,

  founders: [
    { name: 'Dr. Sarah Lindström', role: 'Materials Science', background: 'TU Wien' },
    { name: 'Thomas Huber', role: 'Food Safety', background: 'ex-Nestlé QA' },
  ],

  model: {
    revenueType: 'Unit Sales',
    keyMetric: 'Certification Progress & LOIs',
    deathBy: 'Cash hits zero before revenue',
    winBy: 'PMF Score ≥ 85 for 3 months',
  },

  difficultyPresets: {
    pessimistic: {
      label: 'Pessimistic',
      icon: '▼',
      description: 'Expensive R&D, slow certification, few pilot prospects. The science works but the market doesn\'t care yet.',
      color: 'var(--color-danger)',
      assumptions: { unitCost: 800, unitPrice: 1500, certTimeline: 18, pilotPipeline: 2, rdBurn: 18000, grantRunway: 16 },
      pros: ['Conservative estimates', 'Less disappointment'],
      cons: ['Very long runway needed', 'Revenue far away', 'Certification risk high'],
    },
    neutral: {
      label: 'Neutral',
      icon: '●',
      description: 'Realistic R&D timeline, moderate certification path. The standard deep-tech journey.',
      color: 'var(--color-plan)',
      assumptions: { unitCost: 500, unitPrice: 2000, certTimeline: 12, pilotPipeline: 3, rdBurn: 15000, grantRunway: 20 },
      pros: ['Balanced timeline', 'Achievable milestones'],
      cons: ['Still no revenue for 12+ months', 'Certification can slip'],
    },
    optimistic: {
      label: 'Optimistic',
      icon: '▲',
      description: 'Fast certification, strong pilot pipeline. But deep-tech optimism is the most dangerous kind.',
      color: 'var(--color-growth)',
      assumptions: { unitCost: 300, unitPrice: 2500, certTimeline: 8, pilotPipeline: 5, rdBurn: 12000, grantRunway: 24 },
      pros: ['Fast to market', 'Strong unit economics'],
      cons: ['Certification rarely goes this fast', 'Reality gap largest here'],
    },
  },

  assumptions: [
    { key: 'unitCost', label: 'Unit Production Cost (€)', min: 50, max: 2000, default: 500, step: 50, unit: '€', hint: 'Cost to produce one sensor unit. Decreases with scale.' },
    { key: 'unitPrice', label: 'Target Unit Price (€)', min: 200, max: 10000, default: 2000, step: 100, unit: '€', hint: 'What you charge per sensor. Food safety hardware: €500-€5000.' },
    { key: 'certTimeline', label: 'Certification Timeline (months)', min: 6, max: 24, default: 12, step: 1, unit: '', hint: 'EU CE marking + food contact regulations. 8-18 months typical.' },
    { key: 'pilotPipeline', label: 'Pilot Customer Pipeline', min: 1, max: 10, default: 3, step: 1, unit: '', hint: 'Companies interested in piloting. Food industry moves slowly.' },
    { key: 'rdBurn', label: 'Monthly R&D Burn (€)', min: 5000, max: 30000, default: 15000, step: 1000, unit: '€', hint: 'Lab costs + materials + equipment. The main cost center.' },
    { key: 'grantRunway', label: 'Grant Runway (months)', min: 6, max: 36, default: 20, step: 1, unit: '', hint: 'How long the FFG grant lasts at current burn.' },
  ],

  corridors: {
    unitCost: { min: 100, max: 2000, center: 600 },
    certTimeline: { min: 8, max: 24, center: 14 },
    pilotPipeline: { min: 1, max: 8, center: 3 },
    rdBurn: { min: 8000, max: 25000, center: 16000 },
  },

  initial: {
    month: 0,
    cash: 300000, // FFG grant
    grantTotal: 300000,
    grantRemaining: 300000,
    burnRate: 15000,
    revenue: 0,
    totalMRR: 0,
    customers: 0, // paying customers (post-certification)
    lois: 0, // Letters of Intent
    pilotConversations: 0,
    certProgress: 0, // 0-100%
    certComplete: false,
    unitsProduced: 0,
    unitsSold: 0,
    unitCost: 500,
    unitPrice: 2000,
    pipeline: 3,
    price: 2000,
    cac: 0,
    ltv: 0,
    ltvCacRatio: 0,
    churn: 0,
    product: 20, // TRL 4 = lab prototype
    pmf: 0,
    teamSize: 2,
    ipFilings: 0,
    prototypeStage: 4, // TRL 4
    conversionRate: 0,
    repeatRate: 0,
    viralCoeff: 0,
    grossMargin: 0,
    ap: 3,
    maxAP: 3,
    salesEffort: 0,
    supportCost: 0,
    rdBurn: 15000,
  },

  tableHeaders: ['Month', 'Cash', 'Grant Left', 'Cert %', 'LOIs', 'Units Sold', 'Revenue', 'R&D Burn', 'Runway'],
  getRow: (s) => [
    s.month, s.cash, s.grantRemaining ?? 0, s.certProgress ?? 0,
    s.lois ?? 0, s.unitsSold ?? 0, s.revenue ?? 0,
    s.rdBurn ?? s.burnRate, s.runway ?? 0,
  ],
  formatRow: (r) => [
    `M${r[0]}`,
    `€${(r[1] ?? 0).toLocaleString('en-US')}`,
    `€${(r[2] ?? 0).toLocaleString('en-US')}`,
    `${Math.round(r[3] ?? 0)}%`,
    `${r[4] ?? 0}`,
    `${r[5] ?? 0}`,
    `€${(r[6] ?? 0).toLocaleString('en-US')}`,
    `€${(r[7] ?? 0).toLocaleString('en-US')}`,
    (r[8] ?? 0) > 24 ? '24+' : `${r[8] ?? 0} mo`,
  ],
};
