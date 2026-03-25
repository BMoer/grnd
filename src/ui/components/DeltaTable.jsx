/**
 * Forecast vs. Actual delta table for board meetings.
 */
export default function DeltaTable({ deltas }) {
  if (!deltas?.length) return null;

  const formatValue = (val, format) => {
    if (format === '€') return `€${val.toLocaleString('de-DE')}`;
    if (format === '%') return `${val}%`;
    if (format === 'x') return `${val}x`;
    return `${val}`;
  };

  const statusColor = (status) => {
    if (status === 'above') return 'var(--color-growth)';
    if (status === 'below') return 'var(--color-danger)';
    return 'var(--color-text)';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['Metric', 'Forecast', 'Actual', 'Delta'].map((h, i) => (
              <th
                key={h}
                className={`${i === 0 ? 'text-left' : 'text-right'} px-2 py-1.5 text-[10px] uppercase tracking-widest font-medium`}
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--color-border)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {deltas.map((d) => (
            <tr key={d.key}>
              <td className="text-left px-2 py-1.5 text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                {d.label}
              </td>
              <td className="text-right px-2 py-1.5 text-[11px] tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-plan)' }}>
                {formatValue(d.forecast, d.format)}
              </td>
              <td className="text-right px-2 py-1.5 text-[11px] tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: statusColor(d.status), fontWeight: d.status !== 'neutral' ? 600 : 400 }}>
                {formatValue(d.actual, d.format)}
              </td>
              <td className="text-right px-2 py-1.5 text-[11px] tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: statusColor(d.status) }}>
                {d.deltaPct > 0 ? '+' : ''}{d.deltaPct}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
