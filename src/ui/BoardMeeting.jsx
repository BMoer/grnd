import { useGameStore } from '../store.js';
import ForecastChart from './components/ForecastChart.jsx';
import DeltaTable from './components/DeltaTable.jsx';

export default function BoardMeeting() {
  const { boardData, classConfig, state, closeBoardMeeting } = useGameStore();
  if (!boardData || !state) return null;

  const accent = classConfig?.color ?? 'var(--color-saas)';

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

        {/* Actions */}
        <button
          onClick={closeBoardMeeting}
          className="w-full py-3 rounded text-sm font-bold cursor-pointer transition-colors duration-150"
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
    </div>
  );
}
