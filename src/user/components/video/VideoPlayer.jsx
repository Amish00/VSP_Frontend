import React, { useRef, useState, useEffect, useCallback } from 'react';
import api from '../../api/Api';
import {
  Play, Pause, Volume2, VolumeX, Maximize2, Download, PictureInPicture, Gauge,
  SkipBack, SkipForward
} from 'lucide-react';

const VideoPlayer = ({ video, onViewRecorded }) => {
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const watchStartTimeRef = useRef(null);  
  const viewRecordedRef = useRef(false);       
  const VIEW_THRESHOLD = 30;                  

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [buffering, setBuffering] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [hoverProgress, setHoverProgress] = useState(null);
  const [hoverTime, setHoverTime] = useState(null);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => setControlsVisible(false), 2500);
    } else {
      setControlsVisible(true);
    }
  }, [playing]);

  const showControls = () => {
    setControlsVisible(true);
    resetControlsTimeout();
  };

  const recordViewOnce = useCallback(async () => {
    if (viewRecordedRef.current) return;
    viewRecordedRef.current = true;
    try {
      await api.post('/engagement/view', { videoId: video.id });
      onViewRecorded?.();
      console.log('View recorded for video', video.id);
    } catch (err) {
      console.error('Failed to record view', err);
    }
  }, [video.id, onViewRecorded]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleTimeUpdate = () => {
      if (playing && !viewRecordedRef.current) {
        if (watchStartTimeRef.current === null) {
          watchStartTimeRef.current = videoEl.currentTime;
        }
        const elapsed = videoEl.currentTime - watchStartTimeRef.current;
        if (elapsed >= VIEW_THRESHOLD || videoEl.currentTime >= videoEl.duration - 0.5) {
          recordViewOnce();
        }
      } else if (!playing) {
        watchStartTimeRef.current = null;
      }
    };

    const handleEnded = () => {
      if (!viewRecordedRef.current) {
        recordViewOnce();
      }
      setPlaying(false);
    };

    videoEl.addEventListener('timeupdate', handleTimeUpdate);
    videoEl.addEventListener('ended', handleEnded);

    return () => {
      videoEl.removeEventListener('timeupdate', handleTimeUpdate);
      videoEl.removeEventListener('ended', handleEnded);
    };
  }, [playing, recordViewOnce]);

  useEffect(() => {
    viewRecordedRef.current = false;
    watchStartTimeRef.current = null;
  }, [video.id]);


  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const updateProgress = () => {
      if (videoEl.duration) {
        setCurrentTime(videoEl.currentTime);
        setProgress((videoEl.currentTime / videoEl.duration) * 100);
        setDuration(videoEl.duration);
      }
    };

    const handleBuffering = () => setBuffering(videoEl.readyState < 3);
    const handleCanPlay = () => setBuffering(false);

    videoEl.addEventListener('timeupdate', updateProgress);
    videoEl.addEventListener('loadedmetadata', updateProgress);
    videoEl.addEventListener('waiting', handleBuffering);
    videoEl.addEventListener('canplay', handleCanPlay);

    return () => {
      videoEl.removeEventListener('timeupdate', updateProgress);
      videoEl.removeEventListener('loadedmetadata', updateProgress);
      videoEl.removeEventListener('waiting', handleBuffering);
      videoEl.removeEventListener('canplay', handleCanPlay);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [playing, resetControlsTimeout]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) videoRef.current.pause();
      else videoRef.current.play();
      setPlaying(!playing);
      showControls();
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.min(1, Math.max(0, x / rect.width));
    if (videoRef.current && duration) {
      videoRef.current.currentTime = percent * duration;
      showControls();
    }
  };

  const handleProgressHover = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.min(1, Math.max(0, x / rect.width));
    setHoverProgress(percent * 100);
    if (duration) setHoverTime(percent * duration);
  };

  const handleProgressLeave = () => {
    setHoverProgress(null);
    setHoverTime(null);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMuted(val === 0);
  };

  const toggleMute = () => {
    setMuted(!muted);
    showControls();
  };

  const handleFullscreen = () => {
    if (videoRef.current) videoRef.current.requestFullscreen?.();
  };

  const handlePictureInPicture = async () => {
    if (videoRef.current) {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await videoRef.current.requestPictureInPicture();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = video.videoUrl;
    link.download = video.title?.replace(/[^a-z0-9]/gi, '_') || 'video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    showControls();
  };

  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      showControls();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'button' || tag === 'a') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          setMuted(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          setMuted(volume - 0.1 <= 0);
          break;
        case 'KeyF':
          e.preventDefault();
          handleFullscreen();
          break;
        case 'KeyP':
          e.preventDefault();
          handlePictureInPicture();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, togglePlay, handleFullscreen, handlePictureInPicture]);

  // ----- Render (unchanged) -----
  return (
    <div
      className="relative rounded-xl overflow-hidden bg-black group"
      style={{ aspectRatio: '16/9', boxShadow: '0 8px 40px rgba(0,0,0,.6)' }}
      onMouseMove={showControls}
      onMouseLeave={() => {
        if (playing) setControlsVisible(false);
        else setControlsVisible(true);
      }}
    >
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={togglePlay}
          className="pointer-events-auto w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors"
        >
          {playing ? <Pause size={22} className="text-white" /> : <Play size={22} className="text-white ml-1" />}
        </button>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 transition-opacity duration-200 pointer-events-none ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', padding: '48px 14px 12px' }}
      >
        <div className="pointer-events-auto">
          <div
            className="relative h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer group/progress"
            onClick={handleSeek}
            onMouseMove={handleProgressHover}
            onMouseLeave={handleProgressLeave}
          >
            <div className="absolute inset-y-0 left-0 bg-primary rounded-full" style={{ width: `${progress}%` }} />
            {hoverProgress !== null && (
              <>
                <div className="absolute top-0 h-full w-0.5 bg-white rounded-full" style={{ left: `${hoverProgress}%` }} />
                <div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                  style={{ left: `calc(${hoverProgress}% + 4px)` }}
                >
                  {formatTime(hoverTime)}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-white text-sm">
            <button onClick={togglePlay} className="hover:opacity-75">
              {playing ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <button onClick={() => skip(-10)} className="hover:opacity-75">
              <SkipBack size={14} />
            </button>
            <button onClick={() => skip(10)} className="hover:opacity-75">
              <SkipForward size={14} />
            </button>

            <div className="flex items-center gap-1.5 group/volume">
              <button onClick={toggleMute} className="hover:opacity-75">
                {muted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-white/20 rounded-full accent-primary cursor-pointer"
              />
            </div>

            <span className="tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>

            <button onClick={changePlaybackRate} className="hover:opacity-75 flex items-center gap-1">
              <Gauge size={14} />
              <span className="text-xs font-mono">{playbackRate}x</span>
            </button>

            <div className="flex-1" />

            {document.pictureInPictureEnabled && (
              <button onClick={handlePictureInPicture} className="hover:opacity-75">
                <PictureInPicture size={15} />
              </button>
            )}
            <button onClick={handleDownload} className="hover:opacity-75">
              <Download size={15} />
            </button>
            <button onClick={handleFullscreen} className="hover:opacity-75">
              <Maximize2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;