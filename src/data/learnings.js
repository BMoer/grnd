// ═══════════════════════════════════════════════════════════════
// LEARNINGS ENGINE — Post-game personalized takeaways
// Analyzes game history and generates learning insights.
// ═══════════════════════════════════════════════════════════════

/**
 * Generate personalized learnings based on game history.
 * Returns array of { title, text, type: 'insight' | 'warning' | 'success' }
 */
export function generateLearnings(state, history, decisions, forecast, founderProfile) {
  const learnings = [];
  const month = state.month ?? 0;
  const mrr = state.totalMRR ?? 0;
  const churn = state.churn ?? 0;
  const ltvCac = state.ltvCacRatio ?? 0;
  const pmf = state.pmf ?? 0;
  const cash = state.cash ?? 0;

  // ─── Forecast vs. Reality ───
  if (forecast && forecast[month]) {
    const planned = forecast[month];
    const mrrGap = mrr - (planned.totalMRR ?? 0);
    const mrrGapPct = planned.totalMRR > 0 ? Math.round((mrrGap / planned.totalMRR) * 100) : 0;

    if (Math.abs(mrrGapPct) > 20) {
      learnings.push({
        title: 'Plan vs. Reality',
        text: mrrGap < 0
          ? `Your MRR was ${Math.abs(mrrGapPct)}% below forecast. This is normal — founders typically overestimate their assumptions. The "Planning Fallacy" bias affects almost every startup.`
          : `Your MRR was ${mrrGapPct}% above forecast. That's rare! Either you were conservative or got lucky with events.`,
        type: mrrGap < 0 ? 'insight' : 'success',
      });
    }
  }

  // ─── Churn Analysis ───
  if (churn > 8) {
    learnings.push({
      title: 'Churn — The Silent Killer',
      text: `Your churn was ${churn.toFixed(1)}%. For B2B SaaS, 3-5% monthly churn is healthy, 5-8% is acceptable. Above 8% means you're losing customers faster than you acquire new ones. Common causes: poor onboarding, lack of product-market fit, or pricing too low (= no real commitment). This applies to any subscription business.`,
      type: 'warning',
    });
  } else if (churn < 5 && month > 6) {
    learnings.push({
      title: 'Strong Retention',
      text: `${churn.toFixed(1)}% churn is excellent for B2B SaaS. Your customers stay because they see real value. That's the foundation for sustainable growth — and the strongest signal of product-market fit.`,
      type: 'success',
    });
  }

  // ─── Unit Economics ───
  if (ltvCac > 0) {
    if (ltvCac < 1) {
      learnings.push({
        title: 'Unit Economics — Burning Money',
        text: `LTV:CAC of ${ltvCac.toFixed(1)}x means you spend more to acquire a customer than they'll ever bring in. Every new customer makes you poorer. Fix: lower CAC (better conversion, organic channels) or increase LTV (less churn, higher price).`,
        type: 'warning',
      });
    } else if (ltvCac >= 3) {
      learnings.push({
        title: 'Healthy Unit Economics',
        text: `LTV:CAC of ${ltvCac.toFixed(1)}x is a strong signal. Rule of thumb: > 3x = sustainable, > 5x = you can grow more aggressively. VCs look at this number first.`,
        type: 'success',
      });
    }
  }

  // ─── Pricing Insights ───
  const pricingDecision = decisions.find(d => d.event === 'The Pricing Question');
  if (pricingDecision) {
    learnings.push({
      title: 'Pricing Strategy',
      text: state.price > 70
        ? `You chose premium pricing (€${state.price}/mo). Higher prices mean fewer but more engaged customers. The risk: every market has a pain threshold. Above it, conversion drops sharply. The upside: higher commitment, lower churn, better unit economics.`
        : state.price < 35
        ? `You chose low pricing (€${state.price}/mo). Low prices reduce the barrier to entry, but also commitment. Customers who pay little churn faster. "Free" trains the market that your product has no value. This is one of the most common early-stage mistakes.`
        : `You priced moderately (€${state.price}/mo). That's often the sweet spot for B2B SaaS — enough commitment to filter serious users, not so much that it kills conversion.`,
      type: 'insight',
    });
  }

  // ─── Founder Background Impact ───
  if (founderProfile && founderProfile.difficulty > 5) {
    const fundRate = founderProfile.engineModifiers?.fundraisingSuccessRate ?? 1;
    learnings.push({
      title: 'Systemic Barriers',
      text: `Your founder profile had difficulty ${founderProfile.difficulty}/10. Fundraising rate: ×${fundRate.toFixed(2)}. These modifiers reflect documented inequalities — not personal ability. Studies show: the same pitch is evaluated differently depending on founder profile. The game makes these invisible barriers visible.`,
      type: 'insight',
    });
  }

  // ─── Decision Pattern Analysis ───
  const skipped = decisions.filter(d => d.wasDefault && !d.isWorld);
  const total = decisions.filter(d => !d.isWorld);
  if (skipped.length > total.length * 0.4) {
    learnings.push({
      title: 'Too Many Events Skipped',
      text: `You skipped ${skipped.length} of ${total.length} events. Every skipped event has a negative default outcome. AP management is critical: prioritize the most important events and consciously skip the less critical ones.`,
      type: 'warning',
    });
  }

  // ─── PMF Explanation ───
  learnings.push({
    title: 'What Is Product-Market Fit?',
    text: `PMF means your product solves a real problem so well that customers actively recommend it. In the game, measured by: low churn + growing MRR + good product quality + healthy customer base. Your final PMF score: ${pmf}/100. ${pmf >= 85 ? 'You achieved PMF!' : pmf >= 50 ? 'You were close.' : 'PMF was not yet in sight.'}`,
    type: pmf >= 85 ? 'success' : 'insight',
  });

  // ─── Decision Analysis ───
  const worldEvents = decisions.filter(d => d.isWorld);
  const activeDecisions = decisions.filter(d => !d.isWorld && !d.wasDefault);
  const skippedEvents = decisions.filter(d => d.wasDefault && !d.isWorld);

  // Luck analysis: world events
  if (worldEvents.length >= 3) {
    const positiveWorlds = worldEvents.filter(d =>
      d.event.includes('Press') || d.event.includes('Grant') || d.event.includes('Talent') ||
      d.event.includes('Trend') || d.event.includes('Labor') || d.event.includes('Competitor Data')
    );
    const negativeWorlds = worldEvents.filter(d =>
      d.event.includes('Downturn') || d.event.includes('Inflation') || d.event.includes('Bankruptcy') ||
      d.event.includes('Regulation') || d.event.includes('Supply Chain') || d.event.includes('Energy')
    );
    if (positiveWorlds.length > negativeWorlds.length + 1) {
      learnings.push({
        title: 'Luck Was on Your Side',
        text: `${positiveWorlds.length} favorable market events vs. ${negativeWorlds.length} negative ones. Some of your success was timing and luck — not just good decisions. In a real startup, you can't count on this.`,
        type: 'insight',
      });
    } else if (negativeWorlds.length > positiveWorlds.length + 1) {
      learnings.push({
        title: 'The Market Worked Against You',
        text: `${negativeWorlds.length} negative market events vs. ${positiveWorlds.length} favorable ones. Sometimes the environment is hostile regardless of your decisions. Resilience under bad conditions is a real founder skill.`,
        type: 'insight',
      });
    }
  }

  // Good call: low skip rate
  if (skippedEvents.length === 0 && activeDecisions.length > 5) {
    learnings.push({
      title: 'Nothing Left Unaddressed',
      text: `You addressed every single event. Strong AP management — in a real startup, this means you're responsive and engaged. The risk: saying yes to everything can mean you're not prioritizing.`,
      type: 'success',
    });
  }

  // Mistake analysis: burn rate growth
  if (history.length > 6) {
    const burnGrowth = (state.burnRate ?? 4500) - (history[1]?.burnRate ?? 4500);
    if (burnGrowth > 5000) {
      learnings.push({
        title: 'Cost Structure Grew Too Fast',
        text: `Your burn rate increased by €${burnGrowth.toLocaleString('en-US')} from where you started. Every hire and initiative adds permanent cost. In real startups, the #1 killer isn't bad products — it's costs growing faster than revenue.`,
        type: 'warning',
      });
    }
  }

  // ─── Cash Management ───
  if (cash <= 0) {
    const peakCash = Math.max(...history.map(h => h.cash ?? 0));
    const peakMonth = history.find(h => h.cash === peakCash)?.month ?? 0;
    learnings.push({
      title: 'Cash = Oxygen',
      text: `Your peak cash was €${peakCash.toLocaleString('en-US')} in month ${peakMonth}. After that it was downhill. The most common reasons: cost increases too fast (hires), revenue growth too slow, or failed fundraising. 90% of startups die from cash problems — not bad ideas.`,
      type: 'warning',
    });
  }

  return learnings;
}
