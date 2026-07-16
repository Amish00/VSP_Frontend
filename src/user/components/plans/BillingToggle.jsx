import React from 'react';

const OPTIONS = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'half', label: '6 Months', sub: '−15%' },
  { key: 'yearly', label: 'Yearly', sub: '−30%' }
];

const BillingToggle = ({ value, onChange }) => {
  return (
    <div className="inline-flex gap-1 p-1 bg-bg-card border border-border rounded-xl mb-1">
      {OPTIONS.map(({ key, label, sub }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            value === key ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {label}{sub && <span className="ml-1 text-xs opacity-75">{sub}</span>}
        </button>
      ))}
    </div>
  );
};

export default BillingToggle;