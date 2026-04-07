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

import { applyVariance } from './varianceEngine.js';

/**
 * Advance the game by one month.
 * Calculates new financials based on current state + class model.
 */
export function advanceMonth(state, classConfig) {
  const month = state.month + 1;
  const corridors = classConfig.corridors || {};
  const fm = state.founderMods || {};

  // ─── Process pending delayed effects ───
  const pending = state.pendingEffects ?? [];
  const due = pending.filter(e => e.month <= month);
  const remaining = pending.filter(e => e.month > month);
  // Merge due effects into state for this month
  for (const effect of due) {
    for (const [key, val] of Object.entries(effect.changes)) {
      if (typeof val === 'number' && typeof state[key] === 'number') {
        state = { ...state, [key]: state[key] + val };
      } else {
        state = { ...state, [key]: val };
      }
    }
  }
  state = { ...state, pendingEffects: remaining };

  // ─── Reality corridor pulls ───
  // Each month, actual metrics drift toward their corridor center.
  // Player decisions shift these, but gravity pulls back.
  // Price sensitivity: higher prices increase churn and CAC corridors.

  const price = state.price ?? 0;
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
  // Pipeline grows from base growth + organic referrals.
  // KEY MECHANIC: Pipeline requires ACTIVE sales effort.
  // Without sales investment (events, hiring), pipeline decays aggressively.
  // This prevents the "just build product" strategy — you need customers to survive.
  const corridorPipe = corridors.pipelineGrowth || { min: 3, max: 40, center: 12 };
  const rawGrowth = state.pipelineGrowth ?? 12;
  // Pull growth toward corridor center
  const baseGrowth = rawGrowth * 0.7 + corridorPipe.center * 0.3;
  // Organic referrals: happy customers bring more (product quality matters here too)
  const referralRate = productQuality > 50 ? 0.04 : 0.02;
  const organicReferrals = Math.floor((state.customers ?? 0) * referralRate);
  // Pipeline decay: 25% without active sales effort (was 20% — harsher)
  // salesEffort tracks whether recent events invested in sales/pipeline
  const salesEffort = state.salesEffort ?? 0; // 0-1, set by events
  const pipelineDecay = 0.80 + salesEffort * 0.1; // 0.80 (no effort) to 0.90 (active sales)
  let pipeline = Math.round((state.pipeline ?? 12) * pipelineDecay + baseGrowth * 0.4 + organicReferrals);
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

  // ─── Costs & Team Budget Effects ───
  const supportCosts = customers * (state.supportCost ?? 5);
  const initialBurn = classConfig?.initial?.burnRate ?? 4500;
  const cofounderFloor = Math.round(initialBurn * 0.5); // can't fire your co-founder
  const burnBase = Math.max(cofounderFloor, state.burnRate ?? initialBurn);

  // ─── Team budget change effects ───
  // Track how budget changed vs last month
  const prevBurn = state.prevBurnRate ?? initialBurn;
  const burnDelta = burnBase - prevBurn;
  const burnChangePct = prevBurn > 0 ? burnDelta / prevBurn : 0;

  let teamMorale = state.teamMorale ?? 1.0; // 0.3 to 1.5
  let teamVelocity = 1.0; // multiplier for product/pipeline effects this month

  if (burnDelta < -500) {
    // CUTS: layoffs/downsizing
    const cutSeverity = Math.abs(burnChangePct); // 0.1 = 10% cut, 0.3 = 30% cut
    teamMorale = Math.max(0.3, teamMorale - cutSeverity * 1.5); // morale tanks
    teamVelocity = Math.max(0.4, 1.0 - cutSeverity * 2); // short-term productivity crash
    // Cuts hurt everything: churn goes up (customers notice), pipeline slows, product suffers
    actualChurn = Math.min(25, actualChurn + cutSeverity * 5);
    pipeline = Math.max(2, Math.round(pipeline * (1 - cutSeverity * 0.3)));
  } else if (burnDelta > 1000) {
    // GROWTH: hiring/investing
    const growthRate = burnChangePct; // 0.1 = 10% growth, 0.5 = 50% growth
    if (growthRate > 0.3) {
      // Too fast! Onboarding overhead, communication chaos
      teamVelocity = Math.max(0.6, 1.0 - (growthRate - 0.3) * 1.5);
      teamMorale = Math.max(0.5, teamMorale - 0.1); // growing pains
    } else {
      // Healthy growth: more capacity
      teamVelocity = 1.0 + growthRate * 0.5; // up to 1.15x at 30% growth
      teamMorale = Math.min(1.3, teamMorale + 0.05); // fresh energy
    }
  } else {
    // Stable: morale recovers slowly toward 1.0
    teamMorale = teamMorale + (1.0 - teamMorale) * 0.15;
  }

  // Team budget level affects baseline capacity
  // More budget = more people = more gets done (diminishing returns)
  const budgetRatio = burnBase / initialBurn; // 1.0 = baseline, 2.0 = doubled team
  const capacityMultiplier = Math.pow(budgetRatio, 0.6); // diminishing: 2x budget = 1.52x capacity

  // Infrastructure scales with customers
  const infraCost = Math.round(customers * 2 + Math.max(0, customers - 30) * 2);
  // Misc costs creep up (legal, tools, subscriptions, compliance)
  const miscCreep = month > 2 ? Math.round(month * 30) : 0;
  // Marketing spend (needed to maintain pipeline)
  const marketingSpend = Math.round(baseGrowth * actualCAC * 0.15);
  const totalBurn = burnBase + supportCosts + infraCost + miscCreep + marketingSpend;

  const cash = Math.round((state.cash ?? 100000) - totalBurn + revenue);
  const netBurn = Math.max(0, totalBurn - revenue);
  const runway = netBurn > 0 ? Math.floor(Math.max(0, cash) / netBurn) : 99;

  // ─── Unit economics ───
  const ltv = actualChurn > 0 ? Math.round(price / (actualChurn / 100)) : price * 100;
  const ltvCacRatio = actualCAC > 0 ? Math.round((ltv / actualCAC) * 10) / 10 : 0;
  const grossMargin = revenue > 0 ? Math.round(((revenue - supportCosts - infraCost) / revenue) * 100) : 0;

  // ─── Sales effort decay ───
  // salesEffort decays each month — you need ongoing sales investment
  const salesEffortDecayed = Math.max(0, (state.salesEffort ?? 0) - 0.3);

  // ─── Product quality ───
  // Base decay (tech debt, market moves), modified by team capacity and velocity
  let product = Math.min(85, productQuality);
  const teamEffect = capacityMultiplier * teamVelocity * teamMorale;
  if (month > 2) {
    // Decay reduced by team capacity: bigger, happier team decays less
    const decayRate = Math.max(0, 0.8 - (teamEffect - 1) * 0.5);
    product = Math.max(10, product - decayRate);
  }
  // Team velocity boosts pipeline too
  pipeline = Math.max(2, Math.round(pipeline * (0.9 + teamEffect * 0.1)));

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
    prevBurnRate: burnBase,
    teamMorale,
    totalBurn,
    marketingSpend,
    cash,
    runway,
    netBurn,
    ltv,
    ltvCacRatio,
    grossMargin,
    price,
    salesEffort: salesEffortDecayed,
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
  // Acquired
  if (state.acquired) return 'acquired';

  // Death: cash ≤ 0
  if (state.cash <= 0) return 'dead';

  // Burnout penalty: utilization > 100% for extended periods reduces AP
  // (Not instant death — but compounding penalty via morale/product decay)

  // Win: PMF threshold met for 3 consecutive months
  if (history.length >= 4) { // need at least 4 entries (M0 + 3 months)
    const last3 = history.slice(-3);
    const allAbove = last3.every(s => (s.pmf ?? 0) >= 85);
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
