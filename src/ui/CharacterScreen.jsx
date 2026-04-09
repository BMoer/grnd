import { useMemo, useState } from "react";
import {
	AGE_OPTIONS,
	ATTRIBUTES,
	applyDeltas,
	CLASS_OPTIONS,
	calculateBackgroundModifiers,
	calculateDifficulty,
	computeEngineModifiers,
	ETHNICITY_OPTIONS,
	GENDER_OPTIONS,
	PRESETS,
	SPECIAL_CONDITIONS,
} from "../classes/founderAttributes.js";
import { useGameStore } from "../store.js";
import { FounderAvatarPair } from "./components/FounderAvatar.jsx";

const ATTR_KEYS = [
	"tech",
	"sales",
	"network",
	"domain",
	"resilience",
	"capital",
];
const TOTAL_POINTS = 30;

export default function CharacterScreen() {
	const { classConfig, setFounderProfile, goToTitle, screen } = useGameStore();
	const [mode, setMode] = useState("preset"); // 'preset' | 'custom'
	const [attrs, setAttrs] = useState({
		tech: 5,
		sales: 5,
		network: 5,
		domain: 5,
		resilience: 5,
		capital: 5,
	});
	const [bg, setBg] = useState({
		gender: "male",
		class: "middle",
		ethnicity: "majority",
		age: "30s",
		special: "none",
	});

	if (!classConfig) return null;
	const accent = classConfig.color;
	const preset = PRESETS[classConfig.id];

	// Calculate modifiers for current selection
	const { finalAttrs, modifiers, difficulty, engineMods, sources } =
		useMemo(() => {
			if (mode === "preset" && preset) {
				// Preset attributes are ALREADY the final values (background baked in)
				// Only compute game modifiers from background
				const { modifiers: mods } = calculateBackgroundModifiers(
					preset.background,
				);
				// Apply team modifiers (mixed-gender team reduces penalties)
				if (preset.teamModifiers?.fundraisingMultiplier) {
					mods.fundraisingSuccessRate =
						preset.teamModifiers.fundraisingMultiplier;
				}
				if (preset.teamModifiers?.fundraisingAmountMultiplier) {
					mods.fundraisingAmountMultiplier =
						preset.teamModifiers.fundraisingAmountMultiplier;
				}
				const final = preset.attributes; // already final, no deltas
				const diff = calculateDifficulty(final, mods);
				const eng = computeEngineModifiers(final, mods);
				return {
					finalAttrs: final,
					modifiers: mods,
					difficulty: diff,
					engineMods: eng,
					sources: mods.sources,
				};
			} else {
				// Custom: apply background deltas to player-set attributes
				const { deltas, modifiers: mods } = calculateBackgroundModifiers(bg);
				const final = applyDeltas(attrs, deltas);
				const diff = calculateDifficulty(final, mods);
				const eng = computeEngineModifiers(final, mods);
				return {
					finalAttrs: final,
					modifiers: mods,
					difficulty: diff,
					engineMods: eng,
					sources: mods.sources,
				};
			}
		}, [mode, attrs, bg, preset]);

	const usedPoints = ATTR_KEYS.reduce((sum, k) => sum + attrs[k], 0);
	const remaining = TOTAL_POINTS - usedPoints;

	const handleAttrChange = (key, val) => {
		const newVal = Math.max(1, Math.min(10, val));
		const newAttrs = { ...attrs, [key]: newVal };
		const newTotal = ATTR_KEYS.reduce((sum, k) => sum + newAttrs[k], 0);
		if (newTotal <= TOTAL_POINTS) setAttrs(newAttrs);
	};

	const handleConfirm = () => {
		const background = mode === "preset" ? (preset?.background ?? bg) : bg;
		const baseAttrs = mode === "preset" ? (preset?.attributes ?? attrs) : attrs;
		setFounderProfile({
			mode,
			baseAttributes: baseAttrs,
			finalAttributes: finalAttrs,
			background,
			modifiers,
			engineModifiers: engineMods,
			difficulty,
			sources,
		});
	};

	const diffColor =
		difficulty <= 3
			? "var(--color-growth)"
			: difficulty <= 6
				? "var(--color-caution)"
				: "var(--color-danger)";
	const diffLabel =
		difficulty <= 3
			? "Easy"
			: difficulty <= 5
				? "Medium"
				: difficulty <= 7
					? "Hard"
					: "Brutal";

	return (
		<div
			className="min-h-screen flex items-center justify-center p-6"
			style={{ background: "var(--color-canvas)" }}
		>
			<div className="w-full max-w-2xl">
				{/* Back */}
				<button
					onClick={goToTitle}
					className="mb-4 text-[11px] cursor-pointer"
					style={{
						color: "var(--color-text-muted)",
						background: "none",
						border: "none",
						fontFamily: "var(--font-mono)",
					}}
				>
					← Back to class selection
				</button>

				{/* Header */}
				<div className="mb-6">
					<div className="flex items-center gap-2 mb-2">
						<span className="text-xl" style={{ color: accent }}>
							{classConfig.icon}
						</span>
						<h1
							className="text-2xl font-bold tracking-tight"
							style={{ fontFamily: "var(--font-display)" }}
						>
							{classConfig.name}
						</h1>
					</div>
					<p
						className="text-sm"
						style={{ color: "var(--color-text-secondary)" }}
					>
						Who's building this company? Your founders' background shapes the
						playing field.
					</p>
				</div>

				{/* Mode Toggle */}
				<div className="flex gap-2 mb-6">
					{["preset", "custom"].map((m) => (
						<button
							key={m}
							onClick={() => setMode(m)}
							className="px-4 py-2 rounded text-sm font-medium cursor-pointer"
							style={{
								background: mode === m ? accent : "var(--color-surface)",
								color: mode === m ? "#fff" : "var(--color-text-secondary)",
								border: `1px solid ${mode === m ? accent : "var(--color-border)"}`,
								fontFamily: "var(--font-display)",
							}}
						>
							{m === "preset" ? "Preset Founders" : "Custom Build"}
						</button>
					))}
				</div>

				{mode === "preset" && preset ? (
					<div
						className="p-4 rounded mb-4"
						style={{
							background: "var(--color-surface)",
							border: "1px solid var(--color-border)",
						}}
					>
						<div className="flex items-center gap-3 mb-1">
							<FounderAvatarPair
								founders={classConfig.founders}
								color={accent}
								size={36}
							/>
							<div>
								<div
									className="text-sm font-bold"
									style={{ fontFamily: "var(--font-display)" }}
								>
									{preset.label}
								</div>
								<p
									className="text-[11px]"
									style={{ color: "var(--color-text-secondary)" }}
								>
									{preset.description}
								</p>
							</div>
						</div>
						<div className="grid grid-cols-6 gap-1 md:gap-2">
							{ATTR_KEYS.map((k) => (
								<div key={k} className="text-center">
									<div
										className="text-[8px] md:text-[9px] uppercase tracking-widest mb-0.5"
										style={{
											color: "var(--color-text-muted)",
											fontFamily: "var(--font-mono)",
										}}
									>
										{ATTRIBUTES[k].abbr}
									</div>
									<div
										className="text-sm md:text-base font-bold tabular-nums"
										style={{ fontFamily: "var(--font-mono)", color: accent }}
									>
										{finalAttrs[k]}
									</div>
								</div>
							))}
						</div>
					</div>
				) : (
					<>
						{/* Attribute Distribution */}
						<div
							className="p-4 rounded mb-4"
							style={{
								background: "var(--color-surface)",
								border: "1px solid var(--color-border)",
							}}
						>
							<div className="flex justify-between items-center mb-3">
								<span
									className="text-[10px] uppercase tracking-widest font-medium"
									style={{
										color: "var(--color-text-muted)",
										fontFamily: "var(--font-mono)",
									}}
								>
									Distribute {TOTAL_POINTS} points
								</span>
								<span
									className="text-[12px] font-bold tabular-nums"
									style={{
										fontFamily: "var(--font-mono)",
										color:
											remaining === 0
												? "var(--color-growth)"
												: remaining < 0
													? "var(--color-danger)"
													: accent,
									}}
								>
									{remaining} remaining
								</span>
							</div>
							{ATTR_KEYS.map((k) => (
								<div key={k} className="flex items-center gap-3 mb-2">
									<div
										className="w-16 text-[10px] uppercase tracking-widest font-medium"
										style={{
											color: "var(--color-text-muted)",
											fontFamily: "var(--font-mono)",
										}}
									>
										{ATTRIBUTES[k].abbr}
									</div>
									<input
										type="range"
										min={1}
										max={10}
										value={attrs[k]}
										onChange={(e) =>
											handleAttrChange(k, parseInt(e.target.value))
										}
										className="flex-1 h-1 rounded-sm appearance-none cursor-pointer"
										style={{
											background: `linear-gradient(to right, ${accent} ${((attrs[k] - 1) / 9) * 100}%, var(--color-border) 0%)`,
											accentColor: accent,
										}}
									/>
									<span
										className="w-6 text-right text-sm font-bold tabular-nums"
										style={{ fontFamily: "var(--font-mono)", color: accent }}
									>
										{attrs[k]}
									</span>
									<span
										className="text-[10px] w-24 hidden md:block"
										style={{ color: "var(--color-text-muted)" }}
									>
										{attrs[k] >= 8
											? ATTRIBUTES[k].highDesc.slice(0, 30) + "…"
											: attrs[k] <= 3
												? ATTRIBUTES[k].lowDesc.slice(0, 30) + "…"
												: ""}
									</span>
								</div>
							))}
						</div>

						{/* Background Selection */}
						<div
							className="p-4 rounded mb-4"
							style={{
								background: "var(--color-surface)",
								border: "1px solid var(--color-border)",
							}}
						>
							<div
								className="text-[10px] uppercase tracking-widest font-medium mb-3"
								style={{
									color: "var(--color-text-muted)",
									fontFamily: "var(--font-mono)",
								}}
							>
								Background
							</div>
							<BackgroundSelect
								label="Gender"
								options={GENDER_OPTIONS}
								value={bg.gender}
								onChange={(v) => setBg({ ...bg, gender: v })}
								accent={accent}
							/>
							<BackgroundSelect
								label="Socioeconomic"
								options={CLASS_OPTIONS}
								value={bg.class}
								onChange={(v) => setBg({ ...bg, class: v })}
								accent={accent}
							/>
							<BackgroundSelect
								label="Ethnicity"
								options={ETHNICITY_OPTIONS}
								value={bg.ethnicity}
								onChange={(v) => setBg({ ...bg, ethnicity: v })}
								accent={accent}
							/>
							<BackgroundSelect
								label="Age"
								options={AGE_OPTIONS}
								value={bg.age}
								onChange={(v) => setBg({ ...bg, age: v })}
								accent={accent}
							/>
							<BackgroundSelect
								label="Special"
								options={SPECIAL_CONDITIONS}
								value={bg.special}
								onChange={(v) => setBg({ ...bg, special: v })}
								accent={accent}
							/>
						</div>
					</>
				)}

				{/* Computed Result */}
				<div
					className="p-4 rounded mb-4"
					style={{
						background: "var(--color-surface)",
						border: `1px solid ${diffColor}30`,
					}}
				>
					<div className="flex justify-between items-center mb-3">
						<div
							className="text-[10px] uppercase tracking-widest font-medium"
							style={{
								color: "var(--color-text-muted)",
								fontFamily: "var(--font-mono)",
							}}
						>
							Difficulty Rating
						</div>
						<div className="flex items-center gap-2">
							<span
								className="text-lg font-bold"
								style={{ color: diffColor, fontFamily: "var(--font-mono)" }}
							>
								{difficulty}/10
							</span>
							<span
								className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm"
								style={{
									color: diffColor,
									background: `${diffColor}15`,
									fontFamily: "var(--font-mono)",
								}}
							>
								{diffLabel}
							</span>
						</div>
					</div>

					{/* Key modifiers */}
					<div
						className="grid grid-cols-2 gap-2 text-[11px] mb-3"
						style={{ fontFamily: "var(--font-mono)" }}
					>
						<ModifierLine
							label="Fundraising rate"
							value={`×${engineMods.fundraisingSuccessRate.toFixed(2)}`}
							color={
								engineMods.fundraisingSuccessRate < 0.8
									? "var(--color-danger)"
									: engineMods.fundraisingSuccessRate > 1.1
										? "var(--color-growth)"
										: "var(--color-text)"
							}
						/>
						<ModifierLine
							label="Starting cash"
							value={`${engineMods.startingCashDelta >= 0 ? "+" : ""}€${engineMods.startingCashDelta.toLocaleString()}`}
							color={
								engineMods.startingCashDelta < 0
									? "var(--color-danger)"
									: engineMods.startingCashDelta > 0
										? "var(--color-growth)"
										: "var(--color-text)"
							}
						/>
						<ModifierLine
							label="AP modifier"
							value={
								engineMods.apModifier !== 0
									? `${engineMods.apModifier > 0 ? "+" : ""}${engineMods.apModifier}`
									: "—"
							}
							color={
								engineMods.apModifier < 0
									? "var(--color-danger)"
									: "var(--color-text)"
							}
						/>
						<ModifierLine
							label="Investor tone"
							value={engineMods.investorTone}
							color={
								engineMods.investorTone === "prevention"
									? "var(--color-caution)"
									: "var(--color-text)"
							}
						/>
					</div>

					{engineMods.partTime && (
						<p
							className="text-[10px] mb-1"
							style={{
								color: "var(--color-caution)",
								fontFamily: "var(--font-mono)",
							}}
						>
							⚠ Part-time for first 6 months (−1 AP)
						</p>
					)}
					{engineMods.lateGameBonus && (
						<p
							className="text-[10px] mb-1"
							style={{
								color: "var(--color-growth)",
								fontFamily: "var(--font-mono)",
							}}
						>
							✦ Diverse founder bonus: growth rate increase after month 12
						</p>
					)}
				</div>

				{/* Sources (collapsible) */}
				{sources.length > 0 && (
					<details className="mb-4">
						<summary
							className="text-[10px] uppercase tracking-widest cursor-pointer mb-1"
							style={{
								color: "var(--color-text-muted)",
								fontFamily: "var(--font-mono)",
							}}
						>
							Sources ({sources.length})
						</summary>
						<div
							className="p-3 rounded text-[10px] leading-relaxed"
							style={{
								background: "var(--color-surface)",
								color: "var(--color-text-muted)",
								fontFamily: "var(--font-mono)",
							}}
						>
							{sources.map((s, i) => (
								<div key={i} className="mb-1">
									• {s}
								</div>
							))}
						</div>
					</details>
				)}

				{/* Final Attributes (after modifiers) */}
				{mode === "custom" && (
					<div
						className="p-3 rounded mb-4"
						style={{ background: "var(--color-raised)" }}
					>
						<div
							className="text-[10px] uppercase tracking-widest mb-2 font-medium"
							style={{
								color: "var(--color-text-muted)",
								fontFamily: "var(--font-mono)",
							}}
						>
							Final Attributes (after background modifiers)
						</div>
						<div className="grid grid-cols-6 gap-2 text-center">
							{ATTR_KEYS.map((k) => {
								const base = attrs[k];
								const final = finalAttrs[k];
								const delta = final - base;
								return (
									<div key={k}>
										<div
											className="text-[9px] uppercase tracking-widest"
											style={{
												color: "var(--color-text-muted)",
												fontFamily: "var(--font-mono)",
											}}
										>
											{ATTRIBUTES[k].abbr}
										</div>
										<div
											className="text-sm font-bold tabular-nums"
											style={{ fontFamily: "var(--font-mono)", color: accent }}
										>
											{final}
										</div>
										{delta !== 0 && (
											<div
												className="text-[9px]"
												style={{
													color:
														delta > 0
															? "var(--color-growth)"
															: "var(--color-danger)",
													fontFamily: "var(--font-mono)",
												}}
											>
												{delta > 0 ? "+" : ""}
												{delta}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Confirm */}
				<button
					onClick={handleConfirm}
					disabled={mode === "custom" && remaining !== 0}
					className="w-full py-3 rounded text-sm font-bold cursor-pointer transition-colors duration-150"
					style={{
						background:
							mode === "custom" && remaining !== 0
								? "var(--color-border)"
								: accent,
						color: "#fff",
						border: "none",
						fontFamily: "var(--font-display)",
						opacity: mode === "custom" && remaining !== 0 ? 0.5 : 1,
					}}
				>
					{mode === "custom" && remaining !== 0
						? `Distribute ${remaining} more points`
						: "Continue to Assumptions →"}
				</button>

				<p
					className="text-center text-[10px] mt-2 leading-relaxed max-w-md mx-auto"
					style={{
						color: "var(--color-text-muted)",
						fontFamily: "var(--font-mono)",
					}}
				>
					Difficulty is transparent. All modifiers are based on published
					research and reflect systemic barriers — not personal ability.
				</p>
			</div>
		</div>
	);
}

function BackgroundSelect({ label, options, value, onChange, accent }) {
	return (
		<div className="mb-3">
			<div
				className="text-[10px] font-medium mb-1"
				style={{
					color: "var(--color-text-secondary)",
					fontFamily: "var(--font-mono)",
				}}
			>
				{label}
			</div>
			<div className="flex flex-wrap gap-1.5">
				{options.map((o) => (
					<button
						key={o.key}
						onClick={() => onChange(o.key)}
						className="px-3 py-2 rounded text-[11px] cursor-pointer transition-colors min-h-[44px] flex items-center"
						style={{
							background: value === o.key ? accent : "var(--color-raised)",
							color: value === o.key ? "#fff" : "var(--color-text-secondary)",
							border: `1px solid ${value === o.key ? accent : "var(--color-border)"}`,
							fontFamily: "var(--font-mono)",
						}}
					>
						{o.label}
					</button>
				))}
			</div>
			{options.find((o) => o.key === value)?.description && (
				<p
					className="text-[9px] mt-1"
					style={{ color: "var(--color-text-muted)" }}
				>
					{options.find((o) => o.key === value).description}
				</p>
			)}
		</div>
	);
}

function ModifierLine({ label, value, color }) {
	return (
		<div className="flex justify-between">
			<span style={{ color: "var(--color-text-muted)" }}>{label}</span>
			<span style={{ color }}>{value}</span>
		</div>
	);
}
