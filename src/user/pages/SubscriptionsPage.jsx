// src/pages/SubscriptionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoGrid from '../components/VideoGrid';
import api from '../api/Api';
import { Lock } from 'lucide-react';
import ChannelStrip from '../components/video/ChannelStrip';

// Helper functions (can be moved to a separate utils file)
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
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);

    const fetchSubscribedVideos = async () => {
      try {
        const response = await api.get('/subscriptions/subscribed', {
          params: { page: 0, size: 20, sort: 'publishedAt,desc' }
        });
        setSubscribedVideos(response.data.content || []);
      } catch (err) {
        console.error('Failed to fetch subscribed videos:', err);
        if (err.response?.status === 401) {
          // Token invalid or expired – clear and redirect to login
          localStorage.removeItem('access_token');
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

  if (loading) {
    return <div className="p-8 text-center text-text-muted">Loading subscriptions...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-[1760px] mx-auto px-4 sm:px-8 pb-10 pt-[68px] md:pt-[92px]">
        <h1 className="text-3xl font-bold mb-6">Subscriptions</h1>
        <div className="text-center py-12">
          <p className="text-text-secondary">Please log in to see your subscribed channels and videos.</p>
        </div>
      </div>
    );
  }

  // Separate free and paid videos
  const freeVideos = subscribedVideos.filter(v => !v.paid);
  const paidVideos = subscribedVideos.filter(v => v.paid);

  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-8 pb-10 pt-[68px] md:pt-[92px]">
      <h1 className="text-3xl font-bold mb-6">Subscriptions</h1>

      <ChannelStrip onChannelClick={(channel) => {
        console.log('Channel clicked:', channel);
      }} />

      {subscribedVideos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary">No videos from subscribed channels yet.</p>
        </div>
      )}

      {freeVideos.length > 0 && (
        <>
          <h2 className="font-display font-bold text-xl mb-4">Latest Free</h2>
          <div className="mb-10">
            <VideoGrid
              videos={freeVideos.map(v => ({
                id: v.id,
                title: v.title,
                paid: v.paid,
                views: formatNumber(v.viewCount),
                likes: formatNumber(v.likesCount),
                time: formatRelativeDate(v.updatedAt),
                thumb: v.thumbnailUrl,
                username: v.username,
                profilePicture: v.profilePicture,
                em: v.thumbnailUrl ? '' : '🎬',
              }))}
              onWatch={handleWatch}
            />
          </div>
        </>
      )}

      {paidVideos.length > 0 && (
        <>
          <h2 className="font-display font-bold text-xl mb-4">Latest Paid</h2>
          <div className="mb-10">
            <VideoGrid
              videos={paidVideos.map(v => ({
                id: v.id,
                title: v.title,
                paid: v.paid,
                views: formatNumber(v.viewCount),
                likes: formatNumber(v.likesCount),
                time: formatRelativeDate(v.updatedAt),
                thumb: v.thumbnailUrl,
                username: v.username,
                profilePicture: v.profilePicture,
                em: v.thumbnailUrl ? '' : '🎬',
              }))}
              onWatch={handleWatch}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SubscriptionsPage;