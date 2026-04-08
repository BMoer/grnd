// ═══════════════════════════════════════════════════════════════
// FOUNDER AVATARS — Rimworld-inspired minimal pixel-art faces
// Round heads, dot eyes, simple distinguishing features.
// ═══════════════════════════════════════════════════════════════

/**
 * Rimworld-style avatar for a founder.
 * @param {string} name — founder name (used to pick avatar)
 * @param {string} color — accent color
 * @param {number} size — pixel size (default 40)
 */
export default function FounderAvatar({ name, color, size = 40 }) {
	const c = color || "var(--color-text-muted)";
	const s = { width: size, height: size, display: "block", flexShrink: 0 };
	const key = (name || "").toLowerCase();

	const AvatarSVG = AVATARS[key] || AvatarDefault;
	return <AvatarSVG style={s} color={c} />;
}

/**
 * Pair of founder avatars side by side.
 */
export function FounderAvatarPair({ founders, color, size = 32 }) {
	if (!founders || founders.length === 0) return null;
	return (
		<div className="flex items-center" style={{ gap: size * -0.2 }}>
			{founders.map((f, i) => (
				<div
					key={f.name}
					style={{
						zIndex: founders.length - i,
						position: "relative",
						borderRadius: "50%",
						background: "var(--color-canvas)",
						padding: 2,
					}}
				>
					<FounderAvatar name={f.name} color={color} size={size} />
				</div>
			))}
		</div>
	);
}

// ─── Rimworld-style Avatar SVGs ───────────────────────────────
// Round/oval heads, filled skin tone, dot eyes, minimal features.
// Each founder has a unique distinguishing trait (hair, glasses, beard).

const SKIN = "#f0dcc0";
const SKIN_SHADOW = "#dfc8a8";

// SaaS — Mira Chen: short bob hair, confident
function AvatarMira({ style, color }) {
	return (
		<svg style={style} viewBox="0 0 40 40" fill="none">
			{/* Head */}
			<ellipse cx="20" cy="21" rx="12" ry="13" fill={SKIN} />
			<ellipse cx="20" cy="21" rx="12" ry="13" stroke={color} strokeWidth="1.2" fill="none" />
			{/* Hair — short bob */}
			<path d="M8 18 Q8 6 20 5 Q32 6 32 18 L30 16 Q28 10 20 9 Q12 10 10 16 Z" fill={color} />
			{/* Eyes */}
			<circle cx="15" cy="20" r="1.5" fill="#333" />
			<circle cx="25" cy="20" r="1.5" fill="#333" />
			{/* Nose */}
			<line x1="20" y1="22" x2="20" y2="25" stroke={SKIN_SHADOW} strokeWidth="1" strokeLinecap="round" />
			{/* Mouth */}
			<path d="M17 27 Q20 29 23 27" stroke="#c09080" strokeWidth="1" strokeLinecap="round" fill="none" />
		</svg>
	);
}

// SaaS — Jonas Richter: glasses, short cropped hair
function AvatarJonas({ style, color }) {
	return (
		<svg style={style} viewBox="0 0 40 40" fill="none">
			<ellipse cx="20" cy="21" rx="12" ry="13" fill={SKIN} />
			<ellipse cx="20" cy="21" rx="12" ry="13" stroke={color} strokeWidth="1.2" fill="none" />
			{/* Hair — short flat top */}
			<path d="M9 17 Q9 7 20 6 Q31 7 31 17 L29 15 Q27 11 20 10 Q13 11 11 15 Z" fill={color} />
			{/* Glasses */}
			<rect x="11" y="18" width="7" height="5" rx="2" stroke="#555" strokeWidth="1" fill="none" />
			<rect x="22" y="18" width="7" height="5" rx="2" stroke="#555" strokeWidth="1" fill="none" />
			<line x1="18" y1="20.5" x2="22" y2="20.5" stroke="#555" strokeWidth="0.8" />
			{/* Eyes behind glasses */}
			<circle cx="14.5" cy="20.5" r="1.2" fill="#333" />
			<circle cx="25.5" cy="20.5" r="1.2" fill="#333" />
			{/* Mouth */}
			<line x1="17" y1="27" x2="23" y2="27" stroke="#c09080" strokeWidth="1" strokeLinecap="round" />
		</svg>
	);
}

// Consumer — Nina Volkov: ponytail, energetic
function AvatarNina({ style, color }) {
	return (
		<svg style={style} viewBox="0 0 40 40" fill="none">
			<ellipse cx="20" cy="21" rx="12" ry="13" fill={SKIN} />
			<ellipse cx="20" cy="21" rx="12" ry="13" stroke={color} strokeWidth="1.2" fill="none" />
			{/* Hair — with ponytail */}
			<path d="M8 19 Q8 6 20 5 Q32 6 32 19 L30 16 Q28 10 20 9 Q12 10 10 16 Z" fill={color} />
			<path d="M30 12 Q34 8 36 14 Q34 16 32 15" fill={color} />
			{/* Eyes */}
			<circle cx="15" cy="20" r="1.5" fill="#333" />
			<circle cx="25" cy="20" r="1.5" fill="#333" />
			{/* Nose */}
			<line x1="20" y1="22" x2="20" y2="25" stroke={SKIN_SHADOW} strokeWidth="1" strokeLinecap="round" />
			{/* Smile */}
			<path d="M16 27 Q20 30 24 27" stroke="#c09080" strokeWidth="1" strokeLinecap="round" fill="none" />
		</svg>
	);
}

// Consumer — Dr. Alex Berger: receding hairline, calm
function AvatarAlex({ style, color }) {
	return (
		<svg style={style} viewBox="0 0 40 40" fill="none">
			<ellipse cx="20" cy="21" rx="12" ry="13" fill={SKIN} />
			<ellipse cx="20" cy="21" rx="12" ry="13" stroke={color} strokeWidth="1.2" fill="none" />
			{/* Hair — receding, thinning */}
			<path d="M10 17 Q12 9 20 8 Q28 9 30 17 L28 15 Q26 12 20 11 Q14 12 12 15 Z" fill={color} />
			{/* Eyes */}
			<circle cx="15" cy="20" r="1.3" fill="#333" />
			<circle cx="25" cy="20" r="1.3" fill="#333" />
			{/* Nose */}
			<line x1="20" y1="22" x2="20" y2="25" stroke={SKIN_SHADOW} strokeWidth="1" strokeLinecap="round" />
			{/* Neutral mouth */}
			<line x1="17" y1="28" x2="23" y2="28" stroke="#c09080" strokeWidth="1" strokeLinecap="round" />
		</svg>
	);
}

// Deep-Tech — Dr. Sarah Lindström: neat bun, precise
function AvatarSarah({ style, color }) {
	return (
		<svg style={style} viewBox="0 0 40 40" fill="none">
			<ellipse cx="20" cy="21" rx="12" ry="13" fill={SKIN} />
			<ellipse cx="20" cy="21" rx="12" ry="13" stroke={color} strokeWidth="1.2" fill="none" />
			{/* Hair — pulled back with bun */}
			<path d="M8 19 Q8 6 20 5 Q32 6 32 19 L30 16 Q28 10 20 9 Q12 10 10 16 Z" fill={color} />
			<circle cx="20" cy="5" r="4" fill={color} />
			{/* Eyes */}
			<circle cx="15" cy="20" r="1.3" fill="#333" />
			<circle cx="25" cy="20" r="1.3" fill="#333" />
			{/* Nose */}
			<line x1="20" y1="22" x2="20" y2="25" stroke={SKIN_SHADOW} strokeWidth="1" strokeLinecap="round" />
			{/* Slight smile */}
			<path d="M17 27 Q20 29 23 27" stroke="#c09080" strokeWidth="1" strokeLinecap="round" fill="none" />
		</svg>
	);
}

// Deep-Tech — Thomas Huber: beard, solid
function AvatarThomas({ style, color }) {
	return (
		<svg style={style} viewBox="0 0 40 40" fill="none">
			<ellipse cx="20" cy="21" rx="12" ry="13" fill={SKIN} />
			<ellipse cx="20" cy="21" rx="12" ry="13" stroke={color} strokeWidth="1.2" fill="none" />
			{/* Hair — thick short */}
			<path d="M9 17 Q9 6 20 5 Q31 6 31 17 L29 14 Q27 10 20 9 Q13 10 11 14 Z" fill={color} />
			{/* Eyes */}
			<circle cx="15" cy="20" r="1.3" fill="#333" />
			<circle cx="25" cy="20" r="1.3" fill="#333" />
			{/* Beard */}
			<path d="M12 26 Q14 32 20 33 Q26 32 28 26" fill={color} opacity="0.7" />
			{/* Mouth (visible above beard) */}
			<line x1="17" y1="27" x2="23" y2="27" stroke={SKIN_SHADOW} strokeWidth="1" strokeLinecap="round" />
		</svg>
	);
}

// Marketplace — Lena Kowalski: long wavy hair, open
function AvatarLena({ style, color }) {
	return (
		<svg style={style} viewBox="0 0 40 40" fill="none">
			<ellipse cx="20" cy="21" rx="12" ry="13" fill={SKIN} />
			<ellipse cx="20" cy="21" rx="12" ry="13" stroke={color} strokeWidth="1.2" fill="none" />
			{/* Hair — long flowing */}
			<path d="M8 19 Q8 6 20 5 Q32 6 32 19 L32 30 Q30 28 30 22 L10 22 Q10 28 8 30 Z" fill={color} />
			{/* Eyes */}
			<circle cx="15" cy="20" r="1.5" fill="#333" />
			<circle cx="25" cy="20" r="1.5" fill="#333" />
			{/* Nose */}
			<line x1="20" y1="22" x2="20" y2="25" stroke={SKIN_SHADOW} strokeWidth="1" strokeLinecap="round" />
			{/* Smile */}
			<path d="M17 27 Q20 30 23 27" stroke="#c09080" strokeWidth="1" strokeLinecap="round" fill="none" />
		</svg>
	);
}

// Marketplace — Marco Di Stefano: curly hair, creative
function AvatarMarco({ style, color }) {
	return (
		<svg style={style} viewBox="0 0 40 40" fill="none">
			<ellipse cx="20" cy="21" rx="12" ry="13" fill={SKIN} />
			<ellipse cx="20" cy="21" rx="12" ry="13" stroke={color} strokeWidth="1.2" fill="none" />
			{/* Hair — curly/fluffy */}
			<circle cx="13" cy="10" r="4" fill={color} />
			<circle cx="20" cy="7" r="5" fill={color} />
			<circle cx="27" cy="10" r="4" fill={color} />
			<circle cx="10" cy="15" r="3" fill={color} />
			<circle cx="30" cy="15" r="3" fill={color} />
			{/* Eyes */}
			<circle cx="15" cy="20" r="1.5" fill="#333" />
			<circle cx="25" cy="20" r="1.5" fill="#333" />
			{/* Nose */}
			<line x1="20" y1="22" x2="20" y2="25" stroke={SKIN_SHADOW} strokeWidth="1" strokeLinecap="round" />
			{/* Grin */}
			<path d="M16 27 Q20 30 24 27" stroke="#c09080" strokeWidth="1" strokeLinecap="round" fill="none" />
		</svg>
	);
}

// Service — David Ashworth: side part, authoritative
function AvatarDavid({ style, color }) {
	return (
		<svg style={style} viewBox="0 0 40 40" fill="none">
			<ellipse cx="20" cy="21" rx="12" ry="13" fill={SKIN} />
			<ellipse cx="20" cy="21" rx="12" ry="13" stroke={color} strokeWidth="1.2" fill="none" />
			{/* Hair — neat side part */}
			<path d="M9 17 Q9 6 20 5 Q31 6 31 17 L29 14 Q27 10 20 9 Q13 10 11 14 Z" fill={color} />
			<line x1="15" y1="7" x2="15" y2="14" stroke={SKIN} strokeWidth="1" />
			{/* Eyes */}
			<circle cx="15" cy="20" r="1.3" fill="#333" />
			<circle cx="25" cy="20" r="1.3" fill="#333" />
			{/* Nose */}
			<line x1="20" y1="22" x2="20" y2="25" stroke={SKIN_SHADOW} strokeWidth="1" strokeLinecap="round" />
			{/* Firm mouth */}
			<line x1="17" y1="27.5" x2="23" y2="27.5" stroke="#c09080" strokeWidth="1" strokeLinecap="round" />
		</svg>
	);
}

// Service — Priya Sharma: bindi, long hair parted center
function AvatarPriya({ style, color }) {
	return (
		<svg style={style} viewBox="0 0 40 40" fill="none">
			<ellipse cx="20" cy="21" rx="12" ry="13" fill={SKIN} />
			<ellipse cx="20" cy="21" rx="12" ry="13" stroke={color} strokeWidth="1.2" fill="none" />
			{/* Hair — center part, long */}
			<path d="M8 20 Q8 6 20 5 Q32 6 32 20 L32 28 Q30 26 30 20 L10 20 Q10 26 8 28 Z" fill={color} />
			<line x1="20" y1="5" x2="20" y2="16" stroke={SKIN} strokeWidth="1.5" />
			{/* Bindi */}
			<circle cx="20" cy="15" r="1.2" fill="#c04040" />
			{/* Eyes */}
			<circle cx="15" cy="20" r="1.5" fill="#333" />
			<circle cx="25" cy="20" r="1.5" fill="#333" />
			{/* Nose */}
			<line x1="20" y1="22" x2="20" y2="25" stroke={SKIN_SHADOW} strokeWidth="1" strokeLinecap="round" />
			{/* Warm smile */}
			<path d="M17 27 Q20 29.5 23 27" stroke="#c09080" strokeWidth="1" strokeLinecap="round" fill="none" />
		</svg>
	);
}

// Fallback — generic round head
function AvatarDefault({ style, color }) {
	return (
		<svg style={style} viewBox="0 0 40 40" fill="none">
			<ellipse cx="20" cy="21" rx="12" ry="13" fill={SKIN} />
			<ellipse cx="20" cy="21" rx="12" ry="13" stroke={color} strokeWidth="1.2" fill="none" />
			{/* Simple hair cap */}
			<path d="M10 18 Q10 8 20 7 Q30 8 30 18 L28 16 Q26 12 20 11 Q14 12 12 16 Z" fill={color} />
			{/* Eyes */}
			<circle cx="15" cy="20" r="1.3" fill="#333" />
			<circle cx="25" cy="20" r="1.3" fill="#333" />
			{/* Mouth */}
			<line x1="17" y1="27" x2="23" y2="27" stroke="#c09080" strokeWidth="1" strokeLinecap="round" />
		</svg>
	);
}

// ─── Name → Avatar mapping ─────────────────────────────────────

export const AVATARS = {
	"mira chen": AvatarMira,
	"jonas richter": AvatarJonas,
	"nina volkov": AvatarNina,
	"dr. alex berger": AvatarAlex,
	"dr. sarah lindström": AvatarSarah,
	"thomas huber": AvatarThomas,
	"lena kowalski": AvatarLena,
	"marco di stefano": AvatarMarco,
	"david ashworth": AvatarDavid,
	"priya sharma": AvatarPriya,
};

// Short name → full name mapping for BoardMeeting speakers
export const SHORT_NAME_MAP = {
	mira: "mira chen",
	jonas: "jonas richter",
	nina: "nina volkov",
	alex: "dr. alex berger",
	sarah: "dr. sarah lindström",
	thomas: "thomas huber",
	lena: "lena kowalski",
	marco: "marco di stefano",
	david: "david ashworth",
	priya: "priya sharma",
};
