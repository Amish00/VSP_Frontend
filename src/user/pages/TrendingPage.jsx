// src/pages/TrendingPage.jsx
import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';   // ✅ added
import VideoGrid from '../components/VideoGrid';
import api from '../api/Api';

// Helper functions (can be moved to a shared utils file)
const formatNumber = (num) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num?.toString() || '0';
};

const formatRelativeDate = (isoDate) => {
  if (!isoDate) return 'Recently';
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

const transformVideo = (video) => ({
  id: video.id,
  title: video.title,
  paid: video.paid,
  views: formatNumber(video.viewCount),
  likes: formatNumber(video.likesCount),
  time: formatRelativeDate(video.publishedAt),
  thumb: video.thumbnailUrl,
  username: video.username,
  profilePicture: video.profilePicture,
  em: video.thumbnailUrl ? '' : '🎬',
  description: video.description,
  tags: video.tags?.split(',') || [],
  category: video.category,
  duration: video.duration || '?',
});

const TrendingPage = ({ user }) => {
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();   // ✅ get navigate function

  // ✅ handleWatch defined inside component (was incorrectly placed outside)
  const handleWatch = (video) => {
    navigate(`/watch/${video.id}`);
  };

  useEffect(() => {
    const fetchTrendingVideos = async () => {
      try {
        const response = await api.get('/videos', {
          params: { page: 0, size: 30, sort: 'publishedAt,desc' }
        });
        const videos = response.data.content || [];
        setAllVideos(videos);
      } catch (err) {
        console.error('Failed to fetch trending videos:', err);
        setError(err.message || 'Could not load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingVideos();
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-[68px] md:pt-[92px] pb-[96px] md:pb-16">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 bg-bg-card rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-bg-card rounded-xl h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-[68px] md:pt-[92px] pb-[96px] md:pb-16">
        <div className="text-center py-12 text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  const freeVideos = allVideos.filter(v => !v.paid);
  const paidVideos = allVideos.filter(v => v.paid);

  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-[68px] md:pt-[92px] pb-[96px] md:pb-16">
      <h1 className="text-3xl font-bold mb-6">Trending Free</h1>
      {freeVideos.length === 0 ? (
        <div className="text-center text-text-secondary py-12">No free videos available.</div>
      ) : (
        <div className="mb-10">
          <VideoGrid videos={freeVideos.map(transformVideo)} onWatch={handleWatch} />
        </div>
      )}

      <h1 className="text-3xl font-bold mb-2">Trending Paid</h1>
      {!user && (
        <p className="flex items-center gap-1.5 text-sm text-text-muted -mt-1 mb-3">
          <Lock size={13} /> Log in to watch paid videos
        </p>
      )}
      {paidVideos.length === 0 ? (
        <div className="text-center text-text-secondary py-12">No paid videos available.</div>
      ) : (
        <VideoGrid videos={paidVideos.map(transformVideo)} onWatch={handleWatch} />
      )}
    </div>
  );
};

export default TrendingPage;