import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store.js';
import { Term } from './Tooltip.jsx';

/**
 * Horizontal Excel-style KPI tracker.
 * Rows = KPIs, Columns = Months (M0, M1, M2, ...)
 */
export default function KPITracker() {
  const { history, classConfig } = useGameStore();
  const scrollRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to rightmost column (latest month)
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [history.length]);

  if (!classConfig || !history.length) return null;

  const accent = classConfig.color;

  // KPI definitions — rows of the table
  const kpis = [
    { key: 'totalMRR', label: 'MRR', glossary: 'MRR', format: (v) => `€${(v ?? 0).toLocaleString('en-US')}`, highlight: true },
    { key: 'customers', label: 'Customers', glossary: 'Customers', format: (v) => `${v ?? 0}` },
    { key: 'churn', label: 'Churn %', glossary: 'Churn', format: (v) => `${typeof v === 'number' ? v.toFixed(1) : v ?? 0}%`, danger: (v) => (v ?? 0) > 10 },
    { key: 'cac', label: 'CAC', glossary: 'CAC', format: (v) => v ? `€${Math.round(v)}` : '–' },
    { key: 'ltvCacRatio', label: 'LTV:CAC', glossary: 'LTV:CAC', format: (v) => `${typeof v === 'number' ? v.toFixed(1) : v ?? 0}x`, good: (v) => (v ?? 0) >= 3 },
    { key: 'cash', label: 'Cash', glossary: 'Cash', format: (v) => `€${((v ?? 0) / 1000).toFixed(0)}K`, danger: (v) => (v ?? 0) < 20000 },
    { key: 'totalBurn', label: 'Burn', glossary: 'Burn', altKey: 'burnRate', format: (v) => `€${(v ?? 0).toLocaleString('en-US')}` },
    { key: 'runway', label: 'Runway', glossary: 'Runway', format: (v) => (v ?? 0) > 24 ? '24+' : `${v ?? 0}mo`, danger: (v) => (v ?? 0) < 4, good: (v) => (v ?? 0) > 12 },
  ];

  const cellStyle = {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    whiteSpace: 'nowrap',
    padding: '3px 8px',
    borderBottom: '1px solid var(--color-border)',
    borderRight: '1px solid var(--color-border)',
  };

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      <table className="border-collapse min-w-full" style={{ tableLayout: 'auto' }}>
        <thead>
          <tr>
            {/* Label column (sticky) */}
            <th
              style={{
                ...cellStyle,
                position: 'sticky',
                left: 0,
                zIndex: 2,
                background: 'var(--color-surface)',
                color: 'var(--color-text-muted)',
                textAlign: 'left',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                minWidth: 80,
                boxShadow: '2px 0 4px rgba(0,0,0,0.05)',
              }}
            >
              KPI
            </th>
            {/* Month columns */}
            {history.map((s, i) => (
              <th
                key={i}
                style={{
                  ...cellStyle,
                  textAlign: 'right',
                  fontWeight: i === history.length - 1 ? 700 : 500,
                  color: i === history.length - 1 ? accent : 'var(--color-text-muted)',
                  background: i === history.length - 1 ? 'var(--color-raised)' : 'transparent',
                  minWidth: 60,
                }}
              >
                M{s.month}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {kpis.map((kpi, ri) => (
            <tr key={ri}>
              {/* Label */}
              <td
                style={{
                  ...cellStyle,
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  background: 'var(--color-surface)',
                  color: kpi.highlight ? accent : 'var(--color-text-muted)',
                  fontWeight: kpi.highlight ? 600 : 500,
                  textAlign: 'left',
                  boxShadow: '2px 0 4px rgba(0,0,0,0.05)',
                }}
              >
                {kpi.glossary ? <Term term={kpi.glossary}>{kpi.label}</Term> : kpi.label}
              </td>
              {/* Values per month */}
              {history.map((s, ci) => {
                const val = s[kpi.key] ?? (kpi.altKey ? s[kpi.altKey] : undefined) ?? 0;
                const isLast = ci === history.length - 1;
                const isDanger = kpi.danger?.(val);
                const isGood = kpi.good?.(val);

                return (
                  <td
                    key={ci}
                    style={{
                      ...cellStyle,
                      textAlign: 'right',
                      fontWeight: isLast ? 600 : 400,
                      color: isDanger
                        ? 'var(--color-danger)'
                        : isGood
                        ? 'var(--color-growth)'
                        : isLast
                        ? 'var(--color-text)'
                        : 'var(--color-text-secondary)',
                      background: isLast ? 'var(--color-raised)' : 'transparent',
                    }}
                    className="tabular-nums"
                  >
                    {kpi.format(val)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
