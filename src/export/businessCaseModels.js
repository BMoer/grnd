// ═══════════════════════════════════════════════════════════════
// BUSINESS CASE MODELS — class-specific revenue engines for the
// Excel business case template (see businessCase.js).
//
// Each model declares:
//   inputs        driver rows (pessimistic / base / optimistic), with an
//                 optional mapping from the player's setup assumptions
//                 (fromGame) and from their final game state (gameActual)
//   fixedCosts    class-specific fixed cost rows on top of team/other
//   columns       monthly plan columns before the shared P&L columns.
//                 formula(ctx) gets: in(key) → input cell, c(key) → this
//                 row's cell, cp(key) → previous row's cell, m → month
//   month0        starting values for stock columns (customers etc.)
//   revenue / variable / acquisition   column keys feeding the P&L
//   volume        the headline volume column for the summary
//   unitEconomics rows computed from inputs (one column per scenario)
//
// All percentages are entered as numbers (5 = 5 %).
// ═══════════════════════════════════════════════════════════════

const pct = (ref) => `(${ref}/100)`;

// ─── SaaS ───────────────────────────────────────────────────
const saas = {
	label: "SaaS / subscription",
	startCash: 100000,
	teamCost: 4500,
	otherFixed: 500,
	inputs: [
		{ key: "price", label: "Price per customer per month", unit: "€", base: 49, pess: 39, opt: 59, guidance: "What one paying customer pays per month (net of discounts).", fromGame: (a) => a.price, gameActual: (s) => s.price },
		{ key: "customers0", label: "Paying customers today", unit: "count", base: 0, pess: 0, opt: 0, guidance: "Customers who pay you right now. 0 is fine." },
		{ key: "leads", label: "New trials / qualified leads per month (month 1)", unit: "count", base: 20, pess: 12, opt: 30, guidance: "People entering your funnel each month at the start.", fromGame: (a) => a.pipelineGrowth },
		{ key: "leadGrowth", label: "Lead growth per month", unit: "%", base: 5, pess: 2, opt: 8, guidance: "How fast your funnel grows. 0 = flat." },
		{ key: "conversion", label: "Trial-to-paid conversion", unit: "%", base: 15, pess: 8, opt: 20, guidance: "B2B SaaS: 10–25 %.", fromGame: (a) => a.conversionRate, gameActual: (s) => s.conversionRate },
		{ key: "churn", label: "Monthly churn", unit: "%", base: 5, pess: 8, opt: 3, guidance: "Share of customers lost per month. SMB 3–7 %, enterprise < 2 %.", fromGame: (a) => a.churnRate, gameActual: (s) => s.churn },
		{ key: "cac", label: "CAC — cost to acquire one paying customer", unit: "€", base: 80, pess: 150, opt: 60, guidance: "All sales & marketing spend ÷ new customers. Include paid tools, events, your sales time if paid.", fromGame: (a) => a.targetCAC, gameActual: (s) => s.cac },
		{ key: "cts", label: "Cost to serve per customer per month", unit: "€", base: 5, pess: 8, opt: 4, section: "variable", guidance: "Hosting, support, onboarding per customer.", fromGame: (a) => a.supportCost },
		{ key: "fees", label: "Payment & platform fees", unit: "%", base: 3, pess: 3, opt: 3, section: "variable", guidance: "Stripe, app stores, resellers — share of revenue." },
	],
	columns: [
		{ key: "leads", header: "Leads", fmt: "int", formula: ({ in: i, cp, m }) => (m === 1 ? i("leads") : `${cp("leads")}*(1+${pct(i("leadGrowth"))})`) },
		{ key: "newCust", header: "New customers", fmt: "dec", formula: ({ in: i, c }) => `${c("leads")}*${pct(i("conversion"))}` },
		{ key: "lostCust", header: "Churned", fmt: "dec", formula: ({ in: i, cp }) => `${cp("customers")}*${pct(i("churn"))}` },
		{ key: "customers", header: "Customers", fmt: "dec", formula: ({ c, cp }) => `MAX(0,${cp("customers")}+${c("newCust")}-${c("lostCust")})` },
		{ key: "revenue", header: "Revenue (MRR)", fmt: "eur", formula: ({ in: i, c }) => `${c("customers")}*${i("price")}` },
		{ key: "variable", header: "Cost to serve", fmt: "eur", formula: ({ in: i, c }) => `${c("customers")}*${i("cts")}+${c("revenue")}*${pct(i("fees"))}` },
		{ key: "acquisition", header: "Sales & marketing", fmt: "eur", formula: ({ in: i, c }) => `${c("newCust")}*${i("cac")}` },
	],
	month0: { customers: (i) => i("customers0") },
	volume: { key: "customers", label: "Customers" },
	unitEconomics: [
		{ key: "arpu", label: "Revenue per customer per month", unit: "€", formula: (i) => i("price") },
		{ key: "contrib", label: "Contribution per customer per month", unit: "€", formula: (i) => `${i("price")}*(1-${pct(i("fees"))})-${i("cts")}`, note: "Price minus fees minus cost to serve." },
		{ key: "life", label: "Average customer lifetime", unit: "months", formula: (i) => `IF(${i("churn")}>0,1/${pct(i("churn"))},120)` },
		{ key: "ltv", label: "LTV (contribution over lifetime)", unit: "€", ref: ["contrib", "life"], formula: (_i, u) => `${u("contrib")}*${u("life")}` },
		{ key: "cac", label: "CAC", unit: "€", formula: (i) => i("cac") },
		{ key: "ratio", label: "LTV : CAC", unit: "x", formula: (_i, u) => `IF(${u("cac")}>0,${u("ltv")}/${u("cac")},0)`, benchmark: { good: 3, ok: 2, higherIsBetter: true } },
		{ key: "payback", label: "CAC payback", unit: "months", formula: (_i, u) => `IF(${u("contrib")}>0,${u("cac")}/${u("contrib")},999)`, benchmark: { good: 12, ok: 18, higherIsBetter: false } },
	],
};

// ─── Consumer / D2C ─────────────────────────────────────────
const consumer = {
	label: "Consumer / D2C",
	startCash: 80000,
	teamCost: 3500,
	otherFixed: 500,
	inputs: [
		{ key: "aov", label: "Average order value", unit: "€", base: 35, pess: 30, opt: 42, guidance: "Net basket value per order (after discounts, excl. VAT).", fromGame: (a) => a.aov, gameActual: (s) => s.aov },
		{ key: "active0", label: "Active customers today", unit: "count", base: 50, pess: 50, opt: 50, guidance: "Customers who ordered in the last ~3 months." },
		{ key: "adSpend", label: "Paid marketing per month", unit: "€", base: 5000, pess: 5000, opt: 5000, guidance: "Ads, influencers, promos. Your main growth lever and your main cash drain.", fromGame: (a) => a.adSpend, gameActual: (s) => s.adSpend },
		{ key: "cac", label: "CAC — paid cost per new customer", unit: "€", base: 25, pess: 40, opt: 18, guidance: "Meta/Instagram D2C: €15–40, rising as you scale.", fromGame: (a) => a.targetCAC, gameActual: (s) => s.cac },
		{ key: "viral", label: "Referrals per new customer", unit: "x", base: 0.15, pess: 0.05, opt: 0.3, guidance: "How many extra customers each new customer brings (k-factor). 0.1–0.3 is normal, > 1 is viral.", fromGame: (a) => (a.viralCoeff ?? 0) / 100, gameActual: (s) => (s.viralCoeff ?? 0) / 100 },
		{ key: "repeat", label: "Repeat purchase rate per month", unit: "%", base: 15, pess: 8, opt: 25, guidance: "Share of active customers who reorder in a given month.", fromGame: (a) => a.repeatRate, gameActual: (s) => s.repeatRate },
		{ key: "dormancy", label: "Customers going inactive per month", unit: "%", base: 16, pess: 22, opt: 10, guidance: "Share of active customers you lose each month. Strong brands: < 10 %." },
		{ key: "cogs", label: "Product cost per order (COGS)", unit: "€", base: 12, pess: 14, opt: 10, section: "variable", guidance: "Product + packaging.", fromGame: (a) => a.cogs, gameActual: (s) => s.cogs },
		{ key: "fulfil", label: "Shipping & fulfilment per order", unit: "€", base: 3, pess: 4, opt: 3, section: "variable", guidance: "Pick, pack, ship, returns." },
		{ key: "fees", label: "Payment & marketplace fees", unit: "%", base: 5, pess: 5, opt: 5, section: "variable", guidance: "Payment provider, Amazon, retailer margin if any." },
	],
	columns: [
		{ key: "newPaid", header: "New (paid)", fmt: "dec", formula: ({ in: i }) => `IF(${i("cac")}>0,${i("adSpend")}/${i("cac")},0)` },
		{ key: "newRef", header: "New (referred)", fmt: "dec", formula: ({ in: i, cp }) => `(${cp("newPaid")}+${cp("newRef")})*${i("viral")}` },
		{ key: "active", header: "Active customers", fmt: "dec", formula: ({ in: i, c, cp }) => `${cp("active")}*(1-${pct(i("dormancy"))})+${c("newPaid")}+${c("newRef")}` },
		{ key: "repeatOrders", header: "Repeat orders", fmt: "dec", formula: ({ in: i, cp }) => `${cp("active")}*${pct(i("repeat"))}` },
		{ key: "orders", header: "Orders", fmt: "dec", formula: ({ c }) => `${c("newPaid")}+${c("newRef")}+${c("repeatOrders")}` },
		{ key: "revenue", header: "Revenue", fmt: "eur", formula: ({ in: i, c }) => `${c("orders")}*${i("aov")}` },
		{ key: "variable", header: "COGS & fulfilment", fmt: "eur", formula: ({ in: i, c }) => `${c("orders")}*(${i("cogs")}+${i("fulfil")})+${c("revenue")}*${pct(i("fees"))}` },
		{ key: "acquisition", header: "Paid marketing", fmt: "eur", formula: ({ in: i }) => i("adSpend") },
	],
	month0: { newPaid: () => "0", newRef: () => "0", active: (i) => i("active0") },
	volume: { key: "active", label: "Active customers" },
	unitEconomics: [
		{ key: "contrib", label: "Contribution per order", unit: "€", formula: (i) => `${i("aov")}*(1-${pct(i("fees"))})-${i("cogs")}-${i("fulfil")}`, note: "Order value minus fees, product, shipping." },
		{ key: "orders", label: "Orders per customer over lifetime", unit: "count", formula: (i) => `1+IF(${i("dormancy")}>0,${i("repeat")}/${i("dormancy")},0)`, note: "First order + repeat rate × active months." },
		{ key: "ltv", label: "LTV (contribution over lifetime)", unit: "€", formula: (_i, u) => `${u("contrib")}*${u("orders")}` },
		{ key: "cac", label: "Paid CAC", unit: "€", formula: (i) => i("cac") },
		{ key: "blended", label: "Blended CAC (incl. referrals)", unit: "€", formula: (i) => `${i("cac")}/(1+${i("viral")})` },
		{ key: "ratio", label: "LTV : paid CAC", unit: "x", formula: (_i, u) => `IF(${u("cac")}>0,${u("ltv")}/${u("cac")},0)`, benchmark: { good: 3, ok: 2, higherIsBetter: true } },
		{ key: "payback", label: "Orders needed to pay back CAC", unit: "orders", formula: (_i, u) => `IF(${u("contrib")}>0,${u("cac")}/${u("contrib")},999)`, benchmark: { good: 1.5, ok: 2.5, higherIsBetter: false } },
	],
};

// ─── Deep-Tech / Hardware ───────────────────────────────────
const deeptech = {
	label: "Deep-Tech / hardware",
	startCash: 120000,
	teamCost: 3000,
	otherFixed: 500,
	funding: [
		{ name: "Grant (tranche 1)", month: 1, amount: 150000, type: "Grant" },
		{ name: "Grant (tranche 2)", month: 13, amount: 150000, type: "Grant" },
	],
	inputs: [
		{ key: "unitPrice", label: "Price per unit / system", unit: "€", base: 2000, pess: 1500, opt: 2500, guidance: "What a customer pays per unit.", fromGame: (a) => a.unitPrice, gameActual: (s) => s.unitPrice },
		{ key: "launch", label: "Month of market readiness (certification / CE / TRL 7)", unit: "month", base: 14, pess: 20, opt: 10, guidance: "No sales before this month. Add 50 % to your first guess.", fromGame: (a) => a.certTimeline },
		{ key: "lois0", label: "LOIs / pilot commitments at launch", unit: "count", base: 3, pess: 1, opt: 6, guidance: "Signed letters of intent waiting for the product. Names, not hopes.", fromGame: (a) => a.pilotPipeline },
		{ key: "newLois", label: "New LOIs per month after launch", unit: "count", base: 0.5, pess: 0.2, opt: 1, guidance: "Sales capacity of the team once you can sell." },
		{ key: "loiConv", label: "LOIs converting to orders per month", unit: "%", base: 35, pess: 20, opt: 50, guidance: "Industrial buyers move slowly: budgets, approvals, pilots." },
		{ key: "unitsPerOrder", label: "Units per first order", unit: "count", base: 5, pess: 3, opt: 8, guidance: "A first industrial order is usually a small fleet." },
		{ key: "reorder", label: "Follow-up units per customer per month", unit: "count", base: 0.3, pess: 0.1, opt: 0.6, guidance: "Rollout after a successful first order." },
		{ key: "unitCost", label: "Cost per unit (COGS)", unit: "€", base: 500, pess: 800, opt: 400, section: "variable", guidance: "Material, assembly, calibration per unit.", fromGame: (a) => a.unitCost, gameActual: (s) => s.unitCost },
		{ key: "salesCost", label: "Sales & pilot cost per new customer", unit: "€", base: 5000, pess: 8000, opt: 3000, section: "variable", guidance: "Travel, pilot installation, trials, trade fairs." },
	],
	fixedCosts: [
		{ key: "rd", label: "R&D / lab costs per month", unit: "€", base: 15000, pess: 18000, opt: 12000, guidance: "Lab, materials, equipment, researchers. Usually the largest cost block.", fromGame: (a) => a.rdBurn, gameActual: (s) => s.rdBurn },
	],
	columns: [
		{ key: "live", header: "On market", fmt: "int", formula: ({ in: i, m }) => `IF(${m}>=${i("launch")},1,0)` },
		{ key: "orders", header: "New customers", fmt: "dec", formula: ({ in: i, c, cp }) => `${c("live")}*(${cp("lois")}+IF(${c("live")}>${cp("live")},${i("lois0")},0))*${pct(i("loiConv"))}` },
		{ key: "lois", header: "Open LOIs", fmt: "dec", formula: ({ in: i, c, cp }) => `${cp("lois")}+IF(${c("live")}>${cp("live")},${i("lois0")},0)+${c("live")}*${i("newLois")}-${c("orders")}` },
		{ key: "customers", header: "Customers", fmt: "dec", formula: ({ c, cp }) => `${cp("customers")}+${c("orders")}` },
		{ key: "units", header: "Units sold", fmt: "dec", formula: ({ in: i, c, cp }) => `${c("orders")}*${i("unitsPerOrder")}+${cp("customers")}*${i("reorder")}` },
		{ key: "revenue", header: "Revenue", fmt: "eur", formula: ({ in: i, c }) => `${c("units")}*${i("unitPrice")}` },
		{ key: "variable", header: "COGS", fmt: "eur", formula: ({ in: i, c }) => `${c("units")}*${i("unitCost")}` },
		{ key: "acquisition", header: "Sales & pilots", fmt: "eur", formula: ({ in: i, c }) => `${c("orders")}*${i("salesCost")}` },
	],
	month0: { live: () => "0", lois: () => "0", customers: () => "0" },
	volume: { key: "units", label: "Units sold / month" },
	unitEconomics: [
		{ key: "margin", label: "Gross margin per unit", unit: "€", formula: (i) => `${i("unitPrice")}-${i("unitCost")}` },
		{ key: "marginPct", label: "Gross margin per unit (% of price)", unit: "%", formula: (i) => `IF(${i("unitPrice")}>0,(${i("unitPrice")}-${i("unitCost")})/${i("unitPrice")}*100,0)`, benchmark: { good: 60, ok: 40, higherIsBetter: true } },
		{ key: "firstOrder", label: "Gross profit of a first order", unit: "€", formula: (i, u) => `${u("margin")}*${i("unitsPerOrder")}` },
		{ key: "ltv", label: "Gross profit per customer (first order + 24 months rollout)", unit: "€", formula: (i, u) => `${u("firstOrder")}+${u("margin")}*${i("reorder")}*24` },
		{ key: "cac", label: "Sales & pilot cost per customer", unit: "€", formula: (i) => i("salesCost") },
		{ key: "ratio", label: "LTV : CAC", unit: "x", formula: (_i, u) => `IF(${u("cac")}>0,${u("ltv")}/${u("cac")},0)`, benchmark: { good: 3, ok: 2, higherIsBetter: true } },
		{ key: "preLaunchBurn", label: "Fixed burn until market readiness", unit: "€", formula: (i) => `(${i("rd")}+${i("team")}+${i("other")})*(${i("launch")}-1)`, note: "Excludes hires. Compare with cash + grants." },
	],
};

// ─── Marketplace / platform ─────────────────────────────────
const marketplace = {
	label: "Marketplace / platform",
	startCash: 100000,
	teamCost: 3500,
	otherFixed: 300,
	inputs: [
		{ key: "atv", label: "Average transaction value (GMV)", unit: "€", base: 300, pess: 200, opt: 400, guidance: "What changes hands per transaction.", fromGame: (a) => a.avgTransaction, gameActual: (s) => s.avgTransaction },
		{ key: "take", label: "Take rate", unit: "%", base: 10, pess: 8, opt: 12, guidance: "Your share of GMV. Above ~15 % users start dealing around you.", fromGame: (a) => a.takeRate, gameActual: (s) => s.takeRate },
		{ key: "supply0", label: "Active suppliers today", unit: "count", base: 15, pess: 15, opt: 15, guidance: "Providers / sellers who can take a job now." },
		{ key: "demand0", label: "Active buyers today", unit: "count", base: 8, pess: 8, opt: 8, guidance: "Buyers who would transact now." },
		{ key: "mkt", label: "Marketing budget per month", unit: "€", base: 1500, pess: 1500, opt: 1500, guidance: "Split between both sides below." },
		{ key: "supplyShare", label: "Share of budget on supply side", unit: "%", base: 50, pess: 50, opt: 50, guidance: "Most marketplaces anchor one side first." },
		{ key: "supplyCac", label: "Cost to acquire one supplier", unit: "€", base: 40, pess: 60, opt: 25, guidance: "", fromGame: (a) => a.supplyCAC, gameActual: (s) => s.supplyCAC },
		{ key: "demandCac", label: "Cost to acquire one buyer", unit: "€", base: 30, pess: 45, opt: 20, guidance: "", fromGame: (a) => a.demandCAC, gameActual: (s) => s.demandCAC },
		{ key: "freq", label: "Transactions per active buyer per month", unit: "count", base: 0.5, pess: 0.3, opt: 0.8, guidance: "How often a buyer comes back." },
		{ key: "jobs", label: "Transactions one supplier can serve per month", unit: "count", base: 2.5, pess: 2, opt: 3, guidance: "Supply capacity. If demand exceeds it, buyers wait or leave." },
		{ key: "supplyChurn", label: "Supplier churn per month", unit: "%", base: 12, pess: 18, opt: 8, guidance: "Idle suppliers leave fast.", fromGame: (a) => a.supplyChurn, gameActual: (s) => s.supplyChurn },
		{ key: "demandChurn", label: "Buyer churn per month", unit: "%", base: 15, pess: 20, opt: 10, guidance: "Buyers who don't find a match don't come back.", fromGame: (a) => a.demandChurn, gameActual: (s) => s.demandChurn },
		{ key: "wom", label: "New buyers per completed transaction (word of mouth)", unit: "x", base: 0.2, pess: 0.1, opt: 0.3, guidance: "The network effect. Grows with activity, not with sign-ups." },
		{ key: "txCost", label: "Payment & support cost per transaction", unit: "€", base: 5, pess: 7, opt: 4, section: "variable", guidance: "Payment fees, disputes, support." },
	],
	columns: [
		{ key: "newSupply", header: "New suppliers", fmt: "dec", formula: ({ in: i }) => `IF(${i("supplyCac")}>0,${i("mkt")}*${pct(i("supplyShare"))}/${i("supplyCac")},0)` },
		{ key: "supply", header: "Suppliers", fmt: "dec", formula: ({ in: i, c, cp }) => `${cp("supply")}*(1-${pct(i("supplyChurn"))})+${c("newSupply")}` },
		{ key: "newDemand", header: "New buyers", fmt: "dec", formula: ({ in: i, cp }) => `IF(${i("demandCac")}>0,${i("mkt")}*(1-${pct(i("supplyShare"))})/${i("demandCac")},0)+${cp("tx")}*${i("wom")}` },
		{ key: "demand", header: "Buyers", fmt: "dec", formula: ({ in: i, c, cp }) => `${cp("demand")}*(1-${pct(i("demandChurn"))})+${c("newDemand")}` },
		{ key: "tx", header: "Transactions", fmt: "dec", formula: ({ in: i, c }) => `MIN(${c("demand")}*${i("freq")},${c("supply")}*${i("jobs")})`, note: "Limited by the smaller side." },
		{ key: "fill", header: "Fill rate %", fmt: "pct", formula: ({ in: i, c }) => `IF(${c("demand")}*${i("freq")}>0,${c("tx")}/(${c("demand")}*${i("freq")})*100,0)` },
		{ key: "gmv", header: "GMV", fmt: "eur", formula: ({ in: i, c }) => `${c("tx")}*${i("atv")}` },
		{ key: "revenue", header: "Net revenue", fmt: "eur", formula: ({ in: i, c }) => `${c("gmv")}*${pct(i("take"))}` },
		{ key: "variable", header: "Transaction costs", fmt: "eur", formula: ({ in: i, c }) => `${c("tx")}*${i("txCost")}` },
		{ key: "acquisition", header: "Marketing", fmt: "eur", formula: ({ in: i }) => i("mkt") },
	],
	month0: { supply: (i) => i("supply0"), demand: (i) => i("demand0"), tx: () => "0" },
	volume: { key: "tx", label: "Transactions / month" },
	unitEconomics: [
		{ key: "netTx", label: "Net revenue per transaction", unit: "€", formula: (i) => `${i("atv")}*${pct(i("take"))}-${i("txCost")}` },
		{ key: "buyerTx", label: "Transactions per buyer over lifetime", unit: "count", formula: (i) => `IF(${i("demandChurn")}>0,${i("freq")}/${pct(i("demandChurn"))},0)` },
		{ key: "ltv", label: "Buyer LTV (net revenue over lifetime)", unit: "€", formula: (_i, u) => `${u("netTx")}*${u("buyerTx")}` },
		{ key: "cac", label: "Buyer CAC", unit: "€", formula: (i) => i("demandCac") },
		{ key: "ratio", label: "Buyer LTV : CAC", unit: "x", formula: (_i, u) => `IF(${u("cac")}>0,${u("ltv")}/${u("cac")},0)`, benchmark: { good: 3, ok: 1.5, higherIsBetter: true } },
		{ key: "supplyPayback", label: "Transactions to pay back one supplier", unit: "count", formula: (i, u) => `IF(${u("netTx")}>0,${i("supplyCac")}/${u("netTx")},999)` },
		{ key: "gmvNeeded", label: "GMV per month to cover fixed costs", unit: "€", formula: (i) => `IF(${i("take")}>0,(${i("team")}+${i("other")}+${i("mkt")})/${pct(i("take"))},0)`, note: "Excludes hires and transaction costs." },
	],
};

// ─── Service / agency ───────────────────────────────────────
const service = {
	label: "Service / consulting",
	startCash: 30000,
	teamCost: 6000,
	otherFixed: 500,
	inputs: [
		{ key: "price", label: "Revenue per client per month", unit: "€", base: 5000, pess: 4000, opt: 6500, guidance: "Monthly fee or project value spread over its duration.", fromGame: (a) => a.avgProject, gameActual: (s) => s.avgProject },
		{ key: "clients0", label: "Active clients today", unit: "count", base: 2, pess: 2, opt: 2, guidance: "" },
		{ key: "leads", label: "Qualified leads per month", unit: "count", base: 4, pess: 3, opt: 6, guidance: "Real conversations with budget and need." },
		{ key: "close", label: "Close rate", unit: "%", base: 25, pess: 15, opt: 35, guidance: "Leads that sign.", fromGame: (a) => a.closeRate, gameActual: (s) => s.closeRate },
		{ key: "length", label: "Average engagement length", unit: "months", base: 4, pess: 3, opt: 6, guidance: "Retainers and repeat business make this longer." },
		{ key: "hours", label: "Delivery hours per client per month", unit: "h", base: 40, pess: 48, opt: 30, guidance: "Productized offers need fewer hours. This is your scaling lever.", gameActual: (s) => s.hoursPerClient },
		{ key: "capacity", label: "Billable hours of founders per month", unit: "h", base: 320, pess: 320, opt: 320, guidance: "Two founders × 160 h. Hires add hours below.", fromGame: (a) => a.teamCapacity },
		{ key: "hireHours", label: "Billable hours per hire per month", unit: "h", base: 130, pess: 120, opt: 140, guidance: "Hires from the hiring plan add this capacity." },
		{ key: "directCost", label: "Direct cost per delivery hour", unit: "€", base: 25, pess: 30, opt: 20, section: "variable", guidance: "Tools, travel, licences per hour delivered." },
		{ key: "freelance", label: "Freelancer cost per hour (above capacity)", unit: "€", base: 80, pess: 90, opt: 70, section: "variable", guidance: "Hours beyond your capacity are bought in." },
		{ key: "salesCost", label: "Sales cost per new client", unit: "€", base: 500, pess: 800, opt: 300, section: "variable", guidance: "Pitches, proposals, events." },
	],
	columns: [
		{ key: "newClients", header: "New clients", fmt: "dec", formula: ({ in: i }) => `${i("leads")}*${pct(i("close"))}` },
		{ key: "endClients", header: "Ending clients", fmt: "dec", formula: ({ in: i, cp }) => `IF(${i("length")}>0,${cp("clients")}/${i("length")},0)` },
		{ key: "clients", header: "Active clients", fmt: "dec", formula: ({ c, cp }) => `MAX(0,${cp("clients")}+${c("newClients")}-${c("endClients")})` },
		{ key: "billable", header: "Delivery hours", fmt: "int", formula: ({ in: i, c }) => `${c("clients")}*${i("hours")}` },
		{ key: "capacityH", header: "Capacity hours", fmt: "int", formula: ({ in: i, c }) => `${i("capacity")}+${c("hiresActive")}*${i("hireHours")}` },
		{ key: "util", header: "Utilization %", fmt: "pct", formula: ({ c }) => `IF(${c("capacityH")}>0,${c("billable")}/${c("capacityH")}*100,0)`, note: "Healthy: 70–90 %." },
		{ key: "revenue", header: "Revenue", fmt: "eur", formula: ({ in: i, c }) => `${c("clients")}*${i("price")}` },
		{ key: "variable", header: "Delivery costs", fmt: "eur", formula: ({ in: i, c }) => `${c("billable")}*${i("directCost")}+MAX(0,${c("billable")}-${c("capacityH")})*${i("freelance")}` },
		{ key: "acquisition", header: "Sales", fmt: "eur", formula: ({ in: i, c }) => `${c("newClients")}*${i("salesCost")}` },
	],
	month0: { clients: (i) => i("clients0") },
	needsHireCount: true,
	volume: { key: "clients", label: "Active clients" },
	unitEconomics: [
		{ key: "hourly", label: "Effective revenue per delivery hour", unit: "€", formula: (i) => `IF(${i("hours")}>0,${i("price")}/${i("hours")},0)` },
		{ key: "contrib", label: "Contribution per client per month", unit: "€", formula: (i) => `${i("price")}-${i("hours")}*${i("directCost")}` },
		{ key: "ltv", label: "Contribution per client over engagement", unit: "€", formula: (i, u) => `${u("contrib")}*${i("length")}` },
		{ key: "cac", label: "Sales cost per new client", unit: "€", formula: (i) => i("salesCost") },
		{ key: "ratio", label: "LTV : CAC", unit: "x", formula: (_i, u) => `IF(${u("cac")}>0,${u("ltv")}/${u("cac")},0)`, benchmark: { good: 5, ok: 3, higherIsBetter: true } },
		{ key: "maxClients", label: "Clients the founders can serve alone", unit: "count", formula: (i) => `IF(${i("hours")}>0,${i("capacity")}/${i("hours")}*0.85,0)`, note: "At 85 % utilization. Beyond this you hire or productize." },
		{ key: "ceiling", label: "Revenue ceiling without hires", unit: "€", formula: (i, u) => `${u("maxClients")}*${i("price")}` },
	],
};

export const BUSINESS_CASE_MODELS = { saas, consumer, deeptech, marketplace, service };

export function getBusinessCaseModel(classId) {
	return BUSINESS_CASE_MODELS[classId] ?? saas;
}
