import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize2 } from 'lucide-react';

const VideoPlayer = ({ video }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    return `${mins}:${secs.toString().padStart(2,'0')}`;
  };

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

    videoEl.addEventListener('timeupdate', updateProgress);
    videoEl.addEventListener('loadedmetadata', updateProgress);
    return () => {
      videoEl.removeEventListener('timeupdate', updateProgress);
      videoEl.removeEventListener('loadedmetadata', updateProgress);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.min(1, Math.max(0, x / rect.width));
    if (videoRef.current && duration) {
      videoRef.current.currentTime = percent * duration;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-black group" style={{ aspectRatio: '16/9', boxShadow: '0 8px 40px rgba(0,0,0,.6)' }}>
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      
      {/* Overlay controls (appear on hover) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <button onClick={togglePlay} className="pointer-events-auto w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors">
          {playing ? <Pause size={22} className="text-white" /> : <Play size={22} className="text-white ml-1" />}
        </button>
      </div>

      {/* Bottom control bar */}
      <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '48px 14px 12px' }}>
        <div className="pointer-events-auto relative h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer"
          onClick={handleSeek} role="slider" aria-label="Video progress">
          <div className="absolute inset-y-0 left-0 bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-3 text-white text-sm">
          <button onClick={togglePlay} className="hover:opacity-75">
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <Volume2 size={15} aria-hidden />
          <span className="tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <div className="flex-1" />
          <button onClick={handleFullscreen} className="hover:opacity-75">
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;