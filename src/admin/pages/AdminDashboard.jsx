import React, { useState, useEffect } from 'react';
import StatCard from '../components/ui/StatCard';
import GrowthChart from '../components/GrowthChart';
import RevenueChart from '../components/RevenueChart';
import PendingVideosTable from '../components/PendingVideosTable';
import { userApi } from '../api/userApi';
import { videoApi } from '../api/videoApi';
import { adminRevenueApi } from '../../creator/api/creatorApi';
import { FiEye, FiUsers, FiFilm, FiClock } from 'react-icons/fi';
import { FaMoneyBillWave, FaRegEye } from "react-icons/fa6";

// ---- helper: format large numbers with K, M, B ----
const formatNumber = (num) => {
  if (num == null) return '0';
  const n = Number(num);
  if (n < 1000) return n.toString();
  if (n < 1_000_000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  if (n < 1_000_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalViews: 0,
        totalUsers: 0,
        totalVideos: 0,
        totalRevenue: 0,
        totalCreators: 0,
        pendingVideos: 0,
        newUsersThisMonth: 0,
        newVideosThisMonth: 0
    });
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [growthData, setGrowthData] = useState([]);
    const [loading, setLoading] = useState(true);

    const groupByMonth = (items, dateField) => {
        const groups = {};
        items.forEach(item => {
            const date = new Date(item[dateField]);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            groups[monthKey] = (groups[monthKey] || 0) + 1;
        });
        return groups;
    };

    const buildGrowthData = (userCounts, videoCounts) => {
        const now = new Date();
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const monthName = d.toLocaleString('default', { month: 'short' });
            months.push({
                month: monthName,
                users: userCounts[monthKey] || 0,
                videos: videoCounts[monthKey] || 0,
            });
        }
        return months;
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [users, allVideosRes, pendingVideosRes, revenueRes] = await Promise.all([
                    userApi.getAllUsers(),
                    videoApi.getAllVideos(null, '', 0, 10000),
                    videoApi.getAllVideos('PENDING', '', 0, 1),
                    adminRevenueApi.getMonthlyRevenue(12)
                ]);

                const allVideosContent = allVideosRes.content || [];
                const totalViews = allVideosContent.reduce((sum, v) => sum + (v.viewCount || 0), 0);

                const totalUsers = users.length;
                const creators = users.filter(u => u.role === 'CREATOR').length;
                const totalVideos = allVideosRes.totalElements || 0;
                const pendingVideos = pendingVideosRes.totalElements || 0;
                const monthlyData = revenueRes.data || [];
                const totalRevenue = monthlyData.reduce((sum, m) => sum + (m.total || 0), 0);

                // ---- compute new users & new videos for current month ----
                const now = new Date();
                const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                const userCounts = groupByMonth(users, 'joined');
                const videoCounts = groupByMonth(allVideosContent, 'publishedAt');
                const newUsersThisMonth = userCounts[currentMonthKey] || 0;
                const newVideosThisMonth = videoCounts[currentMonthKey] || 0;

                setStats({
                    totalViews,
                    totalUsers,
                    totalVideos,
                    totalRevenue,
                    totalCreators: creators,
                    pendingVideos,
                    newUsersThisMonth,
                    newVideosThisMonth
                });
                setMonthlyRevenue(monthlyData);

                const growth = buildGrowthData(userCounts, videoCounts);
                setGrowthData(growth);
            } catch (err) {
                console.error('Failed to load dashboard data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // ---- define all stat cards with formatted numbers ----
    const statCards = [
        {
            icon: <FiEye color="#60A5FA" size={24} />,
            label: 'Total Views',
            value: formatNumber(stats.totalViews),
            color: '#60A5FA'
        },
        {
            icon: <FiUsers color="#10B981" size={24} />,
            label: 'Total Users',
            value: formatNumber(stats.totalUsers),
            color: '#10B981'
        },
        {
            icon: <FiFilm color="#F59E0B" size={24} />,
            label: 'Total Videos',
            value: formatNumber(stats.totalVideos),
            color: '#F59E0B'
        },
        {
            icon: <FaMoneyBillWave color="#EF4444" size={24} />,
            label: 'Total Revenue',
            value: `Rs. ${formatNumber(stats.totalRevenue)}`,
            color: '#EF4444'
        },
        {
            icon: <FaRegEye color="#0EA5E9" size={24} />,
            label: 'Creators',
            value: formatNumber(stats.totalCreators),
            color: '#0EA5E9'
        },
        {
            icon: <FiClock color="#F59E0B" size={24} />,
            label: 'Pending Review',
            value: formatNumber(stats.pendingVideos),
            color: '#F59E0B'
        },
        // ---- two new stats ----
        {
            icon: <FiUsers color="#8B5CF6" size={24} />,
            label: 'New Users (this month)',
            value: formatNumber(stats.newUsersThisMonth),
            color: '#8B5CF6'
        },
        {
            icon: <FiFilm color="#EC4899" size={24} />,
            label: 'New Videos (this month)',
            value: formatNumber(stats.newVideosThisMonth),
            color: '#EC4899'
        }
    ];

    return (
        <div className="space-y-6 pb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary mb-0.5">
                        Admin Dashboard
                    </h1>
                    <p className="text-sm text-text-secondary">Platform overview — real-time stats</p>
                </div>
            </div>

            {/* Stat Cards – now 4 per row on large screens */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-28 bg-bg-card border border-border rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {statCards.map((s) => (
                        <StatCard key={s.label} {...s} />
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GrowthChart data={growthData} />
                <RevenueChart data={monthlyRevenue} />
            </div>

            <div>
                <h2 className="font-display font-bold text-lg mb-3 text-text-primary">
                    Pending Review ({stats.pendingVideos})
                </h2>
                <PendingVideosTable />
            </div>
        </div>
    );
};

export default AdminDashboard;