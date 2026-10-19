#!/usr/bin/env node
// Writes one sample Excel export per class (from a simulated game) to an
// output directory, so the workbook can be inspected and recalculated
// outside the browser.
//
// Usage: node scripts/export-sample.mjs [outDir] [classId]

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CLASSES } from "../src/classes/index.js";
import { exportToExcel } from "../src/export/excelExport.js";
import { simulateGameDetailed } from "./balance.mjs";

const outDir = process.argv[2] ?? "/tmp/grnd_xlsx";
const only = process.argv[3];
mkdirSync(outDir, { recursive: true });

for (const classId of Object.keys(CLASSES)) {
	if (only && only !== classId) continue;
	const config = CLASSES[classId];
	const run = simulateGameDetailed(classId, "mixed");
	const buffer = await exportToExcel(
		config,
		run.history,
		run.decisions,
		run.forecast,
		run.assumptions,
	);
	const file = join(outDir, `${classId}.xlsx`);
	writeFileSync(file, Buffer.from(buffer));
	console.log(`${file}  (${run.result}, M${run.history.at(-1).month})`);
}
