import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const GrowthChart = ({ data = [] }) => {
    if (!data.length) {
        return (
            <div className="bg-bg-card border border-border rounded-2xl p-5">
                <h3 className="font-display font-bold text-base mb-4 text-text-primary">Platform Growth</h3>
                <div className="flex items-center justify-center h-40 text-text-muted">No growth data available</div>
            </div>
        );
    }

    return (
        <div className="bg-bg-card border border-border rounded-2xl p-5">
            <h3 className="font-display font-bold text-base mb-4 text-text-primary">Platform Growth</h3>
            <ResponsiveContainer width="100%" height={160}>
                <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,43,66,.6)" />
                    <XAxis dataKey="month" tick={{ fill: '#4A6080', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4A6080', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0F1724', border: '1px solid #1A2B42', borderRadius: '12px', color: '#ECF0FB' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#8FA3BE' }} />
                    <Line type="monotone" dataKey="users" stroke="#2563EB" strokeWidth={2} dot={false} name="New Users" />
                    <Line type="monotone" dataKey="videos" stroke="#10B981" strokeWidth={2} dot={false} name="New Videos" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GrowthChart;