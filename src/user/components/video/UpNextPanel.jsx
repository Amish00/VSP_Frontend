import React, { useState } from 'react';
import { Clock, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import Badge from '../ui/Badge';

const filterOutShorts = (videos) => videos.filter(video => video.type !== 'SHORT' && video.type !== 'SHORTS' && !video.isShort);

const UpNextPanel = ({ videos = [], onWatch }) => {
  const [showAll, setShowAll] = useState(false);
  const initialLimit = 5;
  const filteredVideos = filterOutShorts(videos);
  const displayedVideos = showAll ? filteredVideos : filteredVideos.slice(0, initialLimit);
  const hasMore = filteredVideos.length > initialLimit;

  if (!filteredVideos.length) return null;

  return (
    <aside aria-label="Up next">
      <h2 className="font-display font-bold text-xl mb-4 hidden xl:block text-text-primary">Up Next</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
        {displayedVideos.map((video) => (
          <button
            key={video.id}
            onClick={() => onWatch(video)}
            aria-label={`Watch ${video.title}`}
            className="flex gap-3 p-2.5 w-full text-left rounded-xl bg-bg-card border border-border shadow-[0_2px_12px_rgba(0,0,0,.18)] hover:bg-bg-hov hover:border-border/80 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="relative w-28 sm:w-32 aspect-video rounded-lg overflow-hidden bg-bg-el flex-shrink-0">
              {(video.thumbnailUrl || video.thumb) ? (
                <img src={video.thumbnailUrl || video.thumb} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">{video.em}</div>
              )}
            </div>
            <div className="flex-1 min-w-0 py-0.5">
              <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 mb-1">
                {video.title}
              </p>
              <p className="text-xs text-text-secondary mb-1.5 truncate">
                {video.username || 'Anonymous'}
              </p>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-0.5 text-xs text-text-muted">
                  <Eye size={10} /> {video.views}
                </span>
                <span className="flex items-center gap-0.5 text-xs text-text-muted">
                  <Clock size={10} />{video.time}
                </span>
                <Badge
                  text={video.paid ? 'PAID' : 'FREE'}
                  type={video.paid ? 'paid' : 'free'}
                  small
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Show More / Show Less Button */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2.5 rounded-xl bg-bg-el border border-border text-text-secondary text-sm font-medium hover:bg-bg-hov hover:text-text-primary transition-all flex items-center justify-center gap-2"
        >
          {showAll ? (
            <>
              <ChevronUp size={16} /> Show Less
            </>
          ) : (
            <>
              <ChevronDown size={16} /> Show More ({filteredVideos.length - initialLimit} more)
            </>
          )}
        </button>
      )}
    </aside>
  );
};

export default UpNextPanel;