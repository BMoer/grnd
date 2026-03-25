import { useGameStore } from '../store.js';
import BusinessTable from './components/BusinessTable.jsx';
import RunwayBar from './components/RunwayBar.jsx';
import PMFBar from './components/PMFBar.jsx';
import EventCard from './components/EventCard.jsx';
import WorldEventBanner from './components/WorldEventBanner.jsx';
import LogPanel from './components/LogPanel.jsx';

export default function GameScreen() {
  const { state, classConfig, currentEvent, currentWorldEvent, history, decisions, restart } = useGameStore();
  if (!state || !classConfig) return null;

  const accent = classConfig.color;
  const netBurn = Math.max(0, (state.burnRate ?? 0) - (state.revenue ?? 0));
  const runway = netBurn > 0 ? Math.floor((state.cash ?? 0) / netBurn) : 99;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-canvas)' }}>
      {/* Header */}
      <header
        className="flex justify-between items-center px-4 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: accent, fontSize: 14 }}>{classConfig.icon}</span>
          <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {classConfig.name}
          </span>
          <span
            className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm"
            style={{ color: accent, background: `${accent}10`, fontFamily: 'var(--font-mono)' }}
          >
            M{state.month}
          </span>
        </div>
        <button
          onClick={restart}
          className="text-[10px] px-3 py-1 rounded cursor-pointer"
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Restart
        </button>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left: Events + Log */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Bars */}
          <div className="px-4 py-3 flex flex-col gap-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <RunwayBar value={Math.min(runway, 24)} />
            <PMFBar value={state.pmf ?? 0} />
          </div>

          {/* Event area */}
          <div className="flex-1 overflow-auto p-4">
            {currentWorldEvent ? (
              <WorldEventBanner />
            ) : currentEvent ? (
              <EventCard />
            ) : (
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                Processing...
              </div>
            )}
          </div>

          {/* Log */}
          <div className="px-4 py-2 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
            <LogPanel />
          </div>
        </div>

        {/* Right: Business Table */}
        <aside
          className="w-full md:w-80 overflow-auto p-3 shrink-0"
          style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
        >
          <div className="text-[10px] uppercase tracking-widest mb-2 font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Business Model
          </div>

          <div className="p-2 rounded mb-3 text-[10px] leading-relaxed" style={{ background: 'var(--color-raised)', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
            <div>Revenue: <span style={{ color: accent }}>{classConfig.model.revenueType}</span></div>
            <div>Key: <span style={{ color: 'var(--color-text)' }}>{classConfig.model.keyMetric}</span></div>
          </div>

          <BusinessTable />

          {/* Delta */}
          {history.length > 1 && (() => {
            const curr = history[history.length - 1];
            const prev = history[history.length - 2];
            const cashDelta = (curr.cash ?? 0) - (prev.cash ?? 0);
            const revDelta = (curr.totalMRR ?? curr.revenue ?? 0) - (prev.totalMRR ?? prev.revenue ?? 0);
            return (
              <div className="mt-3 p-2 rounded text-[10px]" style={{ background: 'var(--color-raised)', fontFamily: 'var(--font-mono)' }}>
                <div style={{ color: 'var(--color-text-muted)' }} className="mb-1">Delta</div>
                <div style={{ color: cashDelta >= 0 ? 'var(--color-growth)' : 'var(--color-danger)' }}>
                  Cash: {cashDelta >= 0 ? '+' : ''}€{cashDelta.toLocaleString('de-DE')}
                </div>
                <div style={{ color: revDelta >= 0 ? 'var(--color-growth)' : 'var(--color-caution)' }}>
                  MRR: {revDelta >= 0 ? '+' : ''}€{revDelta.toLocaleString('de-DE')}
                </div>
                <div style={{ color: 'var(--color-text)' }}>
                  Net burn: €{netBurn.toLocaleString('de-DE')}/mo
                </div>
              </div>
            );
          })()}

          {/* Decision Log */}
          {decisions.length > 0 && (
            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-widest mb-2 font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                Decision Log
              </div>
              {decisions.slice(-5).map((d, i) => (
                <div
                  key={i}
                  className="text-[10px] mb-1 leading-snug py-1"
                  style={{
                    color: d.isWorld ? 'var(--color-caution)' : 'var(--color-text-secondary)',
                    borderBottom: '1px solid var(--color-border)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-muted)' }}>M{d.month}</span>{' '}
                  {d.isWorld ? `${d.event}` : d.choice.slice(0, 50) + (d.choice.length > 50 ? '...' : '')}
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
