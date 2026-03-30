#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SMART PLAYTEST — Simulates a thoughtful player
// Picks choices based on game state (not random).
// Reports a full narrative trace.
// ═══════════════════════════════════════════════════════════════

import { saas } from '../classes/saas.js';
import { advanceMonth, checkEndCondition, getAvailableEvents, pickRandom } from './gameEngine.js';
import { applyEffectsWithVariance } from './varianceEngine.js';
import { calculateSaaSPMF } from './pmfCalculator.js';
import { DECISION_EVENTS } from '../events/decisions.js';
import { WORLD_EVENTS } from '../events/worldEvents.js';
import { isBoardMeetingMonth, calculateDeltas, generateBoardFeedback, getBoardPhase } from './boardMeeting.js';
import { generateSaaSForecast } from './forecastEngine.js';

function smartChoose(event, state, choices) {
  if (!choices.length) return null;
  
  // Evaluate each choice by simulating its effects
  let bestIdx = 0;
  let bestScore = -Infinity;
  
  for (let i = 0; i < choices.length; i++) {
    const ch = choices[i];
    const effects = typeof ch.effects === 'function' ? ch.effects(state) : ch.effects;
    
    // Score based on: product improvement, churn reduction, MRR growth, cash preservation
    let score = 0;
    score += ((effects.product ?? state.product) - state.product) * 3;
    score -= ((effects.churn ?? state.churn) - state.churn) * 5;
    score += ((effects.totalMRR ?? state.totalMRR ?? 0) - (state.totalMRR ?? 0)) * 0.01;
    score += ((effects.customers ?? state.customers) - state.customers) * 2;
    score += ((effects.pipeline ?? state.pipeline) - state.pipeline) * 0.5;
    score -= ((effects.burnRate ?? state.burnRate) - state.burnRate) * 0.005;
    score += ((effects.cash ?? state.cash) - state.cash) * 0.0001;
    score += ((effects.conversionRate ?? state.conversionRate) - state.conversionRate) * 1;
    
    // Penalize burn increases more when cash is low
    if (state.cash < 40000) {
      score -= ((effects.burnRate ?? state.burnRate) - state.burnRate) * 0.02;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  
  return bestIdx;
}

function drawMonthEvents(month, usedEventIds) {
  const available = getAvailableEvents(DECISION_EVENTS, month, usedEventIds);
  if (available.length === 0) return [];
  const maxDraw = month <= 3 ? 2 : 3;
  const minDraw = month <= 2 ? 1 : 2;
  const count = Math.min(available.length, minDraw + Math.floor(Math.random() * (maxDraw - minDraw + 1)));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const ass = { price: 49, churnRate: 5, targetCAC: 80, conversionRate: 15, pipelineGrowth: 20, supportCost: 5 };
const config = saas;
const forecast = generateSaaSForecast(ass);

let state = {
  ...config.initial,
  price: ass.price,
  churn: ass.churnRate,
  cac: ass.targetCAC,
  conversionRate: ass.conversionRate,
  pipeline: ass.pipelineGrowth,
  pipelineGrowth: ass.pipelineGrowth,
  mrrPerCustomer: ass.price,
  supportCost: ass.supportCost,
};

const history = [state];
const usedEvents = [];
const usedWorlds = [];
let ap = 3;
let maxAP = 3;

console.log('\n🎮 SMART PLAYER PLAYTHROUGH');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(`CloudKitchen | Price: €${ass.price} | Churn target: ${ass.churnRate}% | Starting cash: €100K\n`);

for (let month = 1; month <= 24; month++) {
  state = advanceMonth(state, config);
  state.pmf = calculateSaaSPMF(state);
  
  if (state.month > 3 && (state.product ?? 30) < 40) {
    state.churn = Math.min(20, (state.churn ?? 5) + 0.5);
  }
  
  const effectiveMaxAP = state.maxAP ?? maxAP;
  ap = effectiveMaxAP;

  console.log(`── Month ${month} ──────────────────────────────────────────`);
  console.log(`  Cash: €${state.cash.toLocaleString()} | MRR: €${state.totalMRR} | Cust: ${state.customers} | Churn: ${state.churn}% | PMF: ${state.pmf} | Product: ${Math.round(state.product)} | Pipeline: ${state.pipeline} | AP: ${ap}`);

  // World event
  if (month >= 3 && Math.random() < 0.4) {
    const availWorlds = WORLD_EVENTS.filter(w => !usedWorlds.includes(w.id));
    const we = pickRandom(availWorlds);
    if (we) {
      state = we.effect(state);
      state.pmf = calculateSaaSPMF(state);
      usedWorlds.push(we.id);
      console.log(`  ⚡ WORLD EVENT: ${we.title}`);
      console.log(`     ${we.flavor}`);
    }
  }

  history.push(state);

  const result = checkEndCondition(state, history);
  if (result) {
    console.log(`\n  ★ RESULT: ${result.toUpperCase()}`);
    break;
  }

  // Board meeting
  if (isBoardMeetingMonth(month)) {
    const deltas = calculateDeltas(forecast, state, month);
    const phase = getBoardPhase(month, false);
    const feedback = generateBoardFeedback(deltas, phase, month, state);
    console.log(`\n  📊 BOARD MEETING Q${Math.ceil(month / 3)}`);
    for (const f of feedback) {
      console.log(`     ${f.speaker}: "${f.text}"`);
    }
    const mrrD = deltas.find(d => d.key === 'totalMRR');
    const churnD = deltas.find(d => d.key === 'churn');
    if (mrrD) console.log(`     MRR: forecast €${mrrD.forecast} vs actual €${mrrD.actual} (${mrrD.deltaPct > 0 ? '+' : ''}${mrrD.deltaPct}%)`);
    if (churnD) console.log(`     Churn: forecast ${churnD.forecast}% vs actual ${churnD.actual}% (${churnD.deltaPct > 0 ? '+' : ''}${churnD.deltaPct}%)`);
    console.log();
  }

  // Events
  const events = drawMonthEvents(month, usedEvents);
  if (events.length === 0) {
    console.log(`  (no events this month)`);
  }
  
  for (const event of events) {
    const eventText = event.getText ? event.getText(state) : event.text;
    
    if (ap >= (event.apCost ?? 1)) {
      const choices = event.getChoices ? event.getChoices('saas') : [];
      const choiceIdx = smartChoose(event, state, choices);
      
      if (choiceIdx !== null && choices[choiceIdx]) {
        const choice = choices[choiceIdx];
        const effects = typeof choice.effects === 'function' ? choice.effects(state) : choice.effects;
        state = applyEffectsWithVariance(effects, state);
        state.pmf = calculateSaaSPMF(state);
        ap -= (event.apCost ?? 1);
        
        const fb = choice.dynamicFeedback ? choice.dynamicFeedback(state) : choice.feedback;
        console.log(`  → ${event.title} (${event.apCost ?? 1} AP)`);
        console.log(`    Choice: ${choice.text}`);
        console.log(`    ${fb}`);
      }
    } else {
      const def = event.defaultOutcome;
      const effects = typeof def.effects === 'function' ? def.effects(state) : def.effects;
      state = applyEffectsWithVariance(effects, state);
      state.pmf = calculateSaaSPMF(state);
      console.log(`  ✗ ${event.title} — NO AP`);
      console.log(`    ${def.feedback}`);
    }
    usedEvents.push(event.repeatable ? `${event.id}_${month}` : event.id);
  }
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('FINAL STATE');
console.log(`Cash: €${state.cash.toLocaleString()} | MRR: €${state.totalMRR} | Customers: ${state.customers}`);
console.log(`Churn: ${state.churn}% | LTV:CAC: ${state.ltvCacRatio}x | PMF: ${state.pmf}/100`);
console.log(`Product: ${Math.round(state.product)} | Pipeline: ${state.pipeline} | Month: ${state.month}`);
