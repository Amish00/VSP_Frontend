import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/video/VideoPlayer';
import VideoDescription from '../components/video/VideoDescription';
import CommentSection from '../components/video/CommentSection';
import UpNextPanel from '../components/video/UpNextPanel';
import api from '../api/Api';
import { Bookmark, Heart, Share2 } from 'lucide-react';

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

const WatchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch current video
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await api.get(`/videos/${id}`);
        setVideo(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVideo();
  }, [id]);

  // Fetch subscriber info when video loads
  useEffect(() => {
    if (video?.userId) {
      const fetchSubInfo = async () => {
        try {
          const res = await api.get(`/subscriptions/${video.userId}/info`);
          setSubscriberCount(res.data.subscriberCount);
          setIsSubscribed(res.data.subscribedByCurrentUser);
        } catch (err) {
          console.error('Failed to fetch sub info', err);
        }
      };
      fetchSubInfo();
    }
  }, [video]);

  // Fetch suggested videos
  useEffect(() => {
    if (!video?.id) return;
    const fetchSuggestions = async () => {
      try {
        const response = await api.get('/videos', {
          params: { page: 0, size: 10, sort: 'publishedAt,desc' }
        });
        const filtered = response.data.content.filter(v => v.id !== video.id).slice(0, 5);
        setSuggestions(filtered);
      } catch (err) {
        console.error('Failed to load suggestions', err);
      }
    };
    fetchSuggestions();
  }, [video]);

  const handleSubscribe = async () => {
    if (!video?.userId) return;
    try {
      if (isSubscribed) {
        await api.delete(`/subscriptions/${video.userId}`);
        setIsSubscribed(false);
        setSubscriberCount(prev => prev - 1);
      } else {
        await api.post(`/subscriptions/${video.userId}`);
        setIsSubscribed(true);
        setSubscriberCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Subscription failed', err);
    }
  };

  const handleWatch = (suggestedVideo) => {
    navigate(`/watch/${suggestedVideo.id}`);
  };

  if (loading) return <div className="p-8 text-center text-text-muted">Loading video...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!video) return <div className="p-8 text-center">Video not found</div>;

  const descriptionProps = {
    views: formatNumber(video.viewCount),
    time: formatRelativeDate(video.updatedAt),
    paid: video.paid,
    cat: video.category,
    desc: video.description || '',
    tags: video.tags ? video.tags.split(',').map(t => t.trim()) : [],
  };

  const upNextVideos = suggestions.map(v => ({
    id: v.id,
    title: v.title,
    thumb: v.thumbnailUrl,
    views: formatNumber(v.viewCount),
    paid: v.paid,
    username: v.username,
    time: formatRelativeDate(v.updatedAt),
    em: v.thumbnailUrl ? '' : '🎬',
  }));

  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-8 pb-10">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* Left column */}
        <div>
          <div className="mb-4">
            <VideoPlayer video={video} />
          </div>

          {/* Fixed H1 style – consistent with design system */}
          <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl leading-tight mb-3 text-text-primary">
            {video.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 pb-4 mb-4 border-b border-border">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                {video.profilePicture ? (
                  <img src={video.profilePicture} alt={video.username} className="w-full h-full object-cover" />
                ) : (
                  <span>{video.username?.[0]?.toUpperCase() || '?'}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-text-primary truncate">{video.username || 'Anonymous'}</p>
                <p className="text-sm text-text-secondary">{subscriberCount.toLocaleString()} subscribers</p>
              </div>
            </div>
            <button
              onClick={handleSubscribe}
              aria-pressed={isSubscribed}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                isSubscribed
                  ? 'bg-bg-el border border-border text-text-secondary'
                  : 'bg-primary text-white shadow-[0_2px_8px_rgba(37,99,235,.4)]'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <button
                onClick={() => setLiked(p => !p)}
                aria-pressed={liked}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
                  liked
                    ? 'border-primary bg-primary/15 text-primary-light'
                    : 'border-border bg-bg-el text-text-secondary hover:bg-bg-hov'
                }`}
              >
                <Heart size={14} fill={liked ? 'currentColor' : 'none'} />{' '}
                {formatNumber(video.likesCount)}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-bg-el text-text-secondary text-sm font-semibold hover:bg-bg-hov transition-all">
                <Share2 size={14} /> Share
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-bg-el text-text-secondary text-sm font-semibold hover:bg-bg-hov transition-all">
                <Bookmark size={14} /> Save
              </button>
            </div>
          </div>

          <VideoDescription video={descriptionProps} />
          <div className="mt-6">
            <CommentSection videoId={id} />
          </div>
        </div>

        {/* Right column */}
        <div>
          <UpNextPanel videos={upNextVideos} onWatch={handleWatch} />
        </div>
      </div>
    </div>
  );
};

export default WatchPage;