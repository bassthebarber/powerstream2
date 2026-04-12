// frontend/src/pages/tv/NoLimitForever.jsx
// No Limit Forever TV - Premium Documentary & Film Experience (Master P Presents)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import { getStationBySlug } from '../../data/tvStations.js';
import StationShell from '../../components/tv/StationShell.jsx';
import LivePlayer from '../../components/tv/LivePlayer.jsx';
import VideoModal from '../../components/tv/VideoModal.jsx';
import UploadPanel from '../../components/tv/UploadPanel.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../styles/tv-station-base.css';
import '../../styles/tv-nolimit-forever.css';

export default function NoLimitForever() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const station = getStationBySlug('nolimit-forever');

  const [collections, setCollections] = useState({
    documentaries: [],
    films: [],
    series: [],
    classics: [],
    premieres: [],
  });
  const [featuredFilm, setFeaturedFilm] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'documentaries', name: 'Documentaries' },
    { id: 'films', name: 'Films' },
    { id: 'series', name: 'Series' },
    { id: 'classics', name: 'Classics' },
    { id: 'premieres', name: 'New Premieres' },
  ];

  // Fetch all content organized by collection
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tv_videos')
          .select('*')
          .eq('station_slug', 'nolimit-forever')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const videos = data || [];

        // Organize into collections
        const organized = {
          documentaries: videos.filter(v => v.tags?.includes('documentary')),
          films: videos.filter(v => v.tags?.includes('film')),
          series: videos.filter(v => v.tags?.includes('series')),
          classics: videos.filter(v => v.tags?.includes('classic')),
          premieres: videos.filter(v => v.tags?.includes('premiere') || 
            new Date(v.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
        };

        setCollections(organized);

        // Set featured (most recent premiere or first video)
        const featured = organized.premieres[0] || videos[0];
        setFeaturedFilm(featured);
      } catch (err) {
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handlePlay = (video) => {
    // Could navigate to full player page or open modal
    setSelectedVideo(video);
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    window.location.reload();
  };

  // Get all videos for a category
  const getVideosForCategory = useCallback(() => {
    if (activeCategory === 'all') {
      return Object.values(collections).flat();
    }
    return collections[activeCategory] || [];
  }, [activeCategory, collections]);

  // Format duration
  const formatDuration = (mins) => {
    if (!mins) return '';
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    if (hours > 0) {
      return `${hours}h ${remaining}m`;
    }
    return `${mins}m`;
  };

  return (
    <StationShell station={station} showNav={true} className="tv-station--nolimit-forever">
      {/* Cinematic Hero */}
      <section className="nlf-hero">
        <div className="nlf-hero-media">
          {featuredFilm?.video_url ? (
            <video
              className="nlf-hero-video"
              src={featuredFilm.video_url}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              className="nlf-hero-image"
              src={featuredFilm?.thumb_url || '/images/nlf-hero.jpg'}
              alt=""
              onError={(e) => { e.target.src = '/images/tv-default-cover.jpg'; }}
            />
          )}
        </div>
        <div className="nlf-hero-overlay"></div>
        <div className="nlf-hero-vignette"></div>

        <div className="nlf-hero-content">
          <div className="nlf-hero-masterp-badge">
            ⭐ Master P Presents
          </div>
          <img
            src={station?.logo}
            alt={station?.name}
            className="nlf-hero-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          
          {featuredFilm ? (
            <>
              <h1 className="nlf-hero-title">{featuredFilm.title}</h1>
              <p className="nlf-hero-description">
                {featuredFilm.description?.slice(0, 200)}
                {featuredFilm.description?.length > 200 ? '...' : ''}
              </p>
              <div className="nlf-hero-meta">
                {featuredFilm.year && <span>{featuredFilm.year}</span>}
                {featuredFilm.duration && (
                  <span>{formatDuration(featuredFilm.duration)}</span>
                )}
                {featuredFilm.rating && (
                  <span className="gold">★ {featuredFilm.rating}</span>
                )}
                {featuredFilm.tags?.[0] && (
                  <span style={{ textTransform: 'capitalize' }}>{featuredFilm.tags[0]}</span>
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className="nlf-hero-title">No Limit Forever TV</h1>
              <p className="nlf-hero-description">
                The definitive destination for documentaries, films, series, and exclusive premieres from the No Limit legacy.
              </p>
            </>
          )}

          <div className="nlf-hero-actions">
            {featuredFilm && (
              <button
                className="nlf-btn nlf-btn--primary"
                onClick={() => handlePlay(featuredFilm)}
              >
                <span>▶</span>
                <span>Play Now</span>
              </button>
            )}
            <button
              className="nlf-btn nlf-btn--secondary"
              onClick={() => document.querySelector('.nlf-collections')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>ℹ</span>
              <span>Browse Library</span>
            </button>
            {user && (
              <button
                className="nlf-btn nlf-btn--secondary"
                onClick={() => setShowUpload(true)}
              >
                <span>+</span>
                <span>Upload Film</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <div className="nlf-categories">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`nlf-category ${activeCategory === cat.id ? 'nlf-category--active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Collections */}
      <div className="nlf-collections">
        {activeCategory === 'all' ? (
          // Show all collections as rows
          <>
            {/* Premieres */}
            {collections.premieres.length > 0 && (
              <section className="nlf-collection">
                <div className="nlf-collection-header">
                  <h3 className="nlf-collection-title">
                    <span>🎭</span> New Premieres
                  </h3>
                  <span className="nlf-collection-see-all" onClick={() => setActiveCategory('premieres')}>
                    See All →
                  </span>
                </div>
                <div className="nlf-featured-grid">
                  {collections.premieres.slice(0, 4).map(video => (
                    <article
                      key={video.id}
                      className="nlf-featured-card"
                      onClick={() => handleVideoClick(video)}
                    >
                      <img
                        src={video.thumb_url || '/images/tv-default-thumb.jpg'}
                        alt={video.title}
                        className="nlf-featured-card-image"
                        onError={(e) => { e.target.src = '/images/tv-default-thumb.jpg'; }}
                      />
                      <div className="nlf-featured-card-overlay">
                        <span className="nlf-featured-card-collection">Premiere</span>
                        <h4 className="nlf-featured-card-title">{video.title}</h4>
                        <p className="nlf-featured-card-description">{video.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Documentaries */}
            {collections.documentaries.length > 0 && (
              <section className="nlf-collection">
                <div className="nlf-collection-header">
                  <h3 className="nlf-collection-title">
                    <span>🎬</span> Documentaries
                  </h3>
                  <span className="nlf-collection-see-all" onClick={() => setActiveCategory('documentaries')}>
                    See All →
                  </span>
                </div>
                <div className="nlf-collection-grid">
                  {collections.documentaries.map(video => (
                    <FilmCard
                      key={video.id}
                      video={video}
                      onClick={() => handleVideoClick(video)}
                      onHover={setHoveredCard}
                      isHovered={hoveredCard === video.id}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Films */}
            {collections.films.length > 0 && (
              <section className="nlf-collection">
                <div className="nlf-collection-header">
                  <h3 className="nlf-collection-title">
                    <span>🎥</span> Films
                  </h3>
                  <span className="nlf-collection-see-all" onClick={() => setActiveCategory('films')}>
                    See All →
                  </span>
                </div>
                <div className="nlf-collection-grid">
                  {collections.films.map(video => (
                    <FilmCard
                      key={video.id}
                      video={video}
                      onClick={() => handleVideoClick(video)}
                      onHover={setHoveredCard}
                      isHovered={hoveredCard === video.id}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Series */}
            {collections.series.length > 0 && (
              <section className="nlf-collection">
                <div className="nlf-collection-header">
                  <h3 className="nlf-collection-title">
                    <span>📺</span> Series
                  </h3>
                  <span className="nlf-collection-see-all" onClick={() => setActiveCategory('series')}>
                    See All →
                  </span>
                </div>
                <div className="nlf-collection-grid">
                  {collections.series.map(video => (
                    <FilmCard
                      key={video.id}
                      video={video}
                      onClick={() => handleVideoClick(video)}
                      onHover={setHoveredCard}
                      isHovered={hoveredCard === video.id}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Classics */}
            {collections.classics.length > 0 && (
              <section className="nlf-collection">
                <div className="nlf-collection-header">
                  <h3 className="nlf-collection-title">
                    <span>⭐</span> Classics
                  </h3>
                  <span className="nlf-collection-see-all" onClick={() => setActiveCategory('classics')}>
                    See All →
                  </span>
                </div>
                <div className="nlf-collection-grid">
                  {collections.classics.map(video => (
                    <FilmCard
                      key={video.id}
                      video={video}
                      onClick={() => handleVideoClick(video)}
                      onHover={setHoveredCard}
                      isHovered={hoveredCard === video.id}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          // Show single category grid
          <section className="nlf-collection">
            <div className="nlf-collection-header">
              <h3 className="nlf-collection-title">
                {categories.find(c => c.id === activeCategory)?.name}
              </h3>
            </div>
            <div className="nlf-collection-grid" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
              {getVideosForCategory().map(video => (
                <FilmCard
                  key={video.id}
                  video={video}
                  onClick={() => handleVideoClick(video)}
                  onHover={setHoveredCard}
                  isHovered={hoveredCard === video.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!loading && Object.values(collections).every(arr => arr.length === 0) && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#808080' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🎬</span>
            <p>No content available yet. Check back soon for exclusive films and documentaries.</p>
          </div>
        )}
      </div>

      {/* Master P Section */}
      <section className="nlf-masterp-section">
        <div className="nlf-masterp-header">
          <img
            src="/images/masterp-avatar.jpg"
            alt="Master P"
            className="nlf-masterp-avatar"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="nlf-masterp-info">
            <h2>From Master P</h2>
            <p>Entertainment mogul, entrepreneur, and visionary</p>
          </div>
        </div>
        <p style={{ color: '#a0a0a0', maxWidth: 800, lineHeight: 1.7 }}>
          "No Limit Forever TV is about preserving our legacy and creating new opportunities 
          for storytellers. This platform showcases the real stories, the struggles, and the 
          triumphs of our community. Every film, every documentary - it's about keeping it real 
          and inspiring the next generation."
        </p>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          station={station}
          onClose={() => setSelectedVideo(null)}
          onPlay={() => handlePlay(selectedVideo)}
        />
      )}

      {/* Upload Panel */}
      {showUpload && (
        <UploadPanel
          station={station}
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
          allowLongForm={true}
        />
      )}
    </StationShell>
  );
}

// Film Card Component
function FilmCard({ video, onClick, onHover, isHovered }) {
  const isPremiere = video.tags?.includes('premiere');
  const isExclusive = video.tags?.includes('exclusive');
  const isHD = video.quality === 'hd' || video.quality === '4k';

  return (
    <article
      className="nlf-film-card"
      onClick={onClick}
      onMouseEnter={() => onHover?.(video.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Badge */}
      {isPremiere && <span className="nlf-film-badge nlf-film-badge--premiere">Premiere</span>}
      {isExclusive && !isPremiere && <span className="nlf-film-badge nlf-film-badge--exclusive">Exclusive</span>}
      {isHD && !isPremiere && !isExclusive && <span className="nlf-film-badge nlf-film-badge--hd">HD</span>}

      {/* Poster */}
      <img
        src={video.thumb_url || '/images/tv-default-poster.jpg'}
        alt={video.title}
        className="nlf-film-card-poster"
        onError={(e) => { e.target.src = '/images/tv-default-poster.jpg'; }}
      />

      {/* Hover overlay */}
      <div className="nlf-film-card-overlay">
        <h4 className="nlf-film-card-title">{video.title}</h4>
        {video.year && <p className="nlf-film-card-year">{video.year}</p>}
        {video.duration && (
          <p className="nlf-film-card-duration">
            {Math.floor(video.duration / 60)}h {video.duration % 60}m
          </p>
        )}
        <div className="nlf-film-card-actions">
          <button className="nlf-film-card-btn">
            ▶ Play
          </button>
          <button className="nlf-film-card-btn nlf-film-card-btn--secondary">
            + List
          </button>
        </div>
      </div>
    </article>
  );
}

