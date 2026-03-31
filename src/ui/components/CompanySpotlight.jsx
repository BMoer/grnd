import { useGameStore } from '../../store.js';

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
      icon: '👥',
      label: 'Customers',
      value: state.customers ?? 0,
      prev: prev?.customers ?? 0,
      format: (v) => v.toString(),
    },
    {
      icon: '🏢',
      label: 'Team Size',
      value: state.teamSize ?? 2,
      prev: prev?.teamSize ?? 2,
      format: (v) => v.toString(),
    },
    {
      icon: '📈',
      label: 'MRR',
      value: state.totalMRR ?? 0,
      prev: prev?.totalMRR ?? 0,
      format: (v) => `€${v.toLocaleString('de-DE')}`,
      color: accent,
    },
    {
      icon: '💰',
      label: 'Cash',
      value: state.cash ?? 0,
      prev: prev?.cash ?? 0,
      format: (v) => `€${(v / 1000).toFixed(0)}K`,
      color: (state.cash ?? 0) < 20000 ? 'var(--color-danger)' : undefined,
    },
    {
      icon: '🔥',
      label: 'Net Burn',
      value: netBurn,
      prev: prev ? Math.max(0, (prev.totalBurn ?? prev.burnRate ?? 0) - (prev.revenue ?? 0)) : netBurn,
      format: (v) => `€${v.toLocaleString('de-DE')}/mo`,
      invertDelta: true, // lower is better
    },
    {
      icon: '⏳',
      label: 'Runway',
      value: Math.min(runway, 24),
      prev: prev ? Math.min(prev.runway ?? 24, 24) : runway,
      format: (v) => v >= 24 ? '24+ mo' : `${v} mo`,
      color: runway < 4 ? 'var(--color-danger)' : runway < 8 ? 'var(--color-caution)' : 'var(--color-growth)',
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div
        className="text-[10px] uppercase tracking-widest font-medium mb-3"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
      >
        Company Spotlight
      </div>

      <div className="flex flex-col gap-2.5 flex-1">
        {metrics.map((m, i) => {
          const delta = m.value - m.prev;
          const showDelta = prev && delta !== 0;
          const deltaPositive = m.invertDelta ? delta < 0 : delta > 0;

          return (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded"
              style={{ background: 'var(--color-raised)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{m.icon}</span>
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
