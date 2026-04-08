import { useMemo, useState } from "react";
import { generateSaaSForecast } from "../engine/forecastEngine.js";
import { useGameStore } from "../store.js";
import { FounderAvatarPair } from "./components/FounderAvatar.jsx";

export default function SetupScreen() {
	const { classConfig, assumptions, updateAssumption, startGame } =
		useGameStore();
	const [mode, setMode] = useState("presets"); // 'presets' | 'custom'
	const [selectedPreset, setSelectedPreset] = useState("neutral");

	if (!classConfig) return null;

	const presets = classConfig.difficultyPresets;
	const accent = classConfig.color;

	// When preset is selected, update all assumptions
	const handlePresetSelect = (key) => {
		setSelectedPreset(key);
		const preset = presets[key];
		if (preset) {
			Object.entries(preset.assumptions).forEach(([k, v]) => {
				updateAssumption(k, v);
			});
		}
	};

	// Live forecast preview
	const forecast = useMemo(
		() => generateSaaSForecast(assumptions),
		[assumptions],
	);
	const month12 = forecast[12] ?? {};
	const month6 = forecast[6] ?? {};

	return (
		<div
			className="min-h-screen flex items-center justify-center p-4 md:p-6"
			style={{ background: "var(--color-canvas)" }}
		>
			<div className="w-full max-w-2xl">
				{/* Header */}
				<div className="mb-6">
					<button
						onClick={() =>
							useGameStore
								.getState()
								.selectClass(useGameStore.getState().classId)
						}
						className="text-[10px] uppercase tracking-widest mb-3 cursor-pointer"
						style={{
							color: "var(--color-text-muted)",
							fontFamily: "var(--font-mono)",
							background: "none",
							border: "none",
						}}
					>
						← Back to Founders
					</button>

					<div className="flex items-center gap-2 mb-2">
						<span className="text-xl" style={{ color: accent }}>
							{classConfig.icon}
						</span>
						<h1
							className="text-2xl font-bold tracking-tight"
							style={{
								fontFamily: "var(--font-display)",
								letterSpacing: "-0.02em",
							}}
						>
							{classConfig.name}
						</h1>
					</div>

					<p
						className="text-sm leading-relaxed mb-4"
						style={{ color: "var(--color-text-secondary)" }}
					>
						{classConfig.backstory}
					</p>

					<div className="flex items-center gap-3 mb-2">
						<FounderAvatarPair
							founders={classConfig.founders}
							color={accent}
							size={28}
						/>
						<div
							className="flex gap-4 text-[11px]"
							style={{ fontFamily: "var(--font-mono)" }}
						>
							{classConfig.founders.map((f) => (
								<span key={f.name} style={{ color: "var(--color-text-muted)" }}>
									{f.name}{" "}
									<span style={{ color: "var(--color-text-secondary)" }}>
										({f.role})
									</span>
								</span>
							))}
						</div>
					</div>
				</div>

				{/* Mode toggle */}
				<div className="flex items-center justify-between mb-4">
					<div
						className="text-[10px] uppercase tracking-widest font-medium"
						style={{
							color: "var(--color-text-muted)",
							fontFamily: "var(--font-mono)",
						}}
					>
						Market Assumptions
					</div>
					<div className="flex gap-1">
						{[
							{ key: "presets", label: "Presets" },
							{ key: "custom", label: "Custom" },
						].map((m) => (
							<button
								key={m.key}
								onClick={() => setMode(m.key)}
								className="text-[10px] px-3 py-1.5 rounded cursor-pointer"
								style={{
									background: mode === m.key ? accent : "none",
									border: `1px solid ${mode === m.key ? accent : "var(--color-border)"}`,
									color: mode === m.key ? "#fff" : "var(--color-text-muted)",
									fontFamily: "var(--font-mono)",
								}}
							>
								{m.label}
							</button>
						))}
					</div>
				</div>

				{mode === "presets" ? (
					/* ─── Preset Cards ─── */
					<div className="flex flex-col gap-3 mb-8">
						{Object.entries(presets).map(([key, preset]) => {
							const isSelected = selectedPreset === key;
							return (
								<button
									key={key}
									onClick={() => handlePresetSelect(key)}
									className="text-left p-4 rounded cursor-pointer transition-all duration-150"
									style={{
										background: isSelected
											? "var(--color-surface)"
											: "var(--color-raised)",
										border: `2px solid ${isSelected ? preset.color : "var(--color-border)"}`,
										outline: isSelected
											? `1px solid ${preset.color}40`
											: "none",
									}}
								>
									<div className="flex items-center gap-2 mb-1.5">
										<span className="text-base" style={{ color: preset.color }}>
											{preset.icon}
										</span>
										<span
											className="text-sm font-bold"
											style={{
												fontFamily: "var(--font-display)",
												color: isSelected ? preset.color : "var(--color-text)",
											}}
										>
											{preset.label}
										</span>
									</div>
									<p
										className="text-[12px] leading-relaxed mb-3"
										style={{ color: "var(--color-text-secondary)" }}
									>
										{preset.description}
									</p>
									<div className="flex gap-4">
										<div>
											<div
												className="text-[9px] uppercase tracking-widest mb-1 font-medium"
												style={{
													color: "var(--color-growth)",
													fontFamily: "var(--font-mono)",
												}}
											>
												Pros
											</div>
											{preset.pros.map((p, i) => (
												<div
													key={i}
													className="text-[10px] leading-snug"
													style={{
														color: "var(--color-text-secondary)",
														fontFamily: "var(--font-mono)",
													}}
												>
													+ {p}
												</div>
											))}
										</div>
										<div>
											<div
												className="text-[9px] uppercase tracking-widest mb-1 font-medium"
												style={{
													color: "var(--color-danger)",
													fontFamily: "var(--font-mono)",
												}}
											>
												Cons
											</div>
											{preset.cons.map((c, i) => (
												<div
													key={i}
													className="text-[10px] leading-snug"
													style={{
														color: "var(--color-text-secondary)",
														fontFamily: "var(--font-mono)",
													}}
												>
													− {c}
												</div>
											))}
										</div>
									</div>
									{/* Show key numbers */}
									{isSelected && (
										<div
											className="grid grid-cols-3 gap-2 mt-3 pt-3"
											style={{ borderTop: "1px solid var(--color-border)" }}
										>
											<MiniStat
												label="Price"
												value={`€${preset.assumptions.price}/mo`}
											/>
											<MiniStat
												label="Churn"
												value={`${preset.assumptions.churnRate}%`}
											/>
											<MiniStat
												label="Pipeline"
												value={`${preset.assumptions.pipelineGrowth}/mo`}
											/>
										</div>
									)}
								</button>
							);
						})}
					</div>
				) : (
					/* ─── Custom Sliders ─── */
					<div className="flex flex-col gap-4 mb-8">
						{classConfig.assumptions.map((a) => (
							<div
								key={a.key}
								className="p-3 rounded"
								style={{
									background: "var(--color-surface)",
									border: "1px solid var(--color-border)",
								}}
							>
								<div className="flex justify-between items-baseline mb-1">
									<label className="text-sm font-medium">{a.label}</label>
									<span
										className="text-sm tabular-nums font-bold"
										style={{
											fontFamily: "var(--font-mono)",
											color: "var(--color-plan)",
										}}
									>
										{a.unit === "€"
											? `€${assumptions[a.key]}`
											: a.unit === "%"
												? `${assumptions[a.key]}%`
												: assumptions[a.key]}
									</span>
								</div>
								<input
									type="range"
									min={a.min}
									max={a.max}
									step={a.step}
									value={assumptions[a.key] ?? a.default}
									onChange={(e) =>
										updateAssumption(a.key, Number(e.target.value))
									}
									className="w-full h-1 rounded-sm appearance-none cursor-pointer"
									style={{
										background: `linear-gradient(to right, var(--color-plan) ${((assumptions[a.key] - a.min) / (a.max - a.min)) * 100}%, var(--color-border) 0%)`,
										accentColor: "var(--color-plan)",
									}}
								/>
								<div className="flex justify-between mt-1">
									<span
										className="text-[9px]"
										style={{
											color: "var(--color-text-muted)",
											fontFamily: "var(--font-mono)",
										}}
									>
										{a.unit === "€"
											? `€${a.min}`
											: a.unit === "%"
												? `${a.min}%`
												: a.min}
									</span>
									<span
										className="text-[9px]"
										style={{
											color: "var(--color-text-muted)",
											fontFamily: "var(--font-mono)",
										}}
									>
										{a.unit === "€"
											? `€${a.max}`
											: a.unit === "%"
												? `${a.max}%`
												: a.max}
									</span>
								</div>
								<p
									className="text-[10px] mt-1"
									style={{ color: "var(--color-text-muted)" }}
								>
									{a.hint}
								</p>
							</div>
						))}
					</div>
				)}

				{/* Forecast Preview */}
				<div
					className="p-4 rounded mb-6"
					style={{
						background: "var(--color-surface)",
						border: "1px solid var(--color-border)",
					}}
				>
					<div
						className="text-[10px] uppercase tracking-widest mb-2 font-medium"
						style={{
							color: "var(--color-plan)",
							fontFamily: "var(--font-mono)",
						}}
					>
						Your Forecast (if assumptions hold)
					</div>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
						<ForecastStat
							label="M6 MRR"
							value={`€${month6.totalMRR?.toLocaleString("en-US") ?? "0"}`}
						/>
						<ForecastStat
							label="M12 MRR"
							value={`€${month12.totalMRR?.toLocaleString("en-US") ?? "0"}`}
						/>
						<ForecastStat
							label="M12 Customers"
							value={`${month12.customers ?? 0}`}
						/>
						<ForecastStat
							label="M12 Cash"
							value={`€${month12.cash?.toLocaleString("en-US") ?? "0"}`}
							sub={month12.cash < 0 ? "Bankrupt before M12" : undefined}
						/>
					</div>
				</div>

				{/* Start button */}
				<button
					onClick={startGame}
					className="w-full py-3 rounded text-sm font-bold cursor-pointer transition-colors duration-150"
					style={{
						background: accent,
						color: "#fff",
						border: "none",
						fontFamily: "var(--font-display)",
					}}
				>
					Start Game →
				</button>

				<p
					className="text-center text-[10px] mt-2"
					style={{
						color: "var(--color-text-muted)",
						fontFamily: "var(--font-mono)",
					}}
				>
					Reality won't match your forecast. That's the point.
				</p>
			</div>
		</div>
	);
}

function ForecastStat({ label, value, sub }) {
	return (
		<div>
			<div
				className="text-[9px] uppercase tracking-widest mb-0.5"
				style={{
					color: "var(--color-text-muted)",
					fontFamily: "var(--font-mono)",
				}}
			>
				{label}
			</div>
			<div
				className="text-sm font-bold tabular-nums"
				style={{ fontFamily: "var(--font-mono)", color: "var(--color-plan)" }}
			>
				{value}
			</div>
			{sub && (
				<div
					className="text-[9px]"
					style={{
						color: "var(--color-danger)",
						fontFamily: "var(--font-mono)",
					}}
				>
					{sub}
				</div>
			)}
		</div>
	);
}

function MiniStat({ label, value }) {
	return (
		<div className="text-center">
			<div
				className="text-[8px] uppercase tracking-widest"
				style={{
					color: "var(--color-text-muted)",
					fontFamily: "var(--font-mono)",
				}}
			>
				{label}
			</div>
			<div
				className="text-[11px] font-bold tabular-nums"
				style={{
					fontFamily: "var(--font-mono)",
					color: "var(--color-text-secondary)",
				}}
			>
				{value}
			</div>
		</div>
	);
}
