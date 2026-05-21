import { useEffect, useRef } from 'react'
import { useStore } from '../store/store'

export function usePlayback() {
  const playing = useStore(s => s.playing)
  const raf = useRef(null)
  const last = useRef(null)

  useEffect(() => {
    const stop = () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current)
        raf.current = null
      }
      last.current = null
    }

    if (!playing) {
      stop()
      return stop
    }

    const tick = ts => {
      const s = useStore.getState()
      if (!s.playing) {
        stop()
        return
      }
      if (last.current === null) {
        last.current = ts
        raf.current = requestAnimationFrame(tick)
        return
      }
      const dt = (ts - last.current) / 1000
      last.current = ts
      const next = s.currentTime + dt * s.playbackRate
      if (next >= s.duration) {
        if (s.loop) {
          s.setCurrentTime(0)
        } else {
          s.setPlaying(false)
          s.setCurrentTime(s.duration)
        }
      } else {
        s.setCurrentTime(next)
      }
      raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    return stop
  }, [playing])
}