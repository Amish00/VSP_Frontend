import React, { useState } from 'react';

const formatRelativeTime = (isoDate) => {
  if (!isoDate) return '';
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

const CommentItem = ({ comment, onLike, onUnlike, onDelete, isOwnComment }) => {
  const { id, content, createdAt, username, likesCount, likedByUser } = comment;
  // Handle multiple possible field names for profile picture
  const profilePicture = comment.userProfilePicture || comment.profilePicture || comment.user?.profilePicture;
  const [likedOptimistic, setLikedOptimistic] = useState(likedByUser || false);
  const [likesOptimistic, setLikesOptimistic] = useState(likesCount || 0);

  const handleLike = async () => {
    if (likedOptimistic) {
      setLikesOptimistic(prev => Math.max(0, prev - 1));
      setLikedOptimistic(false);
      await onUnlike?.();
    } else {
      setLikesOptimistic(prev => prev + 1);
      setLikedOptimistic(true);
      await onLike?.();
    }
  };

  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <div className="flex gap-3" role="listitem">
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm overflow-hidden bg-primary/20 text-primary">
        {profilePicture ? (
          <img src={profilePicture} alt={username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          username?.charAt(0)?.toUpperCase() || '?'
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-semibold text-text-primary">{username || 'Anonymous'}</span>
          <span className="text-xs text-text-muted">{formatRelativeTime(createdAt)}</span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed mb-2">{content}</p>
        <div className="flex gap-4 text-sm text-text-muted">
          <button
            onClick={handleLike}
            aria-label={likedOptimistic ? 'Unlike comment' : 'Like comment'}
            className={`flex items-center gap-1.5 transition-colors ${likedOptimistic ? 'text-danger' : 'hover:text-danger'}`}
          >
            {likedOptimistic ? '❤️' : '🤍'} {likesOptimistic}
          </button>
          {onDelete && isOwnComment && (
            <button onClick={handleDelete} className="hover:text-text-primary transition-colors">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;