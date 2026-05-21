// src/components/VideoGrid.jsx
import React from 'react';
import VideoCard from './VideoCard';

function EmptyState({ icon = '📭', title = 'Nothing here yet', body = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4" aria-hidden>{icon}</div>
      <p className="font-display font-bold text-xl text-text-primary mb-2">{title}</p>
      {body && <p className="text-sm text-text-muted max-w-xs leading-relaxed mb-6">{body}</p>}
      {action}
    </div>
  );
}

const VideoGrid = ({
  videos = [],
  onWatch,
  cols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  gap = 'gap-x-4 gap-y-6',
  emptyIcon = '🎬',
  emptyTitle = 'No videos found'
}) => {
  if (!videos.length) return <EmptyState icon={emptyIcon} title={emptyTitle} />;
  return (
    <div className={`grid ${cols} ${gap}`} role="list">
      {videos.map(v => (
        <div key={v.id} role="listitem">
          <VideoCard video={v} onClick={onWatch} />
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;