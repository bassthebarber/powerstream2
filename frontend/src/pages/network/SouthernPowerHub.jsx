// frontend/src/pages/network/SouthernPowerHub.jsx
// Southern Power Network Hub - Complete Parent Page for All TV Stations
// Version: 2.0 - Production Ready

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import { TABLES, POST_TYPE } from '../../config/supabaseSchema.js';
import { feedPostToTvVideo } from '../../components/tv/tvUtils.js';
import '../../styles/tv-hub.css';
import '../../styles/tv-station-base.css';

// ============================================
// STATION DATA - Embedded for reliability
// ============================================
const HUB_CONFIG = {
  id: 'southern-power-network',
  slug: 'southernpower',
  name: 'Southern Power Network',
  tagline: 'The Voice of the South',
  description: 'Your home for Southern culture, music, entertainment, and community. Experience premium content from Houston to the world.',
  logo: '/logos/southernpowernetworklogo.png',
  coverImage: '/images/spn-hero.jpg',
};

const STATIONS = [
  {
    id: 'nolimit-east-houston',
    slug: 'nolimit',
    route: '/tv/nolimit',
    name: 'No Limit East Houston TV',
    tagline: 'Where the Culture Lives',
    description: 'MTV-style urban music channel featuring the hottest videos, live performances, and exclusive content from Houston\'s finest.',
    logo: '/logos/nolimiteasthoustonlogo.png',
    coverImage: '/images/nolimit-cover.jpg',
    category: 'music',
    features: ['live', 'vod', 'upload', 'schedule'],
    color: '#ff0050',
  },
  {
    id: 'nolimit-forever',
    slug: 'nolimit-forever',
    route: '/tv/nolimit-forever',
    name: 'No Limit Forever TV',
    tagline: 'Premium Documentaries & Films',
    description: 'Master P presents: The definitive destination for documentaries, films, series, and exclusive premieres.',
    logo: '/logos/nolimit-forever.logo.png.png',
    coverImage: '/images/nlf-cover.jpg',
    category: 'premium',
    isPremium: true,
    features: ['vod', 'upload', 'collections'],
    color: '#d4af37',
  },
  {
    id: 'texas-got-talent',
    slug: 'texas-got-talent',
    route: '/tv/texas-got-talent',
    name: 'Texas Got Talent',
    tagline: 'Discover Tomorrow\'s Stars Today',
    description: 'The ultimate talent showcase. Submit your performance, vote for your favorites, and watch stars rise.',
    logo: '/logos/texasgottalentlogo.png',
    coverImage: '/images/tgt-cover.jpg',
    category: 'entertainment',
    features: ['live', 'vod', 'upload', 'vote', 'schedule'],
    color: '#ffd700',
  },
  {
    id: 'civic-connect',
    slug: 'civic-connect',
    route: '/tv/civic-connect',
    name: 'Civic Connect TV',
    tagline: 'Community. News. Action.',
    description: 'Stay informed with local news, community discussions, and civic engagement programming.',
    logo: '/logos/civicconnectlogo.png',
    coverImage: '/images/civic-cover.jpg',
    category: 'news',
    features: ['live', 'vod', 'upload', 'schedule'],
    color: '#1e88e5',
  },
  {
    id: 'worldwide',
    slug: 'worldwide',
    route: '/tv/worldwide',
    name: 'PowerStream Worldwide TV',
    tagline: 'Global Entertainment Hub',
    description: 'Curated channels and content from around the world. One platform, endless perspectives.',
    logo: '/logos/worldwidetvlogo.png',
    coverImage: '/images/worldwide-cover.jpg',
    category: 'global',
    features: ['vod', 'channels', 'schedule'],
    color: '#7c4dff',
  },
  {
    id: 'southern-power-music',
    slug: 'southern-power-music',
    route: '/tv/southern-power-music',
    name: 'Southern Power Music TV',
    tagline: '24/7 Music Videos',
    description: 'Non-stop music videos from the South. Hip-hop, R&B, gospel, and more.',
    logo: '/logos/powerstream-logo.png',
    coverImage: '/images/spm-cover.jpg',
    category: 'music',
    features: ['live', 'vod', 'schedule'],
    color: '#e6b800',
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All Stations', icon: '📺' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'premium', name: 'Premium', icon: '⭐' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎭' },
  { id: 'news', name: 'News & Community', icon: '📰' },
  { id: 'global', name: 'Global', icon: '🌍' },
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function SouthernPowerHub() {
  const navigate = useNavigate();
  
  // State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [liveStatuses, setLiveStatuses] = useState({});
  const [viewerCounts, setViewerCounts] = useState({});
  const [featuredContent, setFeaturedContent] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [liveNowVideos, setLiveNowVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          { data: liveStations, error: liveError },
          { data: featuredData, error: featuredError },
          { data: trendingData, error: trendingError },
        ] = await Promise.all([
          supabase.from(TABLES.STATIONS).select('*').eq('is_live', true).limit(10),
          supabase
            .from(TABLES.FEED_POSTS)
            .select('*')
            .eq('post_type', POST_TYPE.STATION_VOD)
            .order('created_at', { ascending: false })
            .limit(8),
          supabase
            .from(TABLES.FEED_POSTS)
            .select('*')
            .eq('post_type', POST_TYPE.STATION_VOD)
            .order('views', { ascending: false })
            .limit(6),
        ]);

        if (!liveError && liveStations?.length) {
          const liveCards = liveStations.map((s) => ({
            id: `live-${s.slug}`,
            station_slug: s.slug,
            title: s.name,
            is_live: true,
            video_url: s.live_stream_url,
            thumb_url: s.logo_url,
            viewers: s.viewer_count ?? 0,
            views: s.viewer_count ?? 0,
          }));
          setLiveNowVideos(liveCards);
          const statuses = {};
          const viewers = {};
          liveStations.forEach((s) => {
            statuses[s.slug] = true;
            viewers[s.slug] = s.viewer_count ?? 0;
          });
          setLiveStatuses(statuses);
          setViewerCounts(viewers);
        } else {
          setLiveNowVideos([]);
        }

        if (!featuredError && featuredData) {
          setFeaturedContent(featuredData.map(feedPostToTvVideo));
        }
        if (!trendingError && trendingData) {
          setTrendingVideos(trendingData.map(feedPostToTvVideo));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load content. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Poll for live status updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter stations
  const filteredStations = useMemo(() => {
    let stations = STATIONS;
    
    if (selectedCategory !== 'all') {
      stations = stations.filter(s => s.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      stations = stations.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.tagline.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      );
    }
    
    return stations;
  }, [selectedCategory, searchQuery]);

  // Handlers
  const handleStationClick = useCallback((station) => {
    navigate(station.route);
  }, [navigate]);

  const handleVideoClick = useCallback((video) => {
    const station = STATIONS.find(s => s.slug === video.station_slug);
    if (station) {
      navigate(station.route);
    }
  }, [navigate]);

  // Format view count
  const formatViews = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Format relative time
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="spn-hub">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="spn-hub-hero">
        <div className="spn-hub-hero-bg">
          <div className="spn-hub-hero-gradient"></div>
        </div>
        <div className="spn-hub-hero-grid"></div>
        
        {/* Animated particles */}
        <div className="spn-hub-hero-particles">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="spn-hub-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        <div className="spn-hub-hero-content">
          <img
            src={HUB_CONFIG.logo}
            alt={HUB_CONFIG.name}
            className="spn-hub-logo"
            onError={(e) => { e.target.style.opacity = '0'; }}
          />
          <h1 className="spn-hub-title">{HUB_CONFIG.name}</h1>
          <p className="spn-hub-subtitle">{HUB_CONFIG.tagline}</p>
          <p className="spn-hub-description">{HUB_CONFIG.description}</p>
          
          <div className="spn-hub-hero-stats">
            <div className="spn-hub-stat">
              <span className="spn-hub-stat-value">{STATIONS.length}</span>
              <span className="spn-hub-stat-label">Stations</span>
            </div>
            <div className="spn-hub-stat">
              <span className="spn-hub-stat-value">{Object.keys(liveStatuses).length}</span>
              <span className="spn-hub-stat-label">Live Now</span>
            </div>
            <div className="spn-hub-stat">
              <span className="spn-hub-stat-value">24/7</span>
              <span className="spn-hub-stat-label">Streaming</span>
            </div>
          </div>

          <div className="spn-hub-hero-actions">
            <button
              className="spn-hub-cta spn-hub-cta--primary"
              onClick={() => navigate('/tv/nolimit-forever')}
            >
              <span>▶</span>
              <span>Watch Now</span>
            </button>
            <button
              className="spn-hub-cta spn-hub-cta--secondary"
              onClick={() => document.querySelector('.spn-hub-stations')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>📺</span>
              <span>Browse Stations</span>
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="spn-hub-scroll-indicator">
          <span>Scroll to explore</span>
          <div className="spn-hub-scroll-arrow">↓</div>
        </div>
      </section>

      {/* ============================================
          LIVE NOW SECTION
          ============================================ */}
      {liveNowVideos.length > 0 && (
        <section className="spn-hub-live-now">
          <div className="spn-hub-live-header">
            <div className="spn-hub-live-badge">
              <span className="spn-hub-live-dot"></span>
              LIVE NOW
            </div>
            <h2>Streaming Across the Network</h2>
          </div>
          <div className="spn-hub-live-scroll">
            {liveNowVideos.map(video => {
              const station = STATIONS.find(s => s.slug === video.station_slug);
              return (
                <div
                  key={video.id}
                  className="spn-hub-live-card"
                  onClick={() => handleVideoClick(video)}
                  style={{ '--accent-color': station?.color || '#e6b800' }}
                >
                  <div className="spn-hub-live-thumb">
                    <img
                      src={video.thumb_url || '/images/tv-default-thumb.jpg'}
                      alt={video.title}
                      onError={(e) => { e.target.src = '/images/tv-default-thumb.jpg'; }}
                    />
                    <div className="spn-hub-live-overlay">
                      <span className="spn-hub-live-viewers">
                        👁 {formatViews(video.viewers || viewerCounts[video.station_slug])} watching
                      </span>
                    </div>
                    <div className="spn-hub-live-play">▶</div>
                  </div>
                  <div className="spn-hub-live-info">
                    <span className="spn-hub-live-station">{station?.name || 'Live'}</span>
                    <h4>{video.title}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ============================================
          STATIONS SECTION
          ============================================ */}
      <section className="spn-hub-stations">
        <div className="spn-hub-section-header">
          <h2 className="spn-hub-section-title">Our Stations</h2>
          
          {/* Search */}
          <div className="spn-hub-search">
            <input
              type="text"
              placeholder="Search stations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="spn-hub-search-icon">🔍</span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="spn-hub-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`spn-hub-category ${selectedCategory === cat.id ? 'spn-hub-category--active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="spn-hub-loading">
            <div className="spn-hub-spinner"></div>
            <p>Loading stations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="spn-hub-error">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {/* Stations Grid */}
        {!loading && !error && (
          <div className="spn-hub-grid">
            {filteredStations.length === 0 ? (
              <div className="spn-hub-empty">
                <span>📺</span>
                <p>No stations found{searchQuery && ` for "${searchQuery}"`}</p>
              </div>
            ) : (
              filteredStations.map(station => (
                <StationCard
                  key={station.id}
                  station={station}
                  isLive={liveStatuses[station.slug]}
                  viewerCount={viewerCounts[station.slug]}
                  onClick={() => handleStationClick(station)}
                />
              ))
            )}
          </div>
        )}
      </section>

      {/* ============================================
          FEATURED CONTENT
          ============================================ */}
      {featuredContent.length > 0 && (
        <section className="spn-hub-featured">
          <div className="spn-hub-section-header">
            <h2 className="spn-hub-section-title">Featured Across the Network</h2>
            <Link to="/tv/nolimit-forever" className="spn-hub-view-all">
              View All →
            </Link>
          </div>
          <div className="spn-hub-featured-grid">
            {featuredContent.slice(0, 6).map(video => {
              const station = STATIONS.find(s => s.slug === video.station_slug);
              return (
                <div
                  key={video.id}
                  className="spn-hub-featured-card"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="spn-hub-featured-thumb">
                    <img
                      src={video.thumb_url || '/images/tv-default-thumb.jpg'}
                      alt={video.title}
                      onError={(e) => { e.target.src = '/images/tv-default-thumb.jpg'; }}
                    />
                    {video.duration && (
                      <span className="spn-hub-featured-duration">
                        {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  <div className="spn-hub-featured-info">
                    <span className="spn-hub-featured-station" style={{ color: station?.color }}>
                      {station?.name || 'Southern Power Network'}
                    </span>
                    <h4 className="spn-hub-featured-title">{video.title}</h4>
                    <div className="spn-hub-featured-meta">
                      <span>{video.creator_name || 'Creator'}</span>
                      <span>•</span>
                      <span>{formatViews(video.views)} views</span>
                      <span>•</span>
                      <span>{formatTime(video.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ============================================
          TRENDING SECTION
          ============================================ */}
      {trendingVideos.length > 0 && (
        <section className="spn-hub-trending">
          <div className="spn-hub-section-header">
            <h2 className="spn-hub-section-title">🔥 Trending Now</h2>
          </div>
          <div className="spn-hub-trending-list">
            {trendingVideos.map((video, idx) => {
              const station = STATIONS.find(s => s.slug === video.station_slug);
              return (
                <div
                  key={video.id}
                  className="spn-hub-trending-item"
                  onClick={() => handleVideoClick(video)}
                >
                  <span className="spn-hub-trending-rank">#{idx + 1}</span>
                  <img
                    src={video.thumb_url || '/images/tv-default-thumb.jpg'}
                    alt={video.title}
                    className="spn-hub-trending-thumb"
                    onError={(e) => { e.target.src = '/images/tv-default-thumb.jpg'; }}
                  />
                  <div className="spn-hub-trending-info">
                    <h4>{video.title}</h4>
                    <span>{station?.name} • {formatViews(video.views)} views</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ============================================
          QUICK ACCESS SECTION
          ============================================ */}
      <section className="spn-hub-quick-access">
        <div className="spn-hub-section-header">
          <h2 className="spn-hub-section-title">Quick Access</h2>
        </div>
        <div className="spn-hub-quick-grid">
          <div className="spn-hub-quick-card" onClick={() => navigate('/tv/nolimit-forever')}>
            <span className="spn-hub-quick-icon">🎬</span>
            <h4>Films & Docs</h4>
            <p>Premium content from No Limit Forever</p>
          </div>
          <div className="spn-hub-quick-card" onClick={() => navigate('/tv/texas-got-talent')}>
            <span className="spn-hub-quick-icon">🌟</span>
            <h4>Vote Now</h4>
            <p>Support your favorite contestants</p>
          </div>
          <div className="spn-hub-quick-card" onClick={() => navigate('/tv/civic-connect')}>
            <span className="spn-hub-quick-icon">📰</span>
            <h4>Local News</h4>
            <p>Stay informed with Civic Connect</p>
          </div>
          <div className="spn-hub-quick-card" onClick={() => navigate('/tv/southern-power-music')}>
            <span className="spn-hub-quick-icon">🎵</span>
            <h4>24/7 Music</h4>
            <p>Non-stop music videos</p>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="spn-hub-footer">
        <div className="spn-hub-footer-main">
          <div className="spn-hub-footer-brand">
            <img
              src={HUB_CONFIG.logo}
              alt=""
              className="spn-hub-footer-logo"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <p>{HUB_CONFIG.tagline}</p>
          </div>
          
          <div className="spn-hub-footer-links">
            <div className="spn-hub-footer-col">
              <h5>Stations</h5>
              {STATIONS.slice(0, 3).map(s => (
                <Link key={s.id} to={s.route}>{s.name}</Link>
              ))}
            </div>
            <div className="spn-hub-footer-col">
              <h5>More Stations</h5>
              {STATIONS.slice(3).map(s => (
                <Link key={s.id} to={s.route}>{s.name}</Link>
              ))}
            </div>
            <div className="spn-hub-footer-col">
              <h5>Company</h5>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/careers">Careers</Link>
              <Link to="/press">Press</Link>
            </div>
            <div className="spn-hub-footer-col">
              <h5>Legal</h5>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/dmca">DMCA</Link>
            </div>
          </div>
        </div>
        
        <div className="spn-hub-footer-bottom">
          <p>© {new Date().getFullYear()} Southern Power Network. All rights reserved.</p>
          <div className="spn-hub-footer-social">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// STATION CARD COMPONENT
// ============================================
function StationCard({ station, isLive, viewerCount, onClick }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <article
      className={`spn-hub-station-card ${isLive ? 'spn-hub-station-card--live' : ''}`}
      style={{ '--station-color': station.color }}
      onClick={onClick}
    >
      {/* Cover Image */}
      <div className="spn-hub-station-cover">
        {!imageLoaded && (
          <div className="spn-hub-station-cover-skeleton"></div>
        )}
        <img
          src={station.coverImage || '/images/tv-default-cover.jpg'}
          alt={station.name}
          className={imageLoaded ? 'loaded' : ''}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => { 
            e.target.src = '/images/tv-default-cover.jpg';
            setImageLoaded(true);
          }}
        />
        <div className="spn-hub-station-cover-overlay"></div>
        
        {/* Station Logo */}
        <img
          src={station.logo}
          alt=""
          className="spn-hub-station-logo"
          onError={(e) => { e.target.style.display = 'none'; }}
        />

        {/* Badges */}
        {isLive && (
          <div className="spn-hub-station-live">
            <span className="spn-hub-live-dot"></span>
            LIVE
            {viewerCount && <span className="spn-hub-station-viewers">{viewerCount.toLocaleString()}</span>}
          </div>
        )}
        {station.isPremium && (
          <div className="spn-hub-station-premium">
            ⭐ Premium
          </div>
        )}
      </div>

      {/* Info */}
      <div className="spn-hub-station-info">
        <h3 className="spn-hub-station-name">{station.name}</h3>
        <p className="spn-hub-station-tagline">{station.tagline}</p>
        <p className="spn-hub-station-description">{station.description}</p>
        
        {/* Feature Badges */}
        <div className="spn-hub-station-features">
          {station.features?.includes('live') && (
            <span className="spn-hub-feature-badge">📺 Live</span>
          )}
          {station.features?.includes('vod') && (
            <span className="spn-hub-feature-badge">📼 VOD</span>
          )}
          {station.features?.includes('upload') && (
            <span className="spn-hub-feature-badge">📤 Upload</span>
          )}
          {station.features?.includes('vote') && (
            <span className="spn-hub-feature-badge">👍 Vote</span>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="spn-hub-station-cta">
        <span>{isLive ? 'Watch Live' : 'Watch Now'}</span>
        <span>→</span>
      </div>
    </article>
  );
}

