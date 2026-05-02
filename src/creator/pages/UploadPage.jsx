// src/pages/UploadPage.jsx
import React, { useRef, useState } from 'react'
import DropZone from '../components/upload/DropZone'
import UploadProgress from '../components/upload/UploadProgress'
import { Upload, X } from 'lucide-react'
import { creatorApi } from '../api/creatorApi'

// Reusable styles (exactly as you had)
const inp  = "w-full bg-bg-el text-text-primary text-base rounded-xl border border-border px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
const sel  = `${inp} appearance-none`
const area = `${inp} resize-none`

const Toggle = ({ value, onChange, label, desc }) => (
  <div className="flex items-start justify-between gap-4 py-3.5 border-b border-border last:border-0">
    <div>
      <p className="text-sm font-medium text-text-primary">{label}</p>
      {desc && <p className="text-xs text-text-muted mt-0.5">{desc}</p>}
    </div>
    <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full flex-shrink-0 mt-0.5 transition-all ${value ? 'bg-primary' : 'bg-bg-hov'}`}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${value ? 'left-[22px]' : 'left-1'}`} />
    </button>
  </div>
)

const CATS         = ['Technology','Design','Music','Gaming','Lifestyle','Business','Education','Sports','Finance','Comedy','Travel','Food']
const LANGUAGES    = ['English','Nepali','Hindi','Maithili','Bhojpuri','Newari','Tamang']
const VISIBILITIES = ['Public','Unlisted','Private','Scheduled']
const RESOLUTIONS  = ['4K (2160p)','1440p','1080p (Full HD)','720p (HD)','480p','360p']

const UploadPage = () => {
  // Video file and upload state
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  // Thumbnail file and preview
  const [thumbFile, setThumbFile] = useState(null)
  const [thumb, setThumb] = useState(null)
  const thumbRef = useRef()

  // Form fields
  const [form, setForm] = useState({
    title:        '',
    description:  '',
    tags:         '',
    category:     'Technology',
    language:     'English',
    scheduledAt:  '',
    paid:         false,
    type:         'VIDEO',     
  })
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Reset everything after successful upload
  const resetForm = () => {
    if (thumb) URL.revokeObjectURL(thumb)
    setFile(null)
    setThumb(null)
    setThumbFile(null)
    setSubmitting(false)
    setUploadError(null)
    setForm({
      title: '',
      description: '',
      tags: '',
      category: 'Technology',
      language: 'English',
      scheduledAt: '',
      paid: false,
      type: 'VIDEO',
    })
  }

  // Handle thumbnail file selection
  const onThumbChange = (e) => {
    const f = e.target.files?.[0]
    if (f) {
      setThumbFile(f)
      setThumb(URL.createObjectURL(f))
    }
  }

  // Submit video
  const handleSubmit = async () => {
    if (!file || !form.title.trim()) return
    setSubmitting(true)
    setUploadError(null)

    try {
      const formData = new FormData()

      // Prepare the JSON part (matches VideoUploadRequest DTO on backend)
      const requestData = {
        title: form.title,
        description: form.description,
        tags: form.tags,
        category: form.category,
        isPaid: form.paid,          // backend expects "isPaid"
        type: form.type,            // "VIDEO" or "SHORTS"
      }
      formData.append('data', new Blob([JSON.stringify(requestData)], { type: 'application/json' }))

      // Append video file
      formData.append('video', file)

      // Append thumbnail if one was selected
      if (thumbFile) {
        formData.append('thumbnail', thumbFile)
      }

      await creatorApi.uploadVideo(formData)

      // Success – reset after a short delay so user sees the success state
      setTimeout(() => resetForm(), 2000)
    } catch (err) {
      console.error('Upload error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Upload failed. Please try again.'
      setUploadError(errorMsg)
      setSubmitting(false)
    }
  }

  const canSubmit = Boolean(file && form.title.trim())

  // Show progress / success screen while uploading
  if (submitting) {
    return (
      <UploadProgress
        file={file}
        onDone={resetForm}
        error={uploadError}
        isUploading={!uploadError}
      />
    )
  }

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
            <button
              type="button"
              onClick={() => setFile(null)}
              className="shrink-0 rounded-lg border border-border bg-bg-el px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-bg-hov hover:text-text-primary transition-colors"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">

        {/* LEFT: Main form fields */}
        <div className="space-y-5">
          {/* Basic info */}
          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display font-bold text-sm text-text-muted uppercase tracking-wider mb-4">Basic Information</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">Title *</label>
              <input value={form.title} onChange={e => upd('title', e.target.value)}
                placeholder="Enter an engaging title for your video" className={inp} maxLength={100} />
              <p className="text-xs text-text-muted mt-1 text-right">{form.title.length}/100</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => upd('description', e.target.value)}
                rows={5} placeholder="Describe your video content, include keywords, chapters, links…"
                className={area} maxLength={5000} />
              <p className="text-xs text-text-muted mt-1 text-right">{form.description.length}/5000</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">Tags</label>
              <input value={form.tags} onChange={e => upd('tags', e.target.value)}
                placeholder="react, tutorial, web development (comma separated, max 10)"
                className={inp} />
              <p className="text-xs text-text-muted mt-1">Add relevant tags to help viewers discover your video</p>
            </div>
          </div>

          {/* Categorization */}
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
          </div>

          {/* Monetization */}
          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display font-bold text-sm text-text-muted uppercase tracking-wider mb-4">Monetization</h2>
            <Toggle value={form.paid} onChange={v => upd('paid', v)}
              label="Paid content" desc="Require an active subscription to watch this video" />
          </div>
        </div>

        {/* RIGHT: Thumbnail + preview + submit */}
        <div className="space-y-5">
          {/* Thumbnail upload */}
          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display font-bold text-sm text-text-muted uppercase tracking-wider mb-4">Thumbnail</h2>
            <div
              onClick={() => thumbRef.current?.click()}
              className="aspect-video rounded-xl border-2 border-dashed border-border-light flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/4 transition-all mb-3 overflow-hidden relative">
              {thumb
                ? <img src={thumb} alt="Thumbnail preview" className="w-full h-full object-cover" />
                : <>
                    <Upload size={28} className="text-text-muted" />
                    <p className="text-sm font-semibold text-text-secondary">Upload thumbnail</p>
                    <p className="text-xs text-text-muted">1280 × 720px recommended</p>
                  </>
              }
              {thumb && (
                <button onClick={e => { e.stopPropagation(); setThumb(null); setThumbFile(null) }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                  <X size={14} />
                </button>
              )}
            </div>
            <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={onThumbChange} />
          </div>

          {/* Live preview card */}
          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display font-bold text-sm text-text-muted uppercase tracking-wider mb-4">Preview Card</h2>
            <div className="rounded-xl overflow-hidden border border-border">
              <div className="aspect-video bg-bg-el flex items-center justify-center relative overflow-hidden">
                {thumb
                  ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                  : <span className="text-4xl">🎬</span>
                }
                <span className="absolute bottom-2 right-2 bg-black/85 text-white px-2 py-0.5 rounded-md text-xs font-semibold">0:00</span>
                {form.paid
                  ? <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-semibold" style={{ background:'rgba(245,158,11,.2)', color:'#F59E0B', border:'1px solid rgba(245,158,11,.35)' }}>⭐ PAID</span>
                  : <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-semibold bg-success/15 text-success border border-success/30">FREE</span>
                }
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-text-primary line-clamp-2 mb-1">
                  {form.title || 'Your video title will appear here'}
                </p>
                <p className="text-xs text-text-muted">{form.category}</p>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="space-y-2">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full bg-primary text-white font-bold text-base rounded-xl py-3 hover:bg-[#1d4ed8] disabled:opacity-40 transition-all shadow-[0_2px_8px_rgba(37,99,235,.4)]">
              Submit for Review
            </button>
            {uploadError && <p className="text-sm text-red-500 text-center">{uploadError}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadPage