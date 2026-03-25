import { useGameStore } from '../../store.js';

export default function BusinessTable() {
  const { classConfig, history } = useGameStore();
  if (!classConfig || !history.length) return null;

  const headers = classConfig.tableHeaders;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-right first:text-left px-2 py-1.5 text-[10px] uppercase tracking-widest font-medium"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--color-border)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {history.map((s, ri) => {
            const row = classConfig.formatRow(classConfig.getRow(s));
            const isLast = ri === history.length - 1;
            return (
              <tr
                key={ri}
                style={{ background: isLast ? 'var(--color-raised)' : 'transparent' }}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="text-right first:text-left px-2 py-1 text-[11px] tabular-nums"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text)',
                      borderBottom: '1px solid var(--color-border)',
                      fontWeight: isLast ? 600 : 400,
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
