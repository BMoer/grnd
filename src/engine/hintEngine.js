// ═══════════════════════════════════════════════════════════════
// HINT ENGINE — Contextual tips on poor performance
// Shows hints when certain thresholds are reached.
// Max 1 hint per month, prioritized by urgency.
// ═══════════════════════════════════════════════════════════════

const HINTS = [
  // ─── Critical (Prio 1) ───
  {
    id: 'runway_critical',
    check: (s) => (s.runway ?? 99) <= 3 && (s.runway ?? 99) > 0,
    text: '🚨 Runway under 3 months! Either cut costs drastically or push revenue now — or it\'s game over.',
    category: 'critical',
    cooldown: 3,
  },
  {
    id: 'cash_negative_trend',
    check: (s, h) => {
      if (h.length < 3) return false;
      const last3 = h.slice(-3);
      return last3.every((m, i) => i === 0 || m.cash < last3[i - 1].cash) && (s.cash ?? 0) < 50000;
    },
    text: '📉 Cash declining for 3 months. Your burn exceeds revenue — review your cost structure.',
    category: 'critical',
    cooldown: 4,
  },

  // ─── Churn / Retention (Prio 2) ───
  {
    id: 'churn_high',
    check: (s) => (s.churn ?? 0) > 10,
    text: '⚠️ Churn above 10%! You\'re losing customers faster than you gain them. Invest in product quality or talk to churning customers.',
    category: 'warning',
    cooldown: 4,
  },
  {
    id: 'churn_rising',
    check: (s, h) => {
      if (h.length < 4) return false;
      const last4 = h.slice(-4);
      return last4.every((m, i) => i === 0 || (m.churn ?? 0) >= (last4[i - 1].churn ?? 0)) && (s.churn ?? 0) > 6;
    },
    text: '📊 Churn rising for 4 months. That\'s a warning signal — without action it becomes an exodus.',
    category: 'warning',
    cooldown: 5,
  },

  // ─── Pipeline / Growth (Prio 3) ───
  {
    id: 'pipeline_low',
    check: (s) => (s.pipeline ?? 0) < 5 && (s.month ?? 0) > 3,
    text: '🔍 Pipeline nearly empty! Without new leads, no new customers. Invest in sales or marketing.',
    category: 'warning',
    cooldown: 3,
  },
  {
    id: 'no_revenue',
    check: (s) => (s.totalMRR ?? 0) === 0 && (s.month ?? 0) >= 3,
    text: '💰 Month 3+ with no revenue. Have you set a price? Without paying customers, you\'re not validating anything.',
    category: 'warning',
    cooldown: 4,
  },
  {
    id: 'no_growth',
    check: (s, h) => {
      if (h.length < 4 || (s.month ?? 0) < 5) return false;
      const last4 = h.slice(-4);
      const mrrRange = Math.abs((last4[last4.length - 1].totalMRR ?? 0) - (last4[0].totalMRR ?? 0));
      return mrrRange < 200 && (s.totalMRR ?? 0) > 0;
    },
    text: '📈 MRR stagnant for 4 months. Without growth you won\'t reach PMF. Check pipeline and conversion.',
    category: 'info',
    cooldown: 5,
  },

  // ─── Product (Prio 3) ───
  {
    id: 'product_low',
    check: (s) => (s.product ?? 30) < 25 && (s.month ?? 0) > 4,
    text: '🔧 Product quality very low. This drives churn up and conversion down. Invest in product events.',
    category: 'warning',
    cooldown: 4,
  },

  // ─── Unit Economics (Prio 3) ───
  {
    id: 'ltv_cac_bad',
    check: (s) => (s.ltvCacRatio ?? 0) > 0 && (s.ltvCacRatio ?? 0) < 1 && (s.month ?? 0) > 6,
    text: '⚖️ LTV:CAC below 1x — you\'re losing money on every customer. Either lower CAC (better conversion) or reduce churn (higher LTV).',
    category: 'warning',
    cooldown: 5,
  },

  // ─── Positive ───
  {
    id: 'pmf_close',
    check: (s) => (s.pmf ?? 0) >= 60 && (s.pmf ?? 0) < 85,
    text: '✨ PMF score above 60 — you\'re getting close! Keep churn low and MRR growing for 3 consecutive months.',
    category: 'positive',
    cooldown: 6,
  },
  {
    id: 'good_economics',
    check: (s) => (s.ltvCacRatio ?? 0) >= 3 && (s.churn ?? 20) < 5 && (s.month ?? 0) > 6,
    text: '🎯 Strong unit economics! LTV:CAC > 3x and churn < 5%. Now is the time to invest in growth.',
    category: 'positive',
    cooldown: 8,
  },
];

/**
 * Get a hint for the current state. Returns null or { text, category }.
 * Tracks cooldowns via shownHints map.
 */
export function getHint(state, history, shownHints = {}) {
  const month = state.month ?? 0;

  for (const hint of HINTS) {
    const lastShown = shownHints[hint.id] ?? -99;
    if (month - lastShown < hint.cooldown) continue;
    if (hint.check(state, history)) {
      return { id: hint.id, text: hint.text, category: hint.category };
    }
  }

  return null;
}
