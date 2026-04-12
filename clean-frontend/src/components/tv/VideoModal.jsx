// frontend/src/components/tv/VideoModal.jsx
// Video details modal with play functionality

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LivePlayer from './LivePlayer.jsx';
import { formatViews, formatRelativeTime, formatDuration } from './tvUtils.js';

export default function VideoModal({
  video,
  station,
  onClose,
  onPlay,
  showVoting = false,
  onVote,
}) {
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!video) return null;

  const videoUrl = video.hls_url || video.video_url;

  const handlePlay = () => {
    if (onPlay) {
      onPlay(video);
    } else {
      setPlaying(true);
    }
  };

  return (
    <div className="tv-modal-overlay" onClick={onClose}>
      <div className="tv-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="tv-modal-close" onClick={onClose}>×</button>

        {/* Video player or poster */}
        <div className="tv-modal-media">
          {playing && videoUrl ? (
            <LivePlayer
              url={videoUrl}
              poster={video.thumb_url}
              title={video.title}
              isLive={video.is_live}
              autoPlay={true}
              onEnded={() => setPlaying(false)}
            />
          ) : (
            <div className="tv-modal-poster" onClick={handlePlay}>
              {!imageLoaded && (
                <div className="tv-modal-poster-placeholder">
                  <span>📺</span>
                </div>
              )}
              <img
                src={video.thumb_url || '/images/tv-default-thumb.jpg'}
                alt={video.title}
                className={`tv-modal-poster-img ${imageLoaded ? 'tv-modal-poster-img--loaded' : ''}`}
                onLoad={() => setImageLoaded(true)}
              />
              <div className="tv-modal-poster-play">
                <span>▶</span>
              </div>
              {video.is_live && (
                <div className="tv-modal-live-badge">
                  <span className="tv-live-dot"></span>
                  LIVE
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="tv-modal-details">
          <div className="tv-modal-header">
            <h2 className="tv-modal-title">{video.title}</h2>
            <div className="tv-modal-meta">
              {video.views !== undefined && (
                <span>{formatViews(video.views)} views</span>
              )}
              {video.duration && (
                <span>{formatDuration(video.duration)}</span>
              )}
              {video.created_at && (
                <span>{formatRelativeTime(video.created_at)}</span>
              )}
            </div>
          </div>

          {video.description && (
            <p className="tv-modal-description">{video.description}</p>
          )}

          {/* Creator info */}
          {video.creator_name && (
            <div className="tv-modal-creator">
              <span className="tv-modal-creator-label">By</span>
              <span className="tv-modal-creator-name">{video.creator_name}</span>
            </div>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="tv-modal-tags">
              {video.tags.map((tag, i) => (
                <span key={i} className="tv-modal-tag">{tag}</span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="tv-modal-actions">
            <button 
              className="tv-modal-btn tv-modal-btn--primary"
              onClick={handlePlay}
            >
              <span>▶</span>
              <span>Play</span>
            </button>
            
            {showVoting && (
              <div className="tv-modal-voting">
                <button 
                  className="tv-modal-vote-btn"
                  onClick={() => onVote?.(video.id, 1)}
                >
                  👍 Vote
                </button>
              </div>
            )}

            <button 
              className="tv-modal-btn tv-modal-btn--secondary"
              onClick={() => {
                navigator.share?.({
                  title: video.title,
                  url: window.location.href,
                }) || navigator.clipboard?.writeText(window.location.href);
              }}
            >
              <span>↗</span>
              <span>Share</span>
            </button>
          </div>

          {/* Station info */}
          {station && (
            <div className="tv-modal-station">
              <img 
                src={station.logo} 
                alt={station.name}
                className="tv-modal-station-logo"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="tv-modal-station-info">
                <span className="tv-modal-station-name">{station.name}</span>
                <span className="tv-modal-station-tagline">{station.tagline}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

