export default function RunwayBar({ value, max = 24 }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = value > 8 ? 'var(--color-growth)' : value > 4 ? 'var(--color-caution)' : 'var(--color-danger)';

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          Runway
        </span>
        <span className="text-[12px] tabular-nums" style={{ color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          {value > 24 ? '24+' : value} mo
        </span>
      </div>
      <div className="h-1 rounded-sm overflow-hidden" style={{ background: 'var(--color-border)' }}>
        <div
          className="h-full rounded-sm"
          style={{ width: `${pct}%`, background: color, transition: 'width 300ms ease' }}
        />
      </div>
    </div>
  );
}
