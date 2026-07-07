import React from 'react';

const S = {
  free:     'bg-green-600 text-white border-green-700',
  paid:     'bg-amber-600 text-white border-amber-700',
  pending:  'bg-yellow-600 text-white border-yellow-700',
  approved: 'bg-emerald-600 text-white border-emerald-700',
  rejected: 'bg-red-600 text-white border-red-700',
  pro:      'bg-blue-600 text-white border-blue-700',
  live:     'bg-rose-600 text-white border-rose-700',
  draft:    'bg-gray-600 text-white border-gray-700',
  info:     'bg-sky-600 text-white border-sky-700',
  video:    'bg-blue-600 text-white border-blue-700',
  short:    'bg-purple-600 text-white border-purple-700',
};

const Badge = ({ text, type = 'free', small = false }) => {
  return (
    <span className={`inline-flex items-center font-semibold border whitespace-nowrap tracking-wide ${small ? 'px-2 py-px text-xs rounded-md' : 'px-2.5 py-0.5 text-sm rounded-lg'} ${S[type] || S.draft}`}>
      {text}
    </span>
  );
};

export default Badge;