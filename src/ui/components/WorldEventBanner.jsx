import { useGameStore } from '../../store.js';

// Describe world event effects in plain language
function describeEffects(event) {
  const effects = [];
  // Simulate the effect function with a dummy state to extract what changes
  const dummy = { pipeline: 10, churn: 5, burnRate: 5000, conversionRate: 10, customers: 10, totalMRR: 1000, revenue: 1000, cash: 50000, cac: 100, product: 40, price: 49, teamMorale: 1 };
  try {
    const result = event.effect(dummy);
    if (result.pipeline !== dummy.pipeline) effects.push({ label: 'Pipeline', delta: result.pipeline - dummy.pipeline, unit: '' });
    if (result.churn !== dummy.churn) effects.push({ label: 'Churn', delta: +(result.churn - dummy.churn).toFixed(1), unit: 'pp' });
    if (result.burnRate !== dummy.burnRate) effects.push({ label: 'Burn', delta: result.burnRate - dummy.burnRate, unit: '€/mo' });
    if (result.conversionRate !== dummy.conversionRate) effects.push({ label: 'Conversion', delta: +(result.conversionRate - dummy.conversionRate).toFixed(1), unit: 'pp' });
    if (result.customers !== dummy.customers) effects.push({ label: 'Customers', delta: result.customers - dummy.customers, unit: '' });
    if ((result.cash ?? dummy.cash) !== dummy.cash) effects.push({ label: 'Cash', delta: (result.cash ?? dummy.cash) - dummy.cash, unit: '€' });
    if (result.product !== dummy.product) effects.push({ label: 'Product', delta: result.product - dummy.product, unit: '' });
    if ((result.teamMorale ?? 1) !== (dummy.teamMorale ?? 1)) effects.push({ label: 'Morale', delta: +((result.teamMorale ?? 1) - (dummy.teamMorale ?? 1)).toFixed(2), unit: '' });
  } catch { /* dynamic effects, can't preview */ }
  return effects;
}

export default function WorldEventBanner() {
  const { currentWorldEvent, dismissWorldEvent } = useGameStore();
  if (!currentWorldEvent) return null;

  const effects = describeEffects(currentWorldEvent);

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

      <p className="text-[12px] mb-3 italic" style={{ color: 'var(--color-caution)', fontFamily: 'var(--font-mono)' }}>
        {currentWorldEvent.flavor}
      </p>

      {/* Impact display */}
      {effects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          <span className="text-[9px] uppercase tracking-widest font-medium w-full mb-1" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Impact
          </span>
          {effects.map((e, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-1 rounded"
              style={{
                fontFamily: 'var(--font-mono)',
                color: e.delta > 0 && (e.label === 'Churn' || e.label === 'Burn') ? 'var(--color-danger)'
                  : e.delta < 0 && (e.label === 'Churn' || e.label === 'Burn') ? 'var(--color-growth)'
                  : e.delta > 0 ? 'var(--color-growth)'
                  : 'var(--color-danger)',
                background: e.delta > 0 && (e.label === 'Churn' || e.label === 'Burn') ? 'var(--color-danger)10'
                  : e.delta < 0 && (e.label === 'Churn' || e.label === 'Burn') ? 'var(--color-growth)10'
                  : e.delta > 0 ? 'var(--color-growth)10'
                  : 'var(--color-danger)10',
              }}
            >
              {e.label}: {e.delta > 0 ? '+' : ''}{e.delta}{e.unit}
            </span>
          ))}
        </div>
      )}

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
