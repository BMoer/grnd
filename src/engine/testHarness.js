#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// TEST HARNESS — Automated game simulation
// Runs N games with random (but reasonable) choices, reports stats.
// Usage: node src/engine/testHarness.js [numGames]
// ═══════════════════════════════════════════════════════════════

import { saas } from '../classes/saas.js';
import { calculateBackgroundModifiers, applyDeltas, computeEngineModifiers, PRESETS } from '../classes/founderAttributes.js';
import { advanceMonth, checkEndCondition, getAvailableEvents, pickRandom } from './gameEngine.js';
import { applyEffectsWithVariance } from './varianceEngine.js';
import { calculateSaaSPMF } from './pmfCalculator.js';
import { generateSaaSForecast } from './forecastEngine.js';
import { DECISION_EVENTS } from '../events/decisions.js';
import { WORLD_EVENTS } from '../events/worldEvents.js';
import { isBoardMeetingMonth } from './boardMeeting.js';

const NUM_GAMES = parseInt(process.argv[2]) || 100;

function drawMonthEvents(month, usedEventIds) {
  const available = getAvailableEvents(DECISION_EVENTS, month, usedEventIds);
  if (available.length === 0) return [];
  const maxDraw = month <= 3 ? 2 : 3;
  const minDraw = month <= 2 ? 1 : 2;
  const count = Math.min(available.length, minDraw + Math.floor(Math.random() * (maxDraw - minDraw + 1)));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function simulateGame(assumptions = null, founderBg = null) {
  const config = saas;
  const ass = assumptions || {
    price: 49,
    churnRate: 5,
    targetCAC: 80,
    conversionRate: 15,
    pipelineGrowth: 20,
    supportCost: 5,
  };

  // Compute founder modifiers
  let founderMods = {};
  if (founderBg) {
    const { deltas, modifiers } = calculateBackgroundModifiers(founderBg.background);
    let finalAttrs;
    if (founderBg.isPreset) {
      // Preset: attributes are already final
      finalAttrs = founderBg.attributes;
      if (founderBg.teamFundraisingOverride) {
        modifiers.fundraisingSuccessRate = founderBg.teamFundraisingOverride;
      }
      if (founderBg.teamAmountOverride) {
        modifiers.fundraisingAmountMultiplier = founderBg.teamAmountOverride;
      }
    } else {
      const baseAttrs = founderBg.attributes || { tech: 5, sales: 5, network: 5, domain: 5, resilience: 5, capital: 5 };
      finalAttrs = applyDeltas(baseAttrs, deltas);
    }
    founderMods = computeEngineModifiers(finalAttrs, modifiers);
  }

  const startingCash = (config.initial.cash ?? 100000) + (founderMods.startingCashDelta ?? 0);
  const basePipeline = ass.pipelineGrowth + (founderMods.pipelineBonus ?? 0);

  let state = {
    ...config.initial,
    price: ass.price,
    churn: ass.churnRate,
    cac: ass.targetCAC,
    conversionRate: ass.conversionRate,
    pipeline: basePipeline,
    pipelineGrowth: ass.pipelineGrowth,
    mrrPerCustomer: ass.price,
    supportCost: ass.supportCost,
    cash: startingCash,
    maxAP: Math.max(2, 3 + (founderMods.apModifier ?? 0)),
    founderMods,
  };

  const history = [state];
  const usedEvents = [];
  const usedWorlds = [];
  let ap = state.maxAP ?? 3;
  const baseMaxAP = state.maxAP ?? 3;
  let result = null;
  const monthLog = [];

  for (let month = 1; month <= 24; month++) {
    // Advance month
    state = advanceMonth(state, config);
    state.pmf = calculateSaaSPMF(state);

    // Churn pressure
    if (state.month > 3 && (state.product ?? 30) < 40) {
      state.churn = Math.min(20, (state.churn ?? 5) + 0.5);
    }

    // World event (40% after month 2)
    if (month >= 3 && Math.random() < 0.4) {
      const availWorlds = WORLD_EVENTS.filter(w => !usedWorlds.includes(w.id));
      const we = pickRandom(availWorlds);
      if (we) {
        state = we.effect(state);
        state.pmf = calculateSaaSPMF(state);
        usedWorlds.push(we.id);
      }
    }

    history.push(state);

    // Check end
    result = checkEndCondition(state, history);
    if (result) break;

    // Reset AP (part-time penalty)
    let effectiveMaxAP = state.maxAP ?? baseMaxAP;
    if (founderMods.partTime && month <= (founderMods.partTimeMonths ?? 6)) {
      effectiveMaxAP = Math.max(1, effectiveMaxAP - 1);
    }
    ap = effectiveMaxAP;

    // Draw and resolve events
    const events = drawMonthEvents(month, usedEvents);
    for (const event of events) {
      if (ap >= (event.apCost ?? 1)) {
        // Pick random choice
        const choices = event.getChoices ? event.getChoices('saas') : [];
        if (choices.length > 0) {
          const choice = choices[Math.floor(Math.random() * choices.length)];
          const effects = typeof choice.effects === 'function' ? choice.effects(state) : choice.effects;
          state = applyEffectsWithVariance(effects, state);
          state.pmf = calculateSaaSPMF(state);
          ap -= (event.apCost ?? 1);
        }
      } else {
        // Default
        const def = event.defaultOutcome;
        const effects = typeof def.effects === 'function' ? def.effects(state) : def.effects;
        state = applyEffectsWithVariance(effects, state);
        state.pmf = calculateSaaSPMF(state);
      }
      usedEvents.push(event.repeatable ? `${event.id}_${month}` : event.id);
    }

    // Log key metrics
    monthLog.push({
      month,
      cash: state.cash,
      mrr: state.totalMRR,
      customers: state.customers,
      churn: state.churn,
      pmf: state.pmf,
      pipeline: state.pipeline,
      runway: state.runway,
      events: events.length,
    });
  }

  if (!result) result = 'survived';

  return {
    result,
    finalMonth: state.month,
    finalCash: state.cash,
    finalMRR: state.totalMRR,
    finalCustomers: state.customers,
    finalPMF: state.pmf,
    finalChurn: state.churn,
    peakMRR: Math.max(...history.map(h => h.totalMRR || 0)),
    peakCustomers: Math.max(...history.map(h => h.customers || 0)),
    monthLog,
  };
}

// Different player profiles
const defaultAss = { price: 49, churnRate: 5, targetCAC: 80, conversionRate: 15, pipelineGrowth: 20, supportCost: 5 };

// Founder backgrounds to test
const founderProfiles = {
  'preset (Mira+Jonas)': {
    attributes: { tech: 8, sales: 3, network: 4, domain: 6, resilience: 6, capital: 5 },
    background: { gender: 'female', class: 'middle', ethnicity: 'majority', age: '30s', special: 'none' },
    isPreset: true,
    teamFundraisingOverride: 0.85,
    teamAmountOverride: 0.9,
  },
  'privileged male': {
    attributes: { tech: 5, sales: 7, network: 7, domain: 5, resilience: 4, capital: 7 },
    background: { gender: 'male', class: 'privileged', ethnicity: 'majority', age: '30s', special: 'none' },
  },
  'working-class female': {
    attributes: { tech: 6, sales: 4, network: 3, domain: 6, resilience: 8, capital: 3 },
    background: { gender: 'female', class: 'working', ethnicity: 'majority', age: '20s', special: 'none' },
  },
  'black founder': {
    attributes: { tech: 6, sales: 5, network: 3, domain: 5, resilience: 8, capital: 3 },
    background: { gender: 'male', class: 'middle', ethnicity: 'black', age: '30s', special: 'none' },
  },
  'max privilege': {
    attributes: { tech: 5, sales: 8, network: 8, domain: 5, resilience: 3, capital: 8 },
    background: { gender: 'male', class: 'privileged', ethnicity: 'majority', age: '30s', special: 'serial' },
  },
  'max disadvantage': {
    attributes: { tech: 6, sales: 4, network: 2, domain: 5, resilience: 10, capital: 3 },
    background: { gender: 'female', class: 'working', ethnicity: 'black', age: '20s', special: 'solo' },
  },
  'no founder (baseline)': null,
};

const profiles = {
  default: defaultAss,
};

// Run simulations
console.log(`\n🎮 Running ${NUM_GAMES} simulated games per profile...\n`);

function runProfile(name, assumptions, founderBg = null) {
  const results = [];
  for (let i = 0; i < NUM_GAMES; i++) {
    results.push(simulateGame(assumptions, founderBg));
  }
  
  const dead = results.filter(r => r.result === 'dead');
  const pmf = results.filter(r => r.result === 'pmf');
  const survived = results.filter(r => r.result === 'survived');
  const n = results.length;
  
  const avgDeath = dead.length ? Math.round(dead.reduce((a, r) => a + r.finalMonth, 0) / dead.length) : '-';
  const avgPMFmo = pmf.length ? Math.round(pmf.reduce((a, r) => a + r.finalMonth, 0) / pmf.length) : '-';
  const avgMRR = Math.round(results.reduce((a, r) => a + r.finalMRR, 0) / n);
  const avgCash = Math.round(results.reduce((a, r) => a + Math.max(0, r.finalCash), 0) / n);
  const avgPMF = Math.round(results.reduce((a, r) => a + r.finalPMF, 0) / n);
  const avgChurn = Math.round(results.reduce((a, r) => a + r.finalChurn, 0) / n * 10) / 10;
  
  console.log(`\n── ${name.toUpperCase()} ──`);
  console.log(`  Assumptions: price=€${assumptions.price}, churn=${assumptions.churnRate}%, CAC=€${assumptions.targetCAC}, conv=${assumptions.conversionRate}%, pipeline=${assumptions.pipelineGrowth}`);
  console.log(`  Dead: ${dead.length}/${n} (${Math.round(dead.length/n*100)}%) avg M${avgDeath} | PMF: ${pmf.length}/${n} (${Math.round(pmf.length/n*100)}%) avg M${avgPMFmo} | Survived: ${survived.length}/${n} (${Math.round(survived.length/n*100)}%)`);
  console.log(`  Avg MRR: €${avgMRR} | Cash: €${avgCash} | PMF: ${avgPMF}/100 | Churn: ${avgChurn}%`);
  
  return results;
}

// Run baseline
for (const [name, ass] of Object.entries(profiles)) {
  const results = runProfile(name, ass);
  if (name === 'default') {
    // Show one detailed trace
    const sample = results[0];
    console.log(`  ┌── Sample trace (${sample.result} at M${sample.finalMonth})`);
    console.log('  │ Month | Cash      | MRR     | Cust | Churn | PMF | Pipe | Ev');
    for (const m of sample.monthLog) {
      console.log(
        `  │   ${String(m.month).padStart(2)}  | ${String('€' + m.cash).padStart(9)} | ${String('€' + m.mrr).padStart(7)} | ${String(m.customers).padStart(4)} | ${String(m.churn + '%').padStart(5)} | ${String(m.pmf).padStart(3)} | ${String(m.pipeline).padStart(4)} | ${m.events}`
      );
    }
    console.log('  └──');
  }
}

// Run founder profiles
console.log('\n\n═══════════════════════════════════════════');
console.log('FOUNDER ATTRIBUTE PROFILES (all with default assumptions)');
console.log('═══════════════════════════════════════════');

for (const [name, bg] of Object.entries(founderProfiles)) {
  runProfile(name, defaultAss, bg ? { attributes: bg.attributes, background: bg.background } : null);
}
