import { useGameStore } from '../store.js';
import { useState } from 'react';
import ForecastChart from './components/ForecastChart.jsx';
import DeltaTable from './components/DeltaTable.jsx';
import { generateSaaSForecast } from '../engine/forecastEngine.js';

export default function BoardMeeting() {
  const { boardData, classConfig, state, assumptions, closeBoardMeeting, reviseForecast } = useGameStore();
  const [showRevise, setShowRevise] = useState(false);
  const [revised, setRevised] = useState(null);

  if (!boardData || !state) return null;

  const accent = classConfig?.color ?? 'var(--color-saas)';

  const handleRevise = () => {
    if (!revised) {
      // Initialize with current actuals as new assumptions
      setRevised({
        price: state.price ?? assumptions.price ?? 49,
        churnRate: Math.round((state.churn ?? 5) * 10) / 10,
        targetCAC: state.cac ?? assumptions.targetCAC ?? 80,
        conversionRate: Math.round((state.conversionRate ?? 15) * 10) / 10,
        pipelineGrowth: state.pipelineGrowth ?? assumptions.pipelineGrowth ?? 20,
        supportCost: state.supportCost ?? assumptions.supportCost ?? 5,
      });
    }
    setShowRevise(!showRevise);
  };

  const handleSaveRevision = () => {
    if (revised && reviseForecast) {
      reviseForecast(revised);
    }
    setShowRevise(false);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--color-canvas)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] uppercase tracking-widest font-medium"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              Board Meeting Q{boardData.quarter}
            </span>
            <span
              className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm"
              style={{ color: accent, background: `${accent}10`, fontFamily: 'var(--font-mono)' }}
            >
              {classConfig?.name}
            </span>
            <span
              className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm"
              style={{ color: 'var(--color-text-muted)', background: 'var(--color-raised)', fontFamily: 'var(--font-mono)' }}
            >
              Month {state.month}
            </span>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            Forecast vs. Reality
          </h1>
        </div>

        {/* Revenue Chart */}
        <div className="p-4 rounded mb-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <ForecastChart metric="totalMRR" label="Monthly Recurring Revenue" />
        </div>

        {/* Cash Chart */}
        <div className="p-4 rounded mb-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <ForecastChart metric="cash" label="Cash Position" />
        </div>

        {/* Delta Table */}
        <div className="p-4 rounded mb-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="text-[10px] uppercase tracking-widest mb-3 font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Forecast vs. Actual
          </div>
          <DeltaTable deltas={boardData.deltas} />
          <div className="flex gap-4 mt-2 text-[9px]" style={{ fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--color-danger)' }}>Red = &gt;20% below forecast</span>
            <span style={{ color: 'var(--color-growth)' }}>Green = &gt;20% above forecast</span>
          </div>
        </div>

        {/* Board Feedback */}
        <div className="p-4 rounded mb-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="text-[10px] uppercase tracking-widest mb-3 font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Board Feedback
          </div>
          {boardData.feedback.map((f, i) => {
            const toneColor = f.tone === 'positive' ? 'var(--color-growth)' : f.tone === 'critical' ? 'var(--color-danger)' : 'var(--color-text-secondary)';
            return (
              <div key={i} className="mb-3">
                <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {f.speaker}:
                </span>
                <p className="text-sm leading-relaxed mt-0.5" style={{ color: toneColor }}>
                  "{f.text}"
                </p>
              </div>
            );
          })}
        </div>

        {/* Forecast Revision */}
        {showRevise && revised && (
          <div className="p-4 rounded mb-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-plan)' }}>
            <div className="text-[10px] uppercase tracking-widest mb-3 font-medium" style={{ color: 'var(--color-plan)', fontFamily: 'var(--font-mono)' }}>
              Revise Forecast Assumptions
            </div>
            <p className="text-[11px] mb-3" style={{ color: 'var(--color-text-muted)' }}>
              Update your assumptions based on what you've learned. The forecast line will adjust.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {classConfig.assumptions.map(a => (
                <div key={a.key}>
                  <label className="text-[10px] font-medium block mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                    {a.label}
                  </label>
                  <input
                    type="number"
                    value={revised[a.key] ?? a.default}
                    onChange={e => setRevised({ ...revised, [a.key]: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-[11px] rounded"
                    style={{
                      background: 'var(--color-canvas)',
                      border: '1px solid var(--color-border)',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-plan)',
                    }}
                    min={a.min}
                    max={a.max}
                    step={a.step}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSaveRevision}
              className="mt-3 px-4 py-2 rounded text-[11px] font-bold cursor-pointer"
              style={{
                background: 'var(--color-plan)',
                color: '#fff',
                border: 'none',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Update Forecast
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleRevise}
            className="flex-1 py-3 rounded text-sm font-bold cursor-pointer transition-colors duration-150"
            style={{
              background: 'var(--color-raised)',
              color: 'var(--color-plan)',
              border: '1px solid var(--color-plan)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {showRevise ? 'Cancel Revision' : 'Revise Forecast'}
          </button>
          <button
            onClick={closeBoardMeeting}
            className="flex-1 py-3 rounded text-sm font-bold cursor-pointer transition-colors duration-150"
            style={{
              background: accent,
              color: '#fff',
              border: 'none',
              fontFamily: 'var(--font-display)',
            }}
          >
            Continue to Q{boardData.quarter + 1} →
          </button>
        </div>

        <p className="text-center text-[10px] mt-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          Every board meeting ends with an updated plan. Revising your forecast is realism, not failure.
        </p>
      </div>
    </div>
  );
}
