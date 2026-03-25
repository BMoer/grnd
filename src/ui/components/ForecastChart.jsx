import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useGameStore } from '../../store.js';

export default function ForecastChart({ metric = 'totalMRR', label = 'MRR' }) {
  const { forecast, history, classConfig } = useGameStore();
  if (!forecast.length || !history.length) return null;

  const accent = classConfig?.color ?? '#3A8A5C';
  const maxMonth = Math.max(history.length - 1, 6);

  // Build chart data: forecast + actual
  const data = [];
  for (let m = 0; m <= Math.min(maxMonth + 3, 24); m++) {
    const point = { month: `M${m}` };
    if (forecast[m]) point.forecast = forecast[m][metric] ?? 0;
    if (m < history.length) point.actual = history[m][metric] ?? 0;
    data.push(point);
  }

  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest mb-2 font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        {label}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
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
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-1">
        <span className="text-[9px] flex items-center gap-1" style={{ color: 'var(--color-plan)', fontFamily: 'var(--font-mono)' }}>
          <span style={{ borderBottom: '1px dashed var(--color-plan)', width: 16, display: 'inline-block' }} />
          Forecast
        </span>
        <span className="text-[9px] flex items-center gap-1" style={{ color: accent, fontFamily: 'var(--font-mono)' }}>
          <span style={{ borderBottom: `2px solid ${accent}`, width: 16, display: 'inline-block' }} />
          Actual
        </span>
      </div>
    </div>
  );
}
