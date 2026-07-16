// src/user/pages/WatchPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/video/VideoPlayer';
import VideoDescription from '../components/video/VideoDescription';
import CommentSection from '../components/video/CommentSection';
import UpNextPanel from '../components/video/UpNextPanel';
import api, { canWatchPaidVideo } from '../api/Api';
import { useAuth } from '../../auth/context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import LockedModal from '../components/LockedModal';
import ShareModal from '../components/ShareModal';
import { Bookmark, Heart, Share2, Lock, Check } from 'lucide-react';

// ─── Helper: same logic as in UpNextPanel ────────────────────────────────────
const isShortVideo = (video) => {
  if (!video) return false;
  const type = video.type?.toString?.()?.trim?.()?.toUpperCase?.() || '';
  if (type === 'SHORT' || type === 'SHORTS') return true;
  if (video.isShort === true) return true;
  return false;
};
// ─────────────────────────────────────────────────────────────────────────────

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

const WatchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useNotification();

  const showErrorRef = useRef(showError);
  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  const [video, setVideo] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaidBlocked, setIsPaidBlocked] = useState(false);
  const [paidModalOpen, setPaidModalOpen] = useState(false);
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  // ─── Close modals when video changes ──────────────────────────────────────
  useEffect(() => {
    setPaidModalOpen(false);
    setSignInModalOpen(false);
  }, [id]);

  const syncViewCount = useCallback(async () => {
    if (!id || isPaidBlocked) return;
    try {
      const response = await api.get(`/videos/${id}`);
      const latestViewCount = response.data.viewCount ?? 0;
      setViewCount(latestViewCount);
      setVideo(prev => (prev ? { ...prev, viewCount: latestViewCount } : prev));
    } catch (err) {
      console.error('Failed to fetch updated view count:', err);
    }
  }, [id, isPaidBlocked]);

  // ─── Fetch video ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchVideo = async () => {
      // Reset blocking and clear old video
      setIsPaidBlocked(false);
      setVideo(null);
      setLoading(true);
      try {
        const response = await api.get(`/videos/${id}`);
        const videoData = response.data;
        if (videoData.paid && !canWatchPaidVideo(user)) {
          setIsPaidBlocked(true);
          setVideo(videoData);
          setViewCount(videoData.viewCount);
          setLoading(false);
          return;
        }
        setVideo(videoData);
        setViewCount(videoData.viewCount);
        setLikesCount(videoData.likesCount);
        if (videoData.likedByCurrentUser !== undefined) setLiked(videoData.likedByCurrentUser);
        setError(null);
      } catch (err) {
        setError(err.message);
        showErrorRef.current('Failed to load video');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVideo();
  }, [id, user]);

  // ─── Sync view count every 30s ───────────────────────────────────────────
  useEffect(() => {
    if (!video || isPaidBlocked) return;
    syncViewCount();
    const intervalId = setInterval(syncViewCount, 30000);
    return () => clearInterval(intervalId);
  }, [video?.id, isPaidBlocked, syncViewCount]);

  // ─── Subscriber info ──────────────────────────────────────────────────────
  useEffect(() => {
    if (video?.userId && !isPaidBlocked) {
      const fetchSubInfo = async () => {
        try {
          const res = await api.get(`/subscriptions/${video.userId}/info`);
          setSubscriberCount(res.data.subscriberCount);
          setIsSubscribed(res.data.subscribedByCurrentUser);
        } catch (err) {
          console.error(err);
        }
      };
      fetchSubInfo();
    }
  }, [video, isPaidBlocked]);

  // ─── Like status ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (id && video?.likedByCurrentUser === undefined && !isPaidBlocked) {
      const fetchLikeStatus = async () => {
        try {
          const res = await api.get(`/videos/${id}/like/status`);
          setLiked(res.data.liked);
          setLikesCount(res.data.likeCount);
        } catch (err) {
          console.error(err);
        }
      };
      fetchLikeStatus();
    }
  }, [id, video, isPaidBlocked]);

  // ─── Suggestions (only regular videos, no shorts) ──────────────────────
  useEffect(() => {
    if (!video?.id) return;
    const fetchSuggestions = async () => {
      try {
        const response = await api.get('/videos', {
          params: { page: 0, size: 12, sort: 'publishedAt,desc' },
        });
        // Exclude current video and shorts
        let filtered = response.data.content.filter(
          (v) => v.id !== video.id && !isShortVideo(v)
        );
        setSuggestions(filtered.slice(0, 10));
      } catch (err) {
        console.error(err);
      }
    };
    fetchSuggestions();
  }, [video]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSubscribe = async () => {
    if (!video?.userId || isPaidBlocked) return;
    if (!user) {
      setSignInModalOpen(true);
      return;
    }
    try {
      if (isSubscribed) {
        await api.delete(`/subscriptions/${video.userId}`);
        setIsSubscribed(false);
        setSubscriberCount(prev => Math.max(0, prev - 1));
      } else {
        await api.post(`/subscriptions/${video.userId}`);
        setIsSubscribed(true);
        setSubscriberCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
      showErrorRef.current('Failed to update subscription');
    }
  };

  const handleLike = async () => {
    if (isPaidBlocked) return;
    if (!user) {
      setSignInModalOpen(true);
      return;
    }
    try {
      if (liked) {
        await api.delete(`/videos/${id}/like`);
        setLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await api.post(`/videos/${id}/like`);
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
      showErrorRef.current('Failed to update like');
    }
  };

  const handleWatch = (suggestedVideo) => navigate(`/watch/${suggestedVideo.id}`);
  const handleModalClose = () => {
    setPaidModalOpen(false);
    setSignInModalOpen(false);
  };

  // ─── Loading / error states ──────────────────────────────────────────────
  if (loading) return <div className="p-8 text-center text-text-muted">Loading video...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!video) return <div className="p-8 text-center">Video not found</div>;

  // ─── Build props for description and up next ─────────────────────────────
  const descriptionProps = {
    views: formatNumber(viewCount),
    time: formatRelativeDate(video.updatedAt),
    paid: video.paid,
    cat: video.category,
    desc: video.description || '',
    tags: video.tags ? video.tags.split(',').map(t => t.trim()) : [],
  };

  const upNextVideos = suggestions.map((v) => ({
    id: v.id,
    title: v.title,
    thumb: v.thumbnailUrl,
    views: formatNumber(v.viewCount),
    paid: v.paid,
    username: v.username,
    time: formatRelativeDate(v.updatedAt),
    em: v.thumbnailUrl ? '' : '🎬',
    thumbnailUrl: v.thumbnailUrl,
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // ─── LOCKED UI ───────────────────────────────────────────────────────────
  // ───────────────────────────────────────────────────────────────────────────
  if (isPaidBlocked) {
    return (
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-[68px] md:pt-[92px] pb-[96px] md:pb-16">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
          <div>
            <div className="relative rounded-xl overflow-hidden bg-black/80" style={{ aspectRatio: '16/9' }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <Lock size={40} className="text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Premium Content Locked</h2>
                <p className="text-text-secondary mb-4 max-w-md">
                  This video is only available for Premium users.
                </p>
                <button
                  onClick={() => setPaidModalOpen(true)}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition"
                >
                  Upgrade to Watch
                </button>
              </div>
              {video.thumbnailUrl && (
                <img
                  src={video.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover blur-md opacity-30"
                />
              )}
            </div>
            <h1 className="text-3xl font-bold leading-tight mb-3 mt-4 text-text-primary">
              {video.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 pb-4 mb-4 border-b border-border">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                  {video.profilePicture ? (
                    <img
                      src={video.profilePicture}
                      alt={video.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{video.username?.[0]?.toUpperCase() || '?'}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary truncate">
                    {video.username || 'Anonymous'}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {subscriberCount.toLocaleString()} subscribers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaidModalOpen(true)}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white shadow-[0_2px_8px_rgba(37,99,235,.4)]"
              >
                Subscribe
              </button>
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-bg-el text-text-secondary text-sm font-semibold">
                  <Heart size={14} fill="none" /> {formatNumber(likesCount)}
                </button>
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-bg-el text-text-secondary text-sm font-semibold"
                >
                  <Share2 size={14} /> Share
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-bg-el text-text-secondary text-sm font-semibold">
                  <Bookmark size={14} /> Save
                </button>
              </div>
            </div>
            <VideoDescription video={descriptionProps} />
            <div className="mt-6">
              <CommentSection videoId={id} />
            </div>
          </div>
          <div>
            <UpNextPanel videos={upNextVideos} onWatch={handleWatch} />
          </div>
        </div>
        <LockedModal
          isOpen={paidModalOpen}
          onClose={handleModalClose}
          videoTitle={video.title}
          mode="signin_and_plans"
        />
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          url={`${window.location.origin}/watch/${video.id}`}
          title={video.title}
          thumbnail={video.thumbnailUrl}
        />
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ─── NORMAL UI ───────────────────────────────────────────────────────────
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-[68px] md:pt-[92px] pb-[96px] md:pb-16">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div>
          <div className="mb-4">
            <VideoPlayer video={video} onViewRecorded={syncViewCount} />
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-3 text-text-primary">
            {video.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 pb-4 mb-4 border-b border-border">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                {video.profilePicture ? (
                  <img
                    src={video.profilePicture}
                    alt={video.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{video.username?.[0]?.toUpperCase() || '?'}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-text-primary truncate">
                  {video.username || 'Anonymous'}
                </p>
                <p className="text-sm text-text-secondary">
                  {subscriberCount.toLocaleString()} subscribers
                </p>
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              aria-pressed={isSubscribed}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white shadow-[0_2px_8px_rgba(37,99,235,.4)] hover:bg-primary-dark transition"
            >
              {isSubscribed && <Check size={16} />}
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>

            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <button
                onClick={handleLike}
                aria-pressed={liked}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
                  liked
                    ? 'border-border bg-bg-el text-text-secondary'
                    : 'border-border bg-bg-el text-text-secondary hover:bg-bg-hov'
                }`}
              >
                <Heart
                  size={14}
                  fill={liked ? 'currentColor' : 'none'}
                  className={liked ? 'text-red-500' : ''}
                />
                {formatNumber(likesCount)}
              </button>
              <button
                onClick={() => setShareModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-bg-el text-text-secondary text-sm font-semibold hover:bg-bg-hov transition-all"
              >
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
        <div>
          <UpNextPanel videos={upNextVideos} onWatch={handleWatch} />
        </div>
      </div>

      <LockedModal
        isOpen={paidModalOpen}
        onClose={handleModalClose}
        videoTitle={video.title}
        mode="signin_and_plans"
      />
      <LockedModal
        isOpen={signInModalOpen}
        onClose={handleModalClose}
        mode="signin"
      />
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        url={`${window.location.origin}/watch/${video.id}`}
        title={video.title}
        thumbnail={video.thumbnailUrl}
      />
    </div>
  );
};

export default WatchPage;