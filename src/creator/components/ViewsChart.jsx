import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { creatorApi } from '../api/creatorApi';

const ViewsChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchViews = async () => {
            try {
                const res = await creatorApi.getViewsOverTime(180);
                setData(res.data);
            } catch (err) {
                console.error('Failed to load views data', err);
                setError('Unable to load views data');
            } finally {
                setLoading(false);
            }
        };
        fetchViews();
    }, []);

    if (loading) return <div className="bg-bg-card border border-border rounded-2xl p-5 animate-pulse h-64" />;
    if (error) return <div className="bg-bg-card border border-border rounded-2xl p-5 text-danger">{error}</div>;

    // Format date: "Jan 15"
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Format Y‑axis: show "0" for zero, "1.2k" for thousands, "1.2M" for millions (if needed)
    const formatViews = (value) => {
        if (value === 0) return '0';
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + 'k';
        return value.toString();
    };

    // Show ~10 labels evenly across the data
    const labelInterval = Math.max(1, Math.floor(data.length / 10));

    return (
        <div className="bg-bg-card border border-border rounded-2xl p-5">
            <h3 className="font-display font-bold text-base mb-4 text-text-primary">Views Over Time</h3>
            <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                        <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,43,66,.6)" />
                    
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#4A6080', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        interval={labelInterval}
                        tickFormatter={formatDate}
                        // If labels still overlap, uncomment these:
                        // angle={-20}
                        // textAnchor="end"
                        // height={40}
                    />
                    
                    <YAxis
                        tick={{ fill: '#4A6080', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={formatViews}
                        // Optional: set a nice domain to avoid excessive empty space
                        domain={[0, 'auto']}
                    />
                    
                    <Tooltip
                        contentStyle={{ background: '#0F1724', border: '1px solid #1A2B42', borderRadius: '12px', color: '#ECF0FB' }}
                        formatter={(value) => [value.toLocaleString(), 'Views']}
                        labelFormatter={(label) => formatDate(label)}
                    />
                    
                    <Area type="monotone" dataKey="views" stroke="#2563EB" strokeWidth={2} fill="url(#vg)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ViewsChart;