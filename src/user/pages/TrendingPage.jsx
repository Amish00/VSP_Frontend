import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VideoGrid from '../components/VideoGrid';
import api, { canWatchPaidVideo } from '../api/Api';
import { useAuth } from '../../auth/context/AuthContext';
import LockedModal from '../components/LockedModal';

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
  const diffMin = diffMs / 1000 / 60;
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
  thumbnailUrl: video.thumbnailUrl,
  username: video.username,
  profilePicture: video.profilePicture,
  em: video.thumbnailUrl ? '' : '🎬',
  description: video.description,
  tags: video.tags?.split(',') || [],
  category: video.category,
});

const filterOutShorts = (videos) => videos.filter(v => v.type !== 'SHORT' && v.type !== 'SHORTS' && !v.isShort);

const TrendingPage = () => {
  const [freeVideos, setFreeVideos] = useState([]);
  const [paidVideos, setPaidVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState('');
  const [freePage, setFreePage] = useState(0);
  const [paidPage, setPaidPage] = useState(0);
  const [hasMoreFree, setHasMoreFree] = useState(true);
  const [hasMorePaid, setHasMorePaid] = useState(true);
  const [loadingMoreFree, setLoadingMoreFree] = useState(false);
  const [loadingMorePaid, setLoadingMorePaid] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch videos by type (free or paid) with pagination
  const fetchVideos = async (page, isPaid) => {
    const params = { page, size: 12, sort: 'publishedAt,desc' };
    const response = await api.get('/videos', { params });
    const all = filterOutShorts(response.data.content || []);
    return all.filter(v => v.paid === isPaid);
  };

  // Load initial videos for both sections
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const [free, paid] = await Promise.all([
          fetchVideos(0, false),
          fetchVideos(0, true)
        ]);
        setFreeVideos(free);
        setPaidVideos(paid);
        setHasMoreFree(free.length === 12);
        setHasMorePaid(paid.length === 12);
        setFreePage(1);
        setPaidPage(1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, []);

  const loadMoreFree = async () => {
    if (loadingMoreFree || !hasMoreFree) return;
    setLoadingMoreFree(true);
    try {
      const newVideos = await fetchVideos(freePage, false);
      setFreeVideos(prev => [...prev, ...newVideos]);
      setHasMoreFree(newVideos.length === 12);
      setFreePage(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMoreFree(false);
    }
  };

  const loadMorePaid = async () => {
    if (loadingMorePaid || !hasMorePaid) return;
    setLoadingMorePaid(true);
    try {
      const newVideos = await fetchVideos(paidPage, true);
      setPaidVideos(prev => [...prev, ...newVideos]);
      setHasMorePaid(newVideos.length === 12);
      setPaidPage(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMorePaid(false);
    }
  };

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
        <div className="text-center py-12 text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-[68px] md:pt-[92px] pb-[96px] md:pb-16">
      {/* Free Videos Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Trending Free</h1>
          <a
            href="/all-videos?type=free"
            className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm font-semibold"
          >
            View all free <ArrowRight size={16} />
          </a>
        </div>
        {freeVideos.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">No free videos available.</div>
        ) : (
          <>
            <VideoGrid videos={freeVideos.map(transformVideo)} onWatch={handleWatch} />
            {hasMoreFree && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={loadMoreFree}
                  disabled={loadingMoreFree}
                  className="px-5 py-2 rounded-lg bg-bg-el text-text-primary font-medium hover:bg-bg-hov transition disabled:opacity-50"
                >
                  {loadingMoreFree ? 'Loading...' : 'Load More Free Videos'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Paid Videos Section - updated to match Home layout */}
      <div>
        <div className="flex flex-wrap items-center justify-between mb-2 mt-4 gap-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Trending Paid</h1>
          <div className="flex items-center gap-3">
            {!user && (
              <span className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
                <Lock size={13} /> Sign in to watch
              </span>
            )}
            <a
              href="/all-videos?type=paid"
              className="text-xs sm:text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              View more <ArrowRight size={16} />
            </a>
          </div>
        </div>
        {paidVideos.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">No paid videos available.</div>
        ) : (
          <>
            <VideoGrid videos={paidVideos.map(transformVideo)} onWatch={handleWatch} />
            {hasMorePaid && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={loadMorePaid}
                  disabled={loadingMorePaid}
                  className="px-5 py-2 rounded-lg bg-bg-el text-text-primary font-medium hover:bg-bg-hov transition disabled:opacity-50"
                >
                  {loadingMorePaid ? 'Loading...' : 'Load More Paid Videos'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <LockedModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        videoTitle={selectedVideoTitle}
      />
    </div>
  );
};

export default TrendingPage;