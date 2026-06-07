import React from 'react';
import VideoCard from './VideoCard';

const EmptyState = ({ icon = '📭', title = 'Nothing here yet', body = '', action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4" aria-hidden>{icon}</div>
    <p className="font-display font-bold text-xl text-white mb-2">{title}</p>
    {body && <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">{body}</p>}
    {action}
  </div>
);

// Helper to filter out shorts
const filterOutShorts = (videos) => {
  return videos.filter(video => {
    // Check if video has a short type or an explicit short flag
    if (video.type === 'SHORT' || video.type === 'SHORTS' || video.isShort === true) return false;
    // Optional: also filter by duration if you consider videos under 60 seconds as shorts
    // if (video.duration && video.duration < 60) return false;
    return true;
  });
};

const VideoGrid = ({
  videos = [],
  onWatch,
  cols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  gap = 'gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-6',
  emptyIcon = '🎬',
  emptyTitle = 'No videos found',
  hideShorts = true  // New prop to control short filtering
}) => {
  // Filter out shorts if enabled
  const filteredVideos = hideShorts ? filterOutShorts(videos) : videos;
  
  if (!filteredVideos.length) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} />;
  }
  
  return (
    <div className={`grid ${cols} ${gap}`} role="list">
      {filteredVideos.map((video) => (
        <div key={video.id} role="listitem" className="mx-auto w-full max-w-[420px] sm:max-w-none">
          <VideoCard video={video} onClick={onWatch} />
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;