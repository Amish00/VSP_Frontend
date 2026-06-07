import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import api from '../api/Api';

const formatRelativeDate = (isoString) => {
  if (!isoString) return 'Recently';
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} weeks ago`;
};

const mapYouTubeVideo = (ytVideo) => ({
  id: ytVideo.id,
  title: ytVideo.title,
  thumbnailUrl: ytVideo.thumbnailUrl,
  username: ytVideo.channelTitle,
  channelId: ytVideo.channelId,
  views: ytVideo.viewCount ? ytVideo.viewCount.toLocaleString() : '?',
  likes: '?',
  time: formatRelativeDate(ytVideo.publishedAt),
  paid: false,
  profilePicture: ytVideo.profilePictureUrl || null,
  isYouTube: true,
  publishedAt: ytVideo.publishedAt,
  description: ytVideo.description || '',
});

const YouTubePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await api.get('/youtube/trending', { params: { max: 24 } });
      setVideos(response.data.map(mapYouTubeVideo));
    } catch (err) {
      console.error('Failed to fetch trending:', err);
      setError('Failed to load trending videos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await api.get('/youtube/search', { params: { q: searchQuery, max: 24 } });
      setVideos(response.data.map(mapYouTubeVideo));
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to search YouTube. Please check your login and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWatch = (video) => {
    navigate(`/watch/youtube/${video.id}`, { state: { video } });
  };

  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-[68px] md:pt-[92px] pb-16">
      {/* Header with title/description on left, search on right */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          {/* YouTube logo from Icon8 */}
          <img 
            src="https://img.icons8.com/color/48/youtube-play.png" 
            alt="YouTube Logo" 
            className="w-8 h-8 sm:w-10 sm:h-10"
          />
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">YouTube</h1>
            <p className="text-text-secondary">Search and watch videos from YouTube</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="sm:mt-0">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search YouTube videos..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-bg-el text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Search
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-500 bg-red-500/10 rounded-xl p-4">
          {error}
        </div>
      )}

      {!loading && hasSearched && videos.length === 0 && !error && (
        <div className="text-center py-12 text-text-secondary">
          {searchQuery ? `No videos found for "${searchQuery}"` : 'No trending videos available at the moment'}
        </div>
      )}

      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} onClick={handleWatch} />
          ))}
        </div>
      )}
    </div>
  );
};

export default YouTubePage;