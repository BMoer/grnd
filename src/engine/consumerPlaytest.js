#!/usr/bin/env node
import { consumer } from '../classes/consumer.js';
import { advanceConsumerMonth, calculateConsumerPMF } from './consumerEngine.js';
import { checkEndCondition, getAvailableEvents, pickRandom } from './gameEngine.js';
import { applyEffectsWithVariance } from './varianceEngine.js';
import { CONSUMER_EVENTS } from '../events/consumerDecisions.js';
import { DECISION_EVENTS } from '../events/decisions.js';
import { WORLD_EVENTS } from '../events/worldEvents.js';

const ALL_EVENTS = [...CONSUMER_EVENTS, ...DECISION_EVENTS.filter(e => e.months.some(m => m > 8))];

function drawMonthEvents(month, usedEventIds) {
  const available = getAvailableEvents(ALL_EVENTS, month, usedEventIds);
  if (available.length === 0) return [];
  const maxDraw = month <= 3 ? 2 : 3;
  const minDraw = month <= 2 ? 1 : 2;
  const count = Math.min(available.length, minDraw + Math.floor(Math.random() * (maxDraw - minDraw + 1)));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function smartChoose(state, choices) {
  if (!choices.length) return null;
  let bestIdx = 0, bestScore = -Infinity;
  for (let i = 0; i < choices.length; i++) {
    const ch = choices[i];
    const effects = typeof ch.effects === 'function' ? ch.effects(state) : ch.effects;
    let score = 0;
    score += ((effects.product ?? state.product) - state.product) * 2;
    score += ((effects.repeatRate ?? state.repeatRate) - state.repeatRate) * 3;
    score += ((effects.viralCoeff ?? state.viralCoeff) - state.viralCoeff) * 0.5;
    score += ((effects.revenue ?? state.revenue ?? 0) - (state.revenue ?? 0)) * 0.005;
    score -= ((effects.cac ?? state.cac) - state.cac) * 1;
    score -= ((effects.cogs ?? state.cogs) - state.cogs) * 2;
    score += ((effects.cash ?? state.cash) - state.cash) * 0.0001;
    score += ((effects.activeCustomers ?? effects.customers ?? state.activeCustomers ?? state.customers) - (state.activeCustomers ?? state.customers)) * 0.5;
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  }
  return bestIdx;
}

const ass = consumer.difficultyPresets.neutral.assumptions;
const config = consumer;

let state = {
  ...config.initial,
  price: ass.aov, aov: ass.aov, repeatRate: ass.repeatRate,
  cac: ass.targetCAC, viralCoeff: ass.viralCoeff, cogs: ass.cogs, adSpend: ass.adSpend,
};

const history = [state];
const usedEvents = [];
const usedWorlds = [];
let ap = 3;

console.log('\n🎮 CONSUMER (GlowUp) SMART PLAYTHROUGH');
console.log('═'.repeat(63) + '\n');
console.log(`GlowUp | AOV: €${ass.aov} | Repeat: ${ass.repeatRate}% | CAC: €${ass.targetCAC} | Cash: €80K\n`);

for (let month = 1; month <= 24; month++) {
  state = advanceConsumerMonth(state, config);
  state.pmf = calculateConsumerPMF(state);
  ap = state.maxAP ?? 3;

  console.log(`── Month ${month} ──────────────────────────────────────────`);
  console.log(`  Cash: €${state.cash.toLocaleString()} | Rev: €${state.revenue} | Active: ${state.activeCustomers} | Repeat: ${state.repeatRate}% | Viral: ${state.viralCoeff/100} | PMF: ${state.pmf} | Product: ${Math.round(state.product)} | AP: ${ap}`);

  // World event
  if (month >= 3 && Math.random() < 0.4) {
    const availWorlds = WORLD_EVENTS.filter(w => !usedWorlds.includes(w.id));
    const we = pickRandom(availWorlds);
    if (we) {
      state = we.effect(state);
      state.pmf = calculateConsumerPMF(state);
      usedWorlds.push(we.id);
      console.log(`  ⚡ ${we.title}`);
    }
  }

  history.push(state);
  const result = checkEndCondition(state, history);
  if (result) { console.log(`\n  ★ RESULT: ${result.toUpperCase()}`); break; }

  const events = drawMonthEvents(month, usedEvents);
  for (const event of events) {
    const choices = event.getChoices ? event.getChoices('consumer') : [];
    if (ap >= (event.apCost ?? 1) && choices.length) {
      const choiceIdx = smartChoose(state, choices);
      if (choiceIdx !== null) {
        const choice = choices[choiceIdx];
        const apCost = choice.apCost ?? event.apCost ?? 1;
        if (ap >= apCost) {
          const effects = typeof choice.effects === 'function' ? choice.effects(state) : choice.effects;
          state = applyEffectsWithVariance(effects, state);
          state.pmf = calculateConsumerPMF(state);
          ap -= apCost;
          console.log(`  → ${event.title}: ${choice.text.slice(0, 60)}`);
        }
      }
    } else {
      const def = event.defaultOutcome;
      const effects = typeof def.effects === 'function' ? def.effects(state) : def.effects;
      state = applyEffectsWithVariance(effects, state);
      state.pmf = calculateConsumerPMF(state);
      console.log(`  ✗ ${event.title} — skipped`);
    }
    usedEvents.push(event.id);
  }
}

console.log('\n' + '═'.repeat(63));
console.log('FINAL STATE');
console.log(`Cash: €${state.cash.toLocaleString()} | Revenue: €${state.revenue} | Active Customers: ${state.activeCustomers}`);
console.log(`Repeat: ${state.repeatRate}% | Viral: ${(state.viralCoeff/100).toFixed(2)} | LTV:CAC: ${state.ltvCacRatio}x | PMF: ${state.pmf}/100`);
console.log(`Product: ${Math.round(state.product)} | Month: ${state.month}`);
