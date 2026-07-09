// src/components/videoeditor/components/Timeline.js
import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useStore } from '../store/store'
import { Volume2, VolumeX, Lock, Unlock } from 'lucide-react'
import { videoTheme } from '../theme'

const LABEL_W = 130
const TRACK_H = 48
const RULER_H = 24

function fmtTime(t) {
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function WaveformBars({ data, width, color }) {
  const ref = useRef()
  useEffect(() => {
    if (!ref.current || !data?.length) return
    const dpr = window.devicePixelRatio || 1
    const h = TRACK_H - 10
    const canvas = ref.current
    canvas.width = width * dpr
    canvas.height = h * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${h}px`
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, h)
    ctx.fillStyle = color || '#22c55e'
    const bw = width / data.length
    for (let i = 0; i < data.length; i++) {
      const amp = data[i] * (h / 2)
      ctx.fillRect(i * bw, h / 2 - amp, Math.max(bw - 0.5, 0.5), amp * 2)
    }
  }, [data, width, color])
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, top: 5, opacity: 0.5, pointerEvents: 'none' }} />
}

function Clip({ clip, trackColor, zoom, scrollX, selected, trackLocked }) {
  const { updateClip, splitClip, selectClip, activeTool, currentTime, removeClip, duplicateClip } = useStore()
  const [ctx, setCtx] = useState(null)

  const left = clip.start * zoom - scrollX
  const width = Math.max(clip.duration * zoom, 10)
  const isOffscreen = left + width < 0 || left > 10000

  const COLORS = {
    video: { bg: '#0f2a4a', border: '#2563eb', text: '#93c5fd' },
    audio: { bg: '#0a2010', border: '#16a34a', text: '#86efac' },
    text: { bg: '#2a1a00', border: '#d97706', text: '#fcd34d' },
    image: { bg: '#0a1a2a', border: '#0891b2', text: '#67e8f9' },
    shape: { bg: '#1a1a2a', border: '#7c3aed', text: '#c4b5fd' },
    sticker: { bg: '#2a0a1a', border: '#db2777', text: '#f9a8d4' },
    overlay: { bg: '#1a0a2a', border: '#7c3aed', text: '#c4b5fd' },
  }
  const col = COLORS[clip.type] || COLORS.video

  const onMouseDown = useCallback(e => {
    if (e.button !== 0 || trackLocked) return
    e.stopPropagation()

    if (activeTool === 'split') {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickT = clip.start + (e.clientX - rect.left) / zoom
      splitClip(clip.id, clickT)
      return
    }

    selectClip(clip.id)

    const origStart = clip.start
    const startX = e.clientX

    const onMove = ev => {
      const dx = (ev.clientX - startX) / zoom
      const newStart = Math.max(0, origStart + dx)
      updateClip(clip.id, { start: Math.round(newStart * 20) / 20 })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [clip, zoom, activeTool, trackLocked, splitClip, selectClip, updateClip])

  const resizeEdge = useCallback((e, side) => {
    e.stopPropagation()
    const origStart = clip.start
    const origDur = clip.duration
    const startX = e.clientX

    const onMove = ev => {
      const dx = (ev.clientX - startX) / zoom
      if (side === 'left') {
        const newStart = Math.max(0, Math.min(origStart + dx, origStart + origDur - 0.1))
        updateClip(clip.id, { start: newStart, duration: origDur - (newStart - origStart) })
      } else {
        updateClip(clip.id, { duration: Math.max(0.1, origDur + dx) })
      }
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [clip, zoom, updateClip])

  const clipLabel = clip.type === 'text' ? `"${(clip.text || '').slice(0, 12)}"` : clip.type === 'sticker' ? clip.sticker || '⭐' : clip.name || clip.type

  if (isOffscreen) return null

  return (
    <>
      <div
        onMouseDown={onMouseDown}
        onContextMenu={e => {
          e.preventDefault()
          const x = Math.max(8, Math.min(e.clientX, window.innerWidth - 170 - 8))
          const y = Math.max(8, Math.min(e.clientY, window.innerHeight - 120 - 8))
          setCtx({ x, y })
        }}
        style={{
          position: 'absolute',
          left, width,
          top: 5, bottom: 5,
          borderRadius: 6,
          background: col.bg,
          border: `1.5px solid ${selected ? videoTheme.text : col.border}`,
          cursor: activeTool === 'split' ? 'crosshair' : trackLocked ? 'not-allowed' : 'grab',
          overflow: 'hidden',
          userSelect: 'none',
        }}>
        {clip.waveform && <WaveformBars data={clip.waveform} width={width} color={col.border} />}
        {clip.transIn && width > 20 && (
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: Math.min(clip.transInDur * zoom, width / 2), background: 'rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.15)', pointerEvents: 'none' }}>
            <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', padding: '2px 3px', display: 'block', fontFamily: 'monospace' }}>in</span>
          </div>
        )}
        {clip.transOut && width > 20 && (
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: Math.min(clip.transOutDur * zoom, width / 2), background: 'rgba(255,255,255,0.06)', borderLeft: '1px solid rgba(255,255,255,0.15)', pointerEvents: 'none' }}>
            <span style={{ position: 'absolute', right: 3, top: 2, fontSize: 7, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>out</span>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 8px', overflow: 'hidden', pointerEvents: 'none', zIndex: 2 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {clipLabel}
          </span>
          {clip.filter && <span style={{ marginLeft: 5, fontSize: 8, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>fx</span>}
        </div>
        <div onMouseDown={e => resizeEdge(e, 'left')}
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 7, cursor: 'ew-resize', zIndex: 5 }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'} />
        <div onMouseDown={e => resizeEdge(e, 'right')}
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 7, cursor: 'ew-resize', zIndex: 5 }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'} />
      </div>

      {ctx && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setCtx(null)} />
          <div style={{ position: 'fixed', left: ctx.x, top: ctx.y, background: videoTheme.card, border: `1px solid ${videoTheme.border}`, borderRadius: 9, padding: 4, zIndex: 1000, minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
            {[
              ['✂ Split at playhead', () => splitClip(clip.id, currentTime)],
              ['⧉ Duplicate', () => duplicateClip(clip.id)],
              ['🗑 Delete', () => removeClip(clip.id)],
            ].map(([lbl, fn]) => (
              <button
                key={lbl}
                onClick={() => { fn(); setCtx(null) }}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  background: 'none',
                  border: 'none',
                  color: lbl.includes('Delete') ? '#f87171' : videoTheme.textSecondary,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 12,
                  borderRadius: 6,
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => e.currentTarget.style.background = videoTheme.hov}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                {lbl}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  )
}

function TrackRow({ track, zoom, scrollX, selectedClipId }) {
  const { muteTrack, lockTrack, selectClip } = useStore()

  const onBodyClick = e => {
    if (e.target === e.currentTarget) selectClip(null)
  }

  return (
    <div style={{ display: 'flex', height: TRACK_H, borderBottom: `1px solid ${videoTheme.border}`, flexShrink: 0 }}>
      <div style={{
        width: LABEL_W,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 8px',
        background: videoTheme.side,
        borderRight: `1px solid ${videoTheme.border}`,
        boxSizing: 'border-box', // <--- FIX: padding included in width
      }}>
        <div style={{ width: 6, height: 6, borderRadius: 2, background: track.color, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 11, color: videoTheme.textMuted, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.label}</span>
        <button onClick={() => muteTrack(track.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: track.muted ? '#ef4444' : videoTheme.border, padding: 2, display: 'flex', alignItems: 'center' }}>
          {track.muted ? <VolumeX size={11} /> : <Volume2 size={11} />}
        </button>
        <button onClick={() => lockTrack(track.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: track.locked ? '#eab308' : videoTheme.border, padding: 2, display: 'flex', alignItems: 'center' }}>
          {track.locked ? <Lock size={11} /> : <Unlock size={11} />}
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: 'default' }} onClick={onBodyClick}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent ${zoom * 5 - 1}px, rgba(255,255,255,0.02) ${zoom * 5 - 1}px, rgba(255,255,255,0.02) ${zoom * 5}px)`,
        }} />
        {track.clips.map(clip => (
          <Clip key={clip.id} clip={clip} trackColor={track.color} zoom={zoom} scrollX={scrollX}
            selected={clip.id === selectedClipId} trackLocked={track.locked} />
        ))}
      </div>
    </div>
  )
}

const Timeline = () => {
  const { tracks, currentTime, duration, zoom, scrollX, selectedClipId, setZoom, setScrollX, setCurrentTime, addTrack, togglePlay, deleteSelected, activeTool } = useStore()
  const outerRef = useRef()
  const isDraggingPlayhead = useRef(false)

  useEffect(() => {
    const onKey = e => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
      const s = useStore.getState()
      if (e.code === 'Space') { e.preventDefault(); togglePlay() }
      if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected()
      if (e.key === 'Escape') s.clearSelection()
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); if (s.selectedClipId) s.duplicateClip(s.selectedClipId) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); s.stepFrame(-1) }
      if (e.key === 'ArrowRight') { e.preventDefault(); s.stepFrame(1) }
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) { e.preventDefault(); setZoom(zoom * 1.25) }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') { e.preventDefault(); setZoom(zoom * 0.8) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoom, togglePlay, deleteSelected, setZoom])

  const onWheel = useCallback(e => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      setZoom(zoom * (e.deltaY < 0 ? 1.12 : 0.89))
    } else {
      setScrollX(scrollX + e.deltaX + e.deltaY * 0.5)
    }
  }, [zoom, scrollX, setZoom, setScrollX])

  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  const seekAt = useCallback(clientX => {
    if (!outerRef.current) return
    const body = outerRef.current.querySelector('[data-clip-area]')
    if (!body) return
    const rect = body.getBoundingClientRect()
    const t = (clientX - rect.left + scrollX) / zoom
    setCurrentTime(Math.max(0, Math.min(t, duration)))
  }, [scrollX, zoom, duration, setCurrentTime])

  const playheadX = LABEL_W + currentTime * zoom - scrollX

  return (
    <div ref={outerRef} style={{ background: videoTheme.base, flexShrink: 0, display: 'flex', flexDirection: 'column', borderTop: `1px solid ${videoTheme.border}` }}>
      <div style={{ height: 28, background: videoTheme.side, borderBottom: `1px solid ${videoTheme.border}`, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 6 }}>
        <div style={{ width: LABEL_W, flexShrink: 0, display: 'flex', gap: 4, boxSizing: 'border-box' }}>
          {[['video', 'V'], ['audio', 'A'], ['text', 'T']].map(([type, lbl]) => (
            <button key={type} onClick={() => addTrack(type)}
              style={{
                padding: '1px 7px',
                borderRadius: 4,
                border: `1px solid ${videoTheme.border}`,
                background: videoTheme.el,
                color: videoTheme.textMuted,
                cursor: 'pointer',
                fontSize: 10,
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = videoTheme.textSecondary }}
              onMouseLeave={e => { e.currentTarget.style.color = videoTheme.textMuted }}
            >
              +{lbl}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 9, color: videoTheme.textMuted }}>Zoom</span>
        <input
          type="range"
          min={10}
          max={400}
          value={zoom}
          onChange={e => setZoom(+e.target.value)}
          style={{
            width: 70,
            WebkitAppearance: 'none',
            appearance: 'none',
            height: 2,
            background: videoTheme.border,
            borderRadius: 99,
            cursor: 'pointer',
            outline: 'none',
            accentColor: videoTheme.text,
          }}
        />
        <span style={{ fontSize: 9, color: videoTheme.textMuted, fontFamily: 'monospace', minWidth: 36 }}>{Math.round(zoom)}px/s</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, color: videoTheme.textMuted, fontFamily: 'monospace' }}>
          {tracks.flatMap(t => t.clips).length} clips · {tracks.length} tracks
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ width: LABEL_W, flexShrink: 0, height: RULER_H, background: videoTheme.side, borderRight: `1px solid ${videoTheme.border}`, borderBottom: `1px solid ${videoTheme.border}`, boxSizing: 'border-box' }} />
          <div
            data-ruler
            style={{ flex: 1, height: RULER_H, background: videoTheme.side, borderBottom: `1px solid ${videoTheme.border}`, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
            onMouseDown={e => {
              isDraggingPlayhead.current = true
              seekAt(e.clientX)
              const onMove = ev => { if (isDraggingPlayhead.current) seekAt(ev.clientX) }
              const onUp = () => { isDraggingPlayhead.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
              window.addEventListener('mousemove', onMove)
              window.addEventListener('mouseup', onUp)
            }}>
            {(() => {
              const step = zoom > 150 ? 1 : zoom > 60 ? 5 : zoom > 25 ? 10 : 30
              const marks = []
              for (let t = 0; t <= duration + step; t += step) {
                const x = t * zoom - scrollX
                if (x < -50 || x > 4000) continue
                marks.push(
                  <React.Fragment key={t}>
                    <div style={{ position: 'absolute', left: x, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
                    <span style={{ position: 'absolute', left: x + 3, top: 5, fontSize: 9, color: videoTheme.textMuted, fontFamily: 'monospace', pointerEvents: 'none', whiteSpace: 'nowrap' }}>{fmtTime(t)}</span>
                  </React.Fragment>
                )
              }
              return marks
            })()}
          </div>
        </div>

        <div data-clip-area style={{ maxHeight: TRACK_H * 3, overflowY: 'auto', overflowX: 'hidden' }}>
          {tracks.map(track => (
            <TrackRow key={track.id} track={track} zoom={zoom} scrollX={scrollX} selectedClipId={selectedClipId} />
          ))}
          {tracks.length === 0 && (
            <div style={{ color: videoTheme.textMuted, textAlign: 'center', padding: 20, fontSize: 12 }}>No tracks — click +V / +A / +T to add</div>
          )}
        </div>

        {playheadX >= LABEL_W && (
          <div style={{
            position: 'absolute',
            top: 0, bottom: 0,
            left: playheadX,
            width: 2,
            background: videoTheme.text,
            pointerEvents: 'none',
            zIndex: 100,
            boxShadow: '0 0 6px rgba(255,255,255,0.4)',
          }}>
            <div style={{ position: 'absolute', top: -1, left: -5, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `9px solid ${videoTheme.text}` }} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Timeline