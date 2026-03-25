import { useGameStore } from '../../store.js';

export default function EventCard() {
  const { currentEvent, classConfig, makeChoice, state } = useGameStore();
  if (!currentEvent) return null;

  const choices = currentEvent.getChoices ? currentEvent.getChoices('saas') : [];
  const accent = classConfig?.color ?? 'var(--color-saas)';

  return (
    <div>
      <div
        className="text-[10px] uppercase tracking-widest mb-2 font-medium"
        style={{ color: accent, fontFamily: 'var(--font-mono)' }}
      >
        Decision {currentEvent.apCost ? `· ${currentEvent.apCost} AP` : ''}
      </div>

      <h2 className="text-lg font-bold mb-1 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        {currentEvent.title}
      </h2>

      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
        {currentEvent.text}
      </p>

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

      <div className="mt-3 text-[10px]" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        Outcomes vary ±30% each run
      </div>
    </div>
  );
}
