import { useGameStore } from '../../store.js';

/**
 * Dramatic interstitial before the board meeting screen.
 * Shows in-game as an overlay on the GameScreen.
 */
export default function BoardMeetingPopup() {
  const { boardData, classConfig, state, startBoardMeeting } = useGameStore();
  if (!boardData || !classConfig || !state) return null;

  const accent = classConfig.color;
  const quarter = boardData.quarter;
  const month = state.month;

  // Quick snapshot for the popup
  const mrr = state.totalMRR ?? 0;
  const cash = state.cash ?? 0;
  const runway = state.runway ?? 99;
  const pmf = state.pmf ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26, 26, 26, 0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-md rounded-lg overflow-hidden"
        style={{
          background: 'var(--color-canvas)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
        }}
      >
        {/* Accent bar */}
        <div style={{ height: 3, background: accent }} />

        <div className="p-6">
          {/* Label */}
          <div
            className="text-[10px] uppercase tracking-[0.15em] font-medium mb-2"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            End of Quarter {quarter}
          </div>

          {/* Title */}
          <h2
            className="text-xl font-bold tracking-tight mb-1"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            Board Meeting
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
            Month {month}. Time to compare your forecast to reality.
          </p>

          {/* Key numbers going in */}
          <div
            className="grid grid-cols-2 gap-3 mb-6"
          >
            {[
              { label: 'MRR', value: `€${mrr.toLocaleString('en-US')}` },
              { label: 'Cash', value: `€${(cash / 1000).toFixed(0)}K` },
              { label: 'Runway', value: runway > 24 ? '24+ mo' : `${runway} mo`, color: runway < 4 ? 'var(--color-danger)' : runway < 8 ? 'var(--color-caution)' : undefined },
              { label: 'PMF Score', value: `${pmf}`, color: pmf > 65 ? 'var(--color-growth)' : pmf < 40 ? 'var(--color-danger)' : undefined },
            ].map((m, i) => (
              <div
                key={i}
                className="p-2.5 rounded"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <div
                  className="text-[9px] uppercase tracking-widest font-medium mb-0.5"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  {m.label}
                </div>
                <div
                  className="text-sm font-bold tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)', color: m.color || 'var(--color-text)' }}
                >
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Enter button */}
          <button
            onClick={startBoardMeeting}
            className="w-full py-3 rounded text-sm font-bold cursor-pointer transition-colors duration-150"
            style={{
              background: accent,
              color: '#fff',
              border: 'none',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.02em',
            }}
          >
            Enter Board Meeting →
          </button>

          <p
            className="text-center text-[10px] mt-3"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            Your forecast will be compared to actual results.
          </p>
        </div>
      </div>
    </div>
  );
}
