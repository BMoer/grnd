// ═══════════════════════════════════════════════════════════════
// TELEMETRY API — Player state reporting
// POST: player sends current state
// GET:  admin fetches all active players
// ═══════════════════════════════════════════════════════════════

import { kv } from "@vercel/kv";

const PLAYER_TTL = 600; // 10 minutes — auto-expire stale players

export default async function handler(req, res) {
	// CORS
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin-Key");
	if (req.method === "OPTIONS") return res.status(200).end();

	try {
		if (req.method === "POST") {
			// Player reports state
			const data = req.body;
			if (!data?.playerId) {
				return res.status(400).json({ error: "playerId required" });
			}

			const playerKey = `player:${data.playerId}`;
			const payload = {
				...data,
				updatedAt: Date.now(),
			};

			// Store player state with TTL
			await kv.set(playerKey, payload, { ex: PLAYER_TTL });
			// Add to active players set
			await kv.sadd("active_players", data.playerId);

			return res.status(200).json({ ok: true });
		} else if (req.method === "GET") {
			// Admin fetches all players
			const adminKey = req.headers["x-admin-key"];
			if (adminKey !== (process.env.ADMIN_KEY || "grnd2025")) {
				return res.status(401).json({ error: "unauthorized" });
			}

			const playerIds = await kv.smembers("active_players");
			if (!playerIds || playerIds.length === 0) {
				return res.status(200).json({ players: [] });
			}

			// Fetch all player states
			const pipeline = kv.pipeline();
			for (const id of playerIds) {
				pipeline.get(`player:${id}`);
			}
			const results = await pipeline.exec();

			// Filter out expired (null) entries and clean up set
			const players = [];
			const expired = [];
			for (let i = 0; i < results.length; i++) {
				if (results[i]) {
					players.push(results[i]);
				} else {
					expired.push(playerIds[i]);
				}
			}

			// Remove expired players from set
			if (expired.length > 0) {
				await kv.srem("active_players", ...expired);
			}

			return res.status(200).json({ players });
		} else {
			return res.status(405).json({ error: "method not allowed" });
		}
	} catch (err) {
		console.error("Telemetry error:", err);
		return res.status(500).json({ error: "internal error" });
	}
}
