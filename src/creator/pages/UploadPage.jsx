import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import DropZone from '../components/upload/DropZone';
import UploadProgress from '../components/upload/UploadProgress';
import { Upload, X } from 'lucide-react';
import { creatorApi } from '../api/creatorApi';

const inp = "w-full bg-bg-el text-text-primary text-base rounded-xl border border-border px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";
const sel = `${inp} appearance-none`;
const area = `${inp} resize-none`;

const Toggle = ({ value, onChange, label, desc }) => (
  <div className="flex items-start justify-between gap-4 py-3.5 border-b border-border last:border-0">
    <div>
      <p className="text-sm font-medium text-text-primary">{label}</p>
      {desc && <p className="text-xs text-text-muted mt-0.5">{desc}</p>}
    </div>
    <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full flex-shrink-0 mt-0.5 transition-all ${value ? 'bg-primary' : 'bg-bg-hov'}`}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${value ? 'left-[22px]' : 'left-1'}`} />
    </button>
  </div>
);

const CATS = ['Technology','Design','Music','Gaming','Lifestyle','Business','Education','Sports','Finance','Comedy','Travel','Food'];
const LANGUAGES = ['English','Nepali','Hindi','Maithili','Bhojpuri','Newari','Tamang'];

const UploadPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [thumbFile, setThumbFile] = useState(null);
  const [thumb, setThumb] = useState(null);
  const thumbRef = useRef();

  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: '',
    category: 'Technology',
    language: 'English',
    scheduledAt: '',
    paid: false,
    type: 'VIDEO',
  });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const progressTimerRef = useRef(null);
  const startTimeRef = useRef(null);
  const realProgressRef = useRef(0);

  const stopFallbackProgress = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const startFallbackProgress = useCallback(() => {
    startTimeRef.current = Date.now();
    realProgressRef.current = 0;
    setUploadProgress(0);
    progressTimerRef.current = setInterval(() => {
      const elapsed = Math.min(Date.now() - startTimeRef.current, 30000);
      const smoothProgress = Math.min(95, Math.floor((elapsed / 30000) * 95));
      const displayProgress = Math.max(smoothProgress, realProgressRef.current);
      setUploadProgress(Math.min(99, displayProgress));
    }, 100);
  }, []);

  const resetForm = () => {
    if (thumb) URL.revokeObjectURL(thumb);
    setFile(null);
    setThumb(null);
    setThumbFile(null);
    setSubmitting(false);
    setUploadError(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    stopFallbackProgress();
    setForm({
      title: '',
      description: '',
      tags: '',
      category: 'Technology',
      language: 'English',
      scheduledAt: '',
      paid: false,
      type: 'VIDEO',
    });
  };

  const onThumbChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setThumbFile(f);
      setThumb(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async () => {
    if (!file || !form.title.trim()) return;
    setSubmitting(true);
    setUploadError(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    startFallbackProgress();

    try {
      const formData = new FormData();
      const requestData = {
        title: form.title,
        description: form.description,
        tags: form.tags,
        category: form.category,
        paid: form.paid,
        type: form.type,
      };
      formData.append('data', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));
      formData.append('video', file);
      if (thumbFile) formData.append('thumbnail', thumbFile);

      await creatorApi.uploadVideo(formData, (progressEvent) => {
        if (progressEvent.total > 0) {
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
      enqueueSnackbar('Video uploaded successfully! It is now under review.', { variant: 'success' });
      setSubmitting(false);
    } catch (err) {
      console.error('Upload error:', err);
      stopFallbackProgress();
      const errorMsg = err.response?.data?.message || err.message || 'Upload failed. Please try again.';
      setUploadError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: 'error' });
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => stopFallbackProgress();
  }, [stopFallbackProgress]);

  // UPLOADING SCREEN
  if (submitting) {
    return <UploadProgress file={file} onDone={() => {}} error={null} isUploading={true} progress={uploadProgress} />;
  }

  // SUCCESS SCREEN
  if (uploadSuccess) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-success/15 border-2 border-success flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
        <h2 className="font-display text-2xl font-extrabold mb-2 text-text-primary">Video Submitted!</h2>
        <p className="text-text-secondary text-sm mb-6 leading-relaxed">Your video is now under review. You'll be notified once it goes live.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={resetForm} className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition">Upload Another</button>
          <button onClick={() => navigate('/dashboard')} className="px-5 py-2 rounded-xl border border-border bg-bg-card text-text-primary font-semibold hover:bg-bg-hov transition">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  // ERROR SCREEN
  if (uploadError && !submitting) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-red-500/15 border-2 border-red-500 flex items-center justify-center text-3xl mx-auto mb-4">⚠️</div>
        <h2 className="font-display text-2xl font-bold mb-2 text-text-primary">Upload Failed</h2>
        <p className="text-sm text-text-secondary mb-4">{uploadError}</p>
        <button onClick={() => setUploadError(null)} className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition">Try Again</button>
      </div>
    );
  }

  // NORMAL UPLOAD FORM
  const canSubmit = Boolean(file && form.title.trim());

  return (
    <div className="pb-6 w-full">
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold mb-1 text-text-primary">Upload Video</h1>
      <p className="text-sm text-text-secondary mb-6">Fill in all details before submitting for review.</p>

      <div className="mb-6 space-y-4">
        <DropZone onFile={setFile} />
        {file && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-card px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{file.name}</p>
              <p className="text-xs text-text-muted">Ready to submit for review</p>
            </div>
            <button type="button" onClick={() => setFile(null)} className="shrink-0 rounded-lg border border-border bg-bg-el px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-bg-hov hover:text-text-primary transition-colors">Remove</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* LEFT: Main form fields */}
        <div className="space-y-5">
          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display font-bold text-sm text-text-muted uppercase tracking-wider mb-4">Basic Information</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">Title *</label>
              <input value={form.title} onChange={e => upd('title', e.target.value)} placeholder="Enter an engaging title for your video" className={inp} maxLength={100} />
              <p className="text-xs text-text-muted mt-1 text-right">{form.title.length}/100</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => upd('description', e.target.value)} rows={5} placeholder="Describe your video content, include keywords, chapters, links…" className={area} maxLength={5000} />
              <p className="text-xs text-text-muted mt-1 text-right">{form.description.length}/5000</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">Tags</label>
              <input value={form.tags} onChange={e => upd('tags', e.target.value)} placeholder="react, tutorial, web development (comma separated, max 10)" className={inp} />
              <p className="text-xs text-text-muted mt-1">Add relevant tags to help viewers discover your video</p>
            </div>
          </div>

          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display font-bold text-sm text-text-muted uppercase tracking-wider mb-4">Categorization</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Category *</label>
                <select value={form.category} onChange={e => upd('category', e.target.value)} className={sel}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Language</label>
                <select value={form.language} onChange={e => upd('language', e.target.value)} className={sel}>
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">Content Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="type" value="VIDEO" checked={form.type === 'VIDEO'} onChange={() => upd('type', 'VIDEO')} className="w-4 h-4 text-primary" />
                  <span className="text-text-primary">Video</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="type" value="SHORTS" checked={form.type === 'SHORTS'} onChange={() => upd('type', 'SHORTS')} className="w-4 h-4 text-primary" />
                  <span className="text-text-primary">Short</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display font-bold text-sm text-text-muted uppercase tracking-wider mb-4">Monetization</h2>
            <Toggle value={form.paid} onChange={v => upd('paid', v)} label="Paid content" desc="Require an active subscription to watch this video" />
          </div>
        </div>

        {/* RIGHT: Thumbnail + preview + submit */}
        <div className="space-y-5">
          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display font-bold text-sm text-text-muted uppercase tracking-wider mb-4">Thumbnail</h2>
            <div onClick={() => thumbRef.current?.click()} className="aspect-video rounded-xl border-2 border-dashed border-border-light flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/4 transition-all mb-3 overflow-hidden relative">
              {thumb ? (
                <img src={thumb} alt="Thumbnail preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload size={28} className="text-text-muted" />
                  <p className="text-sm font-semibold text-text-secondary">Upload thumbnail</p>
                  <p className="text-xs text-text-muted">1280 × 720px recommended</p>
                </>
              )}
              {thumb && (
                <button onClick={e => { e.stopPropagation(); setThumb(null); setThumbFile(null); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                  <X size={14} />
                </button>
              )}
            </div>
            <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={onThumbChange} />
          </div>

          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display font-bold text-sm text-text-muted uppercase tracking-wider mb-4">Preview Card</h2>
            <div className="rounded-xl overflow-hidden border border-border">
              <div className="aspect-video bg-bg-el flex items-center justify-center relative overflow-hidden">
                {thumb ? <img src={thumb} alt="" className="w-full h-full object-cover" /> : <span className="text-4xl">🎬</span>}
                <span className="absolute bottom-2 right-2 bg-black/85 text-white px-2 py-0.5 rounded-md text-xs font-semibold">0:00</span>
                {form.paid ? (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-semibold" style={{ background:'rgba(245,158,11,.2)', color:'#F59E0B', border:'1px solid rgba(245,158,11,.35)' }}>PAID</span>
                ) : (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-semibold bg-success/15 text-success border border-success/30">FREE</span>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-text-primary line-clamp-2 mb-1">{form.title || 'Your video title will appear here'}</p>
                <p className="text-xs text-text-muted">{form.category}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button onClick={handleSubmit} disabled={!canSubmit} className="w-full bg-primary text-white font-bold text-base rounded-xl py-3 hover:bg-[#1d4ed8] disabled:opacity-40 transition-all shadow-[0_2px_8px_rgba(37,99,235,.4)]">
              Submit for Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;