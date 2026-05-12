import React, { useState, useEffect } from 'react';
import VideoTable from '../components/VideoTable';
import StatCard from '../components/ui/StatCard';
import { Video, Clock, CheckCircle, XCircle } from 'lucide-react';
import { videoApi } from '../api/videoApi';

const VideosPage = () => {
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    // Fetch statistics (overall counts, independent of table filters)
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch total count (all videos, no filters)
                const totalRes = await videoApi.getAllVideos(null, '', 0, 1);
                // Fetch pending count
                const pendingRes = await videoApi.getAllVideos('PENDING', '', 0, 1);
                // Fetch approved count
                const approvedRes = await videoApi.getAllVideos('APPROVED', '', 0, 1);
                // Fetch rejected count
                const rejectedRes = await videoApi.getAllVideos('REJECTED', '', 0, 1);

                setStats({
                    total: totalRes.totalElements || 0,
                    pending: pendingRes.totalElements || 0,
                    approved: approvedRes.totalElements || 0,
                    rejected: rejectedRes.totalElements || 0,
                });
            } catch (err) {
                console.error('Failed to fetch video stats', err);
                // Optionally show a toast/alert
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="pb-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">Video Management</h1>
            </div>

            {/* Stat Cards Row */}
            {!loadingStats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        icon={<Video size={24} />}
                        label="Total Videos"
                        value={stats.total.toLocaleString()}
                        color="#60A5FA"
                    />
                    <StatCard
                        icon={<Clock size={24} />}
                        label="Pending Review"
                        value={stats.pending.toLocaleString()}
                        color="#F59E0B"
                    />
                    <StatCard
                        icon={<CheckCircle size={24} />}
                        label="Approved"
                        value={stats.approved.toLocaleString()}
                        color="#10B981"
                    />
                    <StatCard
                        icon={<XCircle size={24} />}
                        label="Rejected"
                        value={stats.rejected.toLocaleString()}
                        color="#EF4444"
                    />
                </div>
            )}
            
            <VideoTable search={search} setSearch={setSearch} />
        </div>
    );
};

export default VideosPage;