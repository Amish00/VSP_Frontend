import React from 'react';
import Button from '../../components/ui/Button';

const PlanCard = ({ plan, onSelect, currencySymbol = '₹' }) => {
  const formatPrice = (price) => price === 0 ? 'Free' : `${currencySymbol}${price.toLocaleString('en-IN')}`;

  return (
    <div
      className={`relative p-6 rounded-2xl border flex flex-col transition-all duration-200 hover:-translate-y-1 hover:border-primary/55 ${
        plan.popular ? 'border-primary bg-primary/6' : 'border-border bg-bg-card'
      }`}
      style={plan.popular ? { boxShadow: '0 8px 32px rgba(37,99,235,.18), inset 0 1px 0 rgba(255,255,255,.04)' } : undefined}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold whitespace-nowrap">
          🌟 Most Popular
        </div>
      )}
      <p className="font-display text-xl font-bold mb-1">{plan.name}</p>
      <div className="font-display text-4xl font-black text-primary-light mb-0.5">
        {formatPrice(plan.price)}
      </div>
      <p className="text-sm text-text-muted mb-5">{plan.period}</p>
      <ul className="space-y-3 mb-6 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary border-b border-border/60 pb-3 last:border-0 last:pb-0">
            <span className="text-success flex-shrink-0 mt-0.5">✓</span>{f}
          </li>
        ))}
      </ul>
      <Button variant={plan.popular ? 'primary' : 'ghost'} fullWidth onClick={() => onSelect?.(plan)}>
        {plan.id === 'free' ? 'Get Started Free' : 'Subscribe Now'}
      </Button>
    </div>
  );
};

export default PlanCard;