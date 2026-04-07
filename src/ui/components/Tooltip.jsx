import { useState, useRef, useEffect } from 'react';
import { lookupTerm } from '../../data/glossary.js';

/**
 * Tooltip component for glossary terms.
 * Wrap any text — if a glossary entry exists, it shows on hover.
 * 
 * Usage: <Term>MRR</Term> or <Term term="MRR">Monthly Recurring Revenue</Term>
 */
export function Term({ term, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const tooltipRef = useRef(null);

  const lookupKey = term || children;
  const entry = lookupTerm(lookupKey);

  // No glossary entry → render plain text
  if (!entry) return <>{children}</>;

  const handleMouseEnter = () => {
    setShow(true);
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left + rect.width / 2 });
    }
  };

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(s => !s)} // mobile support
        style={{
          borderBottom: '1px dotted var(--color-text-muted)',
          cursor: 'help',
          position: 'relative',
        }}
      >
        {children}
      </span>
      {show && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: pos.top,
            left: Math.min(pos.left, window.innerWidth - 280),
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'var(--color-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            padding: '10px 14px',
            maxWidth: 280,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
          }}
        >
          <div
            className="text-[10px] uppercase tracking-widest font-bold mb-1"
            style={{ color: 'var(--color-plan)', fontFamily: 'var(--font-mono)' }}
          >
            {entry.term}
          </div>
          <div className="text-[11px] font-medium mb-1" style={{ color: 'var(--color-text)' }}>
            {entry.short}
          </div>
          <div className="text-[10px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {entry.description}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Inline KPI label with tooltip. Replaces plain text labels.
 */
export function KPILabel({ term, label, style }) {
  return (
    <Term term={term}>
      <span style={style}>{label || term}</span>
    </Term>
  );
}
