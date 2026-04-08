import { useState } from "react";
import { useGameStore } from "../store.js";
import DeltaTable from "./components/DeltaTable.jsx";
import ForecastChart from "./components/ForecastChart.jsx";
import FounderAvatar, { SHORT_NAME_MAP } from "./components/FounderAvatar.jsx";

export default function BoardMeeting() {
	const {
		boardData,
		classConfig,
		state,
		assumptions,
		closeBoardMeeting,
		reviseForecast,
		currentInsightCard,
	} = useGameStore();
	const [showRevise, setShowRevise] = useState(false);
	const [revised, setRevised] = useState(null);

	if (!boardData || !state) return null;

	const accent = classConfig?.color ?? "var(--color-saas)";

	const handleRevise = () => {
		if (!revised) {
			// Initialize with current actuals as new assumptions
			setRevised({
				price: state.price ?? assumptions.price ?? 49,
				churnRate: Math.round((state.churn ?? 5) * 10) / 10,
				targetCAC: state.cac ?? assumptions.targetCAC ?? 80,
				conversionRate: Math.round((state.conversionRate ?? 15) * 10) / 10,
				pipelineGrowth:
					state.pipelineGrowth ?? assumptions.pipelineGrowth ?? 20,
				supportCost: state.supportCost ?? assumptions.supportCost ?? 5,
			});
		}
		setShowRevise(!showRevise);
	};

	const handleSaveRevision = () => {
		if (revised && reviseForecast) {
			reviseForecast(revised);
		}
		setShowRevise(false);
	};

	return (
		<div
			className="min-h-screen p-4 md:p-6"
			style={{ background: "var(--color-canvas)" }}
		>
			<div className="max-w-3xl mx-auto">
				{/* Header */}
				<div className="mb-6">
					<div className="flex items-center gap-2 mb-1">
						<span
							className="text-[10px] uppercase tracking-widest font-medium"
							style={{
								color: "var(--color-text-muted)",
								fontFamily: "var(--font-mono)",
							}}
						>
							Board Meeting Q{boardData.quarter}
						</span>
						<span
							className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm"
							style={{
								color: accent,
								background: `${accent}10`,
								fontFamily: "var(--font-mono)",
							}}
						>
							{classConfig?.name}
						</span>
						<span
							className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm"
							style={{
								color: "var(--color-text-muted)",
								background: "var(--color-raised)",
								fontFamily: "var(--font-mono)",
							}}
						>
							Month {state.month}
						</span>
					</div>
					<h1
						className="text-2xl font-bold tracking-tight"
						style={{
							fontFamily: "var(--font-display)",
							letterSpacing: "-0.02em",
						}}
					>
						Forecast vs. Reality
					</h1>
				</div>

				{/* Revenue Chart */}
				<div
					className="p-4 rounded mb-4"
					style={{
						background: "var(--color-surface)",
						border: "1px solid var(--color-border)",
					}}
				>
					<ForecastChart metric="totalMRR" label="Monthly Recurring Revenue" />
				</div>

				{/* Cash Chart */}
				<div
					className="p-4 rounded mb-4"
					style={{
						background: "var(--color-surface)",
						border: "1px solid var(--color-border)",
					}}
				>
					<ForecastChart metric="cash" label="Cash Position" />
				</div>

				{/* Key Events This Quarter */}
				<QuarterEvents quarter={boardData.quarter} />

				{/* Delta Table */}
				<div
					className="p-4 rounded mb-4"
					style={{
						background: "var(--color-surface)",
						border: "1px solid var(--color-border)",
					}}
				>
					<div
						className="text-[10px] uppercase tracking-widest mb-3 font-medium"
						style={{
							color: "var(--color-text-muted)",
							fontFamily: "var(--font-mono)",
						}}
					>
						Forecast vs. Actual
					</div>
					<DeltaTable deltas={boardData.deltas} />
					<div
						className="flex gap-4 mt-2 text-[9px]"
						style={{ fontFamily: "var(--font-mono)" }}
					>
						<span style={{ color: "var(--color-danger)" }}>
							Red = &gt;20% below forecast
						</span>
						<span style={{ color: "var(--color-growth)" }}>
							Green = &gt;20% above forecast
						</span>
					</div>
				</div>

				{/* Insight Card */}
				{currentInsightCard && (
					<InsightCard card={currentInsightCard} accent={accent} />
				)}

				{/* Board Feedback */}
				<div
					className="p-4 rounded mb-6"
					style={{
						background: "var(--color-surface)",
						border: "1px solid var(--color-border)",
					}}
				>
					<div
						className="text-[10px] uppercase tracking-widest mb-3 font-medium"
						style={{
							color: "var(--color-text-muted)",
							fontFamily: "var(--font-mono)",
						}}
					>
						Board Feedback
					</div>
					{boardData.feedback.map((f, i) => {
						const toneColor =
							f.tone === "positive"
								? "var(--color-growth)"
								: f.tone === "critical"
									? "var(--color-danger)"
									: "var(--color-text-secondary)";
						const speakerKey = (f.speaker || "").toLowerCase();
						const fullName = SHORT_NAME_MAP[speakerKey] || speakerKey;
						return (
							<div key={i} className="mb-3">
								<div className="flex items-center gap-1.5">
									<FounderAvatar name={fullName} color={accent} size={18} />
									<span
										className="text-[10px] font-medium"
										style={{
											color: "var(--color-text-muted)",
											fontFamily: "var(--font-mono)",
										}}
									>
										{f.speaker}:
									</span>
								</div>
								<p
									className="text-sm leading-relaxed mt-0.5 ml-[26px]"
									style={{ color: toneColor }}
								>
									"{f.text}"
								</p>
							</div>
						);
					})}
				</div>

				{/* Strategic Adjustments — change actual business parameters */}
				<div
					className="p-4 rounded mb-4"
					style={{
						background: "var(--color-surface)",
						border: "1px solid var(--color-border)",
					}}
				>
					<div
						className="text-[10px] uppercase tracking-widest mb-2 font-medium"
						style={{ color: accent, fontFamily: "var(--font-mono)" }}
					>
						Strategic Adjustments
					</div>
					<p
						className="text-[11px] mb-3"
						style={{ color: "var(--color-text-muted)" }}
					>
						Adjust your strategy for next quarter. Changes take effect next
						month. Cutting team budget means layoffs — morale and velocity will
						suffer. Growing too fast creates onboarding chaos.
					</p>
					<StrategicAdjustments state={state} accent={accent} />
				</div>

				{/* Forecast Revision */}
				{showRevise && revised && (
					<div
						className="p-4 rounded mb-4"
						style={{
							background: "var(--color-surface)",
							border: "1px solid var(--color-plan)",
						}}
					>
						<div
							className="text-[10px] uppercase tracking-widest mb-3 font-medium"
							style={{
								color: "var(--color-plan)",
								fontFamily: "var(--font-mono)",
							}}
						>
							Revise Forecast Assumptions
						</div>
						<p
							className="text-[11px] mb-3"
							style={{ color: "var(--color-text-muted)" }}
						>
							Update your assumptions based on what you've learned. The forecast
							line will adjust.
						</p>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
							{classConfig.assumptions.map((a) => (
								<div key={a.key}>
									<label
										className="text-[10px] font-medium block mb-1"
										style={{ fontFamily: "var(--font-mono)" }}
									>
										{a.label}
									</label>
									<input
										type="number"
										value={revised[a.key] ?? a.default}
										onChange={(e) =>
											setRevised({
												...revised,
												[a.key]: Number(e.target.value),
											})
										}
										className="w-full px-2 py-1 text-[11px] rounded"
										style={{
											background: "var(--color-canvas)",
											border: "1px solid var(--color-border)",
											fontFamily: "var(--font-mono)",
											color: "var(--color-plan)",
										}}
										min={a.min}
										max={a.max}
										step={a.step}
									/>
								</div>
							))}
						</div>
						<button
							onClick={handleSaveRevision}
							className="mt-3 px-4 py-2 rounded text-[11px] font-bold cursor-pointer"
							style={{
								background: "var(--color-plan)",
								color: "#fff",
								border: "none",
								fontFamily: "var(--font-mono)",
							}}
						>
							Update Forecast
						</button>
					</div>
				)}

				{/* Actions */}
				<div className="flex gap-3">
					<button
						onClick={handleRevise}
						className="flex-1 py-3 rounded text-sm font-bold cursor-pointer transition-colors duration-150"
						style={{
							background: "var(--color-raised)",
							color: "var(--color-plan)",
							border: "1px solid var(--color-plan)",
							fontFamily: "var(--font-display)",
						}}
					>
						{showRevise ? "Cancel Revision" : "Revise Forecast"}
					</button>
					<button
						onClick={closeBoardMeeting}
						className="flex-1 py-3 rounded text-sm font-bold cursor-pointer transition-colors duration-150"
						style={{
							background: accent,
							color: "#fff",
							border: "none",
							fontFamily: "var(--font-display)",
						}}
					>
						Continue to Q{boardData.quarter + 1} →
					</button>
				</div>

				<p
					className="text-center text-[10px] mt-2"
					style={{
						color: "var(--color-text-muted)",
						fontFamily: "var(--font-mono)",
					}}
				>
					Every board meeting ends with an updated plan. Revising your forecast
					is realism, not failure.
				</p>
			</div>
		</div>
	);
}

function QuarterEvents({ quarter }) {
	const decisions = useGameStore((s) => s.decisions);
	const startMonth = (quarter - 1) * 3 + 1;
	const endMonth = quarter * 3;
	const quarterDecisions = decisions.filter(
		(d) => d.month >= startMonth && d.month <= endMonth,
	);

	if (!quarterDecisions.length) return null;

	return (
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
				Key Events Q{quarter} (M{startMonth}–M{endMonth})
			</div>
			<div className="flex flex-col gap-1.5">
				{quarterDecisions.map((d, i) => (
					<div key={i} className="flex items-start gap-2 text-[11px]">
						<span
							className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
							style={{
								background: d.isWorld
									? "var(--color-caution)"
									: d.wasDefault
										? "var(--color-danger)"
										: "var(--color-growth)",
							}}
						/>
						<div>
							<span
								style={{
									color: "var(--color-text-muted)",
									fontFamily: "var(--font-mono)",
								}}
							>
								M{d.month}
							</span>{" "}
							<span
								style={{
									color: d.wasDefault
										? "var(--color-danger)"
										: "var(--color-text-secondary)",
								}}
							>
								{d.event}
								{d.wasDefault ? " (skipped)" : ""}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function StrategicAdjustments({ state, accent }) {
	const adjustState = useGameStore((s) => s.adjustState);
	const [price, setPrice] = useState(state.price ?? 49);
	const [supportCost, setSupportCost] = useState(state.supportCost ?? 5);
	const [burnTarget, setBurnTarget] = useState(state.burnRate ?? 4500);
	const [pipelineInvest, setPipelineInvest] = useState(
		state.pipelineGrowth ?? 12,
	);
	const [applied, setApplied] = useState(false);

	const handleApply = () => {
		if (adjustState) {
			adjustState({
				price,
				supportCost,
				mrrPerCustomer: price,
				burnRate: burnTarget,
				pipelineGrowth: pipelineInvest,
			});
			setApplied(true);
		}
	};

	const hasChanges =
		price !== (state.price ?? 49) ||
		supportCost !== (state.supportCost ?? 5) ||
		burnTarget !== (state.burnRate ?? 4500) ||
		pipelineInvest !== (state.pipelineGrowth ?? 12);

	const controls = [
		{
			label: "Price/mo",
			value: price,
			set: setPrice,
			min: 19,
			max: 299,
			step: 5,
			unit: "€",
			current: state.price ?? 49,
		},
		{
			label: "Team budget (burn)",
			value: burnTarget,
			set: setBurnTarget,
			min: Math.round((state.burnRate ?? 4500) * 0.5),
			max: 15000,
			step: 500,
			unit: "€",
			current: state.burnRate ?? 4500,
			note:
				burnTarget < (state.burnRate ?? 4500)
					? "Cuts → morale hit, slower delivery"
					: burnTarget > (state.burnRate ?? 4500) * 1.3
						? "Fast growth → onboarding overhead"
						: "",
		},
		{
			label: "Sales/marketing intensity",
			value: pipelineInvest,
			set: setPipelineInvest,
			min: 5,
			max: 50,
			step: 1,
			unit: "",
			current: state.pipelineGrowth ?? 12,
		},
		{
			label: "Support investment/customer",
			value: supportCost,
			set: setSupportCost,
			min: 2,
			max: 30,
			step: 1,
			unit: "€",
			current: state.supportCost ?? 5,
		},
	];

	return (
		<div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{controls.map((c) => (
					<div key={c.label}>
						<div className="flex justify-between mb-1">
							<label
								className="text-[10px] font-medium"
								style={{
									fontFamily: "var(--font-mono)",
									color: "var(--color-text-secondary)",
								}}
							>
								{c.label}
							</label>
							<span
								className="text-[11px] font-bold tabular-nums"
								style={{ fontFamily: "var(--font-mono)", color: accent }}
							>
								{c.unit}
								{c.value}
								{c.value !== c.current && (
									<span
										className="text-[9px] ml-1"
										style={{ color: "var(--color-text-muted)" }}
									>
										(was {c.unit}
										{Math.round(c.current * 10) / 10})
									</span>
								)}
							</span>
						</div>
						<input
							type="range"
							min={c.min}
							max={c.max}
							step={c.step}
							value={c.value}
							onChange={(e) => {
								c.set(Number(e.target.value));
								setApplied(false);
							}}
							className="w-full h-1 rounded-sm appearance-none cursor-pointer"
							style={{
								background: `linear-gradient(to right, ${accent} ${((c.value - c.min) / (c.max - c.min)) * 100}%, var(--color-border) 0%)`,
								accentColor: accent,
							}}
						/>
						{c.note && (
							<div
								className="text-[9px] mt-0.5"
								style={{
									color: "var(--color-caution)",
									fontFamily: "var(--font-mono)",
								}}
							>
								{c.note}
							</div>
						)}
					</div>
				))}
			</div>
			{hasChanges && !applied && (
				<button
					onClick={handleApply}
					className="mt-3 px-4 py-2 rounded text-[11px] font-bold cursor-pointer"
					style={{
						background: accent,
						color: "#fff",
						border: "none",
						fontFamily: "var(--font-mono)",
					}}
				>
					Apply Changes
				</button>
			)}
			{applied && (
				<div
					className="mt-2 text-[10px]"
					style={{
						color: "var(--color-growth)",
						fontFamily: "var(--font-mono)",
					}}
				>
					Changes applied. New pricing takes effect next month.
				</div>
			)}
		</div>
	);
}

function InsightCard({ card, accent }) {
	return (
		<div
			className="p-5 rounded mb-4"
			style={{
				background: "var(--color-surface)",
				border: `2px solid ${accent}`,
				borderLeft: `4px solid ${accent}`,
			}}
		>
			<div className="flex items-center gap-2 mb-3">
				<span
					className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-bold"
					style={{
						color: accent,
						background: `${accent}15`,
						fontFamily: "var(--font-mono)",
					}}
				>
					Insight
				</span>
				<span
					className="text-base font-bold"
					style={{ fontFamily: "var(--font-display)" }}
				>
					{card.title}
				</span>
			</div>
			<div className="flex flex-col gap-2">
				<p
					className="text-[12px] leading-relaxed"
					style={{ color: "var(--color-text-secondary)" }}
				>
					<span
						style={{
							color: accent,
							fontFamily: "var(--font-mono)",
							fontSize: "10px",
						}}
					>
						WHAT{" "}
					</span>
					{card.what}
				</p>
				<p
					className="text-[12px] leading-relaxed"
					style={{ color: "var(--color-text)" }}
				>
					<span
						style={{
							color: accent,
							fontFamily: "var(--font-mono)",
							fontSize: "10px",
						}}
					>
						YOU{" "}
					</span>
					{card.experienced}
				</p>
				<p
					className="text-[12px] leading-relaxed"
					style={{ color: "var(--color-text-muted)" }}
				>
					<span
						style={{
							color: accent,
							fontFamily: "var(--font-mono)",
							fontSize: "10px",
						}}
					>
						WHY{" "}
					</span>
					{card.why}
				</p>
			</div>
		</div>
	);
}
