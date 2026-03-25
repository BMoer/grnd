# GRND - Game Design Document v4

## TL;DR

Text-based browser roguelike that teaches startup business models through gameplay. You're standing in a building with no walls, no wiring, no windows. The structure might hold. Your job is to find out.

You pick a startup archetype (class), set your own financial assumptions, then play through monthly decisions while the game validates (or destroys) those assumptions against a simulated market. Quarterly Board Meetings force you to confront Forecast vs. Actual in a full spreadsheet view with graphs. Variable game length (up to 24 months), permadeath when cash hits zero.

Core insight: A startup's business model is a spreadsheet. This game makes you live inside that spreadsheet.

**Name origin:** Rohbau - the shell of a building before the walls are finished, the cables connected, the paint applied. The structure stands but everything else is missing. That's an early-stage startup: the business model is the load-bearing structure, and every assumption is a wall that might not hold. The name is German, rooted in the same design tradition as Bauhaus - honest about the state of things, no decoration.

---

## 1. Game Architecture

### 1.1 Tech Stack

- **Frontend:** React (single-page app, no backend needed)
- **State Management:** React Context or Zustand (game state is complex enough to warrant a store)
- **Charts:** Recharts (already available in artifact environment) or Chart.js
- **Excel Export:** SheetJS (xlsx) for .xlsx generation in-browser
- **Styling:** Tailwind or CSS-in-JS, dark theme, monospace for numbers
- **No backend, no database, no auth.** Everything runs client-side. Game state lives in memory. Export to CSV/XLSX for persistence.

### 1.2 File Structure (suggested)

```
src/
  engine/
    gameEngine.js          # Core loop: month advancement, state transitions
    varianceEngine.js      # ±30% outcome randomization
    forecastEngine.js      # Generates forecast from player assumptions
    boardMeeting.js        # Quarterly review logic, investor reactions
    actionPoints.js        # AP allocation and default outcomes
    pmfCalculator.js       # PMF score computation from metrics
  classes/
    index.js               # Class registry
    saas.js                # SaaS: CloudKitchen
    marketplace.js         # Marketplace: SwapCircle
    service.js             # Service: StrategyForge
    deeptech.js            # Deep-Tech: NanoSense
    consumer.js            # Consumer/D2C: GlowUp
    api.js                 # API/Platform: DataPipe
  events/
    decisions.js           # Player-choice events (class-aware)
    worldEvents.js         # Exogenous market events
    investorEvents.js      # Fundraising-specific events
    boardResponses.js      # Board Meeting dialogue/reactions
  ui/
    App.jsx                # Root, screen management
    TitleScreen.jsx        # Class selection
    SetupScreen.jsx        # Assumption sliders
    GameScreen.jsx         # Main gameplay (Game Mode)
    BoardMeeting.jsx       # Quarterly review (Model Mode)
    ModelView.jsx          # Full spreadsheet + graphs
    EndScreen.jsx          # Final scorecard + export
    components/
      BusinessTable.jsx    # The living spreadsheet
      ForecastChart.jsx    # Revenue curve: forecast vs actual
      UnitEconChart.jsx    # LTV:CAC or class-equivalent
      RunwayBar.jsx        # Visual runway indicator
      PMFBar.jsx           # PMF progress
      EventCard.jsx        # Decision event display
      WorldEventBanner.jsx # Exogenous event alert
      ActionPointBar.jsx   # AP remaining this month
      ClassCard.jsx        # Class selection card with logo
      SliderInput.jsx      # Assumption input slider
  export/
    excelExport.js         # .xlsx template generation
    csvExport.js           # CSV game log
  data/
    realism.js             # "Reality corridors" per class per metric
```

### 1.3 Core Game Loop

```
SETUP:
  1. Player selects class
  2. Player reads class steckbrief (backstory, logo, model description)
  3. Player sets assumptions via sliders (5-8 per class)
  4. Engine generates 24-month forecast from assumptions
  5. Game starts at Month 0

MONTHLY LOOP:
  1. Month advances
  2. Engine checks for World Event (probability-based)
     → If yes: show World Event, apply effects, deduct from AP budget
  3. Engine draws 1-3 Decision Events for this month
  4. Player allocates Action Points across events
     → Addressed events: player picks choice, effects applied with ±30% variance
     → Unaddressed events (no AP left): default outcome applied
  5. Monthly financials calculated:
     → Revenue = f(assumptions, state, decisions)
     → Costs = burn rate + variable costs
     → Cash = previous cash - costs + revenue
     → All derived metrics updated (CAC, LTV, margin, etc.)
  6. State saved to history array
  7. Check end conditions:
     → Cash ≤ 0 → GAME OVER (permadeath)
     → PMF score ≥ threshold → WIN (product-market fit achieved)
     → Month = 24 → END (survived, scored)

QUARTERLY (every 3 months):
  1. Trigger Board Meeting
  2. Switch to Model View
  3. Show Forecast vs. Actual table
  4. Show graphs (Revenue curve, Unit Economics)
  5. Board reacts based on:
     → Delta between forecast and actual
     → Trajectory (improving or worsening)
     → Investor presence (changes tone and consequences)
  6. Board may trigger forced events (pivot pressure, cost cuts)
  7. Player returns to Game Mode
```

---

## 2. Classes (Startup Archetypes)

Each class defines: a fictional startup (steckbrief), the financial model structure (which metrics exist), assumption sliders (what the player configures at start), the business table columns, win/death conditions, time horizon, and class-specific events.

### 2.1 The SaaS - "CloudKitchen"

**Steckbrief:**
- **Logo:** Stylized chef's hat with a cloud motif (SVG, minimal, green accent)
- **Tagline:** "AI-powered restaurant management. Recurring revenue, recurring problems."
- **Backstory:** Two ex-Delivery Hero PMs who watched restaurants bleed money on inventory waste. Built an AI tool that predicts demand and auto-orders supplies. Won a startup competition, got €100K seed and a pilot with 3 restaurants in Berlin. Now they need to figure out if restaurants will actually pay monthly for software.
- **Founders:** Mira Chen (Product, ex-Delivery Hero) & Jonas Richter (Tech, ex-SAP)
- **Stage:** Post-prototype, 3 pilot users, no revenue
- **Color:** #4ade80 (green)

**Financial Model:**
```
ASSUMPTIONS (player sets):
  - Monthly price per customer      [€19 - €299]    default: €49
  - Expected monthly churn           [1% - 20%]      default: 5%
  - Target CAC                       [€20 - €500]    default: €80
  - Trial-to-paid conversion         [5% - 50%]      default: 15%
  - Monthly pipeline growth          [5 - 100]       default: 20
  - Support cost per customer/mo     [€2 - €30]      default: €5

DERIVED MONTHLY TABLE:
  Month | New Trials | Conversions | New MRR | Churned MRR | Net MRR |
  Total MRR | Customers | CAC (actual) | LTV | LTV:CAC | Gross Margin |
  Burn Rate | Cash | Runway (months)

FORMULAS:
  Conversions = New Trials × Conversion Rate (actual, not assumed)
  New MRR = Conversions × Price
  Churned MRR = Total MRR(prev) × Churn Rate (actual)
  Net MRR = New MRR - Churned MRR
  Total MRR = Total MRR(prev) + Net MRR
  CAC (actual) = Marketing Spend / Conversions
  LTV = ARPU / Churn Rate (actual)
  Gross Margin = (Revenue - COGS - Support Costs) / Revenue
  Burn = Team Cost + Infrastructure + Marketing - Revenue
  Cash = Cash(prev) - Burn
  Runway = Cash / Burn (if Burn > 0)
```

**Win condition:** LTV:CAC > 3 AND monthly churn < 5% AND MRR > €10K for 3 consecutive months
**Death condition:** Cash ≤ 0
**Typical horizon:** 12-18 months to PMF

---

### 2.2 The Marketplace - "SwapCircle"

**Steckbrief:**
- **Logo:** Two arrows forming a circle (SVG, purple accent)
- **Tagline:** "Peer-to-peer skill exchange. Two sides, zero margin for error."
- **Backstory:** A former teacher and a UX designer who believe professional skills should be tradeable like goods. Their platform lets freelancers exchange services directly (a designer trades branding work for a developer's app build) with an optional cash top-up for imbalances. Bootstrapped with €30K savings and an FFG grant. The prototype works, but neither side of the marketplace has critical mass.
- **Founders:** Lena Kowalski (Ops, ex-teacher) & Marco Di Stefano (Design, freelancer)
- **Stage:** Prototype live, 15 supply-side signups, 8 demand-side, 2 completed transactions
- **Color:** #a78bfa (purple)

**Financial Model:**
```
ASSUMPTIONS (player sets):
  - Take rate                        [0% - 25%]     default: 10%
  - Avg. transaction value           [€50 - €2000]  default: €300
  - Supply acquisition cost          [€10 - €200]   default: €40
  - Demand acquisition cost          [€10 - €200]   default: €30
  - Monthly supply churn             [5% - 30%]     default: 12%
  - Monthly demand churn             [5% - 30%]     default: 15%
  - Expected match rate              [5% - 50%]     default: 15%

DERIVED MONTHLY TABLE:
  Month | New Supply | New Demand | Active Supply | Active Demand |
  Matches | Transactions | GMV | Revenue | Supply CAC (actual) |
  Demand CAC (actual) | Liquidity % | Burn Rate | Cash | Runway

FORMULAS:
  Active Supply = Active Supply(prev) × (1 - Supply Churn) + New Supply
  Active Demand = Active Demand(prev) × (1 - Demand Churn) + New Demand
  Matches = min(Active Supply, Active Demand) × Match Rate (actual)
  Transactions = Matches × Completion Rate
  GMV = Transactions × Avg. Transaction Value
  Revenue = GMV × Take Rate
  Liquidity = Transactions / Active Listings
  Burn = Team + Marketing + Infrastructure - Revenue
```

**Win condition:** Liquidity > 30% AND Revenue > €5K/mo AND both sides growing for 3 consecutive months
**Death condition:** Cash ≤ 0 OR Liquidity drops to 0% for 3 consecutive months (marketplace death spiral)
**Typical horizon:** 18-24 months (cold start takes longer)

---

### 2.3 The Service - "StrategyForge"

**Steckbrief:**
- **Logo:** Anvil with a spark (SVG, orange accent)
- **Tagline:** "AI strategy consulting. People-powered, margin-constrained."
- **Backstory:** A former McKinsey engagement manager who saw that 80% of strategy work is templatable. Built a hybrid model: AI does the analysis frameworks, humans do the client relationships and customization. Landed first 2 clients through personal network. Revenue from month 1, but every new client needs more of the founder's time. The trap is obvious, escaping it isn't.
- **Founders:** David Ashworth (Strategy, ex-McKinsey) & Priya Sharma (AI/ML, ex-Google)
- **Stage:** 2 active clients, €8K/mo revenue, 45% margin, no repeatable process yet
- **Color:** #fb923c (orange)

**Financial Model:**
```
ASSUMPTIONS (player sets):
  - Avg. project value               [€1K - €50K]    default: €5,000
  - Billing model                    [Fixed/Hourly/Retainer] default: Fixed
  - Target gross margin              [20% - 80%]      default: 50%
  - Sales cycle (months)             [0.5 - 6]        default: 1.5
  - Close rate                       [10% - 60%]      default: 25%
  - Repeat rate                      [0% - 80%]       default: 20%
  - Team capacity (hours/mo)         [160 - 640]       default: 320

DERIVED MONTHLY TABLE:
  Month | Pipeline | New Clients | Active Clients | Revenue |
  COGS | Gross Margin % | Utilization % | Revenue/Head |
  Client Acq. Cost | Repeat Revenue % | Burn Rate | Cash | Runway

FORMULAS:
  New Clients = Pipeline(prev) × Close Rate (actual) (delayed by sales cycle)
  Active Clients = Active(prev) + New - Churned
  Revenue = Active Clients × Avg Project Value (pro-rated if retainer)
  COGS = Delivery Hours × Cost/Hour
  Gross Margin = (Revenue - COGS) / Revenue
  Utilization = Billable Hours / Available Hours
  Revenue/Head = Revenue / Team Size
```

**Win condition:** Gross Margin > 60% AND Revenue > €15K/mo AND Repeat Rate > 40% for 3 consecutive months
**Death condition:** Cash ≤ 0 OR Utilization > 100% for 3 months (burnout death)
**Typical horizon:** 12-18 months

---

### 2.4 The Deep-Tech - "NanoSense"

**Steckbrief:**
- **Logo:** Hexagonal molecule structure (SVG, cyan accent)
- **Tagline:** "Molecular sensors for food safety. Long road, deep moat."
- **Backstory:** A materials science PhD and a food safety engineer who developed a novel sensor that detects pathogens in food 10x faster than lab tests. The science works in the lab. Now they need to get it from lab bench to production line, through EU certification (CE marking, food contact materials regulation), and into the hands of food manufacturers who move at glacial speed. They have an FFG Basisprogramm grant for €300K over 2 years and zero revenue.
- **Founders:** Dr. Sarah Lindström (Materials Science, TU Wien) & Thomas Huber (Food Safety, ex-Nestlé QA)
- **Stage:** Lab prototype (TRL 4), FFG grant secured, no customers, no revenue
- **Color:** #22d3ee (cyan)

**Financial Model:**
```
ASSUMPTIONS (player sets):
  - Unit production cost              [€50 - €2000]   default: €500
  - Target unit selling price         [€200 - €10K]   default: €2,000
  - Certification timeline (months)   [6 - 24]        default: 12
  - Pilot customer pipeline           [1 - 10]        default: 3
  - Monthly R&D burn                  [€5K - €30K]    default: €15,000
  - Grant runway (months)             [6 - 36]        default: 20
  - Time to first unit sale (months)  [6 - 24]        default: 14

DERIVED MONTHLY TABLE:
  Month | Cash | Grant Remaining | R&D Spend | Prototype Stage |
  Certification Progress % | Pilot Conversations | LOIs Signed |
  Units Produced | Units Sold | Revenue | Gross Margin % |
  Burn Rate | Runway | IP Filings

FORMULAS:
  Revenue = 0 until certification complete AND pilot converted
  Certification Progress = cumulative R&D months / Certification Timeline
  Grant Remaining = Grant Total - cumulative R&D Spend
  Burn = R&D Spend + Team Cost + Lab/Equipment
  Cash = Cash(prev) + Grant Drawdown - Burn
  Runway = Cash / Burn
  Units Produced = f(prototype stage, production readiness)
```

**Win condition:** First commercial sale (revenue > 0) AND 3+ LOIs signed AND Certification > 80%
**Death condition:** Cash ≤ 0 (grant runs out before certification)
**Death condition 2:** Certification fails (regulatory rejection event)
**Typical horizon:** 18-24 months (this is the slow game)

**Class-specific mechanics:**
- No revenue for months. The game is entirely about managing R&D milestones against grant runway.
- Certification is a progress bar that advances with R&D spend, but can be SET BACK by events (regulatory change, test failure).
- LOIs (Letters of Intent) replace "customers" as the key metric. LOIs are non-binding but signal market interest.
- Fundraising becomes critical around month 12-18 when grants thin out but revenue hasn't started.

---

### 2.5 The Consumer - "GlowUp"

**Steckbrief:**
- **Logo:** Abstract sunrise/glow shape (SVG, pink accent)
- **Tagline:** "Personalized wellness, delivered. Blitzscale or die."
- **Backstory:** A fitness influencer with 50K followers and a biotech grad who created personalized supplement packs based on a quick health questionnaire. The brand is strong on Instagram, the first 200 orders came from the influencer's audience, but paid acquisition is expensive and retention is a question mark. They raised €80K from friends and family and are burning through it on Facebook ads.
- **Founders:** Nina Volkov (Brand/Marketing, fitness influencer) & Dr. Alex Berger (Product, biotech background)
- **Stage:** 200 initial orders, €35 AOV, 15% repeat rate, €80K in the bank
- **Color:** #f472b6 (pink)

**Financial Model:**
```
ASSUMPTIONS (player sets):
  - Average order value               [€15 - €100]    default: €35
  - Target CAC                        [€8 - €80]      default: €25
  - Monthly repeat purchase rate      [5% - 40%]      default: 15%
  - Viral coefficient                 [0 - 2.0]       default: 0.3
  - COGS per unit                     [€5 - €40]      default: €12
  - Monthly ad spend                  [€1K - €20K]    default: €5,000

DERIVED MONTHLY TABLE:
  Month | New Customers (paid) | New Customers (organic/viral) |
  Total Customers | Repeat Orders | Total Orders | Revenue | COGS |
  Gross Margin | CAC (actual) | LTV (3-mo) | LTV:CAC | Ad Spend |
  Viral Coefficient (actual) | Burn Rate | Cash | Runway

FORMULAS:
  New Paid = Ad Spend / CAC (actual)
  New Organic = Total Customers(prev) × Viral Coefficient (actual)
  Repeat Orders = Total Customers(prev) × Repeat Rate (actual)
  Total Orders = New Paid + New Organic + Repeat Orders
  Revenue = Total Orders × AOV
  COGS = Total Orders × COGS/unit
  LTV(3mo) = AOV × (1 + Repeat Rate + Repeat Rate²)
  Burn = Team + COGS + Ad Spend + Fulfillment - Revenue
```

**Win condition:** LTV:CAC > 3 AND Repeat Rate > 25% AND Viral Coefficient > 0.5 for 3 consecutive months
**Death condition:** Cash ≤ 0
**Death condition 2:** CAC exceeds LTV for 4 consecutive months (unsustainable growth)
**Typical horizon:** 12-18 months (fast feedback loops, but cash burns fast)

**Class-specific mechanics:**
- Viral coefficient is a live metric. Some decisions boost it (great unboxing experience, referral program), others kill it (quality issues, shipping delays).
- Influencer events: periodic opportunities to collaborate with influencers. High variance - can be huge or complete waste.
- Seasonality: wellness products have seasonal demand curves.

---

### 2.6 The API/Platform - "DataPipe"

**Steckbrief:**
- **Logo:** Three connected nodes / pipeline shape (SVG, blue accent)
- **Tagline:** "Data infrastructure for fintech. Build the picks and shovels."
- **Backstory:** Two backend engineers who got tired of rebuilding the same data pipeline at every fintech startup they worked at. They packaged it as an API: plug in, get clean financial data, pay per call. The developer community likes it (300 stars on GitHub, 40 free-tier users), but converting developers to paying customers is the eternal platform struggle. They have €60K savings and are still working part-time at their day jobs.
- **Founders:** Kenji Tanaka (Backend, ex-N26) & Fatima Al-Rashid (Data Engineering, ex-Klarna)
- **Stage:** API live, 40 free users, 0 paying, 300 GitHub stars, €60K savings
- **Color:** #60a5fa (blue)

**Financial Model:**
```
ASSUMPTIONS (player sets):
  - Price per 1K API calls             [€0.50 - €20]  default: €2
  - Free tier limit (calls/mo)         [100 - 10K]     default: 1,000
  - Expected free-to-paid conversion   [1% - 15%]      default: 3%
  - Monthly new free signups           [10 - 500]      default: 50
  - Avg. paid usage (K calls/mo)       [5 - 500]       default: 20
  - Infrastructure cost per 1K calls   [€0.10 - €5]    default: €0.40
  - Developer advocacy spend/mo        [€0 - €5K]      default: €500

DERIVED MONTHLY TABLE:
  Month | Free Users | Paid Users | Total API Calls (M) |
  Revenue | Infrastructure Cost | Gross Margin % | CAC |
  Revenue/User | Free:Paid Ratio | GitHub Stars |
  Burn Rate | Cash | Runway

FORMULAS:
  New Paid = Free Users(prev) × Conversion Rate (actual)
  Revenue = Paid Users × Avg Usage × Price per 1K
  Infrastructure = Total Calls × Cost per 1K
  Gross Margin = (Revenue - Infrastructure) / Revenue
  Burn = Team (part-time adj.) + Infrastructure + DevRel - Revenue
```

**Win condition:** Paid Users > 50 AND Gross Margin > 60% AND Revenue > €8K/mo for 3 consecutive months
**Death condition:** Cash ≤ 0
**Death condition 2:** Free users growing but zero paid conversion for 6 months (open source trap)
**Typical horizon:** 18-24 months (developer adoption is slow)

**Class-specific mechanics:**
- Part-time founders: at start, burn is low because founders still have day jobs. Taking the leap to full-time is a major decision event (burn jumps, velocity increases, stress changes).
- Open source risk: events where the community demands more features stay free. Balancing open vs. commercial.
- Usage spikes: enterprise evaluation events where a big company tests your API, temporarily spiking calls (and infra costs).

---

## 3. Core Mechanics

### 3.1 Assumptions and Reality Corridors

At game start, the player sets assumptions via sliders. Each assumption has a "reality corridor" - the range within which the actual value will land, centered on a class-specific realistic value (not on the player's assumption).

```
Example (SaaS, CAC):
  Player assumes: €30
  Class realistic center: €90 (B2B restaurant software, niche market)
  Reality corridor: €50 - €180
  
  Month 1 actual CAC: drawn from corridor, weighted toward center
  Player assumed €30, actual might be €110
  
  Over time, player decisions can shift the corridor:
  - "Hire a sales rep" → corridor shifts UP (€70 - €200)
  - "Switch to content marketing" → corridor shifts DOWN slowly (€40 - €150, but takes 3 months)
  - "Get featured in industry press" → one-time spike then return
```

The key mechanic: **the player never directly sets actual metrics.** They set assumptions (= their plan), and the game simulates what actually happens. The gap between plan and reality is the core tension.

Reality corridors should be tuned so that:
- Reasonable assumptions land close to actual (rewarding realism)
- Wildly optimistic assumptions get punished hard (teaching humility)
- Pessimistic assumptions are possible but rare to land below (the world is usually not as bad as pessimists fear, just different than optimists hope)

### 3.2 Action Points (AP)

Each month, the player has **3 Action Points**.

Events cost AP:
- Minor event: 1 AP (quick decision, small impact)
- Major event: 2 AP (significant decision, large impact)
- Crisis event: 3 AP (all-consuming, forces full attention)

If the player runs out of AP, remaining events resolve with **default outcomes** - typically the "do nothing" path, which is almost always worse than any active choice.

AP creates forced prioritization: if Month 7 has a Major hiring decision (2 AP) and two Minor events (1 AP each), you can only address the Major + one Minor. The other Minor gets the default.

**AP modifications:**
- Hiring a team member: +1 max AP (but +burn rate)
- Co-founder burnout event: -1 max AP for 2 months
- Investor board seat: some months the investor "uses" 1 AP on their priority (not yours)

### 3.3 World Events

Exogenous events that affect all classes but with class-specific impacts. Triggered probabilistically (40% chance per month after month 2, max 1 per month).

**Event Pool:**

| Event | SaaS Impact | Marketplace Impact | Service Impact | Deep-Tech Impact | Consumer Impact | API Impact |
|---|---|---|---|---|---|---|
| Market Downturn | Pipeline -30%, Churn +3pp | Demand -20%, GMV -20% | Pipeline -25%, 1 client pauses | Grant calls dry up | Ad costs +20%, AOV -10% | Enterprise evals freeze |
| AI Hype Wave | Pipeline +40% | +15% both sides | Project values +15% | Investor interest spike | "AI-powered" branding boost | API interest surge |
| New EU Regulation | Compliance cost, competitors suffer | New compliance features needed | Consulting demand spike (!) | Certification timeline risk | Labeling/claims requirements | Data regulation impact |
| Viral Moment | Users +50-200% (high variance) | One side floods in | Inbound leads spike | Media attention, no direct impact | Orders spike, fulfillment stressed | GitHub stars explode |
| Competitor Raised | Churn +2pp, pipeline -15% | One side poached | Pipeline -10% | IP race pressure | CAC +25% (bidding war) | Feature comparison pressure |
| Talent Market Shift | Hire opportunity | Hire opportunity | Hire opportunity | Key researcher available | Marketing hire available | Senior dev available |
| Currency/Inflation | Infra costs +8% | Transaction values shift | Rate pressure from clients | Equipment costs +10% | COGS +15% | Infra costs +12% |
| Conference Season | Pipeline +20%, -€2K cash | Network effects | Speaking opportunity | Conference demo, LOI opportunity | Brand visibility | Developer conference, adoption spike |
| Key Customer Bankruptcy | Largest customer churns | Anchor tenant leaves | Biggest client gone | Pilot partner restructures | Retail partner drops | Enterprise customer gone |
| Positive Press | Pipeline +30% | Both sides +15% | Inbound +40% | Investor inbound | Organic orders +50% | GitHub trending |

### 3.4 Board Meetings

Triggered every 3 months (Month 3, 6, 9, 12, 15, 18, 21, 24).

**Board Composition evolves:**

| Phase | Board Members | Tone | Consequences |
|---|---|---|---|
| Pre-funding (M1-6) | Just founders, maybe advisor | Self-reflective, advisory | No external consequences. Advisor gives optional buff. |
| Angel/Pre-Seed (after first raise) | Founders + Angel investor | Supportive but pointed | Miss forecast by >30%: investor suggests pivot or focus area. Miss 2x in a row: investor introduces "helpful" advisor (takes 1 AP). |
| Seed (after larger raise) | Founders + Lead investor + Angel | Professional, metric-driven | Miss forecast by >30%: forced cost reduction event. Miss by >50%: board requests new hire plan. 3 consecutive misses: board discussion about "strategic alternatives" (game-ending risk). |

**Board Meeting Flow:**

1. **Dashboard View:** Full spreadsheet with Forecast (grey) and Actual (colored) columns side by side
2. **Graphs:** Two charts:
   - Primary: Revenue over time (forecast as dashed line, actual as solid line)
   - Secondary: Class-specific unit economics (LTV:CAC for SaaS/Consumer, Liquidity for Marketplace, Margin for Service, Runway vs. Milestones for Deep-Tech, Free:Paid ratio for API)
3. **Delta Highlights:** Metrics where Actual deviates >20% from Forecast are highlighted red (under) or green (over)
4. **Board Reaction:** Text-based feedback from board members, with personality. The angel is encouraging but real. The lead investor is data-driven and blunt.
5. **Player Action:** After the board meeting, player can optionally **revise their forecast** for the next quarter. This is realistic (every board meeting ends with an updated plan) and creates a record of how many times you revised.
6. **Return to Game Mode**

### 3.5 Fundraising Mechanic

Fundraising is an optional event that becomes available when conditions are met.

**Pre-Seed / Angel (available from Month 4):**
- Requires: >0 revenue OR >3 LOIs (deep-tech) OR PMF score >15
- Process: Takes 1 AP per month for 2-3 months (= reduced operational capacity during raise)
- Outcome depends on metrics at time of close: €30K-€100K
- Effect: Cash injection, investor joins board, higher expectations

**Seed (available from Month 10):**
- Requires: MRR >€3K OR >10 paying customers OR clear traction trajectory
- Process: Takes 2 AP per month for 3-4 months (fundraising dominates)
- Outcome: €150K-€500K depending on metrics
- Effect: Major cash injection, lead investor on board, formal board meetings, aggressive milestones

**Failing to raise:**
- If you start fundraising and metrics deteriorate mid-process, investors pass
- You lose the AP you spent AND have to tell your team you didn't close
- Team morale event triggered

### 3.6 Scoring and End Conditions

**PMF Score** is a composite metric, calculated differently per class:

```
SaaS:
  PMF = w1×(LTV:CAC ratio, capped at 5) + w2×(100 - churn×10) + w3×(MRR/1000) + w4×(NPS proxy)

Marketplace:
  PMF = w1×(Liquidity%) + w2×(Repeat Transaction Rate) + w3×(Revenue/1000) + w4×(Supply Growth)

Service:
  PMF = w1×(Gross Margin %) + w2×(Repeat Rate) + w3×(Revenue/Head) + w4×(Utilization, penalized >90%)

Deep-Tech:
  PMF = w1×(Certification Progress) + w2×(LOIs × 10) + w3×(Pilot conversion) + w4×(IP strength)

Consumer:
  PMF = w1×(LTV:CAC, capped at 5) + w2×(Repeat Rate×2) + w3×(Viral Coeff×20) + w4×(Revenue/1000)

API:
  PMF = w1×(Paid Users) + w2×(Gross Margin) + w3×(Usage Growth%) + w4×(Free:Paid ratio improvement)
```

**End conditions (game over):**
1. Cash ≤ 0 → Dead (any class)
2. Class-specific death condition met (see class definitions)
3. Board forces shutdown (3 consecutive major forecast misses post-Seed)

**End conditions (win):**
1. PMF score exceeds class threshold for 3 consecutive months
2. Profitability: Revenue > Burn for 3 consecutive months (alternative win)

**End conditions (time):**
1. Month 24 reached → Final scorecard regardless of state

---

## 4. UI Design

### 4.1 Screen Flow

```
[Title Screen] → [Class Select] → [Steckbrief] → [Assumption Setup] → [Game Loop]
                                                                           ↓
                                                                    [Board Meeting] (quarterly)
                                                                           ↓
                                                                    [End Screen + Export]
```

### 4.2 Game Mode Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER: ROHBAU | Class Name | Month Badge | AP: ●●● | Runway | [⚙]  │
├────────────────────────────────────┬────────────────────────────────┤
│                                    │                                │
│  EVENT AREA                        │  BUSINESS TABLE (scrollable)   │
│                                    │                                │
│  [World Event Banner]              │  Assumptions (grey, your plan) │
│                                    │  ─────────────────────────     │
│  Event Title                       │  M0  M1  M2  M3  ...          │
│  Event Description                 │  Revenue                       │
│                                    │  Customers                     │
│  [A] Choice 1            [1 AP]    │  CAC (actual)                  │
│  [B] Choice 2            [2 AP]    │  Churn                         │
│  [C] Choice 3            [1 AP]    │  ...                           │
│                                    │  Cash                          │
│  ⚡ Outcomes vary ±30%             │  Runway                        │
│                                    │                                │
├────────────────────────────────────┤  [Toggle: Model View]          │
│  LOG (scrollable, compact)         │                                │
│  ▸ M3: Hired sales rep (+€4K burn)│                                │
│  ! M3: ⚡ AI Hype Wave            │                                │
│  ▸ M2: Chose content marketing    │                                │
└────────────────────────────────────┴────────────────────────────────┘
```

### 4.3 Model View / Board Meeting Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER: 📊 Board Meeting Q2 | CloudKitchen | Month 6 | [Back]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  REVENUE CHART                                              │    │
│  │  €12K ┤          ╱ ← Forecast (dashed)                      │    │
│  │       │        ╱                                            │    │
│  │  €8K  ┤      ╱    ____── ← Actual (solid)                  │    │
│  │       │    ╱  ___─                                          │    │
│  │  €4K  ┤  ╱──                                                │    │
│  │       │╱                                                    │    │
│  │  €0   ┼───┬───┬───┬───┬───┬───                              │    │
│  │       M1  M2  M3  M4  M5  M6                                │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  FULL TABLE: Forecast vs. Actual                            │    │
│  │                                                             │    │
│  │  Metric          Plan    M1    M2    M3    M4    M5    M6   │    │
│  │  ─────────────────────────────────────────────────────────  │    │
│  │  MRR             €490   €0    €116  €290  €450  €380  €520 │    │
│  │  Customers       10     0     4     8     12    10    14    │    │
│  │  CAC             €80    -     €110  €95   €88   €92   €75  │    │
│  │  Churn           5%     -     -     8%    7%    12%   9%   │    │
│  │  LTV:CAC         3.0    -     0.8   1.2   1.5   1.1   2.0 │    │
│  │  Cash            €100K  €92K  €84K  €77K  €69K  €62K €56K │    │
│  │                                                             │    │
│  │  🔴 = >20% below forecast   🟢 = >20% above forecast       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  BOARD FEEDBACK                                             │    │
│  │                                                             │    │
│  │  👤 Self (Q1): "CAC is 37% above forecast. Either the      │    │
│  │  channel is wrong or the ICP is too narrow. Adjust."        │    │
│  │                                                             │    │
│  │  [Revise Forecast] [Continue to Q3]                         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─── UNIT ECONOMICS CHART ───────────────────────────────────┐    │
│  │  LTV:CAC over time (target line at 3.0)                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.4 Visual Style

- **Theme:** Dark, terminal-inspired, but not retro. Modern dark UI with monospace numbers and sans-serif text.
- **Fonts:** JetBrains Mono for all numbers and data. Space Grotesk for headings. DM Sans for body text.
- **Colors:** Class accent color as primary. Red for danger/below forecast. Green for success/above forecast. Yellow for warning. Grey for forecast/plan values.
- **Charts:** Clean, minimal. No grid lines. Thin lines. Forecast is always dashed grey, Actual is always solid in class color.
- **Logos:** Simple SVG, 2-3 shapes max. Monochrome with class accent color. Should feel like a YC-batch startup logo, not a corporate mark.
- **Animations:** Minimal. Numbers should tick up/down when changing. Charts should animate line drawing. No gratuitous motion.
- **Mobile:** Must work on mobile (workshop participants on phones). Single-column layout on small screens with table as horizontal scroll.

---

## 5. Excel Template Export

### 5.1 Purpose

At game end (or anytime via menu), the player can download an .xlsx file that contains:

1. **Their game data:** All monthly actuals, all decisions, forecast vs. actual
2. **A blank template:** The same financial model structure but empty, ready for the player to fill with THEIR OWN REAL startup's numbers

This is the transfer mechanism from game to reality.

### 5.2 Excel Structure (per class, SaaS example)

**Sheet 1: "Your Game"**
- Row 1-3: Header (class name, game result, date, "Rohbau - Game Export")
- Row 5: Assumptions (what player set)
- Row 7+: Monthly table with all actuals
- Row below table: Decision log
- Embedded chart: Revenue forecast vs. actual

**Sheet 2: "Your Startup (Template)"**
- Row 1-3: Header, instructions
- Row 5-12: Assumption cells (BLUE TEXT, editable) with labels and ranges
- Row 14+: Monthly projection table with FORMULAS (not hardcoded)
  - All cells are Excel formulas referencing the assumption cells
  - Changing an assumption recalculates the entire model
- Embedded chart: Revenue projection
- Conditional formatting: cells turn red when runway < 3 months

**Sheet 3: "Instructions"**
- How to use the template
- What each metric means
- Common mistakes ("Your CAC assumption is probably too low")
- Links to further reading

### 5.3 Implementation

Use SheetJS (available in browser) to generate .xlsx directly from the game state. No server needed.

```javascript
import * as XLSX from 'sheetjs';
// Build workbook from game state
// Add formulas for template sheet
// Style with colors (blue for inputs, black for formulas)
// Generate and trigger download
```

---

## 6. Events Catalogue (Summary)

### 6.1 Decision Events per Phase

**Phase 1: Discovery (Months 1-4)**
- The Pricing Question (class-specific)
- The First Honest Feedback (class-specific)
- Build vs. Learn
- The Grant Opportunity
- Co-founder Alignment Check
- First Hire Decision

**Phase 2: Validation (Months 4-8)**
- The Big Fish
- The Competitor
- The Quiet Exodus (churn/attrition)
- The Data Signal
- Team Crisis / Burnout
- Fundraising Decision (optional trigger)

**Phase 3: Scaling (Months 8-16)**
- The Scaling Question (class-specific)
- The Inflection Point
- The Mirror (what company are you building?)
- International Expansion Decision
- Enterprise vs. SMB Decision (SaaS/API)
- Platform Risk Event (Marketplace/API)

**Phase 4: Maturity (Months 16-24)**
- Series A Readiness Check
- Acqui-hire Offer
- Key Person Departure
- Market Consolidation
- Profitability vs. Growth Crossroads
- The Exit Question

### 6.2 Event Count Target

- 15-20 universal events (work for all classes with class-specific choices)
- 5-8 class-specific events per class (only trigger for that class)
- 10-12 world events
- 8-10 board response templates per investor type
- Total: ~80-100 unique events

---

## 7. Balance and Tuning

### 7.1 Difficulty Targets

- **Expected win rate (PMF achieved):** 15-25% of runs
- **Expected survival rate (alive at month 24):** 40-50%
- **Expected death rate (cash = 0):** 50-60%
- This mirrors real startup survival rates and makes winning feel earned.

### 7.2 Variance Tuning

- Base variance: ±30% on all numeric outcomes
- World events: ±50% variance (higher chaos)
- Fundraising outcomes: ±20% variance (more predictable)
- Board meeting consequences: no variance (deterministic)

### 7.3 Class Difficulty Ranking (estimated)

1. **Service** (easiest) - Revenue from month 1, slower death spiral
2. **SaaS** - Medium. Revenue possible early, but churn kills.
3. **Consumer** - Medium-hard. Fast feedback but cash burns fast.
4. **Marketplace** - Hard. Cold start is brutal.
5. **API/Platform** - Hard. Conversion is painfully slow.
6. **Deep-Tech** - Hardest. No revenue for 12+ months. Pure runway management.

---

## 8. Workshop Integration Notes

### 8.1 For Facilitators (Ben's use case)

The game can be used in a workshop setting as follows:

**Quick Play (15-20 min):** Play 6 months (through Q2 board meeting). Debrief after Q2 board meeting: "What assumptions did you set? How far off was reality? Why?"

**Full Play (30-45 min):** Play the full game. Export Excel at the end. Use the template sheet with real startup numbers.

**Debrief Questions:**
1. "Which of your assumptions was most wrong? What would you do differently?"
2. "Look at your Forecast vs. Actual chart. Where did the lines diverge? What decision caused that?"
3. "Open the Excel template. Fill in YOUR startup's real assumptions. What does the model tell you?"
4. "How many of you set CAC below €50? How many of you have actually measured your CAC?"

### 8.2 Multiplayer / Cohort Mode (future)

Not in v4, but the architecture should allow:
- Shared leaderboard (PMF score, survival months, revenue at exit)
- Same world events hitting all players simultaneously
- Post-game comparison: "Your SaaS made €8K MRR. The marketplace made €2K. The deep-tech made €0. Who's in better shape? Discuss."

---

## 9. Reference Implementation

The v3 prototype (single-file React artifact) is available as `founders_dilemma_v3.jsx` (will be renamed to `rohbau.jsx` in v4). It implements:
- 3 classes (SaaS, Marketplace, Service)
- 10 decision events with class-specific choices
- 8 world events
- ±30% variance engine
- Business model table (sidebar)
- Runway + PMF bars
- Decision log
- CSV export

Use as reference for UI patterns, event structure, and game feel. The v4 spec adds: 3 additional classes, assumption sliders, board meetings, forecast vs. actual, graphs, action points, variable game length, .xlsx export.

---

## 10. Open Questions / Parking Lot

1. **Sound design?** Nice-to-have, not critical.
2. **Persistence?** LocalStorage to save/resume. Nice for standalone, not needed for workshop.
3. **Multiplayer leaderboard?** Requires backend. Park for v5.
4. **LLM integration for assumption validation?** Explicitly parked. Mechanics should teach, not an AI evaluator.
5. **Localization?** English only for now.
6. **Game name:** Working title TBD. Should synthesize Bauhaus/craft tradition with startup context.

---

## 11. Founder Attributes and Systemic Bias

### 11.1 Why This Matters

Most startup simulations treat all founders as interchangeable. Pick a model, make decisions, see results. But in reality, the same decision produces wildly different outcomes depending on who's making it. A cold email from a Stanford MBA with a Goldman Sachs network lands differently than the same email from a first-generation immigrant without industry connections. This isn't opinion, it's documented, quantified, and systemic.

The Attributes System makes this visible and playable. Two purposes: First, different gameplay per build (replay value, different viable strategies). Second, and more importantly for workshops, it forces players to confront that the playing field is not level, and that structural advantages and disadvantages are real, measurable, and affect outcomes regardless of talent or effort.

Every modifier in this section is sourced from published research. The game doesn't editorialize. It simulates what the data shows.

### 11.2 Core Attributes (6 total, scale 1-10)

```
TECHNICAL (Tech)
  Modifies: Product development speed/quality, ability to evaluate 
  technical hires, Deep-Tech R&D speed, API infrastructure quality.
  
  High (8-10): Build it yourself. Fast iteration, strong architecture.
  Low (1-3):   Depend on hires. Bad tech decisions undetected longer.


COMMERCIAL (Sales)
  Modifies: CAC (lower with higher score), conversion rates, sales 
  cycle length, pricing confidence, fundraising pitch effectiveness.
  
  High (8-10): Sales feels natural. Enterprise deals close. Price holds.
  Low (1-3):   Underprice, avoid outbound, hope product sells itself.


NETWORK (Net)
  Modifies: Starting pipeline, advisor quality, hiring pool, investor 
  warm intros, crisis recovery speed.
  
  High (8-10): Doors open. First customers from intros. Investors reply.
  Low (1-3):   Every lead earned cold. Fundraising = unanswered emails.
  
  Network is the strongest unfair advantage in the real startup ecosystem.
  Warm intros are 13x more likely to result in funding than cold approaches 
  (Diversity VC, 2019). The game reflects this.


DOMAIN (Dom)
  Modifies: Initial assumption accuracy (high = narrower reality corridors),
  industry event interpretation, customer trust, regulatory navigation.
  
  High (8-10): You know the market. Assumptions realistic. Customers trust you.
  Low (1-3):   Learning the market while building for it.


RESILIENCE (Res)
  Modifies: Burnout probability, team morale after setbacks, AP recovery 
  after crises, persistence through extended low-PMF periods.
  
  High (8-10): Setbacks are data. You process and continue.
  Low (1-3):   Each rejection compounds. Burnout comes faster.


CAPITAL (Cap)
  Modifies: Starting cash, ability to go full-time from day 1, access to 
  F&F round, runway buffer, ability to invest in conferences/tools/coaching.
  
  High (8-10): Financial safety net. Can take risks. Can survive mistakes.
  Low (1-3):   Every euro counts. No buffer. One bad quarter kills you.
```

### 11.3 Systemic Bias Modifiers

Players choose their founder's background at character creation. Each background applies modifiers to attributes AND to specific game mechanics. These are structural conditions based on documented research.

---

#### 11.3.1 Gender

**Research basis (all sourced, all cited in-game):**

Global VC allocation 2024: 2.3% to female-only teams, 83.6% to all-male teams, 14.1% to mixed teams (PitchBook/Founders Forum Group, 2025 Report).

In Europe, female-founded startups raised 12% of total VC in 2024, roughly flat since 2020 (Female Innovation Index 2025, Female Foundry).

Female founders are asked "prevention" questions (risk/loss focused) 2:1 vs. male founders who receive "promotion" questions (growth/opportunity). Study of 189 TechCrunch Disrupt pitches 2010-2016 (Kanze, Huang, Conley, Higgins, Academy of Management Journal, 2018).

Each additional prevention question correlates with $3.8M less in aggregate funding (same study).

Survey of 361 international VCs: 26.9% believe women's participation in founding teams is "overrated"; 11.9% admit they would not invest in women-led ventures (Randomized response survey, Taylor & Francis, 2025).

Exception: Female founders in Deep-Tech raise proportionally MORE than average (33% of VC to female-founded deep-tech vs. 31% for gender-agnostic deep-tech). Linked to academia where gender representation is more equal (Female Innovation Index 2025).

Founders who reframe prevention questions with promotion answers raise avg. $7.9M more (Kanze et al., HBS/Columbia follow-up). Women are more conservative with projections, which paradoxically leads to discounting by investors accustomed to inflated forecasts.

**Game modifiers:**
```
FEMALE FOUNDER:
  Attributes: Network -1, Resilience +1
  Fundraising success rate: x0.65
  Fundraising amount when successful: x0.70
  Board meetings: prevention-question mechanic (investor focuses on risks)
  Deep-Tech class: fundraising penalty reduced to x0.85
  Investor meeting access: -20% response rate on cold outreach

MALE FOUNDER:
  No modifiers. This is the baseline the system is calibrated to.

NON-BINARY / OTHER:
  Modifiers between female and male, with additional "pattern-matching" 
  penalty (investors have fewer reference points). Limited data available,
  modeled conservatively.
```

---

#### 11.3.2 Socioeconomic Background

**Research basis:**

75% of VC-funded founders in Europe come from advantaged socioeconomic backgrounds (parents in managerial/professional roles). Survey of 1,882 European startups (Cornerstone Partners/Diversity VC/Engage Inclusivity, 2022).

72% of VC-funded UK businesses have founders from Russell Group or Oxbridge universities. 93% went to university at all (same study).

71% of partners at UK VC firms attended private (fee-paying) school vs. 7% of UK population (Diversity VC survey, 305 investors, 2023).

35% of privately-schooled VCs got their job through network vs. 25% state-school VCs (same study).

43% of UK seed funding goes to teams with at least one member from Oxford, Cambridge, Harvard, or Stanford (Extend Ventures, 2020).

80% of pre-VC founders report "living comfortably" vs. 3% "struggling to meet basic expenses" (Cornerstone, 2022).

Warm introductions are 13x more likely to result in funding than cold approaches (Diversity VC, 2019).

**Game modifiers:**
```
PRIVILEGED (upper/upper-middle class, elite education):
  Attributes: Network +3, Capital +2, Commercial +1, Resilience -1
  F&F round available at start: €20-50K
  Warm investor intros: available from month 1
  Fundraising success: x1.3
  Starting cash: +€30K
  Full-time from day 1: yes

MIDDLE CLASS:
  No modifiers (baseline).
  F&F round: small (€5-15K)
  Warm intros: limited, from month 3-4
  Full-time: yes (personal savings)

WORKING CLASS / FIRST-GENERATION:
  Attributes: Network -3, Capital -3, Resilience +2, Domain +1 (in specific markets)
  No F&F round
  No warm investor intros until earned (accelerator, program)
  Must work part-time first 3-6 months: -1 AP
  Fundraising success: x0.6
  Starting cash: -€30K
  Grant applications: slightly higher success (diversity criteria in some programs)
  Higher customer empathy in B2C/community markets
```

---

#### 11.3.3 Ethnicity and Migration Background

**Research basis:**

In the UK, 0.24% of VC funding 2009-2019 went to Black founders, 38 businesses total in a decade. Black female founders received 0.02% (Extend Ventures, "Diversity Beyond Gender," 2020).

Only 0.9% of founders in Europe are Black (Extend Ventures/Sifted, 2021).

Black-founded startups that enter the VC pipeline raise only 1/3 of the amount raised by non-Black-founded startups (Yimfor, Cook, Marx, "Funding Black High-Growth Startups," Columbia Business School, 2024).

88% of Black founders in the UK self-funded their ventures (10X10/Google report).

Having a Black person head the investment team narrows the funding gap by ~50 percentage points (Yimfor et al., 2024).

Ethnic minority communities contribute £25-32 billion to UK economy annually but are statistically more likely to be refused business loans (various sources compiled by Do It Now Now).

In 2021 European tech, only 8% of leadership positions held by non-white founders. 1.8% of European startup capital went to Black founders (State of European Tech/Atomico, 2021).

Diverse founding teams achieve 30% higher returns than all-white teams (Kauffman Fellows Research Center). Female founders generate $0.78 revenue per dollar invested vs. $0.31 for male-founded startups (BCG).

**Game modifiers:**
```
ETHNIC MINORITY (non-white in European context):
  Attributes: Network -2, Capital -1, Resilience +2
  Domain: +2 if building for own community, -1 if entering unfamiliar market
  Fundraising success: x0.45
  Fundraising amount when successful: x0.55
  Investor meetings: cold outreach penalty amplified
  Pattern-matching penalty: investors compare to portfolio (predominantly white)
  BUT: Diversity-focused grants/accelerators appear as events with higher probability
  BUT: Community-building advantages in specific markets
  BUT: When funded, returns are statistically higher (model as: if you survive
       past month 12, growth rate bonus kicks in)

BLACK FOUNDER (if game distinguishes):
  All above, amplified:
  Attributes: Network -3, Capital -2, Resilience +3
  Fundraising success: x0.25
  Self-funding assumed unless explicit funding event succeeds
  88% chance of needing to self-fund (matching real data)
  BUT: Highest documented resilience and resourcefulness
  BUT: When funded AND surviving, statistically superior returns

IMMIGRANT / EXPAT:
  Attributes: Network -2 (in new country), Domain -1 (local market), 
              Resilience +1, Technical unchanged
  Language/cultural barrier: slight penalty on sales and investor communication
  BUT: International perspective as advantage in cross-border markets
  BUT: Access to diaspora networks (smaller but loyal)
```

---

#### 11.3.4 Intersectionality

Modifiers compound multiplicatively, not additively. A Black woman from a working-class background:
- Gender fundraising: x0.65
- Ethnicity fundraising: x0.25
- Class fundraising: x0.6
- Combined multiplicative effect: x0.10

The 0.02% real-world statistic (Black female founders' share of UK VC) is the empirical outcome of this intersection. The game models the same compounding.

This means certain character builds are genuinely playing the game on a fundamentally different difficulty level. That IS the point. The game makes the invisible visible.

---

#### 11.3.5 Age

Less researched but still relevant:

```
20s:
  Attributes: Resilience +1, Capital -2, Network -2, Domain -1
  Energy: higher AP recovery
  Investor bias: "too young, no experience" (slight pitch penalty)
  BUT: lower burn rate expectations, more risk-tolerant

30s:
  Baseline. No modifiers.
  Peak founder age bracket statistically.

40s+:
  Attributes: Network +2, Domain +2, Capital +1, Resilience -1
  Investor bias: "why now?" questions (slight pitch penalty in tech)
  BUT: stronger industry connections, more realistic assumptions
  BUT: family obligations may reduce available AP by 1
  Higher credibility in enterprise/B2B sales
```

### 11.4 Preset Characters (one duo per class)

```
CloudKitchen (SaaS):
  Mira Chen - Female, 30s, middle class, 2nd-gen immigrant
  Jonas Richter - Male, 30s, upper-middle class, Austrian
  Combined: Tech 8, Sales 3, Network 4, Domain 6, Resilience 6, Capital 5
  Bias modifiers: Mira's gender on fundraising. Mixed-gender team helps slightly.
  Difficulty: Medium

SwapCircle (Marketplace):
  Lena Kowalski - Female, 20s, working class, Polish immigrant
  Marco Di Stefano - Male, 30s, middle class, Italian
  Combined: Tech 4, Sales 5, Network 3, Domain 5, Resilience 7, Capital 3
  Bias modifiers: Lena's gender + class + migration background stack.
  Difficulty: Hard

StrategyForge (Service):
  David Ashworth - Male, 40s, privileged background, British
  Priya Sharma - Female, 30s, middle class, Indian background
  Combined: Tech 5, Sales 8, Network 8, Domain 7, Resilience 4, Capital 7
  Bias modifiers: David's privilege offsets. Priya's background affects some events.
  Difficulty: Easy

NanoSense (Deep-Tech):
  Dr. Sarah Lindström - Female, 30s, middle class, Swedish
  Thomas Huber - Male, 40s, middle class, Austrian
  Combined: Tech 9, Sales 2, Network 5, Domain 10, Resilience 6, Capital 4
  Bias modifiers: Sarah's gender reduced in Deep-Tech (academic context).
  Difficulty: Hard (inherent to Deep-Tech, not founders)

GlowUp (Consumer/D2C):
  Nina Volkov - Female, 20s, working class, Ukrainian-Austrian
  Dr. Alex Berger - Male, 30s, middle class, Austrian
  Combined: Tech 4, Sales 7, Network 4, Domain 5, Resilience 8, Capital 3
  Bias modifiers: Nina's gender + class. Influencer audience offsets network gap.
  Difficulty: Medium-Hard

DataPipe (API/Platform):
  Kenji Tanaka - Male, 30s, middle class, Japanese expat
  Fatima Al-Rashid - Female, 30s, middle class, Syrian background
  Combined: Tech 9, Sales 3, Network 3, Domain 7, Resilience 6, Capital 3
  Bias modifiers: Both face pattern-matching. Fatima's gender + ethnicity compound.
  Difficulty: Hard
```

### 11.5 Custom Character Creation

After playing presets, players can build their own founder:

**Step 1:** Distribute 30 points across 6 attributes (avg 5, min 1, max 10)

**Step 2:** Select background:
- Gender: Male / Female / Non-binary
- Socioeconomic: Privileged / Middle class / Working class
- Ethnicity: Majority / Ethnic minority / Black
- Age: 20s / 30s / 40s+
- Special condition (optional, one max):
  - "Serial founder (previous exit)": Net +3, Cap +3, Res +2, fundraising x1.5
  - "PhD / Academic": Tech +3, Dom +3, Sales -2, Net -1
  - "Corporate escapee (10+ yrs)": Dom +2, Net +2, Cap +2, Sales +1, Res -1
  - "Family business heir": Cap +4, Net +3, Res -2, Dom +1
  - "Solo founder": No averaging, AP permanently -1, burnout 2x

**Step 3:** Game shows resulting difficulty rating with explanation and sources.

### 11.6 Design Principles

**Show, don't preach.** The game never says "the system is unfair." It creates conditions where the player experiences it. A female founder notices fundraising fails more. A working-class player notices network strategies don't work. The debrief is where the lesson lands.

**Data, not opinion.** Every modifier is sourced. The game shows citations on request. This is a simulation of documented market conditions, not a political statement.

**Advantages exist too.** Resilience, community knowledge, diverse perspective, higher returns when funded. BCG found female founders generate 2.5x more revenue per dollar invested. Diverse teams achieve 30% higher returns. The game models advantages as concretely as disadvantages.

**Difficulty is transparent.** Character creation shows: "Your fundraising multiplier is x0.3. Based on: [sources]." No hidden penalties.

**Workshop debrief prompt:** "Who played a female founder? How was fundraising? Who had a privileged background? How was month 1 compared to the working-class founder next to you? Now: which profile matches YOUR actual situation?"
