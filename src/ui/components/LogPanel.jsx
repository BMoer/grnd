import { useRef, useEffect } from 'react';
import { useGameStore } from '../../store.js';

const colorMap = {
  muted: 'var(--color-text-muted)',
  danger: 'var(--color-danger)',
  caution: 'var(--color-caution)',
  growth: 'var(--color-growth)',
  plan: 'var(--color-plan)',
};

export default function LogPanel() {
  const { log } = useGameStore();
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [log]);

  return (
    <div
      ref={ref}
      className="rounded p-2 text-[10px] leading-relaxed overflow-y-auto"
      style={{
        fontFamily: 'var(--font-mono)',
        maxHeight: 140,
        background: 'var(--color-surface)',
      }}
    >
      {log.map((l, i) => (
        <div key={i} style={{ color: colorMap[l.color] || l.color || 'var(--color-text-muted)' }}>
          {l.prefix && (
            <span className="mr-1" style={{ color: 'var(--color-growth)' }}>{l.prefix}</span>
          )}
          {l.text}
        </div>
      ))}
    </div>
  );
}
