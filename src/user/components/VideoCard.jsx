import React from 'react';
import { Eye, Heart, Clock } from 'lucide-react';
import Badge from '../components/ui/Badge';

const Meta = ({ Icon, value, label }) => (
  <span className="flex items-center gap-1" aria-label={`${value} ${label}`}>
    <Icon size={12} className="flex-shrink-0 text-gray-500" aria-hidden />
    <span>{value}</span>
  </span>
);

const VideoCard = ({ video, onClick }) => {
  const username = video.username || 'Anonymous';
  const profilePic = video.profilePicture || null;
  const initial = username.charAt(0).toUpperCase();
  const thumbnailSrc = video.thumbnailUrl || video.thumb || null;

  return (
    <article className="card-hover rounded-xl overflow-hidden bg-gray-900 border border-gray-800 cursor-pointer transition-all duration-200 hover:border-gray-700">
      <button onClick={() => onClick?.(video)} className="w-full text-left focus:outline-none" aria-label={`Watch ${video.title}`}>
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-800 overflow-hidden">
          {thumbnailSrc ? (
            <img src={thumbnailSrc} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🎬</div>
          )}
          <span className="absolute top-2 left-2">
            <Badge text={video.paid ? 'PAID' : 'FREE'} type={video.paid ? 'paid' : 'free'} />
          </span>
          <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path d="M2 1.5L14.5 9L2 16.5V1.5Z" fill="white" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-4 min-w-0">
          <div className="flex gap-2.5 sm:gap-3 items-start">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-gray-700 border border-gray-600 ring-1 ring-black/20 flex-shrink-0">
              {profilePic ? (
                <img src={profilePic} alt={username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white">
                  {initial}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base lg:text-xl text-white leading-tight line-clamp-1">
                {video.title}
              </h3>
              <p className="mt-0.5 text-[11px] sm:text-sm font-medium text-gray-400 truncate">{username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 pl-[34px] sm:pl-[44px] text-[11px] sm:text-sm mt-1.5 text-gray-400">
            <Meta Icon={Eye} value={video.views || '0'} label="views" />
            <span aria-hidden>·</span>
            <Meta Icon={Heart} value={video.likes || '0'} label="likes" />
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Clock size={12} className="text-gray-500" aria-hidden />
              {video.time || 'recent'}
            </span>
          </div>
        </div>
      </button>
    </article>
  );
};

export default VideoCard;