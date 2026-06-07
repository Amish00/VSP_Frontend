import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from 'notistack';
import Badge from './ui/Badge';
import VideoDataModal from './VideoDataModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import Modal from '../components/ui/Modal';
import Pagination from './Pagination';
import { videoApi } from '../api/videoApi';

const STATUS_META = {
  APPROVED: { color: '#10B981', bg: 'rgba(16,185,129,.12)', label: 'Approved' },
  REJECTED: { color: '#EF4444', bg: 'rgba(239,68,68,.12)', label: 'Rejected' },
  PENDING: { color: '#F59E0B', bg: 'rgba(245,158,11,.12)', label: 'Pending' },
};

const PAGE_SIZE = 10;
const FETCH_SIZE = 10000;

const VideoTable = ({ search, setSearch, type }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [pendingRejectId, setPendingRejectId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef(null);

  // Snackbar options (top-right)
  const snackbarOptions = {
    anchorOrigin: { vertical: 'top', horizontal: 'right' },
    autoHideDuration: 3000,
  };

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, type]);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await videoApi.getAllVideos(
        statusFilter === 'All' ? null : statusFilter,
        debouncedSearch,
        0,
        FETCH_SIZE,
        type
      );
      const filteredVideos = (data.content || []).filter((video) => video.type === type);
      setAllVideos(filteredVideos);
      setTotalPages(Math.max(1, Math.ceil(filteredVideos.length / PAGE_SIZE)));
      setTotalElements(filteredVideos.length);
    } catch (err) {
      console.error('Failed to fetch videos', err);
      let message = 'Failed to load videos.';
      if (err.response?.status === 403) message = 'Access denied. Make sure you are logged in as ADMIN.';
      else if (err.response?.status === 401) message = 'Session expired. Please login again.';
      enqueueSnackbar(message, { variant: 'error', ...snackbarOptions });
      setAllVideos([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, type, enqueueSnackbar]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const visibleVideos = allVideos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleApprove = async (id) => {
    try {
      await videoApi.updateVideoStatus(id, 'APPROVED');
      enqueueSnackbar('Video approved successfully!', { variant: 'success', ...snackbarOptions });
      await fetchVideos();
    } catch (err) {
      console.error('Approve failed', err);
      const msg = err.response?.data?.message || err.message;
      enqueueSnackbar(`Approve failed: ${msg}`, { variant: 'error', ...snackbarOptions });
    }
  };

  const handleRejectClick = (id) => {
    setPendingRejectId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      enqueueSnackbar('Please provide a reason for rejection', { variant: 'warning', ...snackbarOptions });
      return;
    }
    try {
      await videoApi.updateVideoStatus(pendingRejectId, 'REJECTED', rejectReason);
      enqueueSnackbar('Video rejected', { variant: 'warning', ...snackbarOptions });
      setShowRejectModal(false);
      await fetchVideos();
    } catch (err) {
      console.error('Reject failed', err);
      const msg = err.response?.data?.message || err.message;
      enqueueSnackbar(`Reject failed: ${msg}`, { variant: 'error', ...snackbarOptions });
    }
  };

  const toCamelCase = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleEdit = (video) => {
    setSelectedVideo(video);
    setModalOpen(true);
  };

  const handleDeleteClick = (video) => {
    setVideoToDelete(video);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!videoToDelete) return;
    try {
      await videoApi.deleteVideo(videoToDelete.id);
      enqueueSnackbar('Video deleted successfully', { variant: 'success', ...snackbarOptions });
      setDeleteModalOpen(false);
      await fetchVideos();
    } catch (err) {
      console.error('Delete failed', err);
      const msg = err.response?.data?.message || err.message;
      enqueueSnackbar(`Delete failed: ${msg}`, { variant: 'error', ...snackbarOptions });
    }
  };

  const handleVideoUpdated = () => {
    fetchVideos();
  };

  return (
    <div>
      {/* Filter bar (unchanged) */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${type === 'SHORTS' ? 'shorts' : 'videos'} by title or creator…`}
            className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-border bg-bg-el text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl">
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

      {/* Table (unchanged) */}
      <div className="bg-bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 720 }}>
          <thead>
            <tr className="border-b border-border bg-bg-el">
              {['Video', 'Creator', 'Type', 'Category', 'Paid', 'Submitted', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-text-secondary">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Loading {type === 'SHORTS' ? 'shorts' : 'videos'}...
                  </div>
                </td>
              </tr>
            ) : visibleVideos.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-text-muted">
                  No {type === 'SHORTS' ? 'shorts' : 'videos'} match your search.
                </td>
              </tr>
            ) : (
              visibleVideos.map((video) => {
                const meta = STATUS_META[video.status];
                const isPending = video.status === 'PENDING';
                return (
                  <tr key={video.id} className="border-b border-border/50 last:border-0 hover:bg-bg-hov/30 transition-colors">
                    {/* Video cell */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-8 rounded-sm bg-bg-el flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                          {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt="thumb" className="w-full h-full object-cover" />
                          ) : (
                            '🎬'
                          )}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => handleEdit(video)}
                            className="font-medium text-text-primary line-clamp-1 max-w-[180px] hover:text-primary transition text-left"
                          >
                            {toCamelCase(video.title)}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{video.username}</td>
                    <td className="px-4 py-3">
                      <Badge text={video.type} type={video.type === 'SHORTS' ? 'info' : 'pro'} />
                    </td>
                    <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{video.category || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge text={video.paid ? 'Paid' : 'Free'} type={video.paid ? 'paid' : 'free'} small={true} />
                    </td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                      {new Date(video.publishedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge text={meta.label} type={video.status.toLowerCase()} />
                    </td>
                    <td className="px-4 py-3">
                      {isPending ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleApprove(video.id)}
                            className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-bold hover:bg-success/20 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectClick(video.id)}
                            className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-bold hover:bg-danger/20 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEdit(video)}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
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
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm text-text-muted">
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
            {Math.min(currentPage * PAGE_SIZE, totalElements)} of {totalElements}{' '}
            {type === 'SHORTS' ? 'shorts' : 'videos'}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} siblingCount={1} />
        </div>
      )}

      {/* Reject Modal */}
      <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Video" maxW={480}>
        <div className="space-y-4">
          <p className="text-text-secondary">Please provide a reason for rejection:</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows="3"
            className="w-full p-3 rounded-xl border border-border bg-bg-el text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Why is this video being rejected?"
          />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-bg-el transition-colors">
              Cancel
            </button>
            <button onClick={confirmReject} className="px-4 py-2 rounded-lg bg-danger text-white font-semibold hover:bg-danger/90 transition-colors">
              Reject
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <VideoDataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        video={selectedVideo}
        onVideoUpdated={handleVideoUpdated}
      />

      {/* Delete Modal */}
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

export default VideoTable;