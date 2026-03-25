// ═══════════════════════════════════════════════════════════════
// BOARD MEETING ENGINE
// Quarterly reviews: Forecast vs. Actual, board reactions.
// ═══════════════════════════════════════════════════════════════

/**
 * Check if it's time for a board meeting.
 */
export function isBoardMeetingMonth(month) {
  return month > 0 && month % 3 === 0;
}

/**
 * Calculate deltas between forecast and actual for a given month.
 * Returns array of { metric, forecast, actual, delta, deltaPct, status }
 */
export function calculateDeltas(forecast, actual, month) {
  if (!forecast[month] || !actual) return [];

  const f = forecast[month];
  const a = actual;

  const metrics = [
    { key: 'totalMRR', label: 'MRR', format: '€' },
    { key: 'customers', label: 'Customers', format: '' },
    { key: 'cac', label: 'CAC', format: '€' },
    { key: 'churn', label: 'Churn', format: '%' },
    { key: 'ltvCacRatio', label: 'LTV:CAC', format: 'x' },
    { key: 'cash', label: 'Cash', format: '€' },
    { key: 'burnRate', label: 'Burn Rate', format: '€' },
  ];

  return metrics.map(m => {
    const fVal = f[m.key] ?? 0;
    const aVal = a[m.key] ?? 0;
    const delta = aVal - fVal;
    const deltaPct = fVal !== 0 ? Math.round((delta / Math.abs(fVal)) * 100) : 0;

    // For churn and CAC, LOWER actual is better (invert status)
    const invertedMetrics = ['churn', 'cac', 'burnRate'];
    const isInverted = invertedMetrics.includes(m.key);

    let status = 'neutral';
    if (Math.abs(deltaPct) > 20) {
      if (isInverted) {
        status = delta < 0 ? 'above' : 'below'; // lower churn/CAC = good
      } else {
        status = delta > 0 ? 'above' : 'below';
      }
    }

    return {
      key: m.key,
      label: m.label,
      format: m.format,
      forecast: fVal,
      actual: aVal,
      delta,
      deltaPct,
      status, // 'above' = good, 'below' = bad, 'neutral' = within ±20%
    };
  });
}

/**
 * Get board phase based on month and fundraising state.
 */
export function getBoardPhase(month, hasFundraised) {
  if (month <= 6 && !hasFundraised) return 'pre-funding';
  if (hasFundraised) return 'seed';
  return 'angel';
}

/**
 * Generate board feedback based on deltas and phase.
 * Returns array of { speaker, text, tone }
 */
export function generateBoardFeedback(deltas, phase, month) {
  const feedback = [];
  const quarter = Math.ceil(month / 3);

  // Find worst misses
  const misses = deltas.filter(d => d.status === 'below');
  const wins = deltas.filter(d => d.status === 'above');

  if (phase === 'pre-funding') {
    // Self-reflective tone
    if (misses.length === 0 && wins.length > 0) {
      feedback.push({
        speaker: 'Self',
        text: `Q${quarter} delivered. ${wins[0].label} is ${Math.abs(wins[0].deltaPct)}% above forecast. The model is holding.`,
        tone: 'positive',
      });
    } else if (misses.length > 0) {
      const worst = misses.reduce((a, b) => Math.abs(a.deltaPct) > Math.abs(b.deltaPct) ? a : b);
      feedback.push({
        speaker: 'Self',
        text: `${worst.label} is ${Math.abs(worst.deltaPct)}% off forecast. ${getMetricAdvice(worst.key)}`,
        tone: 'critical',
      });
    } else {
      feedback.push({
        speaker: 'Self',
        text: `Q${quarter} on plan. No major surprises. That's either good execution or bad measurement.`,
        tone: 'neutral',
      });
    }
  } else {
    // Investor present — more pointed
    if (misses.length >= 2) {
      feedback.push({
        speaker: 'Investor',
        text: `Two metrics off. ${misses[0].label} and ${misses[1].label}. What changed since last quarter?`,
        tone: 'critical',
      });
    } else if (misses.length === 1) {
      feedback.push({
        speaker: 'Investor',
        text: `${misses[0].label} missed by ${Math.abs(misses[0].deltaPct)}%. One miss is a data point, two is a pattern. Watch it.`,
        tone: 'warning',
      });
    } else if (wins.length > 0) {
      feedback.push({
        speaker: 'Investor',
        text: `Numbers are tracking. ${wins[0].label} outperforming. What's driving that?`,
        tone: 'positive',
      });
    }
  }

  return feedback;
}

function getMetricAdvice(key) {
  const advice = {
    totalMRR: 'Either the price point is wrong or conversion is weaker than assumed.',
    customers: 'Pipeline or conversion needs attention. Which is the bottleneck?',
    cac: 'Acquisition is more expensive than planned. Channel economics or targeting issue.',
    churn: 'Users are leaving faster than expected. Product-market fit question.',
    ltvCacRatio: 'Unit economics are underwater. Fix churn or CAC before scaling.',
    cash: 'Burn is outpacing plan. Either cut costs or accelerate revenue.',
    burnRate: 'Spending above forecast. Intentional investment or scope creep?',
  };
  return advice[key] || 'Revisit the assumption behind this number.';
}
