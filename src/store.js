// ═══════════════════════════════════════════════════════════════
// GAME STORE (Zustand)
// Single source of truth for all game state.
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

export const useGameStore = create((set, get) => ({
  // ─── Screen state ───
  screen: 'title', // title | setup | game | board | end

  // ─── Game config ───
  classId: null,
  classConfig: null,
  assumptions: {},
  forecast: [],

  // ─── Game state ───
  state: null,
  history: [],
  decisions: [],
  log: [],

  // ─── Event state ───
  currentEvent: null,
  currentWorldEvent: null,
  usedEvents: [],
  usedWorlds: [],

  // ─── Result ───
  result: null, // null | 'dead' | 'pmf' | 'survived'

  // ─── Board meeting ───
  boardData: null,

  // ─── Actions ───

  selectClass: (classId) => {
    const config = getClass(classId);
    if (!config) return;

    // Set default assumptions
    const defaults = {};
    config.assumptions.forEach(a => { defaults[a.key] = a.default; });

    set({
      classId,
      classConfig: config,
      assumptions: defaults,
      screen: 'setup',
    });
  },

  updateAssumption: (key, value) => {
    set(s => ({ assumptions: { ...s.assumptions, [key]: value } }));
  },

  startGame: () => {
    const { classId, classConfig, assumptions } = get();
    if (!classConfig) return;

    // Generate forecast from assumptions
    const forecast = generateSaaSForecast(assumptions);

    // Initialize game state from class defaults + player assumptions
    const initial = {
      ...classConfig.initial,
      price: assumptions.price ?? classConfig.initial.price,
      churn: assumptions.churnRate ?? classConfig.initial.churn ?? 5,
      cac: assumptions.targetCAC ?? classConfig.initial.cac ?? 80,
      conversionRate: assumptions.conversionRate ?? classConfig.initial.conversionRate ?? 15,
      supportCost: assumptions.supportCost ?? classConfig.initial.supportCost ?? 5,
      pipeline: assumptions.pipelineGrowth ?? classConfig.initial.pipeline ?? 12,
      mrrPerCustomer: assumptions.price ?? classConfig.initial.price ?? 49,
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
      boardData: null,
      forecast,
      log: [
        { text: `CloudKitchen initialized`, color: classConfig.color, prefix: '$' },
        { text: classConfig.tagline, color: 'muted' },
        { text: `Win: ${classConfig.model.winBy}`, color: classConfig.color, prefix: '★' },
        { text: `Death: ${classConfig.model.deathBy}`, color: 'danger', prefix: '✗' },
        { text: 'Outcomes vary ±30%. The market doesn\'t care about your plans.', color: 'caution', prefix: '!' },
      ],
      screen: 'game',
    });

    // Draw first event
    setTimeout(() => {
      const avail = getAvailableEvents(DECISION_EVENTS, 1, []);
      const ev = pickRandom(avail);
      if (ev) set({ currentEvent: ev });
    }, 200);
  },

  advanceToNextMonth: (newState) => {
    const { classConfig, usedEvents, usedWorlds, forecast } = get();

    // Advance month + calculate financials
    const monthly = engineAdvance(newState, classConfig);

    // Recalculate PMF
    monthly.pmf = calculateSaaSPMF(monthly);

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
        usedWorlds: [...s.usedWorlds, worldEvent.id],
        currentWorldEvent: worldEvent,
        currentEvent: null,
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
          { text: `${worldEvent.title}`, color: 'caution', prefix: '!' },
        ],
      }));

      // Check end condition
      const end = checkEndCondition(impacted, newHistory);
      if (end) {
        set({ result: end, screen: 'end' });
        return;
      }
      return;
    }

    // No world event — normal month
    const newHistory = [...get().history, monthly];

    set(s => ({
      state: monthly,
      history: newHistory,
      log: [
        ...s.log,
        { text: `── Month ${monthly.month} ──`, color: classConfig.color, prefix: '▸' },
      ],
    }));

    // Check end condition
    const end = checkEndCondition(monthly, newHistory);
    if (end) {
      set({ result: end, screen: 'end' });
      return;
    }

    // Check for board meeting
    if (isBoardMeetingMonth(monthly.month)) {
      const deltas = calculateDeltas(forecast, monthly, monthly.month);
      const phase = getBoardPhase(monthly.month, false);
      const feedback = generateBoardFeedback(deltas, phase, monthly.month);

      set({
        boardData: { deltas, phase, feedback, quarter: Math.ceil(monthly.month / 3) },
        screen: 'board',
      });
      return;
    }

    // Draw next decision event
    const avail = getAvailableEvents(DECISION_EVENTS, monthly.month, get().usedEvents);
    const ev = pickRandom(avail);
    if (ev) {
      set({ currentEvent: ev });
    } else {
      // No events available — auto-advance
      get().advanceToNextMonth(monthly);
    }
  },

  makeChoice: (choice) => {
    const { state, currentEvent, classConfig } = get();

    // Apply effects with variance
    const newState = applyEffectsWithVariance(choice.effects, state);

    // Get feedback
    const feedback = choice.dynamicFeedback
      ? choice.dynamicFeedback(state)
      : choice.feedback;

    set(s => ({
      decisions: [...s.decisions, {
        month: state.month,
        event: currentEvent.title,
        choice: choice.text,
        feedback,
        isWorld: false,
      }],
      usedEvents: [...s.usedEvents, currentEvent.id],
      currentEvent: null,
      log: [
        ...s.log,
        { text: `> ${choice.text}`, color: 'plan' },
        { text: feedback, color: 'muted', prefix: ' ' },
      ],
    }));

    // Advance to next month
    setTimeout(() => get().advanceToNextMonth(newState), 100);
  },

  dismissWorldEvent: () => {
    const { state, usedEvents } = get();
    set({ currentWorldEvent: null });

    // Check for board meeting
    const { forecast } = get();
    if (isBoardMeetingMonth(state.month)) {
      const deltas = calculateDeltas(forecast, state, state.month);
      const phase = getBoardPhase(state.month, false);
      const feedback = generateBoardFeedback(deltas, phase, state.month);

      set({
        boardData: { deltas, phase, feedback, quarter: Math.ceil(state.month / 3) },
        screen: 'board',
      });
      return;
    }

    // Draw next decision event
    const avail = getAvailableEvents(DECISION_EVENTS, state.month, usedEvents);
    const ev = pickRandom(avail);
    if (ev) {
      set({ currentEvent: ev });
    } else {
      get().advanceToNextMonth(state);
    }
  },

  closeBoardMeeting: () => {
    const { state, usedEvents } = get();
    set({ boardData: null, screen: 'game' });

    // Draw next event
    const avail = getAvailableEvents(DECISION_EVENTS, state.month, usedEvents);
    const ev = pickRandom(avail);
    if (ev) {
      set({ currentEvent: ev });
    } else {
      get().advanceToNextMonth(state);
    }
  },

  restart: () => {
    set({
      screen: 'title',
      classId: null,
      classConfig: null,
      assumptions: {},
      forecast: [],
      state: null,
      history: [],
      decisions: [],
      log: [],
      currentEvent: null,
      currentWorldEvent: null,
      usedEvents: [],
      usedWorlds: [],
      result: null,
      boardData: null,
    });
  },
}));
