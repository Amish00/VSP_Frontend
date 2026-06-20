import React, { useState, useEffect } from 'react';
import PlatformStats from '../components/PlatformStats';
import GrowthChart from '../components/GrowthChart';
import RevenueChart from '../components/RevenueChart';
import PendingVideosTable from '../components/PendingVideosTable';
import { userApi } from '../api/userApi';
import { videoApi } from '../api/videoApi';
import { adminRevenueApi } from '../../creator/api/creatorApi';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalViews: 0,
        totalUsers: 0,
        totalVideos: 0,
        totalRevenue: 0,
        totalCreators: 0,
        pendingVideos: 0
    });
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [growthData, setGrowthData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helper to group by month
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
                // Fetch users and all videos
                const [users, allVideosRes, pendingVideosRes, revenueRes] = await Promise.all([
                    userApi.getAllUsers(),
                    videoApi.getAllVideos(null, '', 0, 10000), // get all videos (adjust size as needed)
                    videoApi.getAllVideos('PENDING', '', 0, 1),
                    adminRevenueApi.getMonthlyRevenue(12)
                ]);

                // Total views: sum viewCount from all videos
                const allVideosContent = allVideosRes.content || [];
                const totalViews = allVideosContent.reduce((sum, v) => sum + (v.viewCount || 0), 0);

                const totalUsers = users.length;
                const creators = users.filter(u => u.role === 'CREATOR').length;
                const totalVideos = allVideosRes.totalElements || 0;
                const pendingVideos = pendingVideosRes.totalElements || 0;
                const monthlyData = revenueRes.data || [];
                const totalRevenue = monthlyData.reduce((sum, m) => sum + (m.total || 0), 0);

                setStats({
                    totalViews,
                    totalUsers,
                    totalVideos,
                    totalRevenue,
                    totalCreators: creators,
                    pendingVideos
                });
                setMonthlyRevenue(monthlyData);

                // Growth data: group users and videos by month
                const userCounts = groupByMonth(users, 'createdAt');
                const videoCounts = groupByMonth(allVideosContent, 'publishedAt');
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

    return (
        <div className="pb-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary mb-0.5">
                        Admin Dashboard
                    </h1>
                    <p className="text-sm text-text-secondary">Platform overview — real-time stats</p>
                </div>
            </div>

            <PlatformStats stats={stats} loading={loading} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <GrowthChart data={growthData} />
                <RevenueChart data={monthlyRevenue} />
            </div>

            <h2 className="font-display font-bold text-lg mb-3 text-text-primary">
                Pending Review ({stats.pendingVideos})
            </h2>
            <PendingVideosTable />
        </div>
    );
};

export default AdminDashboard;