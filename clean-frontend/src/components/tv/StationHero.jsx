// frontend/src/components/tv/StationHero.jsx
// Hero banner component for TV stations

import React, { useState, useEffect } from 'react';

export default function StationHero({
  station,
  featuredVideo = null,
  onPlayLive,
  onPlayFeatured,
  variant = 'default', // default, cinematic, mtv, news
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get background image
  const bgImage = featuredVideo?.thumb_url || station?.coverImage || '/images/tv-default-hero.jpg';

  return (
    <section className={`tv-hero tv-hero--${variant}`}>
      {/* Background */}
      <div className="tv-hero-bg">
        <img 
          src={bgImage}
          alt=""
          className={`tv-hero-bg-img ${imageLoaded ? 'tv-hero-bg-img--loaded' : ''}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => { e.target.src = '/images/tv-default-hero.jpg'; }}
        />
        <div className="tv-hero-gradient"></div>
      </div>

      {/* Content */}
      <div className="tv-hero-content">
        {/* Logo */}
        <img 
          src={station?.logo} 
          alt={station?.name}
          className="tv-hero-logo"
          onError={(e) => { e.target.style.display = 'none'; }}
        />

        {/* Featured Video Info */}
        {featuredVideo ? (
          <div className="tv-hero-featured">
            <span className="tv-hero-label">Now Playing</span>
            <h2 className="tv-hero-title">{featuredVideo.title}</h2>
            {featuredVideo.description && (
              <p className="tv-hero-description">
                {featuredVideo.description.length > 200 
                  ? featuredVideo.description.slice(0, 200) + '...'
                  : featuredVideo.description
                }
              </p>
            )}
            <div className="tv-hero-meta">
              {featuredVideo.creator_name && (
                <span className="tv-hero-creator">By {featuredVideo.creator_name}</span>
              )}
              {featuredVideo.duration && (
                <span className="tv-hero-duration">{Math.floor(featuredVideo.duration / 60)} min</span>
              )}
            </div>
          </div>
        ) : (
          <div className="tv-hero-station-info">
            <h2 className="tv-hero-title">{station?.name}</h2>
            <p className="tv-hero-tagline">{station?.tagline}</p>
            <p className="tv-hero-description">{station?.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="tv-hero-actions">
          {onPlayLive && (
            <button className="tv-hero-btn tv-hero-btn--primary" onClick={onPlayLive}>
              <span>▶</span>
              <span>Watch Live</span>
            </button>
          )}
          {onPlayFeatured && featuredVideo && (
            <button className="tv-hero-btn tv-hero-btn--secondary" onClick={onPlayFeatured}>
              <span>▶</span>
              <span>Play Featured</span>
            </button>
          )}
        </div>
      </div>

      {/* Decorative elements for MTV variant */}
      {variant === 'mtv' && (
        <div className="tv-hero-mtv-effects">
          <div className="tv-hero-glitch"></div>
          <div className="tv-hero-scanlines"></div>
        </div>
      )}

      {/* Cinematic vignette for premium variant */}
      {variant === 'cinematic' && (
        <div className="tv-hero-vignette"></div>
      )}
    </section>
  );
}

