// ═══════════════════════════════════════════════════════════════
// SERVICE ENGINE — StrategyForge
// Revenue from day 1. Margin-constrained. Utilization = life/death.
// The trap: every client needs founder time. Escaping = productization.
// ═══════════════════════════════════════════════════════════════

import { applyVariance } from './varianceEngine.js';

export function advanceServiceMonth(state, classConfig) {
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

  const productQuality = s.product ?? 40;

  // ─── Corridor pulls ───
  const cCloseRate = corridors.closeRate || { center: 20 };
  const cRepeatRate = corridors.repeatRate || { center: 15 };
  const cMargin = corridors.grossMargin || { center: 42 };
  const cProject = corridors.avgProject || { center: 4000 };

  // Close rate
  let closeRate = s.closeRate ?? 25;
  closeRate = closeRate * 0.7 + cCloseRate.center * 0.3;
  if (productQuality > 50) closeRate += (productQuality - 50) * 0.1;
  if (s.salesEffort > 0) closeRate += s.salesEffort * 5;
  closeRate = applyVariance(closeRate * 10, 0.2) / 10;
  closeRate = Math.max(5, Math.min(50, closeRate));

  // Repeat rate
  let repeatRate = s.repeatRate ?? 20;
  repeatRate = repeatRate * 0.75 + cRepeatRate.center * 0.25;
  if (productQuality > 50) repeatRate += (productQuality - 50) * 0.15;
  repeatRate = applyVariance(repeatRate * 10, 0.15) / 10;
  repeatRate = Math.max(3, Math.min(60, repeatRate));

  // ─── Pipeline & Clients ───
  let pipeline = s.pipeline ?? 5;
  // Pipeline grows from networking + referrals + reputation
  const organicLeads = Math.max(0, Math.round((s.activeClients ?? 2) * 0.15));
  pipeline = Math.max(1, pipeline + organicLeads - Math.round(pipeline * 0.2)); // 20% pipeline decay
  if (s.salesEffort > 0) pipeline += Math.round(s.salesEffort * 3);

  // New clients from pipeline (delayed by sales cycle)
  const salesCycle = s.salesCycle ?? 1.5;
  const effectivePipeline = salesCycle <= 1 ? pipeline : Math.round(pipeline * (1 / salesCycle));
  const newClients = Math.max(0, Math.round(effectivePipeline * (closeRate / 100)));

  // Repeat clients
  const activeClients = s.activeClients ?? 2;
  const repeatClients = Math.max(0, Math.round(activeClients * (repeatRate / 100)));

  // Client churn: services lose ~20% of non-repeat clients per month
  const nonRepeatChurn = Math.round(activeClients * 0.15);
  const totalClients = Math.max(0, activeClients + newClients + repeatClients - nonRepeatChurn);

  // ─── Revenue & Capacity ───
  let avgProject = s.avgProject ?? 5000;
  avgProject = avgProject * 0.8 + cProject.center * 0.2;
  avgProject = applyVariance(avgProject, 0.15);
  avgProject = Math.max(1000, Math.min(50000, avgProject));

  const revenue = Math.round(totalClients * avgProject);

  // Utilization: hours needed vs capacity
  const hoursPerClient = 40; // ~1 week per client per month
  const billableHours = totalClients * hoursPerClient;
  const teamCapacity = s.teamCapacity ?? 320;
  const utilization = teamCapacity > 0 ? Math.round(billableHours / teamCapacity * 100) : 0;

  // ─── Burnout mechanic ───
  let burnoutMonths = s.burnoutMonths ?? 0;
  if (utilization > 100) burnoutMonths++;
  else burnoutMonths = Math.max(0, burnoutMonths - 1);

  // ─── Costs ───
  const deliveryCost = Math.round(billableHours * 25); // €25/hr loaded cost
  const initialBurn = classConfig?.initial?.burnRate ?? 6000;
  // Cap burn growth — shared events can spike burnRate
  const burnBase = Math.min(Math.max(Math.round(initialBurn * 0.5), s.burnRate ?? initialBurn), initialBurn * 2.5);
  const salesCost = Math.round(pipeline * 100); // pipeline nurturing costs
  const miscCreep = month > 2 ? Math.round(month * 30) : 0;
  const totalBurn = burnBase + deliveryCost + salesCost + miscCreep;

  const grossMarginRaw = revenue > 0 ? Math.round((revenue - deliveryCost) / revenue * 100) : 0;
  const grossMargin = Math.max(0, grossMarginRaw);
  // Margin corridor pull
  const actualMargin = Math.max(0, Math.round(grossMargin * 0.7 + cMargin.center * 0.3));

  const cash = Math.round((s.cash ?? 40000) - totalBurn + revenue);
  const netBurn = Math.max(0, totalBurn - revenue);
  const runway = netBurn > 0 ? Math.floor(Math.max(0, cash) / netBurn) : 99;

  const revenuePerHead = (s.teamSize ?? 2) > 0 ? Math.round(revenue / (s.teamSize ?? 2)) : 0;
  const ltv = avgProject * (1 + repeatRate / 100 * 3); // rough LTV
  const cac = pipeline > 0 ? Math.round(salesCost / Math.max(1, newClients)) : 0;
  const ltvCacRatio = cac > 0 ? Math.round(ltv / cac * 10) / 10 : 0;
  const churn = Math.round((nonRepeatChurn / Math.max(1, activeClients)) * 1000) / 10;

  // ─── Product quality (AI tool improvement) ───
  let product = Math.min(85, productQuality);
  if (month > 2) product = Math.max(10, product - 0.4); // slower decay for services

  // ─── Team morale ───
  const prevBurnRate = s.prevBurnRate ?? initialBurn;
  const burnDelta = burnBase - prevBurnRate;
  let teamMorale = s.teamMorale ?? 1.0;
  if (burnDelta < -500) teamMorale = Math.max(0.3, teamMorale - Math.abs(burnDelta / prevBurnRate) * 1.5);
  else if (utilization > 100) teamMorale = Math.max(0.3, teamMorale - 0.1); // overwork kills morale
  else teamMorale = teamMorale + (1.0 - teamMorale) * 0.15;

  return {
    ...s, month,
    activeClients: totalClients, customers: totalClients, activeCustomers: totalClients,
    pipeline, closeRate: Math.round(closeRate * 10) / 10,
    repeatRate: Math.round(repeatRate * 10) / 10,
    avgProject: Math.round(avgProject),
    revenue, totalMRR: revenue,
    utilization, teamCapacity, billableHours,
    grossMargin: actualMargin, revenuePerHead,
    burnRate: burnBase, totalBurn, cash, runway, netBurn,
    price: Math.round(avgProject), cac, ltv: Math.round(ltv), ltvCacRatio,
    churn, product, teamMorale, prevBurnRate: burnBase,
    burnoutMonths,
    conversionRate: closeRate,
    viralCoeff: Math.round(organicLeads * 100 / Math.max(1, totalClients)),
    salesEffort: Math.max(0, (s.salesEffort ?? 0) - 0.2),
    adSpend: salesCost, supportCost: 0,
    salesCycle: s.salesCycle ?? 1.5,
  };
}

export function generateServiceForecast(assumptions) {
  const { avgProject = 5000, targetMargin = 50, salesCycle = 1.5, closeRate = 25, repeatRate = 20, teamCapacity = 320 } = assumptions;
  const months = [];
  let clients = 2, pipeline = 5, cash = 30000;

  for (let m = 0; m <= 24; m++) {
    if (m === 0) {
      months.push({ month: 0, cash: 30000, revenue: 8000, totalMRR: 8000, customers: 2, activeClients: 2, pipeline: 5, grossMargin: targetMargin, utilization: 50, burnRate: 6000, totalBurn: 8500, runway: 3, closeRate, repeatRate, churn: 15, ltvCacRatio: 0, cac: 0 });
      continue;
    }
    const effective = salesCycle <= 1 ? pipeline : Math.round(pipeline / salesCycle);
    const newC = Math.round(effective * closeRate / 100);
    const repeatC = Math.round(clients * repeatRate / 100);
    const churnC = Math.round(clients * 0.15);
    clients = Math.max(0, clients + newC + repeatC - churnC);
    pipeline = Math.max(1, pipeline + Math.round(clients * 0.15) - Math.round(pipeline * 0.2));
    const rev = clients * avgProject;
    const hours = clients * 40;
    const util = teamCapacity > 0 ? Math.round(hours / teamCapacity * 100) : 0;
    const delivery = hours * 25;
    const burn = 6000 + delivery + pipeline * 100;
    const margin = rev > 0 ? Math.round((rev - delivery) / rev * 100) : 0;
    cash = Math.round(cash - burn + rev);
    months.push({
      month: m, cash, revenue: rev, totalMRR: rev, customers: clients, activeClients: clients,
      pipeline, grossMargin: margin, utilization: util,
      burnRate: 5000, totalBurn: Math.round(burn),
      runway: (burn - rev) > 0 ? Math.floor(Math.max(0, cash) / (burn - rev)) : 99,
      closeRate, repeatRate, churn: Math.round(churnC / Math.max(1, clients) * 100),
      ltvCacRatio: 0, cac: 0,
    });
  }
  return months;
}

/**
 * Service PMF:
 * - Gross margin → 25 points (60%+ = max)
 * - Revenue → 25 points (€15K+/mo = max)
 * - Repeat rate → 20 points (40%+ = max)
 * - Utilization sweet spot → 15 points (70-90% = max, penalties above/below)
 * - Product quality → 15 points
 */
export function calculateServicePMF(state) {
  const { grossMargin = 0, revenue = 0, repeatRate = 0, utilization = 0, product = 40 } = state;

  const marginScore = Math.min(25, Math.round(Math.min(grossMargin, 65) / 65 * 25));
  const revenueScore = Math.min(25, Math.round((Math.sqrt(revenue) / Math.sqrt(15000)) * 25));
  const repeatScore = Math.min(20, Math.round(Math.min(repeatRate, 40) / 40 * 20));
  // Utilization: sweet spot is 70-90%. Below 50% or above 100% is bad.
  let utilScore = 0;
  if (utilization >= 70 && utilization <= 90) utilScore = 15;
  else if (utilization >= 50 && utilization < 70) utilScore = Math.round((utilization - 50) / 20 * 15);
  else if (utilization > 90 && utilization <= 100) utilScore = Math.round((100 - utilization) / 10 * 15);
  else utilScore = 0;
  const productScore = Math.min(15, Math.round(Math.max(0, product - 25) / 50 * 15));

  return Math.round(marginScore + revenueScore + repeatScore + utilScore + productScore);
}
