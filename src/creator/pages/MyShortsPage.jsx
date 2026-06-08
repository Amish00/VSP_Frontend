// src/creator/pages/MyShortsPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
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

const MyShortsPage = ({ onNav }) => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef(null);
  const [shortToDelete, setShortToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  const fetchShorts = useCallback(async () => {
    setLoading(true);
    try {
      const filterParam = statusFilter === 'All' ? null : statusFilter;
      // Explicitly ask for SHORTS type
      const response = await creatorApi.getVideos(filterParam, debouncedSearch, 'SHORTS', 10, 0);
      let items = response.data.content || [];
      // Extra safety: filter out any non-shorts (in case backend ignores type)
      items = items.filter(v => v.type === 'SHORTS');
      setShorts(items);
    } catch (err) {
      console.error('Failed to fetch shorts', err);
      enqueueSnackbar('Failed to load shorts.', { variant: 'error' });
      setShorts([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, enqueueSnackbar]);

  useEffect(() => {
    fetchShorts();
  }, [fetchShorts]);

  const handleEdit = (short) => navigate(`/creator/short/${short.id}?mode=edit`);
  const handleDeleteClick = (short) => { setShortToDelete(short); setDeleteModalOpen(true); };
  const handleDeleteConfirm = async () => {
    if (!shortToDelete) return;
    try {
      await creatorApi.deleteVideo(shortToDelete.id);
      enqueueSnackbar('Short deleted', { variant: 'success' });
      setDeleteModalOpen(false);
      await fetchShorts();
    } catch (err) {
      enqueueSnackbar(`Delete failed: ${err.response?.data?.message || err.message}`, { variant: 'error' });
    }
  };
  const handleTitleClick = (short) => navigate(`/creator/short/${short.id}?mode=view`);
  const handleUpload = () => onNav ? onNav('upload') : navigate('/creator/upload');

  return (
    <div className="pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">My Shorts</h1>
        <Button onClick={handleUpload}><ArrowUp /> Upload New Short</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search shorts by title..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-bg-el text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
        <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl">
          {['All', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
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

      {/* Table with Type column */}
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
              shorts.map(short => {
                const meta = STATUS_META[short.status] || { label: short.status, type: 'pending' };
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
                      <Badge text="SHORTS" type="info" />
                    </td>
                    <td className="px-4 py-3">
                      {short.paid ? (
                        <span className="flex items-center gap-1 text-amber-500"><Lock size={14} /> Paid</span>
                      ) : (
                        <span className="flex items-center gap-1 text-success"><Unlock size={14} /> Free</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><Badge text={meta.label} type={meta.type} /></td>
                    <td className="px-4 py-3 text-text-secondary tabular-nums whitespace-nowrap">
                      <div className="flex items-center gap-1"><Eye size={14} className="text-text-muted" />{formatNumber(short.viewCount)}</div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary tabular-nums whitespace-nowrap">
                      <div className="flex items-center gap-1"><Heart size={14} className="text-text-muted" />{formatNumber(short.likesCount)}</div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary tabular-nums whitespace-nowrap">
                      <div className="flex items-center gap-1"><MessageCircle size={14} className="text-text-muted" />{formatNumber(short.commentCount)}</div>
                    </td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">{new Date(short.publishedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => handleEdit(short)} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary-light text-xs font-bold hover:bg-primary/20">Edit</button>
                        <button onClick={() => handleDeleteClick(short)} className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-bold hover:bg-danger/20">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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