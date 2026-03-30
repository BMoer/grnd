// ═══════════════════════════════════════════════════════════════
// PMF CALCULATOR
// Composite Product-Market Fit score, calculated from metrics.
// Score 0-100. Win threshold: 70+ for 3 consecutive months.
//
// PMF is NEVER directly modified by events. It's always derived
// from underlying metrics: LTV:CAC, churn, MRR, customers, product.
// 
// Key insight: PMF requires BOTH good unit economics AND traction.
// Low churn alone isn't PMF — you also need meaningful revenue.
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate SaaS PMF score.
 * 
 * Components (rebalanced to require traction, not just low churn):
 * - MRR traction → 30 points max (THE proof of PMF)
 * - LTV:CAC ratio → 20 points max
 * - Churn health → 20 points max
 * - Customer count → 15 points max
 * - Product quality → 15 points max
 */
export function calculateSaaSPMF(state) {
  const { ltvCacRatio = 0, churn = 10, totalMRR = 0, customers = 0, product = 30 } = state;

  // MRR traction (0-30 points). €10K+ = max. Sqrt scaling so early MRR counts.
  // This is the biggest weight because MRR is the ultimate proof of value.
  const mrrScore = Math.min(30, Math.round((Math.sqrt(totalMRR) / Math.sqrt(10000)) * 30));

  // LTV:CAC (0-20 points). Target: 3.0+ for full score. Capped at 5.
  const ltvCacScore = Math.min(20, (Math.min(ltvCacRatio, 5) / 5) * 20);

  // Churn health (0-20 points). <3% = max, >12% = zero
  let churnScore = 0;
  if (churn <= 3) churnScore = 20;
  else if (churn >= 12) churnScore = 0;
  else churnScore = Math.round(20 * (1 - (churn - 3) / 9));

  // Customer count (0-15 points). 40+ = max
  const customerScore = Math.min(15, Math.round((customers / 40) * 15));

  // Product quality (0-15 points). 70+ = max
  const productScore = Math.min(15, Math.round(Math.max(0, product - 25) / 45 * 15));

  return Math.round(mrrScore + ltvCacScore + churnScore + customerScore + productScore);
}

/**
 * Check SaaS win condition (explicit metric check):
 * LTV:CAC > 3 AND monthly churn < 5% AND MRR > €10K for 3 consecutive months
 */
export function checkSaaSWin(history) {
  if (history.length < 4) return false;
  const last3 = history.slice(-3);
  return last3.every(s =>
    (s.ltvCacRatio || 0) > 3 &&
    (s.churn || 100) < 5 &&
    (s.totalMRR || 0) > 10000
  );
}
