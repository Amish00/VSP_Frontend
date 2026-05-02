import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/Api';
import CommentItem from './CommentItem';
import Button from '../ui/Button';
import { useAuth } from '../../../auth/context/AuthContext';

const CommentSection = ({ videoId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const pageSize = 10;

  // Helper: check if user is logged in
  const isLoggedIn = () => !!localStorage.getItem('access_token');

  // Fetch comments (paginated)
  const fetchComments = useCallback(async (pageNum = 0, append = false) => {
    if (!videoId) return;
    setLoading(true);
    try {
      const response = await api.get(`/comments/video/${videoId}`, {
        params: { page: pageNum, size: pageSize, sort: 'createdAt,desc' }
      });
      const { content, totalElements, last } = response.data;
      setComments(prev => append ? [...prev, ...content] : content);
      setTotalComments(totalElements);
      setHasMore(!last);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch comments', err);
      setError('Could not load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  // Load first page on mount or videoId change
  useEffect(() => {
    setComments([]);
    setPage(0);
    setHasMore(true);
    fetchComments(0, false);
  }, [videoId, fetchComments]);

  // Fetch current user's profile (for profile picture when posting comments)
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (!isLoggedIn()) return;
      try {
        const response = await api.get('/users/me');
        setCurrentUserProfile(response.data);
      } catch (err) {
        console.error('Failed to fetch current user profile', err);
      }
    };
    fetchCurrentUserProfile();
  }, []);

  // Load more comments
  const loadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  };

  // Post a new comment
  const postComment = async () => {
    if (!text.trim()) return;
    if (!isLoggedIn()) {
      alert('Please log in to comment.');
      return;
    }
    setPosting(true);
    try {
      const response = await api.post('/comments', {
        videoId,
        content: text.trim()
      });
      let newComment = response.data;
      // If profile picture is missing, add it from current user profile
      if (!newComment.profilePicture && !newComment.userProfilePicture && currentUserProfile?.profilePicture) {
        newComment = { ...newComment, profilePicture: currentUserProfile.profilePicture };
      }
      setComments(prev => [newComment, ...prev]);
      setTotalComments(prev => prev + 1);
      setText('');
    } catch (err) {
      console.error('Failed to post comment', err);
      alert('Failed to post comment. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  // Like a comment
  const likeComment = async (commentId) => {
    if (!isLoggedIn()) {
      alert('Please log in to like comments.');
      return;
    }
    try {
      await api.post(`/comments/${commentId}/like`);
      setComments(prev => prev.map(c =>
        c.id === commentId ? { ...c, likesCount: c.likesCount + 1, likedByUser: true } : c
      ));
    } catch (err) {
      console.error('Failed to like comment', err);
    }
  };

  // Unlike a comment
  const unlikeComment = async (commentId) => {
    if (!isLoggedIn()) return;
    try {
      await api.delete(`/comments/${commentId}/like`);
      setComments(prev => prev.map(c =>
        c.id === commentId ? { ...c, likesCount: Math.max(0, c.likesCount - 1), likedByUser: false } : c
      ));
    } catch (err) {
      console.error('Failed to unlike comment', err);
    }
  };

  // Delete a comment
  const deleteComment = async (commentId) => {
    if (!isLoggedIn()) {
      alert('Please log in to delete comments.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setTotalComments(prev => prev - 1);
    } catch (err) {
      console.error('Failed to delete comment', err);
      alert('You can only delete your own comments.');
    }
  };

  if (!videoId) return <div className="p-4">No video specified</div>;
  if (error && comments.length === 0) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <section aria-label="Comments">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-0.5 h-5 rounded-full bg-primary flex-shrink-0" aria-hidden />
        <h2 className="font-display font-bold text-2xl text-text-primary">
          💬 Comments ({totalComments})
        </h2>
      </div>

      {/* New comment form – shown only if logged in */}
      {isLoggedIn() ? (
        <div className="flex gap-3 mb-6">
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm overflow-hidden bg-primary/20 text-primary">
            {currentUserProfile?.profilePicture ? (
              <img src={currentUserProfile.profilePicture} alt="Your profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              user?.username?.charAt(0)?.toUpperCase() || '?'
            )}
          </div>
          <div className="flex-1">
            <label htmlFor="comment-input" className="sr-only">Add a comment</label>
            <input
              id="comment-input"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  postComment();
                }
              }}
              placeholder="Add a comment… (Enter to post)"
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg-el text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              disabled={posting}
            />
            {text && (
              <div className="mt-1.5 flex gap-2 justify-end">
                <Button variant="ghost" size="xs" onClick={() => setText('')}>Cancel</Button>
                <Button size="xs" onClick={postComment} disabled={posting}>
                  {posting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-6 p-3 text-center bg-bg-el rounded-lg text-text-muted text-sm">
          <a href="/signin" className="text-primary hover:underline">Log in</a> to join the discussion.
        </div>
      )}

      {/* Comments list */}
      {loading && page === 0 && (
        <div className="py-8 text-center text-text-muted">Loading comments...</div>
      )}
      {comments.length === 0 && !loading && (
        <div className="py-8 text-center text-text-muted">No comments yet. Be the first!</div>
      )}
      <div className="space-y-5" role="list">
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onLike={() => likeComment(comment.id)}
            onUnlike={() => unlikeComment(comment.id)}
            onDelete={() => deleteComment(comment.id)}
            isLoggedIn={isLoggedIn()}
            isOwnComment={user?.username === comment.username}
          />
        ))}
      </div>

      {hasMore && comments.length > 0 && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More Comments'}
          </Button>
        </div>
      )}
    </section>
  );
};

export default CommentSection;