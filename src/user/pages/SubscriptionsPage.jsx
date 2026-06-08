// src/pages/SubscriptionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoGrid from '../components/VideoGrid';
import ShortsCard from '../components/shorts/ShortsCard';
import api from '../api/Api';
import { Lock } from 'lucide-react';
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

const isShort = (video) => video.type === 'SHORT' || video.type === 'SHORTS' || video.isShort;

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

  const handleShortPlay = (short) => {
    navigate(`/shorts?play=${short.id}`);
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

  const videos = subscribedVideos.filter(v => !isShort(v));
  const shorts = subscribedVideos.filter(isShort);

  const transformVideo = (video) => ({
    id: video.id,
    title: video.title,
    paid: video.paid,
    views: formatNumber(video.viewCount),
    likes: formatNumber(video.likesCount),
    time: formatRelativeDate(video.updatedAt),
    thumbnailUrl: video.thumbnailUrl,
    username: video.username,
    profilePicture: video.profilePicture,
    em: video.thumbnailUrl ? '' : '🎬',
  });

  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-[68px] md:pt-[92px] pb-[96px] md:pb-16">
      <h1 className="text-3xl font-bold mb-6">Subscriptions</h1>

      <ChannelStrip onChannelClick={handleChannelClick} />

      {subscribedVideos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary">No videos from subscribed channels yet.</p>
        </div>
      )}

      {videos.length === 0 && shorts.length === 0 ? null : (
        <div className="mb-10">
          {shorts.length > 0 && (
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">Shorts</h2>
                <span className="text-sm text-text-muted">{shorts.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {shorts.map((short) => (
                  <ShortsCard key={short.id} short={short} onPlay={handleShortPlay} />
                ))}
              </div>
            </div>
          )}

          {videos.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">Videos</h2>
                <span className="text-sm text-text-muted">{videos.length}</span>
              </div>
              <VideoGrid
                videos={videos.map(transformVideo)}
                onWatch={handleWatch}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;