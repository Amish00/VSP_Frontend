// src/components/VideoCard.jsx
import React from 'react';
import { Eye, Heart, Clock } from 'lucide-react';
import Badge from '../components/ui/Badge';

function Meta({ Icon, value, label }) {
  return (
    <span className="flex items-center gap-1" aria-label={`${value} ${label}`}>
      <Icon size={12} className="flex-shrink-0 text-text-muted" aria-hidden />
      <span>{value}</span>
    </span>
  );
}

const VideoCard = ({ video, onClick }) => {
  const username = video.username || 'Anonymous';
  const profilePic = video.profilePicture || null;

  return (
    <article className="card-hover rounded-xl overflow-hidden bg-bg-card border border-border cursor-pointer">
      <button onClick={() => onClick?.(video)} className="w-full text-left focus:outline-none" aria-label={`Watch ${video.title}`}>
        {/* Thumbnail - fixed ratio */}
        <div className="relative aspect-video bg-bg-el overflow-hidden">
          {video.thumb ? (
            <img src={video.thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">{video.em}</div>
          )}
          <span className="absolute top-2 left-2">
            <Badge text={video.paid ? 'PAID' : 'FREE'} type={video.paid ? 'paid' : 'free'} />
          </span>
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path d="M2 1.5L14.5 9L2 16.5V1.5Z" fill="white" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content - no stretching, natural height */}
        <div className="p-3 sm:p-4 min-w-0">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-el flex-shrink-0">
              {profilePic ? (
                <img src={profilePic} alt={username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold bg-gray-700 text-white">
                  {username[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg sm:text-xl text-text-primary leading-tight line-clamp-1">
                {video.title}
              </h3>
              <p className="mt-0.5 text-sm font-medium text-text-secondary truncate">{username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pl-[44px] text-sm mt-1.5" style={{ color: '#8FA3BE' }}>
            <Meta Icon={Eye} value={video.views} label="views" />
            <span aria-hidden>·</span>
            <Meta Icon={Heart} value={video.likes} label="likes" />
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Clock size={12} className="text-text-muted" aria-hidden />
              {video.time}
            </span>
          </div>
        </div>
      </button>
    </article>
  );
};

export default VideoCard;