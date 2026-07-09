import React from 'react';
import StatCard from './ui/StatCard';
import { FiEye, FiUsers, FiFilm, FiStar, FiClock } from 'react-icons/fi';
import { FaMoneyBillWave,FaRegEye } from "react-icons/fa6";


const PlatformStats = ({ stats, loading }) => {
    
    const defaultStats = [
        { 
            icon: <FiEye color="#60A5FA" />, 
            label: 'Total Views', 
            value: stats.totalViews.toLocaleString(), 
            change: '+18%', 
            color: '#60A5FA' 
        },
        { 
            icon: <FiUsers color="#10B981" />, 
            label: 'Total Users', 
            value: stats.totalUsers.toLocaleString(), 
            change: '+12%', 
            color: '#10B981' 
        },
        { 
            icon: <FiFilm color="#F59E0B" />, 
            label: 'Total Videos', 
            value: stats.totalVideos.toLocaleString(), 
            change: '+8%', 
            color: '#F59E0B' 
        },
        { 
            icon: <FaMoneyBillWave color="#EF4444" />, 
            label: 'Total Revenue', 
            value: `Rs.${stats.totalRevenue.toLocaleString()}`, 
            change: '+22%', 
            color: '#EF4444' 
        },
        { 
            icon: <FaRegEye color="#0EA5E9" />, 
            label: 'Creators', 
            value: stats.totalCreators.toLocaleString(), 
            change: '+15%', 
            color: '#0EA5E9' 
        },
        { 
            icon: <FiClock color="#F59E0B" />, 
            label: 'Pending Review', 
            value: stats.pendingVideos.toLocaleString(), 
            color: '#F59E0B' 
        }
    ];

    if (loading) {
        return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-bg-card border border-border rounded-2xl animate-pulse" />)}
        </div>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
            {defaultStats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
    );
};

export default PlatformStats;