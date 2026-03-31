import { useState } from 'react';
import { useGameStore } from '../store.js';
import KPITracker from './components/KPITracker.jsx';
import RunwayBar from './components/RunwayBar.jsx';
import PMFBar from './components/PMFBar.jsx';
import EventCard from './components/EventCard.jsx';
import WorldEventBanner from './components/WorldEventBanner.jsx';
import CompanySpotlight from './components/CompanySpotlight.jsx';
import LogPanel from './components/LogPanel.jsx';

export default function GameScreen() {
  const {
    state, classConfig, currentEvent, currentWorldEvent,
    history, decisions, restart, ap, maxAP, lastFeedback,
  } = useGameStore();
  const [mobileView, setMobileView] = useState('event'); // event | kpi | spotlight
  if (!state || !classConfig) return null;

  const accent = classConfig.color;
  const effectiveMaxAP = state.maxAP ?? maxAP;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-canvas)' }}>
      {/* Header */}
      <header
        className="flex justify-between items-center px-3 md:px-4 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <span style={{ color: accent, fontSize: 16 }}>{classConfig.icon}</span>
          <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {classConfig.name}
          </span>
          <span
            className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-medium"
            style={{ color: accent, background: `${accent}10`, fontFamily: 'var(--font-mono)' }}
          >
            M{state.month}
          </span>

          {/* AP Display */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              AP
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: effectiveMaxAP }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    background: i < ap ? accent : 'var(--color-border)',
                    transition: 'background 300ms ease',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile view toggles */}
          <div className="md:hidden flex gap-1">
            {[
              { key: 'event', label: '📋' },
              { key: 'kpi', label: '📊' },
              { key: 'spotlight', label: '🏢' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setMobileView(key)}
                className="text-[10px] px-2 py-1.5 rounded cursor-pointer"
                style={{
                  background: mobileView === key ? accent : 'none',
                  border: `1px solid ${mobileView === key ? accent : 'var(--color-border)'}`,
                  color: mobileView === key ? '#fff' : 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={restart}
            className="text-[10px] px-3 py-1.5 rounded cursor-pointer"
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Restart
          </button>
        </div>
      </header>

      {/* Business Model KPI Tracker — top strip */}
      <div className={`shrink-0 ${mobileView === 'kpi' ? '' : 'hidden md:block'}`}>
        <div className="flex items-center gap-2 px-3 md:px-4 pt-2 pb-1">
          <span
            className="text-[10px] uppercase tracking-widest font-medium"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            Business Model
          </span>
          <div className="text-[10px] px-2 py-0.5 rounded-sm" style={{ background: 'var(--color-raised)', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
            {classConfig.model.revenueType} · {classConfig.model.keyMetric}
          </div>
        </div>
        <KPITracker />
      </div>

      {/* Bars */}
      <div className="px-3 md:px-4 py-2 flex flex-col gap-1.5 shrink-0 md:flex-row md:gap-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex-1"><RunwayBar value={Math.min(state.runway ?? 24, 24)} /></div>
        <div className="flex-1"><PMFBar value={state.pmf ?? 0} /></div>
      </div>

      {/* Main content: Events (left) + Company Spotlight (right) */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left: Events + Log */}
        <div className={`flex-1 flex flex-col overflow-hidden min-w-0 ${mobileView !== 'event' && mobileView !== 'kpi' ? 'hidden md:flex' : ''}`}>
          {/* Event area */}
          <div className="flex-1 overflow-auto p-3 md:p-4">
            {lastFeedback && !currentEvent && !currentWorldEvent ? (
              <div
                className="p-3 md:p-4 rounded"
                style={{
                  background: lastFeedback.type === 'default' ? 'var(--color-danger)06' : 'var(--color-surface)',
                  border: `1px solid ${lastFeedback.type === 'default' ? 'var(--color-danger)' : 'var(--color-border)'}`,
                }}
              >
                <p className="text-sm leading-relaxed" style={{ color: lastFeedback.type === 'default' ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
                  {lastFeedback.text}
                </p>
              </div>
            ) : currentWorldEvent ? (
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
          <div className="px-3 md:px-4 py-2 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
            <LogPanel />
          </div>
        </div>

        {/* Right: Company Spotlight */}
        <aside
          className={`w-full md:w-72 lg:w-80 overflow-auto p-3 shrink-0 ${mobileView === 'spotlight' ? '' : 'hidden md:block'}`}
          style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
        >
          <CompanySpotlight />

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
                    color: d.isWorld ? 'var(--color-caution)' : d.wasDefault ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                    borderBottom: '1px solid var(--color-border)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-muted)' }}>M{d.month}</span>{' '}
                  {d.isWorld ? `${d.event}` : d.wasDefault ? `✗ ${d.event}` : d.choice.slice(0, 50) + (d.choice.length > 50 ? '...' : '')}
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
