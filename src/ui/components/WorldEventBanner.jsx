import { useGameStore } from '../../store.js';

export default function WorldEventBanner() {
  const { currentWorldEvent, dismissWorldEvent } = useGameStore();
  if (!currentWorldEvent) return null;

  return (
    <div
      className="rounded p-4 mb-4"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-caution)',
      }}
    >
      <div className="text-[10px] uppercase tracking-widest mb-2 font-medium" style={{ color: 'var(--color-caution)', fontFamily: 'var(--font-mono)' }}>
        World Event
      </div>

      <h3 className="text-base font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        {currentWorldEvent.title}
      </h3>

      <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--color-text-secondary)' }}>
        {currentWorldEvent.text}
      </p>

      <p className="text-[12px] mb-4 italic" style={{ color: 'var(--color-caution)', fontFamily: 'var(--font-mono)' }}>
        {currentWorldEvent.flavor}
      </p>

      <button
        onClick={dismissWorldEvent}
        className="text-sm px-4 py-2 rounded cursor-pointer"
        style={{
          background: 'var(--color-raised)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        Continue →
      </button>
    </div>
  );
}
