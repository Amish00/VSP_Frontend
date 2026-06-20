import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import VideoTable from '../components/VideoTable';
import StatCard from '../components/ui/StatCard';
import { Video, Clock, CheckCircle, XCircle, Film, Smartphone } from 'lucide-react';
import { videoApi } from '../api/videoApi';

const VideosPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [contentType, setContentType] = useState('VIDEO'); // 'VIDEO' or 'SHORTS'
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch statistics (overall counts, not filtered by type)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const totalRes = await videoApi.getAllVideos(null, '', 0, 1);
        const pendingRes = await videoApi.getAllVideos('PENDING', '', 0, 1);
        const approvedRes = await videoApi.getAllVideos('APPROVED', '', 0, 1);
        const rejectedRes = await videoApi.getAllVideos('REJECTED', '', 0, 1);

        setStats({
          total: totalRes.totalElements || 0,
          pending: pendingRes.totalElements || 0,
          approved: approvedRes.totalElements || 0,
          rejected: rejectedRes.totalElements || 0,
        });
      } catch (err) {
        console.error('Failed to fetch video stats', err);
        enqueueSnackbar('Failed to load video statistics. Please refresh the page.', {
          variant: 'error',
          autoHideDuration: 5000,
        });
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [enqueueSnackbar]);

  const handleTypeChange = (type) => {
    setContentType(type);
    setSearch(''); // optional: reset search when switching type
  };

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">
          Video Management
        </h1>

        {/* Toggle Switch */}
        <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => handleTypeChange('VIDEO')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              contentType === 'VIDEO'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
            }`}
          >
            <Film size={16} />
            Videos
          </button>
          <button
            onClick={() => handleTypeChange('SHORTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              contentType === 'SHORTS'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
            }`}
          >
            <Smartphone size={16} />
            Shorts
          </button>
        </div>
      </div>

      {/* Stat Cards Row */}
      {!loadingStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Video size={24} color="#60A5FA" />}
            label="Total Videos"
            value={stats.total.toLocaleString()}
            color="#60A5FA"
          />
          <StatCard
            icon={<Clock size={24} color="#F59E0B" />}
            label="Pending Review"
            value={stats.pending.toLocaleString()}
            color="#F59E0B"
          />
          <StatCard
            icon={<CheckCircle size={24} color="#10B981" />}
            label="Approved"
            value={stats.approved.toLocaleString()}
            color="#10B981"
          />
          <StatCard
            icon={<XCircle size={24} color="#EF4444" />}
            label="Rejected"
            value={stats.rejected.toLocaleString()}
            color="#EF4444"
          />
        </div>
      )}

      {/* Pass the selected type to VideoTable */}
      <VideoTable
        search={search}
        setSearch={setSearch}
        type={contentType}
      />
    </div>
  );
};

export default VideosPage;