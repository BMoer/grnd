// ═══════════════════════════════════════════════════════════════
// GLOSSARY — Hover tooltips for key terms
// ═══════════════════════════════════════════════════════════════

export const GLOSSARY = {
  // Revenue / Pricing
  MRR: {
    term: 'MRR — Monthly Recurring Revenue',
    short: 'Total monthly subscription income',
    description: 'The sum of all monthly subscription payments. THE most important SaaS KPI. Shows how much predictable revenue comes in each month.',
  },
  Revenue: {
    term: 'Revenue',
    short: 'Total income',
    description: 'Total income in a month. For SaaS models, this equals MRR.',
  },
  ARPU: {
    term: 'ARPU — Average Revenue Per User',
    short: 'Average revenue per customer',
    description: 'MRR divided by number of customers. Shows how much each customer pays on average.',
  },

  // Customers
  Churn: {
    term: 'Churn — Customer Attrition',
    short: 'Percentage of customers who cancel each month',
    description: 'At 5% churn you lose 5% of customers every month. With 100 customers = 5 cancellations. In B2B SaaS, 3-8% monthly churn is normal. Above 10% is a red flag.',
  },
  Pipeline: {
    term: 'Pipeline',
    short: 'Potential customers in the funnel',
    description: 'How many potential customers are currently evaluating your product. Without active sales, the pipeline shrinks every month.',
  },
  Conversion: {
    term: 'Conversion Rate',
    short: 'Percentage of trial users who become paying customers',
    description: 'Out of 100 trial users, e.g. 15 become customers (= 15% conversion). Higher pricing often reduces conversion.',
  },
  Customers: {
    term: 'Customers',
    short: 'Active paying customers',
    description: 'Number of active paying customers. Grows through acquisition, shrinks through churn.',
  },

  // Unit Economics
  CAC: {
    term: 'CAC — Customer Acquisition Cost',
    short: 'Cost to acquire one new customer',
    description: 'How much it costs to win a new customer (marketing, sales, etc.). If CAC > LTV, you lose money on every customer.',
  },
  LTV: {
    term: 'LTV — Lifetime Value',
    short: 'Total revenue from a customer over their lifetime',
    description: 'How much a customer pays before they cancel. Formula: monthly price ÷ churn rate. At €49/mo and 5% churn = €980 LTV.',
  },
  'LTV:CAC': {
    term: 'LTV:CAC Ratio',
    short: 'Customer value vs. acquisition cost',
    description: 'LTV divided by CAC. Above 3x = healthy. Below 1x = you lose money on every customer. THE indicator for sustainable unit economics.',
  },

  // Financial
  Burn: {
    term: 'Burn Rate',
    short: 'Total monthly costs',
    description: 'Everything that goes out each month: salaries, servers, tools, marketing, support. Increases with every hire and new initiative.',
  },
  Runway: {
    term: 'Runway',
    short: 'Months of cash remaining',
    description: 'Cash ÷ (Burn − Revenue). At €100K cash and €8K net burn = 12 months runway. Below 3 months = acute crisis.',
  },
  Cash: {
    term: 'Cash',
    short: 'Money in the bank',
    description: 'Your bank balance. When it hits 0, the game is over. Cash = oxygen for startups.',
  },

  // Product
  PMF: {
    term: 'PMF — Product-Market Fit',
    short: 'Does your product fit the market?',
    description: 'The holy grail. Measured by: low churn + growing MRR + good product quality + healthy customer base. At PMF ≥ 85 for 3 months you win.',
  },
  Product: {
    term: 'Product Quality',
    short: 'Quality of your product (0-100)',
    description: 'How good your product is. Affects churn (better product = fewer cancellations), conversion, and ultimately PMF. Decays without active investment.',
  },
  Activation: {
    term: 'Activation Rate',
    short: 'Percentage of users who complete onboarding',
    description: 'How many trial users go through onboarding and experience the core value. Low activation = users leave before they see the value.',
  },

  // Game Mechanics
  AP: {
    term: 'AP — Action Points',
    short: 'Action points per month',
    description: 'You have limited AP each month. Each decision costs AP. Events you can\'t address resolve negatively. AP reset at the start of each month.',
  },
  'Board Meeting': {
    term: 'Board Meeting',
    short: 'Quarterly review meeting',
    description: 'Every 3 months, compare your results against your forecast. Good results = bonus, bad results = pressure and higher burn.',
  },

  // Fundraising
  Fundraising: {
    term: 'Fundraising',
    short: 'Raising capital from investors',
    description: 'Getting money from angels or VCs. Requires good metrics (MRR, churn, LTV:CAC). Your founder background strongly affects success rates.',
  },
  'Series A': {
    term: 'Series A',
    short: 'First major funding round',
    description: 'Typically €500K-€2M. Requires: MRR > €10K, churn < 5%, LTV:CAC > 3. Most startups never make it to Series A.',
  },
};

/**
 * Lookup a glossary entry. Tries exact match, then case-insensitive.
 */
export function lookupTerm(term) {
  if (GLOSSARY[term]) return GLOSSARY[term];
  const lower = term.toLowerCase();
  const found = Object.entries(GLOSSARY).find(([k]) => k.toLowerCase() === lower);
  return found ? found[1] : null;
}
