// ═══════════════════════════════════════════════════════════════
// FOUNDER ATTRIBUTES + SYSTEMIC BIAS
// 
// Every modifier is sourced from published research.
// The game doesn't editorialize — it simulates documented conditions.
//
// Design: Show, don't preach. Difficulty is transparent.
// ═══════════════════════════════════════════════════════════════

// ─── Attribute Definitions ───

export const ATTRIBUTES = {
  tech: {
    key: 'tech',
    label: 'Technical',
    abbr: 'Tech',
    description: 'Product development speed/quality. Ability to evaluate technical hires.',
    highDesc: 'Build it yourself. Fast iteration, strong architecture.',
    lowDesc: 'Depend on hires. Bad tech decisions undetected longer.',
  },
  sales: {
    key: 'sales',
    label: 'Commercial',
    abbr: 'Sales',
    description: 'CAC efficiency, conversion rates, pricing confidence, pitch effectiveness.',
    highDesc: 'Sales feels natural. Enterprise deals close. Price holds.',
    lowDesc: 'Underprice, avoid outbound, hope product sells itself.',
  },
  network: {
    key: 'network',
    label: 'Network',
    abbr: 'Net',
    description: 'Starting pipeline, advisor quality, hiring pool, investor warm intros.',
    highDesc: 'Doors open. First customers from intros. Investors reply.',
    lowDesc: 'Every lead earned cold. Fundraising = unanswered emails.',
  },
  domain: {
    key: 'domain',
    label: 'Domain',
    abbr: 'Dom',
    description: 'Assumption accuracy, industry knowledge, customer trust.',
    highDesc: 'You know the market. Assumptions realistic. Customers trust you.',
    lowDesc: 'Learning the market while building for it.',
  },
  resilience: {
    key: 'resilience',
    label: 'Resilience',
    abbr: 'Res',
    description: 'Burnout probability, morale after setbacks, AP recovery.',
    highDesc: 'Setbacks are data. You process and continue.',
    lowDesc: 'Each rejection compounds. Burnout comes faster.',
  },
  capital: {
    key: 'capital',
    label: 'Capital',
    abbr: 'Cap',
    description: 'Starting cash, financial safety net, ability to take risks.',
    highDesc: 'Financial safety net. Can take risks. Can survive mistakes.',
    lowDesc: 'Every euro counts. No buffer. One bad quarter kills you.',
  },
};

// ─── Background Options ───

export const GENDER_OPTIONS = [
  { key: 'male', label: 'Male', description: 'Baseline — the system is calibrated to this.' },
  { key: 'female', label: 'Female', description: '2.3% of VC goes to all-female teams (PitchBook, 2025).' },
  { key: 'nonbinary', label: 'Non-binary', description: 'Limited data. Pattern-matching penalty modeled conservatively.' },
];

export const CLASS_OPTIONS = [
  { key: 'privileged', label: 'Privileged', description: '75% of VC-funded EU founders come from advantaged backgrounds (Cornerstone/Diversity VC, 2022).' },
  { key: 'middle', label: 'Middle class', description: 'Baseline.' },
  { key: 'working', label: 'Working class', description: '80% of pre-VC founders report "living comfortably." 3% report struggling (Cornerstone, 2022).' },
];

export const ETHNICITY_OPTIONS = [
  { key: 'majority', label: 'Majority', description: 'Baseline in European context.' },
  { key: 'minority', label: 'Ethnic minority', description: '1.8% of EU startup capital went to non-white founders (Atomico, 2021).' },
  { key: 'black', label: 'Black', description: '0.24% of UK VC funding 2009-2019 went to Black founders (Extend Ventures, 2020).' },
];

export const AGE_OPTIONS = [
  { key: '20s', label: '20s', description: 'More energy, less capital and connections.' },
  { key: '30s', label: '30s', description: 'Baseline. Peak founder age statistically.' },
  { key: '40s', label: '40s+', description: 'Deep networks and domain knowledge. Family obligations.' },
];

export const SPECIAL_CONDITIONS = [
  { key: 'none', label: 'None', description: 'No special condition.' },
  { key: 'serial', label: 'Serial founder (previous exit)', description: 'Net +3, Cap +3, Res +2, fundraising x1.5' },
  { key: 'phd', label: 'PhD / Academic', description: 'Tech +3, Dom +3, Sales -2, Net -1' },
  { key: 'corporate', label: 'Corporate escapee (10+ yrs)', description: 'Dom +2, Net +2, Cap +2, Sales +1, Res -1' },
  { key: 'heir', label: 'Family business heir', description: 'Cap +4, Net +3, Res -2, Dom +1' },
  { key: 'solo', label: 'Solo founder', description: 'AP permanently -1, burnout 2x' },
];

// ─── Preset Characters ───

export const PRESETS = {
  saas: {
    label: 'Mira & Jonas (Preset)',
    description: 'Mira Chen (Female, 30s, middle class, 2nd-gen Austrian) & Jonas Richter (Male, 30s, upper-middle, Austrian)',
    difficulty: 'Medium',
    attributes: { tech: 8, sales: 3, network: 4, domain: 6, resilience: 6, capital: 5 },
    // Mira is 2nd-gen Austrian (majority for bias purposes), but female
    // Jonas is male, upper-middle. Mixed-gender team.
    background: { gender: 'female', class: 'middle', ethnicity: 'majority', age: '30s', special: 'none' },
    // Mixed-gender team: gender fundraising penalty reduced, amount penalty removed
    teamModifiers: { fundraisingMultiplier: 0.85, fundraisingAmountMultiplier: 0.9 },
  },
};

// ─── Modifier Calculation ───

/**
 * Calculate attribute modifiers from background choices.
 * Returns { attributeDeltas, gameModifiers }.
 */
export function calculateBackgroundModifiers(background) {
  const deltas = { tech: 0, sales: 0, network: 0, domain: 0, resilience: 0, capital: 0 };
  const mods = {
    fundraisingSuccessRate: 1.0,
    fundraisingAmountMultiplier: 1.0,
    startingCashDelta: 0,
    apModifier: 0,          // permanent AP change
    burnoutMultiplier: 1.0,  // burnout chance multiplier
    grantBonus: 0,           // extra grant success chance
    pipelineBonus: 0,        // starting pipeline modifier
    corridorWidth: 1.0,      // narrower = better assumptions (domain)
    investorTone: 'neutral', // 'promotion' or 'prevention' or 'neutral'
    lateGameBonus: false,    // diverse founders get growth bonus after M12
    warmIntrosMonth: 4,      // month warm intros become available
    partTime: false,         // must work part-time initially
    sources: [],
  };

  // ─── Gender ───
  if (background.gender === 'female') {
    deltas.network -= 1;
    deltas.resilience += 1;
    mods.fundraisingSuccessRate *= 0.65;
    mods.fundraisingAmountMultiplier *= 0.70;
    mods.investorTone = 'prevention';
    mods.sources.push(
      'VC allocation: 2.3% to all-female teams (PitchBook/Founders Forum, 2025)',
      'Prevention vs. promotion questions: 2:1 ratio (Kanze et al., Academy of Management Journal, 2018)',
    );
  } else if (background.gender === 'nonbinary') {
    deltas.network -= 1;
    mods.fundraisingSuccessRate *= 0.75;
    mods.fundraisingAmountMultiplier *= 0.80;
    mods.investorTone = 'prevention';
    mods.sources.push('Limited data. Pattern-matching penalty modeled conservatively.');
  }

  // ─── Socioeconomic Class ───
  if (background.class === 'privileged') {
    deltas.network += 3;
    deltas.capital += 2;
    deltas.sales += 1;
    deltas.resilience -= 1;
    mods.startingCashDelta += 30000;
    mods.fundraisingSuccessRate *= 1.3;
    mods.warmIntrosMonth = 1;
    mods.pipelineBonus = 8;
    mods.sources.push(
      '75% of VC-funded EU founders from advantaged backgrounds (Cornerstone/Diversity VC, 2022)',
      '43% of UK seed funding to teams with Oxbridge/Harvard/Stanford (Extend Ventures, 2020)',
      'Warm intros 13x more likely to result in funding (Diversity VC, 2019)',
    );
  } else if (background.class === 'working') {
    deltas.network -= 3;
    deltas.capital -= 3;
    deltas.resilience += 2;
    deltas.domain += 1;
    mods.startingCashDelta -= 30000;
    mods.fundraisingSuccessRate *= 0.6;
    mods.warmIntrosMonth = 99; // no warm intros until earned
    mods.partTime = true;
    mods.grantBonus = 0.1; // diversity criteria in some programs
    mods.sources.push(
      '80% of pre-VC founders report "living comfortably" (Cornerstone, 2022)',
      'Working-class founders must often self-fund or work part-time',
    );
  }

  // ─── Ethnicity ───
  if (background.ethnicity === 'minority') {
    deltas.network -= 2;
    deltas.capital -= 1;
    deltas.resilience += 2;
    mods.fundraisingSuccessRate *= 0.45;
    mods.fundraisingAmountMultiplier *= 0.55;
    mods.grantBonus += 0.15;
    mods.lateGameBonus = true;
    mods.sources.push(
      '1.8% of EU startup capital to non-white founders (Atomico, 2021)',
      'Diverse teams achieve 30% higher returns (Kauffman Fellows)',
    );
  } else if (background.ethnicity === 'black') {
    deltas.network -= 3;
    deltas.capital -= 2;
    deltas.resilience += 3;
    mods.fundraisingSuccessRate *= 0.25;
    mods.fundraisingAmountMultiplier *= 0.40;
    mods.grantBonus += 0.2;
    mods.lateGameBonus = true;
    mods.sources.push(
      '0.24% of UK VC 2009-2019 to Black founders (Extend Ventures, 2020)',
      '88% of Black founders self-funded (10X10/Google)',
      'When funded, Black founders show statistically superior returns',
    );
  }

  // ─── Age ───
  if (background.age === '20s') {
    deltas.resilience += 1;
    deltas.capital -= 2;
    deltas.network -= 2;
    deltas.domain -= 1;
    mods.burnoutMultiplier = 0.7; // more energy
    mods.sources.push('Younger founders: more energy, less capital and connections.');
  } else if (background.age === '40s') {
    deltas.network += 2;
    deltas.domain += 2;
    deltas.capital += 1;
    deltas.resilience -= 1;
    mods.apModifier = -1; // family obligations
    mods.corridorWidth = 0.7; // more realistic assumptions
    mods.sources.push('40s+ founders: deeper networks, more realistic assumptions, family obligations.');
  }

  // ─── Special Conditions ───
  if (background.special === 'serial') {
    deltas.network += 3;
    deltas.capital += 3;
    deltas.resilience += 2;
    mods.fundraisingSuccessRate *= 1.5;
  } else if (background.special === 'phd') {
    deltas.tech += 3;
    deltas.domain += 3;
    deltas.sales -= 2;
    deltas.network -= 1;
  } else if (background.special === 'corporate') {
    deltas.domain += 2;
    deltas.network += 2;
    deltas.capital += 2;
    deltas.sales += 1;
    deltas.resilience -= 1;
  } else if (background.special === 'heir') {
    deltas.capital += 4;
    deltas.network += 3;
    deltas.resilience -= 2;
    deltas.domain += 1;
  } else if (background.special === 'solo') {
    mods.apModifier -= 1;
    mods.burnoutMultiplier = 2.0;
  }

  return { deltas, modifiers: mods };
}

/**
 * Apply attribute deltas to base attributes, clamping 1-10.
 */
export function applyDeltas(base, deltas) {
  const result = {};
  for (const key of Object.keys(base)) {
    result[key] = Math.max(1, Math.min(10, (base[key] ?? 5) + (deltas[key] ?? 0)));
  }
  return result;
}

/**
 * Calculate a difficulty rating (1-10) based on final attributes + modifiers.
 * Higher = harder.
 */
export function calculateDifficulty(attributes, modifiers) {
  // Fundraising difficulty (biggest factor)
  const fundScore = Math.max(0, 1 - modifiers.fundraisingSuccessRate) * 3;
  
  // Capital situation
  const capScore = Math.max(0, (5 - attributes.capital) * 0.3);
  
  // Network disadvantage
  const netScore = Math.max(0, (5 - attributes.network) * 0.3);
  
  // AP penalty
  const apScore = Math.abs(modifiers.apModifier) * 1.5;
  
  // Part-time penalty
  const ptScore = modifiers.partTime ? 1 : 0;
  
  const raw = 3 + fundScore + capScore + netScore + apScore + ptScore;
  return Math.max(1, Math.min(10, Math.round(raw)));
}

/**
 * Compute how attributes modify game engine parameters.
 * Returns an object that the engine reads each month.
 */
export function computeEngineModifiers(attributes, gameModifiers) {
  return {
    // Tech → product development speed (events that improve product)
    productBonus: Math.round((attributes.tech - 5) * 0.8), // -3.2 to +4

    // Sales → CAC reduction, conversion bonus
    cacMultiplier: 1 - (attributes.sales - 5) * 0.04, // 0.8 to 1.2
    conversionBonus: (attributes.sales - 5) * 0.5,     // -2.5 to +2.5 pp

    // Network → starting pipeline, warm intros availability
    pipelineBonus: (attributes.network - 5) * 2 + (gameModifiers.pipelineBonus || 0),
    warmIntrosMonth: gameModifiers.warmIntrosMonth ?? 4,

    // Domain → corridor width (narrower = more accurate)
    corridorWidth: (gameModifiers.corridorWidth ?? 1.0) * (1 - (attributes.domain - 5) * 0.05),

    // Resilience → burnout, AP recovery
    burnoutMultiplier: (gameModifiers.burnoutMultiplier ?? 1.0) * (1 - (attributes.resilience - 5) * 0.08),
    apRecoveryBonus: attributes.resilience > 7 ? 1 : 0,

    // Capital → starting cash
    startingCashDelta: gameModifiers.startingCashDelta ?? 0,

    // Fundraising
    fundraisingSuccessRate: gameModifiers.fundraisingSuccessRate ?? 1.0,
    fundraisingAmountMultiplier: gameModifiers.fundraisingAmountMultiplier ?? 1.0,

    // AP
    apModifier: gameModifiers.apModifier ?? 0,

    // Part-time
    partTime: gameModifiers.partTime ?? false,
    partTimeMonths: 6, // first 6 months if working class

    // Investor tone
    investorTone: gameModifiers.investorTone ?? 'neutral',

    // Late game bonus (diverse founders)
    lateGameBonus: gameModifiers.lateGameBonus ?? false,

    // Grant bonus
    grantBonus: gameModifiers.grantBonus ?? 0,

    // Sources for transparency
    sources: gameModifiers.sources ?? [],
  };
}
