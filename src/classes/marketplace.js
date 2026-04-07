// ═══════════════════════════════════════════════════════════════
// MARKETPLACE CLASS — "SwapCircle"
// Peer-to-peer skill exchange. Two sides, zero margin for error.
// ═══════════════════════════════════════════════════════════════

export const marketplace = {
  id: 'marketplace',
  name: 'SwapCircle',
  icon: '△', // Triangle — three sides: supply, demand, platform
  shape: 'triangle',
  tagline: 'Peer-to-peer skill exchange. Two sides, zero margin for error.',
  color: '#7B5EA7',

  backstory: `A former teacher and a UX designer who believe professional skills should be tradeable like goods. Their platform lets freelancers exchange services directly — a designer trades branding work for a developer's app build, with an optional cash top-up for imbalances. Bootstrapped with €30K savings and an FFG grant. The prototype works, but neither side has critical mass.`,

  founders: [
    { name: 'Lena Kowalski', role: 'Operations', background: 'ex-Teacher' },
    { name: 'Marco Di Stefano', role: 'Design', background: 'Freelancer' },
  ],

  model: {
    revenueType: 'Take Rate on GMV',
    keyMetric: 'Liquidity (Match Rate)',
    deathBy: 'Cold start death spiral',
    winBy: 'PMF Score ≥ 85 for 3 months',
  },

  difficultyPresets: {
    pessimistic: {
      label: 'Pessimistic',
      icon: '▼',
      description: 'High churn on both sides, low match rate. The cold start problem at its worst.',
      color: 'var(--color-danger)',
      assumptions: { takeRate: 5, avgTransaction: 200, supplyCAC: 60, demandCAC: 50, supplyChurn: 18, demandChurn: 20, matchRate: 8 },
      pros: ['Low take rate = attractive to users', 'Lower expectations'],
      cons: ['Almost no revenue', 'Both sides churn fast', 'Cold start brutal'],
    },
    neutral: {
      label: 'Neutral',
      icon: '●',
      description: 'Balanced marketplace dynamics. The cold start is real but solvable with effort.',
      color: 'var(--color-plan)',
      assumptions: { takeRate: 10, avgTransaction: 300, supplyCAC: 40, demandCAC: 30, supplyChurn: 12, demandChurn: 15, matchRate: 15 },
      pros: ['Reasonable unit economics', 'Achievable liquidity'],
      cons: ['Two-sided chicken-and-egg', 'Matching is hard'],
    },
    optimistic: {
      label: 'Optimistic',
      icon: '▲',
      description: 'Strong network effects, high match rate. But marketplace optimism ignores the cold start.',
      color: 'var(--color-growth)',
      assumptions: { takeRate: 15, avgTransaction: 500, supplyCAC: 25, demandCAC: 20, supplyChurn: 8, demandChurn: 10, matchRate: 25 },
      pros: ['High revenue per transaction', 'Network effects kick in'],
      cons: ['Reality gap on match rate', 'High take rate = competition risk'],
    },
  },

  assumptions: [
    { key: 'takeRate', label: 'Take Rate (%)', min: 0, max: 25, default: 10, step: 1, unit: '%', hint: 'Your cut of each transaction. 5-15% typical for skill marketplaces.' },
    { key: 'avgTransaction', label: 'Avg Transaction Value (€)', min: 50, max: 2000, default: 300, step: 50, unit: '€', hint: 'Average value of a skill exchange. Freelance services: €100-€1000.' },
    { key: 'supplyCAC', label: 'Supply CAC (€)', min: 10, max: 200, default: 40, step: 5, unit: '€', hint: 'Cost to acquire one supply-side user (service provider).' },
    { key: 'demandCAC', label: 'Demand CAC (€)', min: 10, max: 200, default: 30, step: 5, unit: '€', hint: 'Cost to acquire one demand-side user (service seeker).' },
    { key: 'supplyChurn', label: 'Supply Monthly Churn (%)', min: 5, max: 30, default: 12, step: 1, unit: '%', hint: 'Providers who leave per month. Without matches, they leave fast.' },
    { key: 'demandChurn', label: 'Demand Monthly Churn (%)', min: 5, max: 30, default: 15, step: 1, unit: '%', hint: 'Seekers who leave per month. If they don\'t find what they need, gone.' },
    { key: 'matchRate', label: 'Expected Match Rate (%)', min: 5, max: 50, default: 15, step: 1, unit: '%', hint: 'Of active users on both sides, what % get matched per month.' },
  ],

  corridors: {
    takeRate: { min: 0, max: 25, center: 10 },
    avgTransaction: { min: 50, max: 2000, center: 250 },
    supplyCAC: { min: 15, max: 150, center: 50 },
    demandCAC: { min: 10, max: 120, center: 40 },
    supplyChurn: { min: 5, max: 30, center: 15 },
    demandChurn: { min: 5, max: 30, center: 18 },
    matchRate: { min: 3, max: 40, center: 10 },
  },

  initial: {
    month: 0,
    cash: 100000, // €30K savings + €70K grants (FFG + aws)
    burnRate: 1200, // bootstrapped, side projects fund early months
    revenue: 0,
    totalMRR: 0,
    supply: 15,
    demand: 8,
    customers: 23, // total users for compatibility
    activeCustomers: 23,
    matches: 0,
    transactions: 2,
    gmv: 0,
    liquidity: 0,
    pipeline: 5,
    price: 300, // avg transaction
    takeRate: 10,
    avgTransaction: 300,
    supplyCAC: 40,
    demandCAC: 30,
    supplyChurn: 12,
    demandChurn: 15,
    matchRate: 15,
    cac: 0,
    ltv: 0,
    ltvCacRatio: 0,
    churn: 0,
    product: 25,
    pmf: 0,
    teamSize: 2,
    conversionRate: 0,
    repeatRate: 0,
    viralCoeff: 0,
    grossMargin: 0,
    ap: 3,
    maxAP: 3,
    salesEffort: 0,
    supportCost: 2,
  },

  tableHeaders: ['Month', 'Cash', 'Supply', 'Demand', 'Matches', 'GMV', 'Revenue', 'Liquidity', 'Burn', 'Runway'],
  getRow: (s) => [
    s.month, s.cash, s.supply ?? 0, s.demand ?? 0,
    s.matches ?? 0, s.gmv ?? 0, s.revenue ?? 0,
    s.liquidity ?? 0, s.totalBurn ?? s.burnRate, s.runway ?? 0,
  ],
  formatRow: (r) => [
    `M${r[0]}`,
    `€${(r[1] ?? 0).toLocaleString('en-US')}`,
    `${r[2]}`, `${r[3]}`,
    `${r[4]}`,
    `€${(r[5] ?? 0).toLocaleString('en-US')}`,
    `€${(r[6] ?? 0).toLocaleString('en-US')}`,
    `${typeof r[7] === 'number' ? r[7].toFixed(0) : r[7]}%`,
    `€${(r[8] ?? 0).toLocaleString('en-US')}`,
    r[9] > 24 ? '24+' : `${r[9]} mo`,
  ],
};
