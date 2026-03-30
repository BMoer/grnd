// ═══════════════════════════════════════════════════════════════
// FORECAST ENGINE
// Generates a 24-month forecast from player assumptions.
// This is the "plan" line — what the player THINKS will happen.
//
// The forecast uses the PLAYER'S assumptions directly (no corridors,
// no variance). This creates the gap between plan and reality.
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
  const burnBase = 7000; // match initial burn in saas.js
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
        ltv: churnRate > 0 ? Math.round(price / (churnRate / 100)) : price * 100,
        ltvCacRatio: churnRate > 0 ? Math.round((price / (churnRate / 100)) / targetCAC * 10) / 10 : 0,
        grossMargin: 0,
        burnRate: burnBase,
        cash: 100000,
        runway: Math.floor(100000 / burnBase),
        pipeline: 12,
      });
      continue;
    }

    // Pipeline: match game engine logic (80% decay + 50% of growth + organic)
    const organicReferrals = Math.floor(customers * 0.03);
    pipeline = Math.round(pipeline * 0.8 + pipelineGrowth * 0.5 + organicReferrals);
    pipeline = Math.max(2, pipeline);

    // Trials and conversions: match game engine (70% of pipeline → trials)
    const newTrials = Math.round(pipeline * 0.7);
    const conversions = Math.round(newTrials * (conversionRate / 100));
    
    // Customers (churn applied)
    const churned = Math.round(customers * (churnRate / 100));
    customers = Math.max(0, customers + conversions - churned);

    // MRR
    const newMRR = conversions * price;
    const churnedMRR = Math.round(totalMRR * (churnRate / 100));
    const netMRR = newMRR - churnedMRR;
    totalMRR = Math.max(0, totalMRR + netMRR);
    const revenue = totalMRR;

    // Costs: match game engine structure
    const supportCosts = customers * supportCost;
    const infraCost = Math.round(customers * 3 + Math.max(0, customers - 20) * 2);
    const miscCreep = m > 2 ? Math.round(m * 50) : 0;
    const marketingSpend = Math.round(pipelineGrowth * targetCAC * 0.25);
    const totalBurn = burnBase + supportCosts + infraCost + miscCreep + marketingSpend;

    const grossMargin = revenue > 0 ? Math.round(((revenue - supportCosts - infraCost) / revenue) * 100) : 0;
    cash = Math.round(cash - totalBurn + revenue);
    const netBurn = Math.max(0, totalBurn - revenue);
    const runway = netBurn > 0 ? Math.floor(Math.max(0, cash) / netBurn) : 99;

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
      cash,
      runway,
      pipeline,
      churn: churnRate,
    });
  }

  return months;
}
