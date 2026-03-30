// ═══════════════════════════════════════════════════════════════
// GAME ENGINE
// Core loop: month advancement, state transitions, end conditions.
//
// Design principles:
// - Reality corridors pull actuals toward realistic centers
// - Churn has a floor (SMB SaaS never hits 0%)
// - Pipeline grows from effort, decays without it
// - Burn has hidden costs that compound
// - Product quality drives retention
// ═══════════════════════════════════════════════════════════════

import { applyVariance, drawFromCorridor } from './varianceEngine.js';

/**
 * Advance the game by one month.
 * Calculates new financials based on current state + class model.
 */
export function advanceMonth(state, classConfig) {
  const month = state.month + 1;
  const corridors = classConfig.corridors || {};
  const fm = state.founderMods || {}; // founder attribute modifiers

  // ─── Reality corridor pulls ───
  // Each month, actual metrics drift toward their corridor center.
  // Player decisions shift these, but gravity pulls back.
  // Price sensitivity: higher prices increase churn and CAC corridors.

  const price = state.price ?? 0;
  const priceCenter = corridors.price?.center ?? 49;

  // ─── Non-linear price sensitivity ───
  // Restaurant owners have a mental budget for software.
  // Below ~€60: "sure, worth trying"
  // €60-€100: "need to think about it" (moderate friction)
  // €100-€150: "that's a real expense" (heavy friction)
  // Above €150: "no chance" (cliff — almost nobody converts)
  const priceThresholds = corridors.priceThresholds ?? { comfortable: 60, friction: 100, cliff: 150 };
  let pricePenalty = 0; // 0 = no penalty, scales up non-linearly
  if (price <= priceThresholds.comfortable) {
    pricePenalty = 0;
  } else if (price <= priceThresholds.friction) {
    // Linear ramp from 0 → 1 in the "friction" zone
    pricePenalty = (price - priceThresholds.comfortable) / (priceThresholds.friction - priceThresholds.comfortable);
  } else if (price <= priceThresholds.cliff) {
    // Accelerating from 1 → 4 in the "expensive" zone
    const t = (price - priceThresholds.friction) / (priceThresholds.cliff - priceThresholds.friction);
    pricePenalty = 1 + t * t * 3; // quadratic ramp: 1 → 4
  } else {
    // Above cliff: severe penalty (5+), conversion basically dies
    const overshoot = (price - priceThresholds.cliff) / priceThresholds.cliff;
    pricePenalty = 4 + overshoot * 10; // linear but steep above cliff
  }

  // Churn: floor at 3%, drifts toward corridor center
  const corridorChurn = corridors.churnRate || { min: 3, max: 20, center: 8 };
  // Price sensitivity: non-linear — pricePenalty drives churn center up
  const churnCenterAdj = corridorChurn.center + pricePenalty * 3;
  let actualChurn = state.churn ?? 5;
  // Drift toward adjusted corridor center (20% pull per month)
  actualChurn = actualChurn * 0.8 + churnCenterAdj * 0.2;
  // Product quality reduces churn (good product = lower churn)
  const productQuality = state.product ?? 30;
  // Product quality is the PRIMARY lever for churn
  if (productQuality > 50) {
    actualChurn -= (productQuality - 50) * 0.04; // max ~2pp reduction at product=100
  } else if (productQuality < 30) {
    actualChurn += (30 - productQuality) * 0.05; // worse product = more churn
  }
  // Apply monthly variance (±15%)
  actualChurn = applyVariance(actualChurn * 10, 0.15) / 10;
  // Floor: SMB SaaS never goes below 3% (restaurant owners churn)
  actualChurn = Math.max(3, Math.min(25, actualChurn));

  // CAC: drifts toward corridor center
  const corridorCAC = corridors.cac || { min: 50, max: 300, center: 140 };
  // Price sensitivity: higher price → higher CAC (harder to sell expensive stuff)
  // Price sensitivity: non-linear — above cliff, CAC explodes
  // Founder sales skill reduces CAC
  const cacCenterAdj = (corridorCAC.center + pricePenalty * 40) * (fm.cacMultiplier ?? 1);
  let actualCAC = state.cac ?? 80;
  actualCAC = actualCAC * 0.75 + cacCenterAdj * 0.25;
  actualCAC = applyVariance(actualCAC, 0.2);
  actualCAC = Math.max(corridorCAC.min, Math.min(corridorCAC.max, actualCAC));

  // Conversion rate: drifts toward corridor center
  const corridorConv = corridors.conversionRate || { min: 3, max: 25, center: 9 };
  // Price sensitivity: higher price → lower conversion
  // Price sensitivity: non-linear — above cliff, conversion collapses
  // Founder sales skill boosts conversion
  const convCenterAdj = Math.max(1, corridorConv.center - pricePenalty * 2.5 + (fm.conversionBonus ?? 0));
  let conversionRate = state.conversionRate ?? 15;
  conversionRate = conversionRate * 0.75 + convCenterAdj * 0.25;
  // Product quality improves conversion
  if (productQuality > 45) {
    conversionRate += (productQuality - 45) * 0.04; // up to +2.2pp at product=100
  }
  conversionRate = applyVariance(conversionRate * 10, 0.15) / 10;
  conversionRate = Math.max(corridorConv.min, Math.min(corridorConv.max, conversionRate));

  // ─── Pipeline ───
  // Pipeline grows from base growth + organic (existing customers as referrals)
  // Decays slightly without active marketing
  // Reality corridor pull: pipeline growth drifts toward realistic center
  const corridorPipe = corridors.pipelineGrowth || { min: 3, max: 40, center: 12 };
  const rawGrowth = state.pipelineGrowth ?? 12;
  // Pull growth toward corridor center (30% pull — optimistic pipeline gets punished)
  const baseGrowth = rawGrowth * 0.7 + corridorPipe.center * 0.3;
  const organicReferrals = Math.floor((state.customers ?? 0) * 0.03); // 3% of customers refer
  const pipelineDecay = 0.8; // 20% monthly decay without effort
  let pipeline = Math.round((state.pipeline ?? 12) * pipelineDecay + baseGrowth * 0.5 + organicReferrals);
  // Reality corridor pull on pipeline growth
  const corridorPipeline = corridors.pipelineGrowth || { min: 3, max: 40, center: 12 };
  const pipelineCap = corridorPipeline.max + Math.floor(month * 1.5); // slowly expanding ceiling
  pipeline = Math.min(pipeline, pipelineCap);
  pipeline = Math.max(2, pipeline);

  // Trials from pipeline (with variance)
  const newTrials = Math.max(0, applyVariance(Math.round(pipeline * 0.7), 0.2));
  const conversions = Math.max(0, Math.round(newTrials * (conversionRate / 100)));

  // Customer churn (compounds!)
  const prevCustomers = state.customers ?? 0;
  const churned = Math.max(0, Math.round(prevCustomers * (actualChurn / 100)));
  const customers = Math.max(0, prevCustomers + conversions - churned);

  // MRR
  const newMRR = conversions * price;
  const churnedMRR = Math.round((state.totalMRR ?? 0) * (actualChurn / 100));
  const totalMRR = Math.max(0, (state.totalMRR ?? 0) + newMRR - churnedMRR);
  const revenue = totalMRR;

  // ─── Costs ───
  const supportCosts = customers * (state.supportCost ?? 5);
  const burnBase = state.burnRate ?? 8000;
  // Infrastructure scales with customers
  const infraCost = Math.round(customers * 3 + Math.max(0, customers - 20) * 2);
  // Misc costs creep up (legal, tools, subscriptions, compliance)
  const miscCreep = month > 2 ? Math.round(month * 50) : 0;
  // Marketing spend (needed to maintain pipeline)
  const marketingSpend = Math.round(baseGrowth * actualCAC * 0.25);
  const totalBurn = burnBase + supportCosts + infraCost + miscCreep + marketingSpend;

  const cash = Math.round((state.cash ?? 100000) - totalBurn + revenue);
  const netBurn = Math.max(0, totalBurn - revenue);
  const runway = netBurn > 0 ? Math.floor(Math.max(0, cash) / netBurn) : 99;

  // ─── Unit economics ───
  const ltv = actualChurn > 0 ? Math.round(price / (actualChurn / 100)) : price * 100;
  const ltvCacRatio = actualCAC > 0 ? Math.round((ltv / actualCAC) * 10) / 10 : 0;
  const grossMargin = revenue > 0 ? Math.round(((revenue - supportCosts - infraCost) / revenue) * 100) : 0;

  // ─── Product quality natural decay ───
  // Without active investment, product quality slowly degrades (tech debt, market moves)
  // Capped at 85 — you can't reach 100 without extraordinary sustained investment
  let product = Math.min(85, productQuality);
  if (month > 2) {
    product = Math.max(10, product - 0.8); // decay accelerates slightly
  }

  // ─── Founder attribute bonuses ───
  // Domain skill narrows corridor pulls (more accurate assumptions hold longer)
  // This is applied retroactively as a slight resistance to corridor pull
  // Late-game bonus for diverse founders (documented higher returns after month 12)
  if (fm.lateGameBonus && month >= 12) {
    pipeline = Math.round(pipeline * 1.05); // 5% growth bonus
    product = Math.min(85, product + 0.3); // slight product quality boost
  }
  // Part-time penalty (working class, first 6 months)
  if (fm.partTime && month <= (fm.partTimeMonths ?? 6)) {
    product = Math.max(10, product - 0.5); // less time = slower product development
  }

  return {
    ...state,
    month,
    pipeline,
    pipelineGrowth: baseGrowth,
    newTrials,
    conversions,
    customers,
    churned,
    newMRR,
    churnedMRR,
    totalMRR,
    revenue,
    supportCosts,
    burnRate: burnBase,
    totalBurn,
    marketingSpend,
    cash,
    runway,
    netBurn,
    ltv,
    ltvCacRatio,
    grossMargin,
    price,
    cac: Math.round(actualCAC),
    churn: Math.round(actualChurn * 10) / 10,
    conversionRate: Math.round(conversionRate * 10) / 10,
    product,
  };
}

/**
 * Check end conditions.
 * Returns null (game continues), 'dead', 'pmf', or 'survived'.
 */
export function checkEndCondition(state, history, maxMonths = 24) {
  // Death: cash ≤ 0
  if (state.cash <= 0) return 'dead';

  // Win: PMF threshold met for 3 consecutive months
  if (history.length >= 4) { // need at least 4 entries (M0 + 3 months)
    const last3 = history.slice(-3);
    const allAbove = last3.every(s => (s.pmf ?? 0) >= 75);
    if (allAbove) return 'pmf';
  }

  // Time limit
  if (state.month >= maxMonths) return 'survived';

  return null;
}

/**
 * Get available events for a given month.
 */
export function getAvailableEvents(events, month, usedEventIds) {
  return events.filter(e => {
    if (!e.months.includes(month)) return false;
    if (e.repeatable) {
      // Repeatable events can fire again, but not within 3 months of last use
      const lastUseMonth = usedEventIds
        .filter(uid => uid.startsWith(e.id + '_'))
        .map(uid => parseInt(uid.split('_')[1]) || 0)
        .sort((a, b) => b - a)[0];
      return !lastUseMonth || (month - lastUseMonth) >= 3;
    }
    return !usedEventIds.includes(e.id);
  });
}

/**
 * Pick a random element from an array.
 */
export function pickRandom(arr) {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
}
