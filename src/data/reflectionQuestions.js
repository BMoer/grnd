// ═══════════════════════════════════════════════════════════════
// REFLECTION QUESTIONS — End-screen prompts for individual reflection
// Class-specific questions shown after the run ends.
// No right answers — just questions that send the player
// back into their own experience before group discussion.
// ═══════════════════════════════════════════════════════════════

const REFLECTION_QUESTIONS = {
	saas: [
		"At which month did your churn rate start diverging from your plan — and did you notice it when it happened?",
		"If you could go back and change one assumption from your initial setup, which would it be — and what would you set it to now?",
		"Was there a moment where you chose growth over retention? What happened afterwards?",
		"Which metric did you watch most closely — and was it the right one to watch?",
	],
	consumer: [
		"Was your repeat rate ever as high as your viral coefficient assumed it would be?",
		"At what point did your ad spend start feeling like a trap — where stopping meant death, but continuing meant burning cash?",
		"Did you notice when your COGS per order started eating your margin? What caused it?",
		"If you had to describe your customer in one sentence — the one who actually came back — who were they?",
	],
	deeptech: [
		"What would have happened to your company if the FFG grant had not come — or had come 6 months later?",
		"At what point did you realize that LOIs are not the same as revenue? Was there a specific moment?",
		"How much of your time was spent on the technology versus on finding someone willing to pay for it?",
		"If certification had taken twice as long, would you have survived? What would you have done differently?",
	],
	marketplace: [
		"Which side — supply or demand — broke first? Did you treat both sides equally, or did you pick a side?",
		"Was there a month where liquidity felt like it was working? What was different about that month?",
		"When supply started churning, what signal did you miss — or see and ignore?",
		"If you could only spend money on one side of the marketplace for the first 6 months, which side would you choose now?",
	],
	service: [
		"Did you see the utilization-burnout trap before you were inside it? What was the first sign?",
		"At what point did adding another client stop feeling like growth and start feeling like a problem?",
		"If your gross margin tells you how much value you capture, what was your margin telling you?",
		"Was there a moment where you could have started productizing — building a repeatable offering — but chose another client instead?",
	],
};

/**
 * Get reflection questions for a class and result type.
 * Returns 3-4 questions.
 */
export function getReflectionQuestions(classId, result) {
	const questions = REFLECTION_QUESTIONS[classId] ?? REFLECTION_QUESTIONS.saas;

	// Add one result-specific question at the start
	const resultQuestion = getResultQuestion(result, classId);

	// Take 3 class questions + 1 result question = 4 total
	return [resultQuestion, ...questions.slice(0, 3)];
}

function getResultQuestion(result) {
	switch (result) {
		case "dead":
			return "Look at the month you died. Now look three months before that. The crisis was already visible — what would you have needed to change to survive?";
		case "pmf":
			return "You reached Product-Market Fit. Was it the plan that got you there, or did you stumble into something you didn't expect?";
		case "survived":
			return "You survived but didn't reach PMF. If you had 6 more months of runway, what would you do differently — or would more time even help?";
		case "acquired":
			return "You took the acquihire exit. Was that a strategic decision or a survival decision? When did you know it was the right call?";
		default:
			return "What was the single most important moment in your run — the decision that changed everything?";
	}
}
