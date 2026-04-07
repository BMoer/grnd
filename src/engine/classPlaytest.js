#!/usr/bin/env node
// Generic playtest runner for any class
import { CLASSES } from '../classes/index.js';
import { checkEndCondition, getAvailableEvents, pickRandom } from './gameEngine.js';
import { applyEffectsWithVariance } from './varianceEngine.js';
import { DECISION_EVENTS } from '../events/decisions.js';
import { WORLD_EVENTS } from '../events/worldEvents.js';
import { advanceConsumerMonth, generateConsumerForecast, calculateConsumerPMF } from './consumerEngine.js';
import { advanceDeepTechMonth, generateDeepTechForecast, calculateDeepTechPMF } from './deeptechEngine.js';
import { advanceMarketplaceMonth, generateMarketplaceForecast, calculateMarketplacePMF } from './marketplaceEngine.js';
import { advanceServiceMonth, generateServiceForecast, calculateServicePMF } from './serviceEngine.js';
import { advanceMonth as advanceSaaSMonth } from './gameEngine.js';
import { calculateSaaSPMF } from './pmfCalculator.js';
import { CONSUMER_EVENTS } from '../events/consumerDecisions.js';
import { DEEPTECH_EVENTS } from '../events/deeptechDecisions.js';
import { MARKETPLACE_EVENTS } from '../events/marketplaceDecisions.js';
import { SERVICE_EVENTS } from '../events/serviceDecisions.js';

const engines = {
  saas: { advance: advanceSaaSMonth, pmf: calculateSaaSPMF, events: DECISION_EVENTS },
  consumer: { advance: advanceConsumerMonth, pmf: calculateConsumerPMF, events: [...CONSUMER_EVENTS, ...DECISION_EVENTS.filter(e => e.months.some(m => m > 8))] },
  deeptech: { advance: advanceDeepTechMonth, pmf: calculateDeepTechPMF, events: [...DEEPTECH_EVENTS, ...DECISION_EVENTS.filter(e => e.months.some(m => m > 12))] },
  marketplace: { advance: advanceMarketplaceMonth, pmf: calculateMarketplacePMF, events: [...MARKETPLACE_EVENTS, ...DECISION_EVENTS.filter(e => e.months.some(m => m > 10))] },
  service: { advance: advanceServiceMonth, pmf: calculateServicePMF, events: [...SERVICE_EVENTS, ...DECISION_EVENTS.filter(e => e.months.some(m => m > 8))] },
};

function runBatch(classId, strategy, runs) {
  const config = CLASSES[classId];
  const eng = engines[classId];
  const preset = config.difficultyPresets.neutral;
  const R = { dead: 0, pmf: 0, survived: 0, acquired: 0 };

  for (let run = 0; run < runs; run++) {
    const initial = { ...config.initial };
    // Apply preset assumptions to initial state
    for (const [k, v] of Object.entries(preset.assumptions)) {
      if (k === 'targetCAC') initial.cac = v;
      else if (k === 'aov') { initial.aov = v; initial.price = v; }
      else if (k === 'unitPrice') { initial.unitPrice = v; initial.price = v; }
      else if (k === 'avgProject') { initial.avgProject = v; initial.price = v; }
      else initial[k] = v;
    }

    let s = { ...initial };
    const h = [s]; const ue = []; const uw = []; let end = 'survived';

    for (let m = 1; m <= 24; m++) {
      s = eng.advance(s, config);
      s.pmf = eng.pmf(s);

      if (m >= 3 && Math.random() < 0.3) {
        const we = pickRandom(WORLD_EVENTS.filter(w => !uw.includes(w.id)));
        if (we) { s = we.effect(s); s.pmf = eng.pmf(s); uw.push(we.id); }
      }
      h.push(s);
      // Store previous supply/demand for marketplace growth check
      s.prevSupply = s.supply; s.prevDemand = s.demand;

      const r = checkEndCondition(s, h);
      if (r) { end = r; break; }

      const avail = getAvailableEvents(eng.events, m, ue).sort(() => Math.random() - 0.5).slice(0, 2);
      for (const ev of avail) {
        const ch = ev.getChoices ? ev.getChoices(classId) : [];
        if (strategy === 'smart') {
          // Simple smart: pick first choice that improves product or revenue
          if (ch.length) {
            const best = ch.reduce((a, b) => {
              const ea = typeof a.effects === 'function' ? a.effects(s) : a.effects;
              const eb = typeof b.effects === 'function' ? b.effects(s) : b.effects;
              const sa = ((ea.product ?? s.product) - s.product) * 2 + ((ea.revenue ?? ea.totalMRR ?? s.revenue ?? 0) - (s.revenue ?? 0)) * 0.01 + ((ea.cash ?? s.cash) - s.cash) * 0.0001;
              const sb = ((eb.product ?? s.product) - s.product) * 2 + ((eb.revenue ?? eb.totalMRR ?? s.revenue ?? 0) - (s.revenue ?? 0)) * 0.01 + ((eb.cash ?? s.cash) - s.cash) * 0.0001;
              return sa > sb ? a : b;
            });
            const eff = typeof best.effects === 'function' ? best.effects(s) : best.effects;
            s = applyEffectsWithVariance(eff, s);
            s.pmf = eng.pmf(s);
            if (s.acquired) { end = 'acquired'; break; }
          }
        } else {
          // Random
          if (ch.length && Math.random() > 0.15) {
            const c = ch[Math.floor(Math.random() * ch.length)];
            const eff = typeof c.effects === 'function' ? c.effects(s) : c.effects;
            s = applyEffectsWithVariance(eff, s);
            s.pmf = eng.pmf(s);
            if (s.acquired) { end = 'acquired'; break; }
          } else {
            const d = ev.defaultOutcome;
            const eff = typeof d.effects === 'function' ? d.effects(s) : d.effects;
            s = applyEffectsWithVariance(eff, s);
            s.pmf = eng.pmf(s);
          }
        }
        ue.push(ev.id);
      }
      if (end === 'acquired') break;
    }
    R[end]++;
  }
  return R;
}

// Run all classes
const RUNS = 60;
const classIds = process.argv[2] ? [process.argv[2]] : Object.keys(CLASSES);

for (const classId of classIds) {
  console.log(`\n═══ ${CLASSES[classId].name} (${classId}) ═══`);
  for (const strategy of ['smart', 'random']) {
    const R = runBatch(classId, strategy, RUNS);
    const pct = (k) => Math.round(R[k] / RUNS * 100);
    console.log(`  ${strategy.padEnd(7)}: Dead ${pct('dead').toString().padStart(3)}% | PMF ${pct('pmf').toString().padStart(3)}% | Surv ${pct('survived').toString().padStart(3)}% | Acq ${pct('acquired').toString().padStart(3)}%`);
  }
}
