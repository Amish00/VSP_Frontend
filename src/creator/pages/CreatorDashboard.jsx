import React, { useState, useEffect } from 'react';
import StatCard from '../components/ui/StatCard';
import ViewsChart from '../components/ViewsChart';
import EarningsChart from '../components/EarningsChart';
import ContentPieChart from '../components/ContentPieChart';
import VideoTable from '../components/VideoTable';
import { creatorApi, earningsApi } from '../api/creatorApi';

const DashboardPage = ({ user }) => {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalEarnings: 0,
    subscriberCount: 0,
    totalLikes: 0
  });
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, videosRes] = await Promise.all([
          creatorApi.getDashboardStats(),
          creatorApi.getVideos(null, '', 5, 0) // get recent 5 videos – you need to modify getVideos to accept size/offset
        ]);
        setStats(statsRes.data);
        setRecentVideos(videosRes.data.content || []);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Helper to format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const STATS = [
    { icon: '👁', label: 'Total Views', value: formatNumber(stats.totalViews), change: '+18% this month', color: '#60A5FA' },
    { icon: '💰', label: 'Earnings', value: `$${stats.totalEarnings.toLocaleString()}`, change: '+$180 this month', color: '#10B981' },
    { icon: '👥', label: 'Subscribers', value: formatNumber(stats.subscriberCount), change: '+340 this month', color: '#F59E0B' },
    { icon: '❤️', label: 'Total Likes', value: formatNumber(stats.totalLikes), change: '+2.1K this month', color: '#EF4444' }
  ];

  const recentActivities = [
    { icon: '🎬', text: 'New upload approved: "System Design"', time: '2h ago', color: 'text-success' },
    { icon: '💰', text: `Payout of $${stats.totalEarnings > 0 ? Math.min(stats.totalEarnings, 500) : 420} processed`, time: '3 days ago', color: 'text-primary-light' },
    { icon: '👤', text: `${stats.subscriberCount > 0 ? Math.floor(stats.subscriberCount * 0.04) : 340} new subscribers this week`, time: '1 week ago', color: 'text-warning' }
  ];

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary mb-0.5">Dashboard</h1>
          <p className="text-sm text-text-secondary">Welcome back, <span className="text-primary-light font-semibold">{user?.name?.split(' ')[0] || 'Creator'}</span></p>
        </div>
        <div className="text-sm text-text-muted bg-bg-el border border-border rounded-xl px-4 py-2">Revenue share: <span className="text-success font-bold">70%</span> to you</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ViewsChart />
        <EarningsChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ContentPieChart />
        <div className="bg-bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-bold text-base mb-4 text-text-primary">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivities.map((a, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0">
                <div className="w-8 h-8 rounded-xl bg-bg-el flex items-center justify-center flex-shrink-0">{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${a.color}`}>{a.text}</p>
                  <p className="text-xs text-text-muted mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="font-display font-bold text-lg mb-3 text-text-primary">Recent Videos</h2>
      {loading ? (
        <div className="animate-pulse h-40 bg-bg-card rounded-2xl border border-border"></div>
      ) : (
        <VideoTable videos={recentVideos} />
      )}
    </div>
  );
};

export default DashboardPage;