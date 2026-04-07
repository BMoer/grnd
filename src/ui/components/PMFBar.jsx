const WIN_THRESHOLD = 85;

export default function PMFBar({ value, max = 100 }) {
  const pct = Math.min(100, (value / max) * 100);
  const thresholdPct = (WIN_THRESHOLD / max) * 100;
  const color = value >= WIN_THRESHOLD ? 'var(--color-growth)' : value >= 50 ? 'var(--color-caution)' : 'var(--color-plan)';

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          PMF
        </span>
        <span className="text-[12px] tabular-nums" style={{ color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          {value}/{max}
          {value < WIN_THRESHOLD && (
            <span className="text-[9px] ml-1" style={{ color: 'var(--color-text-muted)' }}>
              (Win: {WIN_THRESHOLD}+)
            </span>
          )}
        </span>
      </div>
      <div className="h-1 rounded-sm overflow-hidden relative" style={{ background: 'var(--color-border)' }}>
        <div
          className="h-full rounded-sm"
          style={{ width: `${pct}%`, background: color, transition: 'width 300ms ease' }}
        />
        {/* Win threshold marker */}
        <div
          className="absolute top-0 h-full w-px"
          style={{ left: `${thresholdPct}%`, background: 'var(--color-growth)', opacity: 0.5 }}
        />
      </div>
    </div>
  );
}
