import { useState } from "react";
import { setPlayerId } from "../engine/telemetry.js";

export default function PlayerNamePrompt() {
	const [name, setName] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		if (name.trim()) {
			setPlayerId(name.trim());
			// Force re-render by reloading — simplest approach
			window.location.reload();
		}
	};

	return (
		<div
			className="min-h-screen flex items-center justify-center p-6"
			style={{ background: "var(--color-canvas)" }}
		>
			<form onSubmit={handleSubmit} className="w-full max-w-xs text-center">
				<h1
					className="text-3xl font-bold tracking-tight mb-2"
					style={{
						fontFamily: "var(--font-display)",
						letterSpacing: "-0.02em",
					}}
				>
					GRND
				</h1>
				<p
					className="text-sm mb-6"
					style={{ color: "var(--color-text-secondary)" }}
				>
					Enter your name so the workshop facilitator can follow your progress.
				</p>
				<input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Your name"
					maxLength={30}
					className="w-full px-4 py-3 rounded mb-3 text-sm"
					style={{
						background: "var(--color-surface)",
						border: "1px solid var(--color-border)",
						color: "var(--color-text)",
						fontFamily: "var(--font-mono)",
						textAlign: "center",
					}}
					autoFocus
				/>
				<button
					type="submit"
					disabled={!name.trim()}
					className="w-full py-3 rounded text-sm font-bold cursor-pointer"
					style={{
						background: name.trim()
							? "var(--color-growth)"
							: "var(--color-border)",
						color: "#fff",
						border: "none",
						fontFamily: "var(--font-display)",
					}}
				>
					Start →
				</button>
			</form>
		</div>
	);
}
