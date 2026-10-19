// ═══════════════════════════════════════════════════════════════
// CLASS-SPECIFIC EXPORT CONFIGS
// Each class defines its own assumptions, model columns, formulas,
// scenarios, benchmarks, glossary, and common mistakes for the
// Excel financial model export.
// ═══════════════════════════════════════════════════════════════

// ─── SaaS (CloudKitchen) ─────────────────────────────────────
const saasExport = {
  id: 'saas',
  title: 'SaaS FINANCIAL MODEL',
  benchmarks: [
    { metric: 'Monthly Churn', good: '< 3%', acceptable: '3-5%', concerning: '> 5%', notes: 'SMB churn is higher. Enterprise < 1%. 5% monthly = 46% annual.' },
    { metric: 'LTV:CAC Ratio', good: '> 3:1', acceptable: '2-3:1', concerning: '< 2:1', notes: 'Below 1:1 = losing money on every customer.' },
    { metric: 'CAC Payback', good: '< 6 months', acceptable: '6-12 months', concerning: '> 12 months', notes: 'Median B2B SaaS payback is 15 months (2025).' },
    { metric: 'Net Revenue Retention', good: '> 110%', acceptable: '95-110%', concerning: '< 95%', notes: 'NRR > 100% = grow even without new customers.' },
    { metric: 'Gross Margin', good: '> 75%', acceptable: '65-75%', concerning: '< 65%', notes: 'SaaS should be 70-85%. Below 65% is services.' },
    { metric: 'Quick Ratio', good: '> 4', acceptable: '2-4', concerning: '< 2', notes: '(New + Expansion) / (Churn + Contraction).' },
    { metric: 'Monthly MRR Growth', good: '> 15%', acceptable: '8-15%', concerning: '< 8%', notes: 'Seed stage. Growth rate peaks early.' },
    { metric: 'Burn Multiple', good: '< 1.5x', acceptable: '1.5-2.5x', concerning: '> 2.5x', notes: 'Net Burn / Net New ARR.' },
  ],

  commonMistakes: [
    ['Underestimating CAC', 'First customers came from network', 'Paid channels cost 3-5x what you assumed', 'Track actual CAC from month 1'],
    ['Ignoring churn', '"Our product is great"', '5% monthly = 46% annual', 'Measure weekly. Call every churned customer.'],
    ['Hiring before PMF', '"We need to move faster"', 'Burn doubles, velocity doesn\'t', 'Don\'t hire until you can\'t NOT hire'],
    ['Optimistic forecasts', 'Founders are optimists', 'Investors discount by 50% anyway', 'Build pessimistic case first'],
    ['No unit economics', '"We\'ll figure out pricing later"', 'Free users don\'t convert', 'Price from day 1. Track LTV:CAC monthly.'],
    ['Raising too little', '"We\'ll be efficient"', 'You\'re fundraising again immediately', 'Raise for 18-24 months runway'],
  ],

  glossary: [
    ['MRR', 'Sum of monthly subscription payments', 'Predictable recurring revenue', '—'],
    ['ARR', 'MRR × 12', 'Annual equivalent for fundraising', '> €100K seed, > €1M Series A'],
    ['Churn Rate', 'Customers lost ÷ Starting customers', 'Customer loss rate. Compounds monthly.', '< 5% monthly SMB, < 2% enterprise'],
    ['NRR', '(Begin MRR - Churn + Expansion) ÷ Begin MRR', '> 100% = grow without new sales', '> 100%, ideally > 110%'],
    ['GRR', '(Begin MRR - Churn) ÷ Begin MRR', 'Pure retention (no expansion)', '> 90%'],
    ['CAC', 'Sales & Marketing ÷ New Customers', 'Cost per customer. Include your time!', '€50-200 for B2B SaaS'],
    ['LTV', 'ARPU ÷ Monthly Churn Rate', 'Lifetime revenue per customer', '> 3× CAC'],
    ['LTV:CAC', 'LTV ÷ CAC', '< 1 = losing money per customer', '> 3:1'],
    ['CAC Payback', 'CAC ÷ Monthly Revenue per Customer', 'Months to recover acquisition cost', '< 12 months'],
    ['Quick Ratio', '(New + Expansion) ÷ (Churn + Contraction)', 'Growth efficiency', '> 4'],
    ['Burn Rate', 'Total monthly costs', 'Cash going out each month', 'As low as possible pre-PMF'],
    ['Runway', 'Cash ÷ Net Burn', 'Months until cash = 0', '> 12 months, ideally 18+'],
    ['Burn Multiple', 'Net Burn ÷ Net New ARR', 'Cash efficiency of growth', '< 2x seed, < 1.5x Series A'],
    ['Gross Margin', '(Revenue - COGS) ÷ Revenue', 'Unit profitability', '> 70% for SaaS'],
    ['Rule of 40', 'Revenue Growth % + Profit Margin %', 'Combined health at scale', '> 40%'],
  ],

  glossaryTitle: 'SaaS GLOSSARY — Key Metrics & Formulas',

  furtherReading: [
    ['SaaS Metrics 2.0 — David Skok', 'https://www.forentrepreneurs.com/saas-metrics-2/'],
    ['SaaS Financial Plan — Christoph Janz', 'https://christophjanz.blogspot.com/2016/03/saas-financial-plan-20.html'],
    ['SaaS Metrics Cheat Sheet — The SaaS CFO', 'https://www.thesaascfo.com/saas-metrics/'],
    ['Startup Key Metrics — Tomasz Tunguz', 'https://www.tomtunguz.com/saas-startup-metrics-template/'],
  ],

  // Game comparison columns
  gameCompHeaders: ['Month', 'MRR Plan', 'MRR Actual', 'MRR Δ%', 'Cust Plan', 'Cust Actual', 'Churn Plan', 'Churn Actual', 'Cash Plan', 'Cash Actual', 'Cash Δ%', 'PMF'],
  gameCompWidths: [7, 11, 11, 9, 10, 11, 10, 11, 11, 11, 9, 7],
  buildGameCompRow: (f, a) => {
    const mrrD = f.totalMRR > 0 ? Math.round(((a.totalMRR ?? 0) - f.totalMRR) / f.totalMRR * 100) : 0;
    const cashD = f.cash > 0 ? Math.round(((a.cash ?? 0) - f.cash) / f.cash * 100) : 0;
    return [
      f.totalMRR ?? 0, a.totalMRR ?? 0, `${mrrD}%`,
      f.customers ?? 0, a.customers ?? 0,
      f.churn != null ? `${safeFixed(f.churn, 1)}%` : '', a.churn != null ? `${safeFixed(a.churn, 1)}%` : '',
      f.cash ?? 0, a.cash ?? 0, `${cashD}%`, a.pmf ?? 0,
    ];
  },

  // Revenue waterfall
  waterfallTitle: 'MRR WATERFALL — Game Data',
  waterfallSubtitle: 'The view investors want. How your revenue moved each month.',
  waterfallHeaders: ['Month', 'Begin MRR', '(+) New', '(-) Churned', 'Net New', 'End MRR', 'Customers', 'MoM %', 'NRR %', 'Quick Ratio', 'ARR'],
  waterfallWidths: [7, 12, 10, 12, 10, 11, 11, 9, 9, 11, 11],
  buildWaterfallRow: (s, prev) => {
    const beginMRR = prev.totalMRR ?? 0;
    const newMRR = s.newMRR ?? 0;
    const churnedMRR = s.churnedMRR ?? 0;
    const endMRR = s.totalMRR ?? 0;
    const mom = beginMRR > 0 ? Math.round((newMRR - churnedMRR) / beginMRR * 1000) / 10 : 0;
    const nrr = beginMRR > 0 ? Math.round((beginMRR - churnedMRR) / beginMRR * 1000) / 10 : 100;
    const qr = churnedMRR > 0 ? Math.round(newMRR / churnedMRR * 10) / 10 : 99;
    return [`M${s.month}`, beginMRR, newMRR, churnedMRR, newMRR - churnedMRR, endMRR, s.customers ?? 0, `${mom}%`, `${nrr}%`, qr, endMRR * 12];
  },
  waterfallNotes: [
    'New MRR = new customers × price. Your acquisition engine.',
    'Churned MRR = lost customers × price. The leak.',
    'NRR > 100% = you grow even without new sales.',
    'Quick Ratio > 4 = healthy. < 2 = leaky bucket.',
  ],
};

// ─── Consumer (GlowUp) ──────────────────────────────────────
const consumerExport = {
  id: 'consumer',
  title: 'Consumer FINANCIAL MODEL',
  benchmarks: [
    { metric: 'Repeat Rate', good: '> 25%', acceptable: '15-25%', concerning: '< 15%', notes: 'D2C wellness: 20-30% is good. Below 10% = product problem.' },
    { metric: 'LTV:CAC Ratio', good: '> 3:1', acceptable: '2-3:1', concerning: '< 2:1', notes: 'D2C needs higher ratio due to thin margins.' },
    { metric: 'CAC', good: '< €20', acceptable: '€20-40', concerning: '> €40', notes: 'Meta/Instagram D2C: €15-€35. Rises with scale.' },
    { metric: 'Gross Margin', good: '> 60%', acceptable: '40-60%', concerning: '< 40%', notes: 'D2C wellness needs 50%+ after COGS + shipping.' },
    { metric: 'Viral Coefficient', good: '> 0.5', acceptable: '0.2-0.5', concerning: '< 0.2', notes: 'Measured per 100 customers. >100 = true viral growth.' },
    { metric: 'CAC Payback', good: '< 3 months', acceptable: '3-6 months', concerning: '> 6 months', notes: 'D2C payback must be faster than SaaS due to lower LTV.' },
    { metric: 'Monthly Revenue Growth', good: '> 20%', acceptable: '10-20%', concerning: '< 10%', notes: 'Early D2C grows fast or dies fast.' },
    { metric: 'Ad ROAS', good: '> 3x', acceptable: '2-3x', concerning: '< 2x', notes: 'Return on ad spend. Below 2x = unprofitable ads.' },
  ],

  commonMistakes: [
    ['Scaling ads too fast', 'First ROAS looked great', 'CAC doubles at 3x spend', 'Scale 20% per week, monitor daily'],
    ['Ignoring repeat rate', '"We\'ll fix retention later"', 'You\'re buying one-time customers', 'Track 30/60/90 day retention from week 1'],
    ['Influencer dependency', '"Our influencer drives all sales"', 'One person = one channel risk', 'Diversify to 3+ acquisition channels'],
    ['Underpricing', '"Low price = more customers"', 'Thin margins can\'t fund growth', 'Price for margin, not volume'],
    ['No subscription option', '"People want flexibility"', 'Predictable revenue beats one-time', 'Offer auto-ship with small discount'],
    ['Vanity metrics', '"We have 50K followers"', 'Followers ≠ customers', 'Track CAC, LTV, repeat rate — nothing else matters'],
  ],

  glossary: [
    ['AOV', 'Total Revenue ÷ Total Orders', 'Average order value', '€25-€60 for D2C wellness'],
    ['Repeat Rate', 'Repeat Orders ÷ Active Customers', '% who reorder each month', '> 20% for subscription-like D2C'],
    ['Viral Coefficient', 'Referrals per 100 customers', 'Organic growth multiplier', '> 50 (0.5 referrals per customer)'],
    ['CAC', 'Ad Spend ÷ New Paid Customers', 'Cost per acquired customer', '€15-35 for Instagram D2C'],
    ['LTV', 'AOV × (1 + rr + rr²)', '3-month customer lifetime value', '> 3× CAC'],
    ['COGS', 'Product + Packaging + Shipping per order', 'Direct cost per order', '30-50% of AOV'],
    ['Gross Margin', '(Revenue - COGS - Fulfillment) ÷ Revenue', 'Profit after direct costs', '> 50% for D2C'],
    ['ROAS', 'Revenue from Ads ÷ Ad Spend', 'Return on ad spend', '> 3x to be profitable'],
    ['Burn Rate', 'Total monthly costs', 'Cash going out each month', 'As low as possible pre-PMF'],
    ['Runway', 'Cash ÷ Net Burn', 'Months until cash = 0', '> 12 months'],
  ],

  glossaryTitle: 'D2C Consumer GLOSSARY — Key Metrics & Formulas',

  furtherReading: [
    ['D2C Brand Playbook — Shopify', 'https://www.shopify.com/blog/direct-to-consumer'],
    ['Unit Economics for D2C — First Round', 'https://review.firstround.com/'],
    ['Retention is King — Andrew Chen', 'https://andrewchen.com/retention-is-king/'],
  ],

  gameCompHeaders: ['Month', 'Revenue Plan', 'Revenue Actual', 'Rev Δ%', 'Cust Plan', 'Cust Actual', 'Repeat Plan', 'Repeat Actual', 'Cash Plan', 'Cash Actual', 'Cash Δ%', 'PMF'],
  gameCompWidths: [7, 12, 12, 9, 10, 11, 10, 12, 11, 11, 9, 7],
  buildGameCompRow: (f, a) => {
    const revD = f.totalMRR > 0 ? Math.round(((a.totalMRR ?? 0) - f.totalMRR) / f.totalMRR * 100) : 0;
    const cashD = f.cash > 0 ? Math.round(((a.cash ?? 0) - f.cash) / f.cash * 100) : 0;
    return [
      f.totalMRR ?? 0, a.totalMRR ?? 0, `${revD}%`,
      f.customers ?? 0, a.customers ?? 0,
      f.repeatRate != null ? `${safeFixed(f.repeatRate, 1)}%` : '', a.repeatRate != null ? `${safeFixed(a.repeatRate, 1)}%` : '',
      f.cash ?? 0, a.cash ?? 0, `${cashD}%`, a.pmf ?? 0,
    ];
  },

  waterfallTitle: 'REVENUE WATERFALL — Game Data',
  waterfallSubtitle: 'Where your revenue came from each month.',
  waterfallHeaders: ['Month', 'Paid Cust.', 'Organic', 'Repeat', 'Total Orders', 'Revenue', 'Active Cust.', 'Repeat %', 'Viral Coeff', 'Gross Margin', 'Cash'],
  waterfallWidths: [7, 11, 10, 10, 12, 11, 12, 10, 11, 12, 11],
  buildWaterfallRow: (s) => [
    `M${s.month}`, s.newPaid ?? 0, s.newOrganic ?? 0, s.repeatOrders ?? 0,
    s.totalOrders ?? 0, s.revenue ?? 0, s.activeCustomers ?? s.customers ?? 0,
    `${safeFixed(s.repeatRate, 1)}%`, s.viralCoeff ?? 0, `${s.grossMargin ?? 0}%`, s.cash ?? 0,
  ],
  waterfallNotes: [
    'Paid Customers = ad spend ÷ CAC. Your paid acquisition engine.',
    'Organic = viral referrals. Free growth from happy customers.',
    'Repeat Orders = existing customers reordering. The real business.',
    'Repeat Rate > 20% = subscription-like economics without the subscription.',
  ],
};

// ─── Deep-Tech (NanoSense) ───────────────────────────────────
const deeptechExport = {
  id: 'deeptech',
  title: 'Deep-Tech FINANCIAL MODEL',
  benchmarks: [
    { metric: 'Cert Timeline', good: '< 10 months', acceptable: '10-15 months', concerning: '> 15 months', notes: 'EU CE marking + food contact: 8-18 months typical.' },
    { metric: 'Unit Margin', good: '> 70%', acceptable: '50-70%', concerning: '< 50%', notes: 'Hardware needs high margins to justify R&D investment.' },
    { metric: 'LOI Conversion', good: '> 30%', acceptable: '15-30%', concerning: '< 15%', notes: 'Food industry pilots convert slowly. 6-12 month cycles.' },
    { metric: 'Grant Efficiency', good: '< €50K/milestone', acceptable: '€50-100K', concerning: '> €100K', notes: 'Track cost per TRL advancement.' },
    { metric: 'TRL Progress', good: '1 level / 3 months', acceptable: '1 level / 6 months', concerning: 'Stalled', notes: 'Technology Readiness Level should advance steadily.' },
    { metric: 'R&D Burn Rate', good: '< €12K/mo', acceptable: '€12-18K/mo', concerning: '> €18K/mo', notes: 'Lab costs creep up. Budget for equipment replacement.' },
    { metric: 'Pilot Pipeline', good: '> 5 companies', acceptable: '3-5', concerning: '< 3', notes: 'Start conversations early — they take 6+ months.' },
  ],

  commonMistakes: [
    ['Optimistic certification', '"We\'ll be done in 8 months"', 'Takes 14-18 months with setbacks', 'Budget for 1.5× your estimate'],
    ['Ignoring grant milestones', '"The money is secured"', 'Grants have reporting requirements', 'Track deliverables quarterly'],
    ['No pilot conversations', '"We\'ll sell after certification"', 'Sales cycle is 6-12 months', 'Start conversations at TRL 4-5'],
    ['Underestimating lab costs', '"Equipment is a one-time cost"', 'Maintenance, calibration, consumables add up', 'Budget €3-5K/mo for equipment upkeep'],
    ['No IP strategy', '"The patent can wait"', 'Competitors are watching your publications', 'File provisional patents early'],
    ['Solo technical focus', '"The science speaks for itself"', 'Customers buy solutions, not technology', 'Hire/find a commercial co-founder'],
  ],

  glossary: [
    ['TRL', 'Technology Readiness Level (1-9)', 'How close to production-ready', 'TRL 6+ for pilot, TRL 8+ for market'],
    ['LOI', 'Letter of Intent', 'Non-binding commitment to buy', '3+ LOIs before Series A'],
    ['Certification', 'EU CE + sector-specific (food contact, medical, etc.)', 'Legal permission to sell', 'Budget 12-18 months'],
    ['Unit Economics', 'Revenue per unit - Cost per unit', 'Margin on each sale', '> 60% gross margin'],
    ['Grant Runway', 'Grant Remaining ÷ Monthly Burn', 'Months of funded operation', '> 18 months ideal'],
    ['R&D Burn', 'Lab + materials + equipment + personnel', 'Monthly development cost', 'Track vs milestones achieved'],
    ['Pilot', 'Paid trial with customer using real product', 'Strongest validation signal', 'Aim for 2-3 pre-certification'],
    ['IP Filing', 'Patent application (provisional or full)', 'Competitive moat', 'File before publishing research'],
  ],

  glossaryTitle: 'Deep-Tech GLOSSARY — Key Metrics & Concepts',

  furtherReading: [
    ['Deep-Tech Investing — BCG', 'https://www.bcg.com/publications/2021/deep-tech-innovation'],
    ['Hardware Startup Guide — HAX', 'https://hax.co/resources'],
    ['EU Funding Guide — FFG', 'https://www.ffg.at/en'],
  ],

  gameCompHeaders: ['Month', 'Cert Plan', 'Cert Actual', 'Cert Δ', 'LOIs Plan', 'LOIs Actual', 'Sold Plan', 'Sold Actual', 'Cash Plan', 'Cash Actual', 'Cash Δ%', 'PMF'],
  gameCompWidths: [7, 10, 10, 8, 10, 10, 10, 10, 11, 11, 9, 7],
  buildGameCompRow: (f, a) => {
    const certD = Math.round((a.certProgress ?? 0) - (f.certProgress ?? 0));
    const cashD = f.cash > 0 ? Math.round(((a.cash ?? 0) - f.cash) / f.cash * 100) : 0;
    return [
      `${Math.round(f.certProgress ?? 0)}%`, `${Math.round(a.certProgress ?? 0)}%`, `${certD > 0 ? '+' : ''}${certD}pp`,
      f.lois ?? 0, a.lois ?? 0,
      f.unitsSold ?? 0, a.unitsSold ?? 0,
      f.cash ?? 0, a.cash ?? 0, `${cashD}%`, a.pmf ?? 0,
    ];
  },

  waterfallTitle: 'R&D PROGRESS — Game Data',
  waterfallSubtitle: 'Your journey from lab bench to market.',
  waterfallHeaders: ['Month', 'Cert %', 'LOIs', 'Units Sold', 'Revenue', 'R&D Burn', 'Grant Left', 'Cash', 'TRL', 'Product', 'Runway'],
  waterfallWidths: [7, 10, 8, 11, 11, 11, 12, 11, 7, 10, 10],
  buildWaterfallRow: (s) => [
    `M${s.month}`, `${safeFixed(s.certProgress, 0)}%`, s.lois ?? 0, s.unitsSold ?? 0,
    s.revenue ?? 0, s.rdBurn ?? 0, s.grantRemaining ?? 0, s.cash ?? 0,
    s.prototypeStage ?? 4, Math.round(s.product ?? 20), s.runway ?? 0,
  ],
  waterfallNotes: [
    'Certification % = regulatory progress. 100% = cleared to sell.',
    'LOIs = Letters of Intent. Non-binding but strongest pre-revenue signal.',
    'TRL = Technology Readiness Level. Higher = closer to production.',
    'Grant Left = remaining funded burn. After that, it\'s your cash.',
  ],
};

// ─── Marketplace (SwapCircle) ────────────────────────────────
const marketplaceExport = {
  id: 'marketplace',
  title: 'Marketplace FINANCIAL MODEL',
  benchmarks: [
    { metric: 'Liquidity', good: '> 30%', acceptable: '15-30%', concerning: '< 15%', notes: 'Users matched per month. Below 10% = death spiral.' },
    { metric: 'Take Rate', good: '8-12%', acceptable: '5-8%', concerning: '< 5% or > 15%', notes: 'Too high drives supply away. Too low = no revenue.' },
    { metric: 'Supply:Demand Ratio', good: '0.8-1.2', acceptable: '0.5-0.8 or 1.2-2', concerning: '< 0.5 or > 2', notes: 'Balance is key. Oversupply = unhappy providers.' },
    { metric: 'Match Rate', good: '> 25%', acceptable: '15-25%', concerning: '< 15%', notes: 'Matching algorithm quality + supply diversity.' },
    { metric: 'Supply Churn', good: '< 8%', acceptable: '8-15%', concerning: '> 15%', notes: 'Providers stay if they get matches.' },
    { metric: 'Demand Churn', good: '< 10%', acceptable: '10-18%', concerning: '> 18%', notes: 'Seekers leave faster than providers.' },
    { metric: 'Transaction Completion', good: '> 80%', acceptable: '60-80%', concerning: '< 60%', notes: 'Matches that complete as transactions.' },
  ],

  commonMistakes: [
    ['Focusing on one side', '"We\'ll build supply first"', 'Both sides churn without the other', 'Grow both sides simultaneously'],
    ['Take rate too high', '"We need revenue"', 'Supply moves to direct deals', 'Start low (5-8%), raise with value added'],
    ['Ignoring matching quality', '"We have users"', 'Bad matches = both sides leave', 'Invest in matching algorithm early'],
    ['Subsidy addiction', '"Free listings bring supply"', 'Subsidies mask broken unit economics', 'Test willingness to pay before month 6'],
    ['Geographic spread too thin', '"We\'re a national platform"', 'Low density = low liquidity', 'Dominate one city/niche first'],
  ],

  glossary: [
    ['GMV', 'Gross Merchandise Value — total transaction volume', 'Total value flowing through your marketplace', 'Growth metric for investors'],
    ['Take Rate', 'Revenue ÷ GMV', 'Your cut of each transaction', '5-15% for skill/service marketplaces'],
    ['Liquidity', 'Transacting Users ÷ Total Active Users', 'How many users successfully transact', '> 20% = healthy marketplace'],
    ['Supply', 'Service providers / sellers on the platform', 'One side of your marketplace', 'Track acquisition + retention separately'],
    ['Demand', 'Service seekers / buyers on the platform', 'The side that typically pays', 'Usually higher churn than supply'],
    ['Match Rate', 'Successful matches ÷ Matchable pool', 'Algorithm + density effectiveness', '> 20% for viable marketplace'],
    ['Cold Start', 'Empty marketplace — no supply, no demand', 'The chicken-and-egg problem', 'Solve with constrained launch'],
    ['Network Effects', 'More users = more value for each user', 'The moat of marketplaces', 'Only kicks in after liquidity threshold'],
  ],

  glossaryTitle: 'Marketplace GLOSSARY — Key Metrics & Concepts',

  furtherReading: [
    ['Marketplace Liquidity — Sarah Tavel', 'https://sarahtavel.medium.com/'],
    ['Cold Start Problem — Andrew Chen', 'https://andrewchen.com/the-cold-start-problem-book/'],
    ['Marketplace KPIs — a16z', 'https://a16z.com/marketplace-metrics/'],
  ],

  gameCompHeaders: ['Month', 'Supply Plan', 'Supply Actual', 'Demand Plan', 'Demand Actual', 'Rev Plan', 'Rev Actual', 'Liq Plan', 'Liq Actual', 'Cash Plan', 'Cash Actual', 'PMF'],
  gameCompWidths: [7, 10, 11, 10, 12, 10, 11, 9, 10, 11, 11, 7],
  buildGameCompRow: (f, a) => [
    f.supply ?? 0, a.supply ?? 0,
    f.demand ?? 0, a.demand ?? 0,
    f.revenue ?? f.totalMRR ?? 0, a.revenue ?? a.totalMRR ?? 0,
    `${f.liquidity ?? 0}%`, `${Math.min(100, a.liquidity ?? 0)}%`,
    f.cash ?? 0, a.cash ?? 0, a.pmf ?? 0,
  ],

  waterfallTitle: 'MARKETPLACE DYNAMICS — Game Data',
  waterfallSubtitle: 'Supply, demand, matching, and revenue each month.',
  waterfallHeaders: ['Month', 'Supply', 'Demand', 'Matches', 'Transactions', 'GMV', 'Revenue', 'Liquidity %', 'Take Rate %', 'Burn', 'Cash'],
  waterfallWidths: [7, 10, 10, 10, 12, 11, 11, 11, 10, 11, 11],
  buildWaterfallRow: (s) => [
    `M${s.month}`, s.supply ?? 0, s.demand ?? 0, s.matches ?? 0,
    s.transactions ?? 0, s.gmv ?? 0, s.revenue ?? 0,
    `${Math.min(100, s.liquidity ?? 0)}%`, `${s.takeRate ?? 0}%`, s.totalBurn ?? 0, s.cash ?? 0,
  ],
  waterfallNotes: [
    'Supply + Demand must both grow. Imbalance kills liquidity.',
    'Liquidity > 20% = marketplace is working. Below 10% = death spiral.',
    'GMV × Take Rate = Revenue. Grow GMV before raising take rate.',
    'Transactions = completed matches. Completion rate depends on product quality.',
  ],
};

// ─── Service (StrategyForge) ─────────────────────────────────
const serviceExport = {
  id: 'service',
  title: 'Service FINANCIAL MODEL',
  benchmarks: [
    { metric: 'Utilization', good: '70-85%', acceptable: '50-70%', concerning: '< 50% or > 90%', notes: 'Sweet spot maximizes revenue without burnout.' },
    { metric: 'Gross Margin', good: '> 60%', acceptable: '40-60%', concerning: '< 40%', notes: 'Below 40% = staffing business. Above 60% = scalable.' },
    { metric: 'Repeat Rate', good: '> 30%', acceptable: '15-30%', concerning: '< 15%', notes: 'Repeat clients are 5x cheaper than new ones.' },
    { metric: 'Close Rate', good: '> 25%', acceptable: '15-25%', concerning: '< 15%', notes: 'Network referrals close at 40%+.' },
    { metric: 'Revenue/Head', good: '> €8K/mo', acceptable: '€5-8K', concerning: '< €5K', notes: 'Revenue per team member. Drives hiring decisions.' },
    { metric: 'Pipeline Coverage', good: '> 3x', acceptable: '2-3x', concerning: '< 2x', notes: 'Pipeline value ÷ target revenue.' },
    { metric: 'Client Concentration', good: '< 30% from #1 client', acceptable: '30-50%', concerning: '> 50%', notes: 'One client leaving shouldn\'t kill you.' },
  ],

  commonMistakes: [
    ['Underpricing', '"We\'ll raise prices later"', 'Clients anchor on first price', 'Price for value from day 1'],
    ['100% utilization trap', '"We\'re so busy!"', 'No time for sales = empty pipeline next month', 'Keep 15-20% capacity for business development'],
    ['Hiring too early', '"We need to grow the team"', 'Payroll doubles, revenue doesn\'t', 'Hire only when turning away 30%+ of inbound'],
    ['No productization', '"Every client is unique"', 'Revenue is linear: more clients = more hours', 'Create reusable frameworks + AI tooling'],
    ['Founder dependency', '"I do the best work"', 'Company value = 0 without you', 'Document processes. Train others. Delegate.'],
    ['No pipeline discipline', '"Clients come from referrals"', 'Feast-or-famine revenue cycles', 'Dedicate 20% of time to outbound sales always'],
  ],

  glossary: [
    ['Utilization', 'Billable Hours ÷ Available Hours', 'How much capacity is revenue-generating', '70-85% sweet spot'],
    ['Gross Margin', '(Revenue - Delivery Cost) ÷ Revenue', 'Profit after direct project costs', '> 50% for consulting'],
    ['Close Rate', 'New Clients ÷ Pipeline', 'Conversion from prospect to client', '15-35% for B2B consulting'],
    ['Repeat Rate', 'Returning Clients ÷ Total Active', 'Client loyalty metric', '> 20% for healthy business'],
    ['Billable Hours', 'Hours spent on client delivery', 'Your inventory — once gone, gone', 'Track weekly per person'],
    ['Revenue/Head', 'Total Revenue ÷ Team Size', 'Revenue productivity', '> €8K/head/month'],
    ['Pipeline', 'Prospective clients in various stages', 'Future revenue indicator', 'Should be 3× target revenue'],
    ['Sales Cycle', 'Days from first contact to signed deal', 'Cash flow predictor', '1-4 months for B2B consulting'],
  ],

  glossaryTitle: 'Service Business GLOSSARY — Key Metrics & Concepts',

  furtherReading: [
    ['Managing the Professional Service Firm — David Maister', 'https://davidmaister.com/books/mtpsf/'],
    ['Built to Sell — John Warrillow', 'https://builttosell.com/'],
    ['Consulting Success — Michael Zipursky', 'https://www.consultingsuccess.com/'],
  ],

  gameCompHeaders: ['Month', 'Rev Plan', 'Rev Actual', 'Rev Δ%', 'Clients Plan', 'Clients Actual', 'Margin Plan', 'Margin Actual', 'Cash Plan', 'Cash Actual', 'Cash Δ%', 'PMF'],
  gameCompWidths: [7, 10, 11, 9, 11, 12, 11, 12, 11, 11, 9, 7],
  buildGameCompRow: (f, a) => {
    const revD = f.totalMRR > 0 ? Math.round(((a.totalMRR ?? 0) - f.totalMRR) / f.totalMRR * 100) : 0;
    const cashD = f.cash > 0 ? Math.round(((a.cash ?? 0) - f.cash) / f.cash * 100) : 0;
    return [
      f.totalMRR ?? 0, a.totalMRR ?? 0, `${revD}%`,
      f.customers ?? f.activeClients ?? 0, a.customers ?? a.activeClients ?? 0,
      `${f.grossMargin ?? 0}%`, `${Math.max(0, a.grossMargin ?? 0)}%`,
      f.cash ?? 0, a.cash ?? 0, `${cashD}%`, a.pmf ?? 0,
    ];
  },

  waterfallTitle: 'CLIENT DYNAMICS — Game Data',
  waterfallSubtitle: 'Pipeline, clients, revenue, and utilization each month.',
  waterfallHeaders: ['Month', 'Pipeline', 'New', 'Repeat', 'Active', 'Revenue', 'Margin %', 'Utilization', 'Billable Hrs', 'Burn', 'Cash'],
  waterfallWidths: [7, 10, 8, 9, 9, 11, 10, 11, 12, 11, 11],
  buildWaterfallRow: (s) => [
    `M${s.month}`, s.pipeline ?? 0, s.customers ?? 0, `${safeFixed(s.repeatRate, 0)}%`,
    s.activeClients ?? s.customers ?? 0, s.revenue ?? 0,
    `${Math.max(0, s.grossMargin ?? 0)}%`, `${s.utilization ?? 0}%`,
    s.billableHours ?? 0, s.totalBurn ?? 0, s.cash ?? 0,
  ],
  waterfallNotes: [
    'Pipeline = prospective clients. Should be 3× target monthly revenue.',
    'Utilization 70-85% is the sweet spot. Above 90% = burnout. Below 50% = trouble.',
    'Gross Margin below 40% means you\'re a staffing business, not consulting.',
    'Revenue/Head should grow each quarter — that\'s how you know AI leverage is working.',
  ],
};

// ─── Helper ──────────────────────────────────────────────────
function safeFixed(val, decimals) {
  if (val == null || typeof val !== 'number' || !isFinite(val)) return '0';
  return val.toFixed(decimals);
}

// ─── Export map ──────────────────────────────────────────────
export const CLASS_EXPORT_CONFIGS = {
  saas: saasExport,
  consumer: consumerExport,
  deeptech: deeptechExport,
  marketplace: marketplaceExport,
  service: serviceExport,
};

export function getExportConfig(classId) {
  return CLASS_EXPORT_CONFIGS[classId] ?? saasExport;
}
