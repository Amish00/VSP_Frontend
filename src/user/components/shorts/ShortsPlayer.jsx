// src/components/shorts/ShortsPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, MessageCircle, Share2, ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react';
import api from '../../api/Api';
import CommentSection from '../video/CommentSection';
import ShareModal from '../ShareModal';

const ShortsModal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0F0F0F] border border-white/10 rounded-2xl w-full max-w-[500px] max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-bold text-lg text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const ShortsPlayer = ({ shorts, initialIndex = 0, onClose }) => {
  const [index, setIndex] = useState(initialIndex);
  const [liked, setLiked] = useState({});
  const [likesCount, setLikesCount] = useState({});
  const [playing, setPlaying] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const touchY = useRef(null);
  const videoRef = useRef(null);

  const current = shorts[index];
  if (!current) return null;

  const goNext = () => setIndex(i => (i + 1) % shorts.length);
  const goPrev = () => setIndex(i => (i - 1 + shorts.length) % shorts.length);

  // Control video play/pause via ref
  useEffect(() => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.play().catch(err => {
        console.warn('Playback failed:', err);
        setPlaying(false);
      });
    } else {
      videoRef.current.pause();
    }
  }, [playing, index]);

  const handleVideoEnded = () => goNext();

  useEffect(() => {
    setPlaying(true);
  }, [index]);

  // Like status
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const res = await api.get(`/videos/${current.id}/like/status`);
        setLiked(prev => ({ ...prev, [current.id]: res.data.liked }));
        setLikesCount(prev => ({ ...prev, [current.id]: res.data.likeCount }));
      } catch (err) {
        setLiked(prev => ({ ...prev, [current.id]: false }));
        setLikesCount(prev => ({ ...prev, [current.id]: current.likesCount || 0 }));
      }
    };
    fetchLikeStatus();
  }, [current.id, current.likesCount]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); goPrev(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); goNext(); }
      else if (e.key === 'Escape') onClose();
      else if (e.key === ' ' || e.key === 'Space') { e.preventDefault(); setPlaying(p => !p); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goPrev, goNext, onClose]);

  const toggleLike = async () => {
    try {
      if (liked[current.id]) {
        await api.delete(`/videos/${current.id}/like`);
        setLiked(prev => ({ ...prev, [current.id]: false }));
        setLikesCount(prev => ({ ...prev, [current.id]: (prev[current.id] || 0) - 1 }));
      } else {
        await api.post(`/videos/${current.id}/like`);
        setLiked(prev => ({ ...prev, [current.id]: true }));
        setLikesCount(prev => ({ ...prev, [current.id]: (prev[current.id] || 0) + 1 }));
      }
    } catch (err) {
      console.error('Like/unlike failed', err);
      if (err.response?.status === 401) alert('Please login to like videos');
    }
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openShareModal = () => setShareModalOpen(true);
  const closeShareModal = () => setShareModalOpen(false);

  const descriptionPreview = current.description || current.title || '';
  const hasLongDescription = descriptionPreview.length > 80;
  const truncatedDesc = hasLongDescription ? descriptionPreview.slice(0, 80) + '...' : descriptionPreview;

  return (
    <>
      <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center">
        <button onClick={onClose} className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center">
          <X size={20} />
        </button>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {shorts.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)}
              className="h-1 rounded-full transition-all"
              style={{ width: i === index ? 24 : 8, background: i === index ? '#fff' : 'rgba(255,255,255,0.35)' }} />
          ))}
        </div>

        <div className="flex items-center justify-center w-full gap-3 px-3">
          <div className="flex flex-col gap-3">
            <button onClick={goPrev} className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition">
              <ChevronUp size={28} />
            </button>
            <button onClick={goNext} className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition">
              <ChevronDown size={28} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="relative rounded-xl overflow-hidden bg-black"
                 style={{ width: 'min(340px, calc(100vw - 160px))', height: 'min(600px, calc(100vh - 160px))' }}
                 onTouchStart={e => touchY.current = e.touches[0].clientY}
                 onTouchEnd={e => {
                   const dy = touchY.current - e.changedTouches[0].clientY;
                   if (dy > 40) goNext();
                   if (dy < -40) goPrev();
                   touchY.current = null;
                  }}
                 onClick={() => setPlaying(p => !p)}>
              <video
                ref={videoRef}
                src={current.videoUrl}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted={false}
                playsInline
                onEnded={handleVideoEnded}
              />
              {!playing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" aria-hidden="true">
                  <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center text-white text-2xl">▶</div>
                </div>
              )}
            </div>

            <div className="w-full max-w-[340px]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                  {current.username?.slice(0,2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">{current.username}</p>
                </div>
              </div>
              <p className="text-sm text-white/90 font-medium">{current.title}</p>
              {descriptionPreview && (
                <div className="mt-1.5">
                  <p className="text-xs text-white/70 leading-relaxed">{truncatedDesc}</p>
                  {hasLongDescription && (
                    <button onClick={openModal} className="text-xs text-primary-light font-semibold mt-1 hover:underline flex items-center gap-1">
                      more <MoreHorizontal size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 items-center">
            <button onClick={toggleLike} className="flex flex-col items-center gap-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${liked[current.id] ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white'}`}>
                <Heart size={22} fill={liked[current.id] ? 'currentColor' : 'none'} />
              </div>
              <span className="text-xs text-white/70">{likesCount[current.id] || 0}</span>
            </button>
            <button onClick={openModal} className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center">
                <MessageCircle size={22} />
              </div>
              <span className="text-xs text-white/70">{current.commentCount || 0}</span>
            </button>
            <button onClick={openShareModal} className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center">
                <Share2 size={22} />
              </div>
              <span className="text-xs text-white/70">Share</span>
            </button>
          </div>
        </div>
      </div>

      <ShortsModal isOpen={modalOpen} onClose={closeModal} title="Video details & comments">
        <div className="space-y-5">
          <div><h3 className="text-sm font-semibold text-white mb-2">Description</h3><p className="text-sm text-white/80 whitespace-pre-wrap">{current.description || 'No description.'}</p></div>
          <div className="h-px bg-white/10" />
          <div><h3 className="text-sm font-semibold text-white mb-3">Comments</h3><CommentSection videoId={current.id} /></div>
        </div>
      </ShortsModal>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={closeShareModal}
        url={`${window.location.origin}/watch/${current.id}`}
        title={current.title}
        thumbnail={current.thumbnailUrl}
      />
    </>
  );
};

export default ShortsPlayer;