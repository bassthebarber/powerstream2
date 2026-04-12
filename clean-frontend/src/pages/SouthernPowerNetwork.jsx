// frontend/src/pages/SouthernPowerNetwork.jsx
// Southern Power Network Hub - Parent page for all TV stations

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import TV_STATIONS, { STATION_CATEGORIES, getHubConfig } from '../data/tvStations.js';
import '../styles/tv-hub.css';
import '../styles/tv-station-base.css';

export default function SouthernPowerNetwork() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [liveStatuses, setLiveStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [featuredContent, setFeaturedContent] = useState([]);

  const hub = getHubConfig();

  // Fetch live status for each station
  useEffect(() => {
    const fetchLiveStatuses = async () => {
      try {
        const { data, error } = await supabase
          .from('tv_videos')
          .select('station_slug, id')
          .eq('is_live', true);

        if (!error && data) {
          const statuses = {};
          data.forEach(item => {
            statuses[item.station_slug] = true;
          });
          setLiveStatuses(statuses);
        }
      } catch (err) {
        console.error('Error fetching live statuses:', err);
      }
    };

    fetchLiveStatuses();
  }, []);

  // Fetch featured content
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tv_videos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);

        if (!error && data) {
          setFeaturedContent(data);
        }
      } catch (err) {
        console.error('Error fetching featured:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  // Filter stations by category
  const filteredStations = selectedCategory === 'all'
    ? TV_STATIONS.stations
    : TV_STATIONS.stations.filter(s => s.category === selectedCategory);

  const handleStationClick = (station) => {
    navigate(station.route);
  };

  return (
    <div className="spn-hub">
      {/* Hero Section */}
      <section className="spn-hub-hero">
        <div className="spn-hub-hero-bg"></div>
        <div className="spn-hub-hero-grid"></div>
        <div className="spn-hub-hero-content">
          <img
            src={hub.logo}
            alt={hub.name}
            className="spn-hub-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="spn-hub-title">{hub.name}</h1>
          <p className="spn-hub-subtitle">{hub.tagline}</p>
          <p className="spn-hub-description">{hub.description}</p>
          <button
            className="spn-hub-cta"
            onClick={() => navigate('/tv/nolimit-forever')}
          >
            <span>▶</span>
            <span>Explore Stations</span>
          </button>
        </div>
      </section>

      {/* Stations Section */}
      <section className="spn-hub-stations">
        <div className="spn-hub-section-header">
          <h2 className="spn-hub-section-title">Our Stations</h2>
          <div className="spn-hub-categories">
            {STATION_CATEGORIES.map(cat => (
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
        </div>

        <div className="spn-hub-grid">
          {filteredStations.map(station => (
            <article
              key={station.id}
              className="spn-hub-station-card"
              style={{ '--station-primary': station.style?.primary }}
              onClick={() => handleStationClick(station)}
            >
              <div className="spn-hub-station-cover">
                <img
                  src={station.coverImage || '/images/tv-default-cover.jpg'}
                  alt={station.name}
                  onError={(e) => { e.target.src = '/images/tv-default-cover.jpg'; }}
                />
                <div className="spn-hub-station-cover-overlay"></div>
                <img
                  src={station.logo}
                  alt=""
                  className="spn-hub-station-logo"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                {liveStatuses[station.slug] && (
                  <div className="spn-hub-station-live">
                    <span className="tv-live-dot"></span>
                    LIVE
                  </div>
                )}
                {station.isPremium && (
                  <div className="spn-hub-station-premium">
                    ⭐ Premium
                  </div>
                )}
              </div>
              <div className="spn-hub-station-info">
                <h3 className="spn-hub-station-name">{station.name}</h3>
                <p className="spn-hub-station-tagline">{station.tagline}</p>
                <p className="spn-hub-station-description">{station.description}</p>
                <div className="spn-hub-station-meta">
                  {station.features?.includes('live') && (
                    <span className="spn-hub-station-badge">📺 Live</span>
                  )}
                  {station.features?.includes('vod') && (
                    <span className="spn-hub-station-badge">📼 On Demand</span>
                  )}
                  {station.features?.includes('upload') && (
                    <span className="spn-hub-station-badge">📤 Upload</span>
                  )}
                </div>
              </div>
              <div className="spn-hub-station-cta">
                <span>Watch Now</span>
                <span>→</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Featured Content */}
      {featuredContent.length > 0 && (
        <section className="spn-hub-featured">
          <div className="spn-hub-section-header" style={{ maxWidth: 1400, margin: '0 auto', paddingLeft: '2rem' }}>
            <h2 className="spn-hub-section-title">Featured Across the Network</h2>
          </div>
          <div className="spn-hub-featured-grid">
            {featuredContent.map(video => {
              const station = TV_STATIONS.stations.find(s => s.slug === video.station_slug);
              return (
                <div
                  key={video.id}
                  className="spn-hub-featured-card"
                  onClick={() => navigate(station?.route || '/network/southernpower')}
                >
                  <div className="spn-hub-featured-thumb">
                    <img
                      src={video.thumb_url || '/images/tv-default-thumb.jpg'}
                      alt={video.title}
                      onError={(e) => { e.target.src = '/images/tv-default-thumb.jpg'; }}
                    />
                  </div>
                  <div className="spn-hub-featured-info">
                    <span className="spn-hub-featured-station">
                      {station?.name || 'Southern Power Network'}
                    </span>
                    <h4 className="spn-hub-featured-title">{video.title}</h4>
                    <span className="spn-hub-featured-meta">
                      {video.creator_name || 'Creator'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="spn-hub-footer">
        <img
          src={hub.logo}
          alt=""
          className="spn-hub-footer-logo"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <p>© {new Date().getFullYear()} Southern Power Network. All rights reserved.</p>
        <div className="spn-hub-footer-links">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </footer>
    </div>
  );
}

