// frontend/src/pages/tv/Worldwide.jsx
// PowerStream Worldwide TV - Global Entertainment Hub

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import { getStationBySlug } from '../../data/tvStations.js';
import StationShell from '../../components/tv/StationShell.jsx';
import VideoModal from '../../components/tv/VideoModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatRelativeTime } from '../../components/tv/tvUtils.js';
import '../../styles/tv-station-base.css';
import '../../styles/tv-worldwide.css';

export default function Worldwide() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const station = getStationBySlug('worldwide');

  const [channels, setChannels] = useState([]);
  const [featuredContent, setFeaturedContent] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('all');

  const regions = [
    { id: 'all', name: 'All Regions', flag: '🌍' },
    { id: 'americas', name: 'Americas', flag: '🌎' },
    { id: 'europe', name: 'Europe', flag: '🌍' },
    { id: 'asia', name: 'Asia', flag: '🌏' },
    { id: 'africa', name: 'Africa', flag: '🌍' },
    { id: 'oceania', name: 'Oceania', flag: '🌏' },
  ];

  const languages = [
    { id: 'all', name: 'All Languages' },
    { id: 'english', name: 'English' },
    { id: 'spanish', name: 'Español' },
    { id: 'french', name: 'Français' },
    { id: 'portuguese', name: 'Português' },
    { id: 'arabic', name: 'العربية' },
    { id: 'chinese', name: '中文' },
  ];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('tv_videos')
          .select('*')
          .eq('station_slug', 'worldwide')
          .order('created_at', { ascending: false });

        if (selectedRegion !== 'all') {
          query = query.contains('tags', [selectedRegion]);
        }

        const { data, error } = await query.limit(50);

        if (error) throw error;

        // Group by "channel" (using tags or creator as channel identifier)
        const grouped = (data || []).reduce((acc, video) => {
          const channelKey = video.channel_name || video.creator_name || 'Global';
          if (!acc[channelKey]) {
            acc[channelKey] = {
              name: channelKey,
              videos: [],
              isLive: false,
              region: video.tags?.find(t => regions.some(r => r.id === t)) || 'global',
            };
          }
          acc[channelKey].videos.push(video);
          if (video.is_live) acc[channelKey].isLive = true;
          return acc;
        }, {});

        setChannels(Object.values(grouped));
        setFeaturedContent((data || []).slice(0, 3));
      } catch (err) {
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [selectedRegion]);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleChannelClick = (channel) => {
    if (channel.videos.length > 0) {
      handleVideoClick(channel.videos[0]);
    }
  };

  return (
    <StationShell station={station} showNav={true} className="tv-station--worldwide">
      {/* Hero */}
      <section className="worldwide-hero">
        <div className="worldwide-hero-globe"></div>
        <div className="worldwide-hero-orbit"></div>
        
        <div className="worldwide-hero-content">
          <img
            src={station?.logo}
            alt={station?.name}
            className="worldwide-hero-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="worldwide-hero-title">PowerStream Worldwide</h1>
          <p className="worldwide-hero-subtitle">Global Entertainment Hub</p>
          <p className="worldwide-hero-description">
            Curated channels and content from around the world. One platform, endless perspectives.
          </p>
          
          <div className="worldwide-hero-actions">
            <button
              className="worldwide-btn worldwide-btn--primary"
              onClick={() => document.querySelector('.worldwide-channels')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>🌍</span>
              <span>Explore Channels</span>
            </button>
            <button className="worldwide-btn worldwide-btn--secondary">
              <span>📺</span>
              <span>Browse by Region</span>
            </button>
          </div>
        </div>
      </section>

      {/* Region Selector */}
      <div className="worldwide-regions">
        {regions.map(region => (
          <button
            key={region.id}
            className={`worldwide-region ${selectedRegion === region.id ? 'worldwide-region--active' : ''}`}
            onClick={() => setSelectedRegion(region.id)}
          >
            <span className="worldwide-region-flag">{region.flag}</span>
            <span className="worldwide-region-name">{region.name}</span>
            <span className="worldwide-region-count">
              {region.id === 'all' 
                ? channels.length 
                : channels.filter(c => c.region === region.id).length
              } channels
            </span>
          </button>
        ))}
      </div>

      {/* Featured Content */}
      {featuredContent.length > 0 && (
        <section className="worldwide-featured">
          <div className="worldwide-section-header">
            <h2 className="worldwide-section-title">Featured Worldwide</h2>
          </div>
          
          <div className="worldwide-featured-grid">
            {/* Main featured */}
            <div
              className="worldwide-featured-main"
              onClick={() => handleVideoClick(featuredContent[0])}
            >
              <img
                src={featuredContent[0]?.thumb_url || '/images/tv-default-cover.jpg'}
                alt={featuredContent[0]?.title}
                onError={(e) => { e.target.src = '/images/tv-default-cover.jpg'; }}
              />
              <div className="worldwide-featured-main-overlay">
                <span className="worldwide-featured-label">Featured</span>
                <h3 className="worldwide-featured-title">{featuredContent[0]?.title}</h3>
                <p className="worldwide-featured-description">
                  {featuredContent[0]?.description?.slice(0, 150)}
                  {featuredContent[0]?.description?.length > 150 ? '...' : ''}
                </p>
              </div>
            </div>

            {/* Sidebar featured */}
            <div className="worldwide-featured-sidebar">
              {featuredContent.slice(1).map(video => (
                <div
                  key={video.id}
                  className="worldwide-featured-item"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="worldwide-featured-thumb">
                    <img
                      src={video.thumb_url || '/images/tv-default-thumb.jpg'}
                      alt={video.title}
                      onError={(e) => { e.target.src = '/images/tv-default-thumb.jpg'; }}
                    />
                  </div>
                  <div className="worldwide-featured-item-info">
                    <h4>{video.title}</h4>
                    <p>{video.creator_name || 'Worldwide TV'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Channels Grid */}
      <section className="worldwide-channels">
        <div className="worldwide-section-header">
          <h2 className="worldwide-section-title">Global Channels</h2>
        </div>

        {loading ? (
          <div className="worldwide-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="worldwide-channel-card" style={{ opacity: 0.5 }}>
                <div style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.1)' }}></div>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ height: 20, background: 'rgba(255,255,255,0.1)', marginBottom: 8 }}></div>
                  <div style={{ height: 14, width: '60%', background: 'rgba(255,255,255,0.05)' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="worldwide-grid">
            {channels.map((channel, idx) => {
              const region = regions.find(r => r.id === channel.region) || regions[0];
              const latestVideo = channel.videos[0];

              return (
                <article
                  key={idx}
                  className="worldwide-channel-card"
                  onClick={() => handleChannelClick(channel)}
                >
                  <div className="worldwide-channel-banner">
                    <img
                      src={latestVideo?.thumb_url || '/images/tv-default-cover.jpg'}
                      alt={channel.name}
                      onError={(e) => { e.target.src = '/images/tv-default-cover.jpg'; }}
                    />
                    <div className="worldwide-channel-overlay"></div>
                    <span className="worldwide-channel-region">
                      <span>{region.flag}</span>
                      {region.name}
                    </span>
                    {channel.isLive && (
                      <span className="worldwide-channel-live">
                        <span className="tv-live-dot"></span>
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="worldwide-channel-info">
                    <h3 className="worldwide-channel-name">{channel.name}</h3>
                    <p className="worldwide-channel-tagline">
                      {channel.videos.length} video{channel.videos.length !== 1 ? 's' : ''}
                    </p>
                    {latestVideo?.description && (
                      <p className="worldwide-channel-description">
                        {latestVideo.description.slice(0, 80)}...
                      </p>
                    )}
                    <div className="worldwide-channel-meta">
                      <span>{channel.videos.reduce((sum, v) => sum + (v.views || 0), 0).toLocaleString()} views</span>
                      {latestVideo?.created_at && (
                        <span>Updated {formatRelativeTime(latestVideo.created_at)}</span>
                      )}
                    </div>
                  </div>
                  <div className="worldwide-channel-cta">
                    <span>Watch Now</span>
                    <span>→</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && channels.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#9090a0' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🌍</span>
            <h3>No channels available</h3>
            <p>Content from around the world coming soon.</p>
          </div>
        )}
      </section>

      {/* Language Filter */}
      <section style={{ padding: '2rem' }}>
        <div className="worldwide-section-header">
          <h2 className="worldwide-section-title">Browse by Language</h2>
        </div>
        <div className="worldwide-languages">
          {languages.map(lang => (
            <button key={lang.id} className="worldwide-language">
              {lang.name}
            </button>
          ))}
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          station={station}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </StationShell>
  );
}

