import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import VideoGrid from '../components/VideoGrid';
import api, { canWatchPaidVideo } from '../api/Api';
import { useAuth } from '../../auth/context/AuthContext';
import LockedModal from '../components/LockedModal';

// Helper Functions
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

// Main Home Component

const Home = () => {
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState('');
  const [carouselVideos, setCarouselVideos] = useState([]);
  const [carouselLoading, setCarouselLoading] = useState(true);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch all videos from backend
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        // Fetch with pagination - get enough videos for good variety
        const response = await api.get('/videos', {
          params: { page: 0, size: 50, sort: 'publishedAt,desc' }
        });
        const fetchedVideos = response.data.content || response.data || [];
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

  // Prepare carousel videos (real data + random selection for variety)
  useEffect(() => {
    if (allVideos.length === 0) {
      setCarouselLoading(false);
      return;
    }
    
    setCarouselLoading(true);
    // Select 5 random videos for carousel OR top 5 by views
    // This ensures fresh content each time while still showing popular content
    let featured = [...allVideos];
    
    // 70% chance to show random videos, 30% chance to show top viewed
    const useRandom = Math.random() < 0.7;
    
    if (useRandom) {
      // Random selection - maximum variety
      featured = shuffleArray(featured).slice(0, 5);
    } else {
      // Sort by view count and take top 5
      featured = [...allVideos]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 5);
    }
    
    setCarouselVideos(featured.map(transformVideo));
    setCarouselLoading(false);
  }, [allVideos]);

  // Prepare random grid videos
  // IMPORTANT: This ensures video cards appear in different order on every page load
  const getRandomizedVideos = useCallback((videos, limit = 4) => {
    if (!videos.length) return [];
    // Shuffle the entire array to get random order
    const shuffled = shuffleArray(videos);
    // Return first N items after shuffling
    return shuffled.slice(0, limit).map(transformVideo);
  }, []);

  // Separate free and paid videos, then randomize each independently
  const freeVideosList = allVideos.filter(v => !v.paid);
  const paidVideosList = allVideos.filter(v => v.paid);
  
  // Apply randomization - this recalculates whenever allVideos changes
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

  if (loading) {
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
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Full-width carousel with REAL backend data */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <HeroCarousel 
          videos={carouselVideos} 
          onWatch={handleWatch}
          loading={carouselLoading}
        />
      </div>

      {/* Main content with consistent container */}
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-6 pb-[96px] md:pb-16 bg-gray-950">
        
        {/* Trending Free Section - RANDOM ORDER on each load */}
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
            <VideoGrid 
              videos={randomFreeVideos} 
              onWatch={handleWatch}
              emptyTitle="No free videos found"
            />
          </div>
        )}

        {/* Trending Paid Section - RANDOM ORDER on each load */}
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
            <VideoGrid 
              videos={randomPaidVideos} 
              onWatch={handleWatch}
              emptyTitle="No paid videos found"
            />
          </div>
        )}

        <LockedModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          videoTitle={selectedVideoTitle}
        />
      </div>
    </>
  );
};

export default Home;