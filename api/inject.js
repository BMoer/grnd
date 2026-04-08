// ═══════════════════════════════════════════════════════════════
// EVENT INJECTION API — Admin sends targeted world events
// POST: admin pushes an event to a player's queue
// GET:  player polls for pending injected events
// DELETE: player acknowledges/consumes an injected event
// ═══════════════════════════════════════════════════════════════

import { kv } from "@vercel/kv";

export default async function handler(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin-Key");
	if (req.method === "OPTIONS") return res.status(200).end();

	try {
		if (req.method === "POST") {
			// Admin injects event
			const adminKey = req.headers["x-admin-key"];
			if (adminKey !== (process.env.ADMIN_KEY || "grnd2025")) {
				return res.status(401).json({ error: "unauthorized" });
			}

			const { playerId, event } = req.body;
			if (!playerId || !event) {
				return res.status(400).json({ error: "playerId and event required" });
			}

			const queueKey = `inject:${playerId}`;
			// Store single pending event (overwrites previous — one at a time)
			await kv.set(queueKey, { event, injectedAt: Date.now() }, { ex: 300 }); // 5min TTL

			return res.status(200).json({ ok: true });
		} else if (req.method === "GET") {
			// Player polls for injected event
			const playerId = req.query.playerId;
			if (!playerId) {
				return res.status(400).json({ error: "playerId required" });
			}

			const queueKey = `inject:${playerId}`;
			const pending = await kv.get(queueKey);

			if (!pending) {
				return res.status(200).json({ event: null });
			}

			return res.status(200).json(pending);
		} else if (req.method === "DELETE") {
			// Player consumes event
			const playerId = req.query.playerId || req.body?.playerId;
			if (!playerId) {
				return res.status(400).json({ error: "playerId required" });
			}

			await kv.del(`inject:${playerId}`);
			return res.status(200).json({ ok: true });
		} else {
			return res.status(405).json({ error: "method not allowed" });
		}
	} catch (err) {
		console.error("Inject error:", err);
		return res.status(500).json({ error: "internal error" });
	}
}
