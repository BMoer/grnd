// ═══════════════════════════════════════════════════════════════
// PMF CALCULATOR
// Composite Product-Market Fit score, calculated per class.
// Score 0-100. Win threshold: 60+ for 3 consecutive months.
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate SaaS PMF score.
 * 
 * Components:
 * - LTV:CAC ratio (capped at 5) → 30 points max
 * - Churn health (lower = better) → 25 points max
 * - MRR traction → 25 points max  
 * - Customer count → 20 points max
 */
export function calculateSaaSPMF(state) {
  const { ltvCacRatio = 0, churn = 10, totalMRR = 0, customers = 0 } = state;

  // LTV:CAC (0-30 points). Target: 3.0+
  const ltvCacScore = Math.min(30, (Math.min(ltvCacRatio, 5) / 5) * 30);

  // Churn health (0-25 points). <3% = perfect, >15% = zero
  const churnScore = churn <= 3 ? 25 : churn >= 15 ? 0 : Math.round(25 * (1 - (churn - 3) / 12));

  // MRR traction (0-25 points). €10K+ = max
  const mrrScore = Math.min(25, (totalMRR / 10000) * 25);

  // Customer count (0-20 points). 50+ = max
  const customerScore = Math.min(20, (customers / 50) * 20);

  return Math.round(ltvCacScore + churnScore + mrrScore + customerScore);
}

/**
 * Check SaaS win condition:
 * LTV:CAC > 3 AND monthly churn < 5% AND MRR > €10K for 3 consecutive months
 */
export function checkSaaSWin(history) {
  if (history.length < 3) return false;
  const last3 = history.slice(-3);
  return last3.every(s =>
    (s.ltvCacRatio || 0) > 3 &&
    (s.churn || 100) < 5 &&
    (s.totalMRR || 0) > 10000
  );
}
