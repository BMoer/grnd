// ═══════════════════════════════════════════════════════════════
// FORECAST ENGINE
// Generates a 24-month forecast from player assumptions.
// This is the "plan" line — what the player THINKS will happen.
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a 24-month SaaS forecast from assumptions.
 * Returns array of monthly snapshots.
 */
export function generateSaaSForecast(assumptions) {
  const {
    price = 49,
    churnRate = 5,
    targetCAC = 80,
    conversionRate = 15,
    pipelineGrowth = 20,
    supportCost = 5,
  } = assumptions;

  const months = [];
  let totalMRR = 0;
  let customers = 0;
  let cash = 100000;
  const burnBase = 8000; // base team + infra cost
  let pipeline = 12;

  for (let m = 0; m <= 24; m++) {
    if (m === 0) {
      months.push({
        month: 0,
        newTrials: 0,
        conversions: 0,
        newMRR: 0,
        churnedMRR: 0,
        netMRR: 0,
        totalMRR: 0,
        customers: 0,
        cac: targetCAC,
        ltv: price / (churnRate / 100),
        ltvCacRatio: (price / (churnRate / 100)) / targetCAC,
        grossMargin: 0,
        burnRate: burnBase,
        cash: 100000,
        runway: Math.floor(100000 / burnBase),
        pipeline: 12,
      });
      continue;
    }

    // Pipeline grows each month
    pipeline = Math.round(pipeline + pipelineGrowth * (1 + m * 0.05));
    const newTrials = pipeline;
    const conversions = Math.round(newTrials * (conversionRate / 100));
    const newMRR = conversions * price;
    const churnedMRR = Math.round(totalMRR * (churnRate / 100));
    const netMRR = newMRR - churnedMRR;
    totalMRR = Math.max(0, totalMRR + netMRR);
    customers = Math.max(0, customers + conversions - Math.round(customers * (churnRate / 100)));

    const revenue = totalMRR;
    const supportCosts = customers * supportCost;
    const marketingSpend = conversions > 0 ? conversions * targetCAC : 0;
    const totalBurn = burnBase + supportCosts + marketingSpend;
    const grossMargin = revenue > 0 ? Math.round(((revenue - supportCosts) / revenue) * 100) : 0;
    cash = cash - totalBurn + revenue;
    const netBurn = Math.max(0, totalBurn - revenue);
    const runway = netBurn > 0 ? Math.floor(cash / netBurn) : 99;

    const ltv = churnRate > 0 ? Math.round(price / (churnRate / 100)) : price * 100;
    const cac = targetCAC;
    const ltvCacRatio = cac > 0 ? Math.round((ltv / cac) * 10) / 10 : 0;

    months.push({
      month: m,
      newTrials,
      conversions,
      newMRR,
      churnedMRR,
      netMRR,
      totalMRR,
      customers,
      cac,
      ltv,
      ltvCacRatio,
      grossMargin,
      burnRate: totalBurn,
      cash: Math.round(cash),
      runway,
      pipeline,
    });
  }

  return months;
}
