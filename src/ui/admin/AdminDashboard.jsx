// ═══════════════════════════════════════════════════════════════
// ADMIN DASHBOARD — Workshop live monitoring + event injection
// Route: /admin?key=grnd2025
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import { WORLD_EVENTS } from "../../events/worldEvents.js";

const POLL_INTERVAL = 5000;
const API_BASE = "";

export default function AdminDashboard() {
	const urlKey = new URLSearchParams(window.location.search).get("key");
	const [adminKey, setAdminKey] = useState(urlKey || "");
	const [authenticated, setAuthenticated] = useState(!!urlKey);
	const [players, setPlayers] = useState([]);
	const [error, setError] = useState(null);
	const [lastUpdate, setLastUpdate] = useState(null);
	const [sortBy, setSortBy] = useState("month");
	const [sortDir, setSortDir] = useState("desc");
	const [injectTarget, setInjectTarget] = useState(null);
	const [injectStatus, setInjectStatus] = useState(null);

	// Fetch players
	const fetchPlayers = useCallback(async () => {
		if (!authenticated || !adminKey) return;
		try {
			const res = await fetch(`${API_BASE}/api/telemetry`, {
				headers: { "X-Admin-Key": adminKey },
			});
			if (res.status === 401) {
				setAuthenticated(false);
				setError("Invalid admin key");
				return;
			}
			const data = await res.json();
			setPlayers(data.players || []);
			setLastUpdate(new Date());
			setError(null);
		} catch {
			setError("Network error — retrying...");
		}
	}, [authenticated, adminKey]);

	// Poll — initial fetch + interval
	useEffect(() => {
		if (!authenticated) return;
		// Initial fetch on mount/auth change
		let cancelled = false;
		const doFetch = async () => {
			if (cancelled) return;
			await fetchPlayers();
		};
		doFetch();
		const interval = setInterval(doFetch, POLL_INTERVAL);
		return () => {
			cancelled = true;
			clearInterval(interval);
		};
	}, [authenticated, fetchPlayers]);

	// Inject event
	const handleInject = async (playerId, event) => {
		try {
			const res = await fetch(`${API_BASE}/api/inject`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Admin-Key": adminKey,
				},
				body: JSON.stringify({ playerId, event }),
			});
			if (res.ok) {
				setInjectStatus(`✓ Event sent to ${playerId}`);
				setTimeout(() => setInjectStatus(null), 3000);
			} else {
				setInjectStatus(`✗ Failed to send event`);
			}
		} catch {
			setInjectStatus("✗ Network error");
		}
		setInjectTarget(null);
	};

	// Sort
	const sorted = [...players].sort((a, b) => {
		const av = a[sortBy] ?? 0;
		const bv = b[sortBy] ?? 0;
		return sortDir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
	});

	const toggleSort = (key) => {
		if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		else {
			setSortBy(key);
			setSortDir("desc");
		}
	};

	if (!authenticated) {
		return (
			<LoginScreen
				adminKey={adminKey}
				setAdminKey={setAdminKey}
				setAuthenticated={setAuthenticated}
				error={error}
			/>
		);
	}

	return (
		<div
			className="min-h-screen p-4"
			style={{ background: "var(--color-canvas)", color: "var(--color-text)" }}
		>
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-4">
					<div>
						<h1
							className="text-xl font-bold"
							style={{ fontFamily: "var(--font-display)" }}
						>
							GRND Workshop Control
						</h1>
						<div
							className="text-[10px]"
							style={{
								color: "var(--color-text-muted)",
								fontFamily: "var(--font-mono)",
							}}
						>
							{players.length} active player{players.length !== 1 ? "s" : ""}
							{lastUpdate &&
								` · last update ${lastUpdate.toLocaleTimeString()}`}
							{error && (
								<span style={{ color: "var(--color-danger)" }}> · {error}</span>
							)}
						</div>
					</div>
					{injectStatus && (
						<div
							className="text-[11px] px-3 py-1 rounded"
							style={{
								background: injectStatus.startsWith("✓")
									? "var(--color-growth)"
									: "var(--color-danger)",
								color: "#fff",
								fontFamily: "var(--font-mono)",
							}}
						>
							{injectStatus}
						</div>
					)}
				</div>

				{/* Player Table */}
				{players.length === 0 ? (
					<div
						className="text-center py-12"
						style={{ color: "var(--color-text-muted)" }}
					>
						<p className="text-lg mb-2">No active players yet</p>
						<p
							className="text-[11px]"
							style={{ fontFamily: "var(--font-mono)" }}
						>
							Players appear here once they start a game. Share the game URL
							with ?player=Name parameter.
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table
							className="w-full text-[11px]"
							style={{ fontFamily: "var(--font-mono)" }}
						>
							<thead>
								<tr style={{ borderBottom: "2px solid var(--color-border)" }}>
									{[
										{ key: "playerId", label: "Player" },
										{ key: "className", label: "Class" },
										{ key: "month", label: "Month" },
										{ key: "cash", label: "Cash" },
										{ key: "runway", label: "Runway" },
										{ key: "mrr", label: "MRR/Rev" },
										{ key: "customers", label: "Cust." },
										{ key: "pmf", label: "PMF" },
										{ key: "keyMetric", label: "Key Metric" },
										{ key: "burnRate", label: "Burn" },
									].map((col) => (
										<th
											key={col.key}
											className="text-left py-2 px-2 cursor-pointer select-none"
											style={{ color: "var(--color-text-muted)" }}
											onClick={() => toggleSort(col.key)}
										>
											{col.label}{" "}
											{sortBy === col.key
												? sortDir === "asc"
													? "▲"
													: "▼"
												: ""}
										</th>
									))}
									<th
										className="text-left py-2 px-2"
										style={{ color: "var(--color-text-muted)" }}
									>
										Action
									</th>
								</tr>
							</thead>
							<tbody>
								{sorted.map((p) => (
									<PlayerRow
										key={p.playerId}
										player={p}
										onInject={() =>
											setInjectTarget(
												injectTarget === p.playerId ? null : p.playerId,
											)
										}
										isInjectOpen={injectTarget === p.playerId}
										handleInject={handleInject}
										adminKey={adminKey}
									/>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}

// ─── Player Row ────────────────────────────────────────────────

function PlayerRow({ player, onInject, isInjectOpen, handleInject }) {
	const p = player;
	const isCritical = (p.runway > 0 && p.runway < 3) || p.cash < 5000;
	const isChurnHigh = (p.churn ?? 0) > 12;
	const isLowCash = p.cash < 100000 * 0.2; // less than 20% of typical start

	const rowStyle = {
		borderBottom: "1px solid var(--color-border)",
		background: isCritical ? "rgba(214, 64, 69, 0.08)" : "transparent",
	};

	// Class-specific key metric
	const keyMetric = getKeyMetric(p);

	// Available events for this player's class
	const availableEvents = WORLD_EVENTS; // World events are universal

	return (
		<>
			<tr style={rowStyle}>
				<td
					className="py-2 px-2 font-bold"
					style={{
						color: isCritical ? "var(--color-danger)" : "var(--color-text)",
					}}
				>
					{p.playerId}
					{isCritical && (
						<span className="ml-1" title="Critical state">
							🔴
						</span>
					)}
				</td>
				<td className="py-2 px-2">{p.className ?? p.classId}</td>
				<td className="py-2 px-2">M{p.month}</td>
				<td
					className="py-2 px-2"
					style={{
						color: isLowCash ? "var(--color-danger)" : "var(--color-text)",
					}}
				>
					€{(p.cash ?? 0).toLocaleString("en-US")}
				</td>
				<td
					className="py-2 px-2"
					style={{
						color:
							p.runway > 0 && p.runway < 4
								? "var(--color-danger)"
								: p.runway < 8
									? "var(--color-caution)"
									: "var(--color-text)",
					}}
				>
					{p.runway > 24 ? "24+" : (p.runway ?? "–")} mo
				</td>
				<td className="py-2 px-2">€{(p.mrr ?? 0).toLocaleString("en-US")}</td>
				<td className="py-2 px-2">{p.customers ?? 0}</td>
				<td
					className="py-2 px-2"
					style={{
						color:
							(p.pmf ?? 0) > 60 ? "var(--color-growth)" : "var(--color-text)",
					}}
				>
					{p.pmf ?? 0}/100
				</td>
				<td
					className="py-2 px-2"
					style={{
						color: isChurnHigh
							? "var(--color-danger)"
							: "var(--color-text-secondary)",
					}}
				>
					{keyMetric}
				</td>
				<td className="py-2 px-2">
					€{(p.burnRate ?? 0).toLocaleString("en-US")}
				</td>
				<td className="py-2 px-2">
					<button
						onClick={onInject}
						className="px-2 py-1 rounded text-[10px] cursor-pointer"
						style={{
							background: isInjectOpen
								? "var(--color-danger)"
								: "var(--color-raised)",
							color: isInjectOpen ? "#fff" : "var(--color-text)",
							border: "1px solid var(--color-border)",
							fontFamily: "var(--font-mono)",
						}}
					>
						{isInjectOpen ? "✕ Close" : "⚡ Event"}
					</button>
				</td>
			</tr>
			{isInjectOpen && (
				<tr>
					<td
						colSpan={11}
						className="py-2 px-2"
						style={{ background: "var(--color-surface)" }}
					>
						<div
							className="text-[10px] mb-2 font-bold"
							style={{ color: "var(--color-text-muted)" }}
						>
							Send World Event to {p.playerId}:
						</div>
						<div className="flex flex-wrap gap-2">
							{availableEvents.map((evt) => (
								<button
									key={evt.id}
									onClick={() => handleInject(p.playerId, evt)}
									className="px-3 py-1.5 rounded text-[10px] cursor-pointer"
									style={{
										background: "var(--color-canvas)",
										border: "1px solid var(--color-border)",
										color: "var(--color-text)",
										fontFamily: "var(--font-mono)",
									}}
									title={evt.flavor}
								>
									{evt.title}
								</button>
							))}
						</div>
					</td>
				</tr>
			)}
		</>
	);
}

function getKeyMetric(p) {
	if (p.churn != null && p.classId === "saas")
		return `Churn ${p.churn.toFixed?.(1) ?? p.churn}%`;
	if (p.repeatRate != null && p.classId === "consumer")
		return `Repeat ${p.repeatRate.toFixed?.(1) ?? p.repeatRate}%`;
	if (p.liquidity != null && p.classId === "marketplace")
		return `Liq ${p.liquidity}%`;
	if (p.utilization != null && p.classId === "service")
		return `Util ${p.utilization}%`;
	if (p.certProgress != null && p.classId === "deeptech")
		return `Cert ${Math.round(p.certProgress)}%`;
	if (p.lois != null && p.classId === "deeptech") return `${p.lois} LOIs`;
	if (p.churn != null) return `Churn ${p.churn.toFixed?.(1) ?? p.churn}%`;
	return "–";
}

// ─── Login Screen ──────────────────────────────────────────────

function LoginScreen({ adminKey, setAdminKey, setAuthenticated, error }) {
	const handleSubmit = (e) => {
		e.preventDefault();
		if (adminKey.trim()) {
			setAuthenticated(true);
		}
	};

	return (
		<div
			className="min-h-screen flex items-center justify-center p-6"
			style={{ background: "var(--color-canvas)" }}
		>
			<form onSubmit={handleSubmit} className="w-full max-w-xs">
				<h1
					className="text-xl font-bold mb-4"
					style={{ fontFamily: "var(--font-display)" }}
				>
					GRND Admin
				</h1>
				<input
					type="password"
					value={adminKey}
					onChange={(e) => setAdminKey(e.target.value)}
					placeholder="Admin Key"
					className="w-full px-3 py-2 rounded mb-3 text-sm"
					style={{
						background: "var(--color-surface)",
						border: "1px solid var(--color-border)",
						color: "var(--color-text)",
						fontFamily: "var(--font-mono)",
					}}
					autoFocus
				/>
				{error && (
					<div
						className="text-[11px] mb-2"
						style={{ color: "var(--color-danger)" }}
					>
						{error}
					</div>
				)}
				<button
					type="submit"
					className="w-full py-2 rounded text-sm font-bold cursor-pointer"
					style={{
						background: "var(--color-growth)",
						color: "#fff",
						border: "none",
						fontFamily: "var(--font-display)",
					}}
				>
					Login
				</button>
			</form>
		</div>
	);
}
