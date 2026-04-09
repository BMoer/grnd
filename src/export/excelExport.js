import ExcelJS from 'exceljs';
import { getExportConfig } from './classExportConfigs.js';

// Colors
const BLUE_INPUT = { argb: 'FF2D5DA1' };
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
 * Export: Class-specific Financial Model Template + Game Data.
 * Reads config from classExportConfigs.js based on classConfig.id.
 */
export async function exportToExcel(classConfig, history, decisions, forecast, assumptions) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'GRND';
  wb.created = new Date();

  const ec = getExportConfig(classConfig.id);
  const lastState = history[history.length - 1] ?? {};

  buildModelTemplate(wb, assumptions, ec);
  buildScenarios(wb, assumptions, ec);
  buildBenchmarks(wb, ec);
  buildGameComparison(wb, classConfig, history, forecast, lastState, ec);
  buildRevenueWaterfall(wb, history, ec);
  buildDecisionLog(wb, decisions);
  buildGlossary(wb, ec);

  const buffer = await wb.xlsx.writeBuffer();
  if (typeof document !== 'undefined' && document.createElement) {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = ec.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
  return buffer;
}

// ═══════════════════════════════════════════════════════════
// Sheet 1: YOUR MODEL — Formula-driven template
// ═══════════════════════════════════════════════════════════
function buildModelTemplate(wb, assumptions, ec) {
  const ws = wb.addWorksheet('Your Model', { views: [{ state: 'frozen', ySplit: 0, xSplit: 1 }] });

  ws.columns = ec.columnWidths.map(w => ({ width: w }));

  // Title
  ws.getCell('A1').value = ec.title;
  ws.getCell('A1').font = TITLE_FONT;
  ws.getCell('A2').value = 'Change the blue cells below — the entire model recalculates automatically.';
  ws.getCell('A2').font = MUTED_FONT;
  ws.mergeCells('A2:F2');

  // Assumptions section
  ws.getCell('A4').value = 'YOUR ASSUMPTIONS';
  ws.getCell('A4').font = HEADER_FONT;
  ws.getCell('D4').value = 'GUIDANCE';
  ws.getCell('D4').font = { ...HEADER_FONT, color: GREY };

  const assRows = ec.assumptions;
  for (let i = 0; i < assRows.length; i++) {
    const r = 5 + i;
    const ass = assRows[i];
    const val = ass.key.startsWith('_') ? ass.default : (assumptions[ass.key] ?? ass.default);
    ws.getCell(r, 1).value = ass.label;
    ws.getCell(r, 1).font = { size: 10, color: DARK };
    ws.getCell(r, 2).value = val;
    ws.getCell(r, 2).font = INPUT_FONT;
    ws.getCell(r, 2).fill = { type: 'pattern', pattern: 'solid', fgColor: LIGHT_BLUE_BG };
    ws.getCell(r, 2).border = { bottom: { style: 'thin', color: BLUE_INPUT } };
    ws.getCell(r, 4).value = ass.guidance;
    ws.getCell(r, 4).font = MUTED_FONT;
  }

  // Projection header
  const gapRow = 5 + assRows.length + 1;
  const hdrRow = gapRow + 2;
  ws.getCell(gapRow, 1).value = 'MONTHLY PROJECTION';
  ws.getCell(gapRow, 1).font = HEADER_FONT;
  ws.getCell(gapRow + 1, 1).value = 'All cells below are formulas driven by your assumptions above.';
  ws.getCell(gapRow + 1, 1).font = MUTED_FONT;

  const headers = ec.modelHeaders;
  for (let c = 0; c < headers.length; c++) {
    ws.getCell(hdrRow, c + 1).value = headers[c];
  }
  applyHeaderRow(ws, hdrRow, headers.length);

  // Freeze at header row
  ws.views = [{ state: 'frozen', ySplit: hdrRow, xSplit: 1 }];

  // Month 0
  const r0 = hdrRow + 1;
  const m0Data = ec.buildMonth0Row(r0);
  for (const [col, cellData] of Object.entries(m0Data)) {
    const c = Number(col);
    if (cellData.formula) {
      ws.getCell(r0, c).value = { formula: cellData.formula, result: cellData.result };
    } else {
      ws.getCell(r0, c).value = cellData.value;
    }
  }
  for (let c = 1; c <= headers.length; c++) ws.getCell(r0, c).font = MONO_FONT;

  // Months 1-24
  for (let m = 1; m <= 24; m++) {
    const r = r0 + m;
    const p = r - 1;
    const rowData = ec.buildMonthRow(r, p, m);

    for (const [col, cellData] of Object.entries(rowData)) {
      const c = Number(col);
      if (cellData.formula) {
        ws.getCell(r, c).value = { formula: cellData.formula, result: cellData.result };
      } else {
        ws.getCell(r, c).value = cellData.value;
      }
    }

    for (let c = 1; c <= headers.length; c++) ws.getCell(r, c).font = MONO_FONT;
    if (ec.cashCol) ws.getCell(r, ec.cashCol).font = { ...MONO_FONT, color: DARK };
  }

  // Conditional formatting for cash column
  if (ec.cashCol) {
    const cashColLetter = colLetter(ec.cashCol);
    ws.addConditionalFormatting({
      ref: `${cashColLetter}${r0}:${cashColLetter}${r0 + 24}`,
      rules: [{ type: 'cellIs', operator: 'lessThan', priority: 1, formulae: [0], style: { font: { color: RED }, fill: { type: 'pattern', pattern: 'solid', bgColor: LIGHT_RED_BG } } }],
    });
  }
  if (ec.runwayCol) {
    const runColLetter = colLetter(ec.runwayCol);
    ws.addConditionalFormatting({
      ref: `${runColLetter}${r0}:${runColLetter}${r0 + 24}`,
      rules: [{ type: 'cellIs', operator: 'lessThan', priority: 1, formulae: [4], style: { font: { color: RED }, fill: { type: 'pattern', pattern: 'solid', bgColor: LIGHT_RED_BG } } }],
    });
  }

  // Instructions
  const instrRow = r0 + 26;
  ws.getCell(instrRow, 1).value = 'HOW TO USE';
  ws.getCell(instrRow, 1).font = HEADER_FONT;
  const instructions = ec.instructions;
  for (let i = 0; i < instructions.length; i++) {
    ws.getCell(instrRow + 1 + i, 1).value = instructions[i];
    ws.getCell(instrRow + 1 + i, 1).font = { size: 10, color: GREY };
  }
}

// ═══════════════════════════════════════════════════════════
// Sheet 2: SCENARIOS
// ═══════════════════════════════════════════════════════════
function buildScenarios(wb, assumptions, ec) {
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

  const inputs = ec.scenarioInputs;
  for (let i = 0; i < inputs.length; i++) {
    const r = assRow + 1 + i;
    const inp = inputs[i];
    const neutral = assumptions[inp.key] ?? inp.pess;
    ws.getCell(r, 1).value = inp.label;
    ws.getCell(r, 3).value = inp.pess;
    ws.getCell(r, 3).fill = { type: 'pattern', pattern: 'solid', fgColor: LIGHT_RED_BG };
    ws.getCell(r, 4).value = neutral;
    ws.getCell(r, 4).fill = { type: 'pattern', pattern: 'solid', fgColor: LIGHT_BLUE_BG };
    ws.getCell(r, 5).value = inp.opt;
    ws.getCell(r, 5).fill = { type: 'pattern', pattern: 'solid', fgColor: LIGHT_GREEN_BG };
    ws.getCell(r, 7).value = inp.note;
    ws.getCell(r, 7).font = MUTED_FONT;
    for (let c = 3; c <= 5; c++) ws.getCell(r, c).font = MONO_FONT;
  }

  // Build scenario parameter objects
  const buildParams = (overrides) => {
    const base = {};
    for (const inp of inputs) {
      base[inp.key] = assumptions[inp.key] ?? inp.pess;
    }
    // Include non-scenario assumptions for computation
    for (const [k, v] of Object.entries(assumptions)) {
      if (!(k in base)) base[k] = v;
    }
    return { ...base, ...overrides };
  };

  const pessParams = buildParams(Object.fromEntries(inputs.map(i => [i.key, i.pess])));
  const neutParams = buildParams({});
  const optParams = buildParams(Object.fromEntries(inputs.map(i => [i.key, i.opt])));

  const results = [pessParams, neutParams, optParams].map(sc => ec.computeScenarioResult(sc));

  const resRow = assRow + inputs.length + 2;
  ws.getCell(resRow, 1).value = '24-MONTH RESULTS';
  ws.getCell(resRow, 1).font = HEADER_FONT;
  ['', '', 'Pessimistic', 'Neutral', 'Optimistic'].forEach((v, i) => {
    ws.getCell(resRow, i + 1).value = v;
    ws.getCell(resRow, i + 1).font = { bold: true, size: 9 };
  });

  // Each result is an array of [label, value] pairs
  const metricCount = results[0].length;
  for (let i = 0; i < metricCount; i++) {
    const r = resRow + 1 + i;
    ws.getCell(r, 1).value = results[0][i][0]; // label from first scenario
    for (let c = 0; c < 3; c++) {
      ws.getCell(r, c + 3).value = results[c][i][1];
      ws.getCell(r, c + 3).font = { ...MONO_FONT, bold: true };
    }
  }

  // Survival question
  const warnRow = resRow + metricCount + 2;
  ws.getCell(warnRow, 1).value = ec.survivalQuestion;
  ws.getCell(warnRow, 1).font = { bold: true, color: RED, size: 11 };
  const notes = ec.survivalNotes;
  for (let i = 0; i < notes.length; i++) {
    ws.getCell(warnRow + 1 + i, 1).value = notes[i];
    ws.getCell(warnRow + 1 + i, 1).font = MUTED_FONT;
  }
}

// ═══════════════════════════════════════════════════════════
// Sheet 3: BENCHMARKS
// ═══════════════════════════════════════════════════════════
function buildBenchmarks(wb, ec) {
  const ws = wb.addWorksheet('Benchmarks');
  ws.columns = [{ width: 22 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 55 }];

  ws.getCell('A1').value = `${ec.title.split(' ')[0]} BENCHMARKS — What Good Looks Like`;
  ws.getCell('A1').font = TITLE_FONT;
  ws.getCell('A2').value = 'Use these benchmarks to reality-check your model.';
  ws.getCell('A2').font = MUTED_FONT;

  const hdr = ['METRIC', 'GOOD', 'ACCEPTABLE', 'CONCERNING', 'YOUR VALUE →', 'NOTES'];
  hdr.forEach((v, i) => ws.getCell(4, i + 1).value = v);
  applyHeaderRow(ws, 4, 6);

  const benchmarks = ec.benchmarks;
  for (let i = 0; i < benchmarks.length; i++) {
    const r = 5 + i;
    const b = benchmarks[i];
    ws.getCell(r, 1).value = b.metric;
    ws.getCell(r, 1).font = { bold: true, size: 10 };
    ws.getCell(r, 2).value = b.good;
    ws.getCell(r, 2).font = { ...MONO_FONT, color: GREEN };
    ws.getCell(r, 3).value = b.acceptable;
    ws.getCell(r, 3).font = { ...MONO_FONT, color: { argb: 'FFE8A838' } };
    ws.getCell(r, 4).value = b.concerning;
    ws.getCell(r, 4).font = { ...MONO_FONT, color: RED };
    ws.getCell(r, 5).value = '';
    ws.getCell(r, 5).fill = { type: 'pattern', pattern: 'solid', fgColor: LIGHT_BLUE_BG };
    ws.getCell(r, 5).font = INPUT_FONT;
    ws.getCell(r, 6).value = b.notes;
    ws.getCell(r, 6).font = MUTED_FONT;
  }

  // Common mistakes
  const mRow = 5 + benchmarks.length + 2;
  ws.getCell(mRow, 1).value = 'COMMON FOUNDER MISTAKES';
  ws.getCell(mRow, 1).font = HEADER_FONT;
  ['Mistake', 'Why It Happens', 'What Actually Happens', 'How to Avoid'].forEach((v, i) => ws.getCell(mRow + 1, i + 1).value = v);
  applyHeaderRow(ws, mRow + 1, 4);

  const mistakes = ec.commonMistakes;
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
function buildGameComparison(wb, classConfig, history, forecast, lastState, ec) {
  const ws = wb.addWorksheet('Game — Plan vs Reality', { views: [{ state: 'frozen', ySplit: 5, xSplit: 1 }] });

  const resultLabel = lastState.acquired ? 'Acquired' : (lastState.pmf ?? 0) >= 85 ? 'PMF Achieved' : (lastState.cash ?? 0) <= 0 ? 'Game Over' : 'Survived';
  ws.getCell('A1').value = `GAME RESULTS — ${classConfig.name}`;
  ws.getCell('A1').font = TITLE_FONT;
  ws.getCell('A2').value = `${resultLabel} | Month ${lastState.month ?? 0}`;
  ws.getCell('A2').font = MUTED_FONT;
  ws.getCell('A3').value = 'Where did your assumptions break? Look at the Δ% columns.';
  ws.getCell('A3').font = MUTED_FONT;

  const headers = ec.gameCompHeaders;
  headers.forEach((v, i) => ws.getCell(5, i + 1).value = v);
  applyHeaderRow(ws, 5, headers.length);
  ws.columns = ec.gameCompWidths.map(w => ({ width: w }));

  const maxMonth = Math.min(history.length - 1, forecast.length - 1);
  for (let m = 0; m <= maxMonth; m++) {
    const r = 6 + m;
    const f = forecast[m] ?? {};
    const a = history[m] ?? {};
    const vals = [`M${m}`, ...ec.buildGameCompRow(f, a)];
    vals.forEach((v, i) => {
      ws.getCell(r, i + 1).value = v;
      ws.getCell(r, i + 1).font = MONO_FONT;
    });
  }
}

// ═══════════════════════════════════════════════════════════
// Sheet 5: Revenue Waterfall / Class Dynamics
// ═══════════════════════════════════════════════════════════
function buildRevenueWaterfall(wb, history, ec) {
  const ws = wb.addWorksheet('Game — Revenue', { views: [{ state: 'frozen', ySplit: 4, xSplit: 1 }] });

  ws.getCell('A1').value = ec.waterfallTitle;
  ws.getCell('A1').font = TITLE_FONT;
  ws.getCell('A2').value = ec.waterfallSubtitle;
  ws.getCell('A2').font = MUTED_FONT;

  const headers = ec.waterfallHeaders;
  headers.forEach((v, i) => ws.getCell(4, i + 1).value = v);
  applyHeaderRow(ws, 4, headers.length);
  ws.columns = ec.waterfallWidths.map(w => ({ width: w }));

  for (let i = 1; i < history.length; i++) {
    const r = 4 + i;
    const s = history[i];
    const prev = history[i - 1];
    const vals = ec.buildWaterfallRow(s, prev);
    vals.forEach((v, c) => {
      ws.getCell(r, c + 1).value = v;
      ws.getCell(r, c + 1).font = MONO_FONT;
    });
  }

  const noteRow = 4 + history.length + 1;
  const notes = ec.waterfallNotes;
  notes.forEach((n, i) => {
    ws.getCell(noteRow + i, 1).value = n;
    ws.getCell(noteRow + i, 1).font = MUTED_FONT;
  });
}

// ═══════════════════════════════════════════════════════════
// Sheet 6: Decision Log (generic — works for all classes)
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
function buildGlossary(wb, ec) {
  const ws = wb.addWorksheet('Glossary');
  ws.columns = [{ width: 22 }, { width: 48 }, { width: 50 }, { width: 32 }];

  ws.getCell('A1').value = ec.glossaryTitle;
  ws.getCell('A1').font = TITLE_FONT;

  ['Metric', 'Formula', 'What It Tells You', 'Healthy Range'].forEach((v, i) => ws.getCell(3, i + 1).value = v);
  applyHeaderRow(ws, 3, 4);

  const terms = ec.glossary;
  terms.forEach((t, i) => {
    const r = 4 + i;
    const row = Array.isArray(t) ? t : [t.term, t.formula, t.meaning, t.healthy];
    row.forEach((v, c) => {
      ws.getCell(r, c + 1).value = v;
      ws.getCell(r, c + 1).font = c === 0 ? { bold: true, size: 10 } : { size: 10 };
    });
  });

  if (ec.furtherReading) {
    const refRow = 4 + terms.length + 2;
    ws.getCell(refRow, 1).value = 'FURTHER READING';
    ws.getCell(refRow, 1).font = HEADER_FONT;
    ec.furtherReading.forEach((l, i) => {
      ws.getCell(refRow + 1 + i, 1).value = l[0];
      ws.getCell(refRow + 1 + i, 2).value = { text: l[1], hyperlink: l[1] };
      ws.getCell(refRow + 1 + i, 2).font = { color: BLUE_INPUT, underline: true, size: 10 };
    });
  }
}

// ─── Helpers ─────────────────────────────────────────────
function colLetter(num) {
  let s = '';
  let n = num;
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}
