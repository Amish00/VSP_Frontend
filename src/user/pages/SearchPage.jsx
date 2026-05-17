// src/pages/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VideoGrid from '../components/VideoGrid';
import api,{ canWatchPaidVideo } from '../api/Api';
import { useAuth } from '../../auth/context/AuthContext';
import LockedModal from '../components/LockedModal';
import { Search } from 'lucide-react';

const formatNumber = (num) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num?.toString() || '0';
};

const formatRelativeDate = (isoDate) => {
  if (!isoDate) return 'Recently';
  const date = new Date(isoDate);
  const now = new Date();
  const diffMin = (now - date) / 1000 / 60;
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

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [allVideos, setAllVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch ALL approved videos (client‑side search)
  useEffect(() => {
    const fetchAllVideos = async () => {
      setLoading(true);
      setError(null);
      let page = 0;
      let all = [];
      let hasMore = true;

      try {
        while (hasMore) {
          const response = await api.get('/videos', {
            params: { page, size: 50, sort: 'publishedAt,desc' }
          });
          const content = response.data.content;
          if (content.length === 0) {
            hasMore = false;
          } else {
            all = [...all, ...content];
            page++;
            if (all.length > 1000) hasMore = false; // safety limit
          }
        }
        setAllVideos(all);
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        setError('Could not load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllVideos();
  }, []);

  // Filter videos by query (title, username, tags, category)
  useEffect(() => {
    if (!query.trim()) {
      setFilteredVideos([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allVideos.filter(video => {
      const titleMatch = video.title?.toLowerCase().includes(lowerQuery);
      const usernameMatch = video.username?.toLowerCase().includes(lowerQuery);
      const tagsMatch = video.tags?.toLowerCase().includes(lowerQuery);
      const categoryMatch = video.category?.toLowerCase().includes(lowerQuery);
      return titleMatch || usernameMatch || tagsMatch || categoryMatch;
    });
    setFilteredVideos(filtered);
  }, [query, allVideos]);

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
          <div className="h-8 w-64 bg-bg-card rounded"></div>
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
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-[68px] md:pt-[92px] pb-[96px] md:pb-16">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Search Results for "{query}"
        </h1>
        <p className="text-text-muted mt-1">
          {filteredVideos.length} video(s) found
        </p>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">No videos match your search.</p>
        </div>
      ) : (
        <VideoGrid videos={filteredVideos.map(transformVideo)} onWatch={handleWatch} />
      )}

      <LockedModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        videoTitle={selectedVideoTitle}
      />
    </div>
  );
};

export default SearchPage;