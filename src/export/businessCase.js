// ═══════════════════════════════════════════════════════════════
// BUSINESS CASE TEMPLATE — formula-driven Excel model for teams
//
// Sheets built here:
//   Start here      how to use, colour code, evidence code
//   Inputs          drivers × 3 scenarios, evidence, source, hiring plan,
//                   funding plan, active-scenario switch
//   Summary         key results for all three scenarios side by side
//   Unit Economics  per-customer economics × 3 scenarios + benchmark status
//   Monthly Plan    36-month plan for the active scenario
//   Calc …          the same plan per scenario (hidden, feeds Summary)
//
// Class-specific revenue logic lives in businessCaseModels.js.
// Every number a team should change is a blue input on "Inputs";
// everything else is a formula.
// ═══════════════════════════════════════════════════════════════

import { getBusinessCaseModel } from "./businessCaseModels.js";

export const MONTHS = 36;
const HIRE_ROWS = 8;
const FUNDING_ROWS = 6;

const C = {
	blue: "FF2D5DA1",
	grey: "FF9C9689",
	dark: "FF1A1A1A",
	red: "FFD64045",
	green: "FF3A8A5C",
	amber: "FFE8A838",
	surface: "FFEDEAE4",
	inputBg: "FFDCE6F5",
	greenBg: "FFDFF0E5",
	amberBg: "FFFBEFD5",
	redBg: "FFF5DCDC",
};
const fill = (argb) => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const TITLE = { bold: true, size: 14, color: { argb: C.dark } };
const H = { bold: true, size: 11, color: { argb: C.dark } };
const MUTED = { size: 9, italic: true, color: { argb: C.grey } };
const INPUT = { bold: true, size: 10, color: { argb: C.blue } };

const FMT = {
	eur: '€#,##0;[Red]-€#,##0',
	dec: "#,##0.0",
	int: "#,##0",
	pct: "0.0",
	month: "0",
};
const unitFmt = (unit) =>
	unit === "€" ? FMT.eur : unit === "x" ? "0.00" : "#,##0.0";

const SCENARIOS = [
	{ name: "Pessimistic", col: "B", sheet: "Calc Pessimistic" },
	{ name: "Base", col: "C", sheet: "Calc Base" },
	{ name: "Optimistic", col: "D", sheet: "Calc Optimistic" },
];
const ACTIVE_COL = "E";

export function colLetter(num) {
	let s = "";
	let n = num;
	while (n > 0) {
		n--;
		s = String.fromCharCode(65 + (n % 26)) + s;
		n = Math.floor(n / 26);
	}
	return s;
}

const header = (ws, row, values) => {
	values.forEach((v, i) => {
		const cell = ws.getCell(row, i + 1);
		cell.value = v;
		cell.font = { bold: true, size: 9, color: { argb: C.dark } };
		cell.fill = fill(C.surface);
		cell.border = { bottom: { style: "thin", color: { argb: C.grey } } };
		cell.alignment = { wrapText: true, vertical: "bottom" };
	});
};

const styleInput = (cell) => {
	cell.font = INPUT;
	cell.fill = fill(C.inputBg);
	cell.border = { bottom: { style: "thin", color: { argb: C.blue } } };
};

// ─── Inputs sheet ───────────────────────────────────────────
function shared(model) {
	return [
		{ key: "startCash", label: "Cash in the bank today", unit: "€", base: model.startCash, same: true, section: "fixed", guidance: "Founder money, pre-seed, existing loans. Grants and rounds go in the funding plan below." },
		{ key: "team", label: "Founders / core team cost per month", unit: "€", base: model.teamCost, section: "fixed", guidance: "Salaries you actually pay now (incl. employer costs). Hires go in the hiring plan." },
		{ key: "other", label: "Other fixed costs per month", unit: "€", base: model.otherFixed, section: "fixed", guidance: "Rent, tools, insurance, accounting, legal." },
	];
}

function buildInputs(wb, model, classId, gameAssumptions, lastState) {
	const ws = wb.addWorksheet("Inputs", { views: [{ state: "frozen", ySplit: 6 }] });
	ws.columns = [
		{ width: 48 }, { width: 13 }, { width: 13 }, { width: 13 }, { width: 13 },
		{ width: 8 }, { width: 11 }, { width: 34 }, { width: 60 }, { width: 13 },
	];
	ws.getCell("A1").value = `BUSINESS CASE INPUTS — ${model.label}`;
	ws.getCell("A1").font = TITLE;
	ws.getCell("A2").value =
		"Replace the blue cells with YOUR numbers. Base = your honest best guess. Then mark how you know each number.";
	ws.getCell("A2").font = MUTED;

	ws.getCell("A3").value = "Active scenario (drives 'Monthly Plan' and the 'Active' column):";
	ws.getCell("A3").font = H;
	ws.getCell("C3").value = "Base";
	styleInput(ws.getCell("C3"));
	ws.getCell("C3").dataValidation = {
		type: "list",
		allowBlank: false,
		formulae: ['"Pessimistic,Base,Optimistic"'],
	};

	header(ws, 6, [
		"Driver", "Pessimistic", "Base", "Optimistic", "Active", "Unit",
		"Evidence", "How do we know? (source, test, date)", "Guidance", "Your GRND run",
	]);

	const refs = {};
	const ref = (key, col) => `Inputs!$${col}$${refs[key]}`;
	let r = 7;

	const sections = [
		{ title: "REVENUE & GROWTH", rows: model.inputs.filter((x) => !x.section) },
		{ title: "VARIABLE COSTS (per unit, order, customer or hour)", rows: model.inputs.filter((x) => x.section === "variable") },
		{ title: "FIXED COSTS & CASH", rows: [...shared(model), ...(model.fixedCosts ?? [])] },
	];

	for (const section of sections) {
		ws.getCell(r, 1).value = section.title;
		ws.getCell(r, 1).font = H;
		r++;
		for (const inp of section.rows) {
			refs[inp.key] = r;
			const fromGame = inp.fromGame ? inp.fromGame(gameAssumptions ?? {}) : undefined;
			const base = typeof fromGame === "number" && Number.isFinite(fromGame) ? fromGame : inp.base;
			ws.getCell(r, 1).value = inp.label;
			ws.getCell(r, 3).value = base;
			styleInput(ws.getCell(r, 3));
			for (const [col, val] of [[2, inp.pess], [4, inp.opt]]) {
				const cell = ws.getCell(r, col);
				if (inp.same || val === undefined || val === inp.base) {
					cell.value = { formula: `C${r}` };
					cell.font = { size: 10, color: { argb: C.dark } };
				} else {
					cell.value = val;
					styleInput(cell);
				}
			}
			ws.getCell(r, 5).value = {
				formula: `IF($C$3="Pessimistic",B${r},IF($C$3="Optimistic",D${r},C${r}))`,
			};
			ws.getCell(r, 5).font = { size: 10, bold: true };
			ws.getCell(r, 6).value = inp.unit;
			const ev = ws.getCell(r, 7);
			ev.value = "Red";
			ev.dataValidation = { type: "list", allowBlank: true, formulae: ['"Green,Yellow,Red"'] };
			ws.getCell(r, 8).fill = fill(C.inputBg);
			ws.getCell(r, 9).value = inp.guidance;
			ws.getCell(r, 9).font = MUTED;
			ws.getCell(r, 9).alignment = { wrapText: true };
			const actual = inp.gameActual && lastState ? inp.gameActual(lastState) : undefined;
			if (typeof actual === "number" && Number.isFinite(actual)) {
				ws.getCell(r, 10).value = Math.round(actual * 100) / 100;
				ws.getCell(r, 10).font = { size: 9, color: { argb: C.grey } };
			}
			for (let c = 2; c <= 5; c++) ws.getCell(r, c).numFmt = unitFmt(inp.unit);
			r++;
		}
		r++;
	}

	ws.addConditionalFormatting({
		ref: `G7:G${r}`,
		rules: [
			{ type: "cellIs", operator: "equal", priority: 1, formulae: ['"Green"'], style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: C.greenBg } }, font: { color: { argb: C.green }, bold: true } } },
			{ type: "cellIs", operator: "equal", priority: 2, formulae: ['"Yellow"'], style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: C.amberBg } }, font: { color: { argb: C.amber }, bold: true } } },
			{ type: "cellIs", operator: "equal", priority: 3, formulae: ['"Red"'], style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: C.redBg } }, font: { color: { argb: C.red }, bold: true } } },
		],
	});

	// Evidence score
	const lastInputRow = r - 2;
	ws.getCell("E3").value = "Evidence:";
	ws.getCell("E3").font = H;
	ws.getCell("F3").value = {
		formula: `COUNTIF(G7:G${lastInputRow},"Green")&" green · "&COUNTIF(G7:G${lastInputRow},"Yellow")&" yellow · "&COUNTIF(G7:G${lastInputRow},"Red")&" red"`,
	};
	ws.getCell("F3").font = { size: 10, bold: true };
	ws.getCell("A4").value =
		"Evidence: Green = measured (paying customers, signed offers, real data) · Yellow = signal (interviews, LOIs, pilots) · Red = assumption. A sheet full of green is a lie.";
	ws.getCell("A4").font = MUTED;

	// Hiring plan
	ws.getCell(r, 1).value = "HIRING PLAN (applies to all scenarios)";
	ws.getCell(r, 1).font = H;
	r++;
	header(ws, r, ["Role", "Start month", "Monthly cost (fully loaded)", "", "", "", "", "Why this hire, and what must be true first?"]);
	r++;
	const hireFirst = r;
	for (let k = 0; k < HIRE_ROWS; k++, r++) {
		for (const c of [1, 2, 3, 8]) styleInput(ws.getCell(r, c));
		ws.getCell(r, 3).numFmt = FMT.eur;
	}
	const hireLast = r - 1;
	ws.getCell(hireFirst, 1).value = "Example: first hire — overwrite or delete";
	ws.getCell(hireFirst, 2).value = 13;
	ws.getCell(hireFirst, 3).value = 4500;
	r++;

	// Funding plan
	ws.getCell(r, 1).value = "FUNDING PLAN (grants, equity, loans — applies to all scenarios)";
	ws.getCell(r, 1).font = H;
	r++;
	header(ws, r, ["Source", "Month cash arrives", "Amount", "Type", "", "", "", "Status (idea / applied / committed / received)"]);
	r++;
	const fundFirst = r;
	for (let k = 0; k < FUNDING_ROWS; k++, r++) {
		for (const c of [1, 2, 3, 4, 8]) styleInput(ws.getCell(r, c));
		ws.getCell(r, 3).numFmt = FMT.eur;
		ws.getCell(r, 4).dataValidation = { type: "list", allowBlank: true, formulae: ['"Grant,Equity,Loan,Revenue-based,Other"'] };
	}
	const fundLast = r - 1;
	(model.funding ?? []).forEach((f, k) => {
		ws.getCell(fundFirst + k, 1).value = f.name;
		ws.getCell(fundFirst + k, 2).value = f.month;
		ws.getCell(fundFirst + k, 3).value = f.amount;
		ws.getCell(fundFirst + k, 4).value = f.type;
	});

	return {
		ref,
		inputKeys: Object.keys(refs),
		hires: { start: `Inputs!$B$${hireFirst}:$B$${hireLast}`, cost: `Inputs!$C$${hireFirst}:$C$${hireLast}` },
		funding: { month: `Inputs!$B$${fundFirst}:$B$${fundLast}`, amount: `Inputs!$C$${fundFirst}:$C$${fundLast}` },
	};
}

// ─── Plan sheets ────────────────────────────────────────────
export function planLayout(model) {
	const classCols = model.columns.map((c) => ({ ...c }));
	const pre = model.needsHireCount
		? [{ key: "hiresActive", header: "Hires on payroll", fmt: "int", builtin: true }]
		: [];
	const post = [
		{ key: "grossProfit", header: "Gross profit", fmt: "eur", builtin: true },
		{ key: "gm", header: "Gross margin %", fmt: "pct", builtin: true },
		{ key: "fixed", header: "Team & fixed costs", fmt: "eur", builtin: true },
		{ key: "ebitda", header: "EBITDA", fmt: "eur", builtin: true },
		{ key: "fundingIn", header: "Funding in", fmt: "eur", builtin: true },
		{ key: "cash", header: "Cash (end of month)", fmt: "eur", builtin: true },
		{ key: "runway", header: "Runway (months)", fmt: "dec", builtin: true },
		{ key: "beHelper", header: "First month EBITDA > 0", fmt: "int", builtin: true, helper: true },
		{ key: "outHelper", header: "First month cash < 0", fmt: "int", builtin: true, helper: true },
	];
	const cols = [{ key: "month", header: "Month", fmt: "int", builtin: true }, ...pre, ...classCols, ...post];
	const letters = {};
	cols.forEach((c, idx) => {
		letters[c.key] = colLetter(idx + 1);
	});
	return { cols, letters, headerRow: 4, firstRow: 5 };
}

function buildPlanSheet(wb, name, model, inputs, scenarioCol, opts = {}) {
	const ws = wb.addWorksheet(name, {
		views: [{ state: "frozen", ySplit: 4, xSplit: 1 }],
		state: opts.hidden ? "hidden" : "visible",
	});
	const { cols, letters, headerRow, firstRow } = planLayout(model);
	ws.columns = cols.map((c) => ({ width: c.helper ? 12 : Math.max(11, Math.min(18, c.header.length + 2)) }));

	ws.getCell("A1").value = opts.title ?? name;
	ws.getCell("A1").font = TITLE;
	ws.getCell("A2").value =
		opts.subtitle ?? "All cells are formulas. Change numbers on the Inputs sheet, not here.";
	ws.getCell("A2").font = MUTED;
	header(ws, headerRow, cols.map((c) => c.header));

	const i = (key) => {
		if (key === undefined) throw new Error("input key missing");
		return inputs.ref(key, scenarioCol);
	};

	// Month 0
	const r0 = firstRow;
	ws.getCell(r0, 1).value = 0;
	for (const [key, fn] of Object.entries(model.month0 ?? {})) {
		ws.getCell(`${letters[key]}${r0}`).value = { formula: fn(i) };
	}
	ws.getCell(`${letters.cash}${r0}`).value = { formula: i("startCash") };
	ws.getCell(`${letters.beHelper}${r0}`).value = 0;
	ws.getCell(`${letters.outHelper}${r0}`).value = 0;
	if (letters.hiresActive) ws.getCell(`${letters.hiresActive}${r0}`).value = 0;

	for (let m = 1; m <= MONTHS; m++) {
		const r = r0 + m;
		const p = r - 1;
		const ctx = {
			m,
			in: i,
			c: (k) => `${letters[k]}${r}`,
			cp: (k) => `${letters[k]}${p}`,
		};
		const L = (k) => `${letters[k]}${r}`;
		const formulas = {
			month: null,
			hiresActive: `COUNTIFS(${inputs.hires.start},"<="&A${r},${inputs.hires.start},">0")`,
			grossProfit: `${L("revenue")}-${L("variable")}`,
			gm: `IF(${L("revenue")}>0,${L("grossProfit")}/${L("revenue")}*100,0)`,
			fixed: `${i("team")}+${i("other")}${(model.fixedCosts ?? []).map((f) => `+${i(f.key)}`).join("")}+SUMIFS(${inputs.hires.cost},${inputs.hires.start},"<="&A${r},${inputs.hires.start},">0")`,
			ebitda: `${L("grossProfit")}-${L("acquisition")}-${L("fixed")}`,
			fundingIn: `SUMIFS(${inputs.funding.amount},${inputs.funding.month},A${r})`,
			cash: `${letters.cash}${p}+${L("ebitda")}+${L("fundingIn")}`,
			runway: `IF(${L("ebitda")}<0,MAX(0,${L("cash")})/-${L("ebitda")},99)`,
			beHelper: `IF(${letters.beHelper}${p}>0,${letters.beHelper}${p},IF(${L("ebitda")}>0,A${r},0))`,
			outHelper: `IF(${letters.outHelper}${p}>0,${letters.outHelper}${p},IF(${L("cash")}<0,A${r},0))`,
		};
		cols.forEach((col, idx) => {
			const cell = ws.getCell(r, idx + 1);
			if (col.key === "month") cell.value = m;
			else if (col.builtin) cell.value = { formula: formulas[col.key] };
			else cell.value = { formula: col.formula(ctx) };
			cell.numFmt = FMT[col.fmt] ?? FMT.dec;
			cell.font = { size: 10, color: { argb: col.helper ? C.grey : C.dark } };
		});
	}
	const last = r0 + MONTHS;
	ws.addConditionalFormatting({
		ref: `${letters.cash}${r0}:${letters.cash}${last}`,
		rules: [{ type: "cellIs", operator: "lessThan", priority: 1, formulae: [0], style: { font: { color: { argb: C.red } }, fill: { type: "pattern", pattern: "solid", bgColor: { argb: C.redBg } } } }],
	});
	ws.addConditionalFormatting({
		ref: `${letters.ebitda}${r0 + 1}:${letters.ebitda}${last}`,
		rules: [{ type: "cellIs", operator: "greaterThan", priority: 1, formulae: [0], style: { font: { color: { argb: C.green } } } }],
	});
	for (let y = 1; y <= 3; y++) {
		ws.getCell(`${letters.revenue}${r0 + 12 * y}`).border = { bottom: { style: "medium", color: { argb: C.grey } } };
	}
	return { letters, r0, last };
}

// ─── Unit economics ─────────────────────────────────────────
function buildUnitEconomics(wb, model, inputs) {
	const ws = wb.addWorksheet("Unit Economics");
	ws.columns = [{ width: 52 }, { width: 13 }, { width: 13 }, { width: 13 }, { width: 13 }, { width: 9 }, { width: 14 }, { width: 55 }];
	ws.getCell("A1").value = "UNIT ECONOMICS — does one customer make money?";
	ws.getCell("A1").font = TITLE;
	ws.getCell("A2").value =
		"Computed from Inputs. LTV is on contribution (after variable costs), not on revenue — the number investors actually check.";
	ws.getCell("A2").font = MUTED;
	header(ws, 4, ["Metric", "Pessimistic", "Base", "Optimistic", "Active", "Unit", "Status (active)", "Note"]);

	const rows = {};
	model.unitEconomics.forEach((u, k) => {
		rows[u.key] = 5 + k;
	});
	const cols = [...SCENARIOS.map((s) => s.col), ACTIVE_COL];
	model.unitEconomics.forEach((u) => {
		const r = rows[u.key];
		ws.getCell(r, 1).value = u.label;
		cols.forEach((col, idx) => {
			const i = (key) => inputs.ref(key, col);
			const uRef = (key) => `${col}${rows[key]}`;
			const cell = ws.getCell(r, idx + 2);
			cell.value = { formula: u.formula(i, uRef) };
			cell.numFmt = unitFmt(u.unit);
			cell.font = { size: 10, bold: idx === 3 };
		});
		ws.getCell(r, 6).value = u.unit;
		if (u.benchmark) {
			const { good, ok, higherIsBetter } = u.benchmark;
			const v = `E${r}`;
			ws.getCell(r, 7).value = {
				formula: higherIsBetter
					? `IF(${v}>=${good},"Good",IF(${v}>=${ok},"Acceptable","Concerning"))`
					: `IF(${v}<=${good},"Good",IF(${v}<=${ok},"Acceptable","Concerning"))`,
			};
			ws.getCell(r, 8).value = `${u.note ? `${u.note} ` : ""}Good: ${higherIsBetter ? "≥" : "≤"} ${good} · acceptable: ${higherIsBetter ? "≥" : "≤"} ${ok}`;
		} else if (u.note) {
			ws.getCell(r, 8).value = u.note;
		}
		ws.getCell(r, 8).font = MUTED;
	});
	const lastRow = 4 + model.unitEconomics.length;
	ws.addConditionalFormatting({
		ref: `G5:G${lastRow}`,
		rules: [
			{ type: "cellIs", operator: "equal", priority: 1, formulae: ['"Good"'], style: { font: { color: { argb: C.green }, bold: true } } },
			{ type: "cellIs", operator: "equal", priority: 2, formulae: ['"Acceptable"'], style: { font: { color: { argb: C.amber }, bold: true } } },
			{ type: "cellIs", operator: "equal", priority: 3, formulae: ['"Concerning"'], style: { font: { color: { argb: C.red }, bold: true } } },
		],
	});
	return { rows };
}

// ─── Summary ────────────────────────────────────────────────
function buildSummary(ws, model, layout, ue) {
	ws.columns = [{ width: 46 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 4 }, { width: 60 }];
	ws.getCell("A1").value = `BUSINESS CASE SUMMARY — ${model.label}`;
	ws.getCell("A1").font = TITLE;
	ws.getCell("A2").value = "All three scenarios at once. If the pessimistic column kills you, that is the plan you need to fund.";
	ws.getCell("A2").font = MUTED;
	header(ws, 4, ["", "Pessimistic", "Base", "Optimistic", "", "What to look at"]);

	const { letters, r0, last } = layout;
	const L = letters;
	const q = (sheet) => `'${sheet}'!`;
	const range = (sheet, key, from, to) => `${q(sheet)}${L[key]}${from}:${L[key]}${to}`;
	const yr = (y) => [r0 + 12 * (y - 1) + 1, r0 + 12 * y];

	const rows = [
		{ section: "REVENUE" },
		...[12, 24, 36].map((m) => ({ label: `Revenue in month ${m}`, fmt: FMT.eur, f: (s) => `${q(s)}${L.revenue}${r0 + m}` })),
		...[1, 2, 3].map((y) => ({ label: `Revenue year ${y}`, fmt: FMT.eur, f: (s) => `SUM(${range(s, "revenue", ...yr(y))})` })),
		{ label: `${model.volume.label} in month 12`, fmt: FMT.dec, f: (s) => `${q(s)}${L[model.volume.key]}${r0 + 12}` },
		{ label: `${model.volume.label} in month 36`, fmt: FMT.dec, f: (s) => `${q(s)}${L[model.volume.key]}${r0 + 36}` },
		{ section: "PROFITABILITY" },
		{ label: "Gross margin year 2 (%)", fmt: "0.0", f: (s) => `IF(SUM(${range(s, "revenue", ...yr(2))})>0,SUM(${range(s, "grossProfit", ...yr(2))})/SUM(${range(s, "revenue", ...yr(2))})*100,0)`, hint: "Software 70 %+, D2C 40–60 %, hardware 40–60 %, services 30–50 %." },
		...[1, 2, 3].map((y) => ({ label: `EBITDA year ${y}`, fmt: FMT.eur, f: (s) => `SUM(${range(s, "ebitda", ...yr(y))})` })),
		{ label: "First month with positive EBITDA", fmt: "@", f: (s) => `IF(${q(s)}${L.beHelper}${last}>0,"M"&${q(s)}${L.beHelper}${last},"not within 36 months")`, hint: "Operational break-even." },
		{ section: "CASH & FUNDING" },
		{ label: "Lowest cash balance", fmt: FMT.eur, f: (s) => `MIN(${range(s, "cash", r0, last)})` },
		{ label: "Month of lowest cash (month no.)", fmt: FMT.month, f: (s) => `INDEX(${range(s, "month", r0, last)},MATCH(MIN(${range(s, "cash", r0, last)}),${range(s, "cash", r0, last)},0))` },
		{ label: "Cash runs out in", fmt: "@", f: (s) => `IF(${q(s)}${L.outHelper}${last}>0,"M"&${q(s)}${L.outHelper}${last},"never (within 36 months)")`, hint: "Including the funding plan on Inputs." },
		{ label: "Funding gap (additional cash needed)", fmt: FMT.eur, f: (s) => `MAX(0,-MIN(${range(s, "cash", r0, last)}))`, hint: "Money you still need to raise on top of the funding plan." },
		{ label: "Suggested raise (gap + 6 months of year-2 costs)", fmt: FMT.eur, f: (s) => `MAX(0,-MIN(${range(s, "cash", r0, last)}))+6*(SUM(${range(s, "revenue", ...yr(2))})-SUM(${range(s, "ebitda", ...yr(2))}))/12`, hint: "A buffer so you don't fundraise from zero." },
		{ section: "UNIT ECONOMICS" },
		...model.unitEconomics
			.filter((u) => u.benchmark || u.key === "ltv" || u.key === "cac")
			.map((u) => ({ label: u.label, fmt: unitFmt(u.unit), ue: u.key })),
	];

	let r = 5;
	for (const row of rows) {
		if (row.section) {
			r++;
			ws.getCell(r, 1).value = row.section;
			ws.getCell(r, 1).font = H;
			r++;
			continue;
		}
		ws.getCell(r, 1).value = row.label;
		SCENARIOS.forEach((s, idx) => {
			const cell = ws.getCell(r, idx + 2);
			cell.value = { formula: row.ue ? `'Unit Economics'!${s.col}${ue.rows[row.ue]}` : row.f(s.sheet) };
			cell.numFmt = row.fmt;
			cell.font = { size: 10, bold: idx === 1 };
			cell.alignment = { horizontal: "right" };
		});
		if (row.hint) {
			ws.getCell(r, 6).value = row.hint;
			ws.getCell(r, 6).font = MUTED;
		}
		r++;
	}

	r += 1;
	ws.getCell(r, 1).value = "QUESTIONS BEFORE YOU SHOW THIS TO ANYONE";
	ws.getCell(r, 1).font = H;
	[
		"1. Which three inputs move the result most? Change each by 20 % and watch 'Funding gap'.",
		"2. Which of those three are still red on the Inputs sheet? That is your next experiment.",
		"3. Can you survive the pessimistic column with the funding you can realistically get?",
		"4. What would have to be true for the optimistic column — and what would you see first if it were?",
	].forEach((t, k) => {
		ws.getCell(r + 1 + k, 1).value = t;
		ws.getCell(r + 1 + k, 1).font = { size: 10 };
	});
}

// ─── Start here ─────────────────────────────────────────────
function buildStart(wb, model, classConfig) {
	const ws = wb.addWorksheet("Start here");
	ws.columns = [{ width: 4 }, { width: 110 }];
	ws.getCell("B1").value = `BUSINESS CASE TEMPLATE — ${model.label}`;
	ws.getCell("B1").font = TITLE;
	ws.getCell("B2").value = `Generated from your GRND run (${classConfig.name}). The game numbers are only a starting point — replace them with yours.`;
	ws.getCell("B2").font = MUTED;
	const lines = [
		["HOW TO USE", true],
		["1. Inputs: put in your own numbers. Start with three: what a customer pays, what it costs to win one, what it costs to serve one.", false],
		["2. Inputs: for every number, set Evidence (Green / Yellow / Red) and write down how you know it. Update the sheet after every customer conversation, offer or test.", false],
		["3. Inputs: add hires and funding (grants, equity, loans) with the month they start or arrive.", false],
		["4. Summary: read all three scenarios. The pessimistic column is the one you need to survive.", false],
		["5. Unit Economics: check whether one customer makes money before you plan to buy many.", false],
		["6. Monthly Plan: the 36-month plan for the scenario chosen in Inputs!C3. Add your own charts from here (select columns → Insert → Chart).", false],
		["", false],
		["COLOUR CODE", true],
		["Blue cells on a light blue background = inputs you change. Black cells = formulas. Don't type over formulas.", false],
		["Red cash cells = you are out of money in that month.", false],
		["", false],
		["WHAT THIS MODEL IS — AND ISN'T", true],
		["A monthly cash model on contribution margin: revenue − variable costs − acquisition − team & fixed costs + funding = cash. No taxes, VAT, depreciation or payment terms.", false],
		["If you need those for a bank or grant application, add them on top — the drivers stay the same.", false],
		["", false],
		["APPENDIX: the 'Game —' sheets show what happened in your GRND run (plan vs reality, decisions). They are for reflection, not for your business case.", false],
	];
	lines.forEach(([t, bold], k) => {
		const cell = ws.getCell(4 + k, 2);
		cell.value = t;
		cell.font = bold ? H : { size: 10 };
		cell.alignment = { wrapText: true };
	});
}

/**
 * Build the business case sheets into an ExcelJS workbook.
 * Order: Start here, Summary, Inputs, Unit Economics, Monthly Plan, Calc × 3.
 */
export function buildBusinessCase(wb, classConfig, gameAssumptions, lastState) {
	const model = getBusinessCaseModel(classConfig.id);
	const { letters, firstRow } = planLayout(model);
	const layout = { letters, r0: firstRow, last: firstRow + MONTHS };
	buildStart(wb, model, classConfig);
	const summary = wb.addWorksheet("Summary");
	const inputs = buildInputs(wb, model, classConfig.id, gameAssumptions, lastState);
	const ue = buildUnitEconomics(wb, model, inputs);
	buildSummary(summary, model, layout, ue);
	buildPlanSheet(wb, "Monthly Plan", model, inputs, ACTIVE_COL, {
		title: "MONTHLY PLAN — active scenario (Inputs!C3)",
	});
	for (const s of SCENARIOS) {
		buildPlanSheet(wb, s.sheet, model, inputs, s.col, { hidden: true, title: `${s.name} scenario` });
	}
	return wb;
}
