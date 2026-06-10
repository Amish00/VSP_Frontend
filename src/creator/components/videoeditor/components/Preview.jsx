import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useStore } from '../store/store'
import { transitionCSS } from '../utils/constants'

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
    Object.assign(styles, transitionCSS(clip.transOut, 1 - p, 'in'))
  }
  return styles
}

function VideoEl({ clip, stageW, stageH, currentTime, playing, volume }) {
  const ref = useRef()
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const rel = currentTime - clip.start + (clip.offset || 0)
    if (Math.abs(v.currentTime - rel) > 0.25) v.currentTime = Math.max(0, rel)
  }, [currentTime])
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const active = currentTime >= clip.start && currentTime < clip.start + clip.duration
    if (playing && active) { v.play().catch(() => {}) }
    else { v.pause() }
  }, [playing, currentTime])
  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.volume = Math.min(1, (clip.volume ?? 1) * volume)
    v.muted = clip.muted ?? false
    if (clip.speed) v.playbackRate = clip.speed
  }, [clip.volume, clip.muted, clip.speed, volume])
  const ts = getTransStyle(clip, currentTime)
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: clip.opacity ?? 1, filter: clip.filter || 'none', ...ts, overflow: 'hidden' }}>
      <video ref={ref} src={clip.src} playsInline preload="auto" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  )
}

function ImageEl({ clip, currentTime }) {
  const ts = getTransStyle(clip, currentTime)
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: clip.opacity ?? 1, filter: clip.filter || 'none', ...ts }}>
      <img src={clip.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  )
}

function AudioEl({ clip, currentTime, playing, volume }) {
  const ref = useRef()
  useEffect(() => {
    const a = ref.current
    if (!a || !clip.src) return
    const rel = currentTime - clip.start + (clip.offset || 0)
    if (Math.abs(a.currentTime - rel) > 0.25) a.currentTime = Math.max(0, rel)
  }, [currentTime])
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
    content = (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 100 100" width={size} height={size} preserveAspectRatio="xMidYMid meet">
          <path d={SHAPE_PATHS[clip.shapePath || 'rect'] || SHAPE_PATHS.rect} fill={clip.shapeColor || '#3b82f6'} />
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

const Preview = () => {
  const { tracks, currentTime, playing, volume, width, height, selectedClipId, selectClip, updateClip } = useStore()
  const containerRef = useRef()
  const [stage, setStage] = useState({ w: 640, h: 360 })

  useEffect(() => {
    const obs = new ResizeObserver(([e]) => {
      const { width: cw, height: ch } = e.contentRect
      const aspect = width / height
      const sw = Math.min(cw - 24, (ch - 24) * aspect)
      const sh = sw / aspect
      setStage({ w: Math.max(1, Math.floor(sw)), h: Math.max(1, Math.floor(sh)) })
    })
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [width, height])

  const activeLayers = tracks
    .filter(t => !t.muted)
    .flatMap(t => t.clips.filter(c => currentTime >= c.start && currentTime < c.start + c.duration))

  const mediaLayers = activeLayers.filter(c => c.type === 'video' || c.type === 'image')
  const overlayLayers = activeLayers.filter(c => c.type === 'text' || c.type === 'shape' || c.type === 'sticker')
  const audioClips = tracks.filter(t => !t.muted).flatMap(t => t.clips.filter(c => c.type === 'audio' && c.src))

  const hasContent = mediaLayers.length > 0 || overlayLayers.length > 0

  return (
    <div ref={containerRef}
      style={{ flex: 1, background: '#181818', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', minHeight: 0 }}>
      <div
        style={{ width: stage.w, height: stage.h, background: '#000', position: 'relative', overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.8)' }}
        onMouseDown={e => { if (e.target === e.currentTarget) selectClip(null) }}>
        {mediaLayers.map(clip =>
          clip.type === 'video'
            ? <VideoEl key={clip.id} clip={clip} stageW={stage.w} stageH={stage.h} currentTime={currentTime} playing={playing} volume={volume} />
            : <ImageEl key={clip.id} clip={clip} currentTime={currentTime} />
        )}
        {overlayLayers.map(clip => (
          <OverlayEl key={clip.id} clip={clip} stageW={stage.w} stageH={stage.h}
            currentTime={currentTime}
            selected={clip.id === selectedClipId}
            onSelect={() => selectClip(clip.id)}
            onUpdate={patch => updateClip(clip.id, patch)} />
        ))}
        {!hasContent && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#2a2a2a', userSelect: 'none' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>▶</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Import media or add text/shapes</div>
          </div>
        )}
      </div>

      {audioClips.map(clip => (
        <AudioEl key={clip.id} clip={clip} currentTime={currentTime} playing={playing} volume={volume} />
      ))}

      <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.65)', color: '#888', padding: '2px 10px', borderRadius: 5, fontSize: 11, fontFamily: 'monospace', letterSpacing: 1, pointerEvents: 'none' }}>
        {String(Math.floor(currentTime / 60)).padStart(2, '0')}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}.{String(Math.floor((currentTime % 1) * 100)).padStart(2, '0')}
      </div>

      <div style={{ position: 'absolute', top: 8, right: 12, background: 'rgba(0,0,0,0.5)', color: '#333', padding: '2px 7px', borderRadius: 4, fontSize: 9, fontFamily: 'monospace', pointerEvents: 'none' }}>
        {width}×{height}
      </div>
    </div>
  )
}

export default Preview