import { useEffect, useRef, useState } from "react";
import { generateLearnings } from "../data/learnings.js";
import { getReflectionQuestions } from "../data/reflectionQuestions.js";
import { exportToExcel } from "../export/excelExport.js";
import { archiveRun, exportRunLog } from "../engine/telemetry.js";
import { useGameStore } from "../store.js";
import ForecastChart from "./components/ForecastChart.jsx";

export default function EndScreen() {
	const {
		result,
		state,
		classId,
		classConfig,
		history,
		decisions,
		forecast,
		assumptions,
		founderProfile,
		restart,
	} = useGameStore();
	// Auto-archive run to server on game end
	const archived = useRef(false);
	useEffect(() => {
		if (result && state && !archived.current) {
			archived.current = true;
			archiveRun({ classId, classConfig, assumptions, founderProfile, history, decisions, result, state });
		}
	}, [result, state, classId, classConfig, assumptions, founderProfile, history, decisions]);

	if (!result || !state) return null;

	const accent = classConfig?.color ?? "var(--color-saas)";
	const resultColor =
		result === "pmf"
			? "var(--color-growth)"
			: result === "dead"
				? "var(--color-danger)"
				: result === "acquired"
					? "var(--color-plan)"
					: "var(--color-caution)";

	const resultTitle = {
		pmf: "Product-Market Fit",
		dead: "Game Over",
		survived: "Survived",
		acquired: "Acquired",
	}[result];

	const resultText = {
		pmf: "Users pull the product from your hands. Revenue grows organically. This is the moment.",
		dead: `Month ${state.month}. Cash hit zero. ${(state.pmf ?? 0) > 25 ? "Something was building, but the money ran out first." : "The core assumptions never validated."}`,
		survived: `€${(state.cash ?? 0).toLocaleString("en-US")} left. PMF: ${state.pmf ?? 0}/100. ${(state.pmf ?? 0) > 35 ? "Close." : "Alive, but the hard questions remain."}`,
		acquired:
			"Sold for €200K + jobs for everyone. Not the moonshot outcome, but everyone gets paid and the tech lives on. Sometimes the responsible exit is the right one.",
	}[result];

	const decisionCount = decisions.filter((d) => !d.isWorld).length;
	const worldCount = decisions.filter((d) => d.isWorld).length;

	const handleExport = async () => {
		await exportToExcel(classConfig, history, decisions, forecast, assumptions);
	};

	const handleRunExport = () => {
		exportRunLog({ classId, classConfig, assumptions, founderProfile, history, decisions, result, state });
	};

	return (
		<div
			className="min-h-screen flex items-center justify-center p-6"
			style={{ background: "var(--color-canvas)" }}
		>
			<div className="w-full max-w-2xl">
				{/* Result */}
				<div className="text-center mb-8">
					<div
						className="text-3xl font-bold mb-2"
						style={{
							color: resultColor,
							fontFamily: "var(--font-display)",
							letterSpacing: "-0.02em",
						}}
					>
						{resultTitle}
					</div>
					<p
						className="text-sm leading-relaxed max-w-md mx-auto mb-3"
						style={{ color: "var(--color-text-secondary)" }}
					>
						{resultText}
					</p>
					<div
						className="text-[11px]"
						style={{
							color: "var(--color-text-muted)",
							fontFamily: "var(--font-mono)",
						}}
					>
						{decisionCount} decisions made · {worldCount} world events survived
						· {state.month} months played
					</div>
				</div>

				{/* Final metrics */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
					<MetricCard
						label="Final Cash"
						value={`€${(state.cash ?? 0).toLocaleString("en-US")}`}
						color={
							(state.cash ?? 0) > 0
								? "var(--color-growth)"
								: "var(--color-danger)"
						}
					/>
					<MetricCard
						label="Final MRR"
						value={`€${(state.totalMRR ?? 0).toLocaleString("en-US")}`}
						color={accent}
					/>
					<MetricCard
						label="Customers"
						value={`${state.customers ?? 0}`}
						color={accent}
					/>
					<MetricCard
						label="PMF Score"
						value={`${state.pmf ?? 0}/100`}
						color={
							(state.pmf ?? 0) >= 60
								? "var(--color-growth)"
								: "var(--color-caution)"
						}
					/>
				</div>

				{/* Founder Profile (for workshop debrief) */}
				{founderProfile && (
					<div
						className="p-4 rounded mb-4"
						style={{
							background: "var(--color-surface)",
							border: "1px solid var(--color-border)",
						}}
					>
						<div
							className="text-[10px] uppercase tracking-widest mb-2 font-medium"
							style={{
								color: "var(--color-text-muted)",
								fontFamily: "var(--font-mono)",
							}}
						>
							Your Founders
						</div>
						<div
							className="flex flex-wrap gap-3 text-[11px]"
							style={{ fontFamily: "var(--font-mono)" }}
						>
							<span>
								Difficulty:{" "}
								<span
									style={{
										color:
											founderProfile.difficulty <= 4
												? "var(--color-growth)"
												: founderProfile.difficulty <= 6
													? "var(--color-caution)"
													: "var(--color-danger)",
									}}
								>
									{founderProfile.difficulty}/10
								</span>
							</span>
							<span>
								Fundraising:{" "}
								<span
									style={{
										color:
											founderProfile.engineModifiers?.fundraisingSuccessRate <
											0.8
												? "var(--color-danger)"
												: "var(--color-text)",
									}}
								>
									×
									{(
										founderProfile.engineModifiers?.fundraisingSuccessRate ?? 1
									).toFixed(2)}
								</span>
							</span>
							{founderProfile.background && (
								<>
									<span style={{ color: "var(--color-text-muted)" }}>
										{founderProfile.background.gender} ·{" "}
										{founderProfile.background.class} ·{" "}
										{founderProfile.background.ethnicity} ·{" "}
										{founderProfile.background.age}
									</span>
								</>
							)}
						</div>
					</div>
				)}

				{/* Plan vs Reality Highlight */}
				<PlanVsReality
					state={state}
					forecast={forecast}
					assumptions={assumptions}
					accent={accent}
				/>

				{/* Chart */}
				<div
					className="p-4 rounded mb-6"
					style={{
						background: "var(--color-surface)",
						border: "1px solid var(--color-border)",
					}}
				>
					<ForecastChart metric="totalMRR" label="MRR: Your Plan vs. Reality" />
				</div>

				{/* Reflection Questions */}
				<ReflectionSection classId={classId} result={result} />

				{/* Learnings Section */}
				<LearningsSection
					state={state}
					history={history}
					decisions={decisions}
					forecast={forecast}
					founderProfile={founderProfile}
				/>

				{/* Actions */}
				<div className="flex gap-3 justify-center flex-wrap">
					<button
						onClick={handleExport}
						className="px-6 py-3 rounded text-sm font-bold cursor-pointer"
						style={{
							background: accent,
							color: "#fff",
							border: "none",
							fontFamily: "var(--font-display)",
						}}
					>
						Download Financial Model
					</button>
					<button
						onClick={handleRunExport}
						className="px-6 py-3 rounded text-sm font-bold cursor-pointer"
						style={{
							background: "var(--color-surface)",
							color: "var(--color-text)",
							border: "1px solid var(--color-border)",
							fontFamily: "var(--font-display)",
						}}
					>
						Download Run Log
					</button>
					<button
						onClick={restart}
						className="px-6 py-3 rounded text-sm font-bold cursor-pointer"
						style={{
							background: "var(--color-raised)",
							color: "var(--color-text)",
							border: "1px solid var(--color-border)",
							fontFamily: "var(--font-display)",
						}}
					>
						Play Again
					</button>
				</div>
			</div>
		</div>
	);
}

function LearningsSection({
	state,
	history,
	decisions,
	forecast,
	founderProfile,
}) {
	const [expanded, setExpanded] = useState(true);
	const learnings = generateLearnings(
		state,
		history,
		decisions,
		forecast,
		founderProfile,
	);

	if (!learnings.length) return null;

	const typeColors = {
		success: "var(--color-growth)",
		warning: "var(--color-danger)",
		insight: "var(--color-plan)",
	};
	const typeIcons = {
		success: "✓",
		warning: "!",
		insight: "◆",
	};

	return (
		<div className="mb-6">
			<button
				onClick={() => setExpanded((e) => !e)}
				className="flex items-center gap-2 mb-3 cursor-pointer"
				style={{ background: "none", border: "none", padding: 0 }}
			>
				<span
					className="text-[10px] uppercase tracking-widest font-medium"
					style={{
						color: "var(--color-text-muted)",
						fontFamily: "var(--font-mono)",
					}}
				>
					{expanded ? "▼" : "▶"} What You Learned ({learnings.length})
				</span>
			</button>

			{expanded && (
				<div className="flex flex-col gap-3">
					{learnings.map((l, i) => (
						<div
							key={i}
							className="p-4 rounded"
							style={{
								background: "var(--color-surface)",
								border: `1px solid var(--color-border)`,
								borderLeft: `3px solid ${typeColors[l.type]}`,
							}}
						>
							<div className="flex items-center gap-2 mb-1">
								<span
									className="text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
									style={{
										background: `${typeColors[l.type]}20`,
										color: typeColors[l.type],
										fontFamily: "var(--font-mono)",
									}}
								>
									{typeIcons[l.type]}
								</span>
								<span
									className="text-sm font-bold"
									style={{ fontFamily: "var(--font-display)" }}
								>
									{l.title}
								</span>
							</div>
							<p
								className="text-[12px] leading-relaxed"
								style={{ color: "var(--color-text-secondary)" }}
							>
								{l.text}
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function PlanVsReality({ state, forecast, assumptions, accent }) {
	const month = state.month ?? 0;
	const planned = forecast?.[month];
	if (!planned) return null;

	const comparisons = [
		{
			key: "churnRate",
			planKey: "churnRate",
			actualKey: "churn",
			label: "Churn",
			unit: "%",
			decimals: 1,
			invert: true,
		},
		{
			key: "price",
			planKey: "price",
			actualKey: "price",
			label: "Price",
			unit: "€",
			prefix: true,
		},
		{
			key: "conversionRate",
			planKey: "conversionRate",
			actualKey: "conversionRate",
			label: "Conversion",
			unit: "%",
			decimals: 1,
		},
		{
			key: "targetCAC",
			planKey: "targetCAC",
			actualKey: "cac",
			label: "CAC",
			unit: "€",
			prefix: true,
			invert: true,
		},
		{
			key: "pipelineGrowth",
			planKey: "pipelineGrowth",
			actualKey: "pipeline",
			label: "Pipeline",
			unit: "",
		},
		{
			key: "supportCost",
			planKey: "supportCost",
			actualKey: "supportCost",
			label: "Support Cost",
			unit: "€",
			prefix: true,
			invert: true,
		},
	];

	const drifts = comparisons
		.map((c) => {
			const plan = assumptions[c.planKey] ?? 0;
			const actual = state[c.actualKey] ?? 0;
			const delta = actual - plan;
			const pct =
				plan !== 0 ? Math.round((Math.abs(delta) / Math.abs(plan)) * 100) : 0;
			const isGood = c.invert ? delta < 0 : delta > 0;
			return { ...c, plan, actual, delta, pct, isGood };
		})
		.filter((d) => Math.abs(d.pct) > 5);

	if (drifts.length === 0) return null;

	// Find biggest drift
	const biggest = drifts.reduce((a, b) => (a.pct > b.pct ? a : b));

	const formatVal = (d, val) => {
		const v = d.decimals ? val.toFixed(d.decimals) : Math.round(val);
		return d.prefix ? `${d.unit}${v}` : `${v}${d.unit}`;
	};

	return (
		<div
			className="p-4 rounded mb-4"
			style={{
				background: "var(--color-surface)",
				border: `2px solid ${accent}`,
				borderLeft: `4px solid ${accent}`,
			}}
		>
			<div
				className="text-[10px] uppercase tracking-widest mb-3 font-medium"
				style={{ color: accent, fontFamily: "var(--font-mono)" }}
			>
				Plan vs. Reality
			</div>
			<div className="flex flex-col gap-2 mb-3">
				{drifts.slice(0, 4).map((d) => (
					<div
						key={d.key}
						className="flex items-center gap-2 text-[12px]"
						style={{ fontFamily: "var(--font-mono)" }}
					>
						<span
							className="w-24 text-[11px]"
							style={{ color: "var(--color-text-secondary)" }}
						>
							{d.label}
						</span>
						<span style={{ color: "var(--color-plan)" }}>
							Plan: {formatVal(d, d.plan)}
						</span>
						<span style={{ color: "var(--color-text-muted)" }}>→</span>
						<span
							style={{
								color: d.isGood ? "var(--color-growth)" : "var(--color-danger)",
							}}
						>
							Reality: {formatVal(d, d.actual)}
						</span>
						<span
							className="text-[10px]"
							style={{ color: "var(--color-text-muted)" }}
						>
							({d.pct}% off)
						</span>
					</div>
				))}
			</div>
			<div
				className="text-[12px] leading-relaxed pt-2"
				style={{
					color: "var(--color-text)",
					borderTop: "1px solid var(--color-border)",
				}}
			>
				<strong>Biggest miss:</strong>{" "}
				<span style={{ color: "var(--color-danger)" }}>{biggest.label}</span> —
				you planned {formatVal(biggest, biggest.plan)}, reality was{" "}
				{formatVal(biggest, biggest.actual)}. Your plan was {biggest.pct}% off.
			</div>
			<p
				className="text-[11px] mt-2 italic"
				style={{ color: "var(--color-text-muted)" }}
			>
				The plan you set at the start was an assumption, not a truth. So is the
				plan in your real pitch deck.
			</p>
		</div>
	);
}

function ReflectionSection({ classId, result }) {
	const questions = getReflectionQuestions(classId, result);

	return (
		<div className="mb-6">
			<div
				className="text-[10px] uppercase tracking-widest mb-3 font-medium"
				style={{
					color: "var(--color-text-muted)",
					fontFamily: "var(--font-mono)",
				}}
			>
				Before you discuss — reflect
			</div>
			<div className="flex flex-col gap-3">
				{questions.map((q, i) => (
					<div
						key={i}
						className="p-4 rounded"
						style={{
							background: "var(--color-surface)",
							border: "1px solid var(--color-border)",
							borderLeft: "3px solid var(--color-caution)",
						}}
					>
						<div className="flex items-start gap-2">
							<span
								className="text-[10px] mt-0.5 shrink-0"
								style={{
									color: "var(--color-caution)",
									fontFamily: "var(--font-mono)",
								}}
							>
								Q{i + 1}
							</span>
							<p
								className="text-[12px] leading-relaxed italic"
								style={{ color: "var(--color-text-secondary)" }}
							>
								{q}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function MetricCard({ label, value, color }) {
	return (
		<div
			className="p-3 rounded"
			style={{
				background: "var(--color-surface)",
				border: "1px solid var(--color-border)",
			}}
		>
			<div
				className="text-[9px] uppercase tracking-widest mb-1"
				style={{
					color: "var(--color-text-muted)",
					fontFamily: "var(--font-mono)",
				}}
			>
				{label}
			</div>
			<div
				className="text-base font-bold tabular-nums"
				style={{ color, fontFamily: "var(--font-mono)" }}
			>
				{value}
			</div>
		</div>
	);
}
