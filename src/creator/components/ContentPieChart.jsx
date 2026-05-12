import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { creatorApi } from '../api/creatorApi';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9', '#8B5CF6', '#EC4899'];

const ContentPieChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBreakdown = async () => {
            try {
                const res = await creatorApi.getContentBreakdown();
                setData(res.data);
            } catch (err) {
                console.error('Failed to load content breakdown', err);
                setError('Unable to load content data');
            } finally {
                setLoading(false);
            }
        };
        fetchBreakdown();
    }, []);

    if (loading) return <div className="bg-bg-card border border-border rounded-2xl p-5 animate-pulse h-64" />;
    if (error) return <div className="bg-bg-card border border-border rounded-2xl p-5 text-danger">{error}</div>;
    if (data.length === 0) return <div className="bg-bg-card border border-border rounded-2xl p-5 text-text-secondary">No content data available</div>;

    return (
        <div className="bg-bg-card border border-border rounded-2xl p-5">
            <h3 className="font-display font-bold text-base mb-2 text-text-primary">Content Breakdown</h3>
            <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0F1724', border: '1px solid #1A2B42', borderRadius: '12px', color: '#ECF0FB' }} formatter={v => [`${v}%`, 'Share']} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#8FA3BE' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ContentPieChart;