import * as XLSX from 'xlsx';

/**
 * Export game data + reusable template to .xlsx
 */
export function exportToExcel(classConfig, history, decisions, forecast, assumptions) {
  const wb = XLSX.utils.book_new();

  // ─── Sheet 1: Your Game ───
  const gameData = [
    [`GRND — ${classConfig.name} Game Export`],
    [`Result: ${history[history.length-1]?.pmf >= 60 ? 'PMF Achieved' : history[history.length-1]?.cash <= 0 ? 'Game Over' : 'Survived'}`],
    [],
    classConfig.tableHeaders,
    ...history.map(s => classConfig.getRow(s)),
    [],
    ['DECISIONS LOG'],
    ['Month', 'Event', 'Decision', 'Outcome'],
    ...decisions.map(d => [d.month, d.event, d.choice, d.feedback]),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(gameData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Your Game');

  // ─── Sheet 2: Template ───
  const templateHeaders = ['Month', 'New Trials', 'Conversions', 'New MRR', 'Churned MRR', 'Net MRR', 'Total MRR', 'Customers', 'CAC', 'LTV', 'LTV:CAC', 'Gross Margin %', 'Burn Rate', 'Cash', 'Runway'];
  const templateData = [
    [`${classConfig.name} — Financial Model Template`],
    [],
    ['YOUR ASSUMPTIONS (edit the blue cells)'],
    ['Price/mo', assumptions.price ?? 49],
    ['Monthly Churn %', assumptions.churnRate ?? 5],
    ['Target CAC', assumptions.targetCAC ?? 80],
    ['Conversion Rate %', assumptions.conversionRate ?? 15],
    ['Pipeline Growth/mo', assumptions.pipelineGrowth ?? 20],
    ['Support Cost/Customer', assumptions.supportCost ?? 5],
    [],
    ['PROJECTED MONTHLY TABLE'],
    templateHeaders,
    ...forecast.slice(0, 13).map(f => [
      f.month, f.newTrials, f.conversions, f.newMRR, f.churnedMRR, f.netMRR,
      f.totalMRR, f.customers, f.cac, f.ltv, f.ltvCacRatio, f.grossMargin,
      f.burnRate, f.cash, f.runway,
    ]),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(templateData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Template');

  // ─── Sheet 3: Instructions ───
  const instructions = [
    ['HOW TO USE THIS TEMPLATE'],
    [],
    ['1. Edit the blue assumption cells on the "Template" sheet with YOUR real startup numbers.'],
    ['2. The monthly projections will show you what your business model predicts.'],
    ['3. Compare your "Your Game" results with the template predictions.'],
    [],
    ['KEY METRICS'],
    ['MRR', 'Monthly Recurring Revenue. The heartbeat of SaaS.'],
    ['Churn', 'Percentage of customers lost per month. >5% in SMB SaaS is a warning sign.'],
    ['CAC', 'Customer Acquisition Cost. What it costs to win one paying customer.'],
    ['LTV', 'Lifetime Value. Revenue per customer over their lifetime (ARPU / churn rate).'],
    ['LTV:CAC', 'Unit economics ratio. Below 3x, you lose money on each customer.'],
    ['Runway', 'Months of cash remaining at current burn rate.'],
    [],
    ['COMMON MISTAKES'],
    ['1. Underestimating CAC. First-time founders estimate 50% below reality.'],
    ['2. Ignoring churn. 5% monthly = 46% annual. It compounds.'],
    ['3. Confusing pipeline with customers. A trial is not a sale.'],
    ['4. Hiring before PMF. Every hire increases burn without guaranteed revenue.'],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(instructions);
  XLSX.utils.book_append_sheet(wb, ws3, 'Instructions');

  // Download
  XLSX.writeFile(wb, `grnd_${classConfig.id}_${Date.now()}.xlsx`);
}
