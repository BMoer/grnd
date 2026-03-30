// ═══════════════════════════════════════════════════════════════
// BOARD MEETING ENGINE
// Quarterly reviews: Forecast vs. Actual, board reactions.
// Board composition evolves over time and with fundraising.
// ═══════════════════════════════════════════════════════════════

/**
 * Check if it's time for a board meeting.
 */
export function isBoardMeetingMonth(month) {
  return month > 0 && month % 3 === 0;
}

/**
 * Calculate deltas between forecast and actual for a given month.
 */
export function calculateDeltas(forecast, actual, month) {
  if (!forecast[month] || !actual) return [];

  const f = forecast[month];
  const a = actual;

  const metrics = [
    { key: 'totalMRR', label: 'MRR', format: '€' },
    { key: 'customers', label: 'Customers', format: '' },
    { key: 'cac', label: 'CAC', format: '€' },
    { key: 'churn', label: 'Churn', format: '%', decimals: 1 },
    { key: 'ltvCacRatio', label: 'LTV:CAC', format: 'x' },
    { key: 'cash', label: 'Cash', format: '€' },
    { key: 'burnRate', label: 'Burn Rate', format: '€' },
    { key: 'pipeline', label: 'Pipeline', format: '' },
  ];

  return metrics.map(m => {
    const fVal = f[m.key] ?? 0;
    const aVal = a[m.key] ?? 0;
    const delta = aVal - fVal;
    const deltaPct = fVal !== 0 ? Math.round((delta / Math.abs(fVal)) * 100) : 0;

    const invertedMetrics = ['churn', 'cac', 'burnRate'];
    const isInverted = invertedMetrics.includes(m.key);

    let status = 'neutral';
    if (Math.abs(deltaPct) > 20) {
      if (isInverted) {
        status = delta < 0 ? 'above' : 'below';
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
      status,
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
export function generateBoardFeedback(deltas, phase, month, state = {}) {
  const feedback = [];
  const quarter = Math.ceil(month / 3);

  const misses = deltas.filter(d => d.status === 'below');
  const wins = deltas.filter(d => d.status === 'above');
  const mrrDelta = deltas.find(d => d.key === 'totalMRR');
  const cashDelta = deltas.find(d => d.key === 'cash');
  const churnDelta = deltas.find(d => d.key === 'churn');
  const runway = state.runway ?? 99;
  const pmf = state.pmf ?? 0;

  if (phase === 'pre-funding') {
    // Self-reflective tone — founders talking to each other
    if (misses.length === 0 && wins.length > 0) {
      const templates = [
        `Q${quarter} delivered. ${wins[0].label} is ${Math.abs(wins[0].deltaPct)}% above forecast. The model is holding. Don't get comfortable — one good quarter is data, two is a pattern.`,
        `Good quarter. ${wins.map(w => w.label).join(' and ')} outperforming. The question is: are we good, or are we lucky?`,
        `Numbers are up. ${wins[0].label} surprised us. Time to ask: was this the plan working, or a one-off?`,
      ];
      feedback.push({
        speaker: 'Mira',
        text: templates[quarter % templates.length],
        tone: 'positive',
      });
    } else if (misses.length >= 2) {
      feedback.push({
        speaker: 'Jonas',
        text: `${misses[0].label} and ${misses[1].label} both missed. ${misses[0].label} by ${Math.abs(misses[0].deltaPct)}%, ${misses[1].label} by ${Math.abs(misses[1].deltaPct)}%. We need to figure out if this is execution or if the assumptions were wrong.`,
        tone: 'critical',
      });
      if (churnDelta?.status === 'below') {
        feedback.push({
          speaker: 'Mira',
          text: `Churn is the canary. If people are leaving, no amount of pipeline fixes the math. We need to talk to the people who left.`,
          tone: 'critical',
        });
      }
    } else if (misses.length === 1) {
      const worst = misses[0];
      feedback.push({
        speaker: 'Jonas',
        text: `${worst.label} is ${Math.abs(worst.deltaPct)}% off forecast. ${getMetricAdvice(worst.key)} One miss is fine. A pattern isn't.`,
        tone: 'warning',
      });
    } else {
      const templates = [
        `On plan. No major surprises. That's either good execution or bad measurement. Let's make sure it's the former.`,
        `Tracking forecast. Not exciting, not scary. The boring middle is where most startups live — and where discipline matters most.`,
      ];
      feedback.push({
        speaker: 'Mira',
        text: templates[quarter % templates.length],
        tone: 'neutral',
      });
    }

    // Add runway commentary if it's getting tight
    if (runway < 6) {
      feedback.push({
        speaker: 'Jonas',
        text: `${runway} months of runway. We need to have the hard conversation about either cutting costs or raising money. This isn't abstract anymore.`,
        tone: 'critical',
      });
    } else if (runway < 10) {
      feedback.push({
        speaker: 'Mira',
        text: `${runway} months of runway. Not urgent, but the clock is ticking. Every month without revenue growth shortens this number.`,
        tone: 'warning',
      });
    }

  } else {
    // Investor present — more pointed, data-driven
    if (misses.length >= 3) {
      feedback.push({
        speaker: 'Investor',
        text: `Three metrics off this quarter. That's not variance — that's a signal. What's the one thing you'd fix if you could only fix one?`,
        tone: 'critical',
      });
      feedback.push({
        speaker: 'Mira',
        text: `Fair question. We need to prioritize. Fixing everything means fixing nothing.`,
        tone: 'neutral',
      });
    } else if (misses.length >= 1) {
      const worst = misses.reduce((a, b) => Math.abs(a.deltaPct) > Math.abs(b.deltaPct) ? a : b);
      feedback.push({
        speaker: 'Investor',
        text: `${worst.label} missed by ${Math.abs(worst.deltaPct)}%. ${getInvestorAdvice(worst.key)} What's the plan for next quarter?`,
        tone: misses.length > 1 ? 'critical' : 'warning',
      });
    }

    if (wins.length > 0 && misses.length === 0) {
      feedback.push({
        speaker: 'Investor',
        text: `Solid quarter. ${wins[0].label} outperforming by ${Math.abs(wins[0].deltaPct)}%. This is the kind of trajectory that makes the next round easier. Don't let up.`,
        tone: 'positive',
      });
    }

    // PMF commentary (only if not already critical — avoid contradictions)
    if (pmf > 65 && misses.length <= 1) {
      feedback.push({
        speaker: 'Investor',
        text: `PMF score at ${pmf}. You're in the zone. The question now is: can you scale this without breaking it?`,
        tone: 'positive',
      });
    } else if (pmf < 40 && month > 9) {
      feedback.push({
        speaker: 'Investor',
        text: `PMF at ${pmf} after ${month} months. We should talk about whether this market is real or whether a pivot is warranted.`,
        tone: 'critical',
      });
    }

    // Runway commentary
    if (runway < 4) {
      feedback.push({
        speaker: 'Investor',
        text: `${runway} months of runway. We're in emergency territory. You need to either close a round or cut to survival mode. Today.`,
        tone: 'critical',
      });
    }
  }

  // Always add at least one piece of feedback
  if (feedback.length === 0) {
    feedback.push({
      speaker: phase === 'pre-funding' ? 'Jonas' : 'Investor',
      text: `Quarter ${quarter} is in the books. Let's see what the next three months bring.`,
      tone: 'neutral',
    });
  }

  return feedback;
}

function getMetricAdvice(key) {
  const advice = {
    totalMRR: 'Either the price point is wrong or conversion is weaker than assumed.',
    customers: 'Pipeline or conversion — which is the bottleneck?',
    cac: 'Acquisition is more expensive than planned. Channel or targeting issue.',
    churn: 'Users are leaving faster than expected. This is THE question.',
    ltvCacRatio: 'Unit economics are underwater. Fix churn or CAC before scaling.',
    cash: 'Burn is outpacing plan. Cut or accelerate.',
    burnRate: 'Spending above forecast. Intentional or scope creep?',
    pipeline: 'Not enough leads. Marketing channel or market size issue.',
  };
  return advice[key] || 'Revisit the assumption behind this number.';
}

function getInvestorAdvice(key) {
  const advice = {
    totalMRR: 'Revenue is the ultimate signal. I need to understand what changed.',
    customers: 'Customer count drives everything. What\'s blocking acquisition?',
    cac: 'CAC above plan means you\'re paying too much for growth. That doesn\'t scale.',
    churn: 'Churn is the most honest metric. It tells you if the product works.',
    ltvCacRatio: 'Unit economics have to work at this stage. No exceptions.',
    cash: 'Cash position is concerning. Let\'s talk about the path to sustainability.',
    burnRate: 'Burn rate above plan needs a clear justification. What did the extra spend buy?',
    pipeline: 'Pipeline is the leading indicator. When pipeline drops, revenue drops 2 quarters later.',
  };
  return advice[key] || 'Help me understand this number.';
}
