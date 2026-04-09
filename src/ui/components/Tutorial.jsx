import { useState } from 'react';

const CLASS_TUTORIALS = {
  saas: {
    text: "You're running CloudKitchen — an AI tool that predicts demand and auto-orders supplies for restaurants.",
    detail: 'Restaurants find you through your sales pipeline. They try your product, and some convert to paying customers. Your job: find the right price, reduce churn, and grow revenue before the money runs out.',
  },
  consumer: {
    text: "You're running GlowUp — personalized wellness supplements delivered to your door.",
    detail: 'Customers discover you through ads and influencers. They order once, and you need them to come back. Your job: keep acquisition costs below lifetime value and build a brand that sticks.',
  },
  deeptech: {
    text: "You're running NanoSense — molecular sensors that detect food pathogens 10x faster than lab tests.",
    detail: "You have an FFG grant and zero revenue. Your job: push through certification, secure LOIs from manufacturers, and survive the long road from lab bench to production line.",
  },
  marketplace: {
    text: "You're running SwapCircle — a peer-to-peer skill exchange platform for freelancers.",
    detail: "You need both supply and demand to function. Neither side joins without the other. Your job: solve the cold start problem, build liquidity, and survive long enough for network effects to kick in.",
  },
  service: {
    text: "You're running StrategyForge — AI-powered strategy consulting for mid-market companies.",
    detail: "Revenue from day one, but every new client needs more of your time. Your job: maintain utilization without burning out, improve margins through AI productization, and escape the founder-as-bottleneck trap.",
  },
};

function getSteps(classId) {
  const classInfo = CLASS_TUTORIALS[classId] || CLASS_TUTORIALS.saas;
  return [
    {
      title: 'Your Startup',
      text: classInfo.text,
      detail: classInfo.detail,
    },
    {
      title: 'The Dashboard',
      text: 'The KPI strip at the top tracks your vital signs: MRR (revenue), customers, churn, cash, burn rate, and runway.',
      detail: 'The right panel shows your company at a glance. Watch how every decision changes these numbers. When runway hits 0, you\'re dead.',
    },
    {
      title: 'Events & Action Points',
      text: 'Each month, people come to you with decisions. Customers, co-founders, investors — each costs Action Points (AP) to address.',
      detail: 'You get 3 AP per month. If you can\'t afford an event, it resolves badly. Prioritize ruthlessly — you can\'t do everything.',
    },
    {
      title: 'Two Ways to Steer',
      text: 'Events are reactive — things happen, you respond. But every 3 months, a Board Meeting lets you be proactive.',
      detail: 'After each Board Meeting, you can adjust pricing, investment levels, and your forecast. Compare your plan against reality. Revise when the data tells you to.',
    },
    {
      title: 'Win & Lose',
      text: 'Win: reach PMF score \u2265 85 for 3 consecutive months. Lose: cash hits zero.',
      detail: 'PMF (Product-Market Fit) is calculated from MRR, churn, customers, unit economics, and product quality. No single metric wins alone — you need the whole picture.',
    },
  ];
}

export default function Tutorial({ onClose, accent, classId }) {
  const steps = getSteps(classId);
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const color = accent || 'var(--color-saas)';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(26, 26, 26, 0.6)', zIndex: 100 }}
    >
      <div
        className="w-full max-w-md p-6 rounded"
        style={{ background: 'var(--color-canvas)', border: '1px solid var(--color-border)' }}
      >
        {/* Step indicator */}
        <div className="flex gap-1 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-sm"
              style={{ background: i <= step ? color : 'var(--color-border)' }}
            />
          ))}
        </div>

        <h2
          className="text-xl font-bold mb-2 tracking-tight"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
        >
          {current.title}
        </h2>

        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          {current.text}
        </p>

        <p className="text-[12px] leading-relaxed mb-6" style={{ color: 'var(--color-text-muted)' }}>
          {current.detail}
        </p>

        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-[11px] cursor-pointer"
            style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', fontFamily: 'var(--font-mono)' }}
          >
            Skip tutorial
          </button>

          <button
            onClick={() => isLast ? onClose() : setStep(step + 1)}
            className="px-4 py-2 rounded text-sm font-bold cursor-pointer"
            style={{
              background: color,
              color: '#fff',
              border: 'none',
              fontFamily: 'var(--font-display)',
            }}
          >
            {isLast ? 'Start Playing' : 'Next \u2192'}
          </button>
        </div>
      </div>
    </div>
  );
}
