import ExcelJS from 'exceljs';

// Colors
const BLUE_INPUT = { argb: 'FF2D5DA1' }; // assumption inputs
const GREEN = { argb: 'FF3A8A5C' };
const RED = { argb: 'FFD64045' };
const GREY = { argb: 'FF9C9689' };
const DARK = { argb: 'FF1A1A1A' };
const LIGHT_BG = { argb: 'FFF5F0EB' };
const SURFACE_BG = { argb: 'FFEDEAE4' };
const LIGHT_BLUE_BG = { argb: 'FFDCE6F5' };
const LIGHT_GREEN_BG = { argb: 'FFDFF0E5' };
const LIGHT_RED_BG = { argb: 'FFF5DCDC' };

const HEADER_FONT = { bold: true, size: 11, color: DARK };
const TITLE_FONT = { bold: true, size: 14, color: DARK };
const MONO_FONT = { name: 'Consolas', size: 10 };
const INPUT_FONT = { bold: true, size: 11, color: BLUE_INPUT };
const MUTED_FONT = { size: 9, color: GREY, italic: true };

function applyHeaderRow(ws, row, colCount) {
  for (let c = 1; c <= colCount; c++) {
    const cell = ws.getCell(row, c);
    cell.font = { bold: true, size: 9, color: DARK };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: SURFACE_BG };
    cell.border = { bottom: { style: 'thin', color: GREY } };
  }
}

/**
 * Export: SaaS Financial Model Template + Game Data
 */
export async function exportToExcel(classConfig, history, decisions, forecast, assumptions) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'GRND';
  wb.created = new Date();

  const lastState = history[history.length - 1] ?? {};

  buildModelTemplate(wb, assumptions);
  buildScenarios(wb, assumptions);
  buildBenchmarks(wb);
  buildGameComparison(wb, classConfig, history, forecast, lastState);
  buildMRRWaterfall(wb, history);
  buildDecisionLog(wb, decisions);
  buildGlossary(wb);

  // Generate and download
  const buffer = await wb.xlsx.writeBuffer();
  if (typeof document !== 'undefined' && document.createElement) {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saas_financial_model.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  }
  return buffer;
}

// ═══════════════════════════════════════════════════════════
// Sheet 1: YOUR MODEL — Formula-driven template
// ═══════════════════════════════════════════════════════════
function buildModelTemplate(wb, assumptions) {
  const ws = wb.addWorksheet('Your Model', { views: [{ state: 'frozen', ySplit: 18, xSplit: 1 }] });

  // Column widths
  ws.columns = [
    { width: 9 }, { width: 13 }, { width: 12 }, { width: 12 },
    { width: 14 }, { width: 13 },
    { width: 12 }, { width: 13 }, { width: 13 }, { width: 12 },
    { width: 12 }, { width: 13 }, { width: 14 }, { width: 12 },
    { width: 12 }, { width: 11 },
    { width: 10 }, { width: 9 }, { width: 13 }, { width: 9 },
    { width: 11 }, { width: 11 }, { width: 12 },
  ];

  // Title
  ws.getCell('A1').value = 'SaaS FINANCIAL MODEL';
  ws.getCell('A1').font = TITLE_FONT;
  ws.getCell('A2').value = 'Change the blue cells below — the entire model recalculates automatically.';
  ws.getCell('A2').font = MUTED_FONT;
  ws.mergeCells('A2:F2');

  // Assumptions section
  ws.getCell('A4').value = 'YOUR ASSUMPTIONS';
  ws.getCell('A4').font = HEADER_FONT;
  ws.getCell('D4').value = 'GUIDANCE';
  ws.getCell('D4').font = { ...HEADER_FONT, color: GREY };

  const assRows = [
    ['Monthly Price (€)', assumptions.price ?? 49, 'What you charge per customer per month'],
    ['Monthly Churn (%)', assumptions.churnRate ?? 5, 'Customers lost per month. B2B SaaS: 3-8%'],
    ['CAC (€)', assumptions.targetCAC ?? 80, 'Cost to acquire one paying customer'],
    ['Conversion Rate (%)', assumptions.conversionRate ?? 15, 'Trial-to-paid. B2B: 10-25%'],
    ['Monthly New Trials', assumptions.pipelineGrowth ?? 20, 'People entering your funnel each month'],
    ['Support Cost (€/customer/mo)', assumptions.supportCost ?? 5, 'Direct cost per customer'],
    ['Starting Cash (€)', 100000, 'Money in the bank today'],
    ['Monthly Team Cost (€)', 4500, 'Salaries + office + tools (excl. per-customer)'],
    ['Pipeline Growth (%/mo)', 5, 'How fast your pipeline grows. 0 = flat.'],
  ];

  for (let i = 0; i < assRows.length; i++) {
    const r = 5 + i;
    ws.getCell(r, 1).value = assRows[i][0];
    ws.getCell(r, 1).font = { size: 10, color: DARK };
    ws.getCell(r, 2).value = assRows[i][1];
    ws.getCell(r, 2).font = INPUT_FONT;
    ws.getCell(r, 2).fill = { type: 'pattern', pattern: 'solid', fgColor: LIGHT_BLUE_BG };
    ws.getCell(r, 2).border = { bottom: { style: 'thin', color: BLUE_INPUT } };
    ws.getCell(r, 4).value = assRows[i][2];
    ws.getCell(r, 4).font = MUTED_FONT;
  }

  // Row references: B5=price, B6=churn%, B7=CAC, B8=conv%, B9=pipeline, B10=support, B11=cash, B12=teamburn, B13=pipegrowth

  // Projection header
  const hdrRow = 18;
  ws.getCell(16, 1).value = 'MONTHLY PROJECTION';
  ws.getCell(16, 1).font = HEADER_FONT;
  ws.getCell(17, 1).value = 'All cells below are formulas driven by your assumptions above.';
  ws.getCell(17, 1).font = MUTED_FONT;

  const headers = [
    'Month', 'New Trials', 'Conversions', 'New Cust.',
    'Churned Cust.', 'Total Cust.',
    'New MRR', 'Churned MRR', 'Net New MRR', 'Total MRR',
    'Revenue', 'Support €', 'Marketing €', 'Total Burn',
    'Cash', 'Runway',
    'LTV', 'LTV:CAC', 'CAC Payback', 'NRR %',
    'Quick Ratio', 'ARR', 'Gross Margin %',
  ];
  for (let c = 0; c < headers.length; c++) {
    ws.getCell(hdrRow, c + 1).value = headers[c];
  }
  applyHeaderRow(ws, hdrRow, headers.length);

  // Month 0 row (row 19) — initial state, no formulas
  const r0 = 19;
  ws.getCell(r0, 1).value = 0;
  ws.getCell(r0, 6).value = 0; // customers
  ws.getCell(r0, 10).value = 0; // MRR
  ws.getCell(r0, 15).value = { formula: 'B11', result: 100000 }; // cash = starting cash
  for (let c = 1; c <= headers.length; c++) ws.getCell(r0, c).font = MONO_FONT;

  // Months 1-24 with FORMULAS
  for (let m = 1; m <= 24; m++) {
    const r = 19 + m;
    const p = r - 1; // previous row

    ws.getCell(r, 1).value = m; // Month
    // B: New Trials = previous trials * (1 + pipeline growth) or base pipeline for M1
    ws.getCell(r, 2).value = m === 1
      ? { formula: 'B9', result: 20 }
      : { formula: `ROUND(B${p}*(1+B13/100),0)`, result: 20 };
    // C: Conversions = Trials * Conversion%
    ws.getCell(r, 3).value = { formula: `ROUND(B${r}*B8/100,0)`, result: 3 };
    // D: New Customers = Conversions
    ws.getCell(r, 4).value = { formula: `C${r}`, result: 3 };
    // E: Churned Customers = prev customers * churn%
    ws.getCell(r, 5).value = { formula: `ROUND(F${p}*B6/100,0)`, result: 0 };
    // F: Total Customers = prev + new - churned
    ws.getCell(r, 6).value = { formula: `MAX(0,F${p}+D${r}-E${r})`, result: 3 };
    // G: New MRR = new customers * price
    ws.getCell(r, 7).value = { formula: `D${r}*B5`, result: 147 };
    // H: Churned MRR = prev MRR * churn%
    ws.getCell(r, 8).value = { formula: `ROUND(J${p}*B6/100,0)`, result: 0 };
    // I: Net New MRR
    ws.getCell(r, 9).value = { formula: `G${r}-H${r}`, result: 147 };
    // J: Total MRR
    ws.getCell(r, 10).value = { formula: `MAX(0,J${p}+I${r})`, result: 147 };
    // K: Revenue = MRR
    ws.getCell(r, 11).value = { formula: `J${r}`, result: 147 };
    // L: Support costs
    ws.getCell(r, 12).value = { formula: `F${r}*B10`, result: 15 };
    // M: Marketing spend = conversions * CAC
    ws.getCell(r, 13).value = { formula: `C${r}*B7`, result: 240 };
    // N: Total Burn = team + support + marketing
    ws.getCell(r, 14).value = { formula: `B12+L${r}+M${r}`, result: 4755 };
    // O: Cash = prev cash - burn + revenue
    ws.getCell(r, 15).value = { formula: `O${p}-N${r}+K${r}`, result: 95392 };
    // P: Runway
    ws.getCell(r, 16).value = { formula: `IF(N${r}-K${r}>0,ROUND(MAX(0,O${r})/(N${r}-K${r}),0),"∞")`, result: 20 };
    // Q: LTV = price / (churn%/100)
    ws.getCell(r, 17).value = { formula: 'IF(B6>0,ROUND(B5/(B6/100),0),"∞")', result: 980 };
    // R: LTV:CAC
    ws.getCell(r, 18).value = { formula: 'IF(B7>0,ROUND(Q' + r + '/B7*10,0)/10,"∞")', result: 12.3 };
    // S: CAC Payback (months)
    ws.getCell(r, 19).value = { formula: 'IF(B5>0,ROUND(B7/B5*10,0)/10,"∞")', result: 1.6 };
    // T: NRR %
    ws.getCell(r, 20).value = { formula: `IF(J${p}>0,ROUND((J${p}-H${r})/J${p}*100,1),"–")`, result: 95 };
    // U: Quick Ratio
    ws.getCell(r, 21).value = { formula: `IF(H${r}>0,ROUND(G${r}/H${r}*10,0)/10,"∞")`, result: 99 };
    // V: ARR
    ws.getCell(r, 22).value = { formula: `J${r}*12`, result: 1764 };
    // W: Gross Margin %
    ws.getCell(r, 23).value = { formula: `IF(K${r}>0,ROUND((K${r}-L${r})/K${r}*100,0),"–")`, result: 90 };

    // Apply mono font to all data cells
    for (let c = 1; c <= headers.length; c++) ws.getCell(r, c).font = MONO_FONT;

    // Conditional formatting: highlight cash < 0 in red
    ws.getCell(r, 15).font = { ...MONO_FONT, color: DARK };
  }

  // Add conditional formatting for cash column
  ws.addConditionalFormatting({
    ref: 'O19:O43',
    rules: [{ type: 'cellIs', operator: 'lessThan', priority: 1, formulae: [0], style: { font: { color: RED }, fill: { type: 'pattern', pattern: 'solid', bgColor: LIGHT_RED_BG } } }],
  });
  // Runway < 4
  ws.addConditionalFormatting({
    ref: 'P19:P43',
    rules: [{ type: 'cellIs', operator: 'lessThan', priority: 1, formulae: [4], style: { font: { color: RED }, fill: { type: 'pattern', pattern: 'solid', bgColor: LIGHT_RED_BG } } }],
  });

  // Instructions at bottom
  const instrRow = 45;
  ws.getCell(instrRow, 1).value = 'HOW TO USE';
  ws.getCell(instrRow, 1).font = HEADER_FONT;
  const instructions = [
    '1. Change the blue assumption cells (B5-B13) to YOUR startup\'s real numbers.',
    '2. The entire 24-month projection recalculates automatically.',
    '3. Key question: Which month does Cash (column O) go negative? That\'s your real runway.',
    '4. Key question: Is LTV:CAC (column R) above 3x? Below that, you lose money per customer.',
    '5. Key question: When does Revenue (K) exceed Total Burn (N)? That\'s breakeven.',
    '6. Check the "Scenarios" sheet to stress-test pessimistic/optimistic assumptions.',
    '7. Check the "Benchmarks" sheet to verify your numbers are realistic.',
    '8. To add charts: select a data range → Insert → Chart. Recommended: MRR over time, Cash over time.',
  ];
  for (let i = 0; i < instructions.length; i++) {
    ws.getCell(instrRow + 1 + i, 1).value = instructions[i];
    ws.getCell(instrRow + 1 + i, 1).font = { size: 10, color: GREY };
  }
}

// ═══════════════════════════════════════════════════════════
// Sheet 2: SCENARIOS
// ═══════════════════════════════════════════════════════════
function buildScenarios(wb, assumptions) {
  const ws = wb.addWorksheet('Scenarios');
  ws.columns = [{ width: 20 }, { width: 4 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 4 }, { width: 50 }];

  ws.getCell('A1').value = 'SCENARIO COMPARISON';
  ws.getCell('A1').font = TITLE_FONT;
  ws.getCell('A2').value = 'Three projections. Reality usually lands between pessimistic and neutral.';
  ws.getCell('A2').font = MUTED_FONT;

  const assRow = 4;
  ws.getCell(assRow, 1).value = 'ASSUMPTIONS';
  ws.getCell(assRow, 1).font = HEADER_FONT;
  ['', '', 'Pessimistic', 'Neutral', 'Optimistic', '', 'WHAT THIS MEANS'].forEach((v, i) => {
    ws.getCell(assRow, i + 1).value = v;
    ws.getCell(assRow, i + 1).font = { bold: true, size: 9, color: DARK };
  });

  const scenarioInputs = [
    ['Price/mo (€)', 29, assumptions.price ?? 49, 79, 'Higher price = fewer but more committed customers'],
    ['Monthly Churn (%)', 12, assumptions.churnRate ?? 7, 4, 'Churn compounds. 12% monthly = 79% annual.'],
    ['CAC (€)', 150, assumptions.targetCAC ?? 100, 60, 'First-time founders underestimate CAC by ~50%'],
    ['Conversion (%)', 8, assumptions.conversionRate ?? 12, 20, 'B2B trial conversion: 10-25% is typical'],
    ['Pipeline/mo', 10, assumptions.pipelineGrowth ?? 20, 35, 'Without active sales, pipeline decays'],
  ];

  for (let i = 0; i < scenarioInputs.length; i++) {
    const r = assRow + 1 + i;
    const [label, pess, neut, opt, note] = scenarioInputs[i];
    ws.getCell(r, 1).value = label;
    ws.getCell(r, 3).value = pess;
    ws.getCell(r, 3).fill = { type: 'pattern', pattern: 'solid', fgColor: LIGHT_RED_BG };
    ws.getCell(r, 4).value = neut;
    ws.getCell(r, 4).fill = { type: 'pattern', pattern: 'solid', fgColor: LIGHT_BLUE_BG };
    ws.getCell(r, 5).value = opt;
    ws.getCell(r, 5).fill = { type: 'pattern', pattern: 'solid', fgColor: LIGHT_GREEN_BG };
    ws.getCell(r, 7).value = note;
    ws.getCell(r, 7).font = MUTED_FONT;
    for (let c = 3; c <= 5; c++) ws.getCell(r, c).font = MONO_FONT;
  }

  // Compute 12-month results for each scenario
  const scenarios = [
    { price: 29, churn: 12, cac: 150, conv: 8, pipe: 10 },
    { price: assumptions.price ?? 49, churn: assumptions.churnRate ?? 7, cac: assumptions.targetCAC ?? 100, conv: assumptions.conversionRate ?? 12, pipe: assumptions.pipelineGrowth ?? 20 },
    { price: 79, churn: 4, cac: 60, conv: 20, pipe: 35 },
  ];

  const results = scenarios.map(sc => {
    let mrr = 0, cust = 0, cash = 100000, prevMRR = 0;
    const cr = sc.churn / 100, cvr = sc.conv / 100;
    for (let m = 1; m <= 12; m++) {
      const conv = Math.round(sc.pipe * cvr);
      const churned = Math.round(cust * cr);
      cust = Math.max(0, cust + conv - churned);
      const newMRR = conv * sc.price;
      const churnedMRR = Math.round(prevMRR * cr);
      mrr = Math.max(0, prevMRR + newMRR - churnedMRR);
      cash = cash - (4500 + cust * 5 + Math.round(conv * sc.cac)) + mrr;
      prevMRR = mrr;
    }
    const ltv = cr > 0 ? Math.round(sc.price / cr) : 0;
    return { mrr, cust, cash: Math.round(cash), ltv, ltvCac: sc.cac > 0 ? Math.round(ltv / sc.cac * 10) / 10 : 0 };
  });

  const resRow = assRow + scenarioInputs.length + 2;
  ws.getCell(resRow, 1).value = '24-MONTH RESULTS';
  ws.getCell(resRow, 1).font = HEADER_FONT;
  ['', '', 'Pessimistic', 'Neutral', 'Optimistic'].forEach((v, i) => {
    ws.getCell(resRow, i + 1).value = v;
    ws.getCell(resRow, i + 1).font = { bold: true, size: 9 };
  });

  const resMetrics = [
    ['M24 MRR (€)', ...results.map(r => r.mrr)],
    ['M24 Customers', ...results.map(r => r.cust)],
    ['M24 Cash (€)', ...results.map(r => r.cash)],
    ['LTV (€)', ...results.map(r => r.ltv)],
    ['LTV:CAC', ...results.map(r => `${r.ltvCac}x`)],
  ];
  for (let i = 0; i < resMetrics.length; i++) {
    const r = resRow + 1 + i;
    ws.getCell(r, 1).value = resMetrics[i][0];
    for (let c = 0; c < 3; c++) {
      ws.getCell(r, c + 3).value = resMetrics[i][c + 1];
      ws.getCell(r, c + 3).font = { ...MONO_FONT, bold: true };
    }
  }

  // Cash warning
  const warnRow = resRow + resMetrics.length + 2;
  ws.getCell(warnRow, 1).value = 'CAN YOU SURVIVE THE PESSIMISTIC CASE?';
  ws.getCell(warnRow, 1).font = { bold: true, color: RED, size: 11 };
  ws.getCell(warnRow + 1, 1).value = 'If pessimistic cash < 0 before month 12, your margin for error is too thin.';
  ws.getCell(warnRow + 1, 1).font = MUTED_FONT;
  ws.getCell(warnRow + 2, 1).value = 'Investors will ask: "What if growth is 50% slower?" This sheet answers that.';
  ws.getCell(warnRow + 2, 1).font = MUTED_FONT;
}

// ═══════════════════════════════════════════════════════════
// Sheet 3: BENCHMARKS
// ═══════════════════════════════════════════════════════════
function buildBenchmarks(wb) {
  const ws = wb.addWorksheet('Benchmarks');
  ws.columns = [{ width: 22 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 55 }];

  ws.getCell('A1').value = 'SaaS BENCHMARKS — What Good Looks Like';
  ws.getCell('A1').font = TITLE_FONT;
  ws.getCell('A2').value = 'Sources: OpenView, Bessemer, SaaS CFO, PitchBook 2025. Use to reality-check your model.';
  ws.getCell('A2').font = MUTED_FONT;

  const hdr = ['METRIC', 'GOOD', 'ACCEPTABLE', 'CONCERNING', 'YOUR VALUE →', 'NOTES'];
  hdr.forEach((v, i) => ws.getCell(4, i + 1).value = v);
  applyHeaderRow(ws, 4, 6);

  const benchmarks = [
    ['Monthly Churn', '< 3%', '3-5%', '> 5%', '', 'SMB churn is higher. Enterprise < 1%. 5% monthly = 46% annual.'],
    ['LTV:CAC Ratio', '> 3:1', '2-3:1', '< 2:1', '', 'Below 1:1 = losing money on every customer.'],
    ['CAC Payback', '< 6 months', '6-12 months', '> 12 months', '', 'Median B2B SaaS payback is 15 months (2025).'],
    ['Net Revenue Retention', '> 110%', '95-110%', '< 95%', '', 'NRR > 100% = grow even without new customers.'],
    ['Gross Margin', '> 75%', '65-75%', '< 65%', '', 'SaaS should be 70-85%. Below 65% is services.'],
    ['Quick Ratio', '> 4', '2-4', '< 2', '', '(New + Expansion) / (Churn + Contraction).'],
    ['Monthly MRR Growth', '> 15%', '8-15%', '< 8%', '', 'Seed stage. Growth rate peaks early.'],
    ['Burn Multiple', '< 1.5x', '1.5-2.5x', '> 2.5x', '', 'Net Burn / Net New ARR.'],
  ];

  for (let i = 0; i < benchmarks.length; i++) {
    const r = 5 + i;
    ws.getCell(r, 1).value = benchmarks[i][0];
    ws.getCell(r, 1).font = { bold: true, size: 10 };
    ws.getCell(r, 2).value = benchmarks[i][1];
    ws.getCell(r, 2).font = { ...MONO_FONT, color: GREEN };
    ws.getCell(r, 3).value = benchmarks[i][2];
    ws.getCell(r, 3).font = { ...MONO_FONT, color: { argb: 'FFE8A838' } };
    ws.getCell(r, 4).value = benchmarks[i][3];
    ws.getCell(r, 4).font = { ...MONO_FONT, color: RED };
    ws.getCell(r, 5).value = benchmarks[i][4];
    ws.getCell(r, 5).fill = { type: 'pattern', pattern: 'solid', fgColor: LIGHT_BLUE_BG };
    ws.getCell(r, 5).font = INPUT_FONT;
    ws.getCell(r, 6).value = benchmarks[i][5];
    ws.getCell(r, 6).font = MUTED_FONT;
  }

  // Common mistakes section
  const mRow = 5 + benchmarks.length + 2;
  ws.getCell(mRow, 1).value = 'COMMON FOUNDER MISTAKES';
  ws.getCell(mRow, 1).font = HEADER_FONT;
  ['Mistake', 'Why It Happens', 'What Actually Happens', 'How to Avoid'].forEach((v, i) => ws.getCell(mRow + 1, i + 1).value = v);
  applyHeaderRow(ws, mRow + 1, 4);

  const mistakes = [
    ['Underestimating CAC', 'First customers came from network', 'Paid channels cost 3-5x what you assumed', 'Track actual CAC from month 1'],
    ['Ignoring churn', '"Our product is great"', '5% monthly = 46% annual', 'Measure weekly. Call every churned customer.'],
    ['Hiring before PMF', '"We need to move faster"', 'Burn doubles, velocity doesn\'t', 'Don\'t hire until you can\'t NOT hire'],
    ['Optimistic forecasts', 'Founders are optimists', 'Investors discount by 50% anyway', 'Build pessimistic case first'],
    ['No unit economics', '"We\'ll figure out pricing later"', 'Free users don\'t convert', 'Price from day 1. Track LTV:CAC monthly.'],
    ['Raising too little', '"We\'ll be efficient"', 'You\'re fundraising again immediately', 'Raise for 18-24 months runway'],
  ];
  for (let i = 0; i < mistakes.length; i++) {
    const r = mRow + 2 + i;
    for (let c = 0; c < 4; c++) {
      ws.getCell(r, c + 1).value = mistakes[i][c];
      ws.getCell(r, c + 1).font = c === 0 ? { bold: true, size: 10 } : { size: 10 };
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Sheet 4: GAME — Forecast vs Actual
// ═══════════════════════════════════════════════════════════
function buildGameComparison(wb, classConfig, history, forecast, lastState) {
  const ws = wb.addWorksheet('Game — Plan vs Reality', { views: [{ state: 'frozen', ySplit: 5, xSplit: 1 }] });

  const resultLabel = lastState.acquired ? 'Acquired' : lastState.pmf >= 85 ? 'PMF Achieved' : lastState.cash <= 0 ? 'Game Over' : 'Survived';
  ws.getCell('A1').value = `GAME RESULTS — ${classConfig.name}`;
  ws.getCell('A1').font = TITLE_FONT;
  ws.getCell('A2').value = `${resultLabel} | Month ${lastState.month ?? 0}`;
  ws.getCell('A2').font = MUTED_FONT;
  ws.getCell('A3').value = 'Where did your assumptions break? Look at the Δ% columns.';
  ws.getCell('A3').font = MUTED_FONT;

  const headers = ['Month', 'MRR Plan', 'MRR Actual', 'MRR Δ%', 'Cust Plan', 'Cust Actual', 'Churn Plan', 'Churn Actual', 'Cash Plan', 'Cash Actual', 'Cash Δ%', 'PMF'];
  headers.forEach((v, i) => ws.getCell(5, i + 1).value = v);
  applyHeaderRow(ws, 5, headers.length);
  ws.columns = [{ width: 7 }, { width: 11 }, { width: 11 }, { width: 9 }, { width: 10 }, { width: 11 }, { width: 10 }, { width: 11 }, { width: 11 }, { width: 11 }, { width: 9 }, { width: 7 }];

  const maxMonth = Math.min(history.length - 1, forecast.length - 1);
  for (let m = 0; m <= maxMonth; m++) {
    const r = 6 + m;
    const f = forecast[m] ?? {};
    const a = history[m] ?? {};
    const mrrD = f.totalMRR > 0 ? Math.round(((a.totalMRR ?? 0) - f.totalMRR) / f.totalMRR * 100) : 0;
    const cashD = f.cash > 0 ? Math.round(((a.cash ?? 0) - f.cash) / f.cash * 100) : 0;
    const vals = [
      `M${m}`, f.totalMRR ?? 0, a.totalMRR ?? 0, `${mrrD}%`,
      f.customers ?? 0, a.customers ?? 0,
      f.churn != null ? `${f.churn.toFixed(1)}%` : '', a.churn != null ? `${a.churn.toFixed(1)}%` : '',
      f.cash ?? 0, a.cash ?? 0, `${cashD}%`, a.pmf ?? 0,
    ];
    vals.forEach((v, i) => {
      ws.getCell(r, i + 1).value = v;
      ws.getCell(r, i + 1).font = MONO_FONT;
    });
  }
}

// ═══════════════════════════════════════════════════════════
// Sheet 5: GAME — MRR Waterfall
// ═══════════════════════════════════════════════════════════
function buildMRRWaterfall(wb, history) {
  const ws = wb.addWorksheet('Game — MRR Waterfall', { views: [{ state: 'frozen', ySplit: 4, xSplit: 1 }] });

  ws.getCell('A1').value = 'MRR WATERFALL — Game Data';
  ws.getCell('A1').font = TITLE_FONT;
  ws.getCell('A2').value = 'The view investors want. How your revenue moved each month.';
  ws.getCell('A2').font = MUTED_FONT;

  const headers = ['Month', 'Begin MRR', '(+) New', '(-) Churned', 'Net New', 'End MRR', 'Customers', 'MoM %', 'NRR %', 'Quick Ratio', 'ARR'];
  headers.forEach((v, i) => ws.getCell(4, i + 1).value = v);
  applyHeaderRow(ws, 4, headers.length);
  ws.columns = [{ width: 7 }, { width: 12 }, { width: 10 }, { width: 12 }, { width: 10 }, { width: 11 }, { width: 11 }, { width: 9 }, { width: 9 }, { width: 11 }, { width: 11 }];

  for (let i = 1; i < history.length; i++) {
    const r = 4 + i;
    const s = history[i];
    const prev = history[i - 1];
    const beginMRR = prev.totalMRR ?? 0;
    const newMRR = s.newMRR ?? 0;
    const churnedMRR = s.churnedMRR ?? 0;
    const endMRR = s.totalMRR ?? 0;
    const mom = beginMRR > 0 ? Math.round((newMRR - churnedMRR) / beginMRR * 1000) / 10 : 0;
    const nrr = beginMRR > 0 ? Math.round((beginMRR - churnedMRR) / beginMRR * 1000) / 10 : 100;
    const qr = churnedMRR > 0 ? Math.round(newMRR / churnedMRR * 10) / 10 : 99;

    const vals = [`M${s.month}`, beginMRR, newMRR, churnedMRR, newMRR - churnedMRR, endMRR, s.customers ?? 0, `${mom}%`, `${nrr}%`, qr, endMRR * 12];
    vals.forEach((v, c) => { ws.getCell(r, c + 1).value = v; ws.getCell(r, c + 1).font = MONO_FONT; });
  }

  const noteRow = 4 + history.length + 1;
  const notes = [
    'New MRR = new customers × price. Your acquisition engine.',
    'Churned MRR = lost customers × price. The leak.',
    'NRR > 100% = you grow even without new sales.',
    'Quick Ratio > 4 = healthy. < 2 = leaky bucket.',
  ];
  notes.forEach((n, i) => { ws.getCell(noteRow + i, 1).value = n; ws.getCell(noteRow + i, 1).font = MUTED_FONT; });
}

// ═══════════════════════════════════════════════════════════
// Sheet 6: Decision Log
// ═══════════════════════════════════════════════════════════
function buildDecisionLog(wb, decisions) {
  const ws = wb.addWorksheet('Game — Decisions', { views: [{ state: 'frozen', ySplit: 4 }] });
  ws.columns = [{ width: 7 }, { width: 13 }, { width: 24 }, { width: 38 }, { width: 60 }];

  ws.getCell('A1').value = 'DECISION LOG';
  ws.getCell('A1').font = TITLE_FONT;
  ws.getCell('A2').value = 'Every event and how you responded.';
  ws.getCell('A2').font = MUTED_FONT;

  ['Month', 'Type', 'Event', 'Your Decision', 'What Happened'].forEach((v, i) => ws.getCell(4, i + 1).value = v);
  applyHeaderRow(ws, 4, 5);

  decisions.forEach((d, i) => {
    const r = 5 + i;
    const vals = [`M${d.month}`, d.isWorld ? 'Market Event' : d.wasDefault ? 'SKIPPED' : 'Decision', d.event, d.choice, d.feedback];
    vals.forEach((v, c) => {
      ws.getCell(r, c + 1).value = v;
      ws.getCell(r, c + 1).font = c === 1 && d.wasDefault ? { ...MONO_FONT, color: RED } : MONO_FONT;
    });
  });
}

// ═══════════════════════════════════════════════════════════
// Sheet 7: Glossary
// ═══════════════════════════════════════════════════════════
function buildGlossary(wb) {
  const ws = wb.addWorksheet('Glossary');
  ws.columns = [{ width: 22 }, { width: 48 }, { width: 50 }, { width: 32 }];

  ws.getCell('A1').value = 'SaaS GLOSSARY — Key Metrics & Formulas';
  ws.getCell('A1').font = TITLE_FONT;

  ['Metric', 'Formula', 'What It Tells You', 'Healthy Range'].forEach((v, i) => ws.getCell(3, i + 1).value = v);
  applyHeaderRow(ws, 3, 4);

  const terms = [
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
  ];

  terms.forEach((t, i) => {
    const r = 4 + i;
    t.forEach((v, c) => {
      ws.getCell(r, c + 1).value = v;
      ws.getCell(r, c + 1).font = c === 0 ? { bold: true, size: 10 } : { size: 10 };
    });
  });

  const refRow = 4 + terms.length + 2;
  ws.getCell(refRow, 1).value = 'FURTHER READING';
  ws.getCell(refRow, 1).font = HEADER_FONT;
  const links = [
    ['SaaS Metrics 2.0 — David Skok', 'https://www.forentrepreneurs.com/saas-metrics-2/'],
    ['SaaS Financial Plan — Christoph Janz', 'https://christophjanz.blogspot.com/2016/03/saas-financial-plan-20.html'],
    ['SaaS Metrics Cheat Sheet — The SaaS CFO', 'https://www.thesaascfo.com/saas-metrics/'],
    ['Startup Key Metrics — Tomasz Tunguz', 'https://www.tomtunguz.com/saas-startup-metrics-template/'],
  ];
  links.forEach((l, i) => {
    ws.getCell(refRow + 1 + i, 1).value = l[0];
    ws.getCell(refRow + 1 + i, 2).value = { text: l[1], hyperlink: l[1] };
    ws.getCell(refRow + 1 + i, 2).font = { color: BLUE_INPUT, underline: true, size: 10 };
  });
}
