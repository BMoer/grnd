// ═══════════════════════════════════════════════════════════════
// SERVICE CLASS — "StrategyForge"
// AI strategy consulting. People-powered, margin-constrained.
// ═══════════════════════════════════════════════════════════════

export const service = {
  id: 'service',
  name: 'StrategyForge',
  icon: '■', // Square — solid, stable, built
  shape: 'square',
  tagline: 'AI strategy consulting. People-powered, margin-constrained.',
  color: '#D68C45',

  backstory: `A former McKinsey engagement manager who saw that 80% of strategy work is templatable. Built a hybrid model: AI does the analysis frameworks, humans do the client relationships and customization. Landed first 2 clients through personal network. Revenue from month 1, but every new client needs more of the founder's time. The trap is obvious, escaping it isn't.`,

  founders: [
    { name: 'David Ashworth', role: 'Strategy', background: 'ex-McKinsey' },
    { name: 'Priya Sharma', role: 'AI/ML', background: 'ex-Google' },
  ],

  model: {
    revenueType: 'Project Revenue',
    keyMetric: 'Gross Margin & Utilization',
    deathBy: 'Burnout (utilization > 100%)',
    winBy: 'PMF Score ≥ 85 for 3 months',
  },

  difficultyPresets: {
    pessimistic: {
      label: 'Pessimistic',
      icon: '▼',
      description: 'Low project values, long sales cycles. The consulting grind at its hardest.',
      color: 'var(--color-danger)',
      assumptions: { avgProject: 3000, targetMargin: 35, salesCycle: 3, closeRate: 15, repeatRate: 10, teamCapacity: 280 },
      pros: ['Revenue from month 1', 'Lower client expectations'],
      cons: ['Thin margins', 'Long sales cycles', 'Burnout risk high'],
    },
    neutral: {
      label: 'Neutral',
      icon: '●',
      description: 'Moderate project values, realistic close rates. The standard consulting journey.',
      color: 'var(--color-plan)',
      assumptions: { avgProject: 5000, targetMargin: 50, salesCycle: 1.5, closeRate: 25, repeatRate: 20, teamCapacity: 320 },
      pros: ['Healthy margins possible', 'Repeat clients build predictability'],
      cons: ['Founder time is the bottleneck', 'Scaling requires hiring'],
    },
    optimistic: {
      label: 'Optimistic',
      icon: '▲',
      description: 'High-value projects, fast closes. But consulting optimism = overcommitment.',
      color: 'var(--color-growth)',
      assumptions: { avgProject: 8000, targetMargin: 65, salesCycle: 1, closeRate: 35, repeatRate: 30, teamCapacity: 400 },
      pros: ['Strong revenue per project', 'High margins with AI leverage'],
      cons: ['Overcommitment risk', 'Capacity ceiling hits fast'],
    },
  },

  assumptions: [
    { key: 'avgProject', label: 'Avg Project Value (€)', min: 1000, max: 50000, default: 5000, step: 500, unit: '€', hint: 'Average revenue per client engagement. €3K-€15K for early-stage consulting.' },
    { key: 'targetMargin', label: 'Target Gross Margin (%)', min: 20, max: 80, default: 50, step: 5, unit: '%', hint: 'Revenue minus delivery costs. Below 40% is a staffing business, not consulting.' },
    { key: 'salesCycle', label: 'Sales Cycle (months)', min: 0.5, max: 6, default: 1.5, step: 0.5, unit: '', hint: 'Time from first contact to signed contract. B2B consulting: 1-4 months.' },
    { key: 'closeRate', label: 'Close Rate (%)', min: 10, max: 60, default: 25, step: 5, unit: '%', hint: 'What % of pipeline converts to paying clients.' },
    { key: 'repeatRate', label: 'Repeat Rate (%)', min: 0, max: 80, default: 20, step: 5, unit: '%', hint: 'Clients who come back for more. The path to predictable revenue.' },
    { key: 'teamCapacity', label: 'Team Capacity (hours/mo)', min: 160, max: 640, default: 320, step: 40, unit: '', hint: '2 founders × 160h = 320h. Each hire adds ~160h but costs €5K+/mo.' },
  ],

  corridors: {
    avgProject: { min: 1000, max: 50000, center: 4000 },
    grossMargin: { min: 20, max: 75, center: 42 },
    closeRate: { min: 8, max: 50, center: 20 },
    repeatRate: { min: 5, max: 60, center: 15 },
    salesCycle: { min: 0.5, max: 6, center: 2 },
  },

  initial: {
    month: 0,
    cash: 30000,
    burnRate: 6000,
    revenue: 8000,
    totalMRR: 8000,
    customers: 2,
    activeClients: 2,
    pipeline: 5,
    price: 5000,
    avgProject: 5000,
    cac: 0,
    ltv: 0,
    ltvCacRatio: 0,
    churn: 0,
    closeRate: 25,
    repeatRate: 20,
    utilization: 50,
    teamCapacity: 320,
    billableHours: 160,
    grossMargin: 45,
    revenuePerHead: 4000,
    salesCycle: 1.5,
    product: 40,
    pmf: 0,
    teamSize: 2,
    conversionRate: 25,
    viralCoeff: 0,
    ap: 3,
    maxAP: 3,
    salesEffort: 0,
    supportCost: 0,
    burnoutMonths: 0,
  },

  tableHeaders: ['Month', 'Cash', 'Revenue', 'Clients', 'Margin %', 'Utilization', 'Pipeline', 'Repeat %', 'Burn', 'Runway'],
  getRow: (s) => [
    s.month, s.cash, s.revenue ?? 0, s.activeClients ?? s.customers ?? 0,
    s.grossMargin ?? 0, s.utilization ?? 0, s.pipeline ?? 0,
    s.repeatRate ?? 0, s.totalBurn ?? s.burnRate, s.runway ?? 0,
  ],
  formatRow: (r) => [
    `M${r[0]}`,
    `€${(r[1] ?? 0).toLocaleString('en-US')}`,
    `€${(r[2] ?? 0).toLocaleString('en-US')}`,
    `${r[3] ?? 0}`,
    `${typeof r[4] === 'number' && isFinite(r[4]) ? Math.max(0, r[4]).toFixed(0) : '0'}%`,
    `${typeof r[5] === 'number' && isFinite(r[5]) ? r[5].toFixed(0) : '0'}%`,
    `${r[6] ?? 0}`,
    `${typeof r[7] === 'number' && isFinite(r[7]) ? r[7].toFixed(0) : '0'}%`,
    `€${(r[8] ?? 0).toLocaleString('en-US')}`,
    (r[9] ?? 0) > 24 ? '24+' : `${r[9] ?? 0} mo`,
  ],
};
