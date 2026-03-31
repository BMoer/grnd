// ═══════════════════════════════════════════════════════════════
// GAME STORE (Zustand)
// Single source of truth for all game state.
//
// Monthly flow:
//   1. Month advances, financials calculated
//   2. World event check → banner if triggered
//   3. AP resets to 3, draw 2-3 decision events
//   4. Events shown one at a time:
//      - Enough AP → player picks choice (costs AP)
//      - Not enough AP → auto-default (painful)
//      - Player can also explicitly skip → default
//   5. All events resolved → next month
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { getClass } from './classes/index.js';
import { DECISION_EVENTS } from './events/decisions.js';
import { WORLD_EVENTS } from './events/worldEvents.js';
import { advanceMonth as engineAdvance, checkEndCondition, getAvailableEvents, pickRandom } from './engine/gameEngine.js';
import { applyEffectsWithVariance } from './engine/varianceEngine.js';
import { generateSaaSForecast } from './engine/forecastEngine.js';
import { calculateSaaSPMF } from './engine/pmfCalculator.js';
import { isBoardMeetingMonth, calculateDeltas, generateBoardFeedback, getBoardPhase } from './engine/boardMeeting.js';

/**
 * Draw 1-3 events for a month from the available pool.
 * Weighted: month 1-3 → 1-2 events, month 4+ → 2-3 events.
 */
function drawMonthEvents(month, usedEventIds) {
  const available = getAvailableEvents(DECISION_EVENTS, month, usedEventIds);
  if (available.length === 0) return [];

  const maxDraw = month <= 3 ? 2 : 3;
  const minDraw = month <= 2 ? 1 : 2;
  const count = Math.min(available.length, minDraw + Math.floor(Math.random() * (maxDraw - minDraw + 1)));

  // Shuffle and take
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const useGameStore = create((set, get) => ({
  // ─── Screen state ───
  screen: 'title', // title | setup | game | board | end

  // ─── Game config ───
  classId: null,
  classConfig: null,
  founderProfile: null,
  assumptions: {},
  forecast: [],

  // ─── Game state ───
  state: null,
  history: [],
  decisions: [],
  log: [],

  // ─── AP state ───
  ap: 3,
  maxAP: 3,

  // ─── Event state ───
  monthEvents: [],       // all events drawn for this month
  monthEventIndex: 0,    // which event we're showing
  currentEvent: null,
  currentWorldEvent: null,
  usedEvents: [],
  usedWorlds: [],
  lastFeedback: null,    // feedback from last choice/default (shown briefly)

  // ─── Result ───
  result: null,

  // ─── Board meeting ───
  boardData: null,

  // ─── Actions ───

  selectClass: (classId) => {
    const config = getClass(classId);
    if (!config) return;
    const defaults = {};
    config.assumptions.forEach(a => { defaults[a.key] = a.default; });
    set({ classId, classConfig: config, assumptions: defaults, screen: 'character' });
  },

  setFounderProfile: (profile) => {
    set({ founderProfile: profile, screen: 'setup' });
  },

  updateAssumption: (key, value) => {
    set(s => ({ assumptions: { ...s.assumptions, [key]: value } }));
  },

  startGame: () => {
    const { classId, classConfig, assumptions, founderProfile } = get();
    if (!classConfig) return;

    const forecast = generateSaaSForecast(assumptions);
    const em = founderProfile?.engineModifiers ?? {};

    // Apply founder modifiers to initial state
    const startingCashDelta = em.startingCashDelta ?? 0;
    const apMod = em.apModifier ?? 0;
    const basePipeline = assumptions.pipelineGrowth ?? classConfig.initial.pipeline ?? 12;

    const initial = {
      ...classConfig.initial,
      price: assumptions.price ?? classConfig.initial.price,
      churn: assumptions.churnRate ?? classConfig.initial.churn ?? 5,
      cac: assumptions.targetCAC ?? classConfig.initial.cac ?? 80,
      conversionRate: assumptions.conversionRate ?? classConfig.initial.conversionRate ?? 15,
      supportCost: assumptions.supportCost ?? classConfig.initial.supportCost ?? 5,
      pipeline: basePipeline + (em.pipelineBonus ?? 0),
      pipelineGrowth: basePipeline,
      mrrPerCustomer: assumptions.price ?? classConfig.initial.price ?? 49,
      cash: (classConfig.initial.cash ?? 100000) + startingCashDelta,
      maxAP: Math.max(2, 3 + apMod),
      // Store engine modifiers for ongoing use
      founderMods: em,
    };

    set({
      state: initial,
      history: [initial],
      decisions: [],
      usedEvents: [],
      usedWorlds: [],
      result: null,
      currentEvent: null,
      currentWorldEvent: null,
      monthEvents: [],
      monthEventIndex: 0,
      ap: 3,
      maxAP: 3,
      boardData: null,
      lastFeedback: null,
      forecast,
      log: [
        { text: `CloudKitchen initialized`, color: classConfig.color, prefix: '$' },
        { text: classConfig.tagline, color: 'muted' },
        ...(founderProfile ? [
          { text: `Difficulty: ${founderProfile.difficulty}/10 | Fundraising: ×${(em.fundraisingSuccessRate ?? 1).toFixed(2)}`, color: em.fundraisingSuccessRate < 0.8 ? 'danger' : 'muted', prefix: '◆' },
          ...(em.partTime ? [{ text: 'Part-time for first 6 months (−1 AP)', color: 'caution', prefix: '!' }] : []),
        ] : []),
        { text: `Win: ${classConfig.model.winBy}`, color: classConfig.color, prefix: '★' },
        { text: `Death: ${classConfig.model.deathBy}`, color: 'danger', prefix: '✗' },
        { text: `${initial.maxAP} AP per month. Choose wisely — what you skip resolves badly.`, color: 'caution', prefix: '!' },
      ],
      screen: 'game',
    });

    // Start month 1
    setTimeout(() => get()._startMonth(initial), 200);
  },

  /**
   * Internal: begin a new month. Calculates financials, checks world events, draws events.
   */
  _startMonth: (prevState) => {
    const { classConfig, usedEvents, usedWorlds, forecast, maxAP } = get();

    // Advance month + calculate financials
    const monthly = engineAdvance(prevState, classConfig);
    monthly.pmf = calculateSaaSPMF(monthly);

    // Natural churn pressure: churn drifts up slightly each month if product isn't improving
    if (monthly.month > 3 && (monthly.product ?? 30) < 40) {
      monthly.churn = Math.min(20, (monthly.churn ?? 5) + 0.5);
    }

    // Reset AP (maxAP can be modified by events like burnout)
    let effectiveMaxAP = monthly.maxAP ?? maxAP;
    // Part-time founders lose 1 AP for first N months
    const fm = monthly.founderMods || {};
    if (fm.partTime && monthly.month <= (fm.partTimeMonths ?? 6)) {
      effectiveMaxAP = Math.max(1, effectiveMaxAP - 1);
    }
    const ap = effectiveMaxAP;

    // Check for world event (40% chance after month 2)
    let worldEvent = null;
    if (monthly.month >= 3 && Math.random() < 0.4) {
      const availWorlds = WORLD_EVENTS.filter(w => !usedWorlds.includes(w.id));
      worldEvent = pickRandom(availWorlds);
    }

    if (worldEvent) {
      const impacted = worldEvent.effect(monthly);
      impacted.pmf = calculateSaaSPMF(impacted);
      const newHistory = [...get().history, impacted];

      set(s => ({
        state: impacted,
        history: newHistory,
        ap,
        usedWorlds: [...s.usedWorlds, worldEvent.id],
        currentWorldEvent: worldEvent,
        currentEvent: null,
        monthEvents: [],
        monthEventIndex: 0,
        lastFeedback: null,
        decisions: [...s.decisions, {
          month: monthly.month,
          event: worldEvent.title,
          choice: 'World Event',
          feedback: worldEvent.flavor,
          isWorld: true,
        }],
        log: [
          ...s.log,
          { text: `── Month ${monthly.month} ──`, color: classConfig.color, prefix: '▸' },
          { text: `AP: ${ap}/${effectiveMaxAP}`, color: 'muted' },
          { text: `${worldEvent.title}`, color: 'caution', prefix: '!' },
        ],
      }));

      // Check end
      const end = checkEndCondition(impacted, newHistory);
      if (end) { set({ result: end, screen: 'end' }); return; }
      return; // wait for dismissWorldEvent
    }

    // No world event — save state and draw events
    const newHistory = [...get().history, monthly];

    set(s => ({
      state: monthly,
      history: newHistory,
      ap,
      lastFeedback: null,
      log: [
        ...s.log,
        { text: `── Month ${monthly.month} ──`, color: classConfig.color, prefix: '▸' },
        { text: `AP: ${ap}/${effectiveMaxAP}`, color: 'muted' },
      ],
    }));

    // Check end
    const end = checkEndCondition(monthly, newHistory);
    if (end) { set({ result: end, screen: 'end' }); return; }

    // Check board meeting
    if (isBoardMeetingMonth(monthly.month)) {
      const deltas = calculateDeltas(forecast, monthly, monthly.month);
      const phase = getBoardPhase(monthly.month, false);
      const feedback = generateBoardFeedback(deltas, phase, monthly.month, monthly);
      set({ boardData: { deltas, phase, feedback, quarter: Math.ceil(monthly.month / 3) }, screen: 'board' });
      return;
    }

    // Draw events for this month
    get()._drawMonthEvents();
  },

  /**
   * Internal: draw events for this month and present first one.
   */
  _drawMonthEvents: () => {
    const { state, usedEvents } = get();
    const events = drawMonthEvents(state.month, usedEvents);

    if (events.length === 0) {
      // No events available — auto-advance
      get()._startMonth(state);
      return;
    }

    set({
      monthEvents: events,
      monthEventIndex: 0,
      currentEvent: events[0],
    });
  },

  /**
   * Player makes a choice on current event (costs AP).
   */
  makeChoice: (choice) => {
    const { state, currentEvent, classConfig, ap } = get();

    // Apply effects with variance
    const newState = applyEffectsWithVariance(choice.effects, state);
    newState.pmf = calculateSaaSPMF(newState);

    const feedback = choice.dynamicFeedback
      ? choice.dynamicFeedback(state)
      : choice.feedback;

    const newAP = ap - (choice.apCost ?? 1);

    set(s => ({
      state: newState,
      ap: newAP,
      lastFeedback: { text: feedback, type: 'choice' },
      decisions: [...s.decisions, {
        month: state.month,
        event: currentEvent.title,
        choice: choice.text,
        feedback,
        isWorld: false,
        wasDefault: false,
      }],
      usedEvents: [...s.usedEvents, currentEvent.repeatable ? `${currentEvent.id}_${state.month}` : currentEvent.id],
      currentEvent: null,
      log: [
        ...s.log,
        { text: `> ${choice.text}`, color: 'plan' },
        { text: feedback, color: 'muted', prefix: ' ' },
      ],
    }));

    // Next event or next month
    setTimeout(() => get()._nextEventOrMonth(), 100);
  },

  /**
   * Player skips current event (or forced by insufficient AP) → default outcome.
   */
  skipEvent: () => {
    const { state, currentEvent, ap } = get();
    if (!currentEvent) return;

    const def = currentEvent.defaultOutcome;
    const newState = applyEffectsWithVariance(def.effects, state);
    newState.pmf = calculateSaaSPMF(newState);
    // Check if ANY choice was affordable — if not, this skip was forced
    const choices = currentEvent.getChoices ? currentEvent.getChoices('saas') : [];
    const forced = !choices.some(ch => ap >= (ch.apCost ?? 1));

    set(s => ({
      state: newState,
      lastFeedback: { text: def.feedback, type: 'default' },
      decisions: [...s.decisions, {
        month: state.month,
        event: currentEvent.title,
        choice: forced ? '[No AP — unaddressed]' : '[Skipped]',
        feedback: def.feedback,
        isWorld: false,
        wasDefault: true,
      }],
      usedEvents: [...s.usedEvents, currentEvent.repeatable ? `${currentEvent.id}_${state.month}` : currentEvent.id],
      currentEvent: null,
      log: [
        ...s.log,
        { text: forced ? `✗ ${currentEvent.title} — no AP` : `✗ ${currentEvent.title} — skipped`, color: 'danger' },
        { text: def.feedback, color: 'danger', prefix: ' ' },
      ],
    }));

    setTimeout(() => get()._nextEventOrMonth(), 100);
  },

  /**
   * Internal: present next event or end the month.
   */
  _nextEventOrMonth: () => {
    const { monthEvents, monthEventIndex, state, ap } = get();
    const nextIdx = monthEventIndex + 1;

    if (nextIdx < monthEvents.length) {
      const nextEvent = monthEvents[nextIdx];
      set({ monthEventIndex: nextIdx, currentEvent: nextEvent, lastFeedback: null });

      // No auto-default — player always sees events and chooses.
      // If they can't afford any choice, they must skip manually.
    } else {
      // All events resolved → next month
      set({ lastFeedback: null });

      // Check end after all events
      const { history } = get();
      const end = checkEndCondition(state, history);
      if (end) { set({ result: end, screen: 'end' }); return; }

      setTimeout(() => get()._startMonth(state), 200);
    }
  },

  dismissWorldEvent: () => {
    const { state, forecast } = get();
    set({ currentWorldEvent: null });

    // Check end
    const { history } = get();
    const end = checkEndCondition(state, history);
    if (end) { set({ result: end, screen: 'end' }); return; }

    // Check board meeting
    if (isBoardMeetingMonth(state.month)) {
      const deltas = calculateDeltas(forecast, state, state.month);
      const phase = getBoardPhase(state.month, false);
      const feedback = generateBoardFeedback(deltas, phase, state.month, state);
      set({ boardData: { deltas, phase, feedback, quarter: Math.ceil(state.month / 3) }, screen: 'board' });
      return;
    }

    get()._drawMonthEvents();
  },

  reviseForecast: (newAssumptions) => {
    const forecast = generateSaaSForecast(newAssumptions);
    set(s => ({
      assumptions: newAssumptions,
      forecast,
      log: [
        ...s.log,
        { text: 'Forecast revised. New plan set.', color: 'plan', prefix: '📊' },
      ],
    }));
  },

  closeBoardMeeting: () => {
    set({ boardData: null, screen: 'game' });
    get()._drawMonthEvents();
  },

  restart: () => {
    set({
      screen: 'title',
      classId: null, classConfig: null, founderProfile: null, assumptions: {}, forecast: [],
      state: null, history: [], decisions: [], log: [],
      ap: 3, maxAP: 3,
      monthEvents: [], monthEventIndex: 0,
      currentEvent: null, currentWorldEvent: null,
      usedEvents: [], usedWorlds: [],
      lastFeedback: null, result: null, boardData: null,
    });
  },
}));
