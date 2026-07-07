import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Pagination from '../components/Pagination';
import StatCard from '../components/ui/StatCard';
import { creatorApi } from '../api/creatorApi';
import {
  ArrowUp,
  Eye,
  Heart,
  MessageCircle,
  Lock,
  Unlock,
  Film,
  Smartphone,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Film as FilmIcon,
} from 'lucide-react';

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
};

const STATUS_META = {
  APPROVED: { label: 'Approved', type: 'approved' },
  REJECTED: { label: 'Rejected', type: 'rejected' },
  PENDING: { label: 'Pending', type: 'pending' },
};

const getTypeMeta = (type) => {
  const t = type?.toUpperCase();
  if (t === 'SHORTS') {
    return { icon: Smartphone, color: 'text-purple-400' };
  }
  return { icon: Film, color: 'text-blue-400' };
};

const MyVideosPage = ({ onNav }) => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 7;

  const [videoToDelete, setVideoToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(0);
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  // ---------- Fetch stats (only once on mount) ----------
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      // We'll use the fallback (parallel calls to existing paginated API)
      const statuses = ['All', 'APPROVED', 'PENDING', 'REJECTED'];
      const type = 'VIDEO';
      const size = 1; // we only need totalElements

      const promises = statuses.map((status) =>
        creatorApi.getVideos(status === 'All' ? null : status, '', type, size, 0)
      );
      const responses = await Promise.all(promises);
      const counts = responses.map((res) => res.data.totalElements || 0);
      // order: [total, approved, pending, rejected]
      const [total, approved, pending, rejected] = counts;
      setStats({ total, approved, pending, rejected });
    } catch (err) {
      console.error('Failed to fetch video stats', err);
      setStats({ total: 0, approved: 0, pending: 0, rejected: 0 });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ---------- Fetch video list (depends on filters and page) ----------
  const fetchVideos = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      const filterParam = statusFilter === 'All' ? null : statusFilter;
      const response = await creatorApi.getVideos(
        filterParam,
        debouncedSearch,
        'VIDEO',
        pageSize,
        page
      );
      const content = response.data.content || [];
      setVideos(content);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch videos', err);
      enqueueSnackbar('Failed to load videos. Please refresh the page.', { variant: 'error' });
      setVideos([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, pageSize, currentPage, enqueueSnackbar]);

  // ---------- Effects ----------
  // Stats only on mount
  useEffect(() => {
    fetchStats();
  }, []); // empty deps

  // Videos when filters or page change
  useEffect(() => {
    fetchVideos(currentPage);
  }, [fetchVideos, currentPage]); // fetchVideos already includes all needed deps

  // ---------- Handlers ----------
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage - 1);
  };

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
      enqueueSnackbar('Video deleted successfully', { variant: 'success' });
      setDeleteModalOpen(false);
      // Refresh both stats and list
      await fetchStats();
      await fetchVideos(currentPage);
    } catch (err) {
      console.error('Delete failed', err);
      const msg = err.response?.data?.message || err.message;
      enqueueSnackbar(`Delete failed: ${msg}`, { variant: 'error' });
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
        <Button onClick={handleUpload}>
          <ArrowUp /> Upload New Videos
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          <>
            <div className="bg-bg-card border border-border rounded-2xl p-4 animate-pulse h-24"></div>
            <div className="bg-bg-card border border-border rounded-2xl p-4 animate-pulse h-24"></div>
            <div className="bg-bg-card border border-border rounded-2xl p-4 animate-pulse h-24"></div>
            <div className="bg-bg-card border border-border rounded-2xl p-4 animate-pulse h-24"></div>
          </>
        ) : (
          <>
            <StatCard
              icon={<FilmIcon size={24} color="#60A5FA" />}
              label="Total Videos"
              value={stats.total}
              color="#60A5FA"
            />
            <StatCard
              icon={<CheckCircle size={24} color="#10B981" />}
              label="Approved"
              value={stats.approved}
              color="#10B981"
            />
            <StatCard
              icon={<Clock size={24} color="#F59E0B" />}
              label="Pending"
              value={stats.pending}
              color="#F59E0B"
            />
            <StatCard
              icon={<XCircle size={24} color="#EF4444" />}
              label="Rejected"
              value={stats.rejected}
              color="#EF4444"
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos by title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg-el text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
        </div>
        <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl flex-wrap">
          {['All', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setStatusFilter(f);
                setCurrentPage(0);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === f ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {f === 'PENDING' ? 'Pending' : f === 'APPROVED' ? 'Approved' : f === 'REJECTED' ? 'Rejected' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
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
                const { icon: TypeIcon, color: typeColor } = getTypeMeta(video.type);

                return (
                  <tr key={video.id} className="border-b border-border/50 last:border-0 hover:bg-bg-hov/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-8 rounded-sm bg-bg-el flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                          {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt="thumb" className="w-full h-full object-cover" />
                          ) : '🎬'}
                        </div>
                        <button
                          onClick={() => handleTitleClick(video)}
                          className="font-medium text-text-primary line-clamp-2 max-w-[240px] text-left hover:text-primary transition"
                        >
                          {video.title}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <TypeIcon size={16} className={typeColor} />
                        <span className={`text-xs font-medium ${typeColor}`}>
                          {video.type || 'VIDEO'}
                        </span>
                      </div>
                    </td>
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
                    <td className="px-4 py-3">
                      <Badge text={meta.label} type={meta.type} />
                    </td>
                    <td className="px-4 py-3 text-text-secondary tabular-nums whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Eye size={14} className="text-text-muted" />
                        {formatNumber(video.viewCount)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary tabular-nums whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Heart size={14} className="text-text-muted" />
                        {formatNumber(video.likesCount)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary tabular-nums whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MessageCircle size={14} className="text-text-muted" />
                        {formatNumber(video.commentCount)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                      {new Date(video.publishedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEdit(video)}
                          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary-light text-xs font-bold hover:bg-primary/20"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(video)}
                          className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-bold hover:bg-danger/20"
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

      {totalPages > 1 && (
        <div className="flex justify-end mt-6">
          <Pagination
            currentPage={currentPage + 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            siblingCount={1}
          />
        </div>
      )}

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