// frontend/src/components/VideoPlayerMobile.jsx
// PowerStream Mobile-Optimized Video Player
// SUPER UPGRADE PACK - TV Player Mobile Fixes

import React, { useState, useRef, useEffect, memo, useCallback } from "react";

/**
 * Mobile-optimized video player with:
 * - Fullscreen support on iOS/Android
 * - Orientation switching
 * - 16:9 auto-scaling
 * - Touch-friendly controls
 * - Correct control visibility
 */
const VideoPlayerMobile = memo(function VideoPlayerMobile({
  src,
  poster,
  title = "",
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onError,
  className = "",
  style = {},
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto-hide controls after 3 seconds
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, resetControlsTimeout]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement === containerRef.current ||
        document.webkitFullscreenElement === containerRef.current
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Handle orientation change
  useEffect(() => {
    const handleOrientationChange = () => {
      // Force re-render on orientation change
      if (videoRef.current) {
        const video = videoRef.current;
        // Preserve playback state
        const wasPlaying = !video.paused;
        const currentPos = video.currentTime;
        
        // Small delay to let orientation settle
        setTimeout(() => {
          video.currentTime = currentPos;
          if (wasPlaying) video.play().catch(() => {});
        }, 100);
      }
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    screen.orientation?.addEventListener("change", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      screen.orientation?.removeEventListener("change", handleOrientationChange);
    };
  }, []);

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch((e) => {
        console.warn("[VideoPlayer] Play failed:", e);
        setError("Tap to play");
      });
    } else {
      video.pause();
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        // Enter fullscreen
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          await container.webkitRequestFullscreen();
        } else if (video?.webkitEnterFullscreen) {
          // iOS Safari - use video element's native fullscreen
          await video.webkitEnterFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (e) {
      console.warn("[VideoPlayer] Fullscreen toggle failed:", e);
    }
  }, [isFullscreen]);

  // Mute toggle
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  // Seek
  const handleSeek = useCallback((e) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || e.touches?.[0]?.clientX;
    const percent = (x - rect.left) / rect.width;
    video.currentTime = percent * duration;
    resetControlsTimeout();
  }, [duration, resetControlsTimeout]);

  // Skip forward/backward
  const skip = useCallback((seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
    resetControlsTimeout();
  }, [duration, resetControlsTimeout]);

  // Event handlers
  const handlePlay = () => {
    setIsPlaying(true);
    setError(null);
    onPlay?.();
  };

  const handlePause = () => {
    setIsPlaying(false);
    setShowControls(true);
    onPause?.();
  };

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
    onTimeUpdate?.(e);
  };

  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration);
    setIsLoading(false);
  };

  const handleWaiting = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);

  const handleError = (e) => {
    setError("Video unavailable");
    setIsLoading(false);
    onError?.(e);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setShowControls(true);
    onEnded?.();
  };

  // Format time (mm:ss)
  const formatTime = (time) => {
    if (!time || !isFinite(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`video-player-container ${className} ${isFullscreen ? "fullscreen" : ""}`}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        background: "#000",
        overflow: "hidden",
        borderRadius: isFullscreen ? 0 : "12px",
        ...style,
      }}
      onClick={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={isMuted}
        loop={loop}
        playsInline // Required for iOS inline playback
        webkit-playsinline="true"
        preload="metadata"
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onEnded={handleEnded}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />

      {/* Loading Spinner */}
      {isLoading && !error && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.5)",
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(255,255,255,0.3)",
            borderTopColor: "#ffb84d",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          onClick={togglePlay}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 48, marginBottom: 12 }}>▶</span>
          <span>{error}</span>
        </div>
      )}

      {/* Controls Overlay */}
      {controls && !error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: showControls
              ? "linear-gradient(transparent 60%, rgba(0,0,0,0.8))"
              : "transparent",
            opacity: showControls ? 1 : 0,
            transition: "opacity 0.3s ease",
            pointerEvents: showControls ? "auto" : "none",
          }}
        >
          {/* Title */}
          {title && showControls && (
            <div style={{
              position: "absolute",
              top: 12,
              left: 12,
              right: 12,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {title}
            </div>
          )}

          {/* Center Play/Pause Button */}
          <div
            onClick={togglePlay}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!isPlaying && showControls && (
              <div style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "rgba(255,184,77,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}>
                <span style={{ fontSize: 28, marginLeft: 4 }}>▶</span>
              </div>
            )}
          </div>

          {/* Skip Buttons (mobile touch areas) */}
          <div
            onClick={() => skip(-10)}
            onDoubleClick={() => skip(-10)}
            style={{
              position: "absolute",
              left: 0,
              top: "25%",
              bottom: "25%",
              width: "30%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
          <div
            onClick={() => skip(10)}
            onDoubleClick={() => skip(10)}
            style={{
              position: "absolute",
              right: 0,
              top: "25%",
              bottom: "25%",
              width: "30%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />

          {/* Bottom Controls */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            {/* Progress Bar */}
            <div
              onClick={handleSeek}
              onTouchStart={handleSeek}
              style={{
                height: 4,
                background: "rgba(255,255,255,0.3)",
                borderRadius: 2,
                cursor: "pointer",
                touchAction: "none",
              }}
            >
              <div style={{
                height: "100%",
                width: `${progress}%`,
                background: "#ffb84d",
                borderRadius: 2,
                transition: "width 0.1s",
              }} />
            </div>

            {/* Control Buttons Row */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}>
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                style={controlButtonStyle}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>

              {/* Time Display */}
              <span style={{
                color: "#fff",
                fontSize: 12,
                fontFamily: "monospace",
                minWidth: 80,
              }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Mute Toggle */}
              <button
                onClick={toggleMute}
                style={controlButtonStyle}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? "🔇" : "🔊"}
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                style={controlButtonStyle}
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? "⤓" : "⤢"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .video-player-container.fullscreen {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 9999 !important;
          border-radius: 0 !important;
        }
        
        .video-player-container.fullscreen video {
          object-fit: contain;
        }
        
        /* Landscape fullscreen */
        @media (orientation: landscape) and (max-height: 500px) {
          .video-player-container {
            aspect-ratio: auto;
            height: 100vh;
            height: 100dvh;
          }
        }
      `}</style>
    </div>
  );
});

const controlButtonStyle = {
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: 20,
  cursor: "pointer",
  padding: 8,
  minWidth: 44,
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  transition: "background 0.2s",
};

export default VideoPlayerMobile;










