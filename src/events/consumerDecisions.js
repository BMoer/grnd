// ═══════════════════════════════════════════════════════════════
// DECISION EVENTS — Consumer Class (GlowUp)
// D2C wellness: ads, brand, retention, viral growth
// ═══════════════════════════════════════════════════════════════

export const CONSUMER_EVENTS = [
  // ─── PHASE 1: Early (Months 1-4) ───
  {
    id: 'c_first_ad_campaign',
    speaker: 'Nina Volkov',
    speakerRole: 'Co-founder, Brand',
    months: [1, 2],
    title: 'The First Paid Campaign',
    text: '"My follower base got us the first 200 orders. But organic reach is dying. We need paid ads. I have three concepts ready — which one do we run?"',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, pipeline: Math.max(0, (s.pipeline ?? 0) - 3) }),
      feedback: 'No campaign. The organic orders slowed to a trickle. Without paid acquisition, you\'re dependent on an algorithm you don\'t control.',
    },
    getChoices: () => [
      {
        text: 'Lifestyle brand video — aspirational, high production value',
        dynamicFeedback: (s) => (s.product ?? 30) > 40
          ? 'The video is beautiful. 2.3M views. But only 40 orders. Brand awareness is up, but conversion is weak. Aspiration doesn\'t sell supplements — results do.'
          : 'The video went semi-viral. Brand awareness spiked. 80 new customers, but CAC was €45 — double your target. Beautiful doesn\'t mean efficient.',
        effects: (s) => (s.product ?? 30) > 40
          ? { ...s, newPaid: 40, pipeline: (s.pipeline ?? 0) + 5, viralCoeff: Math.min(150, (s.viralCoeff ?? 30) + 5) }
          : { ...s, newPaid: 80, cac: Math.min(60, (s.cac ?? 25) + 15), pipeline: (s.pipeline ?? 0) + 8 },
      },
      {
        text: 'Before/after testimonials — real users, real results',
        effects: (s) => ({
          ...s,
          newPaid: 60,
          cac: Math.max(12, (s.cac ?? 25) - 5),
          repeatRate: Math.min(30, (s.repeatRate ?? 15) + 1),
          pipeline: (s.pipeline ?? 0) + 6,
        }),
        feedback: 'Lower production value but higher conversion. "She looks like me" beats "she looks like a model." 60 orders at 20% lower CAC than expected.',
      },
      {
        text: 'Performance ads — A/B test 10 creatives, optimize for CAC',
        effects: (s) => ({
          ...s,
          newPaid: 50,
          cac: Math.max(12, (s.cac ?? 25) - 3),
          product: s.product + 1,
        }),
        feedback: 'Data-driven. Creative #7 won — a simple unboxing video. CAC dropped 12% after a week of testing. Less art, more science. Alex wasn\'t thrilled.',
      },
    ],
  },

  {
    id: 'c_product_quality',
    speaker: 'Dr. Alex Berger',
    speakerRole: 'Co-founder, Product',
    months: [1, 2, 3],
    title: 'The Quality Question',
    text: '"Our supplement formula works, but the packaging is... basic. We could invest in premium packaging, reformulate with better ingredients, or keep costs low and scale faster."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, product: Math.max(10, s.product - 2), repeatRate: Math.max(3, (s.repeatRate ?? 15) - 1) }),
      feedback: 'Nothing changed. Three customers posted photos of dented boxes on Instagram. The product inside was fine. The perception wasn\'t.',
    },
    getChoices: () => [
      {
        text: 'Premium packaging — the unboxing IS the brand',
        effects: (s) => ({
          ...s,
          cogs: (s.cogs ?? 12) + 3,
          product: s.product + 5,
          viralCoeff: Math.min(150, (s.viralCoeff ?? 30) + 8),
          repeatRate: Math.min(30, (s.repeatRate ?? 15) + 1),
        }),
        feedback: 'COGS went up €3/order. But 15% of customers now post unboxing videos organically. The packaging became your best marketing channel. Hard to attribute, impossible to ignore.',
      },
      {
        text: 'Better formulation — let the product speak for itself',
        effects: (s) => ({
          ...s,
          cogs: (s.cogs ?? 12) + 2,
          product: s.product + 6,
          repeatRate: Math.min(30, (s.repeatRate ?? 15) + 2),
        }),
        feedback: 'Reformulated with higher bioavailability. Customers notice within 2 weeks. Repeat rate ticked up. No Instagram moments, but the retention curve tells the real story.',
      },
      {
        text: 'Keep costs low — scale first, premium later',
        dynamicFeedback: (s) => (s.activeCustomers ?? 200) > 400
          ? 'You shipped 500+ orders at low COGS. Unit economics look great. But repeat rate is flat. At scale, retention matters more than margins.'
          : 'Kept costs down. Good discipline early. But competitors with better packaging are getting the Instagram moments you\'re not.',
        effects: (s) => ({
          ...s,
          product: s.product + 1,
        }),
      },
    ],
  },

  {
    id: 'c_influencer_collab',
    speaker: 'Nina Volkov',
    speakerRole: 'Co-founder, Brand',
    months: [2, 3, 4, 5],
    title: 'The Influencer Deal',
    text: '"A fitness influencer with 200K followers wants to do a collab. She\'ll promote our product for 2 weeks. She wants €3K + free product. Her audience is exactly our ICP."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You passed. She promoted a competitor instead. Her audience doesn\'t know you exist.',
    },
    getChoices: () => [
      {
        text: 'Do the deal — €3K for 200K eyeballs',
        dynamicFeedback: (s) => Math.random() > 0.4
          ? '142 orders in 48 hours. CAC = €21/order from the collab. She posted a genuine review. Her audience trusted her. When influencer marketing works, it WORKS.'
          : '23 orders. Her audience didn\'t convert. She posted it between a protein shake and a vacation photo. Influencer marketing is roulette with better odds.',
        effects: (s) => Math.random() > 0.4
          ? { ...s, cash: s.cash - 3000, customers: (s.customers ?? 200) + 50, activeCustomers: (s.activeCustomers ?? 200) + 50, revenue: (s.revenue ?? 0) + 50 * (s.aov ?? 35), pipeline: (s.pipeline ?? 0) + 10, viralCoeff: Math.min(150, (s.viralCoeff ?? 30) + 5) }
          : { ...s, cash: s.cash - 3000, customers: (s.customers ?? 200) + 10, activeCustomers: (s.activeCustomers ?? 200) + 10, pipeline: (s.pipeline ?? 0) + 3 },
      },
      {
        text: 'Counter-offer: revenue share instead of flat fee',
        effects: (s) => ({
          ...s,
          customers: (s.customers ?? 200) + 20,
          activeCustomers: (s.activeCustomers ?? 200) + 20,
          pipeline: (s.pipeline ?? 0) + 5,
        }),
        feedback: 'She took the deal. 20 orders — she promoted it less aggressively since her upside was smaller. Revenue share aligns incentives long-term but reduces urgency.',
      },
    ],
  },

  // ─── PHASE 2: Validation (Months 4-8) ───
  {
    id: 'c_retention_wall',
    speaker: 'Dr. Alex Berger',
    speakerRole: 'Co-founder, Product',
    months: [4, 5, 6],
    title: 'The Retention Wall',
    text: '"Month 2 retention is 40%. Month 3 drops to 15%. Month 4 is 8%. People try it, like it, and then... forget. We\'re acquiring customers who don\'t stick."',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s, repeatRate: Math.max(3, (s.repeatRate ?? 15) - 2), product: Math.max(10, s.product - 3) }),
      feedback: 'Retention kept dropping. Your CAC buys a one-time customer. The math doesn\'t work unless they come back.',
    },
    getChoices: () => [
      {
        text: 'Subscription model — auto-ship every 30 days with discount',
        effects: (s) => ({
          ...s,
          repeatRate: Math.min(30, (s.repeatRate ?? 15) + 5),
          aov: Math.round((s.aov ?? 35) * 0.9),
          price: Math.round((s.aov ?? 35) * 0.9),
          product: s.product + 2,
        }),
        feedback: '35% of existing customers converted to subscription. Repeat rate jumped. But average order value dropped 10% from the discount. The math still works — locked-in revenue beats higher one-time prices.',
      },
      {
        text: 'Personalization engine — AI-driven product recommendations',
        apCost: 2,
        effects: (s) => ({
          ...s,
          product: s.product + 6,
          repeatRate: Math.min(30, (s.repeatRate ?? 15) + 3),
          burnRate: s.burnRate + 1500,
        }),
        feedback: '"Your next pack is optimized for your sleep score." Customers who get personalized recommendations buy 2.3x more often. Expensive to build, but retention is the only metric that matters in D2C.',
      },
      {
        text: 'Email/SMS sequences — nurture without tech investment',
        effects: (s) => ({
          ...s,
          repeatRate: Math.min(30, (s.repeatRate ?? 15) + 2),
          burnRate: s.burnRate + 300,
        }),
        feedback: 'Day 7: "How are you feeling?" Day 14: "Time for a refill?" Simple, cheap, surprisingly effective. 12% of lapsed customers reordered from the email sequence alone.',
      },
    ],
  },

  {
    id: 'c_supply_chain',
    speaker: 'Dr. Alex Berger',
    speakerRole: 'Co-founder, Product',
    months: [5, 6, 7],
    title: 'The Supply Chain Crunch',
    text: '"Our supplement supplier just raised prices 20%. We can absorb it, pass it on, or find a new supplier. New supplier means 6 weeks of reformulation testing."',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, cogs: (s.cogs ?? 12) + 3, product: Math.max(10, s.product - 1) }),
      feedback: 'You absorbed the cost increase without deciding. COGS crept up. Margins shrunk. The problem you avoided became the default.',
    },
    getChoices: () => [
      {
        text: 'Absorb it — protect the price, eat the margin',
        effects: (s) => ({
          ...s,
          cogs: (s.cogs ?? 12) + 3,
        }),
        feedback: 'Margins shrunk from 66% to 57%. Customers noticed nothing. But at scale, 9 points of margin is the difference between profitable and not.',
      },
      {
        text: 'Pass it on — raise prices €5',
        dynamicFeedback: (s) => (s.repeatRate ?? 15) > 18
          ? 'Loyal customers didn\'t blink. New customer conversion dropped 8%. When repeat is strong, you can afford to lose some new acquisitions.'
          : '15% of customers stopped ordering after the price increase. When repeat rate is already weak, price increases accelerate churn.',
        effects: (s) => (s.repeatRate ?? 15) > 18
          ? { ...s, aov: (s.aov ?? 35) + 5, price: (s.aov ?? 35) + 5, cac: Math.min(60, (s.cac ?? 25) + 3) }
          : { ...s, aov: (s.aov ?? 35) + 5, price: (s.aov ?? 35) + 5, activeCustomers: Math.round((s.activeCustomers ?? 200) * 0.85), repeatRate: Math.max(3, (s.repeatRate ?? 15) - 2) },
      },
      {
        text: 'Find new supplier — cheaper, 6-week transition',
        effects: (s) => {
          const pending = [...(s.pendingEffects ?? []), { month: (s.month ?? 0) + 2, changes: { cogs: -4 } }];
          return { ...s, pendingEffects: pending, product: Math.max(10, s.product - 2) };
        },
        feedback: 'New supplier found. 30% cheaper. But reformulation takes 6 weeks — 2 months of the old pricing. Quality risk during transition. Savings arrive later.',
      },
    ],
  },

  // ─── PHASE 3: Growth (Months 6-12) ───
  {
    id: 'c_viral_moment',
    speaker: 'Nina Volkov',
    speakerRole: 'Co-founder, Brand',
    months: [6, 7, 8, 9],
    title: 'The TikTok Moment',
    text: '"Someone posted a video about our product and it has 500K views. Orders are flooding in. Our fulfillment can\'t keep up. What do we do?"',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, customers: (s.customers ?? 200) + 30, activeCustomers: (s.activeCustomers ?? 200) + 30, product: Math.max(10, s.product - 3) }),
      feedback: 'Orders overwhelmed your fulfillment. 3-week shipping times. 40% of orders cancelled. The viral moment became a reputation problem.',
    },
    getChoices: () => [
      {
        text: 'Scale fulfillment NOW — hire temp staff, express shipping',
        effects: (s) => ({
          ...s,
          cash: s.cash - 5000,
          customers: (s.customers ?? 200) + 80,
          activeCustomers: (s.activeCustomers ?? 200) + 80,
          viralCoeff: Math.min(150, (s.viralCoeff ?? 30) + 10),
          burnRate: s.burnRate + 1000,
        }),
        feedback: '€5K emergency spend. But orders shipped in 3 days. Reviews: "Fast shipping, great product." The moment compounded instead of collapsing. Viral + good execution = real growth.',
      },
      {
        text: 'Cap orders — waitlist for new customers',
        effects: (s) => ({
          ...s,
          customers: (s.customers ?? 200) + 30,
          activeCustomers: (s.activeCustomers ?? 200) + 30,
          viralCoeff: Math.min(150, (s.viralCoeff ?? 30) + 3),
          product: s.product + 2,
        }),
        feedback: 'Waitlist of 200 people. 60% will convert when you open it. The scarcity created demand. But you left money and momentum on the table.',
      },
    ],
  },

  {
    id: 'c_amazon_decision',
    speaker: 'Nina Volkov',
    speakerRole: 'Co-founder, Brand',
    months: [7, 8, 9, 10],
    title: 'The Amazon Question',
    text: '"Amazon reached out. They want us on their marketplace. 30% of D2C wellness is on Amazon. But they take 15% + FBA fees, and we lose the customer relationship."',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You didn\'t list on Amazon. Your competitors did. When customers search for your product category, they find everyone except you.',
    },
    getChoices: () => [
      {
        text: 'List on Amazon — distribution beats margin',
        effects: (s) => ({
          ...s,
          customers: (s.customers ?? 200) + 40,
          activeCustomers: (s.activeCustomers ?? 200) + 40,
          revenue: (s.revenue ?? 0) + (s.aov ?? 35) * 40,
          cogs: (s.cogs ?? 12) + 2, // effectively higher with fees
          viralCoeff: Math.max(0, (s.viralCoeff ?? 30) - 5), // lose viral since Amazon owns the customer
        }),
        feedback: '40 new customers/month from Amazon. But you don\'t own the relationship. No email, no Instagram, no viral. And Amazon can change the rules anytime.',
      },
      {
        text: 'Stay D2C — own the relationship, build the brand',
        effects: (s) => ({
          ...s,
          product: s.product + 3,
          viralCoeff: Math.min(150, (s.viralCoeff ?? 30) + 3),
          repeatRate: Math.min(30, (s.repeatRate ?? 15) + 1),
        }),
        feedback: 'Harder growth path. But every customer is YOURS. You control the experience, the data, the relationship. Brand-direct wins long-term if you survive short-term.',
      },
    ],
  },

  // ─── PHASE 4: Scale (Months 10-18) ───
  {
    id: 'c_retail_opportunity',
    speaker: 'Buyer, Organic Grocery Chain',
    speakerRole: 'Retail Partner',
    months: [10, 11, 12, 13, 14],
    title: 'The Retail Shelf',
    text: '"We want to carry your product in 50 stores. Wholesale price is 50% of retail. Minimum order: 2,000 units. Payment terms: 60 days."',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You passed on retail. The shelf space went to a competitor. Physical presence builds trust that digital can\'t fully replicate.',
    },
    getChoices: () => [
      {
        text: 'Take the deal — retail validates the brand',
        effects: (s) => ({
          ...s,
          cash: s.cash - Math.round(2000 * (s.cogs ?? 12)), // produce inventory upfront
          customers: (s.customers ?? 200) + 60,
          activeCustomers: (s.activeCustomers ?? 200) + 60,
          pipeline: (s.pipeline ?? 0) + 15,
          viralCoeff: Math.min(150, (s.viralCoeff ?? 30) + 5),
          product: s.product + 2,
        }),
        feedback: 'Cash crunch upfront (inventory + 60-day payment terms). But "Available at [Chain]" on your website increased online conversion 20%. Physical presence creates digital trust.',
      },
      {
        text: 'Negotiate better terms — 30-day payment, smaller initial order',
        effects: (s) => ({
          ...s,
          cash: s.cash - Math.round(500 * (s.cogs ?? 12)),
          customers: (s.customers ?? 200) + 20,
          activeCustomers: (s.activeCustomers ?? 200) + 20,
          pipeline: (s.pipeline ?? 0) + 8,
        }),
        feedback: 'They agreed to 500 units and 30-day terms. Less risk, less reward. A test run that proves the concept before committing.',
      },
    ],
  },

  {
    id: 'c_brand_crisis',
    speaker: 'Customer Service',
    speakerRole: 'Support Team',
    months: [8, 9, 10, 11, 12, 13, 14, 15],
    title: 'The Bad Review Storm',
    getText: (s) => {
      const variants = [
        '"3 one-star reviews on Trustpilot today. All mention the same thing: the new batch tastes different. Our supplier changed something without telling us."',
        '"An influencer posted that our product gave her a rash. 50K views. Her followers are tagging us demanding answers. Our product is safe — but perception is reality."',
        '"Someone posted a TikTok claiming our supplements are just repackaged generic pills. It\'s not true, but the video has 200K views and climbing."',
      ];
      return variants[Math.floor(Math.random() * variants.length)];
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, viralCoeff: Math.max(0, (s.viralCoeff ?? 30) - 10), repeatRate: Math.max(3, (s.repeatRate ?? 15) - 2), product: Math.max(10, s.product - 3) }),
      feedback: 'Silence. The narrative was written without you. Trust erodes fast in wellness. Rebuilding it takes 10x longer than losing it.',
    },
    getChoices: () => [
      {
        text: 'Respond publicly — transparency, lab results, personal video from Alex',
        effects: (s) => ({
          ...s,
          product: s.product + 3,
          viralCoeff: Math.min(150, (s.viralCoeff ?? 30) + 2),
          cash: s.cash - 1000,
        }),
        feedback: 'Alex posted a 3-minute video from the lab. Lab results attached. Comments shifted from angry to supportive. "This is how a real company handles it." Crisis = brand opportunity.',
      },
      {
        text: 'Reach out privately to affected customers — fix it quietly',
        effects: (s) => ({
          ...s,
          product: s.product + 2,
          repeatRate: Math.min(30, (s.repeatRate ?? 15) + 1),
        }),
        feedback: 'Full refunds + free replacement packs. All 3 updated their reviews. But the public narrative still sits there for new customers to find.',
      },
    ],
  },

  // ─── PHASE 5: Late Game (Months 14-24) ───
  {
    id: 'c_subscription_box',
    speaker: 'Nina Volkov',
    speakerRole: 'Co-founder, Brand',
    months: [12, 13, 14, 15, 16],
    title: 'The Subscription Box Pivot',
    text: '"What if we bundle supplements + wellness products into a curated monthly box? Higher AOV, better retention, more Instagram-worthy. But it\'s a different business."',
    apCost: 2,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'You stayed the course. Single-product D2C is simpler but the growth ceiling is lower. Sometimes not pivoting is the right call.',
    },
    getChoices: () => [
      {
        text: 'Launch the box — €59/mo, curated wellness',
        apCost: 2,
        effects: (s) => ({
          ...s,
          aov: 59,
          price: 59,
          cogs: (s.cogs ?? 12) + 8,
          repeatRate: Math.min(30, (s.repeatRate ?? 15) + 4),
          viralCoeff: Math.min(150, (s.viralCoeff ?? 30) + 8),
          burnRate: s.burnRate + 2000,
          product: s.product + 3,
        }),
        feedback: 'Higher AOV, better margins after COGS, much more Instagram-worthy. Repeat rate jumped — people love curated surprises. But operations complexity doubled.',
      },
      {
        text: 'Keep it simple — optimize the core product instead',
        effects: (s) => ({
          ...s,
          product: s.product + 4,
          repeatRate: Math.min(30, (s.repeatRate ?? 15) + 2),
          cogs: Math.max(8, (s.cogs ?? 12) - 1),
        }),
        feedback: 'Focused. Simpler operations. Better margins on the core product. Growth is slower but more predictable.',
      },
    ],
  },

  {
    id: 'c_international',
    speaker: 'Nina Volkov',
    speakerRole: 'Co-founder, Brand',
    months: [14, 15, 16, 17, 18, 19],
    title: 'International Demand',
    text: '"We keep getting DMs from people in the UK and Netherlands asking if we ship there. 15% of our Instagram followers are outside DACH. Should we expand?"',
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s }),
      feedback: 'Stayed domestic. The international demand went to local competitors who copied your product positioning.',
    },
    getChoices: () => [
      {
        text: 'Ship internationally — test with existing fulfillment',
        effects: (s) => ({
          ...s,
          customers: (s.customers ?? 200) + 30,
          activeCustomers: (s.activeCustomers ?? 200) + 30,
          cogs: (s.cogs ?? 12) + 4, // higher shipping
          pipeline: (s.pipeline ?? 0) + 10,
        }),
        feedback: 'Shipping costs ate into margins. But 30 new customers in month one from markets with zero CAC (they came to you). International customers have 20% higher AOV.',
      },
      {
        text: 'Find a local fulfillment partner first, then launch properly',
        effects: (s) => {
          const pending = [...(s.pendingEffects ?? []), { month: (s.month ?? 0) + 3, changes: { customers: 50, activeCustomers: 50, pipeline: 15 } }];
          return { ...s, pendingEffects: pending, cash: s.cash - 3000, burnRate: s.burnRate + 500 };
        },
        feedback: '€3K setup cost, 3 months to launch properly. But when it launches: local shipping, local returns, local trust. The right way to expand.',
      },
    ],
  },

  {
    id: 'c_profitability',
    speaker: 'Dr. Alex Berger',
    speakerRole: 'Co-founder, Product',
    months: [16, 17, 18, 19, 20, 21, 22],
    title: 'The Profitability Question',
    getText: (s) => {
      const rev = s.revenue ?? 0;
      const burn = s.totalBurn ?? s.burnRate ?? 5000;
      return rev > burn
        ? `"We\'re profitable. €${rev}/mo revenue vs €${burn}/mo burn. Do we reinvest everything in growth, or start building a cash buffer?"`
        : `"Revenue: €${rev}. Burn: €${burn}. The gap is ${Math.round((burn-rev)/burn*100)}% of our burn. Cut ads to reach profit, or double down?"`;
    },
    apCost: 1,
    defaultOutcome: {
      effects: (s) => ({ ...s, adSpend: Math.round((s.adSpend ?? 5000) * 1.1), burnRate: s.burnRate + 300 }),
      feedback: 'Costs drifted up. No deliberate choice. The default in D2C is always "spend more on ads."',
    },
    getChoices: () => [
      {
        text: 'Cut ad spend 40% — reach profitability now',
        effects: (s) => ({
          ...s,
          adSpend: Math.round((s.adSpend ?? 5000) * 0.6),
          newPaid: Math.round((s.newPaid ?? 50) * 0.6),
          burnRate: Math.max(2000, s.burnRate - 1000),
        }),
        feedback: 'Ad spend down, new customers down, but cash positive. Profitability is freedom — you\'re no longer dependent on the next fundraise.',
      },
      {
        text: 'Reinvest everything — growth compounds',
        effects: (s) => ({
          ...s,
          adSpend: Math.round((s.adSpend ?? 5000) * 1.3),
          pipeline: (s.pipeline ?? 0) + 10,
          burnRate: s.burnRate + 1500,
        }),
        feedback: 'More ads, more customers, more revenue, more burn. The treadmill speeds up. If unit economics hold, this is the right call. If they don\'t, you run out of cash faster.',
      },
    ],
  },
];
