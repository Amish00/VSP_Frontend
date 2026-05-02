import React, { useState, useEffect, useRef } from 'react';
import { videoApi } from '../api/videoApi';

const Badge = ({ text, type }) => {
    const colors = {
        approved: 'bg-green-500/10 text-green-600',
        rejected: 'bg-red-500/10 text-red-600',
        pending: 'bg-yellow-500/10 text-yellow-600',
        VIDEO: 'bg-blue-500/10 text-blue-600',
        SHORTS: 'bg-purple-500/10 text-purple-600',
    };
    return <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${colors[type] || colors.pending}`}>{text}</span>;
};

const Field = ({ label, children }) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">{label}</label>
        {children}
    </div>
);

const VideoDataModal = ({ isOpen, onClose, video, onVideoUpdated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        category: '',
        paid: false,
        type: 'VIDEO',
    });
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    
    // Track previous video ID to only reset when video changes
    const prevVideoIdRef = useRef(null);

    // Reset form data only when video ID changes (not on every render)
    useEffect(() => {
        if (video && isOpen && video.id !== prevVideoIdRef.current) {
            prevVideoIdRef.current = video.id;
            setFormData({
                title: video.title || '',
                description: video.description || '',
                tags: video.tags || '',
                category: video.category || '',
                paid: video.paid || false,
                type: video.type || 'VIDEO',
            });
            setEditMode(false);
        }
    }, [video, isOpen]);

    if (!isOpen || !video) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await videoApi.updateVideo(video.id, formData);
            if (onVideoUpdated) onVideoUpdated();
            setEditMode(false);
            onClose();
        } catch (err) {
            console.error('Update failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="bg-bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
                {/* Sticky header with higher z-index and opaque background */}
                <div className="sticky top-0 z-10 bg-bg-card border-b border-border px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-display font-bold text-text-primary">
                        {editMode ? 'Edit Video' : video.title}
                    </h2>
                    <div className="flex gap-2">
                        {!editMode && (
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition"
                            >
                                Edit
                            </button>
                        )}
                        <button onClick={onClose} className="text-text-muted hover:text-text-primary text-2xl leading-none">&times;</button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Preview Section */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Preview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-text-muted">Thumbnail</p>
                                {video.thumbnailUrl ? (
                                    <img src={video.thumbnailUrl} alt="thumbnail" className="rounded-xl w-full h-40 object-cover border border-border" />
                                ) : (
                                    <div className="bg-bg-el rounded-xl w-full h-40 flex items-center justify-center text-text-muted">No thumbnail</div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-text-muted">Video</p>
                                <video controls className="rounded-xl w-full max-h-40 border border-border" src={video.videoUrl}>
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            {/* Title - full width */}
                            <div className="md:col-span-2">
                                <Field label="Title">
                                    {editMode ? (
                                        <input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-2.5 rounded-xl border border-border bg-bg-el text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    ) : (
                                        <div className="bg-bg-el/30 p-2.5 rounded-xl border border-border/50">
                                            <p className="text-text-primary font-medium">{video.title}</p>
                                        </div>
                                    )}
                                </Field>
                            </div>

                            {/* Description - full width */}
                            <div className="md:col-span-2">
                                <Field label="Description">
                                    {editMode ? (
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full p-2.5 rounded-xl border border-border bg-bg-el text-text-primary focus:border-primary focus:outline-none"
                                        />
                                    ) : (
                                        <div className="bg-bg-el/30 p-2.5 rounded-xl border border-border/50 min-h-[80px] whitespace-pre-wrap">
                                            <p className="text-text-secondary">{video.description || 'No description provided.'}</p>
                                        </div>
                                    )}
                                </Field>
                            </div>

                            {/* Tags */}
                            <Field label="Tags">
                                {editMode ? (
                                    <input
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        placeholder="e.g. react, tutorial, webdev"
                                        className="w-full p-2.5 rounded-xl border border-border bg-bg-el text-text-primary"
                                    />
                                ) : (
                                    <div className="bg-bg-el/30 p-2.5 rounded-xl border border-border/50 min-h-[42px]">
                                        {video.tags ? (
                                            <div className="flex flex-wrap gap-1">
                                                {video.tags.split(',').map((tag, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">#{tag.trim()}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-text-muted text-sm">—</span>
                                        )}
                                    </div>
                                )}
                            </Field>

                            {/* Category */}
                            <Field label="Category">
                                {editMode ? (
                                    <input
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full p-2.5 rounded-xl border border-border bg-bg-el text-text-primary"
                                    />
                                ) : (
                                    <div className="bg-bg-el/30 p-2.5 rounded-xl border border-border/50">
                                        <p className="text-text-primary">{video.category || '—'}</p>
                                    </div>
                                )}
                            </Field>

                            {/* Paid + Type */}
                            {editMode ? (
                                <>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="paid"
                                                checked={formData.paid}
                                                onChange={handleChange}
                                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm text-text-primary">Paid Video</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Type</label>
                                        <div className="relative">
                                            <select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleChange}
                                                className="w-full appearance-none bg-bg-el border border-border text-text-primary rounded-xl p-2.5 pr-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                                                    backgroundPosition: 'right 10px center',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundSize: '20px',
                                                }}
                                            >
                                                <option value="VIDEO">VIDEO</option>
                                                <option value="SHORTS">SHORTS</option>
                                            </select>
                                            {/* Custom dropdown backdrop fix: style options */}
                                            <style>{`
                                                select option {
                                                    background-color: #1e293b;
                                                    color: #f1f5f9;
                                                }
                                            `}</style>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Field label="Paid">
                                        <div className="bg-bg-el/30 p-2.5 rounded-xl border border-border/50">
                                            <p className="text-text-primary">{video.paid ? 'Yes' : 'No'}</p>
                                        </div>
                                    </Field>
                                    <Field label="Type">
                                        <div className="bg-bg-el/30 p-2.5 rounded-xl border border-border/50">
                                            <Badge text={video.type} type={video.type} />
                                        </div>
                                    </Field>
                                </>
                            )}

                            {/* Status - read-only */}
                            <Field label="Status">
                                <div className="bg-bg-el/30 p-2.5 rounded-xl border border-border/50">
                                    <Badge text={video.status} type={video.status.toLowerCase()} />
                                </div>
                            </Field>

                            {/* Uploaded by */}
                            <Field label="Uploaded by">
                                <div className="bg-bg-el/30 p-2.5 rounded-xl border border-border/50">
                                    <p className="text-text-primary">{video.username} <span className="text-text-muted text-xs">({video.userEmail})</span></p>
                                </div>
                            </Field>

                            {/* Published date */}
                            <Field label="Published">
                                <div className="bg-bg-el/30 p-2.5 rounded-xl border border-border/50">
                                    <p className="text-text-primary">{new Date(video.publishedAt).toLocaleString()}</p>
                                </div>
                            </Field>

                            {/* Rejection reason (if exists) */}
                            {video.rejectionReason && (
                                <div className="md:col-span-2">
                                    <Field label="Rejection Reason">
                                        <div className="bg-danger/5 border border-danger/20 rounded-xl p-3">
                                            <p className="text-danger">{video.rejectionReason}</p>
                                        </div>
                                    </Field>
                                </div>
                            )}
                        </div>

                        {editMode && (
                            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border">
                                <button type="button" onClick={() => setEditMode(false)} className="px-5 py-2 rounded-xl border border-border text-text-secondary hover:bg-bg-el transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition disabled:opacity-50">
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VideoDataModal;