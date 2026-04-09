// ═══════════════════════════════════════════════════════════════
// CONSUMER CLASS — "GlowUp"
// Personalized wellness, delivered. Blitzscale or die.
// ═══════════════════════════════════════════════════════════════

export const consumer = {
  id: 'consumer',
  name: 'GlowUp',
  icon: '◆', // Diamond — dynamic, energy
  shape: 'diamond',
  tagline: 'Personalized wellness, delivered. Blitzscale or die.',
  color: '#D64045',

  backstory: `A fitness influencer with 50K followers and a biotech grad who created personalized supplement packs based on a health questionnaire. The brand is strong on Instagram, the first 200 orders came from the influencer's audience, but paid acquisition is expensive and retention is a question mark. €80K in the bank from friends and family, burning through it on ads.`,

  founders: [
    { name: 'Nina Volkov', role: 'Brand/Marketing', background: 'Fitness Influencer' },
    { name: 'Dr. Alex Berger', role: 'Product', background: 'Biotech' },
  ],

  model: {
    revenueType: 'Orders',
    keyMetric: 'Repeat Rate & Viral Coefficient',
    deathBy: 'CAC > LTV spiral',
    winBy: 'PMF Score ≥ 85 for 3 months',
  },

  difficultyPresets: {
    pessimistic: {
      label: 'Pessimistic',
      icon: '▼',
      description: 'Expensive acquisition, low repeat rate, thin margins. The influencer bubble pops fast.',
      color: 'var(--color-danger)',
      assumptions: { aov: 25, repeatRate: 8, targetCAC: 40, viralCoeff: 10, cogs: 15, adSpend: 3000 },
      pros: ['Low price = impulse buy', 'High volume potential'],
      cons: ['Razor-thin margins', 'Low repeat', 'CAC eats everything'],
    },
    neutral: {
      label: 'Neutral',
      icon: '●',
      description: 'Moderate pricing, decent repeat rate. The question: can you keep them coming back?',
      color: 'var(--color-plan)',
      assumptions: { aov: 35, repeatRate: 15, targetCAC: 25, viralCoeff: 30, cogs: 12, adSpend: 5000 },
      pros: ['Balanced economics', 'Some organic growth'],
      cons: ['Needs active retention investment', 'Competitive market'],
    },
    optimistic: {
      label: 'Optimistic',
      icon: '▲',
      description: 'Premium product, strong brand, high repeat. But reality corrects optimism hardest.',
      color: 'var(--color-growth)',
      assumptions: { aov: 50, repeatRate: 25, targetCAC: 18, viralCoeff: 50, cogs: 15, adSpend: 8000 },
      pros: ['Strong unit economics', 'Viral potential'],
      cons: ['Biggest reality gap', 'Premium needs justification'],
    },
  },

  assumptions: [
    { key: 'aov', label: 'Average Order Value (€)', min: 15, max: 100, default: 35, step: 5, unit: '€', hint: 'D2C wellness: €20-€60 typical. Higher = better margins but fewer impulse buys.' },
    { key: 'repeatRate', label: 'Monthly Repeat Rate (%)', min: 5, max: 40, default: 15, step: 1, unit: '%', hint: 'What % of customers reorder each month. Supplements: 10-25%.' },
    { key: 'targetCAC', label: 'Customer Acquisition Cost (€)', min: 8, max: 80, default: 25, step: 2, unit: '€', hint: 'Instagram/Meta ads for D2C: €15-€40 typical. Rises with scale.' },
    { key: 'viralCoeff', label: 'Viral Coefficient (x100)', min: 0, max: 200, default: 30, step: 5, unit: '', hint: 'Referrals per 100 customers per month. 30 = every 3rd customer refers someone. >100 = viral.' },
    { key: 'cogs', label: 'COGS per Order (€)', min: 5, max: 40, default: 12, step: 1, unit: '€', hint: 'Product + packaging + shipping. Scale brings this down.' },
    { key: 'adSpend', label: 'Monthly Ad Spend (€)', min: 1000, max: 20000, default: 5000, step: 500, unit: '€', hint: 'Your main growth lever. More spend = more customers, but CAC rises.' },
  ],

  corridors: {
    aov: { min: 15, max: 100, center: 35 },
    repeatRate: { min: 3, max: 30, center: 10 },
    cac: { min: 12, max: 60, center: 30 },
    viralCoeff: { min: 0, max: 150, center: 15 }, // stored as x100 (15 = 0.15)
    cogs: { min: 8, max: 35, center: 14 },
  },

  initial: {
    month: 0,
    cash: 80000,
    burnRate: 3500,
    revenue: 0,
    totalMRR: 0, // used as monthly revenue for compatibility
    customers: 200,
    activeCustomers: 50, // customers who ordered in last 3 months
    newPaid: 0,
    newOrganic: 0,
    repeatOrders: 0,
    totalOrders: 0,
    pipeline: 0,
    price: 35,
    aov: 35,
    cac: 0,
    ltv: 0,
    ltvCacRatio: 0,
    churn: 0,
    repeatRate: 15,
    viralCoeff: 30, // x100
    cogs: 12,
    adSpend: 5000,
    product: 35,
    pmf: 0,
    teamSize: 2,
    conversionRate: 0,
    grossMargin: 0,
    ap: 3,
    maxAP: 3,
    salesEffort: 0,
    supportCost: 3,
  },

  tableHeaders: ['Month', 'Cash', 'Revenue', 'Orders', 'Active Cust.', 'Repeat %', 'CAC', 'LTV:CAC', 'Burn', 'Runway'],
  getRow: (s) => [
    s.month, s.cash, s.revenue ?? 0, s.totalOrders ?? 0,
    s.activeCustomers ?? s.customers ?? 0, s.repeatRate ?? 0,
    s.cac || 0, s.ltvCacRatio || 0, s.totalBurn ?? s.burnRate, s.runway ?? 0,
  ],
  formatRow: (r) => [
    `M${r[0]}`,
    `€${(r[1] ?? 0).toLocaleString('en-US')}`,
    `€${(r[2] ?? 0).toLocaleString('en-US')}`,
    `${r[3] ?? 0}`,
    `${r[4] ?? 0}`,
    `${typeof r[5] === 'number' && isFinite(r[5]) ? r[5].toFixed(1) : '0'}%`,
    r[6] ? `€${Math.round(r[6])}` : '–',
    `${typeof r[7] === 'number' && isFinite(r[7]) ? r[7].toFixed(1) : '0'}x`,
    `€${(r[8] ?? 0).toLocaleString('en-US')}`,
    (r[9] ?? 0) > 24 ? '24+' : `${r[9] ?? 0} mo`,
  ],
};
