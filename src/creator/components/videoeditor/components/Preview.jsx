import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useStore } from '../store/store'
import { transitionCSS, EFFECTS, SHAPES } from '../utils/constants'
import { videoTheme } from '../theme'

// Helper: get filter CSS from EFFECTS
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

// ---------- Video Element ----------
function VideoEl({ clip, stageW, stageH, currentTime, playing, volume, onSelect }) {
  const ref = useRef()
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const rel = currentTime - clip.start + (clip.offset || 0)
    if (Math.abs(v.currentTime - rel) > 0.25) v.currentTime = Math.max(0, rel)
  }, [currentTime, clip])
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const active = currentTime >= clip.start && currentTime < clip.start + clip.duration
    if (playing && active) { v.play().catch(() => {}) }
    else { v.pause() }
  }, [playing, currentTime, clip])
  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.volume = Math.min(1, (clip.volume ?? 1) * volume)
    v.muted = clip.muted ?? false
    if (clip.speed) v.playbackRate = clip.speed
  }, [clip.volume, clip.muted, clip.speed, volume])

  const filterCss = getFilterCss(clip.filter)
  const ts = getTransStyle(clip, currentTime)

  // FIX: select clip on click
  const handleClick = (e) => {
    e.stopPropagation()
    onSelect()
  }

  return (
    <div
      style={{ position: 'absolute', inset: 0, opacity: clip.opacity ?? 1, filter: filterCss, ...ts, overflow: 'hidden', cursor: 'pointer' }}
      onClick={handleClick}
    >
      <video ref={ref} src={clip.src} playsInline preload="auto" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  )
}

// ---------- Image Element ----------
function ImageEl({ clip, currentTime, onSelect }) {
  const filterCss = getFilterCss(clip.filter)
  const ts = getTransStyle(clip, currentTime)

  const handleClick = (e) => {
    e.stopPropagation()
    onSelect()
  }

  return (
    <div
      style={{ position: 'absolute', inset: 0, opacity: clip.opacity ?? 1, filter: filterCss, ...ts, cursor: 'pointer' }}
      onClick={handleClick}
    >
      <img src={clip.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  )
}

// ---------- Audio Element (hidden) ----------
function AudioEl({ clip, currentTime, playing, volume }) {
  const ref = useRef()
  useEffect(() => {
    const a = ref.current
    if (!a || !clip.src) return
    const rel = currentTime - clip.start + (clip.offset || 0)
    if (Math.abs(a.currentTime - rel) > 0.25) a.currentTime = Math.max(0, rel)
  }, [currentTime, clip])
  useEffect(() => {
    const a = ref.current
    if (!a || !clip.src) return
    const active = currentTime >= clip.start && currentTime < clip.start + clip.duration
    if (playing && active && !clip.muted) { a.play().catch(() => {}) }
    else { a.pause() }
  }, [playing, currentTime, clip.muted])
  useEffect(() => {
    const a = ref.current
    if (!a) return
    a.volume = Math.min(1, (clip.volume ?? 1) * volume)
  }, [clip.volume, volume])
  if (!clip.src) return null
  return <audio ref={ref} src={clip.src} preload="auto" style={{ display: 'none' }} />
}

// ---------- Overlay Element ----------
function OverlayEl({ clip, stageW, stageH, currentTime, selected, onSelect, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(clip.text || '')
  const inputRef = useRef(null)

  const ts = getTransStyle(clip, currentTime)
  const x = ((clip.overlayX ?? 50) / 100) * stageW
  const y = ((clip.overlayY ?? 50) / 100) * stageH
  const w = ((clip.overlayW ?? 40) / 100) * stageW
  const h = ((clip.overlayH ?? 20) / 100) * stageH
  const scale = stageW / 1920

  const onMouseDown = useCallback(e => {
    if (e.button !== 0 || isEditing) return
    e.stopPropagation()
    onSelect()
    const startX = e.clientX, startY = e.clientY
    const ox = clip.overlayX ?? 50, oy = clip.overlayY ?? 50
    const onMove = ev => {
      const dx = (ev.clientX - startX) / stageW * 100
      const dy = (ev.clientY - startY) / stageH * 100
      onUpdate({ overlayX: Math.max(0, Math.min(100, ox + dx)), overlayY: Math.max(0, Math.min(100, oy + dy)) })
    }
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [clip, stageW, stageH, onSelect, onUpdate, isEditing])

  const onResizeDown = useCallback(e => {
    if (isEditing) return
    e.stopPropagation()
    const startX = e.clientX, startY = e.clientY
    const ow = clip.overlayW ?? 40, oh = clip.overlayH ?? 20
    const onMove = ev => {
      const dw = (ev.clientX - startX) / stageW * 100
      const dh = (ev.clientY - startY) / stageH * 100
      onUpdate({ overlayW: Math.max(5, ow + dw), overlayH: Math.max(3, oh + dh) })
    }
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [clip, stageW, stageH, onUpdate, isEditing])

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    if (clip.type === 'text') {
      setIsEditing(true)
      setEditValue(clip.text || '')
    }
  }

  const saveEdit = () => {
    if (isEditing) {
      onUpdate({ text: editValue })
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditValue(clip.text || '')
    }
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  let content
  if (clip.type === 'text') {
    if (isEditing) {
      content = (
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleKeyDown}
          style={{
            fontFamily: clip.fontFamily || 'Inter',
            fontSize: (clip.fontSize || 72) * scale,
            fontWeight: clip.fontWeight || '700',
            color: clip.textColor || '#fff',
            textAlign: clip.textAlign || 'center',
            lineHeight: 1.2,
            background: 'rgba(0,0,0,0.7)',
            border: '1px solid #fff',
            borderRadius: 4,
            padding: '4px 8px',
            width: '100%',
            height: '100%',
            resize: 'none',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      )
    } else {
      content = (
        <div onDoubleClick={handleDoubleClick} style={{
          fontFamily: clip.fontFamily || 'Inter',
          fontSize: (clip.fontSize || 72) * scale,
          fontWeight: clip.fontWeight || '700',
          color: clip.textColor || '#fff',
          textAlign: clip.textAlign || 'center',
          lineHeight: 1.2,
          textShadow: '0 2px 8px rgba(0,0,0,0.6)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          userSelect: 'none',
          width: '100%',
          cursor: 'text',
          pointerEvents: selected ? 'auto' : 'none',
        }}>
          {clip.text || 'Text'}
        </div>
      )
    }
  } else if (clip.type === 'shape') {
    const size = Math.min(w, h)
    const shapeDef = SHAPES.find(s => s.id === clip.shapePath)
    const pathData = shapeDef?.d || SHAPES[0].d
    content = (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 100 100" width={size} height={size} preserveAspectRatio="xMidYMid meet">
          <path d={pathData} fill={clip.shapeColor || '#3b82f6'} />
        </svg>
      </div>
    )
  } else if (clip.type === 'sticker') {
    content = (
      <div style={{ fontSize: Math.min(w, h) * 0.8, lineHeight: 1, userSelect: 'none', textAlign: 'center' }}>
        {clip.sticker || '⭐'}
      </div>
    )
  }

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h / 2,
        width: w, height: h,
        cursor: isEditing ? 'text' : 'move',
        opacity: clip.opacity ?? 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...ts,
      }}>
      {content}
      {selected && !isEditing && (
        <>
          <div style={{ position: 'absolute', inset: -2, border: '1.5px solid rgba(255,255,255,0.9)', borderRadius: 3, pointerEvents: 'none' }} />
          <div onMouseDown={onResizeDown}
            style={{ position: 'absolute', bottom: -5, right: -5, width: 11, height: 11, background: '#fff', border: '2px solid #555', borderRadius: '50%', cursor: 'se-resize', zIndex: 10 }} />
        </>
      )}
    </div>
  )
}

// ---------- Main Preview Component ----------
const Preview = () => {
  const {
    tracks,
    currentTime,
    playing,
    volume,
    width,
    height,
    selectedClipId,
    selectClip,
    updateClip,
    previewZoom,
    setPreviewZoom,
    resetPreviewZoom,
  } = useStore()

  const containerRef = useRef()
  const [stage, setStage] = useState({ w: 640, h: 360 })

  useEffect(() => {
    const obs = new ResizeObserver(([e]) => {
      const { width: cw, height: ch } = e.contentRect
      const aspect = width / height
      const pad = 60
      const availableW = Math.max(100, cw - pad)
      const availableH = Math.max(100, ch - pad)
      const sw = Math.min(availableW, availableH * aspect)
      const sh = sw / aspect
      setStage({ w: Math.max(1, Math.floor(sw)), h: Math.max(1, Math.floor(sh)) })
    })
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [width, height])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault()
        setPreviewZoom(Math.min(3, previewZoom + 0.1))
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        setPreviewZoom(Math.max(0.1, previewZoom - 0.1))
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        resetPreviewZoom()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previewZoom, setPreviewZoom, resetPreviewZoom])

  const activeLayers = tracks
    .filter(t => !t.muted)
    .flatMap(t => t.clips.filter(c => currentTime >= c.start && currentTime < c.start + c.duration))

  const mediaLayers = activeLayers.filter(c => c.type === 'video' || c.type === 'image')
  const overlayLayers = activeLayers.filter(c => c.type === 'text' || c.type === 'shape' || c.type === 'sticker')
  const audioClips = tracks.filter(t => !t.muted).flatMap(t => t.clips.filter(c => c.type === 'audio' && c.src))

  const hasContent = mediaLayers.length > 0 || overlayLayers.length > 0

  const handleZoomIn = () => setPreviewZoom(Math.min(3, previewZoom + 0.1))
  const handleZoomOut = () => setPreviewZoom(Math.max(0.1, previewZoom - 0.1))

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        background: videoTheme.base,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        minHeight: 0,
      }}
    >
      <div
        style={{
          width: stage.w,
          height: stage.h,
          background: '#000',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: `0 0 0 1px ${videoTheme.border}, 0 20px 60px rgba(0,0,0,0.8)`,
          transform: `scale(${previewZoom})`,
          transformOrigin: 'center center',
        }}
        onMouseDown={e => { if (e.target === e.currentTarget) selectClip(null) }}
      >
        {mediaLayers.map(clip =>
          clip.type === 'video'
            ? <VideoEl key={clip.id} clip={clip} stageW={stage.w} stageH={stage.h} currentTime={currentTime} playing={playing} volume={volume} onSelect={() => selectClip(clip.id)} />
            : <ImageEl key={clip.id} clip={clip} currentTime={currentTime} onSelect={() => selectClip(clip.id)} />
        )}
        {overlayLayers.map(clip => (
          <OverlayEl
            key={clip.id}
            clip={clip}
            stageW={stage.w}
            stageH={stage.h}
            currentTime={currentTime}
            selected={clip.id === selectedClipId}
            onSelect={() => selectClip(clip.id)}
            onUpdate={patch => updateClip(clip.id, patch)}
          />
        ))}
        {!hasContent && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: videoTheme.textMuted,
              userSelect: 'none',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>▶</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Import media or add text/shapes</div>
          </div>
        )}
      </div>

      {audioClips.map(clip => (
        <AudioEl key={clip.id} clip={clip} currentTime={currentTime} playing={playing} volume={volume} />
      ))}

      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.65)',
          color: videoTheme.textMuted,
          padding: '2px 10px',
          borderRadius: 5,
          fontSize: 11,
          fontFamily: 'monospace',
          letterSpacing: 1,
          pointerEvents: 'none',
        }}
      >
        {String(Math.floor(currentTime / 60)).padStart(2, '0')}:
        {String(Math.floor(currentTime % 60)).padStart(2, '0')}.
        {String(Math.floor((currentTime % 1) * 100)).padStart(2, '0')}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 12,
          background: 'rgba(0,0,0,0.5)',
          color: videoTheme.textMuted,
          padding: '2px 7px',
          borderRadius: 4,
          fontSize: 9,
          fontFamily: 'monospace',
          pointerEvents: 'none',
        }}
      >
        {width}×{height}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 14,
          right: 14,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          background: 'rgba(0,0,0,0.7)',
          padding: '4px 8px',
          borderRadius: 8,
          backdropFilter: 'blur(4px)',
          border: `1px solid ${videoTheme.border}`,
        }}
      >
        <button
          onClick={handleZoomOut}
          style={{
            background: 'transparent',
            border: 'none',
            color: videoTheme.textSecondary,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            padding: '2px 6px',
            lineHeight: 1,
          }}
          onMouseEnter={e => e.currentTarget.style.color = videoTheme.text}
          onMouseLeave={e => e.currentTarget.style.color = videoTheme.textSecondary}
        >
          −
        </button>
        <span
          style={{
            color: videoTheme.text,
            fontSize: 11,
            fontFamily: 'monospace',
            minWidth: 42,
            textAlign: 'center',
          }}
        >
          {Math.round(previewZoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          style={{
            background: 'transparent',
            border: 'none',
            color: videoTheme.textSecondary,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            padding: '2px 6px',
            lineHeight: 1,
          }}
          onMouseEnter={e => e.currentTarget.style.color = videoTheme.text}
          onMouseLeave={e => e.currentTarget.style.color = videoTheme.textSecondary}
        >
          +
        </button>
        <button
          onClick={resetPreviewZoom}
          style={{
            background: 'transparent',
            border: 'none',
            color: videoTheme.textMuted,
            cursor: 'pointer',
            fontSize: 10,
            padding: '2px 6px',
            borderRadius: 4,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = videoTheme.hov; e.currentTarget.style.color = videoTheme.text }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = videoTheme.textMuted }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default Preview