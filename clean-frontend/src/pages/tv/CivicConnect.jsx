// frontend/src/pages/tv/CivicConnect.jsx
// Civic Connect TV - Community News & Civic Engagement

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import { getStationBySlug } from '../../data/tvStations.js';
import StationShell from '../../components/tv/StationShell.jsx';
import VideoModal from '../../components/tv/VideoModal.jsx';
import UploadPanel from '../../components/tv/UploadPanel.jsx';
import ScheduleGrid from '../../components/tv/ScheduleGrid.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatRelativeTime } from '../../components/tv/tvUtils.js';
import '../../styles/tv-station-base.css';
import '../../styles/tv-civic.css';

export default function CivicConnect() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const station = getStationBySlug('civic-connect');

  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isLive, setIsLive] = useState(false);
  const [liveShow, setLiveShow] = useState(null);

  const tabs = [
    { id: 'all', name: 'All' },
    { id: 'news', name: 'Local News' },
    { id: 'politics', name: 'Politics' },
    { id: 'community', name: 'Community' },
    { id: 'education', name: 'Education' },
    { id: 'events', name: 'Events' },
  ];

  // Breaking news ticker items (would come from Supabase in production)
  const breakingNews = [
    'City Council approves new community center funding',
    'Local school district announces new STEM program',
    'Community cleanup event this Saturday at Memorial Park',
    'Town hall meeting scheduled for Thursday at 7 PM',
  ];

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('tv_videos')
          .select('*')
          .eq('station_slug', 'civic-connect')
          .order('created_at', { ascending: false });

        if (activeTab !== 'all') {
          query = query.contains('tags', [activeTab]);
        }

        const { data, error } = await query.limit(50);

        if (error) throw error;

        setVideos(data || []);

        // Check for live
        const live = data?.find(v => v.is_live);
        if (live) {
          setIsLive(true);
          setLiveShow(live);
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [activeTab]);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    window.location.reload();
  };

  // Get category color
  const getCategoryColor = (tag) => {
    const colors = {
      news: '#1e88e5',
      politics: '#43a047',
      community: '#ff9800',
      education: '#9c27b0',
      events: '#00bcd4',
    };
    return colors[tag] || '#1e88e5';
  };

  return (
    <StationShell station={station} showNav={true} className="tv-station--civic">
      {/* Hero */}
      <section className="civic-hero">
        <div className="civic-hero-pattern"></div>
        <div className="civic-hero-grid"></div>
        
        <div className="civic-hero-content">
          <div className="civic-hero-left">
            <img
              src={station?.logo}
              alt={station?.name}
              className="civic-hero-logo"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 className="civic-hero-title">Civic Connect TV</h1>
            <p className="civic-hero-subtitle">Community. News. Action.</p>
            <p className="civic-hero-description">
              Stay informed with local news, community discussions, and civic engagement programming. 
              Your voice matters.
            </p>
            <div className="civic-hero-stats">
              <div className="civic-stat">
                <span className="civic-stat-value">{videos.length}+</span>
                <span className="civic-stat-label">Videos</span>
              </div>
              <div className="civic-stat">
                <span className="civic-stat-value">24/7</span>
                <span className="civic-stat-label">Coverage</span>
              </div>
              <div className="civic-stat">
                <span className="civic-stat-value">Local</span>
                <span className="civic-stat-label">Focus</span>
              </div>
            </div>
          </div>

          {/* Live Panel */}
          {isLive && liveShow && (
            <div className="civic-hero-live">
              <div className="civic-hero-live-badge">
                <span className="tv-live-dot"></span>
                LIVE NOW
              </div>
              <h3 className="civic-hero-live-title">{liveShow.title}</h3>
              <button
                className="civic-hero-live-btn"
                onClick={() => handleVideoClick(liveShow)}
              >
                Watch Live →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Breaking News Ticker */}
      <div className="civic-ticker">
        <div className="civic-ticker-label">BREAKING</div>
        <div className="civic-ticker-content">
          <div className="civic-ticker-text">
            {[...breakingNews, ...breakingNews].map((item, i) => (
              <span key={i} className="civic-ticker-item">
                <span className="civic-ticker-dot"></span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="civic-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`civic-tab ${activeTab === tab.id ? 'civic-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content Section */}
      <section className="civic-section">
        <div className="civic-section-header">
          <h2 className="civic-section-title">Latest Coverage</h2>
          {user && (
            <button
              className="civic-hero-live-btn"
              onClick={() => setShowUpload(true)}
            >
              + Submit Story
            </button>
          )}
        </div>

        {loading ? (
          <div className="civic-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="civic-card" style={{ opacity: 0.5 }}>
                <div style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.1)' }}></div>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ height: 20, background: 'rgba(255,255,255,0.1)', marginBottom: 8 }}></div>
                  <div style={{ height: 14, width: '80%', background: 'rgba(255,255,255,0.05)' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="civic-grid">
            {videos.map(video => {
              const category = video.tags?.[0] || 'news';
              return (
                <article
                  key={video.id}
                  className="civic-card"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="civic-card-media">
                    <img
                      src={video.thumb_url || '/images/tv-default-thumb.jpg'}
                      alt={video.title}
                      onError={(e) => { e.target.src = '/images/tv-default-thumb.jpg'; }}
                    />
                    <span
                      className={`civic-card-category civic-card-category--${category}`}
                      style={{ background: getCategoryColor(category) }}
                    >
                      {category}
                    </span>
                    {video.is_live && (
                      <span className="civic-card-live">
                        <span className="tv-live-dot"></span>
                        LIVE
                      </span>
                    )}
                    {video.duration && (
                      <span className="civic-card-duration">
                        {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  <div className="civic-card-info">
                    <h3 className="civic-card-title">{video.title}</h3>
                    {video.description && (
                      <p className="civic-card-excerpt">{video.description}</p>
                    )}
                    <div className="civic-card-meta">
                      <span className="civic-card-author">
                        {video.creator_name || 'Civic Connect'}
                      </span>
                      <span>{formatRelativeTime(video.created_at)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && videos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#8ba4c0' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📰</span>
            <h3>No content in this category</h3>
            <p>Check back soon for updates.</p>
          </div>
        )}
      </section>

      {/* Community Resources */}
      <section className="civic-section civic-section--alt">
        <div className="civic-section-header">
          <h2 className="civic-section-title">Community Resources</h2>
        </div>
        <div className="civic-community">
          <div className="civic-community-card">
            <span className="civic-community-icon">🏛️</span>
            <h3 className="civic-community-title">City Hall</h3>
            <p className="civic-community-description">Access local government services and information</p>
          </div>
          <div className="civic-community-card">
            <span className="civic-community-icon">📋</span>
            <h3 className="civic-community-title">Register to Vote</h3>
            <p className="civic-community-description">Make your voice heard in local elections</p>
          </div>
          <div className="civic-community-card">
            <span className="civic-community-icon">📅</span>
            <h3 className="civic-community-title">Community Events</h3>
            <p className="civic-community-description">Find local events and gatherings</p>
          </div>
          <div className="civic-community-card">
            <span className="civic-community-icon">🤝</span>
            <h3 className="civic-community-title">Volunteer</h3>
            <p className="civic-community-description">Get involved with community organizations</p>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="civic-section">
        <div className="civic-section-header">
          <h2 className="civic-section-title">Programming Schedule</h2>
        </div>
        <div className="civic-schedule">
          <div className="civic-schedule-header">
            <span>📺</span>
            <h4>Today's Shows</h4>
          </div>
          <ScheduleGrid stationSlug="civic-connect" showDaySelector={true} />
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

      {/* Upload Panel */}
      {showUpload && (
        <UploadPanel
          station={station}
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </StationShell>
  );
}

