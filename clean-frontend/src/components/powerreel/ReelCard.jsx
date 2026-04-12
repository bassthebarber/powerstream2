// frontend/src/components/powerreel/ReelCard.jsx
// Individual reel card with video player and actions
import React, { useRef, useState, useEffect, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ReelCard = forwardRef(({ 
  reel, 
  index, 
  isActive, 
  userId,
  onLike,
  onComment,
  onShare 
}, ref) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showFullCaption, setShowFullCaption] = useState(false);

  // Author info
  const author = reel.user && typeof reel.user === 'object'
    ? {
        id: reel.user_id || reel.user._id || reel.user.id,
        name: reel.user.name || reel.user.displayName || reel.username || 'User',
        avatarUrl: reel.user.avatarUrl || reel.user.avatar,
        username: reel.user.username || reel.username || 'user',
      }
    : {
        id: reel.user_id,
        name: reel.username || 'User',
        avatarUrl: null,
        username: reel.username || 'user',
      };

  const initials = author.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const isLiked = userId && (reel.likes?.includes(userId) || reel.liked_by_user);
  const likeCount = reel.likes?.length || reel.like_count || 0;
  const commentCount = reel.comments?.length || reel.comment_count || 0;
  const viewCount = reel.views || reel.view_count || 0;

  // Auto-play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      video.pause();
      video.currentTime = 0;
      setPlaying(false);
    }
  }, [isActive]);

  // Progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setMuted(video.muted);
    }
  };

  const goToProfile = (e) => {
    e.stopPropagation();
    if (author.id) navigate(`/profile/${author.id}`);
  };

  const videoSrc = reel.media_url || reel.videoUrl || reel.hlsUrl;
  const caption = reel.caption || '';
  const hashtags = caption.match(/#\w+/g) || [];
  const captionText = caption.replace(/#\w+/g, '').trim();

  return (
    <div 
      className="pr-reel" 
      ref={ref} 
      data-reel-idx={index}
      onClick={togglePlay}
    >
      {/* Video */}
      <div className="pr-video-container">
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            className="pr-video"
            loop
            muted={muted}
            playsInline
            poster={reel.thumbnail_url || reel.thumbnailUrl}
          />
        ) : (
          <div className="pr-no-video">
            <span>🎬</span>
            <span>Video unavailable</span>
          </div>
        )}

        {/* Play/Pause indicator */}
        {!playing && isActive && (
          <div className="pr-play-indicator">
            <span>▶</span>
          </div>
        )}

        {/* Progress bar */}
        <div className="pr-progress-bar">
          <div className="pr-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Right sidebar actions */}
      <div className="pr-sidebar">
        {/* Author avatar */}
        <div className="pr-sidebar-avatar" onClick={goToProfile}>
          {author.avatarUrl ? (
            <img src={author.avatarUrl} alt={author.name} />
          ) : (
            <span>{initials}</span>
          )}
          <div className="pr-follow-badge">+</div>
        </div>

        {/* Like */}
        <button 
          className={`pr-sidebar-btn ${isLiked ? 'pr-sidebar-btn--active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onLike?.(); }}
        >
          <span className="pr-sidebar-icon">{isLiked ? '❤️' : '🤍'}</span>
          <span className="pr-sidebar-count">{likeCount}</span>
        </button>

        {/* Comments */}
        <button 
          className="pr-sidebar-btn"
          onClick={(e) => { e.stopPropagation(); onComment?.(); }}
        >
          <span className="pr-sidebar-icon">💬</span>
          <span className="pr-sidebar-count">{commentCount}</span>
        </button>

        {/* Share */}
        <button 
          className="pr-sidebar-btn"
          onClick={(e) => { e.stopPropagation(); onShare?.(); }}
        >
          <span className="pr-sidebar-icon">↗️</span>
          <span className="pr-sidebar-count">Share</span>
        </button>

        {/* Save */}
        <button className="pr-sidebar-btn" onClick={e => e.stopPropagation()}>
          <span className="pr-sidebar-icon">🔖</span>
        </button>

        {/* Sound toggle */}
        <button 
          className="pr-sidebar-btn pr-sound-btn"
          onClick={toggleMute}
        >
          <span className="pr-sidebar-icon">{muted ? '🔇' : '🔊'}</span>
        </button>
      </div>

      {/* Bottom overlay - user info and caption */}
      <div className="pr-bottom-overlay">
        {/* User info */}
        <div className="pr-user-info" onClick={goToProfile}>
          <span className="pr-username">@{author.username}</span>
          {reel.is_verified && <span className="pr-verified">✓</span>}
        </div>

        {/* Caption */}
        {captionText && (
          <p 
            className={`pr-caption ${showFullCaption ? 'pr-caption--full' : ''}`}
            onClick={(e) => { e.stopPropagation(); setShowFullCaption(!showFullCaption); }}
          >
            {showFullCaption || captionText.length <= 100 
              ? captionText 
              : captionText.slice(0, 100) + '...'}
          </p>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="pr-hashtags">
            {hashtags.slice(0, 3).map((tag, i) => (
              <span key={i} className="pr-hashtag">{tag}</span>
            ))}
          </div>
        )}

        {/* Sound/Music info */}
        {reel.track_name && (
          <div className="pr-music-info">
            <span className="pr-music-icon">🎵</span>
            <span className="pr-music-name">{reel.track_name}</span>
          </div>
        )}

        {/* Views count */}
        {viewCount > 0 && (
          <div className="pr-views">
            <span>👁️</span>
            <span>{viewCount.toLocaleString()} views</span>
          </div>
        )}
      </div>
    </div>
  );
});

ReelCard.displayName = 'ReelCard';

export default ReelCard;

