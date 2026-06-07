import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import Badge from '../components/ui/Badge';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { creatorApi } from '../api/creatorApi';

const VideoTable = ({ videos = [], onEdit, onDelete: externalOnDelete }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);

  const handleDeleteClick = (video) => {
    setVideoToDelete(video);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!videoToDelete) return;
    try {
      if (externalOnDelete) {
        await externalOnDelete(videoToDelete.id);
      } else {
        await creatorApi.deleteVideo(videoToDelete.id);
      }
      enqueueSnackbar('Video deleted successfully', { variant: 'success' });
      setDeleteModalOpen(false);
      // Refresh or callback
      if (onEdit) onEdit(null); // just to trigger refresh, adjust as needed
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      enqueueSnackbar(`Delete failed: ${msg}`, { variant: 'error' });
    }
  };

  if (videos.length === 0) {
    return <div className="bg-bg-card border border-border rounded-xl p-8 text-center text-text-secondary">No videos found.</div>;
  }

  const toCamelCase = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      <div className="bg-bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 600 }}>
          <thead>
            <tr className="border-b border-border bg-bg-el">
              <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Video</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Views</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => {
              const statusType = video.status === 'APPROVED' ? 'approved' : video.status === 'REJECTED' ? 'rejected' : 'pending';
              return (
                <tr key={video.id} className="border-b border-border/50 last:border-0 hover:bg-bg-hov/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-8 rounded-lg bg-bg-el overflow-hidden flex items-center justify-center text-lg flex-shrink-0">
                        {video.thumbnailUrl ? <img src={video.thumbnailUrl} alt="thumb" className="w-full h-full object-cover" /> : '🎬'}
                      </div>
                      <span className="font-medium text-text-primary line-clamp-1 max-w-[200px]">{toCamelCase(video.title)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge text={video.status} type={statusType} /></td>
                  <td className="px-4 py-3 text-text-secondary tabular-nums">{video.viewCount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-text-muted whitespace-nowrap">{new Date(video.publishedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => onEdit?.(video)} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary-light text-xs font-semibold hover:bg-primary/20 transition-colors">Edit</button>
                      <button onClick={() => handleDeleteClick(video)} className="px-2.5 py-1 rounded-lg bg-danger/10 text-danger text-xs font-semibold hover:bg-danger/20 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        userName={videoToDelete?.title}
        itemType="video"
      />
    </>
  );
};

export default VideoTable;