// ═══════════════════════════════════════════════════════════════
// VARIANCE ENGINE
// All numeric outcomes get ±30% randomness.
// Reality corridors define what's actually possible per metric.
// ═══════════════════════════════════════════════════════════════

/**
 * Apply ±variance to a base number.
 * Returns rounded integer.
 */
export function applyVariance(base, variance = 0.3) {
  if (typeof base !== 'number' || base === 0) return base;
  const factor = 1 + (Math.random() * 2 - 1) * variance;
  return Math.round(base * factor);
}

/**
 * Draw a value from a reality corridor.
 * The corridor is centered on `realistic`, not on the player's assumption.
 * Values are weighted toward the center (normal-ish distribution).
 */
export function drawFromCorridor(corridor) {
  const { min, max, center } = corridor;
  // Box-Muller-ish: average of 3 uniform randoms → bell-shaped
  const u = (Math.random() + Math.random() + Math.random()) / 3;
  // Map [0,1] to [min,max] weighted toward center
  const range = max - min;
  const value = min + u * range;
  // Blend toward center (60% corridor draw, 40% center pull)
  const blended = value * 0.6 + center * 0.4;
  return Math.round(Math.max(min, Math.min(max, blended)));
}

/**
 * Apply effects from an event choice with ±30% variance on deltas.
 * Only varies the CHANGE, not the absolute value.
 */
export function applyEffectsWithVariance(effects, currentState) {
  const result = typeof effects === 'function' ? effects(currentState) : { ...effects };
  const varied = { ...result };

  const numericKeys = [
    'revenue', 'customers', 'cash', 'burnRate', 'pipeline',
    'supply', 'demand', 'gmv', 'liquidity', 'margin',
    'utilization', 'product', 'pmf', 'cac', 'mrrPerCustomer',
    'avgProject', 'churn', 'activationRate', 'repeatRate',
    'newTrials', 'conversions', 'totalMRR', 'supportCosts',
  ];

  for (const key of numericKeys) {
    if (result[key] !== undefined && currentState[key] !== undefined && result[key] !== currentState[key]) {
      const delta = result[key] - currentState[key];
      const variedDelta = applyVariance(delta, 0.3);
      varied[key] = Math.round(currentState[key] + variedDelta);
    }
  }

  // Floor at 0 for metrics that can't go negative
  const nonNegative = ['pmf', 'product', 'churn', 'customers', 'revenue', 'pipeline', 'cash'];
  for (const key of nonNegative) {
    if (varied[key] !== undefined) varied[key] = Math.max(0, varied[key]);
  }

  return varied;
}
