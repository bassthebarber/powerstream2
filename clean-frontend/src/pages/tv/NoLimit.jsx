// frontend/src/pages/tv/NoLimit.jsx
// No Limit East Houston TV - MTV-style urban music channel

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import { getStationBySlug } from '../../data/tvStations.js';
import StationShell from '../../components/tv/StationShell.jsx';
import LivePlayer from '../../components/tv/LivePlayer.jsx';
import VideoGrid from '../../components/tv/VideoGrid.jsx';
import VideoModal from '../../components/tv/VideoModal.jsx';
import UploadPanel from '../../components/tv/UploadPanel.jsx';
import ScheduleGrid from '../../components/tv/ScheduleGrid.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../styles/tv-station-base.css';
import '../../styles/tv-nolimit.css';

export default function NoLimit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const station = getStationBySlug('nolimit');

  const [videos, setVideos] = useState([]);
  const [featuredVideo, setFeaturedVideo] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [isLive, setIsLive] = useState(false);
  const [liveVideo, setLiveVideo] = useState(null);

  const genres = [
    { id: 'all', name: 'All Videos' },
    { id: 'hiphop', name: 'Hip-Hop' },
    { id: 'rnb', name: 'R&B' },
    { id: 'trap', name: 'Trap' },
    { id: 'live', name: 'Live Performances' },
    { id: 'exclusive', name: 'Exclusives' },
  ];

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('tv_videos')
          .select('*')
          .eq('station_slug', 'nolimit')
          .order('created_at', { ascending: false });

        if (selectedGenre !== 'all') {
          query = query.contains('tags', [selectedGenre]);
        }

        const { data, error } = await query.limit(50);

        if (error) throw error;

        setVideos(data || []);

        // Set featured video (first non-live video or most recent)
        const featured = data?.find(v => !v.is_live) || data?.[0];
        setFeaturedVideo(featured);

        // Check for live stream
        const live = data?.find(v => v.is_live);
        if (live) {
          setIsLive(true);
          setLiveVideo(live);
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectedGenre]);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    // Refresh videos
    window.location.reload();
  };

  // Ticker content
  const tickerItems = [
    { text: 'NEW DROP: Fresh music videos every day', hot: true },
    { text: 'LIVE: Friday Night Freestyles at 9PM CST' },
    { text: 'EXCLUSIVE: Houston Underground premieres' },
    { text: 'SUBMIT: Your music video for rotation' },
  ];

  return (
    <StationShell station={station} showNav={true}>
      {/* MTV-Style Hero */}
      <section className="nolimit-hero">
        {liveVideo ? (
          <video
            className="nolimit-hero-video"
            src={liveVideo.video_url}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : featuredVideo?.video_url && (
          <video
            className="nolimit-hero-video"
            src={featuredVideo.video_url}
            autoPlay
            muted
            loop
            playsInline
          />
        )}
        <div className="nolimit-hero-glitch"></div>
        <div className="nolimit-hero-overlay"></div>
        
        <div className="nolimit-hero-content">
          <img
            src={station?.logo}
            alt={station?.name}
            className="nolimit-hero-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="nolimit-hero-title">
            NO LIMIT<br />EAST HOUSTON
          </h1>
          <p className="nolimit-hero-subtitle">Where the Culture Lives</p>
          
          <div className="nolimit-hero-actions">
            {isLive && liveVideo ? (
              <button
                className="nolimit-btn"
                onClick={() => handleVideoClick(liveVideo)}
              >
                <span>▶</span> Watch Live Now
              </button>
            ) : featuredVideo && (
              <button
                className="nolimit-btn"
                onClick={() => handleVideoClick(featuredVideo)}
              >
                <span>▶</span> Watch Now
              </button>
            )}
            {user && (
              <button
                className="nolimit-btn nolimit-btn--secondary"
                onClick={() => setShowUpload(true)}
              >
                <span>+</span> Submit Video
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Live Banner (if live) */}
      {isLive && liveVideo && (
        <div className="nolimit-live-banner">
          <div className="nolimit-live-info">
            <div className="nolimit-live-badge">
              <span className="tv-live-dot"></span>
              LIVE NOW
            </div>
            <span className="nolimit-live-title">{liveVideo.title}</span>
            <span className="nolimit-live-viewers">2.4K watching</span>
          </div>
          <button
            className="nolimit-btn"
            onClick={() => handleVideoClick(liveVideo)}
          >
            Join Stream
          </button>
        </div>
      )}

      {/* Ticker */}
      <div className="nolimit-ticker">
        <div className="nolimit-ticker-content">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="nolimit-ticker-item">
              {item.hot && <span className="nolimit-ticker-divider">🔥</span>}
              {item.text}
              <span className="nolimit-ticker-divider">★</span>
            </span>
          ))}
        </div>
      </div>

      {/* Genre Tabs */}
      <div className="nolimit-genres">
        {genres.map(genre => (
          <button
            key={genre.id}
            className={`nolimit-genre ${selectedGenre === genre.id ? 'nolimit-genre--active' : ''}`}
            onClick={() => setSelectedGenre(genre.id)}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Videos Section */}
      <section className="nolimit-section">
        <div className="nolimit-section-header">
          <h2 className="nolimit-section-title">Latest Videos</h2>
          <button className="nolimit-view-all">
            View All <span>→</span>
          </button>
        </div>

        {loading ? (
          <div className="nolimit-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="nolimit-video-card" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.1)' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="nolimit-grid">
            {videos.map((video, idx) => (
              <article
                key={video.id}
                className="nolimit-video-card"
                onClick={() => handleVideoClick(video)}
              >
                <img
                  src={video.thumb_url || '/images/tv-default-thumb.jpg'}
                  alt={video.title}
                  className="nolimit-video-thumb"
                  onError={(e) => { e.target.src = '/images/tv-default-thumb.jpg'; }}
                />
                <div className="nolimit-video-overlay">
                  {idx < 3 && <span className="nolimit-video-new">NEW</span>}
                  {video.views > 10000 && <span className="nolimit-video-hot">🔥 HOT</span>}
                  <h3 className="nolimit-video-title">{video.title}</h3>
                  <p className="nolimit-video-artist">{video.creator_name || 'Artist'}</p>
                </div>
                <div className="nolimit-video-play">▶</div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Schedule */}
      <section className="nolimit-section nolimit-schedule">
        <div className="nolimit-section-header">
          <h2 className="nolimit-section-title">Today's Schedule</h2>
        </div>
        <ScheduleGrid stationSlug="nolimit" />
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

