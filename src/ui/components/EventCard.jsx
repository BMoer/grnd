import { useGameStore } from '../../store.js';

export default function EventCard() {
  const { currentEvent, classConfig, makeChoice, skipEvent, state, ap, monthEvents, monthEventIndex } = useGameStore();
  if (!currentEvent) return null;

  const choices = currentEvent.getChoices ? currentEvent.getChoices('saas') : [];
  const accent = classConfig?.color ?? 'var(--color-saas)';
  const eventText = currentEvent.getText ? currentEvent.getText(state) : currentEvent.text;

  // Check if ANY choice is affordable (for messaging)
  const anyAffordable = choices.some(ch => ap >= (ch.apCost ?? 1));

  return (
    <div>
      {/* Event counter */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-[10px] uppercase tracking-widest font-medium"
          style={{ color: accent, fontFamily: 'var(--font-mono)' }}
        >
          Event {monthEventIndex + 1}/{monthEvents.length}
        </span>
      </div>

      <h2 className="text-lg font-bold mb-1.5 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        {currentEvent.title}
      </h2>

      <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-text-secondary)' }}>
        {eventText}
      </p>

      <div className="flex flex-col gap-2">
        {choices.map((ch, i) => {
          const choiceCost = ch.apCost ?? 1;
          const canAfford = ap >= choiceCost;

          return (
            <button
              key={i}
              onClick={() => canAfford && makeChoice(ch)}
              className="text-left px-4 py-3.5 rounded text-sm leading-snug transition-colors duration-150 min-h-[44px]"
              style={{
                background: canAfford ? 'var(--color-surface)' : 'var(--color-raised)',
                border: `1px solid ${canAfford ? 'var(--color-border)' : 'var(--color-border)'}`,
                color: canAfford ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
                opacity: canAfford ? 1 : 0.5,
                cursor: canAfford ? 'pointer' : 'not-allowed',
              }}
              onMouseOver={e => { if (canAfford) e.currentTarget.style.borderColor = accent; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span
                    className="text-[10px] font-bold mr-2"
                    style={{ color: canAfford ? accent : 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    [{String.fromCharCode(65 + i)}]
                  </span>
                  {ch.text}
                </div>
                <span
                  className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-medium shrink-0"
                  style={{
                    color: canAfford ? 'var(--color-text-secondary)' : 'var(--color-danger)',
                    background: canAfford ? 'var(--color-raised)' : 'var(--color-danger)10',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {choiceCost} AP
                </span>
              </div>
              {!canAfford && (
                <div className="text-[10px] mt-1" style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>
                  Not enough AP
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Skip option — always available, costs 0 AP */}
      <button
        onClick={skipEvent}
        className="mt-3 text-[11px] cursor-pointer underline"
        style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', fontFamily: 'var(--font-mono)' }}
      >
        Skip (default outcome — 0 AP)
      </button>

      {!anyAffordable && (
        <div className="mt-3 p-3 rounded" style={{ background: 'var(--color-danger)08', border: '1px solid var(--color-danger)30' }}>
          <div className="text-[10px] uppercase tracking-widest mb-1 font-medium" style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>
            No AP for any choice
          </div>
          <p className="text-[11px]" style={{ color: 'var(--color-danger)' }}>
            All options cost more AP than you have. Skip to accept the default outcome.
          </p>
        </div>
      )}

      <div className="mt-3 text-[10px]" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        Outcomes vary ±30% each run
      </div>
    </div>
  );
}
