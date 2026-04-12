// frontend/src/components/tv/LivePlayer.jsx
// HLS video player with react-player and hls.js fallback

import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';

export default function LivePlayer({
  url,
  poster,
  title,
  isLive = false,
  autoPlay = false,
  muted = false,
  onViewerCount,
  onEnded,
  className = '',
}) {
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [playerMuted, setPlayerMuted] = useState(muted);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  // Check if URL is HLS
  const isHLS = url?.includes('.m3u8');

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.() ||
      containerRef.current.webkitRequestFullscreen?.() ||
      containerRef.current.msRequestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.() ||
      document.webkitExitFullscreen?.() ||
      document.msExitFullscreen?.();
      setFullscreen(false);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle progress
  const handleProgress = (state) => {
    if (!isLive) {
      setProgress(state.played * 100);
    }
  };

  // Handle seek
  const handleSeek = (e) => {
    if (isLive || !playerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    playerRef.current.seekTo(percent);
    setProgress(percent * 100);
  };

  if (!url) {
    return (
      <div className={`tv-player tv-player--empty ${className}`}>
        <div className="tv-player-placeholder">
          <span className="tv-player-placeholder-icon">📺</span>
          <p>No stream available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`tv-player ${fullscreen ? 'tv-player--fullscreen' : ''} ${className}`}
    >
      {/* Video */}
      <div className="tv-player-video">
        <ReactPlayer
          ref={playerRef}
          url={url}
          playing={playing}
          muted={playerMuted}
          volume={volume}
          width="100%"
          height="100%"
          onReady={() => setLoading(false)}
          onBuffer={() => setLoading(true)}
          onBufferEnd={() => setLoading(false)}
          onProgress={handleProgress}
          onDuration={(d) => setDuration(d)}
          onEnded={onEnded}
          onError={(e) => setError('Failed to load video')}
          config={{
            file: {
              forceHLS: isHLS,
              attributes: {
                poster: poster,
                crossOrigin: 'anonymous',
              },
            },
          }}
        />

        {/* Loading overlay */}
        {loading && (
          <div className="tv-player-loading">
            <div className="tv-player-spinner"></div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="tv-player-error">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={() => { setError(null); setPlaying(true); }}>
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="tv-player-controls">
        {/* Play/Pause */}
        <button 
          className="tv-player-btn tv-player-btn--play"
          onClick={() => setPlaying(!playing)}
        >
          {playing ? '⏸' : '▶'}
        </button>

        {/* Progress bar (not for live) */}
        {!isLive && (
          <div className="tv-player-progress" onClick={handleSeek}>
            <div className="tv-player-progress-bar">
              <div 
                className="tv-player-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="tv-player-time">
              {formatTime((progress / 100) * duration)} / {formatTime(duration)}
            </span>
          </div>
        )}

        {/* Live indicator */}
        {isLive && (
          <div className="tv-player-live-badge">
            <span className="tv-live-dot"></span>
            LIVE
          </div>
        )}

        {/* Title */}
        {title && (
          <span className="tv-player-title">{title}</span>
        )}

        {/* Spacer */}
        <div className="tv-player-spacer"></div>

        {/* Volume */}
        <div className="tv-player-volume">
          <button 
            className="tv-player-btn"
            onClick={() => setPlayerMuted(!playerMuted)}
          >
            {playerMuted || volume === 0 ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={playerMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setPlayerMuted(false);
            }}
            className="tv-player-volume-slider"
          />
        </div>

        {/* Fullscreen */}
        <button 
          className="tv-player-btn"
          onClick={toggleFullscreen}
        >
          {fullscreen ? '⊙' : '⛶'}
        </button>
      </div>

      {/* Poster overlay when not playing */}
      {!playing && poster && !loading && (
        <div 
          className="tv-player-poster"
          onClick={() => setPlaying(true)}
        >
          <img src={poster} alt="" />
          <div className="tv-player-poster-play">
            <span>▶</span>
          </div>
        </div>
      )}
    </div>
  );
}

