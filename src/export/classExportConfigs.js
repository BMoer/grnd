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
  fileName: 'saas_financial_model.xlsx',

  assumptions: [
    { label: 'Monthly Price (€)', key: 'price', default: 49, guidance: 'What you charge per customer per month' },
    { label: 'Monthly Churn (%)', key: 'churnRate', default: 5, guidance: 'Customers lost per month. B2B SaaS: 3-8%' },
    { label: 'CAC (€)', key: 'targetCAC', default: 80, guidance: 'Cost to acquire one paying customer' },
    { label: 'Conversion Rate (%)', key: 'conversionRate', default: 15, guidance: 'Trial-to-paid. B2B: 10-25%' },
    { label: 'Monthly New Trials', key: 'pipelineGrowth', default: 20, guidance: 'People entering your funnel each month' },
    { label: 'Support Cost (€/customer/mo)', key: 'supportCost', default: 5, guidance: 'Direct cost per customer' },
    { label: 'Starting Cash (€)', key: '_startingCash', default: 100000, guidance: 'Money in the bank today' },
    { label: 'Monthly Team Cost (€)', key: '_teamCost', default: 4500, guidance: 'Salaries + office + tools (excl. per-customer)' },
    { label: 'Pipeline Growth (%/mo)', key: '_pipelineGrowthPct', default: 5, guidance: 'How fast your pipeline grows. 0 = flat.' },
  ],

  modelHeaders: [
    'Month', 'New Trials', 'Conversions', 'New Cust.',
    'Churned Cust.', 'Total Cust.',
    'New MRR', 'Churned MRR', 'Net New MRR', 'Total MRR',
    'Revenue', 'Support €', 'Marketing €', 'Total Burn',
    'Cash', 'Runway',
    'LTV', 'LTV:CAC', 'CAC Payback', 'NRR %',
    'Quick Ratio', 'ARR', 'Gross Margin %',
  ],

  columnWidths: [
    9, 13, 12, 12, 14, 13,
    12, 13, 13, 12, 12, 13, 14, 12,
    12, 11, 10, 9, 13, 9, 11, 11, 12,
  ],

  // Row references: B5=price, B6=churn%, B7=CAC, B8=conv%, B9=pipeline, B10=support, B11=cash, B12=teamburn, B13=pipegrowth
  buildMonth0Row: (r) => ({
    1: { value: 0 },
    6: { value: 0 },
    10: { value: 0 },
    15: { formula: 'B11', result: 100000 },
  }),

  buildMonthRow: (r, p, m) => ({
    1: { value: m },
    2: m === 1
      ? { formula: 'B9', result: 20 }
      : { formula: `ROUND(B${p}*(1+B13/100),0)`, result: 20 },
    3: { formula: `ROUND(B${r}*B8/100,0)`, result: 3 },
    4: { formula: `C${r}`, result: 3 },
    5: { formula: `ROUND(F${p}*B6/100,0)`, result: 0 },
    6: { formula: `MAX(0,F${p}+D${r}-E${r})`, result: 3 },
    7: { formula: `D${r}*B5`, result: 147 },
    8: { formula: `ROUND(J${p}*B6/100,0)`, result: 0 },
    9: { formula: `G${r}-H${r}`, result: 147 },
    10: { formula: `MAX(0,J${p}+I${r})`, result: 147 },
    11: { formula: `J${r}`, result: 147 },
    12: { formula: `F${r}*B10`, result: 15 },
    13: { formula: `C${r}*B7`, result: 240 },
    14: { formula: `B12+L${r}+M${r}`, result: 4755 },
    15: { formula: `O${p}-N${r}+K${r}`, result: 95392 },
    16: { formula: `IF(N${r}-K${r}>0,ROUND(MAX(0,O${r})/(N${r}-K${r}),0),"∞")`, result: 20 },
    17: { formula: 'IF(B6>0,ROUND(B5/(B6/100),0),"∞")', result: 980 },
    18: { formula: `IF(B7>0,ROUND(Q${r}/B7*10,0)/10,"∞")`, result: 12.3 },
    19: { formula: 'IF(B5>0,ROUND(B7/B5*10,0)/10,"∞")', result: 1.6 },
    20: { formula: `IF(J${p}>0,ROUND((J${p}-H${r})/J${p}*100,1),"–")`, result: 95 },
    21: { formula: `IF(H${r}>0,ROUND(G${r}/H${r}*10,0)/10,"∞")`, result: 99 },
    22: { formula: `J${r}*12`, result: 1764 },
    23: { formula: `IF(K${r}>0,ROUND((K${r}-L${r})/K${r}*100,0),"–")`, result: 90 },
  }),

  cashCol: 15,
  runwayCol: 16,

  instructions: [
    '1. Change the blue assumption cells (B5-B13) to YOUR startup\'s real numbers.',
    '2. The entire 24-month projection recalculates automatically.',
    '3. Key question: Which month does Cash (column O) go negative? That\'s your real runway.',
    '4. Key question: Is LTV:CAC (column R) above 3x? Below that, you lose money per customer.',
    '5. Key question: When does Revenue (K) exceed Total Burn (N)? That\'s breakeven.',
    '6. Check the "Scenarios" sheet to stress-test pessimistic/optimistic assumptions.',
    '7. Check the "Benchmarks" sheet to verify your numbers are realistic.',
    '8. To add charts: select a data range → Insert → Chart. Recommended: MRR over time, Cash over time.',
  ],

  scenarioInputs: [
    { label: 'Price/mo (€)', key: 'price', pess: 29, opt: 79, note: 'Higher price = fewer but more committed customers' },
    { label: 'Monthly Churn (%)', key: 'churnRate', pess: 12, opt: 4, note: 'Churn compounds. 12% monthly = 79% annual.' },
    { label: 'CAC (€)', key: 'targetCAC', pess: 150, opt: 60, note: 'First-time founders underestimate CAC by ~50%' },
    { label: 'Conversion (%)', key: 'conversionRate', pess: 8, opt: 20, note: 'B2B trial conversion: 10-25% is typical' },
    { label: 'Pipeline/mo', key: 'pipelineGrowth', pess: 10, opt: 35, note: 'Without active sales, pipeline decays' },
  ],

  computeScenarioResult: (sc) => {
    let mrr = 0, cust = 0, cash = 100000, prevMRR = 0;
    const cr = sc.churnRate / 100, cvr = sc.conversionRate / 100;
    for (let m = 1; m <= 24; m++) {
      const conv = Math.round(sc.pipelineGrowth * cvr);
      const churned = Math.round(cust * cr);
      cust = Math.max(0, cust + conv - churned);
      const newMRR = conv * sc.price;
      const churnedMRR = Math.round(prevMRR * cr);
      mrr = Math.max(0, prevMRR + newMRR - churnedMRR);
      cash = cash - (4500 + cust * 5 + Math.round(conv * sc.targetCAC)) + mrr;
      prevMRR = mrr;
    }
    const ltv = cr > 0 ? Math.round(sc.price / cr) : 0;
    return [
      ['M24 MRR (€)', mrr],
      ['M24 Customers', cust],
      ['M24 Cash (€)', Math.round(cash)],
      ['LTV (€)', ltv],
      ['LTV:CAC', `${sc.targetCAC > 0 ? Math.round(ltv / sc.targetCAC * 10) / 10 : 0}x`],
    ];
  },

  survivalQuestion: 'CAN YOU SURVIVE THE PESSIMISTIC CASE?',
  survivalNotes: [
    'If pessimistic cash < 0 before month 12, your margin for error is too thin.',
    'Investors will ask: "What if growth is 50% slower?" This sheet answers that.',
  ],

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
  fileName: 'consumer_financial_model.xlsx',

  assumptions: [
    { label: 'Average Order Value (€)', key: 'aov', default: 35, guidance: 'D2C wellness: €20-€60 typical' },
    { label: 'Monthly Repeat Rate (%)', key: 'repeatRate', default: 15, guidance: 'What % of customers reorder each month. Supplements: 10-25%' },
    { label: 'Customer Acquisition Cost (€)', key: 'targetCAC', default: 25, guidance: 'Instagram/Meta ads for D2C: €15-€40 typical' },
    { label: 'Viral Coefficient (x100)', key: 'viralCoeff', default: 30, guidance: 'Referrals per 100 customers. 30 = every 3rd refers. >100 = viral' },
    { label: 'COGS per Order (€)', key: 'cogs', default: 12, guidance: 'Product + packaging + shipping. Scale brings this down' },
    { label: 'Monthly Ad Spend (€)', key: 'adSpend', default: 5000, guidance: 'Your main growth lever. More spend = more customers' },
    { label: 'Starting Cash (€)', key: '_startingCash', default: 80000, guidance: 'Money in the bank today' },
    { label: 'Monthly Team Cost (€)', key: '_teamCost', default: 3500, guidance: 'Salaries + office + tools' },
  ],

  modelHeaders: [
    'Month', 'New Paid', 'Organic', 'Repeat Orders',
    'Total Orders', 'Active Cust.',
    'Revenue', 'COGS', 'Ad Spend', 'Total Burn',
    'Cash', 'Runway',
    'CAC', 'LTV', 'LTV:CAC', 'Repeat Rate %',
    'Viral Coeff', 'Gross Margin %',
  ],

  columnWidths: [
    9, 12, 10, 13, 12, 12,
    12, 10, 12, 12, 12, 10,
    10, 10, 10, 12, 12, 13,
  ],

  buildMonth0Row: (r) => ({
    1: { value: 0 },
    6: { value: 50 },
    11: { formula: 'B7', result: 80000 },
  }),

  buildMonthRow: (r, p, m) => ({
    1: { value: m },
    2: { formula: `IF(B3>0,ROUND(B6/${r === 19 ? 'B3' : `M${p}`+'/B3*1'},0),0)`, result: 200 },
    // Simplified formulas for consumer — uses assumption refs
    // B2=aov, B3=CAC, B4=repeatRate%, B5=viralCoeff/100, B6=adSpend, B7=cash, B8=teamCost, B9=cogs
    3: { formula: `ROUND(F${p}*B5/100,0)`, result: 15 },
    4: { formula: `ROUND(F${p}*B4/100,0)`, result: 8 },
    5: { formula: `B${r}+C${r}+D${r}`, result: 223 },
    6: { formula: `MAX(0,F${p}+B${r}+C${r}-ROUND(F${p}*0.15,0))`, result: 250 },
    7: { formula: `E${r}*B2`, result: 7805 },
    8: { formula: `E${r}*B9`, result: 2676 },
    9: { formula: 'B6', result: 5000 },
    10: { formula: `B8+H${r}+ROUND(E${r}*3,0)+I${r}+ROUND(G${r}*0.05,0)`, result: 11345 },
    11: { formula: `K${p}-J${r}+G${r}`, result: 76460 },
    12: { formula: `IF(J${r}-G${r}>0,ROUND(MAX(0,K${r})/(J${r}-G${r}),0),"∞")`, result: 22 },
    13: { formula: 'B3', result: 25 },
    14: { formula: 'ROUND(B2*(1+B4/100+(B4/100)^2),0)', result: 40 },
    15: { formula: `IF(M${r}>0,ROUND(N${r}/M${r}*10,0)/10,"∞")`, result: 1.6 },
    16: { formula: 'B4', result: 15 },
    17: { formula: 'B5', result: 30 },
    18: { formula: `IF(G${r}>0,ROUND((G${r}-H${r}-ROUND(E${r}*3,0))/G${r}*100,0),"–")`, result: 55 },
  }),

  cashCol: 11,
  runwayCol: 12,

  instructions: [
    '1. Change the blue assumption cells (B2-B9) to YOUR startup\'s real numbers.',
    '2. The entire 24-month projection recalculates automatically.',
    '3. Key question: Which month does Cash (column K) go negative? That\'s your real runway.',
    '4. Key question: Is repeat rate above 20%? Below that, you\'re buying one-time customers.',
    '5. Key question: When does Revenue (G) exceed Total Burn (J)? That\'s breakeven.',
    '6. Key question: Is Viral Coefficient > 100? That means organic > paid growth.',
    '7. Check the "Scenarios" sheet to stress-test pessimistic/optimistic assumptions.',
    '8. To add charts: select a data range → Insert → Chart. Recommended: Revenue over time, Repeat Rate trend.',
  ],

  scenarioInputs: [
    { label: 'AOV (€)', key: 'aov', pess: 25, opt: 50, note: 'Lower price = impulse buy but thin margins' },
    { label: 'Repeat Rate (%)', key: 'repeatRate', pess: 8, opt: 25, note: 'D2C success lives or dies by repeat orders' },
    { label: 'CAC (€)', key: 'targetCAC', pess: 40, opt: 18, note: 'Social media CAC rises as you scale' },
    { label: 'Viral Coeff (x100)', key: 'viralCoeff', pess: 10, opt: 50, note: 'Word-of-mouth is free growth — but unreliable' },
    { label: 'Ad Spend (€/mo)', key: 'adSpend', pess: 3000, opt: 8000, note: 'More spend = more volume but higher CAC' },
  ],

  computeScenarioResult: (sc) => {
    let active = 50, cash = 80000;
    for (let m = 1; m <= 24; m++) {
      const newPaid = sc.targetCAC > 0 ? Math.round(sc.adSpend / sc.targetCAC) : 0;
      const newOrg = Math.round(active * (sc.viralCoeff / 100));
      const repeat = Math.round(active * (sc.repeatRate / 100));
      const dormant = Math.round(active * 0.15);
      active = Math.max(0, active + newPaid + newOrg - dormant);
      const orders = newPaid + newOrg + repeat;
      const rev = orders * sc.aov;
      const burn = 3500 + orders * (sc.cogs ?? 12) + orders * 3 + sc.adSpend + Math.round(rev * 0.05);
      cash = Math.round(cash - burn + rev);
    }
    const rr = sc.repeatRate / 100;
    const ltv = Math.round(sc.aov * (1 + rr + rr * rr));
    return [
      ['M24 Revenue (€/mo)', active > 0 ? Math.round(active * sc.aov * rr + (sc.targetCAC > 0 ? sc.adSpend / sc.targetCAC : 0) * sc.aov) : 0],
      ['M24 Active Customers', active],
      ['M24 Cash (€)', cash],
      ['LTV (€)', ltv],
      ['LTV:CAC', `${sc.targetCAC > 0 ? Math.round(ltv / sc.targetCAC * 10) / 10 : 0}x`],
    ];
  },

  survivalQuestion: 'CAN YOUR CAC SUSTAIN YOUR GROWTH?',
  survivalNotes: [
    'If LTV < CAC in the pessimistic case, every customer costs you money.',
    'D2C brands need repeat rate > 15% to survive. Below that, you\'re a one-time purchase business.',
  ],

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
  fileName: 'deeptech_financial_model.xlsx',

  assumptions: [
    { label: 'Unit Production Cost (€)', key: 'unitCost', default: 500, guidance: 'Cost to produce one sensor unit. Decreases with scale.' },
    { label: 'Target Unit Price (€)', key: 'unitPrice', default: 2000, guidance: 'What you charge per sensor. Food safety: €500-€5000.' },
    { label: 'Certification Timeline (months)', key: 'certTimeline', default: 12, guidance: 'EU CE marking + food contact regulations. 8-18 months.' },
    { label: 'Pilot Customer Pipeline', key: 'pilotPipeline', default: 3, guidance: 'Companies interested in piloting. Industry moves slowly.' },
    { label: 'Monthly R&D Burn (€)', key: 'rdBurn', default: 15000, guidance: 'Lab costs + materials + equipment. The main cost center.' },
    { label: 'Grant Total (€)', key: '_grantTotal', default: 300000, guidance: 'FFG grant amount.' },
    { label: 'Team Cost (€/mo)', key: '_teamCost', default: 3000, guidance: 'Base team cost beyond R&D.' },
  ],

  modelHeaders: [
    'Month', 'Cert %', 'LOIs', 'Pilot Conv.',
    'Units Sold', 'Revenue',
    'R&D Burn', 'Lab Equip.', 'Total Burn', 'Grant Left',
    'Cash', 'Runway',
    'Unit Margin %', 'TRL', 'Product',
  ],

  columnWidths: [
    9, 10, 8, 11, 11, 12,
    12, 11, 12, 12, 12, 10,
    12, 8, 10,
  ],

  buildMonth0Row: (r) => ({
    1: { value: 0 },
    2: { value: 0 },
    10: { formula: 'B6', result: 300000 },
    11: { formula: 'B6', result: 300000 },
  }),

  buildMonthRow: (r, p, m) => ({
    1: { value: m },
    2: { formula: `MIN(100,B${p}+100/B3)`, result: Math.round(100 / 12 * m) },
    3: { formula: m <= 3 ? '0' : `C${p}+ROUND(B4*0.1,0)`, result: 0 },
    4: { formula: `IF(B${r}>=100,MIN(C${r},1),0)`, result: 0 },
    5: { formula: `E${p}+D${r}`, result: 0 },
    6: { formula: `D${r}*B2`, result: 0 },
    7: { formula: 'B5', result: 15000 },
    8: { formula: `ROUND(${m}*400,0)`, result: m * 400 },
    9: { formula: `G${r}+B7+H${r}`, result: 15000 + 3000 + m * 400 },
    10: { formula: `MAX(0,J${p}-I${r})`, result: Math.max(0, 300000 - (15000 + 3000) * m) },
    11: { formula: `K${p}-MAX(0,I${r}-IF(J${p}>0,MIN(J${p},I${r}),0))+F${r}`, result: 300000 },
    12: { formula: `IF(I${r}-F${r}>0,ROUND(MAX(0,K${r})/(I${r}-F${r}),0),"∞")`, result: 99 },
    13: { formula: `IF(F${r}>0,ROUND((F${r}-D${r}*B1)/F${r}*100,0),"–")`, result: 0 },
    14: { formula: `IF(B${r}>=100,IF(O${r}>60,7,6),IF(O${r}>35,5,4))`, result: 4 },
    15: { formula: `MIN(85,O${p}+1.5)`, result: Math.min(85, 20 + m * 1.5) },
  }),

  cashCol: 11,
  runwayCol: 12,

  instructions: [
    '1. Change the blue assumption cells to YOUR startup\'s real numbers.',
    '2. Key question: Does certification complete before cash runs out?',
    '3. Key question: How many LOIs can you convert post-certification?',
    '4. Key question: When does grant money run out? What happens after?',
    '5. Deep-tech has NO revenue until certification. Plan accordingly.',
    '6. Check the "Scenarios" sheet for fast vs slow certification paths.',
    '7. Unit margin should be > 60% to justify the long development cycle.',
  ],

  scenarioInputs: [
    { label: 'Unit Cost (€)', key: 'unitCost', pess: 800, opt: 300, note: 'Production cost decreases with scale' },
    { label: 'Unit Price (€)', key: 'unitPrice', pess: 1500, opt: 2500, note: 'Higher price = fewer but more committed buyers' },
    { label: 'Cert Timeline (mo)', key: 'certTimeline', pess: 18, opt: 8, note: 'Certification rarely goes faster than planned' },
    { label: 'Pilot Pipeline', key: 'pilotPipeline', pess: 2, opt: 5, note: 'Food industry moves slowly' },
    { label: 'R&D Burn (€/mo)', key: 'rdBurn', pess: 18000, opt: 12000, note: 'Lab costs are hard to cut' },
  ],

  computeScenarioResult: (sc) => {
    let cash = 300000, grantRem = 300000, cert = 0, lois = 0, sold = 0;
    for (let m = 1; m <= 24; m++) {
      cert = Math.min(100, cert + 100 / sc.certTimeline);
      if (m > 3) lois += Math.round(sc.pilotPipeline * 0.1);
      const totalBurn = sc.rdBurn + 3000 + m * 200;
      const draw = Math.min(grantRem, totalBurn);
      grantRem = Math.max(0, grantRem - draw);
      let rev = 0;
      if (cert >= 100 && lois > 0) { sold++; lois--; rev = sc.unitPrice; }
      cash = Math.round(cash - (totalBurn - draw) + rev);
    }
    const margin = sc.unitPrice > 0 ? Math.round((sc.unitPrice - sc.unitCost) / sc.unitPrice * 100) : 0;
    return [
      ['Cert Complete Month', sc.certTimeline <= 24 ? `M${sc.certTimeline}` : 'Not in 24mo'],
      ['M24 Units Sold', sold],
      ['M24 Cash (€)', cash],
      ['Unit Margin', `${margin}%`],
      ['Grant Remaining (€)', grantRem],
    ];
  },

  survivalQuestion: 'DOES YOUR CASH OUTLAST CERTIFICATION?',
  survivalNotes: [
    'Deep-tech has ZERO revenue until certification. If grant + cash runs out first, game over.',
    'Pessimistic certification = 50% longer than planned. Budget for it.',
  ],

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
  fileName: 'marketplace_financial_model.xlsx',

  assumptions: [
    { label: 'Take Rate (%)', key: 'takeRate', default: 10, guidance: 'Your cut of each transaction. 5-15% typical.' },
    { label: 'Avg Transaction Value (€)', key: 'avgTransaction', default: 300, guidance: 'Average value of a skill exchange. €100-€1000.' },
    { label: 'Supply CAC (€)', key: 'supplyCAC', default: 40, guidance: 'Cost to acquire one supply-side user.' },
    { label: 'Demand CAC (€)', key: 'demandCAC', default: 30, guidance: 'Cost to acquire one demand-side user.' },
    { label: 'Supply Monthly Churn (%)', key: 'supplyChurn', default: 12, guidance: 'Providers who leave per month.' },
    { label: 'Demand Monthly Churn (%)', key: 'demandChurn', default: 15, guidance: 'Seekers who leave per month.' },
    { label: 'Match Rate (%)', key: 'matchRate', default: 15, guidance: 'Of active users, what % get matched per month.' },
    { label: 'Starting Cash (€)', key: '_startingCash', default: 100000, guidance: 'Savings + grants in the bank.' },
    { label: 'Marketing Budget (€/mo)', key: '_mktBudget', default: 1200, guidance: 'Monthly spend on user acquisition.' },
  ],

  modelHeaders: [
    'Month', 'New Supply', 'New Demand', 'Supply',
    'Demand', 'Matches', 'Transactions',
    'GMV', 'Revenue', 'Liquidity %',
    'Total Burn', 'Cash', 'Runway',
    'Avg CAC', 'Take Rate %',
  ],

  columnWidths: [
    9, 11, 12, 10, 10, 10, 12,
    12, 11, 11, 12, 12, 10,
    10, 11,
  ],

  buildMonth0Row: (r) => ({
    1: { value: 0 },
    4: { value: 15 },
    5: { value: 8 },
    12: { formula: 'B8', result: 100000 },
  }),

  buildMonthRow: (r, p, m) => ({
    1: { value: m },
    // B2=takeRate, B3=avgTxn, B4=supplyCAC, B5=demandCAC, B6=supplyChurn, B7=demandChurn, B8=cash, B9=matchRate, B10=mktBudget
    2: { formula: `ROUND(B10*0.5/B4,0)`, result: 15 },
    3: { formula: `ROUND(B10*0.5/B5,0)`, result: 20 },
    4: { formula: `MAX(0,D${p}+B${r}-ROUND(D${p}*B6/100,0))`, result: 15 },
    5: { formula: `MAX(0,E${p}+C${r}-ROUND(E${p}*B7/100,0))`, result: 8 },
    6: { formula: `ROUND(MIN(D${r},E${r})*B9/100,0)`, result: 1 },
    7: { formula: `ROUND(F${r}*0.75,0)`, result: 1 },
    8: { formula: `G${r}*B3`, result: 300 },
    9: { formula: `ROUND(H${r}*B2/100,0)`, result: 30 },
    10: { formula: `IF(D${r}+E${r}>0,ROUND(G${r}*2/(D${r}+E${r})*100,0),0)`, result: 5 },
    11: { formula: `1200+B10+ROUND((D${r}+E${r})*0.5,0)+ROUND(G${r}*5,0)`, result: 2500 },
    12: { formula: `L${p}-K${r}+I${r}`, result: 97530 },
    13: { formula: `IF(K${r}-I${r}>0,ROUND(MAX(0,L${r})/(K${r}-I${r}),0),"∞")`, result: 40 },
    14: { formula: 'ROUND((B4+B5)/2,0)', result: 35 },
    15: { formula: 'B2', result: 10 },
  }),

  cashCol: 12,
  runwayCol: 13,

  instructions: [
    '1. Change the blue assumption cells to YOUR marketplace\'s numbers.',
    '2. Key question: When does Liquidity (column J) exceed 20%? That\'s the tipping point.',
    '3. Key question: Is your take rate sustainable? Too high = supply leaves.',
    '4. Key question: Which side churns faster? Fix that side first.',
    '5. Cold start is THE challenge. Both sides need to grow together.',
    '6. Check the "Scenarios" sheet for different liquidity trajectories.',
    '7. Marketplace PMF = consistent liquidity above 20% for 3+ months.',
  ],

  scenarioInputs: [
    { label: 'Take Rate (%)', key: 'takeRate', pess: 5, opt: 15, note: 'Lower = attractive to users, less revenue' },
    { label: 'Avg Transaction (€)', key: 'avgTransaction', pess: 200, opt: 500, note: 'Higher value = more revenue per match' },
    { label: 'Supply CAC (€)', key: 'supplyCAC', pess: 60, opt: 25, note: 'Supply is usually cheaper to acquire' },
    { label: 'Demand CAC (€)', key: 'demandCAC', pess: 50, opt: 20, note: 'Demand is where the money is — and the cost' },
    { label: 'Match Rate (%)', key: 'matchRate', pess: 8, opt: 25, note: 'The metric that makes or breaks marketplaces' },
  ],

  computeScenarioResult: (sc) => {
    let sup = 15, dem = 8, cash = 100000;
    const mkt = 1200;
    for (let m = 1; m <= 24; m++) {
      sup = Math.max(0, sup + Math.round(mkt * 0.5 / sc.supplyCAC) - Math.round(sup * (sc.supplyChurn ?? 12) / 100));
      dem = Math.max(0, dem + Math.round(mkt * 0.5 / sc.demandCAC) - Math.round(dem * (sc.demandChurn ?? 15) / 100));
      const mat = Math.round(Math.min(sup, dem) * sc.matchRate / 100);
      const txn = Math.round(mat * 0.75);
      const rev = Math.round(txn * sc.avgTransaction * sc.takeRate / 100);
      const burn = 1200 + mkt + (sup + dem) * 1.5 + txn * 5;
      cash = Math.round(cash - burn + rev);
    }
    const liq = (sup + dem) > 0 ? Math.round(Math.round(Math.min(sup, dem) * sc.matchRate / 100 * 0.75) * 2 / (sup + dem) * 100) : 0;
    return [
      ['M24 Liquidity', `${Math.min(100, liq)}%`],
      ['M24 Supply/Demand', `${sup}/${dem}`],
      ['M24 Revenue (€/mo)', Math.round(Math.min(sup, dem) * sc.matchRate / 100 * 0.75 * sc.avgTransaction * sc.takeRate / 100)],
      ['M24 Cash (€)', cash],
      ['Avg CAC', `€${Math.round((sc.supplyCAC + sc.demandCAC) / 2)}`],
    ];
  },

  survivalQuestion: 'CAN YOU SOLVE THE COLD START?',
  survivalNotes: [
    'Marketplaces die in the cold start. Without supply, demand leaves. Without demand, supply leaves.',
    'If liquidity stays below 15% for 6+ months, the death spiral is real.',
  ],

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
  fileName: 'service_financial_model.xlsx',

  assumptions: [
    { label: 'Avg Project Value (€)', key: 'avgProject', default: 5000, guidance: 'Average revenue per client engagement. €3K-€15K early.' },
    { label: 'Target Gross Margin (%)', key: 'targetMargin', default: 50, guidance: 'Revenue minus delivery costs. Below 40% = staffing business.' },
    { label: 'Sales Cycle (months)', key: 'salesCycle', default: 1.5, guidance: 'Time from first contact to signed contract.' },
    { label: 'Close Rate (%)', key: 'closeRate', default: 25, guidance: 'What % of pipeline converts to paying clients.' },
    { label: 'Repeat Rate (%)', key: 'repeatRate', default: 20, guidance: 'Clients who come back for more.' },
    { label: 'Team Capacity (hours/mo)', key: 'teamCapacity', default: 320, guidance: '2 founders × 160h. Each hire adds ~160h.' },
    { label: 'Starting Cash (€)', key: '_startingCash', default: 30000, guidance: 'Money in the bank today.' },
    { label: 'Monthly Base Cost (€)', key: '_baseCost', default: 6000, guidance: 'Salaries + office + tools.' },
  ],

  modelHeaders: [
    'Month', 'Pipeline', 'New Clients', 'Repeat',
    'Active Clients', 'Revenue',
    'Delivery €', 'Total Burn', 'Gross Margin %',
    'Cash', 'Runway',
    'Utilization %', 'Billable Hrs', 'Rev/Head',
  ],

  columnWidths: [
    9, 10, 11, 10, 12, 12,
    11, 12, 12, 12, 10,
    12, 11, 11,
  ],

  buildMonth0Row: (r) => ({
    1: { value: 0 },
    5: { value: 2 },
    6: { value: 8000 },
    10: { formula: 'B7', result: 30000 },
  }),

  buildMonthRow: (r, p, m) => ({
    1: { value: m },
    // B2=avgProject, B3=targetMargin, B4=salesCycle, B5=closeRate, B6=repeatRate, B7=cash, B8=baseCost, B9=teamCapacity
    2: { formula: `MAX(1,B${p}+ROUND(E${p}*0.15,0)-ROUND(B${p}*0.2,0))`, result: 5 },
    3: { formula: `ROUND(IF(B4<=1,B${r},ROUND(B${r}/B4,0))*B5/100,0)`, result: 1 },
    4: { formula: `ROUND(E${p}*B6/100,0)`, result: 0 },
    5: { formula: `MAX(0,E${p}+C${r}+D${r}-ROUND(E${p}*0.15,0))`, result: 2 },
    6: { formula: `E${r}*B2`, result: 10000 },
    7: { formula: `ROUND(E${r}*40*25,0)`, result: 2000 },
    8: { formula: `B8+G${r}+ROUND(B${r}*100,0)`, result: 8500 },
    9: { formula: `IF(F${r}>0,ROUND((F${r}-G${r})/F${r}*100,0),"–")`, result: 80 },
    10: { formula: `J${p}-H${r}+F${r}`, result: 31500 },
    11: { formula: `IF(H${r}-F${r}>0,ROUND(MAX(0,J${r})/(H${r}-F${r}),0),"∞")`, result: 99 },
    12: { formula: `IF(B9>0,ROUND(E${r}*40/B9*100,0),0)`, result: 25 },
    13: { formula: `E${r}*40`, result: 80 },
    14: { formula: `IF(E${r}>0,ROUND(F${r}/2,0),0)`, result: 5000 },
  }),

  cashCol: 10,
  runwayCol: 11,

  instructions: [
    '1. Change the blue assumption cells to YOUR consulting business\'s numbers.',
    '2. Key question: When does Utilization (column L) exceed 90%? That\'s the capacity wall.',
    '3. Key question: Is Gross Margin above 50%? Below that, you\'re a staffing business.',
    '4. Key question: What\'s your repeat rate? Below 20% means starting from zero each month.',
    '5. Services have revenue from month 1, but the trap is founder time = the bottleneck.',
    '6. Check the "Scenarios" sheet for different capacity and close rate paths.',
    '7. Utilization sweet spot: 70-85%. Above 90% = burnout. Below 50% = empty pipeline.',
  ],

  scenarioInputs: [
    { label: 'Avg Project (€)', key: 'avgProject', pess: 3000, opt: 8000, note: 'Higher value projects = fewer clients needed' },
    { label: 'Close Rate (%)', key: 'closeRate', pess: 15, opt: 35, note: 'Network-driven sales close better' },
    { label: 'Repeat Rate (%)', key: 'repeatRate', pess: 10, opt: 30, note: 'Repeat clients = predictable revenue' },
    { label: 'Sales Cycle (mo)', key: 'salesCycle', pess: 3, opt: 1, note: 'Long cycles kill cash flow' },
    { label: 'Team Capacity (hrs)', key: 'teamCapacity', pess: 280, opt: 400, note: 'More capacity = more clients, more cost' },
  ],

  computeScenarioResult: (sc) => {
    let clients = 2, pipeline = 5, cash = 30000;
    for (let m = 1; m <= 24; m++) {
      const effective = sc.salesCycle <= 1 ? pipeline : Math.round(pipeline / sc.salesCycle);
      const newC = Math.round(effective * sc.closeRate / 100);
      const repeatC = Math.round(clients * sc.repeatRate / 100);
      const churnC = Math.round(clients * 0.15);
      clients = Math.max(0, clients + newC + repeatC - churnC);
      pipeline = Math.max(1, pipeline + Math.round(clients * 0.15) - Math.round(pipeline * 0.2));
      const rev = clients * sc.avgProject;
      const hours = clients * 40;
      const delivery = hours * 25;
      const burn = 6000 + delivery + pipeline * 100;
      cash = Math.round(cash - burn + rev);
    }
    const util = sc.teamCapacity > 0 ? Math.round(clients * 40 / sc.teamCapacity * 100) : 0;
    const margin = clients * sc.avgProject > 0 ? Math.round((clients * sc.avgProject - clients * 40 * 25) / (clients * sc.avgProject) * 100) : 0;
    return [
      ['M24 Clients', clients],
      ['M24 Revenue (€/mo)', clients * sc.avgProject],
      ['M24 Cash (€)', cash],
      ['Utilization', `${util}%`],
      ['Gross Margin', `${Math.max(0, margin)}%`],
    ];
  },

  survivalQuestion: 'CAN YOU ESCAPE THE FOUNDER TRAP?',
  survivalNotes: [
    'Services generate revenue from day 1, but the founder IS the product.',
    'If utilization hits 100%, you can\'t grow. Hiring adds capacity but destroys margins until productive.',
  ],

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
