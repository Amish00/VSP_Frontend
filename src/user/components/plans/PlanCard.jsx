// src/components/plans/PlanCard.jsx
import React from 'react';
import Button from '../ui/Button';
import { FaStar, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

/**
 * PlanCard – displays a single plan with features, price, and action button.
 * @param {Object} plan - plan data (id, name, price, period, features, popular)
 * @param {Function} onSelect - callback when button is clicked
 * @param {string} currencySymbol - currency symbol (default 'Rs.')
 * @param {boolean} disabled - if true, button is disabled
 * @param {string|null} badge - optional badge text: 'Current Plan', 'Expired', or 'Popular'
 */
const PlanCard = ({ plan, onSelect, currencySymbol = 'Rs.', disabled = false, badge = null }) => {
  const formatPrice = (price) => price === 0 ? 'Free' : `${currencySymbol}${price.toLocaleString('en-IN')}`;
  const badgeLabel = badge === 'Current Plan'
    ? (plan.id === 'creator' ? 'Create' : plan.name)
    : badge;

  // Determine if the plan should be highlighted as popular (only if no badge overrides)
  const isPopular = plan.popular && !badge;

  // Determine card styles based on badge / popularity
  const cardClasses = `
    relative overflow-hidden p-6 sm:p-7 rounded-3xl border flex flex-col transition-all duration-300
    hover:-translate-y-1 hover:border-primary/55 hover:shadow-xl
    ${isPopular ? 'border-primary bg-gradient-to-b from-primary/8 to-bg-card' : 'border-border bg-bg-card'}
    ${badge === 'Current Plan' ? 'ring-2 ring-primary/60 shadow-[0_16px_40px_rgba(37,99,235,.14)]' : ''}
    ${badge === 'Expired' ? 'opacity-70 ring-1 ring-red-400/30' : ''}
  `;

  // Determine shadow for popular plan
  const cardStyle = isPopular
    ? { boxShadow: '0 8px 32px rgba(37,99,235,.18), inset 0 1px 0 rgba(255,255,255,.04)' }
    : undefined;

  // Determine button variant
  const buttonVariant = isPopular ? 'primary' : 'ghost';

  // Determine button text
  let buttonText = 'Subscribe Now';
  if (badge === 'Current Plan') buttonText = 'Current Plan';
  else if (badge === 'Expired') buttonText = 'Expired';
  else if (plan.id === 'free') buttonText = 'Get Started Free';

  // Disable button if plan is expired or explicitly disabled
  const isButtonDisabled = disabled || badge === 'Expired';

  return (
    <div className={cardClasses} style={cardStyle}>
      {/* Top badge (if any) */}
      {badge && (
        <div
          className={`
            absolute left-5 top-5 px-3 py-1 rounded-full 
            text-white text-xs font-bold whitespace-nowrap flex items-center gap-1 shadow-sm
            ${badge === 'Current Plan' ? 'bg-primary' : ''}
            ${badge === 'Expired' ? 'bg-red-500' : ''}
            ${badge === 'Popular' ? 'bg-primary' : ''}
          `}
        >
          {badge === 'Current Plan' && <FaCheckCircle className="w-3 h-3" />}
          {badge === 'Expired' && <FaExclamationCircle className="w-3 h-3" />}
          {badge === 'Popular' && <FaStar className="w-3 h-3" />}
          {badgeLabel}
        </div>
      )}

      {/* Fallback popular badge (if no badge prop but plan.popular is true) */}
      {!badge && isPopular && (
        <div className="absolute left-5 top-5 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold whitespace-nowrap flex items-center gap-1 shadow-sm">
          <FaStar className="w-3 h-3" /> Most Popular
        </div>
      )}

      {/* Current plan indicator (top-right) – only when badge is 'Current Plan' */}
      {badge === 'Current Plan' && (
        <div className="absolute top-5 right-5 bg-primary/15 text-primary text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <FaCheckCircle className="w-3 h-3" /> Active
        </div>
      )}

      {/* Plan Name */}
      <div className="mt-9">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted mb-2">
          {badge === 'Current Plan' ? 'Your current plan' : 'Plan'}
        </p>
        <p className="font-display text-xl font-bold mb-1">{plan.name}</p>
      </div>

      {/* Price */}
      <div className="font-display text-4xl font-black text-primary-light mb-1">
        {formatPrice(plan.price)}
      </div>

      {/* Period */}
      <p className="text-sm text-text-muted mb-4">{plan.period}</p>

      {/* Features list */}
      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((feature, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm text-text-secondary border-b border-border/60 pb-2.5 last:border-0 last:pb-0"
          >
            <span className="text-success flex-shrink-0 mt-0.5">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      {/* Action Button */}
      <Button
        variant={buttonVariant}
        fullWidth
        onClick={() => onSelect(plan)}
        disabled={isButtonDisabled}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default PlanCard;