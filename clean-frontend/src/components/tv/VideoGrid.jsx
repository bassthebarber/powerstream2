// frontend/src/components/tv/VideoGrid.jsx
// VOD library grid with search and filter

import React, { useState, useEffect, useCallback } from 'react';
import { fetchStationVideos, formatViews, formatRelativeTime, formatDuration } from './tvUtils.js';

export default function VideoGrid({
  stationSlug,
  videos: propVideos = null,
  collection = null,
  title = 'Library',
  showSearch = true,
  showFilter = true,
  onVideoClick,
  variant = 'grid', // grid, row, featured
  limit = 50,
  className = '',
}) {
  const [videos, setVideos] = useState(propVideos || []);
  const [loading, setLoading] = useState(!propVideos);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [availableTags, setAvailableTags] = useState([]);

  // Fetch videos if not provided as props
  useEffect(() => {
    if (propVideos) {
      setVideos(propVideos);
      extractTags(propVideos);
      return;
    }

    const loadVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchStationVideos(stationSlug, {
          limit,
          category: collection,
        });
        setVideos(data);
        extractTags(data);
      } catch (err) {
        console.error('Failed to load videos:', err);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [stationSlug, collection, propVideos, limit]);

  // Extract unique tags
  const extractTags = (vids) => {
    const tags = new Set();
    vids.forEach(v => {
      (v.tags || []).forEach(t => tags.add(t));
    });
    setAvailableTags(Array.from(tags));
  };

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const matchesSearch = !searchQuery || 
      video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = filterTag === 'all' || 
      (video.tags || []).includes(filterTag);
    
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <section className={`tv-video-grid tv-video-grid--loading ${className}`}>
        <h3 className="tv-video-grid-title">{title}</h3>
        <div className="tv-video-grid-skeleton">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="tv-video-card tv-video-card--skeleton">
              <div className="tv-video-card-thumb-skeleton"></div>
              <div className="tv-video-card-info-skeleton"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`tv-video-grid tv-video-grid--error ${className}`}>
        <h3 className="tv-video-grid-title">{title}</h3>
        <div className="tv-video-grid-error">
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`tv-video-grid tv-video-grid--${variant} ${className}`}>
      {/* Header */}
      <div className="tv-video-grid-header">
        <h3 className="tv-video-grid-title">{title}</h3>
        
        {/* Search & Filter */}
        {(showSearch || showFilter) && (
          <div className="tv-video-grid-controls">
            {showSearch && (
              <div className="tv-video-grid-search">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="tv-search-icon">🔍</span>
              </div>
            )}
            
            {showFilter && availableTags.length > 0 && (
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="tv-video-grid-filter"
              >
                <option value="all">All Categories</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Videos */}
      {filteredVideos.length === 0 ? (
        <div className="tv-video-grid-empty">
          <span>📺</span>
          <p>No videos found</p>
        </div>
      ) : (
        <div className={`tv-video-grid-items tv-video-grid-items--${variant}`}>
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={() => onVideoClick?.(video)}
              variant={variant}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// Video Card Component
function VideoCard({ video, onClick, variant = 'grid' }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <article 
      className={`tv-video-card tv-video-card--${variant}`}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="tv-video-card-thumb">
        {!imageLoaded && !imageError && (
          <div className="tv-video-card-thumb-placeholder">
            <span>📺</span>
          </div>
        )}
        {!imageError && (
          <img
            src={video.thumb_url || '/images/tv-default-thumb.jpg'}
            alt={video.title}
            className={`tv-video-card-img ${imageLoaded ? 'tv-video-card-img--loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}
        
        {/* Duration badge */}
        {video.duration && (
          <span className="tv-video-card-duration">
            {formatDuration(video.duration)}
          </span>
        )}

        {/* Live badge */}
        {video.is_live && (
          <span className="tv-video-card-live">
            <span className="tv-live-dot"></span>
            LIVE
          </span>
        )}

        {/* Play overlay */}
        <div className="tv-video-card-play">
          <span>▶</span>
        </div>
      </div>

      {/* Info */}
      <div className="tv-video-card-info">
        <h4 className="tv-video-card-title">{video.title || 'Untitled'}</h4>
        {video.creator_name && (
          <p className="tv-video-card-creator">{video.creator_name}</p>
        )}
        <div className="tv-video-card-meta">
          {video.views !== undefined && (
            <span className="tv-video-card-views">
              {formatViews(video.views)} views
            </span>
          )}
          {video.created_at && (
            <span className="tv-video-card-date">
              {formatRelativeTime(video.created_at)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// Row variant for Netflix-style collections
export function VideoRow({
  title,
  videos,
  onVideoClick,
  className = '',
}) {
  return (
    <VideoGrid
      videos={videos}
      title={title}
      showSearch={false}
      showFilter={false}
      onVideoClick={onVideoClick}
      variant="row"
      className={className}
    />
  );
}

