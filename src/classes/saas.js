// ═══════════════════════════════════════════════════════════════
// SaaS CLASS — "CloudKitchen"
// AI-powered restaurant management. Recurring revenue, recurring problems.
// ═══════════════════════════════════════════════════════════════

export const saas = {
  id: 'saas',
  name: 'CloudKitchen',
  icon: '●', // Circle — recurring, cycles
  shape: 'circle',
  tagline: 'AI-powered restaurant management. Recurring revenue, recurring problems.',
  color: '#3A8A5C',

  backstory: `Two ex-Delivery Hero PMs who watched restaurants bleed money on inventory waste. Built an AI tool that predicts demand and auto-orders supplies. Won a startup competition, got €100K seed and a pilot with 3 restaurants in Berlin. Now they need to figure out if restaurants will actually pay monthly for software.`,

  founders: [
    { name: 'Mira Chen', role: 'Product', background: 'ex-Delivery Hero' },
    { name: 'Jonas Richter', role: 'Tech', background: 'ex-SAP' },
  ],

  model: {
    revenueType: 'MRR',
    keyMetric: 'Churn Rate',
    deathBy: 'Churn spiral',
    winBy: 'LTV:CAC > 3, churn < 5%, MRR > €10K',
  },

  // Assumption sliders the player sets at game start
  assumptions: [
    {
      key: 'price',
      label: 'Monthly price per customer',
      min: 19, max: 299, default: 49, step: 5,
      unit: '€',
      hint: 'Restaurant SaaS typically €29-€149/mo. Higher = fewer but stickier.',
    },
    {
      key: 'churnRate',
      label: 'Expected monthly churn',
      min: 1, max: 20, default: 5, step: 1,
      unit: '%',
      hint: 'SMB SaaS churn: 3-8%. Restaurants churn higher. Be honest.',
    },
    {
      key: 'targetCAC',
      label: 'Target customer acquisition cost',
      min: 20, max: 500, default: 80, step: 10,
      unit: '€',
      hint: 'Niche B2B: €50-€200 typical. Below €50 needs organic channel.',
    },
    {
      key: 'conversionRate',
      label: 'Trial-to-paid conversion',
      min: 5, max: 50, default: 15, step: 1,
      unit: '%',
      hint: 'B2B free trial: 10-25%. Restaurant owners are busy, not browsing.',
    },
    {
      key: 'pipelineGrowth',
      label: 'Monthly new trial signups',
      min: 5, max: 100, default: 20, step: 5,
      unit: '',
      hint: 'How many restaurants try your product each month.',
    },
    {
      key: 'supportCost',
      label: 'Support cost per customer/mo',
      min: 2, max: 30, default: 5, step: 1,
      unit: '€',
      hint: 'Restaurant owners need hand-holding. Underestimate at your peril.',
    },
  ],

  // Reality corridors — where actual values tend to land
  // These are HARDER than what players assume. That's the point.
  corridors: {
    price: { min: 19, max: 299, center: 49 }, // player controls this
    churnRate: { min: 3, max: 20, center: 8 },          // SMB SaaS churn is brutal
    cac: { min: 50, max: 300, center: 140 },            // niche B2B acquisition is expensive
    conversionRate: { min: 3, max: 25, center: 9 },    // restaurant owners don't convert easy
    pipelineGrowth: { min: 3, max: 40, center: 12 },  // organic growth is slow
    // Non-linear price sensitivity for restaurant SaaS
    // Toast/Square/7shifts: €30-70/mo for SMB. Above €80: real friction. Above €130: enterprise-only.
    priceThresholds: { comfortable: 49, friction: 79, cliff: 109 },
  },

  // Initial game state
  initial: {
    month: 0,
    cash: 100000,
    burnRate: 7000,
    revenue: 0,
    totalMRR: 0,
    customers: 0,
    pipeline: 12,
    price: 49,
    cac: 0,
    ltv: 0,
    ltvCacRatio: 0,
    churn: 0,
    conversionRate: 15,
    product: 30,
    pmf: 0,
    teamSize: 2,
    mrrPerCustomer: 0,
    activationRate: 50,
    supportCost: 5,
    newTrials: 0,
    conversions: 0,
    grossMargin: 0,
    ap: 3,
    maxAP: 3,
  },

  // Business table config
  tableHeaders: ['Month', 'Cash', 'MRR', 'Customers', 'Churn %', 'CAC', 'LTV:CAC', 'Burn', 'Runway'],
  getRow: (s) => [
    s.month,
    s.cash,
    s.totalMRR ?? s.revenue ?? 0,
    s.customers,
    s.churn,
    s.cac || 0,
    s.ltvCacRatio || 0,
    s.totalBurn ?? s.burnRate,
    s.runway ?? 0,
  ],
  formatRow: (r) => [
    `M${r[0]}`,
    `€${(r[1] ?? 0).toLocaleString('de-DE')}`,
    `€${(r[2] ?? 0).toLocaleString('de-DE')}`,
    `${r[3]}`,
    `${typeof r[4] === 'number' ? r[4].toFixed(1) : r[4]}%`,
    r[5] ? `€${Math.round(r[5])}` : '–',
    `${typeof r[6] === 'number' ? r[6].toFixed(1) : r[6]}x`,
    `€${(r[7] ?? 0).toLocaleString('de-DE')}`,
    r[8] > 24 ? '24+' : `${r[8]} mo`,
  ],
};
