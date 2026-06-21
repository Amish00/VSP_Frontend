import React, { useState, useEffect } from 'react';
import StatCard from '../components/ui/StatCard';
import ViewsChart from '../components/ViewsChart';
import EarningsChart from '../components/EarningsChart';
import ContentPieChart from '../components/ContentPieChart';
import VideoTable from '../components/VideoTable';
import { creatorApi } from '../api/creatorApi';
import { getNotifications, markNotificationAsRead } from '../../user/api/Api'; 

import { FiEye, FiDollarSign, FiUsers, FiFilm } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import {
  CheckCircle,
  XCircle,
  VideoIcon,
  BarChart,
  MessageCircle,
  Heart,
  UserPlus,
  User,
  Bell,
} from 'lucide-react';

const DashboardPage = ({ user }) => {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalEarnings: 0,
    subscriberCount: 0,
    totalLikes: 0,
  });
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Helper: format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Helper: relative time
  const timeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(date).toLocaleDateString();
  };

  // Map notification type to icon
  const getActivityIcon = (type) => {
    const icons = {
      VIDEO_APPROVED: <CheckCircle className="text-green-500" size={18} />,
      VIDEO_REJECTED: <XCircle className="text-red-500" size={18} />,
      NEW_VIDEO_UPLOAD: <VideoIcon className="text-blue-500" size={18} />,
      PAYOUT_REQUEST: <FiDollarSign className="text-amber-500" size={18} />,
      MONTHLY_EARNINGS: <BarChart className="text-purple-500" size={18} />,
      MONTHLY_REVENUE_REPORT: <BarChart className="text-pink-500" size={18} />,
      NEW_SUBSCRIBER: <User className="text-teal-500" size={18} />,
      NEW_COMMENT: <MessageCircle className="text-indigo-500" size={18} />,
      VIDEO_LIKE: <Heart className="text-rose-500" size={18} />,
      NEW_USER_REGISTRATION: <UserPlus className="text-lime-500" size={18} />,
    };
    return icons[type] || <Bell className="text-gray-500" size={18} />;
  };

  // Fetch dashboard data + 3 latest notifications
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, videosRes, notifRes] = await Promise.all([
          creatorApi.getDashboardStats(),
          creatorApi.getVideos(null, '', 5, 0),
          getNotifications(0, 3), // only 3 latest
        ]);

        setStats(statsRes.data);
        setRecentVideos(videosRes.data.content || []);

        const activities = (notifRes.data.content || []).map((n) => ({
          id: n.id,
          icon: getActivityIcon(n.type),
          text: `${n.title}: ${n.message}`,
          time: timeAgo(n.createdAt),
          unread: !n.read,
        }));
        setRecentActivities(activities);
        setActivitiesLoading(false);
      } catch (err) {
        console.error('Failed to load dashboard', err);
        setActivitiesLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Handle click on an activity: mark as read
  const handleActivityClick = async (id) => {
    // Optimistically update UI
    setRecentActivities((prev) =>
      prev.map((act) =>
        act.id === id ? { ...act, unread: false } : act
      )
    );

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
      // Revert on error
      setRecentActivities((prev) =>
        prev.map((act) =>
          act.id === id ? { ...act, unread: true } : act
        )
      );
    }
  };

  const STATS = [
    { icon: <FiEye color="#60A5FA" />, label: 'Total Views', value: formatNumber(stats.totalViews), change: '+18% this month', color: '#60A5FA' },
    { icon: <FiDollarSign color="#10B981" />, label: 'Earnings', value: `$${stats.totalEarnings.toLocaleString()}`, change: '+$180 this month', color: '#10B981' },
    { icon: <FiUsers color="#F59E0B" />, label: 'Subscribers', value: formatNumber(stats.subscriberCount), change: '+340 this month', color: '#F59E0B' },
    { icon: <FaHeart color="#EF4444" />, label: 'Total Likes', value: formatNumber(stats.totalLikes), change: '+2.1K this month', color: '#EF4444' },
  ];

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary mb-0.5">Dashboard</h1>
          <p className="text-sm text-text-secondary">
            Welcome back, <span className="text-primary-light font-semibold">{user?.name?.split(' ')[0] || 'Creator'}</span>
          </p>
        </div>
        <div className="text-sm text-text-muted bg-bg-el border border-border rounded-xl px-4 py-2">
          Revenue share: <span className="text-success font-bold">70%</span> to you
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ViewsChart />
        <EarningsChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ContentPieChart />
        <div className="bg-bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-bold text-base mb-4 text-text-primary">Recent Activity</h3>
          {activitiesLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-12 bg-bg-el rounded-xl" />
              <div className="h-12 bg-bg-el rounded-xl" />
              <div className="h-12 bg-bg-el rounded-xl" />
            </div>
          ) : recentActivities.length === 0 ? (
            <p className="text-text-muted text-sm">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((a) => (
                <div
                  key={a.id}
                  onClick={() => a.unread && handleActivityClick(a.id)}
                  className={`flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 transition-colors ${
                    a.unread ? 'cursor-pointer hover:bg-bg-hov/30 rounded-lg px-2 -mx-2' : 'cursor-default'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-bg-el flex items-center justify-center flex-shrink-0">
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${a.unread ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {a.text}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{a.time}</p>
                  </div>
                  {a.unread && <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />}
                </div>
              ))}
            </div>
          )}
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