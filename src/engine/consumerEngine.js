// ═══════════════════════════════════════════════════════════════
// CONSUMER ENGINE — GlowUp (D2C)
// Different from SaaS: orders not subscriptions, viral growth,
// ad spend as primary lever, COGS per order, repeat rate.
// ═══════════════════════════════════════════════════════════════

import { applyVariance } from './varianceEngine.js';

/**
 * Advance GlowUp by one month.
 */
export function advanceConsumerMonth(state, classConfig) {
  const month = state.month + 1;
  const corridors = classConfig.corridors || {};

  // ─── Process pending delayed effects ───
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

  // ─── Reality corridor pulls ───
  const corridorRepeat = corridors.repeatRate || { min: 3, max: 30, center: 10 };
  const corridorCAC = corridors.cac || { min: 12, max: 60, center: 30 };
  const corridorViral = corridors.viralCoeff || { min: 0, max: 150, center: 15 };
  const corridorCOGS = corridors.cogs || { min: 8, max: 35, center: 14 };

  // Price sensitivity: premium AOV buys fewer customers per ad euro and
  // fewer reorders. Below the corridor centre there is no bonus beyond the
  // lower contribution margin — discounting is not a growth hack.
  const aovNow = s.aov ?? s.price ?? 35;
  const aovPremium = Math.max(0, aovNow - (corridors.aov?.center ?? 35));

  // Retention budget (board lever): CRM, packaging, onboarding, product work.
  // The only lever that improves repeat without buying more customers.
  const retentionSpend = Math.max(0, s.retentionSpend ?? 0);
  const retentionK = retentionSpend / 1000;

  // Repeat rate: drifts toward corridor center, product quality helps
  let repeatRate = s.repeatRate ?? 15;
  const repeatCenter = Math.max(corridorRepeat.min, corridorRepeat.center - aovPremium * 0.12);
  repeatRate = repeatRate * 0.85 + repeatCenter * 0.15;
  const productQuality = s.product ?? 35;
  if (productQuality > 50) repeatRate += (productQuality - 50) * 0.06;
  else if (productQuality < 30) repeatRate -= (30 - productQuality) * 0.05;
  repeatRate += Math.min(3, retentionK * 0.4);
  repeatRate = applyVariance(repeatRate * 10, 0.15) / 10;
  repeatRate = Math.max(corridorRepeat.min, Math.min(corridorRepeat.max, repeatRate));

  // CAC: drifts toward corridor center, rises with ad spend scale
  let actualCAC = s.cac ?? 25;
  const adSpend = s.adSpend ?? 5000;
  // Diminishing returns: more spend = higher CAC (aggressive)
  const spendScale = Math.max(1, adSpend / 5000);
  const cacCenterAdj = corridorCAC.center * Math.pow(spendScale, 0.5) * (1 + aovPremium * 0.025);
  actualCAC = actualCAC * 0.7 + cacCenterAdj * 0.3;
  actualCAC = applyVariance(actualCAC, 0.2);
  actualCAC = Math.max(corridorCAC.min, Math.min(corridorCAC.max, actualCAC));

  // Viral coefficient: drifts toward corridor, product quality boosts
  let viralCoeff = s.viralCoeff ?? 30; // x100
  viralCoeff = viralCoeff * 0.8 + corridorViral.center * 0.2;
  if (productQuality > 55) viralCoeff += (productQuality - 55) * 0.3;
  viralCoeff = applyVariance(viralCoeff, 0.2);
  viralCoeff = Math.max(0, Math.min(corridorViral.max, viralCoeff));

  // COGS: drifts toward corridor, scale reduces slightly
  let cogs = s.cogs ?? 12;
  cogs = cogs * 0.8 + corridorCOGS.center * 0.2;
  // Scale discount: more orders = slightly lower COGS
  const prevOrders = s.totalOrders ?? 0;
  if (prevOrders > 100) cogs = cogs * 0.98;
  if (prevOrders > 500) cogs = cogs * 0.97;
  cogs = Math.max(corridorCOGS.min, Math.min(corridorCOGS.max, cogs));

  // ─── Customer dynamics ───
  const activeCustomers = s.activeCustomers ?? s.customers ?? 200;

  // New paid customers from ads
  const newPaid = actualCAC > 0 ? Math.max(0, Math.round(adSpend / actualCAC)) : 0;

  // Organic/viral customers. Viral coefficient k = referred customers per
  // NEW customer (last month's cohort), not per active customer per month —
  // the old formula compounded the whole base every month and made growth
  // explode regardless of unit economics.
  const viralRate = viralCoeff / 100; // convert from x100
  const lastCohort = (s.newPaid ?? 0) + (s.newOrganic ?? 0);
  const newOrganic = Math.max(0, Math.round(lastCohort * viralRate));

  // Repeat orders from existing customers
  const repeatOrders = Math.max(0, Math.round(activeCustomers * (repeatRate / 100)));

  // Customer decay: customers who haven't ordered go dormant
  // D2C has aggressive decay — wellness products are impulse + habit
  const dormantRate = Math.max(0.08, 0.25 - (repeatRate / 100) * 0.6);
  const goneInactive = Math.round(activeCustomers * dormantRate);
  const newActive = Math.max(0, activeCustomers + newPaid + newOrganic - goneInactive);

  // Total orders this month
  const totalOrders = newPaid + newOrganic + repeatOrders;

  // ─── Revenue ───
  const aov = s.aov ?? s.price ?? 35;
  const revenue = totalOrders * aov;

  // ─── Costs ───
  const cogsTotal = Math.round(totalOrders * cogs);
  const fulfillment = Math.round(totalOrders * 3); // shipping/handling/returns per order
  const initialBurn = classConfig?.initial?.burnRate ?? 4000;
  const burnBase = Math.max(Math.round(initialBurn * 0.5), s.burnRate ?? initialBurn);
  // D2C reality: ad spend escalates as organic decays, platform costs creep up
  const platformFees = Math.round(revenue * 0.05); // payment processing, tools
  const totalBurn = burnBase + cogsTotal + fulfillment + adSpend + platformFees + retentionSpend;

  const cash = Math.round((s.cash ?? 80000) - totalBurn + revenue);
  const netBurn = Math.max(0, totalBurn - revenue);
  const runway = netBurn > 0 ? Math.floor(Math.max(0, cash) / netBurn) : 99;

  // ─── Unit economics ───
  const grossProfit = revenue - cogsTotal - fulfillment;
  const grossMargin = revenue > 0 ? Math.round(grossProfit / revenue * 100) : 0;
  // LTV on contribution, not revenue: what one customer leaves after COGS,
  // fulfillment and platform fees over their active lifetime.
  // Lifetime orders = first order + repeat rate × active months (1 / dormancy).
  const rr = repeatRate / 100;
  const contributionPerOrder = aov - cogs - 3 - aov * 0.05;
  const lifetimeOrders = 1 + rr / dormantRate;
  const ltv3 = Math.round(Math.max(0, contributionPerOrder * lifetimeOrders));
  const ltvCacRatio = actualCAC > 0 ? Math.round(ltv3 / actualCAC * 10) / 10 : 0;

  // Churn equivalent: 1 - repeat rate (for PMF compatibility)
  const churn = Math.round((1 - rr) * 1000) / 10;

  // ─── Product quality decay ───
  let product = Math.min(85, productQuality);
  if (month > 2) product = Math.max(10, product - 0.6);
  product = Math.min(85, product + retentionK * 0.6);

  // ─── Team budget effects (same as SaaS) ───
  const prevBurn = s.prevBurnRate ?? initialBurn;
  const burnDelta = burnBase - prevBurn;
  let teamMorale = s.teamMorale ?? 1.0;
  if (burnDelta < -500) {
    const cutSeverity = Math.abs(burnDelta / prevBurn);
    teamMorale = Math.max(0.3, teamMorale - cutSeverity * 1.5);
  } else if (burnDelta > 1000) {
    const growthRate = burnDelta / prevBurn;
    if (growthRate > 0.3) teamMorale = Math.max(0.5, teamMorale - 0.1);
    else teamMorale = Math.min(1.3, teamMorale + 0.05);
  } else {
    teamMorale = teamMorale + (1.0 - teamMorale) * 0.15;
  }

  // ─── Team morale effects ───
  // Product quality: low morale accelerates decay
  product = Math.max(10, product - (1 - teamMorale) * 1);
  // Conversion: morale shifts repeat rate
  repeatRate = Math.max(corridorRepeat.min, repeatRate + (teamMorale - 1.0) * 3);

  return {
    ...s,
    month,
    activeCustomers: newActive,
    customers: newActive,
    newPaid,
    newOrganic,
    repeatOrders,
    totalOrders,
    revenue,
    totalMRR: revenue,
    aov,
    cogs: Math.round(cogs * 10) / 10,
    adSpend,
    retentionSpend,
    repeatRate: Math.round(repeatRate * 10) / 10,
    viralCoeff: Math.round(viralCoeff),
    cac: Math.round(actualCAC),
    ltv: ltv3,
    ltvCacRatio,
    grossMargin,
    burnRate: burnBase,
    totalBurn,
    cash,
    runway,
    netBurn,
    churn: Math.round(churn * 10) / 10,
    product,
    price: aov,
    teamMorale,
    prevBurnRate: burnBase,
    pipeline: newPaid + newOrganic, // for event compatibility
    conversionRate: repeatRate, // for event compatibility
    salesEffort: s.salesEffort ?? 0,
  };
}

/**
 * Generate consumer forecast from assumptions.
 */
export function generateConsumerForecast(assumptions) {
  const { aov = 35, repeatRate = 15, targetCAC = 25, viralCoeff = 30, cogs = 12, adSpend = 5000 } = assumptions;
  const months = [];
  let active = 50, cash = 80000, lastCohort = 0;

  for (let m = 0; m <= 24; m++) {
    if (m === 0) {
      months.push({ month: 0, totalMRR: 0, revenue: 0, customers: 50, activeCustomers: 50, cash: 80000, totalOrders: 0, repeatRate, viralCoeff, cac: targetCAC, ltvCacRatio: 0, burnRate: 4000, runway: 20, churn: 100 - repeatRate });
      continue;
    }
    // Same mechanics as the engine, with the player's assumptions held fixed
    const newPaid = targetCAC > 0 ? Math.round(adSpend / targetCAC) : 0;
    const newOrg = Math.round(lastCohort * (viralCoeff / 100));
    lastCohort = newPaid + newOrg;
    const rr = repeatRate / 100;
    const dormantRate = Math.max(0.08, 0.25 - rr * 0.6);
    const repeat = Math.round(active * rr);
    const dormant = Math.round(active * dormantRate);
    active = Math.max(0, active + newPaid + newOrg - dormant);
    const orders = newPaid + newOrg + repeat;
    const rev = orders * aov;
    const cogsT = orders * cogs;
    const totalBurn = 3500 + cogsT + orders * 3 + Math.round(rev * 0.05) + adSpend;
    cash = Math.round(cash - totalBurn + rev);
    const contribution = aov - cogs - 3 - aov * 0.05;
    const ltv3 = Math.round(Math.max(0, contribution * (1 + rr / dormantRate)));
    const ltvCac = targetCAC > 0 ? Math.round(ltv3 / targetCAC * 10) / 10 : 0;

    months.push({
      month: m, totalMRR: rev, revenue: rev, customers: active, activeCustomers: active,
      cash, totalOrders: orders, repeatRate, viralCoeff, cac: targetCAC,
      ltv: ltv3, ltvCacRatio: ltvCac, burnRate: totalBurn, churn: Math.round((1 - rr) * 100),
      runway: (totalBurn - rev) > 0 ? Math.floor(Math.max(0, cash) / (totalBurn - rev)) : 99,
    });
  }
  return months;
}

/**
 * Calculate Consumer PMF score.
 * Components:
 * - Revenue traction → 30 points (€15K+/mo = max)
 * - Repeat rate → 25 points (22%+ = max)
 * - Viral coefficient → 20 points (0.4+ = max)
 * - LTV:CAC → 15 points (3+ = max)
 * - Product quality → 10 points
 */
export function calculateConsumerPMF(state) {
  const { revenue = 0, repeatRate = 0, viralCoeff = 0, ltvCacRatio = 0, product = 30 } = state;

  const revenueScore = Math.min(30, Math.round((Math.sqrt(revenue) / Math.sqrt(10000)) * 30));
  const repeatScore = Math.min(25, Math.round((Math.min(repeatRate, 22) / 22) * 25));
  const viralScore = Math.min(20, Math.round((Math.min(viralCoeff, 40) / 40) * 20)); // viralCoeff is x100
  const ltvCacScore = Math.min(15, Math.round((Math.min(ltvCacRatio, 3) / 3) * 15));
  const productScore = Math.min(10, Math.round(Math.max(0, product - 25) / 45 * 10));

  return Math.round(revenueScore + repeatScore + viralScore + ltvCacScore + productScore);
}
