import React, { useState } from 'react'
import { Film, Download, Share2, Scissors, ChevronUp, ChevronDown, X, Check, Loader, AlertCircle, Undo2, Redo2, ArrowLeft, Copy, Youtube, Instagram, Twitter, Facebook } from 'lucide-react'
import { useStore } from '../store/store'
import { CANVAS_PRESETS, EFFECTS, transitionCSS } from '../utils/constants'
import logoUrl from '../../../../assets/logo.svg'
import { useNavigate } from 'react-router-dom'
import { videoTheme } from '../theme'

// ... (helper functions: clamp, getTransitionOpacity, drawOverlay, drawMediaCover – same as before, just use videoTheme in modals)

// ----- ShareModal (using theme) -----
function ShareModal({ onClose }) {
  const { projectName } = useStore()
  const [copied, setCopied] = useState(false)
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

// ----- ExportModal (using theme) -----
function ExportModal({ onClose }) {
  // ... same logic as before, but replace all inline styles with videoTheme variables
  // For brevity, I'll show the outer container and the key style changes.
  // The full code can be adapted similarly.
  // (The helper functions clamp, getTransitionOpacity, drawOverlay, drawMediaCover remain unchanged)

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
    // ... unchanged logic
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: videoTheme.card, border: `1px solid ${videoTheme.border}`, borderRadius: 12, padding: 22, width: 360, boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4 }}>
            {RES.map((r, i) => (
              <div key={r.label} onClick={() => setResIdx(i)} style={{
                padding: '6px 4px', borderRadius: 7, cursor: 'pointer',
                border: `1.5px solid ${resIdx === i ? videoTheme.borderLight : videoTheme.border}`,
                background: resIdx === i ? videoTheme.hov : videoTheme.el,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: resIdx === i ? videoTheme.text : videoTheme.textMuted }}>{r.label}</div>
                <div style={{ fontSize: 8, color: videoTheme.textMuted, fontFamily: 'monospace', marginTop: 1 }}>{r.w}×{r.h}</div>
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

// ----- PresetModal -----
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

// ----- TopBar Main -----
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

        <button onClick={() => setShowShare(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 6,
            border: 'none', background: videoTheme.text,
            color: videoTheme.base,
            cursor: 'pointer', fontSize: 12, fontWeight: 600, marginLeft: 6,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = videoTheme.textSecondary }}
          onMouseLeave={e => { e.currentTarget.style.background = videoTheme.text }}
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