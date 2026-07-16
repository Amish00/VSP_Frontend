import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Upload, X, Edit, Save, Eye, Heart, MessageCircle,
  ThumbsUp, ArrowLeft, Film, CheckCircle, AlertCircle, XCircle, Clock
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import StatCard from '../components/ui/StatCard';
import { creatorApi } from '../api/creatorApi';
import axios from 'axios';

const inp = "w-full bg-bg-el text-text-primary text-base rounded-xl border border-border px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";
const sel = `${inp} appearance-none`;
const area = `${inp} resize-none`;
const valueCard = "bg-bg-el rounded-xl border border-border px-4 py-3 text-text-primary";

const CATS = ['Technology', 'Design', 'Music', 'Gaming', 'Lifestyle', 'Business', 'Education', 'Sports', 'Finance', 'Comedy', 'Travel', 'Food'];
const VIDEO_TYPES = ['VIDEO', 'SHORTS'];

const VideoInfoPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'view';
  const typeParam = searchParams.get('type');
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [showThumbConfirm, setShowThumbConfirm] = useState(false);
  const [showVideoConfirm, setShowVideoConfirm] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const thumbInputRef = useRef();
  const videoInputRef = useRef();

  // Upload progress states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Fallback progress timer
  const progressTimerRef = useRef(null);
  const startTimeRef = useRef(null);
  const realProgressRef = useRef(0);

  const stopFallbackProgress = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const startFallbackProgress = () => {
    startTimeRef.current = Date.now();
    realProgressRef.current = 0;
    setUploadProgress(0);
    progressTimerRef.current = setInterval(() => {
      const elapsed = Math.min(Date.now() - startTimeRef.current, 30000);
      const smoothProgress = Math.min(95, Math.floor((elapsed / 30000) * 95));
      const displayProgress = Math.max(smoothProgress, realProgressRef.current);
      setUploadProgress(Math.min(99, displayProgress));
    }, 100);
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await creatorApi.getVideo(id);
        setVideo(res.data);
        setEditData({
          title: res.data.title,
          description: res.data.description || '',
          tags: res.data.tags || '',
          category: res.data.category || CATS[0],
          paid: res.data.paid,
          type: res.data.type || 'VIDEO',
        });
        setThumbPreview(res.data.thumbnailUrl);
      } catch (err) {
        console.error(err);
        enqueueSnackbar('Failed to load video details', { variant: 'error' });
        navigate('/creator/videos');
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id, navigate, enqueueSnackbar]);

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await axios.get(`/api/comments/video/${id}?size=50`);
      setComments(res.data.content || []);
    } catch (err) {
      console.error('Failed to load comments', err);
      enqueueSnackbar('Could not load comments', { variant: 'error' });
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchComments();
  }, [id]);

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbFile(file);
      setThumbPreview(URL.createObjectURL(file));
      setShowThumbConfirm(true);
    }
  };

  const confirmThumbnailReplace = () => {
    setShowThumbConfirm(false);
    // keep the new file
  };

  const cancelThumbnailReplace = () => {
    setShowThumbConfirm(false);
    setThumbFile(null);
    setThumbPreview(video?.thumbnailUrl);
    if (thumbInputRef.current) thumbInputRef.current.value = '';
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setShowVideoConfirm(true);
    }
  };

  const confirmVideoReplace = () => {
    setShowVideoConfirm(false);
    // keep the new file
  };

  const cancelVideoReplace = () => {
    setShowVideoConfirm(false);
    setVideoFile(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!editData.title.trim()) {
      enqueueSnackbar('Title is required', { variant: 'warning' });
      return;
    }

    // Reset progress states
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    setShowProgressModal(true);
    setSaving(true);

    startFallbackProgress();

    try {
      const formData = new FormData();
      const metadata = {
        title: editData.title,
        description: editData.description,
        tags: editData.tags,
        category: editData.category,
        isPaid: editData.paid,
        type: editData.type,
      };
      formData.append('data', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      if (thumbFile) formData.append('thumbnail', thumbFile);
      if (videoFile) formData.append('video', videoFile);

      await creatorApi.updateVideoWithFiles(id, formData, (progressEvent) => {
        if (progressEvent?.total > 0) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          realProgressRef.current = percent;
          setUploadProgress(prev => {
            if (percent >= 100) return 99;
            return Math.max(prev, percent);
          });
        }
      });

      stopFallbackProgress();
      setUploadProgress(100);
      setUploadSuccess(true);
      setSaving(false);

      // Refresh video data
      const refreshed = await creatorApi.getVideo(id);
      setVideo(refreshed.data);
      setEditData({
        title: refreshed.data.title,
        description: refreshed.data.description || '',
        tags: refreshed.data.tags || '',
        category: refreshed.data.category,
        paid: refreshed.data.paid,
        type: refreshed.data.type,
      });
      setThumbFile(null);
      setVideoFile(null);
      setThumbPreview(refreshed.data.thumbnailUrl);
      enqueueSnackbar('Video updated successfully', { variant: 'success' });

      // Auto-close progress modal and navigate back to view mode, preserving type param
      setTimeout(() => {
        setShowProgressModal(false);
        setUploadSuccess(false);
        const typeQuery = isShort ? '&type=short' : '';
        navigate(`/creator/video/${id}?mode=view${typeQuery}`, { replace: true });
      }, 2000);
    } catch (err) {
      console.error(err);
      stopFallbackProgress();
      const msg = err.response?.data?.message || err.message;
      setUploadError(msg);
      setUploadSuccess(false);
      setSaving(false);
      enqueueSnackbar(`Update failed: ${msg}`, { variant: 'error' });
    }
  };

  useEffect(() => {
    return () => stopFallbackProgress();
  }, []);

  if (loading) return <div className="p-8 text-center text-text-muted">Loading details...</div>;
  if (!video) return null;

  const isShort = video.type === 'SHORTS';
  const effectiveType = typeParam || (isShort ? 'short' : 'video');
  const isEditMode = mode === 'edit';
  const tagsArray = video.tags ? video.tags.split(',').map(t => t.trim()) : [];

  const statusConfig = {
    APPROVED: { label: 'Approved', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    REJECTED: { label: 'Rejected', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
    PENDING: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  };
  const status = statusConfig[video.status] || { label: video.status, color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };

  const buildUrl = (viewMode) => {
    const typeQuery = effectiveType === 'short' ? '&type=short' : '';
    return `/creator/video/${id}?mode=${viewMode}${typeQuery}`;
  };

  const handleBackToList = () => {
    navigate(isShort ? '/creator/shorts' : '/creator/videos');
  };

  const renderProgressContent = () => {
    if (uploadSuccess) {
      return (
        <div className="text-center">
          <CheckCircle size={48} className="mx-auto mb-4 text-success" />
          <h2 className="font-display text-2xl font-bold mb-2 text-text-primary">Update Complete!</h2>
          <p className="text-text-secondary text-sm">Your changes have been saved successfully.</p>
        </div>
      );
    }

    if (uploadError) {
      return (
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="font-display text-2xl font-bold mb-2 text-text-primary">Update Failed</h2>
          <p className="text-text-secondary text-sm mb-4">{uploadError}</p>
          <button
            onClick={() => {
              setUploadError(null);
              setShowProgressModal(false);
              setSaving(false);
            }}
            className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="text-center">
        <Upload size={48} className="mx-auto mb-4 text-primary animate-pulse" />
        <h2 className="font-display text-2xl font-bold mb-2 text-text-primary">Saving Changes…</h2>
        <p className="text-sm text-text-secondary mb-4">
          {thumbFile && 'Thumbnail '}
          {thumbFile && videoFile && '& '}
          {videoFile && 'Video file '}
          {(!thumbFile && !videoFile) ? 'Metadata ' : ''}
          is being uploaded.
        </p>
        <div className="max-w-md mx-auto">
          <div className="h-2 bg-bg-el rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className="text-sm font-medium text-text-primary mt-2">{uploadProgress}%</p>
        </div>
        <p className="text-sm text-text-muted mt-2">Please do not close this window.</p>
      </div>
    );
  };

  return (
    <div className="w-full pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToList}
            className="p-2 rounded-lg bg-bg-el border border-border text-text-secondary hover:text-text-primary transition"
            aria-label="Back to list"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">
            {isEditMode
              ? (isShort ? 'Edit Short' : 'Edit Video')
              : (isShort ? 'Short Details' : 'Video Details')}
          </h1>
        </div>
        {!isEditMode && (
          <button
            onClick={() => navigate(buildUrl('edit'))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary-light text-sm font-semibold hover:bg-primary/20 transition"
          >
            <Edit size={16} /> {isShort ? 'Edit Short' : 'Edit Video'}
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={<Eye size={24} color="#60A5FA" />} 
          label="Views" 
          value={video.viewCount?.toLocaleString() || 0} 
          color="#60A5FA"
        />
        <StatCard 
          icon={<Heart size={24} color="#EC4899" />} 
          label="Likes" 
          value={video.likesCount?.toLocaleString() || 0} 
          color="#EC4899"
        />
        <StatCard 
          icon={<MessageCircle size={24} color="#10B981" />} 
          label="Comments" 
          value={video.commentCount?.toLocaleString() || 0} 
          color="#10B981"
        />
        <StatCard
          icon={
            video.status === 'APPROVED' ? <CheckCircle size={24} color="#10B981" /> :
            video.status === 'REJECTED' ? <XCircle size={24} color="#EF4444" /> :
            <Clock size={24} color="#F59E0B" />
          }
          label="Status"
          value={<span className="text-sm font-medium">{status.label}</span>}
          color={status.color}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Video & Thumbnail */}
        <div className="space-y-6">
          <div className="bg-bg-card border border-border rounded-2xl p-4">
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              {isShort ? 'Short Preview' : 'Video Preview'}
            </label>
            <div className={`${isShort ? 'aspect-square max-w-[400px] mx-auto' : 'aspect-video'} rounded-xl overflow-hidden bg-black`}>
              <video
                key={video.videoUrl}
                src={videoFile ? URL.createObjectURL(videoFile) : video.videoUrl}
                controls
                className="w-full h-full object-contain"
              />
            </div>
            {videoFile && <p className="text-xs text-primary mt-2">New video selected: {videoFile.name}</p>}
          </div>
          <div className="bg-bg-card border border-border rounded-2xl p-4">
            <label className="block text-sm font-semibold text-text-secondary mb-2">Thumbnail</label>
            <div className="relative w-full max-w-md mx-auto aspect-video rounded-xl overflow-hidden border border-border bg-bg-el flex items-center justify-center">
              {thumbPreview ? (
                <img src={thumbPreview} alt="Thumbnail" className="w-full h-full object-cover" />
              ) : (
                <Film size={40} className="text-text-muted" />
              )}
              {isEditMode && (
                <>
                  <button
                    onClick={() => thumbInputRef.current.click()}
                    className="absolute bottom-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition"
                  >
                    <Upload size={16} />
                  </button>
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Metadata + Comments */}
        <div className="space-y-6">
          <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Title *</label>
              {isEditMode ? (
                <input
                  value={editData.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  className={inp}
                  maxLength={100}
                />
              ) : (
                <div className={valueCard}>{video.title}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Description</label>
              {isEditMode ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  rows={4}
                  className={area}
                />
              ) : (
                <div className={valueCard + ' whitespace-pre-wrap'}>{video.description || '—'}</div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Category</label>
                {isEditMode ? (
                  <select
                    value={editData.category}
                    onChange={(e) => handleEditChange('category', e.target.value)}
                    className={sel}
                  >
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                ) : (
                  <div className={valueCard}>{video.category || '—'}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Type</label>
                {isEditMode ? (
                  <select
                    value={editData.type}
                    onChange={(e) => handleEditChange('type', e.target.value)}
                    className={sel}
                  >
                    {VIDEO_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                ) : (
                  <div className={valueCard}>{video.type || 'VIDEO'}</div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Tags</label>
              {isEditMode ? (
                <input
                  value={editData.tags}
                  onChange={(e) => handleEditChange('tags', e.target.value)}
                  placeholder="react, tutorial, web development"
                  className={inp}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tagsArray.length > 0 ? (
                    tagsArray.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-full bg-primary/10 text-primary-light text-xs font-medium">
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-text-muted text-sm">—</span>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Paid Content</label>
              {isEditMode ? (
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleEditChange('paid', true)}
                    className={`px-4 py-2 rounded-lg ${editData.paid ? 'bg-primary text-white' : 'bg-bg-el text-text-secondary'}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditChange('paid', false)}
                    className={`px-4 py-2 rounded-lg ${!editData.paid ? 'bg-primary text-white' : 'bg-bg-el text-text-secondary'}`}
                  >
                    No
                  </button>
                </div>
              ) : (
                <div className={valueCard}>
                  <span className={video.paid ? 'text-amber-600 font-semibold' : 'text-green-600 font-semibold'}>
                    {video.paid ? 'Paid' : 'Free'}
                  </span>
                </div>
              )}
            </div>
            {isEditMode && (
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Replace Video File (optional)</label>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary-light hover:file:bg-primary/20"
                  onChange={handleVideoChange}
                />
              </div>
            )}
            {isEditMode && (
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => navigate(buildUrl('view'))}
                  className="px-6 py-2.5 rounded-xl border border-border text-text-secondary font-semibold hover:bg-bg-el transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 transition"
                >
                  {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
              </div>
            )}
          </div>

          {!isEditMode && (
            <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-bold text-lg text-text-primary flex items-center gap-2">
                <MessageCircle size={20} /> Comments ({video.commentCount || 0})
              </h3>
              <div className="max-h-80 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {commentsLoading ? (
                  <div className="text-center text-text-muted py-4">Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div className="text-center text-text-muted py-4">No comments yet.</div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 border-b border-border pb-3 last:border-0">
                      <img
                        src={comment.userProfilePicture || `https://ui-avatars.com/api/?name=${comment.username}&background=3b82f6&color=fff`}
                        alt={comment.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-text-primary text-sm">{comment.username}</span>
                          <span className="text-xs text-text-muted">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-text-secondary text-sm mt-1">{comment.content}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button className="flex items-center gap-1 text-xs text-text-muted hover:text-primary">
                            <ThumbsUp size={12} /> {comment.likesCount || 0}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modals */}
      <Modal open={showThumbConfirm} onClose={cancelThumbnailReplace} title="Replace Thumbnail">
        <p className="text-text-secondary mb-4">Are you sure you want to replace the current thumbnail with the new image?</p>
        <div className="flex justify-end gap-3">
          <button onClick={cancelThumbnailReplace} className="px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:bg-bg-el">
            Cancel
          </button>
          <button onClick={confirmThumbnailReplace} className="px-3 py-1.5 rounded-lg bg-primary text-white">
            Confirm
          </button>
        </div>
      </Modal>

      <Modal open={showVideoConfirm} onClose={cancelVideoReplace} title="Replace Video File">
        <p className="text-text-secondary mb-4">
          Replacing the video file cannot be undone. The new video will be re-encoded and reviewed again. Continue?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={cancelVideoReplace} className="px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:bg-bg-el">
            Cancel
          </button>
          <button onClick={confirmVideoReplace} className="px-3 py-1.5 rounded-lg bg-primary text-white">
            Confirm
          </button>
        </div>
      </Modal>

      {/* Progress Modal */}
      <Modal
        open={showProgressModal}
        onClose={() => {
          if (uploadSuccess) return;
          if (uploadError) {
            setUploadError(null);
            setShowProgressModal(false);
            setSaving(false);
          }
        }}
        title="Upload Progress"
        closeOnBackdropClick={!uploadSuccess && !uploadError}
        showCloseButton={!uploadSuccess && !uploadError}
      >
        {renderProgressContent()}
      </Modal>
    </div>
  );
};

export default VideoInfoPage;