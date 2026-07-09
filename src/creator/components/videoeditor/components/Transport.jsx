import React, { useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Volume2, VolumeX, Repeat } from 'lucide-react'
import { useStore } from '../store/store'
import { videoTheme } from '../theme'

function pad(n) { return String(Math.floor(n)).padStart(2, '0') }
function fmt(t) { return `${pad(t / 60)}:${pad(t % 60)}:${pad((t % 1) * 30)}` }

const Transport = () => {
  const { currentTime, duration, playing, volume, loop, playbackRate,
    togglePlay, setCurrentTime, setVolume, setLoop, setPlaybackRate, stepFrame } = useStore()

  const barRef = useRef()
  const seeking = useRef(false)

  const seekAt = e => {
    if (!barRef.current) return
    const r = barRef.current.getBoundingClientRect()
    const t = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration
    setCurrentTime(t)
  }

  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  const iconBtn = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    color: videoTheme.textMuted,
    cursor: 'pointer',
  }

  return (
    <div style={{
      height: 46,
      background: videoTheme.side,
      borderTop: `1px solid ${videoTheme.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      gap: 7,
      flexShrink: 0,
    }}>
      <button onClick={() => setCurrentTime(0)} style={iconBtn}><SkipBack size={13} /></button>
      <button onClick={() => stepFrame(-1)} style={iconBtn}><ChevronLeft size={13} /></button>

      <button onClick={togglePlay} style={{
        width: 32,
        height: 32,
        borderRadius: 7,
        border: 'none',
        background: videoTheme.text,
        color: videoTheme.base,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>

      <button onClick={() => stepFrame(1)} style={iconBtn}><ChevronRight size={13} /></button>
      <button onClick={() => setCurrentTime(duration)} style={iconBtn}><SkipForward size={13} /></button>

      <div style={{ fontFamily: 'monospace', fontSize: 11, color: videoTheme.textMuted, minWidth: 96, letterSpacing: 0.5, flexShrink: 0 }}>
        {fmt(currentTime)} <span style={{ color: videoTheme.border }}>/</span> {fmt(duration)}
      </div>

      <div ref={barRef} style={{
        flex: 1,
        height: 4,
        background: videoTheme.border,
        borderRadius: 99,
        cursor: 'pointer',
        position: 'relative',
      }}
      onMouseDown={e => { seeking.current = true; seekAt(e) }}
      onMouseMove={e => { if (seeking.current) seekAt(e) }}
      onMouseUp={() => { seeking.current = false }}
      onMouseLeave={() => { seeking.current = false }}>
        <div style={{ width: `${pct}%`, height: '100%', background: videoTheme.text, borderRadius: 99 }} />
        <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%,-50%)', width: 11, height: 11, borderRadius: '50%', background: videoTheme.text, border: `2px solid ${videoTheme.borderLight}`, flexShrink: 0 }} />
      </div>

      <button onClick={() => setLoop(!loop)} style={{ ...iconBtn, color: loop ? videoTheme.text : videoTheme.textMuted, background: loop ? videoTheme.hov : 'transparent' }}>
        <Repeat size={13} />
      </button>

      <select
        value={playbackRate}
        onChange={e => setPlaybackRate(parseFloat(e.target.value))}
        style={{
          background: videoTheme.el,
          border: `1px solid ${videoTheme.border}`,
          color: videoTheme.textMuted,
          borderRadius: 5,
          padding: '2px 5px',
          fontSize: 10,
          cursor: 'pointer',
          outline: 'none',
          fontFamily: 'monospace',
        }}
      >
        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map(r => <option key={r} value={r}>{r}×</option>)}
      </select>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        <button style={iconBtn} onClick={() => setVolume(volume > 0 ? 0 : 0.8)}>
          {volume === 0 ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          style={{
            width: 64,
            WebkitAppearance: 'none',
            appearance: 'none',
            height: 3,
            background: videoTheme.border,
            borderRadius: 99,
            outline: 'none',
            cursor: 'pointer',
            accentColor: videoTheme.text,
          }}
        />
        <span style={{ fontSize: 9, color: videoTheme.textMuted, fontFamily: 'monospace', minWidth: 24 }}>{Math.round(volume * 100)}%</span>
      </div>
    </div>
  )
}

export default Transport