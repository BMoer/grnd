#!/usr/bin/env node
import { deeptech } from '../classes/deeptech.js';
import { advanceDeepTechMonth, calculateDeepTechPMF } from './deeptechEngine.js';
import { checkEndCondition, getAvailableEvents, pickRandom } from './gameEngine.js';
import { applyEffectsWithVariance } from './varianceEngine.js';
import { DEEPTECH_EVENTS } from '../events/deeptechDecisions.js';
import { DECISION_EVENTS } from '../events/decisions.js';
import { WORLD_EVENTS } from '../events/worldEvents.js';

const ALL_EVENTS = [...DEEPTECH_EVENTS, ...DECISION_EVENTS.filter(e => e.months.some(m => m > 12))];

function drawEvents(month, usedIds) {
  const available = getAvailableEvents(ALL_EVENTS, month, usedIds);
  if (!available.length) return [];
  const count = Math.min(available.length, month <= 3 ? 2 : 3);
  return [...available].sort(() => Math.random() - 0.5).slice(0, count);
}

function smartChoose(state, choices) {
  if (!choices.length) return null;
  let bestIdx = 0, bestScore = -Infinity;
  for (let i = 0; i < choices.length; i++) {
    const ch = choices[i];
    const eff = typeof ch.effects === 'function' ? ch.effects(state) : ch.effects;
    let score = 0;
    score += ((eff.product ?? state.product) - state.product) * 3;
    score += ((eff.certProgress ?? state.certProgress ?? 0) - (state.certProgress ?? 0)) * 2;
    score += ((eff.lois ?? state.lois ?? 0) - (state.lois ?? 0)) * 10;
    score += ((eff.unitsSold ?? state.unitsSold ?? 0) - (state.unitsSold ?? 0)) * 15;
    score += ((eff.cash ?? state.cash) - state.cash) * 0.0001;
    score += ((eff.ipFilings ?? state.ipFilings ?? 0) - (state.ipFilings ?? 0)) * 5;
    score += ((eff.pipeline ?? state.pipeline ?? 3) - (state.pipeline ?? 3)) * 3;
    score += ((eff.pilotConversations ?? state.pilotConversations ?? 0) - (state.pilotConversations ?? 0)) * 4;
    score -= ((eff.rdBurn ?? eff.burnRate ?? state.rdBurn ?? 15000) - (state.rdBurn ?? 15000)) * 0.001;
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  }
  return bestIdx;
}

const ass = deeptech.difficultyPresets.neutral.assumptions;
let state = {
  ...deeptech.initial,
  unitCost: ass.unitCost, unitPrice: ass.unitPrice, price: ass.unitPrice,
  certTimeline: ass.certTimeline, pilotPipeline: ass.pilotPipeline,
  pipeline: ass.pilotPipeline, rdBurn: ass.rdBurn, burnRate: ass.rdBurn,
  grantRunway: ass.grantRunway,
};

const history = [state];
const usedEvents = [];
const usedWorlds = [];

console.log('\n🔬 DEEP-TECH (NanoSense) SMART PLAYTHROUGH');
console.log('═'.repeat(63) + '\n');
console.log(`NanoSense | Unit: €${ass.unitPrice} | Cert: ${ass.certTimeline}mo | R&D: €${ass.rdBurn}/mo | Grant: €300K\n`);

for (let month = 1; month <= 24; month++) {
  state = advanceDeepTechMonth(state, deeptech);
  state.pmf = calculateDeepTechPMF(state);
  const ap = state.maxAP ?? 3;

  console.log(`── Month ${month} ──────────────────────────────────────────`);
  console.log(`  Cash: €${state.cash.toLocaleString()} | Grant: €${(state.grantRemaining??0).toLocaleString()} | Cert: ${state.certProgress}% | LOIs: ${state.lois} | Sold: ${state.unitsSold} | TRL: ${state.prototypeStage} | PMF: ${state.pmf} | Prod: ${Math.round(state.product)}`);

  if (month >= 3 && Math.random() < 0.3) {
    const we = pickRandom(WORLD_EVENTS.filter(w => !usedWorlds.includes(w.id)));
    if (we) { state = we.effect(state); state.pmf = calculateDeepTechPMF(state); usedWorlds.push(we.id); console.log(`  ⚡ ${we.title}`); }
  }

  history.push(state);
  const result = checkEndCondition(state, history);
  if (result) { console.log(`\n  ★ RESULT: ${result.toUpperCase()}`); break; }

  const events = drawEvents(month, usedEvents);
  for (const event of events) {
    const choices = event.getChoices ? event.getChoices('deeptech') : [];
    if (ap >= (event.apCost ?? 1) && choices.length) {
      const idx = smartChoose(state, choices);
      if (idx !== null) {
        const choice = choices[idx];
        const apCost = choice.apCost ?? event.apCost ?? 1;
        const eff = typeof choice.effects === 'function' ? choice.effects(state) : choice.effects;
        state = applyEffectsWithVariance(eff, state);
        state.pmf = calculateDeepTechPMF(state);
        console.log(`  → ${event.title}: ${choice.text.slice(0, 55)}`);
      }
    } else {
      const def = event.defaultOutcome;
      const eff = typeof def.effects === 'function' ? def.effects(state) : def.effects;
      state = applyEffectsWithVariance(eff, state);
      state.pmf = calculateDeepTechPMF(state);
      console.log(`  ✗ ${event.title} — skipped`);
    }
    usedEvents.push(event.id);
  }
}

console.log('\n' + '═'.repeat(63));
console.log('FINAL STATE');
console.log(`Cash: €${state.cash.toLocaleString()} | Cert: ${state.certProgress}% | LOIs: ${state.lois} | Sold: ${state.unitsSold}`);
console.log(`Product/TRL: ${Math.round(state.product)}/${state.prototypeStage} | IP: ${state.ipFilings} | PMF: ${state.pmf}/100 | Month: ${state.month}`);
