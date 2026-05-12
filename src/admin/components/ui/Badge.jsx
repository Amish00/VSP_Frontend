import React from 'react';

const S = {
  // Video / content badges
  free: 'bg-success/15 text-[#34d399] border-success/30',
  paid: 'bg-warning/15 text-[#fbbf24] border-warning/30',
  pending: 'bg-warning/10 text-warning border-warning/25',
  approved: 'bg-success/10 text-success border-success/25',
  rejected: 'bg-danger/10 text-danger border-danger/25',
  pro: 'bg-primary/15 text-primary-light border-primary/30',
  live: 'bg-danger/15 text-danger border-danger/30',
  draft: 'bg-bg-hov text-text-secondary border-border',
  info: 'bg-accent/12 text-accent border-accent/28',

  // User roles
  admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  creator: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  viewer: 'bg-gray-500/15 text-gray-400 border-gray-500/30',

  // User plans
  create_plan: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  view_plan: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  free_plan: 'bg-gray-500/15 text-gray-400 border-gray-500/30',

  // User statuses
  active: 'bg-green-500/15 text-green-400 border-green-500/30',
  blocked: 'bg-red-500/15 text-red-400 border-red-500/30',
  suspended: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',

  // Payment methods
  esewa: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  khalti: 'bg-purple-600/15 text-purple-400 border-purple-600/30',

  // Billing cycles
  monthly: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  yearly: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  semiannual: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', // for 6 months
};

const Badge = ({ text, type = 'free', small = false }) => {
  return (
    <span
      className={`inline-flex items-center font-semibold border whitespace-nowrap tracking-wide ${
        small ? 'px-2 py-px text-xs rounded-md' : 'px-2.5 py-0.5 text-sm rounded-lg'
      } ${S[type] || S.draft}`}
    >
      {text}
    </span>
  );
};

export default Badge;