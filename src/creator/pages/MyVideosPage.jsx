import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { creatorApi } from '../api/creatorApi';
import { ArrowUp, Eye, Heart, MessageCircle, Lock, Unlock } from 'lucide-react';

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
};

const STATUS_META = {
  APPROVED: { label: 'Approved', type: 'approved' },
  REJECTED: { label: 'Rejected', type: 'rejected' },
  PENDING:  { label: 'Pending',  type: 'pending' },
};

const MyVideosPage = ({ onNav }) => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef(null);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const filterParam = statusFilter === 'All' ? null : statusFilter;
      const response = await creatorApi.getVideos(filterParam, debouncedSearch, 10, 0);
      setVideos(response.data.content || []);
    } catch (err) {
      console.error('Failed to fetch videos', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleEdit = (video) => {
    navigate(`/creator/video/${video.id}?mode=edit`);
  };

  const handleDeleteClick = (video) => {
    setVideoToDelete(video);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!videoToDelete) return;
    try {
      await creatorApi.deleteVideo(videoToDelete.id);
      setDeleteModalOpen(false);
      await fetchVideos();
    } catch (err) {
      console.error('Delete failed', err);
      alert(`Delete failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleTitleClick = (video) => {
    navigate(`/creator/video/${video.id}?mode=view`);
  };

  const handleUpload = () => {
    if (onNav) onNav('upload');
    else navigate('/creator/upload');
  };

  return (
    <div className="pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">My Videos</h1>
        <Button onClick={handleUpload}> <ArrowUp/> Upload New</Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos by title..."
            className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-border bg-bg-el text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl flex-wrap">
          {['All', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === f ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {f === 'PENDING' ? 'Pending' : f === 'APPROVED' ? 'Approved' : f === 'REJECTED' ? 'Rejected' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Video Table with new columns */}
      <div className="bg-bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 880 }}>
          <thead>
            <tr className="border-b border-border bg-bg-el">
              <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Video</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Paid</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Views</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Likes</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Comments</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Upload Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-text-secondary">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Loading videos...
                  </div>
                </td>
              </tr>
            ) : videos.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-text-muted">No videos found.</td>
              </tr>
            ) : (
              videos.map((video) => {
                const meta = STATUS_META[video.status] || { label: video.status, type: 'pending' };
                return (
                  <tr key={video.id} className="border-b border-border/50 last:border-0 hover:bg-bg-hov/30">
                    {/* Video thumbnail + title */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-8 rounded-sm bg-bg-el flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                          {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt="thumb" className="w-full h-full object-cover" />
                          ) : (
                            '🎬'
                          )}
                        </div>
                        <button
                          onClick={() => handleTitleClick(video)}
                          className="font-medium text-text-primary line-clamp-2 max-w-[240px] text-left hover:text-primary transition"
                        >
                          {video.title}
                        </button>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      <Badge text={video.type || 'VIDEO'} type={video.type === 'SHORTS' ? 'info' : 'pro'} />
                    </td>

                    {/* Paid status with icon */}
                    <td className="px-4 py-3">
                      {video.paid ? (
                        <span className="flex items-center gap-1 text-amber-500">
                          <Lock size={14} /> Paid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-success">
                          <Unlock size={14} /> Free
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge text={meta.label} type={meta.type} />
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3 text-text-secondary tabular-nums whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Eye size={14} className="text-text-muted" />
                        {formatNumber(video.viewCount)}
                      </div>
                    </td>

                    {/* Likes */}
                    <td className="px-4 py-3 text-text-secondary tabular-nums whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Heart size={14} className="text-text-muted" />
                        {formatNumber(video.likesCount)}
                      </div>
                    </td>

                    {/* Comments */}
                    <td className="px-4 py-3 text-text-secondary tabular-nums whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MessageCircle size={14} className="text-text-muted" />
                        {formatNumber(video.commentCount)}
                      </div>
                    </td>

                    {/* Upload Date */}
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                      {new Date(video.publishedAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEdit(video)}
                          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary-light text-xs font-bold hover:bg-primary/20 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(video)}
                          className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-bold hover:bg-danger/20 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        userName={videoToDelete?.title}
        itemType="video"
      />
    </div>
  );
};

export default MyVideosPage;