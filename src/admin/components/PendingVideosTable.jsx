import React, { useState, useEffect, useCallback } from 'react';
import Badge from './ui/Badge';
import VideoDataModal from './VideoDataModal';
import { videoApi } from '../api/videoApi';

const PendingVideosTable = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [pendingRejectId, setPendingRejectId] = useState(null);

    const fetchPendingVideos = useCallback(async () => {
        setLoading(true);
        try {
            const data = await videoApi.getAllVideos('PENDING', '', 0, 50);
            setVideos(data.content || []);
        } catch (err) {
            console.error('Failed to fetch pending videos', err);
            alert('Could not load pending videos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingVideos();
    }, [fetchPendingVideos]);

    const handleApprove = async (id) => {
        try {
            await videoApi.updateVideoStatus(id, 'APPROVED');
            await fetchPendingVideos();
        } catch (err) {
            alert('Approve failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleRejectClick = (id) => {
        setPendingRejectId(id);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const confirmReject = async () => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        try {
            await videoApi.updateVideoStatus(pendingRejectId, 'REJECTED', rejectReason);
            setShowRejectModal(false);
            await fetchPendingVideos();
        } catch (err) {
            alert('Reject failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleEdit = (video) => {
        setSelectedVideo(video);
        setModalOpen(true);
    };

    const handleVideoUpdated = () => fetchPendingVideos();

    if (loading) return <div className="text-center py-6 text-text-secondary">Loading pending videos...</div>;

    if (videos.length === 0) {
        return <div className="bg-bg-card border border-border rounded-xl p-6 text-center text-text-secondary">No videos pending review 🎉</div>;
    }

    return (
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
                                        {video.title}
                                    </button>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{video.username}</td>
                            <td className="px-4 py-3">
                                <Badge text={video.type} type={video.type === 'SHORTS' ? 'info' : 'pro'} />
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
                </tbody>
            </table>

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-bg-card border border-border rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-2">Reject Video</h2>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            rows="3"
                            className="w-full p-3 rounded-xl border border-border bg-bg-el"
                            placeholder="Reason for rejection..."
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                            <button onClick={confirmReject} className="px-4 py-2 rounded-lg bg-danger text-white">Reject</button>
                        </div>
                    </div>
                </div>
            )}

            <VideoDataModal isOpen={modalOpen} onClose={() => setModalOpen(false)} video={selectedVideo} onVideoUpdated={handleVideoUpdated} />
        </div>
    );
};

export default PendingVideosTable;