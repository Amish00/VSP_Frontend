import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import { getHistory, clearHistory } from '../api/Api';

const PAGE_SIZE = 20;

// Helper to convert any string to title case (camelCase per word)
const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
};

const HistoryPage = () => {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const currentPage = reset ? 0 : page;
      const response = await getHistory(currentPage, PAGE_SIZE);
      const { content, last, number } = response.data;

      setHistoryItems(prev => (reset ? content : [...prev, ...content]));
      setHasMore(!last);
      setPage(number + 1);
    } catch (err) {
      console.error('Failed to load history', err);
      setError('Could not load watch history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, loading]);

  useEffect(() => {
    loadHistory(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearHistory = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      await clearHistory();
      setHistoryItems([]);
      setHasMore(false);
      setPage(0);
    } catch (err) {
      console.error('Failed to clear history', err);
      alert('Could not clear history. Please try again.');
    } finally {
      setClearing(false);
    }
  };

  const formatWatchedTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffSeconds = Math.floor((now - date) / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays === 0) {
        if (diffHours === 0) {
          if (diffMinutes < 1) return 'just now';
          return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        }
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffDays === 1) {
        return 'yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
      } else if (diffDays < 365) {
        return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
      } else {
        return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
      }
    } catch {
      return 'recently';
    }
  };

  const handleWatch = (videoId) => {
    navigate(`/watch/${videoId}`);
  };

  if (error && historyItems.length === 0) {
    return (
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-[68px] md:pt-[92px] pb-[96px] md:pb-16">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-text-muted mb-4">{error}</p>
          <button
            onClick={() => loadHistory(true)}
            className="px-4 py-2 bg-primary rounded-lg text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-[68px] md:pt-[92px] pb-[96px] md:pb-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Watch History</h1>
        {historyItems.length > 0 && (
          <button
            onClick={handleClearHistory}
            disabled={clearing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-bg-el text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
          >
            {clearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Clear history
          </button>
        )}
      </div>

      {historyItems.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-text-muted text-lg">Your watch history is empty.</p>
          <p className="text-text-muted text-sm mt-1">Videos you watch will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {historyItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleWatch(item.videoId)}
              className="flex gap-3 p-3.5 bg-bg-card rounded-xl border border-border cursor-pointer hover:border-primary-light transition-colors text-left w-full"
            >
              {/* Thumbnail */}
              <div className="w-20 sm:w-28 aspect-video rounded-lg overflow-hidden bg-bg-el flex-shrink-0">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.videoTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    🎬
                  </div>
                )}
              </div>

              {/* Video info */}
              <div className="flex-1 min-w-0">
                {/* Title with type badge inline and title case */}
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <p className="text-base sm:text-lg font-semibold text-text-primary leading-snug line-clamp-2">
                    {toTitleCase(item.videoTitle)}
                  </p>
                  <Badge
                    text={item.type === 'SHORTS' ? 'SHORT' : 'VIDEO'}
                    type={item.type === 'SHORTS' ? 'short' : 'video'}
                    small
                  />
                </div>

                {/* Channel & views */}
                <p className="text-xs text-text-muted mb-1.5">
                  {item.username} · <Eye size={10} className="inline" />{' '}
                  {item.viewCount?.toLocaleString() || 0}
                </p>

                {/* Watched time */}
                <p className="text-2xs text-text-muted">
                  Watched {formatWatchedTime(item.watchedAt)}
                </p>
              </div>

              {/* Paid/Free badge */}
              <div className="flex items-start flex-shrink-0 mt-1">
                {item.paid !== undefined ? (
                  <Badge text={item.paid ? 'PAID' : 'FREE'} type={item.paid ? 'paid' : 'free'} small />
                ) : (
                  <Badge text="WATCHED" type="free" small />
                )}
              </div>
            </button>
          ))}

          {hasMore && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => loadHistory()}
                disabled={loading}
                className="px-6 py-2 bg-bg-el rounded-lg text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin mx-auto" />
                ) : (
                  'Load more'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPage; 