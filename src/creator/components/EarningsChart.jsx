import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { earningsApi } from '../api/creatorApi';

// Helper: Convert "YYYY-MM" to abbreviated month + year (e.g. "Apr '25")
const getMonthLabel = (monthYear) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthShort = date.toLocaleString('default', { month: 'short' });
    const yearShort = year.slice(-2);
    return `${monthShort} '${yearShort}`;
};

const EarningsChart = ({ range }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        earningsApi.getHistory()
            .then(res => {
                let earnings = res.data || [];
                earnings.sort((a, b) => a.monthYear.localeCompare(b.monthYear));
                const last12 = earnings.slice(-12);
                const formatted = last12.map(item => ({
                    m: getMonthLabel(item.monthYear),
                    e: item.earningsAmount
                }));
                setData(formatted);
            })
            .catch(err => {
                console.error('Failed to load earnings history', err);
                setData([]);
            })
            .finally(() => setLoading(false));
    }, [range]);

    if (loading) {
        return (
            <div className="bg-bg-card border border-border rounded-2xl p-5">
                <h3 className="font-display font-bold text-base mb-4 text-text-primary">Monthly Earnings</h3>
                <div className="h-40 flex items-center justify-center text-text-secondary">Loading...</div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-bg-card border border-border rounded-2xl p-5">
                <h3 className="font-display font-bold text-base mb-4 text-text-primary">Monthly Earnings</h3>
                <div className="h-40 flex items-center justify-center text-text-secondary">No earnings data available yet.</div>
            </div>
        );
    }

    return (
        <div className="bg-bg-card border border-border rounded-2xl p-5">
            <h3 className="font-display font-bold text-base mb-4 text-text-primary">Monthly Earnings</h3>
            <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data} margin={{ top: 4, right: 4, left: 6, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,43,66,.6)" />
                    <XAxis 
                        dataKey="m" 
                        tick={{ fill: '#4A6080', fontSize: 11 }} 
                        axisLine={false} 
                        tickLine={false} 
                        interval={0} 
                    />
                    <YAxis 
                        tick={{ fill: '#4A6080', fontSize: 11 }} 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={v => `Rs.${v}`} 
                    />
                    <Tooltip 
                        cursor={{ fill: 'rgba(15,23,36,0.6)' }} 
                        contentStyle={{ 
                            background: '#0F1724', 
                            border: '1px solid #1A2B42', 
                            borderRadius: '12px', 
                            color: '#ECF0FB' 
                        }}
                        itemStyle={{ color: '#ECF0FB' }}
                        labelStyle={{ color: '#ECF0FB', fontWeight: 'bold' }}
                        formatter={v => [`Rs.${v}`, 'Earnings']} 
                    />
                    <Bar dataKey="e" radius={[4, 4, 0, 0]}>
                        {data.map((_, i) => <Cell key={i} fill={i === data.length - 1 ? '#10B981' : '#2563EB'} fillOpacity={i === data.length - 1 ? 1 : .75} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EarningsChart;