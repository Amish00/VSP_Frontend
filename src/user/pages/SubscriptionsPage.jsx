// src/pages/SubscriptionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoGrid from '../components/VideoGrid';
import api from '../api/Api';
import { Lock, ArrowRight } from 'lucide-react';
import ChannelStrip from '../components/video/ChannelStrip';

const formatNumber = (num) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num?.toString() || '0';
};

const formatRelativeDate = (isoDate) => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = diffMs / 1000;
  const diffMin = diffSec / 60;
  const diffHour = diffMin / 60;
  const diffDay = diffHour / 24;
  if (diffDay >= 7) return `${Math.floor(diffDay / 7)} weeks ago`;
  if (diffDay >= 1) return `${Math.floor(diffDay)} days ago`;
  if (diffHour >= 1) return `${Math.floor(diffHour)} hours ago`;
  if (diffMin >= 1) return `${Math.floor(diffMin)} minutes ago`;
  return 'Just now';
};

const SubscriptionsPage = () => {
  const navigate = useNavigate();
  const [subscribedVideos, setSubscribedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }
    setIsLoggedIn(true);
    const fetchSubscribedVideos = async () => {
      try {
        const response = await api.get('/subscriptions/subscribed', {
          params: { page: 0, size: 8, sort: 'publishedAt,desc' }
        });
        setSubscribedVideos(response.data.content || []);
      } catch (err) {
        console.error('Failed to fetch subscribed videos:', err);
        if (err.response?.status === 401) {
          sessionStorage.removeItem('access_token');
          setIsLoggedIn(false);
          setError('Session expired. Please log in again.');
        } else {
          setError(err.message || 'Failed to load subscriptions');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribedVideos();
  }, []);

  const handleWatch = (video) => {
    navigate(`/watch/${video.id}`);
  };

  const handleChannelClick = (channel) => {
    navigate(`/search?q=${encodeURIComponent(channel.name)}`);
  };

  if (loading) {
    return <div className="p-8 text-center text-text-muted">Loading subscriptions...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-[68px] md:pt-[92px] pb-[96px] md:pb-16">
        <h1 className="text-3xl font-bold mb-6">Subscriptions</h1>
        <div className="text-center py-12">
          <p className="text-text-secondary">Please log in to see your subscribed channels and videos.</p>
        </div>
      </div>
    );
  }

  const freeVideos = subscribedVideos.filter(v => !v.paid);
  const paidVideos = subscribedVideos.filter(v => v.paid);

  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-[68px] md:pt-[92px] pb-[96px] md:pb-16">
      <h1 className="text-3xl font-bold mb-6">Subscriptions</h1>

      <ChannelStrip onChannelClick={handleChannelClick} />

      {subscribedVideos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary">No videos from subscribed channels yet.</p>
        </div>
      )}

      {freeVideos.length > 0 && (
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold">Latest Free</h2>
            <a
              href="/subscribed-videos?type=free"
              className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm font-semibold"
            >
              View all free <ArrowRight size={16} />
            </a>
          </div>
          <VideoGrid
            videos={freeVideos.map(v => ({
              id: v.id,
              title: v.title,
              paid: v.paid,
              views: formatNumber(v.viewCount),
              likes: formatNumber(v.likesCount),
              time: formatRelativeDate(v.updatedAt),
              thumbnailUrl: v.thumbnailUrl,
              username: v.username,
              profilePicture: v.profilePicture,
              em: v.thumbnailUrl ? '' : '🎬',
            }))}
            onWatch={handleWatch}
          />
        </div>
      )}

      {paidVideos.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-3xl font-bold">Latest Paid</h2>
            <a
              href="/subscribed-videos?type=paid"
              className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm font-semibold"
            >
              View all paid <ArrowRight size={16} />
            </a>
          </div>
          {!isLoggedIn && (
            <p className="flex items-center gap-1.5 text-sm text-text-muted mb-3">
              <Lock size={13} /> Log in to watch paid videos
            </p>
          )}
          <VideoGrid
            videos={paidVideos.map(v => ({
              id: v.id,
              title: v.title,
              paid: v.paid,
              views: formatNumber(v.viewCount),
              likes: formatNumber(v.likesCount),
              time: formatRelativeDate(v.updatedAt),
              thumbnailUrl: v.thumbnailUrl,
              username: v.username,
              profilePicture: v.profilePicture,
              em: v.thumbnailUrl ? '' : '🎬',
            }))}
            onWatch={handleWatch}
          />
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;