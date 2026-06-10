import React, { useState } from 'react'
import { Film, Download, Share2, Scissors, ChevronUp, ChevronDown, X, Check, Loader, AlertCircle, Undo2, Redo2, ArrowLeft, Copy, Youtube, Instagram, Twitter, Facebook } from 'lucide-react'
import { useStore } from '../store/store'
import { CANVAS_PRESETS, EFFECTS, transitionCSS } from '../utils/constants'
import logoUrl from '../../../../assets/logo.svg'
import { useNavigate } from 'react-router-dom'

// Helper functions for export
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)) }

function getTransitionOpacity(clip, t) {
  let opacity = clip.opacity ?? 1
  const rel = t - clip.start
  const rem = clip.duration - rel
  if (clip.transIn && clip.transInDur > 0 && rel < clip.transInDur) {
    const p = clamp(rel / clip.transInDur, 0, 1)
    const style = transitionCSS(clip.transIn, p, 'in')
    if (typeof style.opacity === 'number') opacity *= style.opacity
  }
  if (clip.transOut && clip.transOutDur > 0 && rem < clip.transOutDur) {
    const p = clamp(1 - rem / clip.transOutDur, 0, 1)
    const style = transitionCSS(clip.transOut, p, 'in')
    if (typeof style.opacity === 'number') opacity *= style.opacity
  }
  return clamp(opacity, 0, 1)
}

const SHAPE_PATHS = {
  rect: 'M10,10 L90,10 L90,90 L10,90 Z',
  circle: 'M50,5 A45,45 0 1,1 49.99,5 Z',
  triangle: 'M50,5 L95,95 L5,95 Z',
  diamond: 'M50,2 L98,50 L50,98 L2,50 Z',
  star: 'M50,5 L61,35 L95,35 L68,57 L79,91 L50,70 L21,91 L32,57 L5,35 L39,35 Z',
  heart: 'M50,75 C25,55 5,42 5,28 C5,15 15,5 28,5 C36,5 43,9 50,17 C57,9 64,5 72,5 C85,5 95,15 95,28 C95,42 75,55 50,75Z',
  pentagon: 'M50,5 L93,35 L77,92 L23,92 L7,35 Z',
  hexagon: 'M25,8 L75,8 L97,50 L75,92 L25,92 L3,50 Z',
  octagon: 'M30,3 L70,3 L97,30 L97,70 L70,97 L30,97 L3,70 L3,30 Z',
  'arrow-r': 'M10,30 L58,30 L58,15 L92,50 L58,85 L58,70 L10,70 Z',
  'arrow-l': 'M90,30 L42,30 L42,15 L8,50 L42,85 L42,70 L90,70 Z',
  cloud: 'M30,77 L75,77 C88,77 95,68 95,57 C95,47 88,39 78,38 C76,24 65,15 51,15 C37,15 25,24 22,37 C12,38 5,46 5,56 C5,69 15,77 30,77 Z',
  speech: 'M14,15 L86,15 C92,15 96,19 96,25 L96,63 C96,69 92,73 86,73 L44,73 L25,92 L27,73 L14,73 C8,73 4,69 4,63 L4,25 C4,19 8,15 14,15 Z',
  bolt: 'M58,2 L20,55 L42,55 L32,98 L80,40 L58,40 Z',
}

function drawOverlay(ctx, clip, stageW, stageH, scale) {
  const x = ((clip.overlayX ?? 50) / 100) * stageW
  const y = ((clip.overlayY ?? 50) / 100) * stageH
  const w = Math.max(1, ((clip.overlayW ?? 40) / 100) * stageW)
  const h = Math.max(1, ((clip.overlayH ?? 20) / 100) * stageH)

  if (clip.type === 'text') {
    const fontSize = Math.max(8, (clip.fontSize || 72) * scale)
    ctx.font = `${clip.fontWeight || '700'} ${fontSize}px ${clip.fontFamily || 'sans-serif'}`
    ctx.fillStyle = clip.textColor || '#ffffff'
    ctx.textAlign = clip.textAlign || 'center'
    ctx.textBaseline = 'middle'
    const text = String(clip.text || 'Text')
    const lines = text.split(/\r?\n/).slice(0, 10)
    const lineH = fontSize * 1.2
    const totalH = lines.length * lineH
    const textX = clip.textAlign === 'left' ? x - w / 2 : clip.textAlign === 'right' ? x + w / 2 : x
    let textY = y - totalH / 2 + lineH / 2
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 8
    for (const line of lines) {
      ctx.fillText(line, textX, textY, w)
      textY += lineH
    }
    ctx.shadowBlur = 0
    return
  }
  if (clip.type === 'shape') {
    // Keep shape aspect ratio square
    const size = Math.min(w, h)
    const offsetX = (w - size) / 2
    const offsetY = (h - size) / 2
    ctx.save()
    ctx.translate(x - w / 2 + offsetX, y - h / 2 + offsetY)
    ctx.scale(size / 100, size / 100)
    const path = new Path2D(SHAPE_PATHS[clip.shapePath || 'rect'] || SHAPE_PATHS.rect)
    ctx.fillStyle = clip.shapeColor || '#3b82f6'
    ctx.fill(path)
    ctx.restore()
    return
  }
  if (clip.type === 'sticker') {
    const size = Math.max(10, Math.min(w, h) * 0.8)
    ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(clip.sticker || '⭐', x, y)
  }
}

function drawMediaCover(ctx, media, outW, outH) {
  const srcW = media.videoWidth || media.naturalWidth || media.width || outW
  const srcH = media.videoHeight || media.naturalHeight || media.height || outH
  if (!srcW || !srcH) return
  const srcAspect = srcW / srcH
  const outAspect = outW / outH
  let sx = 0, sy = 0, sw = srcW, sh = srcH
  if (srcAspect > outAspect) {
    sw = srcH * outAspect
    sx = (srcW - sw) / 2
  } else {
    sh = srcW / outAspect
    sy = (srcH - sh) / 2
  }
  ctx.drawImage(media, sx, sy, sw, sh, 0, 0, outW, outH)
}

// ------------------------------------------------------------
// Share Modal Component
// ------------------------------------------------------------
function ShareModal({ onClose }) {
  const { projectName } = useStore()
  const [copied, setCopied] = useState(false)

  // Generate a shareable link (in a real app, this would be a backend URL)
  const shareableLink = `${window.location.origin}/project/${projectName.replace(/\s/g, '-').toLowerCase()}`

  const socialLinks = [
    { name: 'YouTube', icon: Youtube, color: '#FF0000', url: `https://www.youtube.com/share?url=${encodeURIComponent(shareableLink)}` },
    { name: 'TikTok', icon: () => <span style={{ fontSize: 18 }}>🎵</span>, color: '#000000', url: `https://www.tiktok.com/share/video?url=${encodeURIComponent(shareableLink)}` },
    { name: 'Instagram', icon: Instagram, color: '#E4405F', url: `https://www.instagram.com/create/story/?url=${encodeURIComponent(shareableLink)}` },
    { name: 'Twitter', icon: Twitter, color: '#1DA1F2', url: `https://twitter.com/intent/tweet?text=Check%20out%20my%20video%20project%20"${encodeURIComponent(projectName)}"&url=${encodeURIComponent(shareableLink)}` },
    { name: 'Facebook', icon: Facebook, color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}` },
  ]

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 22, width: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#e0e0e0' }}>Share Project</div>
            <div style={{ fontSize: 10, color: '#777', marginTop: 1 }}>"{projectName}"</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
            <X size={15} />
          </button>
        </div>

        {/* Social Media Icons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
          {socialLinks.map(social => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '8px 0', borderRadius: 8, background: '#0d0d0d', border: '1px solid #1a1a1a',
                textDecoration: 'none', transition: 'all 0.1s', cursor: 'pointer'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#3a3a3a' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0d0d0d'; e.currentTarget.style.borderColor = '#1a1a1a' }}
            >
              <social.icon size={20} color={social.color} />
              <span style={{ fontSize: 10, color: '#aaa' }}>{social.name}</span>
            </a>
          ))}
        </div>

        {/* Shareable Link */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: '#888', fontWeight: 600, letterSpacing: 0.8, marginBottom: 7 }}>SHAREABLE LINK</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              readOnly
              value={shareableLink}
              style={{
                flex: 1, background: '#161616', border: '1px solid #2a2a2a', borderRadius: 6,
                padding: '6px 10px', fontSize: 11, color: '#aaa', outline: 'none', fontFamily: 'monospace'
              }}
            />
            <button
              onClick={handleCopyLink}
              style={{
                padding: '0 12px', borderRadius: 6, border: '1px solid #2a2a2a', background: '#1a1a1a',
                color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 500
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#252525'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#ccc' }}
            >
              <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Info Text */}
        <div style={{ fontSize: 9, color: '#444', textAlign: 'center', borderTop: '1px solid #1a1a1a', paddingTop: 12 }}>
          Share this link or use the social buttons to promote your video.
        </div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// Export Modal Component
// ------------------------------------------------------------
function ExportModal({ onClose }) {
  const { tracks, duration, width, height, fps, projectName, volume } = useStore()
  const [format, setFormat] = useState('mp4')
  const [resIdx, setResIdx] = useState(0)
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [msg, setMsg] = useState('')
  const abort = React.useRef(false)

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
  const exportDuration = Math.max(0, ...clips.map(c => c.start + c.duration), duration)

  const doExport = async () => {
    if (clips.length === 0) { setMsg('Add clips first.'); return }
    abort.current = false
    setStatus('loading')
    setProgress(0)
    setMsg('Preparing...')

    let audioCtx = null
    let canvasStream = null
    let mixedStream = null
    let recorder = null
    const mediaMap = new Map()
    const imageMap = new Map()
    const audioGains = new Map()

    try {
      const canvas = document.createElement('canvas')
      canvas.width = res.w
      canvas.height = res.h
      const ctx = canvas.getContext('2d')

      audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      await audioCtx.resume()
      const dest = audioCtx.createMediaStreamDestination()

      const mediaClips = clips.filter(c => (c.type === 'video' || c.type === 'audio') && c.src)
      const imageClips = clips.filter(c => c.type === 'image' && c.src)
      const total = mediaClips.length + imageClips.length
      let loaded = 0

      for (const clip of mediaClips) {
        if (abort.current) throw new Error('Cancelled')
        setMsg(`Loading ${clip.name} (${loaded+1}/${total})`)
        const el = document.createElement(clip.type === 'video' ? 'video' : 'audio')
        el.crossOrigin = 'anonymous'
        el.preload = 'auto'
        el.src = clip.src
        await new Promise((resolve, reject) => {
          el.onloadedmetadata = resolve
          el.onerror = reject
          setTimeout(resolve, 5000)
        })
        el.pause()
        const gain = audioCtx.createGain()
        gain.gain.value = 0
        const source = audioCtx.createMediaElementSource(el)
        source.connect(gain)
        gain.connect(dest)
        mediaMap.set(clip.id, { el, gain })
        audioGains.set(clip.id, gain)
        loaded++
        setProgress((loaded / total) * 30)
      }

      for (const clip of imageClips) {
        if (abort.current) throw new Error('Cancelled')
        setMsg(`Loading image (${loaded+1}/${total})`)
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = clip.src
        })
        imageMap.set(clip.src, img)
        loaded++
        setProgress((loaded / total) * 30)
      }

      setProgress(30)
      setMsg('Recording...')

      canvasStream = canvas.captureStream(fps)
      mixedStream = new MediaStream()
      canvasStream.getVideoTracks().forEach(t => mixedStream.addTrack(t))
      dest.stream.getAudioTracks().forEach(t => mixedStream.addTrack(t))

      const mimeType = format === 'mp4' ? 'video/mp4' : 'video/webm'
      if (!MediaRecorder.isTypeSupported(mimeType)) throw new Error(`${format.toUpperCase()} not supported in this browser.`)
      recorder = new MediaRecorder(mixedStream, { mimeType, videoBitsPerSecond: 12000000 })
      const chunks = []
      recorder.ondataavailable = e => chunks.push(e.data)
      recorder.start(100)

      const totalFrames = Math.ceil(exportDuration * fps)
      for (let frame = 0; frame < totalFrames; frame++) {
        if (abort.current) throw new Error('Export cancelled')
        const t = frame / fps
        ctx.clearRect(0, 0, res.w, res.h)
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, res.w, res.h)

        const activeClips = activeTracks.flatMap(tr =>
          tr.clips.filter(c => t >= c.start && t < c.start + c.duration)
        )
        for (const clip of activeClips) {
          const opacity = getTransitionOpacity(clip, t)
          if (opacity <= 0) continue
          ctx.save()
          ctx.globalAlpha = opacity
          ctx.filter = EFFECTS.find(e => e.id === clip.filter)?.css || 'none'

          if ((clip.type === 'video' || clip.type === 'image') && clip.src) {
            const media = clip.type === 'video' ? mediaMap.get(clip.id) : imageMap.get(clip.src)
            if (media) {
              if (clip.type === 'video' && media.el) {
                const rel = t - clip.start + (clip.offset || 0)
                const target = Math.min(Math.max(0, rel), media.el.duration - 0.01)
                if (Math.abs(media.el.currentTime - target) > 0.1) media.el.currentTime = target
                drawMediaCover(ctx, media.el, res.w, res.h)
              } else if (clip.type === 'image') {
                drawMediaCover(ctx, media, res.w, res.h)
              }
            }
          } else if (clip.type === 'text' || clip.type === 'shape' || clip.type === 'sticker') {
            drawOverlay(ctx, clip, res.w, res.h, res.w / width)
          }
          ctx.restore()
        }

        // Update audio gains
        for (const [id, gain] of audioGains) {
          const clip = clips.find(c => c.id === id)
          if (clip) {
            const active = t >= clip.start && t < clip.start + clip.duration
            gain.gain.value = active ? (clip.muted ? 0 : (clip.volume ?? 1) * volume) : 0
          }
        }

        setProgress(30 + (frame / totalFrames) * 65)
        setMsg(`Rendering frame ${frame+1}/${totalFrames}`)
        await new Promise(r => setTimeout(r, 1000 / fps))
      }

      recorder.stop()
      await new Promise(r => recorder.onstop = r)
      const blob = new Blob(chunks, { type: mimeType })
      if (blob.size === 0) throw new Error('Empty recording')

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${projectName || 'export'}.${format}`
      a.click()
      URL.revokeObjectURL(url)

      setProgress(100)
      setStatus('done')
      setMsg('Export completed!')
    } catch (err) {
      setStatus('error')
      setMsg(err.message)
    } finally {
      if (recorder && recorder.state !== 'inactive') recorder.stop()
      if (canvasStream) canvasStream.getTracks().forEach(t => t.stop())
      if (mixedStream) mixedStream.getTracks().forEach(t => t.stop())
      if (audioCtx) await audioCtx.close()
      mediaMap.forEach(({ el }) => el.pause())
    }
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 22, width: 360, boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div><div style={{ fontWeight: 600, fontSize: 14, color: '#e0e0e0' }}>Export</div><div style={{ fontSize: 10, color: '#777', marginTop: 1 }}>"{projectName}"</div></div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={15} /></button>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: '#888', fontWeight: 600, letterSpacing: 0.8, marginBottom: 7 }}>FORMAT</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            {[{ id: 'mp4', l: 'MP4' }, { id: 'webm', l: 'WebM' }].map(f => (
              <div key={f.id} onClick={() => setFormat(f.id)} style={{ padding: '8px 6px', borderRadius: 7, cursor: 'pointer', border: `1.5px solid ${format === f.id ? '#888' : '#2a2a2a'}`, background: format === f.id ? '#1e1e1e' : '#141414', textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: format === f.id ? '#fff' : '#999' }}>{f.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: '#888', fontWeight: 600, letterSpacing: 0.8, marginBottom: 7 }}>RESOLUTION</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4 }}>
            {RES.map((r, i) => (
              <div key={r.label} onClick={() => setResIdx(i)} style={{ padding: '6px 4px', borderRadius: 7, cursor: 'pointer', border: `1.5px solid ${resIdx === i ? '#888' : '#2a2a2a'}`, background: resIdx === i ? '#1e1e1e' : '#141414', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: resIdx === i ? '#fff' : '#999' }}>{r.label}</div>
                <div style={{ fontSize: 8, color: '#666', fontFamily: 'monospace', marginTop: 1 }}>{r.w}×{r.h}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: '#0d0d0d', borderRadius: 7, padding: '8px 10px', marginBottom: 14 }}>
          {[['Duration', `${exportDuration.toFixed(1)}s`], ['FPS', fps], ['Clips', clips.length], ['Output', `${res.w}×${res.h}`]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: '#777' }}>{k}</span>
              <span style={{ fontSize: 10, color: '#aaa', fontFamily: 'monospace' }}>{v}</span>
            </div>
          ))}
        </div>
        {status === 'loading' && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: '#aaa' }}>{msg}</span>
              <span style={{ fontSize: 11, color: '#888', fontFamily: 'monospace' }}>{Math.floor(progress)}%</span>
            </div>
            <div style={{ height: 3, background: '#1a1a1a', borderRadius: 99 }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#fff', borderRadius: 99, transition: 'width 0.5s ease' }} />
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
            <button onClick={() => { abort.current = true; setStatus('idle'); setMsg(''); }} style={{ flex: 1, padding: '9px', borderRadius: 7, border: '1px solid #2a2a2a', background: '#161616', color: '#aaa', cursor: 'pointer', fontSize: 11 }}>Cancel</button>
          )}
          <button onClick={status === 'loading' ? undefined : doExport} disabled={status === 'loading'}
            style={{ flex: 2, padding: '9px', borderRadius: 7, border: 'none', background: status === 'done' ? '#1a3a1a' : status === 'loading' ? '#1a1a1a' : '#fff', color: status === 'done' ? '#4ade80' : status === 'loading' ? '#777' : '#111', cursor: status === 'loading' ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            {status === 'loading' ? <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> Exporting…</> : status === 'done' ? <><Check size={12} /> Done!</> : <><Download size={12} /> Export {format.toUpperCase()}</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ------------------------------------------------------------
// Preset Modal
// ------------------------------------------------------------
function PresetModal({ onClose }) {
  const { setSize, width, height } = useStore()
  const [cw, setCw] = useState(width)
  const [ch, setCh] = useState(height)
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20, width: 320 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#e0e0e0' }}>Canvas Size</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={14} /></button>
        </div>
        <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 14 }}>
          {CANVAS_PRESETS.map(p => (
            <div key={p.id} onClick={() => { setSize(p.w, p.h); onClose(); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 7, cursor: 'pointer', marginBottom: 2 }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: 13, color: '#ccc' }}>{p.label}</span>
              <span style={{ fontSize: 10, color: '#888', fontFamily: 'monospace' }}>{p.w}×{p.h}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 12 }}>
          <div style={{ fontSize: 9, color: '#888', fontWeight: 600, marginBottom: 7 }}>CUSTOM SIZE</div>
          <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 9 }}>
            <input type="number" value={cw} onChange={e => setCw(+e.target.value)} style={{ flex: 1, background: '#161616', border: '1px solid #2a2a2a', borderRadius: 5, padding: '4px 8px', fontSize: 11, color: '#e0e0e0', outline: 'none', textAlign: 'center' }} />
            <span style={{ color: '#666' }}>×</span>
            <input type="number" value={ch} onChange={e => setCh(+e.target.value)} style={{ flex: 1, background: '#161616', border: '1px solid #2a2a2a', borderRadius: 5, padding: '4px 8px', fontSize: 11, color: '#e0e0e0', outline: 'none', textAlign: 'center' }} />
          </div>
          <button onClick={() => { setSize(cw, ch); onClose(); }} style={{ width: '100%', padding: '8px', borderRadius: 7, border: 'none', background: '#fff', color: '#111', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Apply</button>
        </div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// TopBar Main Component
// ------------------------------------------------------------
const TopBar = () => {
  const navigate = useNavigate()
  const { projectName, setProjectName, width, height, getSelectedClip, tracks, splitClip, currentTime } = useStore()
  const [editName, setEditName] = useState(false)
  const [name, setName] = useState(projectName)
  const [showExport, setShowExport] = useState(false)
  const [showPreset, setShowPreset] = useState(false)
  const [showShare, setShowShare] = useState(false)   // <-- Share modal state

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
      style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: disabled ? '#2a2a2a' : '#aaa', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s' }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.color = '#e0e0e0' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.color = '#aaa' }}>
      {content}
    </button>
  )

  return (
    <>
      <div style={{ height: 48, background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 4, flexShrink: 0, zIndex: 100 }}>
        <button onClick={() => navigate('/creator/dashboard')} title="Back to Dashboard"
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, fontSize: 12, marginRight: 8 }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#aaa' }}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 8 }}>
          <img src={logoUrl} alt="Logo" style={{ width: 22, height: 22, borderRadius: 6, objectFit: 'contain' }} />
          {editName ? (
            <input autoFocus value={name} onChange={e => setName(e.target.value)}
              onBlur={() => { setProjectName(name); setEditName(false) }}
              onKeyDown={e => e.key === 'Enter' && setEditName(false)}
              style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 5, color: '#fff', padding: '3px 8px', fontSize: 13, fontWeight: 500, outline: 'none', width: 160 }} />
          ) : (
            <button onDoubleClick={() => setEditName(true)}
              style={{ background: 'none', border: 'none', color: '#e0e0e0', fontSize: 13, fontWeight: 500, cursor: 'text', padding: 0 }}>
              {name}
            </button>
          )}
        </div>

        <div style={{ width: 1, height: 18, background: '#2a2a2a', margin: '0 4px' }} />
        <IconButton content={<Undo2 size={14} />} onClick={() => {}} title="Undo (Ctrl+Z)" />
        <IconButton content={<Redo2 size={14} />} onClick={() => {}} title="Redo (Ctrl+Shift+Z)" />
        <div style={{ width: 1, height: 18, background: '#2a2a2a', margin: '0 4px' }} />

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
        <div style={{ width: 1, height: 18, background: '#2a2a2a', margin: '0 4px' }} />
        <IconButton content={<Scissors size={14} />} onClick={() => clip && splitClip(clip.id, currentTime)} title="Split at playhead" disabled={!clip} />

        <button onClick={() => setShowPreset(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, border: '1px solid #2a2a2a', background: '#141414', color: '#aaa', cursor: 'pointer', fontSize: 11, marginLeft: 4 }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#3a3a3a' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = '#2a2a2a' }}>
          ⊞ {width}×{height} ▾
        </button>

        <div style={{ flex: 1 }} />

        <button onClick={() => setShowExport(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 6, border: '1px solid #2a2a2a', background: '#161616', color: '#bbb', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
          onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#161616'; e.currentTarget.style.color = '#bbb' }}>
          <Download size={13} /> Export
        </button>

        <button onClick={() => setShowShare(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 6, border: 'none', background: '#fff', color: '#111', cursor: 'pointer', fontSize: 12, fontWeight: 600, marginLeft: 6 }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e0e0e0' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}>
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