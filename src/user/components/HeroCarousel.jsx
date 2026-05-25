// src/user/components/HeroCarousel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { FaPlay } from 'react-icons/fa';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';

const formatViews = (count) => {
  if (!count) return '0';
  if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + 'M';
  if (count >= 1_000) return (count / 1_000).toFixed(1) + 'K';
  return count.toString();
};

const HeroCarousel = ({ videos = [], onWatch, loading = false }) => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const goTo = useCallback((i) => {
    if (!videos.length) return;
    setIdx(((i % videos.length) + videos.length) % videos.length);
  }, [videos.length]);

  useEffect(() => {
    if (paused || loading || videos.length === 0) return;
    const timer = setInterval(() => goTo(idx + 1), 5500);
    return () => clearInterval(timer);
  }, [idx, paused, goTo, loading, videos.length]);

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900" style={{ height: 'clamp(300px,44vw,520px)' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white/70 text-sm">Loading featured videos...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!videos.length) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900" style={{ height: 'clamp(300px,44vw,520px)' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/70 text-sm">No featured videos available</p>
        </div>
      </section>
    );
  }

  const video = videos[idx];
  if (!video) return null;

  // Prepare channel object for Avatar component
  // Avatar expects a 'channel' prop with 'avatar' (emoji or URL) and 'name'
  const channelForAvatar = {
    name: video.username || 'Creator',
    avatar: video.profilePicture || (video.username ? video.username.charAt(0).toUpperCase() : '🎬'),
    profilePicture: video.profilePicture, // some Avatar components use this
  };

  return (
    <section
      aria-label="Featured videos"
      aria-roledescription="carousel"
      className="relative overflow-hidden"
      style={{ height: 'clamp(300px,44vw,520px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart === null) return;
        const dx = touchStart - e.changedTouches[0].clientX;
        if (dx > 40) goTo(idx + 1);
        if (dx < -40) goTo(idx - 1);
        setTouchStart(null);
      }}
    >
      {/* Background Image - much lighter now */}
      {video.thumbnailUrl && (
        <img
          src={video.thumbnailUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.7, filter: 'brightness(0.7) saturate(1.1)' }}
        />
      )}

      {/* Gradients Overlays - made lighter and less intrusive */}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)'
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.3) 100%)'
        }}
      />

      {/* Content Container */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end px-4 sm:px-8 md:px-12 pb-4 sm:pb-8">
        <div className="max-w-xs sm:max-w-md lg:max-w-lg">
          {/* Unified Badges Row */}
          <div className="flex gap-2 mb-2 sm:mb-3 items-center flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold tracking-wide shadow-sm">
              FEATURED
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-medium border border-white/20">
              {video.category || 'Trending'}
            </span>
            <Badge text={video.paid ? 'PAID' : 'FREE'} type={video.paid ? 'paid' : 'free'} />
          </div>

          <h1
            className="font-display font-black text-white leading-tight mb-2 sm:mb-4 line-clamp-2 drop-shadow-md"
            style={{ fontSize: 'clamp(18px, 3.5vw, 40px)' }}
          >
            {video.title}
          </h1>

          <div className="hidden sm:flex items-center gap-3 mb-3 flex-wrap">
            {/* Avatar now receives the proper channel object */}
            <Avatar channel={channelForAvatar} size={24} />
            <span className="text-sm font-semibold text-gray-200">{video.username || 'Anonymous'}</span>
            <span className="flex items-center gap-1 text-sm text-gray-300">
              <Eye size={12} />{formatViews(video.viewCount)}
            </span>
            {video.duration && (
              <span className="flex items-center gap-1 text-sm text-gray-300">
                <Clock size={12} />{video.duration}
              </span>
            )}
          </div>

          <Button onClick={() => onWatch?.(video)} size="md" className="gap-2">
            <FaPlay /> Watch Now
          </Button>
        </div>

        {/* Carousel Controls */}
        <div className="flex flex-col items-end gap-3 pb-1 flex-shrink-0 ml-4">
          <div className="flex gap-1.5" role="tablist">
            {videos.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === idx}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  height: 5,
                  width: i === idx ? 24 : 5,
                  background: i === idx ? '#3b82f6' : 'rgba(255,255,255,0.4)'
                }}
              />
            ))}
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => goTo(idx - 1)}
              aria-label="Previous"
              className="w-9 h-9 rounded-xl border border-white/25 bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => goTo(idx + 1)}
              aria-label="Next"
              className="w-9 h-9 rounded-xl border border-white/25 bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute top-5 right-4 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white/80 text-xs font-mono" aria-live="polite">
        {idx + 1} / {videos.length}
      </div>
    </section>
  );
};

export default HeroCarousel;