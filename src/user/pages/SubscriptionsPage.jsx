import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import VideoGrid from '../components/VideoGrid';
import ShortsCard from '../components/shorts/ShortsCard';
import api from '../api/Api';
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

// ─── Skeleton Loader ──────────────────────────────────────────────
const SkeletonLoader = () => {
  // Skeleton items for shorts (5 items) and videos (8 items)
  const shortSkeletons = Array(5).fill(0);
  const videoSkeletons = Array(8).fill(0);

  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-[68px] md:pt-[92px] pb-[96px] md:pb-16">
      {/* Page title */}
      <div className="h-9 w-48 bg-bg-el/60 rounded-xl animate-pulse mb-6" />

      {/* Channel Strip skeleton */}
      <div className="flex gap-4 mb-8 overflow-hidden">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-24 h-24 rounded-full bg-bg-el/60 animate-pulse" />
        ))}
      </div>

      {/* Shorts section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <div className="h-8 w-32 bg-bg-el/60 rounded-lg animate-pulse" />
          <div className="h-5 w-8 bg-bg-el/60 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {shortSkeletons.map((_, i) => (
            <div key={i} className="aspect-[9/16] bg-bg-el/60 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>

      {/* Videos section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="h-8 w-32 bg-bg-el/60 rounded-lg animate-pulse" />
          <div className="h-5 w-8 bg-bg-el/60 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videoSkeletons.map((_, i) => (
            <div key={i} className="bg-bg-el/60 rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-video bg-bg-el/80" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-bg-el/80 rounded w-3/4" />
                <div className="h-3 bg-bg-el/80 rounded w-1/2" />
                <div className="h-3 bg-bg-el/80 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────
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

  // ─── Loading State ──────────────────────────────────────────────
  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-[68px] md:pt-[92px] pb-[96px] md:pb-16">
        <h1 className="text-3xl font-bold mb-6">Subscriptions</h1>
        <div className="bg-bg-el border border-border rounded-3xl p-10 sm:p-12 flex flex-col items-center justify-center text-center min-h-[340px] py-16">
          <Lock className="w-10 h-10 text-text-muted mb-4" />
          <p className="text-text-secondary text-base sm:text-lg">
            Please log in to see your subscribed channels and videos.
          </p>
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

      {videos.length === 0 && shorts.length === 0 ? null : (
        <div className="mb-10">
          {shorts.length > 0 && (
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">Shorts</h2>
                <span className="text-sm text-text-muted">{shorts.length}</span>
              </div>
              {/*   Shorts grid – now more columns + smaller gap */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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