// ═══════════════════════════════════════════════════════════════
// TELEMETRY CLIENT — Sends player state to the workshop server
// Also handles: player name, localStorage persistence, event polling
// ═══════════════════════════════════════════════════════════════

import { WORLD_EVENTS as _worldEvents } from "../events/worldEvents.js";

const API_BASE = import.meta.env.PROD ? "" : "";
// In dev, Vite proxy or same-origin. In prod, same Vercel domain.

// ─── Player Identity ───────────────────────────────────────────

let _playerId = null;

export function getPlayerId() {
	if (_playerId) return _playerId;

	// Check URL param first
	const params = new URLSearchParams(window.location.search);
	const urlName = params.get("player") || params.get("name");
	if (urlName) {
		_playerId = urlName.trim().substring(0, 30);
		localStorage.setItem("grnd_playerId", _playerId);
		return _playerId;
	}

	// Check localStorage
	const stored = localStorage.getItem("grnd_playerId");
	if (stored) {
		_playerId = stored;
		return _playerId;
	}

	return null; // Will prompt
}

export function setPlayerId(name) {
	_playerId = name.trim().substring(0, 30);
	localStorage.setItem("grnd_playerId", _playerId);
	return _playerId;
}

// ─── State Persistence ─────────────────────────────────────────

export function saveGameState(storeState) {
	try {
		const serializable = {
			screen: storeState.screen,
			classId: storeState.classId,
			assumptions: storeState.assumptions,
			state: storeState.state,
			history: storeState.history,
			decisions: storeState.decisions,
			forecast: storeState.forecast,
			founderProfile: storeState.founderProfile,
			result: storeState.result,
			usedEvents: storeState.usedEvents,
			usedWorlds: storeState.usedWorlds,
			ap: storeState.ap,
			maxAP: storeState.maxAP,
			log: storeState.log?.slice(-50), // Keep last 50 entries
			shownInsightCards: storeState.shownInsightCards,
			shownHints: storeState.shownHints,
		};
		localStorage.setItem("grnd_gameState", JSON.stringify(serializable));
	} catch {
		// localStorage full or unavailable — ignore
	}
}

export function loadGameState() {
	try {
		const raw = localStorage.getItem("grnd_gameState");
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function clearGameState() {
	localStorage.removeItem("grnd_gameState");
}

// ─── Telemetry Sender ──────────────────────────────────────────

let _lastSent = 0;
const MIN_INTERVAL = 2000; // Don't spam — 2s minimum between sends

export async function sendTelemetry(gameState, classId, classConfig) {
	const playerId = getPlayerId();
	if (!playerId) return;
	if (!gameState) return;

	const now = Date.now();
	if (now - _lastSent < MIN_INTERVAL) return;
	_lastSent = now;

	const s = gameState;
	const payload = {
		playerId,
		classId,
		className: classConfig?.name ?? classId,
		month: s.month ?? 0,
		cash: s.cash ?? 0,
		runway: s.runway ?? 0,
		mrr: s.totalMRR ?? s.revenue ?? 0,
		customers: s.customers ?? s.activeClients ?? 0,
		pmf: s.pmf ?? 0,
		// Class-specific key metrics
		churn: s.churn ?? null,
		repeatRate: s.repeatRate ?? null,
		liquidity: s.liquidity ?? null,
		utilization: s.utilization ?? null,
		certProgress: s.certProgress ?? null,
		lois: s.lois ?? null,
		burnRate: s.burnRate ?? s.totalBurn ?? 0,
		screen: "game", // Telemetry only sent during game
	};

	try {
		await fetch(`${API_BASE}/api/telemetry`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
	} catch {
		// Network error on bad WiFi — silently ignore
	}
}

// ─── Event Injection Poller ────────────────────────────────────

export async function pollInjectedEvent() {
	const playerId = getPlayerId();
	if (!playerId) return null;

	try {
		const res = await fetch(
			`${API_BASE}/api/inject?playerId=${encodeURIComponent(playerId)}`,
		);
		if (!res.ok) return null;
		const data = await res.json();
		// Server stores event ID only (functions can't serialize through KV)
		// Reconstruct the full event object from the local WORLD_EVENTS array
		const eventId = data.eventId ?? data.event?.id ?? null;
		if (!eventId) return null;
		return _worldEvents.find((w) => w.id === eventId) ?? null;
	} catch {
		return null; // Network error — no injected event
	}
}

export async function consumeInjectedEvent() {
	const playerId = getPlayerId();
	if (!playerId) return;

	try {
		await fetch(
			`${API_BASE}/api/inject?playerId=${encodeURIComponent(playerId)}`,
			{
				method: "DELETE",
			},
		);
	} catch {
		// ignore
	}
}
