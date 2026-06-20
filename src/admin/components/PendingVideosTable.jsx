import React, { useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import VideoDataModal from './VideoDataModal';
import Modal from '../components/ui/Modal';
import Pagination from './Pagination';
import { videoApi } from '../api/videoApi';
import { Film, Smartphone } from 'lucide-react';

const PAGE_SIZE = 10;

const PendingVideosTable = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [pendingRejectId, setPendingRejectId] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const snackbarOptions = {
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        autoHideDuration: 3000,
    };

    const getErrorMessage = (err, fallbackMessage) => {
        return err?.response?.data?.message || err?.message || fallbackMessage;
    };

    const isAuthError = (err) => {
        const status = err?.response?.status;
        return status === 401 || status === 403;
    };

    const fetchPendingVideos = useCallback(async () => {
        setLoading(true);
        const offset = (currentPage - 1) * PAGE_SIZE;
        try {
            const data = await videoApi.getAllVideos('PENDING', '', offset, PAGE_SIZE);
            setVideos(data.content || []);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            console.error('Failed to fetch pending videos', err);
            if (!isAuthError(err)) {
                enqueueSnackbar('Could not load pending videos', {
                    variant: 'error',
                    ...snackbarOptions,
                });
            }
            setVideos([]);
            setTotalPages(1);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, enqueueSnackbar]);

    useEffect(() => {
        fetchPendingVideos();
    }, [fetchPendingVideos]);

    const handleApprove = async (id) => {
        try {
            await videoApi.updateVideoStatus(id, 'APPROVED');
            await fetchPendingVideos();
        } catch (err) {
            enqueueSnackbar(`Approve failed: ${getErrorMessage(err, 'Unknown error')}`, {
                variant: 'error',
                ...snackbarOptions,
            });
        }
    };

    const handleRejectClick = (id) => {
        setPendingRejectId(id);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const toCamelCase = (str) => {
        return str
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const confirmReject = async () => {
        if (!rejectReason.trim()) {
            enqueueSnackbar('Please provide a reason for rejection', {
                variant: 'warning',
                ...snackbarOptions,
            });
            return;
        }
        try {
            await videoApi.updateVideoStatus(pendingRejectId, 'REJECTED', rejectReason);
            setShowRejectModal(false);
            await fetchPendingVideos();
        } catch (err) {
            enqueueSnackbar(`Reject failed: ${getErrorMessage(err, 'Unknown error')}`, {
                variant: 'error',
                ...snackbarOptions,
            });
        }
    };

    const handleEdit = (video) => {
        setSelectedVideo(video);
        setModalOpen(true);
    };

    const handleVideoUpdated = () => fetchPendingVideos();

    if (loading && videos.length === 0) {
        return <div className="text-center py-6 text-text-secondary">Loading pending videos...</div>;
    }

    if (videos.length === 0 && totalElements === 0) {
        return <div className="bg-bg-card border border-border rounded-xl p-6 text-center text-text-secondary">No videos pending review 🎉</div>;
    }

    return (
        <div className="space-y-4">
            <div className="bg-bg-card border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: 720 }}>
                    <thead>
                        <tr className="border-b border-border bg-bg-el">
                            {['Video', 'Creator', 'Type', 'Category', 'Submitted', 'Actions'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {videos.map(video => (
                            <tr key={video.id} className="border-b border-border/50 last:border-0 hover:bg-bg-hov/30 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-8 rounded-sm bg-bg-el flex items-center justify-center text-lg overflow-hidden">
                                            {video.thumbnailUrl ? (
                                                <img src={video.thumbnailUrl} alt="thumb" className="w-full h-full object-cover" />
                                            ) : '🎬'}
                                        </div>
                                        <button onClick={() => handleEdit(video)} className="font-medium text-text-primary hover:text-primary transition text-left">
                                            {toCamelCase(video.title)}
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{video.username}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        {video.type === 'SHORTS' ? (
                                            <Smartphone size={16} className="text-purple-400" />
                                        ) : (
                                            <Film size={16} className="text-blue-400" />
                                        )}
                                        <span className={`text-xs font-medium ${
                                            video.type === 'SHORTS' ? 'text-purple-400' : 'text-blue-400'
                                        }`}>
                                            {video.type}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-text-secondary">{video.category || '—'}</td>
                                <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                                    {new Date(video.publishedAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1.5">
                                        <button onClick={() => handleApprove(video.id)} className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-bold hover:bg-success/20">
                                            Approve
                                        </button>
                                        <button onClick={() => handleRejectClick(video.id)} className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-bold hover:bg-danger/20">
                                            Reject
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {videos.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                                    No pending videos on this page.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-sm text-text-muted">
                        Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, totalElements)} of {totalElements} pending videos
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        siblingCount={1}
                    />
                </div>
            )}

            {/* Rejection Modal – using shared Modal */}
            <Modal
                open={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                title="Reject Video"
                maxW={480}
            >
                <div className="space-y-4">
                    <p className="text-text-secondary">Please provide a reason for rejection:</p>
                    <textarea
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        rows="3"
                        className="w-full p-3 rounded-xl border border-border bg-bg-el text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Why is this video being rejected?"
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setShowRejectModal(false)}
                            className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-bg-el transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmReject}
                            className="px-4 py-2 rounded-lg bg-danger text-white font-semibold hover:bg-danger/90 transition-colors"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            </Modal>

            <VideoDataModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                video={selectedVideo}
                onVideoUpdated={handleVideoUpdated}
            />
        </div>
    );
};

export default PendingVideosTable;