import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceDot } from 'recharts';
import { useGameStore } from '../../store.js';

// Truncate event name for chart label
function shortLabel(name) {
  if (name.length <= 18) return name;
  return name.slice(0, 16) + '…';
}

export default function ForecastChart({ metric = 'totalMRR', label = 'MRR' }) {
  const { forecast, history, classConfig, decisions } = useGameStore();
  if (!forecast.length || !history.length) return null;

  const accent = classConfig?.color ?? '#3A8A5C';
  const maxMonth = Math.max(history.length - 1, 6);

  // Build chart data
  const data = [];
  for (let m = 0; m <= Math.min(maxMonth + 3, 24); m++) {
    const point = { month: `M${m}` };
    if (forecast[m]) point.forecast = forecast[m][metric] ?? 0;
    if (m < history.length) point.actual = history[m][metric] ?? 0;
    data.push(point);
  }

  // Key events: pick most impactful ones per month (max 6 total to avoid clutter)
  const eventsByMonth = {};
  for (const d of decisions) {
    if (!eventsByMonth[d.month] || d.isWorld || d.wasDefault) {
      eventsByMonth[d.month] = d;
    }
  }
  const chartEvents = Object.values(eventsByMonth)
    .filter((d, i) => d.isWorld || d.wasDefault || i % 2 === 0) // show world events, skipped, and every other regular event
    .slice(-8);

  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest mb-2 font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        {label}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 20, right: 5, bottom: 5, left: 5 }}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontFamily: 'Space Mono, monospace' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontFamily: 'Space Mono, monospace' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `€${Math.round(v/1000)}K` : `€${v}`}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="var(--color-plan)"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            dot={false}
            name="Forecast"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke={accent}
            strokeWidth={2}
            dot={false}
            name="Actual"
            animationDuration={800}
          />
          {/* Event annotations with labels */}
          {chartEvents.map((evt, i) => {
            const d = data.find(p => p.month === `M${evt.month}`);
            if (!d || d.actual === undefined) return null;
            const color = evt.isWorld ? 'var(--color-caution)'
              : evt.wasDefault ? 'var(--color-danger)'
              : 'var(--color-text-muted)';
            // Alternate label position to avoid overlap
            const above = i % 2 === 0;
            return (
              <ReferenceDot
                key={i}
                x={`M${evt.month}`}
                y={d.actual}
                r={3}
                fill={color}
                stroke="var(--color-canvas)"
                strokeWidth={1}
                label={{
                  value: shortLabel(evt.event),
                  position: above ? 'top' : 'bottom',
                  style: { fontSize: 7, fill: color, fontFamily: 'Space Mono, monospace' },
                }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex gap-4 mt-1 flex-wrap">
        <span className="text-[9px] flex items-center gap-1" style={{ color: 'var(--color-plan)', fontFamily: 'var(--font-mono)' }}>
          <span style={{ borderBottom: '1px dashed var(--color-plan)', width: 16, display: 'inline-block' }} />
          Forecast
        </span>
        <span className="text-[9px] flex items-center gap-1" style={{ color: accent, fontFamily: 'var(--font-mono)' }}>
          <span style={{ borderBottom: `2px solid ${accent}`, width: 16, display: 'inline-block' }} />
          Actual
        </span>
        {chartEvents.length > 0 && (
          <>
            <span className="text-[9px] flex items-center gap-1" style={{ color: 'var(--color-caution)', fontFamily: 'var(--font-mono)' }}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--color-caution)' }} />
              World Event
            </span>
            <span className="text-[9px] flex items-center gap-1" style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--color-danger)' }} />
              Skipped
            </span>
          </>
        )}
      </div>
    </div>
  );
}
