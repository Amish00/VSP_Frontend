import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import VideoGrid from '../components/VideoGrid';
import ShortsCard from '../components/shorts/ShortsCard';
import api, { canWatchPaidVideo } from '../api/Api';
import { useAuth } from '../../auth/context/AuthContext';
import LockedModal from '../components/LockedModal';

// Helper functions (keep as in your original)
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
};

const formatRelativeDate = (isoDate) => {
  if (!isoDate) return 'Recently';
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = diffMs / 1000 / 60;
  const diffHour = diffMin / 60;
  const diffDay = diffHour / 24;
  if (diffDay >= 7) return `${Math.floor(diffDay / 7)} weeks ago`;
  if (diffDay >= 1) return `${Math.floor(diffDay)} days ago`;
  if (diffHour >= 1) return `${Math.floor(diffHour)} hours ago`;
  if (diffMin >= 1) return `${Math.floor(diffMin)} minutes ago`;
  return 'Just now';
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const filterOutShorts = (videos) => videos.filter(v => v.type !== 'SHORT' && v.type !== 'SHORTS' && !v.isShort);

const transformVideo = (video) => ({
  id: video.id,
  title: video.title,
  paid: video.paid,
  views: formatNumber(video.viewCount),
  likes: formatNumber(video.likesCount),
  time: formatRelativeDate(video.updatedAt || video.publishedAt),
  thumbnailUrl: video.thumbnailUrl,
  username: video.username,
  profilePicture: video.profilePicture,
  category: video.category,
  duration: video.duration,
  viewCount: video.viewCount,
  likesCount: video.likesCount
});

const Home = () => {
  const [allVideos, setAllVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shortsLoading, setShortsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState('');
  const [carouselVideos, setCarouselVideos] = useState([]);
  const [carouselLoading, setCarouselLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch regular videos (non-shorts)
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await api.get('/videos', {
          params: { page: 0, size: 50, sort: 'publishedAt,desc' }
        });
        let fetchedVideos = response.data.content || response.data || [];
        fetchedVideos = filterOutShorts(fetchedVideos);
        setAllVideos(fetchedVideos);
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        setError(err.message || 'Failed to load videos');
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Fetch shorts – client-side filter
  useEffect(() => {
    const fetchShorts = async () => {
      try {
        setShortsLoading(true);
        const response = await api.get('/videos', {
          params: { page: 0, size: 100, sort: 'publishedAt,desc' }
        });
        const all = response.data.content || response.data || [];
        const shortsList = all.filter(v => v.type === 'SHORTS');
        setShorts(shortsList);
      } catch (err) {
        console.error('Failed to fetch shorts:', err);
      } finally {
        setShortsLoading(false);
      }
    };
    fetchShorts();
  }, []);

  // Carousel logic
  useEffect(() => {
    if (allVideos.length === 0) {
      setCarouselLoading(false);
      return;
    }
    setCarouselLoading(true);
    let featured = [...allVideos];
    const useRandom = Math.random() < 0.7;
    if (useRandom) {
      featured = shuffleArray(featured).slice(0, 5);
    } else {
      featured = [...allVideos]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 5);
    }
    setCarouselVideos(featured.map(transformVideo));
    setCarouselLoading(false);
  }, [allVideos]);

  const getRandomizedVideos = useCallback((videos, limit = 4) => {
    if (!videos.length) return [];
    const shuffled = shuffleArray(videos);
    return shuffled.slice(0, limit).map(transformVideo);
  }, []);

  const freeVideosList = allVideos.filter(v => !v.paid);
  const paidVideosList = allVideos.filter(v => v.paid);
  const randomFreeVideos = getRandomizedVideos(freeVideosList, 4);
  const randomPaidVideos = getRandomizedVideos(paidVideosList, 4);

  const handleWatch = (video) => {
    if (!video.paid) {
      navigate(`/watch/${video.id}`);
      return;
    }
    if (!canWatchPaidVideo(user)) {
      setSelectedVideoTitle(video.title);
      setModalOpen(true);
    } else {
      navigate(`/watch/${video.id}`);
    }
  };

  // Navigate to shorts player route
  const openShortsPlayer = (shortId) => {
    navigate(`/shorts/watch/${shortId}`);
  };

  // Show only 6 shorts in a grid (consistent with other sections)
  const displayedShorts = shorts.slice(0, 6);

  if (loading && allVideos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen pt-16">
      <HeroCarousel videos={carouselVideos} onWatch={handleWatch} loading={carouselLoading} />
    </div>

      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-6 pb-[96px] md:pb-16 bg-gray-950">
        
        {/* Trending Free Section */}
        <div className="flex flex-wrap items-center justify-between mb-4 mt-4 gap-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Trending Free</h1>
          <a href="/all-videos?type=free" className="text-xs sm:text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
            View more <ArrowRight size={16} />
          </a>
        </div>
        {randomFreeVideos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No free videos available at the moment.</div>
        ) : (
          <div className="mb-10">
            <VideoGrid videos={randomFreeVideos} onWatch={handleWatch} emptyTitle="No free videos found" hideShorts={true} />
          </div>
        )}

        {/* Shorts Section (grid) */}
        {!shortsLoading && displayedShorts.length > 0 && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Shorts</h1>
              <a href="/shorts" className="text-xs sm:text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
                View more <ArrowRight size={16} />
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {displayedShorts.map((short) => (
                <ShortsCard
                  key={short.id}
                  short={short}
                  onPlay={() => openShortsPlayer(short.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Trending Paid Section */}
        <div className="flex flex-wrap items-center justify-between mb-2 mt-4 gap-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Trending Paid</h1>
          <div className="flex items-center gap-3">
            {!user && (
              <span className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
                <Lock size={13} /> Sign in to watch
              </span>
            )}
            <a href="/all-videos?type=paid" className="text-xs sm:text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
              View more <ArrowRight size={16} />
            </a>
          </div>
        </div>
        {randomPaidVideos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No paid videos available at the moment.</div>
        ) : (
          <div className="mb-10">
            <VideoGrid videos={randomPaidVideos} onWatch={handleWatch} emptyTitle="No paid videos found" hideShorts={true} />
          </div>
        )}

        <LockedModal isOpen={modalOpen} onClose={() => setModalOpen(false)} videoTitle={selectedVideoTitle} />
      </div>
    </>
  );
};

export default Home;