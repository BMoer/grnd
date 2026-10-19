// ═══════════════════════════════════════════════════════════════
// MARKETPLACE ENGINE — SwapCircle
// Two-sided: supply + demand. Cold start. Liquidity is king.
// Revenue = GMV × take rate. Death = liquidity death spiral.
// ═══════════════════════════════════════════════════════════════

import { applyVariance } from './varianceEngine.js';

const REQUESTS_PER_BUYER = 0.8; // requests per active buyer per month
const JOBS_PER_PROVIDER = 2.5; // jobs one provider can take per month
const SUPPLY_DEPTH = 300; // providers needed before buyers reliably find a match

export function advanceMarketplaceMonth(state, classConfig) {
  const month = state.month + 1;
  const corridors = classConfig.corridors || {};

  // ─── Pending effects ───
  const pending = state.pendingEffects ?? [];
  const due = pending.filter(e => e.month <= month);
  const remaining = pending.filter(e => e.month > month);
  let s = { ...state, pendingEffects: remaining };
  for (const effect of due) {
    for (const [key, val] of Object.entries(effect.changes)) {
      if (typeof val === 'number' && typeof s[key] === 'number') s = { ...s, [key]: s[key] + val };
      else s = { ...s, [key]: val };
    }
  }

  const productQuality = s.product ?? 25;

  // ─── Reality corridor pulls ───
  const cSupplyChurn = corridors.supplyChurn || { center: 15 };
  const cDemandChurn = corridors.demandChurn || { center: 18 };
  const cMatchRate = corridors.matchRate || { center: 10 };
  const cSupplyCAC = corridors.supplyCAC || { center: 50 };
  const cDemandCAC = corridors.demandCAC || { center: 40 };

  // Take rate: above ~10% the supply side starts to leave or deal around you
  const takeRate = Math.max(0, Math.min(30, s.takeRate ?? 10));
  const takePressure = Math.max(0, takeRate - 10);

  // Supply churn: drifts to corridor, liquidity reduces churn
  let supplyChurn = s.supplyChurn ?? 12;
  supplyChurn = supplyChurn * 0.7 + (cSupplyChurn.center + takePressure * 0.6) * 0.3;
  const prevLiquidity = s.liquidity ?? 0;
  if (prevLiquidity > 30) supplyChurn -= (prevLiquidity - 30) * 0.1; // good liquidity retains
  // Idle supply leaves: providers who get no work stop showing up
  if ((s.supplyUtilization ?? 0.5) < 0.25) supplyChurn += 6;
  if (productQuality > 45) supplyChurn -= (productQuality - 45) * 0.05;
  supplyChurn = applyVariance(supplyChurn * 10, 0.2) / 10;
  supplyChurn = Math.max(3, Math.min(30, supplyChurn));

  // Demand churn: same logic, slightly higher
  let demandChurn = s.demandChurn ?? 15;
  demandChurn = demandChurn * 0.7 + cDemandChurn.center * 0.3;
  if (prevLiquidity > 30) demandChurn -= (prevLiquidity - 30) * 0.12;
  else if (prevLiquidity < 40) demandChurn += (40 - prevLiquidity) * 0.3; // empty shelves: buyers leave
  if (productQuality > 45) demandChurn -= (productQuality - 45) * 0.05;
  demandChurn = applyVariance(demandChurn * 10, 0.2) / 10;
  demandChurn = Math.max(3, Math.min(30, demandChurn));

  // Match rate: THE key metric. Depends on product quality + ratio balance
  let matchRate = s.matchRate ?? 15;
  matchRate = matchRate * 0.75 + cMatchRate.center * 0.25; // moderate pull to reality
  if (productQuality > 40) matchRate += (productQuality - 40) * 0.08;
  // Balance bonus: closer supply/demand ratio = better matching
  const prevSupply = s.supply ?? 15;
  const prevDemand = s.demand ?? 8;
  const ratio = prevSupply > 0 && prevDemand > 0 ? Math.min(prevSupply, prevDemand) / Math.max(prevSupply, prevDemand) : 0;
  matchRate += ratio * 5; // balanced sides = up to +5pp
  matchRate = applyVariance(matchRate * 10, 0.25) / 10;
  matchRate = Math.max(2, Math.min(40, matchRate));

  // CAC: drift toward corridor
  let supplyCAC = s.supplyCAC ?? 40;
  supplyCAC = supplyCAC * 0.7 + cSupplyCAC.center * 0.3;
  supplyCAC = applyVariance(supplyCAC, 0.2);
  supplyCAC = Math.max(10, Math.min(150, supplyCAC));

  let demandCAC = s.demandCAC ?? 30;
  demandCAC = demandCAC * 0.7 + cDemandCAC.center * 0.3;
  demandCAC = applyVariance(demandCAC, 0.2);
  demandCAC = Math.max(10, Math.min(120, demandCAC));

  // ─── User dynamics ───
  // Marketing budget split between supply and demand
  const mktBudget = s.adSpend ?? Math.round((s.burnRate ?? 2000) * 0.3);
  const supplySplit = Math.max(0.1, Math.min(0.9, s.supplySplit ?? 0.5)); // board lever
  const newSupply = Math.max(0, Math.round((mktBudget * supplySplit) / supplyCAC));
  const newDemand = Math.max(0, Math.round((mktBudget * (1 - supplySplit)) / demandCAC));

  // Network effects: completed transactions bring new users (word of mouth).
  // Proportional to activity, not to the user base — an empty marketplace
  // does not grow by itself.
  const prevTx = s.transactions ?? 0;
  const wom = prevLiquidity >= 50 ? 1 : prevLiquidity >= 35 ? 0.5 : 0.1;
  const organicSupply = Math.round(prevTx * 0.12 * wom);
  const organicDemand = Math.round(prevTx * 0.3 * wom);

  const churnedSupply = Math.round(prevSupply * (supplyChurn / 100));
  const churnedDemand = Math.round(prevDemand * (demandChurn / 100));

  const supply = Math.max(0, prevSupply + newSupply + organicSupply - churnedSupply);
  const demand = Math.max(0, prevDemand + newDemand + organicDemand - churnedDemand);

  // ─── Matching & Transactions ───
  // Demand posts requests; supply can serve a limited number per month.
  // Liquidity = share of requests that end in a match (fill rate × match
  // quality). Too little supply → requests go unanswered; too much supply
  // → providers sit idle and churn.
  const requests = demand * REQUESTS_PER_BUYER;
  const supplyCapacity = supply * JOBS_PER_PROVIDER;
  const fillRate = requests > 0 ? Math.min(1, supplyCapacity / requests) : 0;
  // Cold start: buyers only find the right skill if the supply side is deep
  // enough. Depth saturates around SUPPLY_DEPTH providers.
  const depth = Math.min(1, supply / SUPPLY_DEPTH);
  const matchQuality = (0.15 + 0.75 * Math.pow(depth, 0.7)) * (0.6 + Math.min(40, matchRate) / 40 * 0.5);
  const matches = Math.max(0, Math.round(requests * fillRate * matchQuality));
  const completionRate = 0.7 + productQuality * 0.003; // 70-95% completion
  const transactions = Math.max(0, Math.round(matches * completionRate));
  const supplyUtilization = supplyCapacity > 0 ? transactions / supplyCapacity : 0;

  const avgTransaction = s.avgTransaction ?? 300;
  const gmv = transactions * avgTransaction;
  // Leakage: high take rates push users to settle off-platform
  const leakage = Math.min(0.5, takePressure * 0.02);
  const revenue = Math.round(gmv * (1 - leakage) * (takeRate / 100));

  const totalActive = supply + demand;
  const liquidity = Math.min(100, Math.round(fillRate * matchQuality * 100));

  // ─── Costs ───
  const initialBurn = classConfig?.initial?.burnRate ?? 3000;
  const burnBase = Math.max(Math.round(initialBurn * 0.5), s.burnRate ?? initialBurn);
  const infraCost = Math.round(totalActive * 0.5); // per-user infra (lean platform)
  const supportCost = Math.round(transactions * 5); // per-transaction support
  const miscCreep = month > 3 ? Math.round(month * 10) : 0;
  const totalBurn = burnBase + mktBudget + infraCost + supportCost + miscCreep;

  const cash = Math.round((s.cash ?? 50000) - totalBurn + revenue);
  const netBurn = Math.max(0, totalBurn - revenue);
  const runway = netBurn > 0 ? Math.floor(Math.max(0, cash) / netBurn) : 99;

  // ─── Unit economics ───
  const avgCAC = (supplyCAC + demandCAC) / 2;
  const ltv = takeRate > 0 && avgTransaction > 0 ? Math.round(avgTransaction * (takeRate / 100) * 3) : 0; // 3 transactions lifetime estimate
  const ltvCacRatio = avgCAC > 0 ? Math.round(ltv / avgCAC * 10) / 10 : 0;
  const grossMargin = revenue > 0 ? Math.round((revenue - supportCost - infraCost) / revenue * 100) : 0;

  // Churn for compatibility: average of both sides
  const churn = Math.round((supplyChurn + demandChurn) / 2 * 10) / 10;

  // ─── Product decay ───
  let product = Math.min(85, productQuality);
  if (month > 2) product = Math.max(10, product - 0.5);

  // ─── Team morale ───
  const prevBurnRate = s.prevBurnRate ?? initialBurn;
  const burnDelta = burnBase - prevBurnRate;
  let teamMorale = s.teamMorale ?? 1.0;
  if (burnDelta < -500) teamMorale = Math.max(0.3, teamMorale - Math.abs(burnDelta / prevBurnRate) * 1.5);
  else if (burnDelta > 1000 && burnDelta / prevBurnRate > 0.3) teamMorale = Math.max(0.5, teamMorale - 0.1);
  else teamMorale = teamMorale + (1.0 - teamMorale) * 0.15;

  // ─── Team morale effects ───
  // Product quality: low morale accelerates decay
  product = Math.max(10, product - (1 - teamMorale) * 1);
  // Match rate: morale affects platform quality → matching
  matchRate = Math.max(2, matchRate + (teamMorale - 1.0) * 3);

  return {
    ...s, month, supply, demand,
    // Previous month's sides, needed for the PMF growth score (was never
    // stored before, so the growth component always scored 0)
    prevSupply, prevDemand,
    customers: supply + demand, activeCustomers: supply + demand,
    matches, transactions, gmv, revenue, totalMRR: revenue,
    liquidity, takeRate, avgTransaction, supplyUtilization, supplySplit, fillRate,
    supplyChurn: Math.round(supplyChurn * 10) / 10,
    demandChurn: Math.round(demandChurn * 10) / 10,
    matchRate: Math.round(matchRate * 10) / 10,
    supplyCAC: Math.round(supplyCAC), demandCAC: Math.round(demandCAC),
    cac: Math.round(avgCAC), ltv, ltvCacRatio, grossMargin,
    burnRate: burnBase, totalBurn, cash, runway, netBurn,
    churn, product, price: avgTransaction,
    teamMorale, prevBurnRate: burnBase,
    pipeline: newSupply + newDemand,
    conversionRate: matchRate,
    repeatRate: Math.round(completionRate * 100),
    viralCoeff: Math.round((organicSupply + organicDemand) * 100 / Math.max(1, totalActive)),
    salesEffort: Math.max(0, (s.salesEffort ?? 0) - 0.2),
    adSpend: mktBudget, supportCost: supportCost,
  };
}

export function generateMarketplaceForecast(assumptions) {
  const { takeRate = 10, avgTransaction = 300, supplyCAC = 40, demandCAC = 30, supplyChurn = 12, demandChurn = 15, matchRate = 15 } = assumptions;
  const months = [];
  let sup = 15, dem = 8, cash = 100000;
  const mktBudget = 1500;
  let txnPrev = 2, burnBase = 1200;

  for (let m = 0; m <= 24; m++) {
    if (m === 0) {
      months.push({ month: 0, supply: 15, demand: 8, customers: 23, cash: 100000, matches: 0, transactions: 2, gmv: 600, revenue: 60, totalMRR: 60, liquidity: 0, burnRate: 1200, totalBurn: 2700, runway: 37, churn: (supplyChurn + demandChurn) / 2, ltvCacRatio: 0, cac: (supplyCAC + demandCAC) / 2 });
      continue;
    }
    // Same matching mechanics as the engine, assumptions held fixed
    if (m === 7) burnBase += 2300; // founders go full-time
    const ns = Math.round((mktBudget * 0.5) / supplyCAC) + Math.round(txnPrev * 0.06);
    const nd = Math.round((mktBudget * 0.5) / demandCAC) + Math.round(txnPrev * 0.15);
    sup = Math.max(0, sup + ns - Math.round(sup * supplyChurn / 100));
    dem = Math.max(0, dem + nd - Math.round(dem * demandChurn / 100));
    const requests = dem * REQUESTS_PER_BUYER;
    const fill = requests > 0 ? Math.min(1, (sup * JOBS_PER_PROVIDER) / requests) : 0;
    const depth = Math.min(1, sup / SUPPLY_DEPTH);
    const quality = (0.15 + 0.75 * Math.pow(depth, 0.7)) * (0.6 + Math.min(40, matchRate) / 40 * 0.5);
    const mat = Math.round(requests * fill * quality);
    const txn = Math.round(mat * 0.8);
    txnPrev = txn;
    const gmv = txn * avgTransaction;
    const rev = Math.round(gmv * takeRate / 100);
    const burn = burnBase + mktBudget + (sup + dem) * 0.5 + txn * 5 + (m > 3 ? m * 10 : 0);
    cash = Math.round(cash - burn + rev);
    months.push({
      month: m, supply: sup, demand: dem, customers: sup + dem, cash,
      matches: mat, transactions: txn, gmv, revenue: rev, totalMRR: rev,
      liquidity: Math.min(100, Math.round(fill * quality * 100)),
      burnRate: burnBase, totalBurn: Math.round(burn), runway: (burn - rev) > 0 ? Math.floor(Math.max(0, cash) / (burn - rev)) : 99,
      churn: (supplyChurn + demandChurn) / 2, ltvCacRatio: 0, cac: (supplyCAC + demandCAC) / 2,
    });
  }
  return months;
}

/**
 * Marketplace PMF:
 * - Liquidity (fill rate × match quality) → 30 points (50%+ = max)
 * - Revenue → 25 points (€10K+/mo = max)
 * - Supply growth → 15 points (both sides growing)
 * - Match rate → 15 points (25%+ = max)
 * - Product quality → 15 points
 */
export function calculateMarketplacePMF(state) {
  const { liquidity = 0, revenue = 0, supply = 0, demand = 0, matchRate = 0, product = 25 } = state;
  const prevSupply = state.prevSupply ?? supply;
  const prevDemand = state.prevDemand ?? demand;

  const liquidityScore = Math.min(30, Math.round(Math.min(liquidity, 50) / 50 * 30));
  const revenueScore = Math.min(25, Math.round((Math.sqrt(revenue) / Math.sqrt(10000)) * 25));
  const growthScore = (supply > prevSupply && demand > prevDemand) ? 15 : (supply > prevSupply || demand > prevDemand) ? 8 : 0;
  const matchScore = Math.min(15, Math.round(Math.min(matchRate, 25) / 25 * 15));
  const productScore = Math.min(15, Math.round(Math.max(0, product - 20) / 50 * 15));

  return Math.round(liquidityScore + revenueScore + growthScore + matchScore + productScore);
}
