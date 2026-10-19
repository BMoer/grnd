import ExcelJS from 'exceljs';
import { buildBusinessCase } from './businessCase.js';
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
 * Export: business case template for the team's own startup + GRND game data.
 * Reads config from classExportConfigs.js based on classConfig.id.
 */
export async function exportToExcel(classConfig, history, decisions, forecast, assumptions) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'GRND';
  wb.created = new Date();
  // No cached results are written: make Excel/Numbers/Sheets compute on open
  wb.calcProperties = { fullCalcOnLoad: true };

  const ec = getExportConfig(classConfig.id);
  const lastState = history[history.length - 1] ?? {};

  // Business case template (Start here, Summary, Inputs, Unit Economics,
  // Monthly Plan + hidden scenario calcs), then reference and game appendix.
  buildBusinessCase(wb, classConfig, assumptions, lastState);
  buildBenchmarks(wb, ec);
  buildGlossary(wb, ec);
  buildGameComparison(wb, classConfig, history, forecast, lastState, ec);
  buildRevenueWaterfall(wb, history, ec);
  buildDecisionLog(wb, decisions);

  const buffer = await wb.xlsx.writeBuffer();
  if (typeof document !== 'undefined' && document.createElement) {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GRND_business_case_${classConfig.id}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return buffer;
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
