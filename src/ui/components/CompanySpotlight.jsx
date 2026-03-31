import { useGameStore } from '../../store.js';

/**
 * Minimal geometric icons — Bauhaus-aligned, no emojis.
 * Uses the app's accent color and functional palette.
 */
function MetricIcon({ type, color }) {
  const s = { width: 14, height: 14, display: 'block' };
  const c = color || 'var(--color-text-muted)';

  switch (type) {
    case 'customers':
      // Two circles (people)
      return (
        <svg style={s} viewBox="0 0 14 14" fill="none">
          <circle cx="5" cy="4" r="2.5" stroke={c} strokeWidth="1.2" />
          <circle cx="10" cy="5" r="2" stroke={c} strokeWidth="1.2" />
          <path d="M1 12c0-2.5 2-4 4-4s4 1.5 4 4" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'team':
      // Grid of dots (org)
      return (
        <svg style={s} viewBox="0 0 14 14" fill="none">
          <rect x="3" y="2" width="8" height="10" rx="1" stroke={c} strokeWidth="1.2" />
          <line x1="5" y1="5" x2="9" y2="5" stroke={c} strokeWidth="1" />
          <line x1="5" y1="7.5" x2="9" y2="7.5" stroke={c} strokeWidth="1" />
          <line x1="5" y1="10" x2="8" y2="10" stroke={c} strokeWidth="1" />
        </svg>
      );
    case 'mrr':
      // Ascending bars
      return (
        <svg style={s} viewBox="0 0 14 14" fill="none">
          <rect x="1" y="9" width="3" height="4" fill={c} rx="0.5" />
          <rect x="5.5" y="5" width="3" height="8" fill={c} rx="0.5" />
          <rect x="10" y="2" width="3" height="11" fill={c} rx="0.5" />
        </svg>
      );
    case 'cash':
      // Circle with line (coin)
      return (
        <svg style={s} viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke={c} strokeWidth="1.2" />
          <line x1="7" y1="3.5" x2="7" y2="10.5" stroke={c} strokeWidth="1.2" />
          <line x1="5" y1="5" x2="9" y2="5" stroke={c} strokeWidth="1" />
          <line x1="5" y1="9" x2="9" y2="9" stroke={c} strokeWidth="1" />
        </svg>
      );
    case 'burn':
      // Downward arrow
      return (
        <svg style={s} viewBox="0 0 14 14" fill="none">
          <line x1="7" y1="1" x2="7" y2="11" stroke={c} strokeWidth="1.2" />
          <polyline points="3,8 7,12 11,8" stroke={c} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'runway':
      // Horizontal line with end marker (runway)
      return (
        <svg style={s} viewBox="0 0 14 14" fill="none">
          <line x1="1" y1="7" x2="12" y2="7" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="12" y1="4" x2="12" y2="10" stroke={c} strokeWidth="1.5" />
          <circle cx="3" cy="7" r="1.5" fill={c} />
        </svg>
      );
    default:
      return <div style={{ width: 14, height: 14, background: c, borderRadius: 2 }} />;
  }
}

export default function CompanySpotlight() {
  const { state, history, classConfig } = useGameStore();
  if (!state || !classConfig) return null;

  const accent = classConfig.color;
  const prev = history.length > 1 ? history[history.length - 2] : null;

  const netBurn = state.netBurn ?? Math.max(0, (state.totalBurn ?? state.burnRate ?? 0) - (state.revenue ?? 0));
  const runway = state.runway ?? (netBurn > 0 ? Math.floor((state.cash ?? 0) / netBurn) : 99);

  // Simple valuation: ~10x ARR for early-stage SaaS, min €50K (pre-revenue floor)
  const arr = (state.totalMRR ?? 0) * 12;
  const valuation = Math.max(50000, Math.round(arr * 10));
  const prevArr = prev ? (prev.totalMRR ?? 0) * 12 : 0;
  const prevValuation = prev ? Math.max(50000, Math.round(prevArr * 10)) : valuation;

  const metrics = [
    {
      iconType: 'customers',
      label: 'Customers',
      value: state.customers ?? 0,
      prev: prev?.customers ?? 0,
      format: (v) => v.toString(),
    },
    {
      iconType: 'team',
      label: 'Team Size',
      value: state.teamSize ?? 2,
      prev: prev?.teamSize ?? 2,
      format: (v) => v.toString(),
    },
    {
      iconType: 'mrr',
      label: 'MRR',
      value: state.totalMRR ?? 0,
      prev: prev?.totalMRR ?? 0,
      format: (v) => `€${v.toLocaleString('de-DE')}`,
      color: accent,
      iconColor: accent,
    },
    {
      iconType: 'cash',
      label: 'Cash',
      value: state.cash ?? 0,
      prev: prev?.cash ?? 0,
      format: (v) => `€${(v / 1000).toFixed(0)}K`,
      color: (state.cash ?? 0) < 20000 ? 'var(--color-danger)' : undefined,
    },
    {
      iconType: 'burn',
      label: 'Net Burn',
      value: netBurn,
      prev: prev ? Math.max(0, (prev.totalBurn ?? prev.burnRate ?? 0) - (prev.revenue ?? 0)) : netBurn,
      format: (v) => `€${v.toLocaleString('de-DE')}/mo`,
      invertDelta: true, // lower is better
    },
    {
      iconType: 'runway',
      label: 'Runway',
      value: Math.min(runway, 24),
      prev: prev ? Math.min(prev.runway ?? 24, 24) : runway,
      format: (v) => v >= 24 ? '24+ mo' : `${v} mo`,
      color: runway < 4 ? 'var(--color-danger)' : runway < 8 ? 'var(--color-caution)' : 'var(--color-growth)',
    },
  ];

  // Active board bonuses/penalties
  const boardEffects = state.boardEffects;

  return (
    <div className="h-full flex flex-col">
      <div
        className="text-[10px] uppercase tracking-widest font-medium mb-3"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
      >
        Company Spotlight
      </div>

      {/* Board effects banner */}
      {boardEffects && boardEffects.length > 0 && (
        <div
          className="mb-3 p-2 rounded text-[10px]"
          style={{ background: 'var(--color-raised)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)' }}
        >
          <div className="uppercase tracking-widest font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Board Q{Math.ceil((state.month ?? 1) / 3)} Effects
          </div>
          {boardEffects.map((e, i) => (
            <div key={i} className="leading-snug" style={{ color: e.positive ? 'var(--color-growth)' : 'var(--color-danger)' }}>
              {e.positive ? '▲' : '▼'} {e.label}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 flex-1">
        {metrics.map((m, i) => {
          const delta = m.value - m.prev;
          const showDelta = prev && delta !== 0;
          const deltaPositive = m.invertDelta ? delta < 0 : delta > 0;

          return (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded"
              style={{ background: 'var(--color-raised)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-2">
                <MetricIcon type={m.iconType} color={m.iconColor || 'var(--color-text-muted)'} />
                <span
                  className="text-[10px] uppercase tracking-widest font-medium"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  {m.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)', color: m.color || 'var(--color-text)' }}
                >
                  {m.format(m.value)}
                </span>
                {showDelta && (
                  <span
                    className="text-[10px] tabular-nums font-medium"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: deltaPositive ? 'var(--color-growth)' : 'var(--color-danger)',
                    }}
                  >
                    {delta > 0 ? '+' : ''}{typeof m.value === 'number' && m.value > 1000 ? m.format(delta) : delta}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Valuation */}
      <div
        className="mt-3 p-3 rounded text-center"
        style={{ background: `${accent}10`, border: `1px solid ${accent}30` }}
      >
        <div
          className="text-[10px] uppercase tracking-widest font-medium mb-1"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          Estimated Valuation
        </div>
        <div
          className="text-lg font-bold tabular-nums"
          style={{ fontFamily: 'var(--font-mono)', color: accent }}
        >
          €{(valuation / 1000).toFixed(0)}K
        </div>
        {prev && valuation !== prevValuation && (
          <div
            className="text-[10px] tabular-nums mt-0.5"
            style={{
              fontFamily: 'var(--font-mono)',
              color: valuation > prevValuation ? 'var(--color-growth)' : 'var(--color-danger)',
            }}
          >
            {valuation > prevValuation ? '▲' : '▼'} {((valuation - prevValuation) / 1000).toFixed(0)}K
          </div>
        )}
      </div>
    </div>
  );
}
