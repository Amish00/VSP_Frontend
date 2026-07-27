// src/components/videoeditor/components/LeftPanel.js
import React, { useState, useRef, useEffect } from 'react'
import { X, Upload, Plus, Film, Music, Search, Loader } from 'lucide-react'
import Picker from '@emoji-mart/react'
import emojiData from '@emoji-mart/data'
import { useStore } from '../store/store'
import { PEXELS_KEY, TEXT_PRESETS, SHAPES, TRANSITIONS, EFFECTS, FONTS } from '../utils/constants'
import { videoTheme } from '../theme'

// Helper styles using theme
const S = {
  card: {
    padding: '8px 10px',
    borderRadius: 7,
    background: videoTheme.el,
    border: `1px solid ${videoTheme.border}`,
    cursor: 'pointer',
    transition: 'all 0.1s',
  },
  cardHover: {
    background: videoTheme.hov,
    borderColor: videoTheme.borderLight,
  },
}

function Panel({ title, onClose, children }) {
  return (
    <div style={{
      width: 280,
      background: videoTheme.side,
      borderRight: `1px solid ${videoTheme.border}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '11px 13px 9px',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: videoTheme.text }}>{title}</span>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: videoTheme.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 2 }}>
            <X size={13} />
          </button>
        )}
      </div>
      <div style={{ height: 1, background: videoTheme.border, flexShrink: 0 }} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px 12px' }}>{children}</div>
    </div>
  )
}

// ---------- Tabs (improved contrast) ----------
function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex',
      background: videoTheme.el,
      borderRadius: 7,
      padding: 3,
      gap: 2,
      marginBottom: 12,
    }}>
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            flex: 1,
            padding: '4px 0',
            borderRadius: 5,
            border: 'none',
            cursor: 'pointer',
            fontSize: 10,
            fontWeight: 600, // bolder
            fontFamily: 'inherit',
            background: active === t ? videoTheme.hov : 'transparent',
            color: active === t ? videoTheme.text : videoTheme.textSecondary, // brighter for inactive
            textTransform: 'capitalize',
            transition: 'all 0.1s',
            letterSpacing: '0.3px',
          }}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

// ---------- Media Panel ----------
function MediaPanel() {
  const { tracks, addClip } = useStore()
  const fileRef = useRef()
  const [tab, setTab] = useState('upload')
  const [uploads, setUploads] = useState([])
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('cinematic')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const getTrack = type => {
    if (type === 'audio') return tracks.find(t => t.type === 'audio')
    return tracks.find(t => t.type === 'video') || tracks.find(t => t.type === 'image')
  }

  const placeClip = (type, name, src, duration, waveform) => {
    const t = getTrack(type)
    if (!t) {
      useStore.getState().addTrack(type)
      const tt = useStore.getState().tracks.find(x => x.type === type)
      if (tt) useStore.getState().addClip(tt.id, { type, name, src, duration, waveform })
      return
    }
    addClip(t.id, { type, name, src, duration: duration || 5, waveform: waveform || null })
  }

  const handleFiles = async files => {
    for (const f of Array.from(files)) {
      const url = URL.createObjectURL(f)
      const isV = f.type.startsWith('video/'), isA = f.type.startsWith('audio/')
      let dur = 5, waveform = null
      if (isV || isA) {
        await new Promise(r => {
          const el = document.createElement(isV ? 'video' : 'audio')
          el.src = url
          el.onloadedmetadata = () => { dur = el.duration || 5; r() }
          el.onerror = r
          setTimeout(r, 3000)
        })
        if (isA) {
          try {
            const res = await fetch(url)
            const buf = await res.arrayBuffer()
            const ctx = new AudioContext()
            const decoded = await ctx.decodeAudioData(buf)
            ctx.close()
            const data = decoded.getChannelData(0)
            const bins = 200
            const bs = Math.floor(data.length / bins)
            const raw = Array.from({ length: bins }, (_, i) => {
              let s = 0
              for (let j = 0; j < bs; j++) s += Math.abs(data[i * bs + j] || 0)
              return s / bs
            })
            const max = Math.max(...raw, 0.001)
            waveform = raw.map(v => v / max)
          } catch {}
        }
      }
      const type = isV ? 'video' : isA ? 'audio' : 'image'
      const item = { url, name: f.name, type, dur }
      setUploads(u => [item, ...u])
      placeClip(type, f.name, url, dur, waveform)
    }
  }

  const fetchPexels = async (q, p, type) => {
    setLoading(true)
    setItems([])
    try {
      const url = type === 'photos'
        ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=18&page=${p}`
        : `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=12&page=${p}`
      const r = await fetch(url, { headers: { Authorization: PEXELS_KEY } })
      const d = await r.json()
      const arr = type === 'photos' ? (d.photos || []) : (d.videos || [])
      setItems(prev => p === 1 ? arr : [...prev, ...arr])
    } catch {
      setItems([])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (tab === 'photos') fetchPexels(query, 1, 'photos')
    else if (tab === 'videos') fetchPexels(query, 1, 'videos')
  }, [tab])

  const search = e => { e.preventDefault(); setPage(1); fetchPexels(query, 1, tab === 'videos' ? 'videos' : 'photos') }

  return (
    <>
      <Tabs tabs={['upload', 'photos', 'videos']} active={tab} onChange={t => { setTab(t); setPage(1) }} />

      {tab === 'upload' && (
        <>
          <input ref={fileRef} type="file" multiple accept="video/*,audio/*,image/*" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
          <div
            onClick={() => fileRef.current.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
            style={{
              width: '100%',
              padding: '20px 0',
              borderRadius: 8,
              border: `1.5px dashed ${videoTheme.border}`,
              background: videoTheme.el,
              color: videoTheme.textMuted,
              cursor: 'pointer',
              textAlign: 'center',
              marginBottom: 12,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = videoTheme.borderLight; e.currentTarget.style.color = videoTheme.textSecondary }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = videoTheme.border; e.currentTarget.style.color = videoTheme.textMuted }}
          >
            <Upload size={20} style={{ margin: '0 auto 8px', display: 'block' }} />
            <div style={{ fontSize: 12, fontWeight: 500 }}>Upload Media</div>
            <div style={{ fontSize: 10, marginTop: 2, color: videoTheme.textMuted }}>Video · Audio · Images</div>
          </div>
          {uploads.length === 0 && <div style={{ color: videoTheme.textMuted, fontSize: 11, textAlign: 'center', padding: '8px 0' }}>No uploads yet</div>}
          {uploads.map((item, i) => (
            <div
              key={i}
              style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}
              onMouseEnter={e => Object.assign(e.currentTarget.style, S.cardHover)}
              onMouseLeave={e => Object.assign(e.currentTarget.style, S.card)}
            >
              {item.type === 'image' ? <img src={item.url} alt="" style={{ width: 34, height: 26, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} /> : <div style={{ width: 34, height: 26, borderRadius: 4, background: videoTheme.base, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.type === 'video' ? <Film size={12} color={videoTheme.textMuted} /> : <Music size={12} color={videoTheme.textMuted} />}</div>}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 10, color: videoTheme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                <div style={{ fontSize: 9, color: videoTheme.textMuted, marginTop: 1 }}>{item.type} · {item.dur?.toFixed(1)}s</div>
              </div>
              <button onClick={() => placeClip(item.type, item.name, item.url, item.dur)} style={{ background: 'none', border: 'none', color: videoTheme.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Plus size={12} /></button>
            </div>
          ))}
        </>
      )}

      {(tab === 'photos' || tab === 'videos') && (
        <>
          <form onSubmit={search} style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={11} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: videoTheme.textMuted, pointerEvents: 'none' }} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search…"
                style={{
                  width: '100%',
                  background: videoTheme.el,
                  border: `1px solid ${videoTheme.border}`,
                  borderRadius: 6,
                  padding: '5px 8px 5px 24px',
                  fontSize: 11,
                  color: videoTheme.text,
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <button type="submit" style={{ padding: '0 10px', borderRadius: 6, border: `1px solid ${videoTheme.border}`, background: videoTheme.el, color: videoTheme.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Search size={11} /></button>
          </form>
          {loading && <div style={{ textAlign: 'center', color: videoTheme.textMuted, padding: 12 }}><Loader size={14} style={{ display: 'block', margin: '0 auto', animation: 'spin 1s linear infinite' }} /></div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {items.map((item, i) => {
              const thumb = tab === 'photos' ? (item.src?.tiny || '') : (item.image || '')
              const onClick = () => {
                if (tab === 'photos') {
                  placeClip('image', item.alt || 'Photo', item.src?.large || item.src?.medium || '', 5)
                } else {
                  const f = item.video_files?.find(x => x.quality === 'sd') || item.video_files?.[0]
                  if (f) placeClip('video', 'Pexels Video', f.link, item.duration || 10)
                }
              }
              return (
                <div
                  key={item.id || i}
                  onClick={onClick}
                  style={{
                    aspectRatio: tab === 'photos' ? '4/3' : '16/9',
                    borderRadius: 6,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: videoTheme.el,
                    border: `1.5px solid transparent`,
                    transition: 'border-color 0.1s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = videoTheme.borderLight}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                  {tab === 'videos' && <div style={{ position: 'absolute', bottom: 3, right: 4, background: 'rgba(0,0,0,0.7)', color: videoTheme.textSecondary, fontSize: 8, padding: '1px 4px', borderRadius: 3, fontFamily: 'monospace' }}>{item.duration}s</div>}
                </div>
              )
            })}
          </div>
          {items.length > 0 && !loading && (
            <button
              onClick={() => { const np = page + 1; setPage(np); fetchPexels(query, np, tab === 'videos' ? 'videos' : 'photos') }}
              style={{
                width: '100%',
                marginTop: 8,
                padding: '6px',
                borderRadius: 6,
                border: `1px solid ${videoTheme.border}`,
                background: videoTheme.el,
                color: videoTheme.textMuted,
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: 'inherit',
              }}
            >
              Load more
            </button>
          )}
        </>
      )}
    </>
  )
}

// ---------- Text Panel ----------
function TextPanel() {
  const { tracks, addClip, addTrack } = useStore()
  const place = p => {
    let t = tracks.find(tr => tr.type === 'text')
    if (!t) { addTrack('text', 'Titles'); t = useStore.getState().tracks.find(tr => tr.type === 'text') }
    if (t) addClip(t.id, { type: 'text', name: p.name, duration: 5, ...p })
  }
  return (
    <>
      {TEXT_PRESETS.map((p, i) => (
        <div
          key={i}
          onClick={() => place(p)}
          style={{ ...S.card, marginBottom: 5 }}
          onMouseEnter={e => Object.assign(e.currentTarget.style, S.cardHover)}
          onMouseLeave={e => Object.assign(e.currentTarget.style, S.card)}
        >
          <div style={{ fontSize: Math.min(15, p.fontSize / 5.5), fontWeight: p.fontWeight || 700, color: p.textColor || videoTheme.text, lineHeight: 1.2, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
            {p.name}
          </div>
          <div style={{ fontSize: 9, color: videoTheme.textMuted, marginTop: 3 }}>{p.fontSize}px</div>
        </div>
      ))}
    </>
  )
}

// ---------- Shapes Panel ----------
function ShapesPanel() {
  const { tracks, addClip, addTrack } = useStore()
  const [color, setColor] = useState('#3b82f6')
  const place = s => {
    let t = tracks.find(tr => tr.type === 'shape') || tracks.find(tr => tr.type === 'overlay')
    if (!t) { addTrack('overlay', 'Overlays'); t = useStore.getState().tracks.find(tr => tr.type === 'overlay') }
    if (t) addClip(t.id, { type: 'shape', name: s.name, shapePath: s.id, shapeColor: color, duration: 5, overlayW: 25, overlayH: 25 })
  }
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '7px 9px', background: videoTheme.el, borderRadius: 7, border: `1px solid ${videoTheme.border}` }}>
        <span style={{ fontSize: 10, color: videoTheme.textSecondary, fontWeight: 500 }}>Color</span>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 24, height: 20, border: 'none', cursor: 'pointer', borderRadius: 4, padding: 0 }} />
        <input
          type="text"
          value={color}
          onChange={e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) setColor(e.target.value) }}
          style={{
            flex: 1,
            background: videoTheme.el,
            border: `1px solid ${videoTheme.border}`,
            borderRadius: 5,
            padding: '3px 7px',
            fontSize: 11,
            color: videoTheme.text,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
        {SHAPES.map(s => (
          <div
            key={s.id}
            onClick={() => place(s)}
            style={{ ...S.card, textAlign: 'center', padding: '10px 8px' }}
            onMouseEnter={e => Object.assign(e.currentTarget.style, S.cardHover)}
            onMouseLeave={e => Object.assign(e.currentTarget.style, S.card)}
          >
            <svg viewBox="0 0 100 100" width={32} height={32} style={{ display: 'block', margin: '0 auto 5px' }}>
              <path d={s.d} fill={color} />
            </svg>
            <div style={{ fontSize: 9, color: videoTheme.textSecondary, fontWeight: 500 }}>{s.name}</div>
          </div>
        ))}
      </div>
    </>
  )
}

// ---------- Stickers Panel ----------
function StickersPanel() {
  const { tracks, addClip, addTrack } = useStore()
  const [showFullPicker, setShowFullPicker] = useState(false)

  const QUICK = [
    ['😂', 'Laugh'], ['🔥', 'Fire'], ['❤️', 'Heart'], ['✨', 'Sparkle'],
    ['🎯', 'Target'], ['🚀', 'Rocket'], ['💥', 'Boom'], ['👏', 'Clap'],
    ['👍', 'Like'], ['🤯', 'Mind Blown'], ['🎉', 'Celebrate'], ['✅', 'Done'],
  ]

  const place = (emoji, label = 'Sticker') => {
    let t = tracks.find(tr => tr.type === 'sticker') || tracks.find(tr => tr.type === 'overlay')
    if (!t) { addTrack('overlay', 'Overlays'); t = useStore.getState().tracks.find(tr => tr.type === 'overlay') }
    if (t) addClip(t.id, { type: 'sticker', name: label, sticker: emoji, duration: 5, overlayW: 12, overlayH: 12 })
  }

  return (
    <div>
      <div style={{ marginBottom: 9, padding: '8px 9px', borderRadius: 7, background: videoTheme.el, border: `1px solid ${videoTheme.border}`, fontSize: 10, color: videoTheme.textSecondary, lineHeight: 1.4 }}>
        Quick stickers for speed. Open full picker when you need more.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
        {QUICK.map(([emoji, label]) => (
          <button
            key={label}
            onClick={() => place(emoji, label)}
            style={{
              border: `1px solid ${videoTheme.border}`,
              borderRadius: 8,
              background: videoTheme.el,
              color: videoTheme.text,
              cursor: 'pointer',
              padding: '8px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = videoTheme.hov }}
            onMouseLeave={e => { e.currentTarget.style.background = videoTheme.el }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{emoji}</span>
            <span style={{ fontSize: 8, color: videoTheme.textSecondary, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowFullPicker(v => !v)}
        style={{
          width: '100%',
          marginBottom: 8,
          padding: '7px 8px',
          borderRadius: 7,
          border: `1px solid ${videoTheme.borderLight}`,
          background: videoTheme.el,
          color: videoTheme.textSecondary,
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 500,
          fontFamily: 'inherit',
        }}
      >
        {showFullPicker ? 'Hide Full Emoji Picker' : 'Open Full Emoji Picker'}
      </button>

      <div style={{ display: showFullPicker ? 'block' : 'none', borderRadius: 8, overflow: 'hidden', border: `1px solid ${videoTheme.border}` }}>
        <Picker
          data={emojiData}
          onEmojiSelect={emoji => place(emoji?.native || '⭐', emoji?.name || 'Sticker')}
          theme="dark"
          previewPosition="none"
          skinTonePosition="none"
          navPosition="bottom"
          searchPosition="sticky"
          perLine={7}
          emojiSize={20}
          emojiButtonSize={32}
        />
      </div>
    </div>
  )
}

// ---------- Audio Panel (with audio generation) ----------
function AudioPanel() {
  const { tracks, addClip, addTrack } = useStore()
  const fileRef = useRef()
  const [tab, setTab] = useState('upload')

  // Helper: generate AudioBuffer for music or SFX
  const generateAudioBuffer = async (type, params) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const sampleRate = ctx.sampleRate
    let duration = params.duration || 2
    let buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate)
    let left = buffer.getChannelData(0)
    let right = buffer.getChannelData(1)

    if (type === 'sfx') {
      // Simple tone
      const freq = params.freq || 440
      const amp = 0.3
      for (let i = 0; i < left.length; i++) {
        const t = i / sampleRate
        const env = t < 0.01 ? t / 0.01 : (t < duration - 0.01 ? 1 : (duration - t) / 0.01)
        const val = amp * env * Math.sin(2 * Math.PI * freq * t)
        left[i] = val
        right[i] = val
      }
    } else if (type === 'music') {
      // Simple chord progression (C - G - Am - F)
      const chords = [
        [261.63, 329.63, 392.00], // C
        [392.00, 493.88, 587.33], // G
        [440.00, 523.25, 659.25], // A
        [349.23, 440.00, 523.25], // F
      ]
      const chordDuration = duration / chords.length
      for (let i = 0; i < left.length; i++) {
        const t = i / sampleRate
        const chordIdx = Math.min(Math.floor(t / chordDuration), chords.length - 1)
        const chord = chords[chordIdx]
        let sum = 0
        for (const f of chord) {
          sum += Math.sin(2 * Math.PI * f * t)
        }
        const env = t < 0.05 ? t / 0.05 : (t > duration - 0.05 ? (duration - t) / 0.05 : 1)
        const val = 0.15 * env * sum / chord.length
        left[i] = val
        right[i] = val
      }
    }

    // Close context to free resources
    ctx.close()
    return buffer
  }

  // Helper: convert AudioBuffer to WAV blob URL
  const audioBufferToWav = (buffer) => {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const length = buffer.length * numChannels * 2
    const dataView = new DataView(new ArrayBuffer(44 + length))
    // Write WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        dataView.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    writeString(0, 'RIFF')
    dataView.setUint32(4, 36 + length, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    dataView.setUint32(16, 16, true)
    dataView.setUint16(20, 1, true)
    dataView.setUint16(22, numChannels, true)
    dataView.setUint32(24, sampleRate, true)
    dataView.setUint32(28, sampleRate * numChannels * 2, true)
    dataView.setUint16(32, numChannels * 2, true)
    dataView.setUint16(34, 16, true)
    writeString(36, 'data')
    dataView.setUint32(40, length, true)

    const offset = 44
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = buffer.getChannelData(ch)[i] * 0x7fff
        dataView.setInt16(offset + (i * numChannels + ch) * 2, sample, true)
      }
    }

    const blob = new Blob([dataView], { type: 'audio/wav' })
    return URL.createObjectURL(blob)
  }

  const placeAudio = (name, src, dur) => {
    let t = tracks.find(tr => tr.type === 'audio')
    if (!t) { addTrack('audio', 'Audio'); t = useStore.getState().tracks.find(tr => tr.type === 'audio') }
    if (t) addClip(t.id, { type: 'audio', name, src, duration: dur || 5 })
  }

  const handleAudio = async files => {
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('audio/')) continue
      const url = URL.createObjectURL(f)
      let dur = 30
      await new Promise(r => { const a = document.createElement('audio'); a.src = url; a.onloadedmetadata = () => { dur = a.duration || 30; r() }; a.onerror = r; setTimeout(r, 3000) })
      placeAudio(f.name, url, dur)
    }
  }

  // Music presets (now generate audio)
  const MUSIC_PRESETS = [
    { name: 'Upbeat Pop', genre: 'Pop', bpm: 128, dur: 5 },
    { name: 'Lo-Fi Chill', genre: 'Lo-Fi', bpm: 75, dur: 5 },
    { name: 'Cinematic', genre: 'Ambient', bpm: 72, dur: 6 },
    { name: 'Hip Hop', genre: 'Hip Hop', bpm: 90, dur: 5 },
    { name: 'Rock', genre: 'Rock', bpm: 140, dur: 5 },
    { name: 'Jazz', genre: 'Jazz', bpm: 110, dur: 5 },
  ]

  const SFX_PRESETS = [
    { name: 'Beep', freq: 880, dur: 0.15 },
    { name: 'Click', freq: 1200, dur: 0.05 },
    { name: 'Pop', freq: 500, dur: 0.1 },
    { name: 'Swoosh', freq: 300, dur: 0.3 },
    { name: 'Chime', freq: 1760, dur: 0.4 },
    { name: 'Deep Hit', freq: 60, dur: 0.5 },
  ]

  const generateAndPlace = async (type, params) => {
    try {
      const buffer = await generateAudioBuffer(type, params)
      const url = audioBufferToWav(buffer)
      placeAudio(params.name, url, params.dur || buffer.duration)
    } catch (err) {
      console.error('Audio generation failed', err)
    }
  }

  return (
    <>
      <Tabs tabs={['upload', 'music', 'sfx']} active={tab} onChange={setTab} />
      {tab === 'upload' && (
        <>
          <input ref={fileRef} type="file" accept="audio/*" multiple style={{ display: 'none' }} onChange={e => handleAudio(e.target.files)} />
          <div
            onClick={() => fileRef.current.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleAudio(e.dataTransfer.files) }}
            style={{
              width: '100%',
              padding: '20px 0',
              borderRadius: 8,
              border: `1.5px dashed ${videoTheme.border}`,
              background: videoTheme.el,
              color: videoTheme.textMuted,
              cursor: 'pointer',
              textAlign: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = videoTheme.borderLight; e.currentTarget.style.color = videoTheme.textSecondary }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = videoTheme.border; e.currentTarget.style.color = videoTheme.textMuted }}
          >
            <Music size={20} style={{ margin: '0 auto 8px', display: 'block' }} />
            <div style={{ fontSize: 12, fontWeight: 500 }}>Upload Audio</div>
            <div style={{ fontSize: 10, marginTop: 2, color: videoTheme.textMuted }}>MP3 · WAV · AAC · OGG</div>
          </div>
        </>
      )}
      {tab === 'music' && (
        <>
          {MUSIC_PRESETS.map((m, i) => (
            <div
              key={i}
              onClick={() => generateAndPlace('music', m)}
              style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}
              onMouseEnter={e => Object.assign(e.currentTarget.style, S.cardHover)}
              onMouseLeave={e => Object.assign(e.currentTarget.style, S.card)}
            >
              <div style={{ width: 28, height: 28, borderRadius: 6, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, color: '#fff' }}>♪</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: videoTheme.textSecondary, fontWeight: 500 }}>{m.name}</div>
                <div style={{ fontSize: 9, color: videoTheme.textMuted, marginTop: 1 }}>{m.genre} · {m.bpm}bpm</div>
              </div>
              <button style={{ background: 'none', border: 'none', color: videoTheme.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Plus size={11} /></button>
            </div>
          ))}
          <div style={{ padding: '8px 9px', borderRadius: 7, background: videoTheme.el, border: `1px solid ${videoTheme.border}`, marginTop: 6 }}>
            <div style={{ fontSize: 9, color: videoTheme.textMuted, lineHeight: 1.5 }}>Free music: pixabay.com/music · freemusicarchive.org</div>
          </div>
        </>
      )}
      {tab === 'sfx' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {SFX_PRESETS.map((s, i) => (
            <div
              key={i}
              onClick={() => generateAndPlace('sfx', s)}
              style={{ ...S.card, textAlign: 'center', padding: 10 }}
              onMouseEnter={e => Object.assign(e.currentTarget.style, S.cardHover)}
              onMouseLeave={e => Object.assign(e.currentTarget.style, S.card)}
            >
              <div style={{ fontSize: 18, marginBottom: 4 }}>♪</div>
              <div style={{ fontSize: 10, color: videoTheme.textSecondary, fontWeight: 500 }}>{s.name}</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ---------- Transitions Panel (FIXED CONTRAST) ----------
function TransitionsPanel() {
  const { getSelectedClip, updateClip } = useStore()
  const clip = getSelectedClip()
  const upd = p => clip && updateClip(clip.id, p)

  return (
    <>
      {!clip && <div style={{ color: videoTheme.textMuted, fontSize: 11, textAlign: 'center', padding: '24px 0' }}>Select a clip first</div>}
      {['In', 'Out'].map(dir => {
        const key = `trans${dir}`, dkey = `trans${dir}Dur`
        return (
          <div key={dir} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, color: videoTheme.textSecondary, fontWeight: 600, letterSpacing: 0.8, marginBottom: 8 }}>
              TRANSITION {dir.toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[{ id: null, name: 'None', icon: '—' }, ...TRANSITIONS].map(t => {
                const active = clip?.[key] === t.id
                return (
                  <div
                    key={t.id || 'none'}
                    onClick={() => upd({ [key]: t.id })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '7px 10px',
                      borderRadius: 7,
                      background: active ? videoTheme.hov : videoTheme.el,
                      border: `1px solid ${active ? videoTheme.borderLight : 'transparent'}`,
                      cursor: 'pointer',
                      opacity: !clip ? 0.4 : 1,
                      transition: 'all 0.1s',
                    }}
                  >
                    <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{t.icon || '—'}</span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: active ? 600 : 500,
                      color: active ? videoTheme.text : videoTheme.textSecondary, // bright for inactive
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}>
                      {t.name}
                    </span>
                    {active && <span style={{ marginLeft: 'auto', color: videoTheme.textMuted, fontSize: 10 }}>✓</span>}
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 9, color: videoTheme.textSecondary, fontWeight: 500, minWidth: 40 }}>Duration</span>
              <input
                type="range"
                min={0.1}
                max={3}
                step={0.1}
                value={clip?.[dkey] ?? 0.5}
                onChange={e => upd({ [dkey]: parseFloat(e.target.value) })}
                disabled={!clip}
                style={{
                  flex: 1,
                  WebkitAppearance: 'none',
                  height: 2,
                  background: videoTheme.border,
                  borderRadius: 99,
                  outline: 'none',
                  cursor: 'pointer',
                  accentColor: videoTheme.text,
                }}
              />
              <span style={{ fontSize: 9, color: videoTheme.textSecondary, fontFamily: 'monospace', fontWeight: 500, minWidth: 22 }}>
                {(clip?.[dkey] ?? 0.5).toFixed(1)}s
              </span>
            </div>
          </div>
        )
      })}
    </>
  )
}

// ---------- Effects Panel (FIXED CONTRAST) ----------
function EffectsPanel() {
  const { getSelectedClip, updateClip } = useStore()
  const clip = getSelectedClip()
  return (
    <>
      {!clip && <div style={{ color: videoTheme.textMuted, fontSize: 11, textAlign: 'center', padding: '24px 0' }}>Select a clip first</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {EFFECTS.map(e => {
          const active = clip?.filter === e.id
          return (
            <div
              key={e.id || 'none'}
              onClick={() => clip && updateClip(clip.id, { filter: e.id })}
              style={{
                padding: '8px',
                borderRadius: 7,
                background: active ? videoTheme.hov : videoTheme.el,
                border: `1px solid ${active ? videoTheme.borderLight : videoTheme.border}`,
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: 11,
                fontWeight: active ? 600 : 500,
                color: active ? videoTheme.text : videoTheme.textSecondary, // bright for inactive
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                transition: 'all 0.1s',
                opacity: !clip && e.id ? 0.4 : 1,
              }}
            >
              {e.name}
            </div>
          )
        })}
      </div>
    </>
  )
}

// ---------- Main LeftPanel ----------
const PANELS = {
  media: { title: 'Media', C: MediaPanel },
  text: { title: 'Text', C: TextPanel },
  shapes: { title: 'Shapes', C: ShapesPanel },
  stickers: { title: 'Stickers', C: StickersPanel },
  audio: { title: 'Audio', C: AudioPanel },
  transitions: { title: 'Transitions', C: TransitionsPanel },
  effects: { title: 'Effects', C: EffectsPanel },
}

const LeftPanel = () => {
  const { activePanel, setActivePanel } = useStore()
  if (!activePanel || !PANELS[activePanel]) return null
  const { title, C } = PANELS[activePanel]
  return (
    <Panel title={title} onClose={() => setActivePanel(null)}>
      <C />
    </Panel>
  )
}

export default LeftPanel