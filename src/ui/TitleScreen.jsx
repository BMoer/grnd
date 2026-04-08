import { CLASSES } from "../classes/index.js";
import { useGameStore } from "../store.js";

export default function TitleScreen() {
	const { selectClass, restoreGame, hasSavedGame } = useGameStore();
	const canRestore = hasSavedGame();

	return (
		<div
			className="min-h-screen flex items-center justify-center p-6"
			style={{ background: "var(--color-canvas)" }}
		>
			<div className="w-full max-w-lg">
				{/* Title */}
				<div className="mb-8">
					<div
						className="text-[10px] uppercase tracking-[0.15em] mb-3 font-medium"
						style={{
							color: "var(--color-text-muted)",
							fontFamily: "var(--font-mono)",
						}}
					>
						Select your class
					</div>
					<h1
						className="text-4xl font-bold tracking-tight mb-1"
						style={{
							fontFamily: "var(--font-display)",
							letterSpacing: "-0.02em",
						}}
					>
						GRND
					</h1>
					<p
						className="text-sm"
						style={{ color: "var(--color-text-secondary)" }}
					>
						A startup's business model is a spreadsheet. This game makes you
						live inside it.
					</p>
					<p
						className="text-[10px] mt-1"
						style={{
							color: "var(--color-text-muted)",
							fontFamily: "var(--font-mono)",
						}}
					>
						±30% outcome variance · quarterly board meetings · export to
						spreadsheet
					</p>
				</div>

				{/* Learning Objective */}
				<div
					className="p-4 rounded mb-6"
					style={{
						background: "var(--color-surface)",
						border: "1px solid var(--color-border)",
						borderLeft: "3px solid var(--color-caution)",
					}}
				>
					<p
						className="text-[12px] leading-relaxed"
						style={{ color: "var(--color-text-secondary)" }}
					>
						Today is not about winning. It's about finding the assumption in
						your own model that you're currently avoiding.
					</p>
					<p
						className="text-[12px] leading-relaxed mt-2"
						style={{ color: "var(--color-text-secondary)" }}
					>
						Pick the class closest to your business. Play the first run from
						your gut. Pay attention to the moment something breaks.
					</p>
				</div>

				{/* Resume button */}
				{canRestore && (
					<button
						onClick={restoreGame}
						className="w-full p-3 rounded mb-4 text-sm font-bold cursor-pointer"
						style={{
							background: "var(--color-raised)",
							border: "1px solid var(--color-caution)",
							color: "var(--color-caution)",
							fontFamily: "var(--font-display)",
						}}
					>
						↩ Resume Previous Game
					</button>
				)}

				{/* Class cards */}
				<div className="flex flex-col gap-3">
					{Object.values(CLASSES).map((cls) => (
						<button
							key={cls.id}
							onClick={() => selectClass(cls.id)}
							className="text-left p-4 rounded cursor-pointer transition-colors duration-150"
							style={{
								background: "var(--color-surface)",
								border: "1px solid var(--color-border)",
							}}
							onMouseOver={(e) => {
								e.currentTarget.style.borderColor = cls.color;
							}}
							onMouseOut={(e) => {
								e.currentTarget.style.borderColor = "var(--color-border)";
							}}
						>
							<div className="flex items-center gap-2 mb-1">
								<span className="text-lg" style={{ color: cls.color }}>
									{cls.icon}
								</span>
								<span
									className="text-base font-bold"
									style={{ fontFamily: "var(--font-display)" }}
								>
									{cls.name}
								</span>
								<span
									className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm"
									style={{
										color: cls.color,
										background: `${cls.color}10`,
										fontFamily: "var(--font-mono)",
									}}
								>
									{cls.id}
								</span>
							</div>

							<div
								className="text-xs mb-2 italic"
								style={{ color: "var(--color-text-secondary)" }}
							>
								{cls.tagline}
							</div>

							<div
								className="grid grid-cols-2 gap-1 text-[10px]"
								style={{
									fontFamily: "var(--font-mono)",
									color: "var(--color-text-muted)",
								}}
							>
								<div>
									Revenue:{" "}
									<span style={{ color: "var(--color-text-secondary)" }}>
										{cls.model.revenueType}
									</span>
								</div>
								<div>
									Key:{" "}
									<span style={{ color: "var(--color-text-secondary)" }}>
										{cls.model.keyMetric}
									</span>
								</div>
								<div style={{ color: "var(--color-growth)" }}>
									Win: {cls.model.winBy}
								</div>
								<div style={{ color: "var(--color-danger)" }}>
									Death: {cls.model.deathBy}
								</div>
							</div>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
