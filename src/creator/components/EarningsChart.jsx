// EarningsChart.jsx
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { earningsApi } from '../api/creatorApi';

const EarningsChart = ({ range }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        earningsApi.getHistory().then(res => {
            // res.data is array of MonthlyEarnings [{monthYear, earningsAmount}]
            const formatted = res.data.slice(-12).map(item => ({
                m: item.monthYear.slice(5), // "02" for Feb
                e: item.earningsAmount
            }));
            setData(formatted);
        }).catch(console.error);
    }, [range]); // re-fetch on range change (we can pass range param to API later)

    return (
        <div className="bg-bg-card border border-border rounded-2xl p-5">
            <h3 className="font-display font-bold text-base mb-4 text-text-primary">Monthly Earnings</h3>
            <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,43,66,.6)" />
                    <XAxis dataKey="m" tick={{ fill: '#4A6080', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4A6080', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `Rs.${v}`} />
                    <Tooltip cursor={{ fill: 'rgba(15,23,36,0.6)' }} contentStyle={{ background: '#0F1724', border: '1px solid #1A2B42', borderRadius: '12px', color: '#ECF0FB' }} formatter={v => [`Rs.${v}`, 'Earnings']} />
                    <Bar dataKey="e" radius={[4, 4, 0, 0]}>
                        {data.map((_, i) => <Cell key={i} fill={i === data.length - 1 ? '#10B981' : '#2563EB'} fillOpacity={i === data.length - 1 ? 1 : .75} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EarningsChart;