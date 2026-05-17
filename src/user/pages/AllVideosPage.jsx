import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VideoGrid from '../components/VideoGrid';
import api, { canWatchPaidVideo } from '../api/Api';
import { useAuth } from '../../auth/context/AuthContext';
import LockedModal from '../components/LockedModal';
import { Lock } from 'lucide-react';

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
  thumb: video.thumbnailUrl,
  username: video.username,
  profilePicture: video.profilePicture,
  em: video.thumbnailUrl ? '' : '🎬',
});

const AllVideosPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type'); // 'free' or 'paid'
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const isPaid = type === 'paid';

  const fetchVideos = useCallback(async (pageNum, append = false) => {
    const params = { page: pageNum, size: 12, sort: 'publishedAt,desc' };
    const response = await api.get('/videos', { params });
    const all = response.data.content;
    // Filter by paid status
    const filtered = all.filter(v => v.paid === isPaid);
    const newVideos = filtered;
    if (append) {
      setVideos(prev => [...prev, ...newVideos]);
    } else {
      setVideos(newVideos);
    }
    setHasMore(newVideos.length === 12);
    return newVideos;
  }, [isPaid]);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchVideos(0, false);
        setPage(1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (type) load();
    else setError('Invalid video type');
  }, [type, fetchVideos]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await fetchVideos(page, true);
      setPage(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
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

  const titleText = isPaid ? 'All Paid Videos' : 'All Free Videos';
  const lockMessage = !user && isPaid ? (
    <p className="flex items-center gap-1.5 text-sm text-text-muted mb-4">
      <Lock size={13} /> Log in to watch paid videos
    </p>
  ) : null;

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
      <h1 className="text-3xl font-bold mb-2">{titleText}</h1>
      {lockMessage}
      {videos.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">No videos found.</div>
      ) : (
        <>
          <VideoGrid videos={videos.map(transformVideo)} onWatch={handleWatch} />
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2 rounded-xl bg-bg-el text-text-primary font-semibold hover:bg-bg-hov transition disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
      <LockedModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        videoTitle={selectedVideoTitle}
      />
    </div>
  );
};

export default AllVideosPage;