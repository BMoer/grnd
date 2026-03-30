import { useGameStore } from '../store.js';
import ForecastChart from './components/ForecastChart.jsx';
import { exportToExcel } from '../export/excelExport.js';

export default function EndScreen() {
  const { result, state, classConfig, history, decisions, forecast, assumptions, founderProfile, restart } = useGameStore();
  if (!result || !state) return null;

  const accent = classConfig?.color ?? 'var(--color-saas)';
  const resultColor = result === 'pmf' ? 'var(--color-growth)' : result === 'dead' ? 'var(--color-danger)' : 'var(--color-caution)';

  const resultTitle = {
    pmf: 'Product-Market Fit',
    dead: 'Game Over',
    survived: 'Survived',
  }[result];

  const resultText = {
    pmf: 'Users pull the product from your hands. Revenue grows organically. This is the moment.',
    dead: `Month ${state.month}. Cash hit zero. ${(state.pmf ?? 0) > 25 ? 'Something was building, but the money ran out first.' : 'The core assumptions never validated.'}`,
    survived: `€${(state.cash ?? 0).toLocaleString('de-DE')} left. PMF: ${state.pmf ?? 0}/100. ${(state.pmf ?? 0) > 35 ? 'Close.' : 'Alive, but the hard questions remain.'}`,
  }[result];

  const decisionCount = decisions.filter(d => !d.isWorld).length;
  const worldCount = decisions.filter(d => d.isWorld).length;

  const handleExport = () => {
    exportToExcel(classConfig, history, decisions, forecast, assumptions);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-canvas)' }}>
      <div className="w-full max-w-2xl">
        {/* Result */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold mb-2" style={{ color: resultColor, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            {resultTitle}
          </div>
          <p className="text-sm leading-relaxed max-w-md mx-auto mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            {resultText}
          </p>
          <div className="text-[11px]" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            {decisionCount} decisions made · {worldCount} world events survived · {state.month} months played
          </div>
        </div>

        {/* Final metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <MetricCard label="Final Cash" value={`€${(state.cash ?? 0).toLocaleString('de-DE')}`} color={(state.cash ?? 0) > 0 ? 'var(--color-growth)' : 'var(--color-danger)'} />
          <MetricCard label="Final MRR" value={`€${(state.totalMRR ?? 0).toLocaleString('de-DE')}`} color={accent} />
          <MetricCard label="Customers" value={`${state.customers ?? 0}`} color={accent} />
          <MetricCard label="PMF Score" value={`${state.pmf ?? 0}/100`} color={(state.pmf ?? 0) >= 60 ? 'var(--color-growth)' : 'var(--color-caution)'} />
        </div>

        {/* Founder Profile (for workshop debrief) */}
        {founderProfile && (
          <div className="p-4 rounded mb-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="text-[10px] uppercase tracking-widest mb-2 font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Your Founders
            </div>
            <div className="flex flex-wrap gap-3 text-[11px]" style={{ fontFamily: 'var(--font-mono)' }}>
              <span>Difficulty: <span style={{ color: founderProfile.difficulty <= 4 ? 'var(--color-growth)' : founderProfile.difficulty <= 6 ? 'var(--color-caution)' : 'var(--color-danger)' }}>{founderProfile.difficulty}/10</span></span>
              <span>Fundraising: <span style={{ color: founderProfile.engineModifiers?.fundraisingSuccessRate < 0.8 ? 'var(--color-danger)' : 'var(--color-text)' }}>×{(founderProfile.engineModifiers?.fundraisingSuccessRate ?? 1).toFixed(2)}</span></span>
              {founderProfile.background && (
                <>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {founderProfile.background.gender} · {founderProfile.background.class} · {founderProfile.background.ethnicity} · {founderProfile.background.age}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="p-4 rounded mb-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <ForecastChart metric="totalMRR" label="MRR: Your Plan vs. Reality" />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={handleExport}
            className="px-6 py-3 rounded text-sm font-bold cursor-pointer"
            style={{ background: accent, color: '#fff', border: 'none', fontFamily: 'var(--font-display)' }}
          >
            Export Spreadsheet
          </button>
          <button
            onClick={restart}
            className="px-6 py-3 rounded text-sm font-bold cursor-pointer"
            style={{ background: 'var(--color-raised)', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-display)' }}
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div className="p-3 rounded" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        {label}
      </div>
      <div className="text-base font-bold tabular-nums" style={{ color, fontFamily: 'var(--font-mono)' }}>
        {value}
      </div>
    </div>
  );
}
