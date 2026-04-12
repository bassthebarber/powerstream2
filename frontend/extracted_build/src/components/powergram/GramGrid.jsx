// frontend/src/components/powergram/GramGrid.jsx
// Instagram-style responsive photo/video grid
import React, { useState } from 'react';

export default function GramGrid({ 
  posts = [], 
  loading = false,
  onPostClick,
  emptyMessage = 'No photos yet'
}) {
  if (loading) {
    return (
      <div className="pg-grid pg-grid--loading">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="pg-tile pg-tile--skeleton">
            <div className="pg-skeleton-shimmer"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="pg-empty">
        <div className="pg-empty-icon">📸</div>
        <h3>No photos yet</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="pg-grid">
      {posts.map((post, idx) => (
        <GramTile
          key={post.id || post._id || idx}
          post={post}
          onClick={() => onPostClick?.(post)}
        />
      ))}
    </div>
  );
}

function GramTile({ post, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const mediaUrl = post.media_url || post.imageUrl || post.mediaUrl;
  const isVideo = post.media_type === 'video' || mediaUrl?.includes('.mp4');

  return (
    <div className="pg-tile" onClick={onClick}>
      <div className="pg-tile-image-wrapper">
        {!loaded && !error && (
          <div className="pg-tile-placeholder">
            <div className="pg-spinner pg-spinner--sm"></div>
          </div>
        )}
        {error ? (
          <div className="pg-tile-error">
            <span>📸</span>
          </div>
        ) : (
          <img
            src={mediaUrl}
            alt={post.caption || 'Photo'}
            className={`pg-tile-image ${loaded ? 'pg-tile-image--loaded' : ''}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            loading="lazy"
          />
        )}
      </div>

      {/* Hover Overlay */}
      <div className="pg-tile-overlay">
        <div className="pg-tile-stats">
          <span className="pg-tile-stat">
            <span>❤️</span>
            <span>{post.likes?.length || post.like_count || 0}</span>
          </span>
          <span className="pg-tile-stat">
            <span>💬</span>
            <span>{post.comments?.length || post.comment_count || 0}</span>
          </span>
        </div>
      </div>

      {/* Video indicator */}
      {isVideo && (
        <div className="pg-tile-badge pg-tile-badge--video">▶</div>
      )}

      {/* Multiple images indicator */}
      {post.image_count > 1 && (
        <div className="pg-tile-badge pg-tile-badge--multi">⬛⬛</div>
      )}
    </div>
  );
}
