import { create } from 'zustand'

let seq = 0
const id = () => `${++seq}_${Date.now()}`

const track = (type, label, color) => ({
  id: id(),
  type,
  label,
  color,
  muted: false,
  locked: false,
  clips: []
})

export const useStore = create((set, get) => ({
  projectName: 'My Project',
  width: 1920,
  height: 1080,
  fps: 30,
  duration: 60,

  tracks: [
    track('video', 'Video', '#2563eb'),
    track('audio', 'Audio', '#16a34a'),
  ],

  currentTime: 0,
  playing: false,
  loop: false,
  playbackRate: 1,
  volume: 1,

  zoom: 80,
  scrollX: 0,
  activePanel: 'media',
  selectedClipId: null,
  activeTool: 'select',

  setProjectName: n => set({ projectName: n }),
  setSize: (w, h) => set({ width: w, height: h }),

  setCurrentTime: t => set(s => ({ currentTime: Math.max(0, Math.min(t, s.duration)) })),
  setPlaying: v => set({ playing: v }),
  togglePlay: () => set(s => ({ playing: !s.playing })),
  setVolume: v => set({ volume: Math.max(0, Math.min(1, v)) }),
  setLoop: v => set({ loop: v }),
  setPlaybackRate: r => set({ playbackRate: r }),
  stepFrame: dir => {
    const s = get()
    s.setCurrentTime(s.currentTime + dir / s.fps)
  },

  setZoom: z => set({ zoom: Math.max(10, Math.min(500, z)) }),
  setScrollX: x => set({ scrollX: Math.max(0, x) }),
  setActivePanel: p => set({ activePanel: p }),
  setActiveTool: t => set({ activeTool: t }),
  selectClip: id => set({ selectedClipId: id }),
  clearSelection: () => set({ selectedClipId: null }),

  addTrack: (type, label) => set(s => ({
    tracks: [...s.tracks, track(
      type,
      label || `${type} ${s.tracks.filter(t => t.type === type).length + 1}`,
      type === 'video' ? '#2563eb' : type === 'audio' ? '#16a34a' : type === 'text' ? '#d97706' : '#7c3aed'
    )]
  })),
  removeTrack: tid => set(s => ({ tracks: s.tracks.filter(t => t.id !== tid) })),
  muteTrack: tid => set(s => ({ tracks: s.tracks.map(t => t.id === tid ? { ...t, muted: !t.muted } : t) })),
  lockTrack: tid => set(s => ({ tracks: s.tracks.map(t => t.id === tid ? { ...t, locked: !t.locked } : t) })),

  addClip: (trackId, data) => {
    const track = get().tracks.find(t => t.id === trackId)
    if (!track) return null
    const endTime = track.clips.reduce((max, c) => Math.max(max, c.start + c.duration), 0)
    const clip = {
      id: id(),
      trackId,
      name: data.name || 'Clip',
      type: data.type || track.type,
      src: data.src || null,
      start: endTime,
      duration: data.duration || 5,
      offset: 0,
      volume: 1,
      muted: false,
      opacity: 1,
      speed: 1,
      filter: null,
      transIn: null,
      transOut: null,
      transInDur: 0.5,
      transOutDur: 0.5,
      waveform: data.waveform || null,
      overlayX: 50,
      overlayY: 50,
      overlayW: 40,
      overlayH: 20,
      text: data.text || 'Text',
      fontSize: data.fontSize || 72,
      fontFamily: data.fontFamily || 'Inter',
      fontWeight: data.fontWeight || '700',
      textColor: data.textColor || '#ffffff',
      textAlign: 'center',
      shapePath: data.shapePath || null,
      shapeColor: data.shapeColor || '#3b82f6',
      sticker: data.sticker || null,
      ...data,
    }
    set(s => ({
      tracks: s.tracks.map(t => t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t)
    }))
    return clip.id
  },

  updateClip: (clipId, patch) => set(s => ({
    tracks: s.tracks.map(t => ({
      ...t,
      clips: t.clips.map(c => c.id === clipId ? { ...c, ...patch } : c)
    }))
  })),

  removeClip: clipId => {
    set(s => ({
      tracks: s.tracks.map(t => ({ ...t, clips: t.clips.filter(c => c.id !== clipId) })),
      selectedClipId: s.selectedClipId === clipId ? null : s.selectedClipId,
    }))
  },

  splitClip: (clipId, time) => {
    const allClips = get().tracks.flatMap(t => t.clips)
    const c = allClips.find(x => x.id === clipId)
    if (!c) return
    const rel = time - c.start
    if (rel <= 0.05 || rel >= c.duration - 0.05) return
    get().updateClip(clipId, { duration: rel })
    get().addClip(c.trackId, {
      ...c,
      id: undefined,
      start: c.start + rel,
      duration: c.duration - rel,
      offset: c.offset + rel
    })
  },

  duplicateClip: clipId => {
    const c = get().tracks.flatMap(t => t.clips).find(x => x.id === clipId)
    if (c) get().addClip(c.trackId, { ...c, id: undefined, start: c.start + c.duration + 0.1 })
  },

  deleteSelected: () => {
    const { selectedClipId } = get()
    if (selectedClipId) get().removeClip(selectedClipId)
  },

  getSelectedClip: () => {
    const { selectedClipId, tracks } = get()
    if (!selectedClipId) return null
    return tracks.flatMap(t => t.clips).find(c => c.id === selectedClipId) || null
  },

  getClipsAtTime: t => get().tracks.flatMap(tr => tr.clips.filter(c => c.start <= t && c.start + c.duration > t)),
}))