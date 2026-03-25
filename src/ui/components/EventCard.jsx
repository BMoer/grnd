import { useGameStore } from '../../store.js';

export default function EventCard() {
  const { currentEvent, classConfig, makeChoice, skipEvent, state, ap, monthEvents, monthEventIndex } = useGameStore();
  if (!currentEvent) return null;

  const choices = currentEvent.getChoices ? currentEvent.getChoices('saas') : [];
  const accent = classConfig?.color ?? 'var(--color-saas)';
  const canAfford = ap >= (currentEvent.apCost ?? 1);
  const eventText = currentEvent.getText ? currentEvent.getText(state) : currentEvent.text;

  return (
    <div>
      {/* Event counter + AP cost */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-[10px] uppercase tracking-widest font-medium"
          style={{ color: accent, fontFamily: 'var(--font-mono)' }}
        >
          Event {monthEventIndex + 1}/{monthEvents.length}
        </span>
        <span
          className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-medium"
          style={{
            color: canAfford ? 'var(--color-text-secondary)' : 'var(--color-danger)',
            background: canAfford ? 'var(--color-raised)' : 'var(--color-danger)10',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {currentEvent.apCost ?? 1} AP
        </span>
        {!canAfford && (
          <span className="text-[10px]" style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>
            Not enough AP
          </span>
        )}
      </div>

      <h2 className="text-lg font-bold mb-1.5 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        {currentEvent.title}
      </h2>

      <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-text-secondary)' }}>
        {eventText}
      </p>

      {canAfford ? (
        <>
          <div className="flex flex-col gap-2">
            {choices.map((ch, i) => (
              <button
                key={i}
                onClick={() => makeChoice(ch)}
                className="text-left px-4 py-3 rounded text-sm leading-snug cursor-pointer transition-colors duration-150"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-body)',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = accent; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              >
                <span
                  className="text-[10px] font-bold mr-2"
                  style={{ color: accent, fontFamily: 'var(--font-mono)' }}
                >
                  [{String.fromCharCode(65 + i)}]
                </span>
                {ch.text}
              </button>
            ))}
          </div>

          {/* Skip option */}
          <button
            onClick={skipEvent}
            className="mt-3 text-[11px] cursor-pointer underline"
            style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', fontFamily: 'var(--font-mono)' }}
          >
            Skip (default outcome)
          </button>
        </>
      ) : (
        /* Auto-defaulting — show what's happening */
        <div className="p-3 rounded" style={{ background: 'var(--color-danger)08', border: '1px solid var(--color-danger)30' }}>
          <div className="text-[10px] uppercase tracking-widest mb-1 font-medium" style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>
            No AP — Unaddressed
          </div>
          <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
            {currentEvent.defaultOutcome.feedback}
          </p>
        </div>
      )}

      <div className="mt-3 text-[10px]" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        Outcomes vary ±30% each run
      </div>
    </div>
  );
}
