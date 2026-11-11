import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface CustomVideoPlayerProps {
  src: string;
  title: string;
  aspectClass?: string;
  autoPlayWithSound?: boolean;
}

export function CustomVideoPlayer({
  src,
  title,
  aspectClass = 'aspect-square',
  autoPlayWithSound = true,
}: CustomVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [skipNotice, setSkipNotice] = useState<string | null>(null);

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNoticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-play when opened
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = isMuted ? 0 : volume;

    if (autoPlayWithSound) {
      // Browser autoplay policy might require user gesture or catch promise
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // If sound was blocked by browser, try muted autoplay
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          });
      }
    }
  }, [src, autoPlayWithSound]);

  // Keep volume in sync
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Controls visibility timer
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);

    setSkipNotice(seconds > 0 ? `+${seconds}s` : `${seconds}s`);
    if (skipNoticeTimeoutRef.current) clearTimeout(skipNoticeTimeoutRef.current);
    skipNoticeTimeoutRef.current = setTimeout(() => setSkipNotice(null), 800);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSkip(-5);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSkip(5);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume((v) => Math.min(1, v + 0.1));
        setIsMuted(false);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume((v) => Math.max(0, v - 0.1));
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration, isPlaying, volume, isMuted]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`group/player relative w-full ${aspectClass} max-h-[70vh] mx-auto rounded-2xl overflow-hidden bg-black select-none shadow-[0_0_50px_rgba(0,0,0,0.9)]`}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={src}
        playsInline
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="w-full h-full object-contain cursor-pointer bg-black"
      />

      {/* Floating Skip Notification Ripple */}
      {skipNotice && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="px-5 py-2.5 rounded-2xl bg-black/80 border border-white/20 text-white font-mono text-sm tracking-wider shadow-[0_0_30px_rgba(255,255,255,0.3)] animate-pulse backdrop-blur-md">
            {skipNotice}
          </div>
        </div>
      )}

      {/* Click-to-Play Center Overlay (shown when paused) */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer z-20 transition-opacity"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/15 border border-white/40 flex items-center justify-center text-white shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-110 hover:bg-white hover:text-black transition-all">
            <Play className="w-7 h-7 md:w-8 md:h-8 fill-current ml-1" />
          </div>
        </div>
      )}

      {/* Top Bar (Title & Quick Info) */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 transition-opacity duration-300 pointer-events-none flex items-center justify-between ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="text-xs font-mono text-white/80 tracking-wider truncate drop-shadow-md">
          {title}
        </span>
        <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">
          1080p HD
        </span>
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 pt-8 bg-gradient-to-t from-black/95 via-black/80 to-transparent z-20 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {/* Progress / Timeline Scrubber Bar */}
        <div className="relative mb-3 flex items-center group/timeline">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.01}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:h-2.5 transition-all"
            style={{
              background: `linear-gradient(to right, #ffffff ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
            }}
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            {/* Play / Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white hover:text-black border border-white/20 flex items-center justify-center transition-all cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Skip Backward 5s */}
            <button
              type="button"
              onClick={() => handleSkip(-5)}
              title="Skip back 5s (Left Arrow)"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white hover:text-black border border-white/20 flex items-center justify-center transition-all cursor-pointer relative group/btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="absolute -bottom-4 text-[9px] font-mono opacity-0 group-hover/btn:opacity-100 transition-opacity">
                -5s
              </span>
            </button>

            {/* Skip Forward 5s */}
            <button
              type="button"
              onClick={() => handleSkip(5)}
              title="Skip forward 5s (Right Arrow)"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white hover:text-black border border-white/20 flex items-center justify-center transition-all cursor-pointer relative group/btn"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="absolute -bottom-4 text-[9px] font-mono opacity-0 group-hover/btn:opacity-100 transition-opacity">
                +5s
              </span>
            </button>

            {/* Time Readout */}
            <div className="text-xs font-mono text-white/70 ml-1">
              <span className="text-white font-medium">{formatTime(currentTime)}</span>
              <span className="text-white/40 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Volume Control Group */}
            <div className="flex items-center gap-2 group/volume">
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white hover:text-black border border-white/20 flex items-center justify-center transition-all cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-white/60 group-hover/volume:text-black" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {/* Volume Slider (expands smoothly on hover) */}
              <div className="w-16 md:w-20 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:h-2 transition-all"
                  style={{
                    background: `linear-gradient(to right, #ffffff ${
                      (isMuted ? 0 : volume) * 100
                    }%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)`,
                  }}
                  title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                />
              </div>

              <span className="text-[10px] font-mono text-white/50 w-7 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white hover:text-black border border-white/20 flex items-center justify-center transition-all cursor-pointer"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
