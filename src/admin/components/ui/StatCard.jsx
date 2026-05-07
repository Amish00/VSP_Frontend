// StatCard.jsx
import React from 'react';

const StatCard = ({ icon, label, value, change, color }) => {
    return (
        <div className="card-hover p-5 rounded-2xl bg-bg-card border border-border cursor-default" style={{ boxShadow: '0 2px 12px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.03)' }}>
            <div className="text-2xl mb-3 text-primary" aria-hidden>{icon}</div>
            <div className="font-display font-black text-3xl mb-1 tabular-nums" style={{ color: color || '#60A5FA' }}>{value}</div>
            <div className="text-sm text-text-secondary">{label}</div>
            {change && <div className="flex items-center gap-1 text-xs text-success mt-1.5 font-semibold"><span>↑</span>{change}</div>}
        </div>
    );
};

export default StatCard;