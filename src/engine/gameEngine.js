// ═══════════════════════════════════════════════════════════════
// GAME ENGINE
// Core loop: month advancement, state transitions, end conditions.
//
// Financial pressure is real:
// - Churn compounds monthly
// - Burn rate has hidden costs (infra, tools, legal)
// - Pipeline decays without active effort
// - Revenue doesn't just appear from customers
// ═══════════════════════════════════════════════════════════════

import { applyVariance } from './varianceEngine.js';

/**
 * Advance the game by one month.
 * Calculates new financials based on current state + class model.
 */
export function advanceMonth(state, classConfig) {
  const month = state.month + 1;

  const actualChurn = state.churn ?? 5;
  const actualCAC = state.cac ?? 80;
  const conversionRate = state.conversionRate ?? 15;
  const price = state.price ?? 0; // 0 if player hasn't set pricing yet

  // Pipeline decays naturally (-10% per month without effort)
  const pipelineDecay = Math.round((state.pipeline ?? 12) * 0.9);
  const pipeline = Math.max(0, pipelineDecay);

  // Trials from pipeline (with variance)
  const newTrials = Math.max(0, applyVariance(Math.round(pipeline * 0.6), 0.3));
  const conversions = Math.round(newTrials * (conversionRate / 100));

  // Customer churn (compounds!)
  const prevCustomers = state.customers ?? 0;
  const churned = Math.round(prevCustomers * (actualChurn / 100));
  const customers = Math.max(0, prevCustomers + conversions - churned);

  // MRR
  const newMRR = conversions * price;
  const churnedMRR = Math.round((state.totalMRR ?? 0) * (actualChurn / 100));
  const totalMRR = Math.max(0, (state.totalMRR ?? 0) + newMRR - churnedMRR);
  const revenue = totalMRR;

  // Costs — burn has hidden components that increase over time
  const supportCosts = customers * (state.supportCost ?? 5);
  const burnBase = state.burnRate ?? 8000;
  // Infrastructure scales slightly with customers
  const infraCost = Math.round(customers * 2);
  // Misc costs that creep up (legal, tools, subscriptions)
  const miscCreep = month > 3 ? Math.round(month * 50) : 0;
  const totalBurn = burnBase + supportCosts + infraCost + miscCreep;

  const cash = Math.round((state.cash ?? 100000) - totalBurn + revenue);
  const netBurn = Math.max(0, totalBurn - revenue);
  const runway = netBurn > 0 ? Math.floor(Math.max(0, cash) / netBurn) : 99;

  // Unit economics
  const ltv = actualChurn > 0 ? Math.round(price / (actualChurn / 100)) : price * 100;
  const ltvCacRatio = actualCAC > 0 ? Math.round((ltv / actualCAC) * 10) / 10 : 0;
  const grossMargin = revenue > 0 ? Math.round(((revenue - supportCosts - infraCost) / revenue) * 100) : 0;

  return {
    ...state,
    month,
    pipeline,
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
    cash,
    runway,
    netBurn,
    ltv,
    ltvCacRatio,
    grossMargin,
    price,
    cac: actualCAC,
    churn: actualChurn,
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
  if (history.length >= 3) {
    const last3 = history.slice(-3);
    const allAbove60 = last3.every(s => (s.pmf ?? 0) >= 60);
    if (allAbove60) return 'pmf';
  }

  // Time limit
  if (state.month >= maxMonths) return 'survived';

  return null;
}

/**
 * Get available events for a given month.
 */
export function getAvailableEvents(events, month, usedEventIds) {
  return events.filter(e =>
    e.months.includes(month) && !usedEventIds.includes(e.id)
  );
}

/**
 * Pick a random element from an array.
 */
export function pickRandom(arr) {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
}
