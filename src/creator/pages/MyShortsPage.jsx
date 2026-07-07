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
  Smartphone,
  Search,
  CheckCircle,
  XCircle,
  Clock,
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

const getTypeMeta = () => {
  return { icon: Smartphone, color: 'text-purple-400' };
};

const MyShortsPage = ({ onNav }) => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [shorts, setShorts] = useState([]);
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

  const [shortToDelete, setShortToDelete] = useState(null);
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
      const statuses = ['All', 'APPROVED', 'PENDING', 'REJECTED'];
      const type = 'SHORTS';
      const size = 1;

      const promises = statuses.map((status) =>
        creatorApi.getVideos(status === 'All' ? null : status, '', type, size, 0)
      );
      const responses = await Promise.all(promises);
      const counts = responses.map((res) => res.data.totalElements || 0);
      const [total, approved, pending, rejected] = counts;
      setStats({ total, approved, pending, rejected });
    } catch (err) {
      console.error('Failed to fetch short stats', err);
      setStats({ total: 0, approved: 0, pending: 0, rejected: 0 });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ---------- Fetch shorts list ----------
  const fetchShorts = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      const filterParam = statusFilter === 'All' ? null : statusFilter;
      const response = await creatorApi.getVideos(
        filterParam,
        debouncedSearch,
        'SHORTS',
        pageSize,
        page
      );
      const content = response.data.content || [];
      setShorts(content);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch shorts', err);
      enqueueSnackbar('Failed to load shorts.', { variant: 'error' });
      setShorts([]);
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

  // Shorts when filters or page change
  useEffect(() => {
    fetchShorts(currentPage);
  }, [fetchShorts, currentPage]);

  // ---------- Handlers ----------
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage - 1);
  };

  const handleEdit = (short) => navigate(`/creator/video/${short.id}?mode=edit&type=short`);
  const handleDeleteClick = (short) => {
    setShortToDelete(short);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!shortToDelete) return;
    try {
      await creatorApi.deleteVideo(shortToDelete.id);
      enqueueSnackbar('Short deleted', { variant: 'success' });
      setDeleteModalOpen(false);
      await fetchStats();
      await fetchShorts(currentPage);
    } catch (err) {
      enqueueSnackbar(`Delete failed: ${err.response?.data?.message || err.message}`, { variant: 'error' });
    }
  };

  const handleTitleClick = (short) => navigate(`/creator/video/${short.id}?mode=view&type=short`);
  const handleUpload = () => (onNav ? onNav('upload') : navigate('/creator/upload'));

  return (
    <div className="pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">My Shorts</h1>
        <Button onClick={handleUpload}>
          <ArrowUp /> Upload New Short
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
              icon={<Smartphone size={24} color="#A78BFA" />}
              label="Total Shorts"
              value={stats.total}
              color="#A78BFA"
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
              placeholder="Search shorts by title..."
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
              <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Short</th>
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
                    Loading shorts...
                  </div>
                </td>
              </tr>
            ) : shorts.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-text-muted">No shorts found.</td>
              </tr>
            ) : (
              shorts.map((short) => {
                const meta = STATUS_META[short.status] || { label: short.status, type: 'pending' };
                const { icon: TypeIcon, color: typeColor } = getTypeMeta();

                return (
                  <tr key={short.id} className="border-b border-border/50 last:border-0 hover:bg-bg-hov/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-sm bg-bg-el overflow-hidden flex items-center justify-center text-lg flex-shrink-0">
                          {short.thumbnailUrl ? (
                            <img src={short.thumbnailUrl} alt="thumb" className="w-full h-full object-cover" />
                          ) : '🎬'}
                        </div>
                        <button
                          onClick={() => handleTitleClick(short)}
                          className="font-medium text-text-primary line-clamp-2 max-w-[240px] text-left hover:text-primary transition"
                        >
                          {short.title}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <TypeIcon size={16} className={typeColor} />
                        <span className={`text-xs font-medium ${typeColor}`}>SHORTS</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {short.paid ? (
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
                        {formatNumber(short.viewCount)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary tabular-nums whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Heart size={14} className="text-text-muted" />
                        {formatNumber(short.likesCount)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary tabular-nums whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MessageCircle size={14} className="text-text-muted" />
                        {formatNumber(short.commentCount)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                      {new Date(short.publishedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEdit(short)}
                          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary-light text-xs font-bold hover:bg-primary/20"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(short)}
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
        userName={shortToDelete?.title}
        itemType="short"
      />
    </div>
  );
};

export default MyShortsPage;