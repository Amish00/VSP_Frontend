import React, { useState, useRef } from 'react'
import {
  Film, Download, Share2, Scissors, ChevronUp, ChevronDown, X, Check,
  Loader, AlertCircle, Undo2, Redo2, ArrowLeft, Copy,
  Youtube, Instagram, Twitter, Facebook
} from 'lucide-react'
import { useStore } from '../store/store'
import { CANVAS_PRESETS, EFFECTS, TRANSITIONS, SHAPES, transitionCSS } from '../utils/constants'
import logoUrl from '../../../../assets/logo.svg'
import { useNavigate } from 'react-router-dom'
import { videoTheme } from '../theme'

// ---------- Helper functions for export ----------
const getFilterCss = (filterId) => {
  const found = EFFECTS.find(e => e.id === filterId)
  return found?.css || 'none'
}

function getTransStyle(clip, currentTime) {
  const rel = currentTime - clip.start
  const rem = clip.duration - rel
  let styles = {}
  if (clip.transIn && rel < clip.transInDur) {
    const p = rel / clip.transInDur
    Object.assign(styles, transitionCSS(clip.transIn, p, 'in'))
  }
  if (clip.transOut && rem < clip.transOutDur) {
    const p = rem / clip.transOutDur
    const outStyle = transitionCSS(clip.transOut, 1 - p, 'in')
    styles.opacity = (styles.opacity ?? 1) * (outStyle.opacity ?? 1)
    if (outStyle.transform) styles.transform = outStyle.transform
  }
  return styles
}

function drawMediaCover(ctx, source, canvasW, canvasH) {
  const aspect = source.videoWidth / source.videoHeight || 16/9
  let dw, dh, dx, dy
  const canvasAspect = canvasW / canvasH
  if (canvasAspect > aspect) {
    dh = canvasH
    dw = canvasH * aspect
    dx = (canvasW - dw) / 2
    dy = 0
  } else {
    dw = canvasW
    dh = canvasW / aspect
    dx = 0
    dy = (canvasH - dh) / 2
  }
  ctx.drawImage(source, dx, dy, dw, dh)
}

function drawOverlay(ctx, clip, canvasW, canvasH) {
  const x = ((clip.overlayX ?? 50) / 100) * canvasW
  const y = ((clip.overlayY ?? 50) / 100) * canvasH
  const w = ((clip.overlayW ?? 40) / 100) * canvasW
  const h = ((clip.overlayH ?? 20) / 100) * canvasH
  const scale = canvasW / 1920

  ctx.save()
  ctx.translate(x, y)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (clip.type === 'text') {
    const fontSize = (clip.fontSize || 72) * scale
    ctx.font = `${clip.fontWeight || 700} ${fontSize}px "${clip.fontFamily || 'Inter'}"`
    ctx.fillStyle = clip.textColor || '#ffffff'
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 8
    const lines = (clip.text || 'Text').split('\n')
    const lineHeight = fontSize * 1.2
    const totalHeight = lines.length * lineHeight
    lines.forEach((line, i) => {
      ctx.fillText(line, 0, -totalHeight/2 + i * lineHeight + lineHeight/2)
    })
  } else if (clip.type === 'shape') {
    const size = Math.min(w, h)
    ctx.fillStyle = clip.shapeColor || '#3b82f6'
    const shapeDef = SHAPES.find(s => s.id === clip.shapePath)
    const pathData = shapeDef?.d || SHAPES[0].d
    const path = new Path2D(pathData)
    const scaleFactor = size / 100
    ctx.translate(-50 * scaleFactor, -50 * scaleFactor)
    ctx.scale(scaleFactor, scaleFactor)
    ctx.fill(path)
  } else if (clip.type === 'sticker') {
    const fontSize = Math.min(w, h) * 0.8
    ctx.font = `${fontSize}px sans-serif`
    ctx.fillStyle = '#ffffff'
    ctx.fillText(clip.sticker || '⭐', 0, 0)
  }
  ctx.restore()
}

// ---------- ShareModal ----------
function ShareModal({ onClose }) {
  const { projectName } = useStore()
  const [copied, setCopied] = useState(false)
  const shareableLink = `${window.location.origin}/project/${projectName.replace(/\s/g, '-').toLowerCase()}`

  // Social links now point to the platform's homepage (not share intent)
  const socialLinks = [
    { name: 'YouTube', icon: Youtube, color: '#FF0000', url: 'https://youtube.com' },
    { name: 'TikTok', icon: () => <span style={{ fontSize: 18 }}>🎵</span>, color: '#000000', url: 'https://tiktok.com' },
    { name: 'Instagram', icon: Instagram, color: '#E4405F', url: 'https://instagram.com' },
    { name: 'Twitter', icon: Twitter, color: '#1DA1F2', url: 'https://twitter.com' },
    { name: 'Facebook', icon: Facebook, color: '#1877F2', url: 'https://facebook.com' },
  ]

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: videoTheme.card, border: `1px solid ${videoTheme.border}`, borderRadius: 12, padding: 22, width: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: videoTheme.text }}>Share Project</div>
            <div style={{ fontSize: 10, color: videoTheme.textMuted, marginTop: 1 }}>"{projectName}"</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: videoTheme.textMuted, cursor: 'pointer' }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
          {socialLinks.map(social => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '8px 0', borderRadius: 8, background: videoTheme.el, border: `1px solid ${videoTheme.border}`,
                textDecoration: 'none', transition: 'all 0.1s', cursor: 'pointer'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = videoTheme.hov; e.currentTarget.style.borderColor = videoTheme.borderLight }}
              onMouseLeave={e => { e.currentTarget.style.background = videoTheme.el; e.currentTarget.style.borderColor = videoTheme.border }}
            >
              <social.icon size={20} color={social.color} />
              <span style={{ fontSize: 10, color: videoTheme.textSecondary }}>{social.name}</span>
            </a>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: videoTheme.textMuted, fontWeight: 600, letterSpacing: 0.8, marginBottom: 7 }}>SHAREABLE LINK</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              readOnly
              value={shareableLink}
              style={{
                flex: 1, background: videoTheme.el, border: `1px solid ${videoTheme.border}`, borderRadius: 6,
                padding: '6px 10px', fontSize: 11, color: videoTheme.textSecondary, outline: 'none', fontFamily: 'monospace'
              }}
            />
            <button
              onClick={handleCopyLink}
              style={{
                padding: '0 12px', borderRadius: 6, border: `1px solid ${videoTheme.border}`, background: videoTheme.el,
                color: videoTheme.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 500,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = videoTheme.hov; e.currentTarget.style.color = videoTheme.text }}
              onMouseLeave={e => { e.currentTarget.style.background = videoTheme.el; e.currentTarget.style.color = videoTheme.textSecondary }}
            >
              <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div style={{ fontSize: 9, color: videoTheme.textMuted, textAlign: 'center', borderTop: `1px solid ${videoTheme.border}`, paddingTop: 12 }}>
          Share this link or use the social buttons to promote your video.
        </div>
      </div>
    </div>
  )
}

// ---------- ExportModal (fully working) ----------
function ExportModal({ onClose }) {
  const { tracks, duration, width, height, fps, projectName } = useStore()
  const [format, setFormat] = useState('mp4')
  const [resIdx, setResIdx] = useState(0)
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [msg, setMsg] = useState('')
  const abort = useRef(false)

  const RES = [
    { label: 'Project', w: width, h: height },
    { label: '4K', w: 3840, h: 2160 },
    { label: '1080p', w: 1920, h: 1080 },
    { label: '720p', w: 1280, h: 720 },
    { label: '480p', w: 854, h: 480 },
  ]
  const res = RES[resIdx]
  const activeTracks = tracks.filter(t => !t.muted)
  const clips = activeTracks.flatMap(t => t.clips)

  let maxEnd = 0
  for (const clip of clips) {
    const end = clip.start + clip.duration
    if (end > maxEnd) maxEnd = end
  }
  const exportDuration = Math.max(0.1, maxEnd)

  const doExport = async () => {
    abort.current = false
    const outW = res.w, outH = res.h
    const mediaCache = {}
    const timers = []
    let audioContext = null

    try {
      setStatus('loading')
      setProgress(0)
      setMsg('Loading media…')

      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')

      for (const track of activeTracks) {
        for (const clip of track.clips) {
          if (!clip.src) continue
          if (clip.type === 'video') {
            const vid = document.createElement('video')
            vid.crossOrigin = 'anonymous'
            vid.playsInline = true
            vid.muted = true
            vid.src = clip.src
            vid.preload = 'auto'
            await new Promise(resolve => {
              vid.onloadedmetadata = resolve
              vid.onerror = resolve
              setTimeout(resolve, 5000)
            })
            mediaCache[clip.id] = vid
          } else if (clip.type === 'image') {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.src = clip.src
            await new Promise(resolve => {
              if (img.complete) resolve()
              img.onload = resolve
              img.onerror = resolve
              setTimeout(resolve, 5000)
            })
            mediaCache[clip.id] = img
          } else if (clip.type === 'audio') {
            const audio = document.createElement('audio')
            audio.crossOrigin = 'anonymous'
            audio.src = clip.src
            audio.preload = 'auto'
            await new Promise(resolve => {
              audio.onloadedmetadata = resolve
              audio.onerror = resolve
              setTimeout(resolve, 5000)
            })
            mediaCache[clip.id] = audio
          }
        }
      }

      if (abort.current) throw new Error('__canceled__')

      let audioDestination = null
      const soundClips = activeTracks.flatMap(t =>
        t.clips.filter(c => (c.type === 'audio' || c.type === 'video') && c.src && !c.muted && mediaCache[c.id])
      )

      if (soundClips.length > 0) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
        audioDestination = audioContext.createMediaStreamDestination()
        for (const clip of soundClips) {
          const el = mediaCache[clip.id]
          try {
            const node = audioContext.createMediaElementSource(el)
            const gain = audioContext.createGain()
            gain.gain.value = clip.volume ?? 1
            node.connect(gain)
            gain.connect(audioDestination)
            el.muted = false
          } catch {
            // element already tapped or unsupported
          }
        }
      }

      const canvasStream = canvas.captureStream(fps)
      let combinedStream = canvasStream
      if (audioDestination) {
        const audioTrack = audioDestination.stream.getAudioTracks()[0]
        if (audioTrack) {
          combinedStream = new MediaStream([...canvasStream.getVideoTracks(), audioTrack])
        }
      }

      const mimeType = format === 'mp4' ? 'video/mp4' : 'video/webm'
      const mime = MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'video/webm'
      const recorder = new MediaRecorder(combinedStream, { mimeType: mime, videoBitsPerSecond: 8000000 })
      const chunks = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }

      const scheduleClip = (clip) => {
        const el = mediaCache[clip.id]
        if (!el || (clip.type !== 'video' && clip.type !== 'audio')) return
        const startMs = clip.start * 1000
        const endMs = (clip.start + clip.duration) * 1000
        if (clip.start <= 0) {
          el.currentTime = clip.offset || 0
          el.play().catch(() => {})
        } else {
          timers.push(setTimeout(() => {
            el.currentTime = clip.offset || 0
            el.play().catch(() => {})
          }, startMs))
        }
        timers.push(setTimeout(() => { try { el.pause() } catch {} }, endMs))
      }

      setMsg('Recording…')
      recorder.start(1000)
      if (audioContext) await audioContext.resume()
      for (const track of activeTracks) {
        for (const clip of track.clips) scheduleClip(clip)
      }
      const wallStart = performance.now()

      await new Promise(resolve => {
        const draw = () => {
          const t = (performance.now() - wallStart) / 1000
          if (abort.current || t >= exportDuration) { resolve(); return }

          setProgress((t / exportDuration) * 100)
          setMsg(`Rendering ${t.toFixed(1)}s / ${exportDuration.toFixed(1)}s`)

          ctx.fillStyle = '#000'
          ctx.fillRect(0, 0, outW, outH)

          const activeClips = []
          for (const track of activeTracks) {
            for (const clip of track.clips) {
              if (t >= clip.start && t < clip.start + clip.duration) activeClips.push(clip)
            }
          }

          for (const clip of activeClips) {
            if (clip.muted) continue

            const opacity = clip.opacity ?? 1
            const filterCss = getFilterCss(clip.filter)
            const trans = getTransStyle(clip, t)
            const transOpacity = trans.opacity ?? 1
            if (transOpacity === 0) continue

            ctx.save()
            ctx.globalAlpha = opacity * transOpacity
            if (filterCss !== 'none') ctx.filter = filterCss

            if (trans.transform) {
              const matchX = trans.transform.match(/translateX\(([^)]+)\)/)
              if (matchX) ctx.translate(parseFloat(matchX[1]) / 100 * outW, 0)
              const matchY = trans.transform.match(/translateY\(([^)]+)\)/)
              if (matchY) ctx.translate(0, parseFloat(matchY[1]) / 100 * outH)
            }

            if (clip.type === 'video' || clip.type === 'image') {
              const source = mediaCache[clip.id]
              if (source) drawMediaCover(ctx, source, outW, outH)
            } else if (clip.type === 'text' || clip.type === 'shape' || clip.type === 'sticker') {
              drawOverlay(ctx, clip, outW, outH)
            }

            ctx.restore()
          }

          requestAnimationFrame(draw)
        }
        requestAnimationFrame(draw)
      })

      timers.forEach(clearTimeout)
      for (const track of activeTracks) {
        for (const clip of track.clips) {
          const el = mediaCache[clip.id]
          if (el && el.pause) el.pause()
        }
      }
      recorder.stop()
      await new Promise(resolve => recorder.onstop = resolve)
      if (audioContext) await audioContext.close()
      audioContext = null

      if (abort.current) throw new Error('__canceled__')

      const blob = new Blob(chunks, { type: recorder.mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${projectName || 'video'}.${format === 'mp4' ? 'mp4' : 'webm'}`
      a.click()
      URL.revokeObjectURL(url)

      setStatus('done')
      setMsg('Export completed!')
    } catch (err) {
      timers.forEach(clearTimeout)
      if (audioContext) { try { await audioContext.close() } catch {} }
      if (err?.message === '__canceled__') {
        setStatus('idle')
        setMsg('Export canceled')
      } else {
        console.error('Export failed:', err)
        setStatus('idle')
        setMsg(`Export failed: ${err?.message || 'unknown error'}`)
      }
    } finally {
      for (const key in mediaCache) {
        const el = mediaCache[key]
        if (el.pause) el.pause()
        if (el.src) el.src = ''
      }
    }
  }

  // ----- UI -----
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Increased width to 480, and added responsive max-width */}
      <div style={{ background: videoTheme.card, border: `1px solid ${videoTheme.border}`, borderRadius: 12, padding: 22, width: 480, maxWidth: '95vw', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div><div style={{ fontWeight: 600, fontSize: 14, color: videoTheme.text }}>Export</div><div style={{ fontSize: 10, color: videoTheme.textMuted, marginTop: 1 }}>"{projectName}"</div></div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: videoTheme.textMuted, cursor: 'pointer' }}><X size={15} /></button>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: videoTheme.textMuted, fontWeight: 600, letterSpacing: 0.8, marginBottom: 7 }}>FORMAT</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            {[{ id: 'mp4', l: 'MP4' }, { id: 'webm', l: 'WebM' }].map(f => (
              <div key={f.id} onClick={() => setFormat(f.id)} style={{
                padding: '8px 6px', borderRadius: 7, cursor: 'pointer',
                border: `1.5px solid ${format === f.id ? videoTheme.borderLight : videoTheme.border}`,
                background: format === f.id ? videoTheme.hov : videoTheme.el,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: format === f.id ? videoTheme.text : videoTheme.textMuted }}>{f.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: videoTheme.textMuted, fontWeight: 600, letterSpacing: 0.8, marginBottom: 7 }}>RESOLUTION</div>
          {/* Responsive single row: flex with nowrap, each item flex:1 and min-width:0 to shrink */}
          <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 4, overflow: 'hidden' }}>
            {RES.map((r, i) => (
              <div key={r.label} onClick={() => setResIdx(i)} style={{
                flex: '1 1 0', minWidth: 0, // allow shrinking
                padding: '6px 2px', borderRadius: 7, cursor: 'pointer',
                border: `1.5px solid ${resIdx === i ? videoTheme.borderLight : videoTheme.border}`,
                background: resIdx === i ? videoTheme.hov : videoTheme.el,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: resIdx === i ? videoTheme.text : videoTheme.textMuted }}>{r.label}</div>
                <div style={{ fontSize: 8, color: videoTheme.textMuted, fontFamily: 'monospace' }}>{r.w}×{r.h}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: videoTheme.el, borderRadius: 7, padding: '8px 10px', marginBottom: 14 }}>
          {[['Duration', `${exportDuration.toFixed(1)}s`], ['FPS', fps], ['Clips', clips.length], ['Output', `${res.w}×${res.h}`]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: videoTheme.textMuted }}>{k}</span>
              <span style={{ fontSize: 10, color: videoTheme.textSecondary, fontFamily: 'monospace' }}>{v}</span>
            </div>
          ))}
        </div>
        {status === 'loading' && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: videoTheme.textSecondary }}>{msg}</span>
              <span style={{ fontSize: 11, color: videoTheme.textMuted, fontFamily: 'monospace' }}>{Math.floor(progress)}%</span>
            </div>
            <div style={{ height: 3, background: videoTheme.border, borderRadius: 99 }}>
              <div style={{ width: `${progress}%`, height: '100%', background: videoTheme.text, borderRadius: 99, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        )}
        {msg && status !== 'loading' && (
          <div style={{ marginBottom: 12, padding: '7px 10px', borderRadius: 7, background: status === 'done' ? '#0d1f0d' : '#1f0d0d', border: `1px solid ${status === 'done' ? '#1a3a1a' : '#3a1a1a'}`, fontSize: 11, color: status === 'done' ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: 7 }}>
            {status === 'done' ? <Check size={12} /> : <AlertCircle size={12} />} {msg}
          </div>
        )}
        <div style={{ display: 'flex', gap: 7 }}>
          {status === 'loading' && (
            <button onClick={() => { abort.current = true; setStatus('idle'); setMsg(''); }} style={{ flex: 1, padding: '9px', borderRadius: 7, border: `1px solid ${videoTheme.border}`, background: videoTheme.el, color: videoTheme.textMuted, cursor: 'pointer', fontSize: 11 }}>Cancel</button>
          )}
          <button
            onClick={status === 'loading' ? undefined : doExport}
            disabled={status === 'loading'}
            style={{
              flex: 2, padding: '9px', borderRadius: 7, border: 'none',
              background: status === 'done' ? '#1a3a1a' : status === 'loading' ? videoTheme.border : videoTheme.text,
              color: status === 'done' ? '#4ade80' : status === 'loading' ? videoTheme.textMuted : videoTheme.base,
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}
          >
            {status === 'loading' ? <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> Exporting…</> : status === 'done' ? <><Check size={12} /> Done!</> : <><Download size={12} /> Export {format.toUpperCase()}</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ---------- PresetModal ----------
function PresetModal({ onClose }) {
  const { setSize, width, height } = useStore()
  const [cw, setCw] = useState(width)
  const [ch, setCh] = useState(height)
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: videoTheme.card, border: `1px solid ${videoTheme.border}`, borderRadius: 12, padding: 20, width: 320 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: videoTheme.text }}>Canvas Size</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: videoTheme.textMuted, cursor: 'pointer' }}><X size={14} /></button>
        </div>
        <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 14 }}>
          {CANVAS_PRESETS.map(p => (
            <div key={p.id} onClick={() => { setSize(p.w, p.h); onClose(); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 7, cursor: 'pointer', marginBottom: 2 }}
              onMouseEnter={e => e.currentTarget.style.background = videoTheme.hov} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: 13, color: videoTheme.textSecondary }}>{p.label}</span>
              <span style={{ fontSize: 10, color: videoTheme.textMuted, fontFamily: 'monospace' }}>{p.w}×{p.h}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${videoTheme.border}`, paddingTop: 12 }}>
          <div style={{ fontSize: 9, color: videoTheme.textMuted, fontWeight: 600, marginBottom: 7 }}>CUSTOM SIZE</div>
          <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 9 }}>
            <input type="number" value={cw} onChange={e => setCw(+e.target.value)} style={{ flex: 1, background: videoTheme.el, border: `1px solid ${videoTheme.border}`, borderRadius: 5, padding: '4px 8px', fontSize: 11, color: videoTheme.text, outline: 'none', textAlign: 'center' }} />
            <span style={{ color: videoTheme.textMuted }}>×</span>
            <input type="number" value={ch} onChange={e => setCh(+e.target.value)} style={{ flex: 1, background: videoTheme.el, border: `1px solid ${videoTheme.border}`, borderRadius: 5, padding: '4px 8px', fontSize: 11, color: videoTheme.text, outline: 'none', textAlign: 'center' }} />
          </div>
          <button onClick={() => { setSize(cw, ch); onClose(); }} style={{ width: '100%', padding: '8px', borderRadius: 7, border: 'none', background: videoTheme.text, color: videoTheme.base, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Apply</button>
        </div>
      </div>
    </div>
  )
}

// ---------- TopBar Main ----------
const TopBar = () => {
  const navigate = useNavigate()
  const { projectName, setProjectName, width, height, getSelectedClip, tracks, splitClip, currentTime } = useStore()
  const [editName, setEditName] = useState(false)
  const [name, setName] = useState(projectName)
  const [showExport, setShowExport] = useState(false)
  const [showPreset, setShowPreset] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const clip = getSelectedClip()
  const track = clip ? tracks.find(t => t.clips.some(c => c.id === clip.id)) : null

  const reorder = dir => {
    if (!clip || !track) return
    const clips = [...track.clips]
    const idx = clips.findIndex(c => c.id === clip.id)
    const swapIdx = dir === 'fwd' ? idx + 1 : idx - 1
    if (swapIdx < 0 || swapIdx >= clips.length) return
    ;[clips[idx], clips[swapIdx]] = [clips[swapIdx], clips[idx]]
    useStore.setState(s => ({ tracks: s.tracks.map(t => t.id === track.id ? { ...t, clips } : t) }))
  }

  const IconButton = ({ content, onClick, title, disabled }) => (
    <button onClick={onClick} title={title} disabled={disabled}
      style={{
        width: 28, height: 28, borderRadius: 6, border: 'none',
        background: 'transparent', color: disabled ? videoTheme.border : videoTheme.textMuted,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.1s',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.color = videoTheme.text }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.color = videoTheme.textMuted }}
    >
      {content}
    </button>
  )

  return (
    <>
      <div style={{ height: 48, background: videoTheme.side, borderBottom: `1px solid ${videoTheme.border}`, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 4, flexShrink: 0, zIndex: 100 }}>
        <button onClick={() => navigate('/creator/dashboard')} title="Back to Dashboard"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: 'none', color: videoTheme.textMuted,
            cursor: 'pointer', padding: '4px 8px', borderRadius: 6, fontSize: 12, marginRight: 8,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = videoTheme.hov; e.currentTarget.style.color = videoTheme.text }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = videoTheme.textMuted }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 8 }}>
          <img src={logoUrl} alt="Logo" style={{ width: 22, height: 22, borderRadius: 6, objectFit: 'contain' }} />
          {editName ? (
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={() => { setProjectName(name); setEditName(false) }}
              onKeyDown={e => e.key === 'Enter' && setEditName(false)}
              style={{
                background: videoTheme.el,
                border: `1px solid ${videoTheme.border}`,
                borderRadius: 5,
                color: videoTheme.text,
                padding: '3px 8px',
                fontSize: 13,
                fontWeight: 500,
                outline: 'none',
                width: 160,
              }}
            />
          ) : (
            <button onDoubleClick={() => setEditName(true)}
              style={{ background: 'none', border: 'none', color: videoTheme.text, fontSize: 13, fontWeight: 500, cursor: 'text', padding: 0 }}>
              {name}
            </button>
          )}
        </div>

        <div style={{ width: 1, height: 18, background: videoTheme.border, margin: '0 4px' }} />
        <IconButton content={<Undo2 size={14} />} onClick={() => {}} title="Undo (Ctrl+Z)" />
        <IconButton content={<Redo2 size={14} />} onClick={() => {}} title="Redo (Ctrl+Shift+Z)" />
        <div style={{ width: 1, height: 18, background: videoTheme.border, margin: '0 4px' }} />

        <IconButton content="⤒" onClick={() => {
          if (!clip || !track) return
          const clips = [...track.clips]
          const idx = clips.findIndex(c => c.id === clip.id)
          clips.push(clips.splice(idx, 1)[0])
          useStore.setState(s => ({ tracks: s.tracks.map(t => t.id === track.id ? { ...t, clips } : t) }))
        }} title="Bring to Front" disabled={!clip} />
        <IconButton content={<ChevronUp size={13} />} onClick={() => reorder('fwd')} title="Bring Forward" disabled={!clip} />
        <IconButton content={<ChevronDown size={13} />} onClick={() => reorder('back')} title="Send Backward" disabled={!clip} />
        <IconButton content="⤓" onClick={() => {
          if (!clip || !track) return
          const clips = [...track.clips]
          const idx = clips.findIndex(c => c.id === clip.id)
          clips.unshift(clips.splice(idx, 1)[0])
          useStore.setState(s => ({ tracks: s.tracks.map(t => t.id === track.id ? { ...t, clips } : t) }))
        }} title="Send to Back" disabled={!clip} />
        <div style={{ width: 1, height: 18, background: videoTheme.border, margin: '0 4px' }} />
        <IconButton content={<Scissors size={14} />} onClick={() => clip && splitClip(clip.id, currentTime)} title="Split at playhead" disabled={!clip} />

        <button onClick={() => setShowPreset(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 6,
            border: `1px solid ${videoTheme.border}`,
            background: videoTheme.el,
            color: videoTheme.textMuted,
            cursor: 'pointer', fontSize: 11, marginLeft: 4,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = videoTheme.text; e.currentTarget.style.borderColor = videoTheme.borderLight }}
          onMouseLeave={e => { e.currentTarget.style.color = videoTheme.textMuted; e.currentTarget.style.borderColor = videoTheme.border }}
        >
          ⊞ {width}×{height} ▾
        </button>

        <div style={{ flex: 1 }} />

        <button onClick={() => setShowExport(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 6,
            border: `1px solid ${videoTheme.border}`,
            background: videoTheme.el,
            color: videoTheme.textSecondary,
            cursor: 'pointer', fontSize: 12, fontWeight: 500,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = videoTheme.hov; e.currentTarget.style.color = videoTheme.text }}
          onMouseLeave={e => { e.currentTarget.style.background = videoTheme.el; e.currentTarget.style.color = videoTheme.textSecondary }}
        >
          <Download size={13} /> Export
        </button>

        <button
          onClick={() => setShowShare(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 6,
            border: 'none',
            background: '#3b82f6',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            marginLeft: 6,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#2563eb' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#3b82f6' }}
        >
          <Share2 size={13} /> Share
        </button>
      </div>

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {showPreset && <PresetModal onClose={() => setShowPreset(false)} />}
      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </>
  )
}

export default TopBar