import React, { useState, useEffect } from 'react';
import HeroCarousel from '../../user/components/HeroCarousel';
import VideoGrid from '../../user/components/VideoGrid';
import { ArrowRight, Lock } from 'lucide-react';
import api, { canWatchPaidVideo } from '../api/Api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import LockedModal from '../components/LockedModal';

const formatNumber = (num) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num?.toString() || '0';
};

const formatRelativeDate = (isoDate) => {
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
  time: formatRelativeDate(video.updatedAt),
  thumb: video.thumbnailUrl,
  username: video.username,
  profilePicture: video.profilePicture,
  em: video.thumbnailUrl ? '' : '🎬',
});

const Home = () => {
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.get('/videos', {
          params: { page: 0, size: 20, sort: 'publishedAt,desc' }
        });
        setAllVideos(response.data.content);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Limit to 4 free and 4 paid = 8 cards total
  const freeVideos = allVideos.filter(v => !v.paid).slice(0, 4);
  const paidVideos = allVideos.filter(v => v.paid).slice(0, 4);

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

  if (loading) return <div className="p-8 text-center text-text-muted">Loading videos...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <HeroCarousel />
      </div>

      {/* Trending Free Section */}
      <div className="flex flex-wrap items-center justify-between mb-4 mt-4">
        <h1 className="text-3xl font-bold">Trending Free</h1>
        <a href="/all-videos?type=free" className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
          View more <ArrowRight size={16} />
        </a>
      </div>
      {freeVideos.length === 0 ? (
        <div className="text-center py-8 text-text-muted">No free videos available.</div>
      ) : (
        <div className="mb-10">
          <VideoGrid videos={freeVideos.map(transformVideo)} onWatch={handleWatch} />
        </div>
      )}

      {/* Trending Paid Section */}
      <div className="flex flex-wrap items-center justify-between mb-2 mt-4">
        <h1 className="text-3xl font-bold">Trending Paid</h1>
        <div className="flex items-center gap-3">
          {!user && (
            <span className="flex items-center gap-1 text-sm text-text-muted">
              <Lock size={13} /> Sign in to watch
            </span>
          )}
          <a href="/all-videos?type=paid" className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
            View more <ArrowRight size={16} />
          </a>
        </div>
      </div>
      {paidVideos.length === 0 ? (
        <div className="text-center py-8 text-text-muted">No paid videos available.</div>
      ) : (
        <div className="mb-10">
          <VideoGrid videos={paidVideos.map(transformVideo)} onWatch={handleWatch} />
        </div>
      )}

      <LockedModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        videoTitle={selectedVideoTitle}
      />
    </div>
  );
};

export default Home;