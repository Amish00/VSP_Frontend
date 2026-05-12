import React from 'react';
import StatCard from './ui/StatCard';

const PlatformStats = ({ stats, loading }) => {
    const defaultStats = [
        { icon: '👁', label: 'Total Views', value: stats.totalViews.toLocaleString(), change: '+18%', color: '#60A5FA' },
        { icon: '👥', label: 'Total Users', value: stats.totalUsers.toLocaleString(), change: '+12%', color: '#10B981' },
        { icon: '🎬', label: 'Total Videos', value: stats.totalVideos.toLocaleString(), change: '+8%', color: '#F59E0B' },
        { icon: '💰', label: 'Total Revenue', value: `Rs.${stats.totalRevenue.toLocaleString()}`, change: '+22%', color: '#EF4444' },
        { icon: '🌟', label: 'Creators', value: stats.totalCreators.toLocaleString(), change: '+15%', color: '#0EA5E9' },
        { icon: '⏳', label: 'Pending Review', value: stats.pendingVideos.toLocaleString(), color: '#F59E0B' }
    ];

    if (loading) {
        return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-bg-card border border-border rounded-xl animate-pulse" />)}
        </div>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            {defaultStats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
    );
};

export default PlatformStats;