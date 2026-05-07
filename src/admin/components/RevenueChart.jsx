// RevenueChart.jsx
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const RevenueChart = ({ data }) => {
    const chartData = data.map(item => ({
        m: item.month,
        subs: item.total,
        ads: 0, // not using ads in this model
        coins: item.platformFee
    }));

    return (
        <div className="bg-bg-card border border-border rounded-2xl p-5">
            <h3 className="font-display font-bold text-base mb-4 text-text-primary">Revenue by Source</h3>
            <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,43,66,.6)" />
                    <XAxis dataKey="m" tick={{ fill: '#4A6080', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4A6080', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `Rs.${(v/1000).toFixed(0)}k`} />
                    <Tooltip cursor={{ fill: 'rgba(15,23,36,0.6)' }} contentStyle={{ background: '#0F1724', border: '1px solid #1A2B42', borderRadius: '12px', color: '#ECF0FB' }} formatter={v => [`Rs.${v.toLocaleString()}`]} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#8FA3BE' }} />
                    <Bar dataKey="subs" fill="#2563EB" radius={[2, 2, 0, 0]} name="Subscriptions" />
                    <Bar dataKey="coins" fill="#F59E0B" radius={[2, 2, 0, 0]} name="Platform Fee" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;