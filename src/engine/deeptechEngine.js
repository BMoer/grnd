// ═══════════════════════════════════════════════════════════════
// DEEP-TECH ENGINE — NanoSense
// No revenue for months. Grant-funded. Certification is the gate.
// LOIs replace customers. R&D milestones drive progress.
// ═══════════════════════════════════════════════════════════════

import { applyVariance } from './varianceEngine.js';

export function advanceDeepTechMonth(state, classConfig) {
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

  // ─── Certification progress ───
  // Advances based on R&D spend and product quality
  // Can be set back by events (regulatory changes, test failures)
  const certTimeline = s.certTimeline ?? 12;
  let certProgress = s.certProgress ?? 0;
  const product = s.product ?? 20;

  if (!s.certComplete) {
    // Monthly progress = base progress + product quality bonus
    const baseProgress = 100 / certTimeline; // linear baseline
    const qualityBonus = product > 50 ? (product - 50) * 0.03 : 0;
    let monthlyProgress = baseProgress * 0.6 + qualityBonus; // only 60% of linear
    // High variance: certification is unpredictable
    monthlyProgress = applyVariance(monthlyProgress * 10, 0.4) / 10;
    // Corridor pull: certification drifts toward realistic (slower) center
    const corridorCert = corridors.certTimeline || { center: 14 };
    const realProgress = 100 / corridorCert.center;
    monthlyProgress = monthlyProgress * 0.5 + realProgress * 0.5;
    // Can stall completely some months (bureaucracy)
    if (Math.random() < 0.15) monthlyProgress = Math.max(0, monthlyProgress * 0.3);
    certProgress = Math.min(100, certProgress + Math.max(0, monthlyProgress));
  }
  const certComplete = certProgress >= 100;
  const justCertified = certComplete && !s.certComplete;

  // ─── LOIs and pilot conversations ───
  let lois = s.lois ?? 0;
  let pilotConversations = s.pilotConversations ?? 0;
  const corridorPipeline = corridors.pilotPipeline || { center: 3 };

  // Pipeline: drift toward corridor, product quality helps
  let pipeline = s.pipeline ?? 3;
  pipeline = pipeline * 0.8 + corridorPipeline.center * 0.2;
  if (product > 50) pipeline += 0.3;
  if (s.salesEffort > 0) pipeline += s.salesEffort * 2;
  pipeline = Math.max(1, Math.min(10, Math.round(pipeline)));

  // New conversations each month (slow in deep-tech)
  const newConversations = month <= 3 ? 0 : Math.max(0, applyVariance(Math.round(pipeline * 0.3), 0.3));
  pilotConversations += newConversations;

  // LOI conversion: very slow in deep-tech. Companies need internal approvals.
  const loiConversion = certProgress > 70 ? 0.10 : certProgress > 40 ? 0.05 : 0.02;
  const newLOIs = Math.max(0, Math.round(pilotConversations * loiConversion * (Math.random() > 0.5 ? 1 : 0)));
  lois += newLOIs;
  // Consumed conversations don't generate more LOIs
  if (newLOIs > 0) pilotConversations = Math.max(0, pilotConversations - newLOIs * 2);

  // ─── Revenue (only post-certification + LOI conversion) ───
  let unitsSold = s.unitsSold ?? 0;
  let customers = s.customers ?? 0;
  let revenue = 0;
  const unitPrice = s.unitPrice ?? 2000;
  const unitCost = s.unitCost ?? 500;

  if (certComplete && lois > 0) {
    // Convert LOIs to sales (slow: 1-2 per month max, not all convert)
    const conversions = Math.min(lois, Math.max(0, applyVariance(1, 0.5)));
    if (conversions > 0) {
      unitsSold += conversions;
      customers += conversions;
      lois = Math.max(0, lois - conversions);
      revenue = conversions * unitPrice;
    }
  }

  // ─── Costs ───
  const rdBurn = s.rdBurn ?? 15000;
  const corridorRD = corridors.rdBurn || { center: 16000 };
  // R&D burn drifts toward corridor center
  const actualRDBurn = Math.round(rdBurn * 0.85 + corridorRD.center * 0.15);
  const teamCost = 3000; // base team cost beyond R&D
  const labEquipment = Math.round(month * 400); // equipment + lab rental costs creep
  const totalBurn = actualRDBurn + teamCost + labEquipment;

  // Grant drawdown
  let grantRemaining = s.grantRemaining ?? 300000;
  const grantDrawdown = Math.min(grantRemaining, totalBurn);
  grantRemaining = Math.max(0, grantRemaining - grantDrawdown);
  const outOfPocket = totalBurn - grantDrawdown; // costs not covered by grant

  const cash = Math.round((s.cash ?? 300000) - outOfPocket + revenue);
  const netBurn = Math.max(0, outOfPocket - revenue);
  const runway = netBurn > 0 ? Math.floor(Math.max(0, cash) / netBurn) : grantRemaining > 0 ? Math.floor(grantRemaining / totalBurn) + Math.floor(cash / totalBurn) : 99;

  // ─── Product quality (TRL advancement) ───
  let productQuality = Math.min(85, product);
  // TRL advances with R&D spend (each €15K/mo = baseline progress)
  const rdEfficiency = actualRDBurn / 15000;
  productQuality = Math.min(85, productQuality + rdEfficiency * 1.5);
  // Natural decay is slower for deep-tech (science doesn't rot as fast)
  if (month > 4) productQuality = Math.max(10, productQuality - 0.3);

  // Prototype stage (TRL)
  let prototypeStage = s.prototypeStage ?? 4;
  if (productQuality > 60 && certProgress > 80) prototypeStage = 7; // production-ready
  else if (productQuality > 50 && certProgress > 50) prototypeStage = 6; // pilot-ready
  else if (productQuality > 35) prototypeStage = 5; // validated in relevant environment

  // Unit economics
  const grossMargin = revenue > 0 ? Math.round((revenue - unitsSold * unitCost) / revenue * 100) : 0;
  // LTV for deep-tech: unit price (one-time) + potential service revenue
  const ltv = unitPrice;
  // CAC for deep-tech: total cost to acquire one customer (very high early)
  const totalSalesCost = (s.salesEffort ?? 0) > 0 ? 5000 : 0;
  const cac = customers > 0 ? Math.round(totalSalesCost / customers) : 0;
  const ltvCacRatio = cac > 0 ? Math.round(ltv / cac * 10) / 10 : 0;
  // Churn equivalent: deep-tech doesn't have traditional churn
  const churn = 0;
  const totalMRR = revenue; // for compatibility

  // ─── Team budget effects ───
  const prevBurn = s.prevBurnRate ?? rdBurn;
  const burnDelta = actualRDBurn - prevBurn;
  let teamMorale = s.teamMorale ?? 1.0;
  if (burnDelta < -2000) teamMorale = Math.max(0.3, teamMorale - 0.2);
  else if (burnDelta > 3000) teamMorale = Math.max(0.5, teamMorale - 0.1);
  else teamMorale = teamMorale + (1.0 - teamMorale) * 0.1;

  // ─── Team morale effects ───
  // Product quality (TRL): low morale slows R&D progress
  productQuality = Math.max(10, productQuality - (1 - teamMorale) * 1);
  // Pipeline: morale affects pilot conversations
  const moralePipelineMult = 0.85 + teamMorale * 0.15;
  pipeline = Math.max(1, Math.round(pipeline * moralePipelineMult));

  // IP filings
  const ipFilings = (s.ipFilings ?? 0) + (productQuality > 45 && month % 6 === 0 ? 1 : 0);

  return {
    ...s,
    month,
    certProgress: Math.round(certProgress * 10) / 10,
    certComplete,
    justCertified,
    lois,
    pilotConversations,
    pipeline,
    customers,
    activeCustomers: customers,
    unitsSold,
    unitCost,
    unitPrice,
    revenue,
    totalMRR: revenue,
    rdBurn: actualRDBurn,
    burnRate: actualRDBurn,
    totalBurn,
    grantRemaining,
    cash,
    runway: Math.min(runway, 99),
    netBurn,
    product: Math.round(productQuality * 10) / 10,
    prototypeStage,
    grossMargin,
    ltv,
    cac,
    ltvCacRatio,
    churn,
    price: unitPrice,
    repeatRate: 0,
    viralCoeff: 0,
    ipFilings,
    teamMorale,
    prevBurnRate: actualRDBurn,
    conversionRate: Math.round(loiConversion * 100),
    salesEffort: Math.max(0, (s.salesEffort ?? 0) - 0.2),
    aov: unitPrice,
    adSpend: 0,
    supportCost: 0,
  };
}

export function generateDeepTechForecast(assumptions) {
  const { unitCost = 500, unitPrice = 2000, certTimeline = 12, pilotPipeline = 3, rdBurn = 15000, grantRunway = 20 } = assumptions;
  const months = [];
  let cash = 300000, grantRem = 300000, cert = 0, lois = 0, product = 20, sold = 0;

  for (let m = 0; m <= 24; m++) {
    if (m === 0) {
      months.push({ month: 0, cash: 300000, grantRemaining: 300000, certProgress: 0, lois: 0, unitsSold: 0, revenue: 0, totalMRR: 0, burnRate: rdBurn, runway: grantRunway, product: 20, customers: 0, churn: 0, ltvCacRatio: 0, cac: 0, totalBurn: rdBurn + 3000 });
      continue;
    }
    const progress = 100 / certTimeline;
    cert = Math.min(100, cert + progress);
    product = Math.min(85, product + 1.5);
    if (m > 3) lois += Math.round(pilotPipeline * 0.1);

    const totalBurn = rdBurn + 3000 + m * 200;
    const draw = Math.min(grantRem, totalBurn);
    grantRem = Math.max(0, grantRem - draw);
    const oopCost = totalBurn - draw;

    let rev = 0;
    if (cert >= 100 && lois > 0) { sold++; lois--; rev = unitPrice; }
    cash = Math.round(cash - oopCost + rev);
    const netBurn = Math.max(0, oopCost - rev);
    const runway = netBurn > 0 ? Math.floor(Math.max(0, cash) / netBurn) : grantRem > 0 ? Math.floor(grantRem / totalBurn) + Math.floor(cash / totalBurn) : 99;

    months.push({
      month: m, cash, grantRemaining: grantRem, certProgress: Math.round(cert),
      lois, unitsSold: sold, revenue: rev, totalMRR: rev, burnRate: rdBurn,
      totalBurn, runway: Math.min(runway, 99), product: Math.round(product),
      customers: sold, churn: 0, ltvCacRatio: 0, cac: 0,
    });
  }
  return months;
}

/**
 * Deep-Tech PMF Score:
 * - Certification progress → 30 points
 * - LOIs signed → 25 points (3+ = max)
 * - Units sold → 20 points (3+ = max, only post-cert)
 * - Product quality (TRL) → 15 points
 * - IP filings → 10 points (2+ = max)
 */
export function calculateDeepTechPMF(state) {
  const { certProgress = 0, lois = 0, unitsSold = 0, product = 20, ipFilings = 0 } = state;

  // Sales weight is high — you can't reach PMF without commercial traction
  const certScore = Math.min(25, Math.round(certProgress / 100 * 25));
  const loiScore = Math.min(20, Math.round(Math.min(lois, 5) / 5 * 20));
  const salesScore = Math.min(25, Math.round(Math.min(unitsSold, 5) / 5 * 25)); // 5 units sold = max
  const productScore = Math.min(15, Math.round(Math.max(0, product - 20) / 55 * 15));
  const ipScore = Math.min(15, Math.round(Math.min(ipFilings, 2) / 2 * 15));

  return Math.round(certScore + loiScore + salesScore + productScore + ipScore);
}
