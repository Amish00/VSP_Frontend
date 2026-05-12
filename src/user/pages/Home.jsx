import React, { useState, useEffect } from 'react';
import HeroCarousel from '../../user/components/HeroCarousel';
import VideoGrid from '../../user/components/VideoGrid';
import { ArrowRight } from 'lucide-react';
import api from '../../user/api/Api';
import { useNavigate } from 'react-router-dom';

const formatNumber = (num) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
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

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();   

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.get('/videos', {
          params: { page: 0, size: 20, sort: 'publishedAt,desc' }
        });
        setVideos(response.data.content);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const transformedVideos = videos.map((video) => ({
    id: video.id,
    title: video.title,
    paid: video.paid,
    views: formatNumber(video.viewCount),
    likes: formatNumber(video.likesCount),
    time: formatRelativeDate(video.updatedAt),
    thumb: video.thumbnailUrl,
    username: video.username,
    profilePicture: video.profilePicture, 
    em: video.thumbnailUrl ? '' : '🎬',
  }));

  const handleWatch = (video) => {
    navigate(`/watch/${video.id}`);
  };

  if (loading) return <div className="p-8 text-center text-text-muted">Loading videos...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <HeroCarousel />
      </div>
      <div className="flex flex-wrap items-center justify-between mb-4 mt-4">
        <h1 className="text-3xl font-bold">Trending Free</h1>
        <a href="/trending" className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
          View more <ArrowRight size={16} />
        </a>
      </div>
      <div className="mb-10">
        <VideoGrid videos={transformedVideos} onWatch={handleWatch} />
      </div>
    </div>
  );
};

export default Home;