import { useGameStore } from '../store.js';
import { generateSaaSForecast } from '../engine/forecastEngine.js';
import { useMemo } from 'react';

export default function SetupScreen() {
  const { classConfig, assumptions, updateAssumption, startGame, restart } = useGameStore();
  if (!classConfig) return null;

  // Live forecast preview
  const forecast = useMemo(() => generateSaaSForecast(assumptions), [assumptions]);
  const month12 = forecast[12] ?? {};
  const month6 = forecast[6] ?? {};

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-canvas)' }}>
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={restart}
            className="text-[10px] uppercase tracking-widest mb-3 cursor-pointer"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', background: 'none', border: 'none' }}
          >
            ← Back
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" style={{ color: classConfig.color }}>{classConfig.icon}</span>
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              {classConfig.name}
            </h1>
          </div>

          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            {classConfig.backstory}
          </p>

          <div className="flex gap-4 text-[11px] mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
            {classConfig.founders.map(f => (
              <span key={f.name} style={{ color: 'var(--color-text-muted)' }}>
                {f.name} <span style={{ color: 'var(--color-text-secondary)' }}>({f.role}, {f.background})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Assumptions */}
        <div
          className="text-[10px] uppercase tracking-widest mb-3 font-medium"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          Set your assumptions
        </div>

        <div className="flex flex-col gap-4 mb-8">
          {classConfig.assumptions.map(a => (
            <div key={a.key} className="p-3 rounded" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-sm font-medium">{a.label}</label>
                <span
                  className="text-sm tabular-nums font-bold"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-plan)' }}
                >
                  {a.unit === '€' ? `€${assumptions[a.key]}` : a.unit === '%' ? `${assumptions[a.key]}%` : assumptions[a.key]}
                </span>
              </div>
              <input
                type="range"
                min={a.min}
                max={a.max}
                step={a.step}
                value={assumptions[a.key] ?? a.default}
                onChange={e => updateAssumption(a.key, Number(e.target.value))}
                className="w-full h-1 rounded-sm appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--color-plan) ${((assumptions[a.key] - a.min) / (a.max - a.min)) * 100}%, var(--color-border) 0%)`,
                  accentColor: 'var(--color-plan)',
                }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-[9px]" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {a.unit === '€' ? `€${a.min}` : a.unit === '%' ? `${a.min}%` : a.min}
                </span>
                <span className="text-[9px]" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {a.unit === '€' ? `€${a.max}` : a.unit === '%' ? `${a.max}%` : a.max}
                </span>
              </div>
              <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{a.hint}</p>
            </div>
          ))}
        </div>

        {/* Forecast Preview */}
        <div className="p-4 rounded mb-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="text-[10px] uppercase tracking-widest mb-2 font-medium" style={{ color: 'var(--color-plan)', fontFamily: 'var(--font-mono)' }}>
            Your forecast (if assumptions hold)
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ForecastStat label="M6 MRR" value={`€${month6.totalMRR?.toLocaleString('de-DE') ?? '0'}`} />
            <ForecastStat label="M12 MRR" value={`€${month12.totalMRR?.toLocaleString('de-DE') ?? '0'}`} />
            <ForecastStat label="M12 Customers" value={`${month12.customers ?? 0}`} />
            <ForecastStat label="M12 Cash" value={`€${month12.cash?.toLocaleString('de-DE') ?? '0'}`} sub={month12.cash < 0 ? 'Dead before M12' : undefined} />
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startGame}
          className="w-full py-3 rounded text-sm font-bold cursor-pointer transition-colors duration-150"
          style={{
            background: classConfig.color,
            color: '#fff',
            border: 'none',
            fontFamily: 'var(--font-display)',
          }}
        >
          Start Game →
        </button>

        <p className="text-center text-[10px] mt-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          Reality won't match your forecast. That's the point.
        </p>
      </div>
    </div>
  );
}

function ForecastStat({ label, value, sub }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        {label}
      </div>
      <div className="text-sm font-bold tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-plan)' }}>
        {value}
      </div>
      {sub && <div className="text-[9px]" style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>{sub}</div>}
    </div>
  );
}
