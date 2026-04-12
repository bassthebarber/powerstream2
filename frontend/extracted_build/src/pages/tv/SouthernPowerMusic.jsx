// frontend/src/pages/tv/SouthernPowerMusic.jsx
// Southern Power Music TV - 24/7 Music Video Channel

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import { getStationBySlug } from '../../data/tvStations.js';
import StationShell from '../../components/tv/StationShell.jsx';
import LivePlayer from '../../components/tv/LivePlayer.jsx';
import VideoModal from '../../components/tv/VideoModal.jsx';
import ScheduleGrid from '../../components/tv/ScheduleGrid.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDuration } from '../../components/tv/tvUtils.js';
import '../../styles/tv-station-base.css';
import '../../styles/tv-music.css';

export default function SouthernPowerMusic() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const station = getStationBySlug('southern-power-music');

  const [videos, setVideos] = useState([]);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [isLive, setIsLive] = useState(false);
  const [liveStream, setLiveStream] = useState(null);

  const genres = [
    { id: 'all', name: 'All Music', color: '#e6b800' },
    { id: 'hiphop', name: 'Hip-Hop', color: '#ff5722' },
    { id: 'rnb', name: 'R&B', color: '#9c27b0' },
    { id: 'gospel', name: 'Gospel', color: '#ffc107' },
    { id: 'country', name: 'Southern Country', color: '#795548' },
    { id: 'electronic', name: 'Electronic', color: '#00bcd4' },
  ];

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('tv_videos')
          .select('*')
          .eq('station_slug', 'southern-power-music')
          .order('created_at', { ascending: false });

        if (selectedGenre !== 'all') {
          query = query.contains('tags', [selectedGenre]);
        }

        const { data, error } = await query.limit(50);

        if (error) throw error;

        setVideos(data || []);

        // Check for live stream
        const live = data?.find(v => v.is_live);
        if (live) {
          setIsLive(true);
          setLiveStream(live);
        }

        // Set "now playing" to most recent or live
        setNowPlaying(live || data?.[0]);
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

  const handlePlayVideo = (video) => {
    setNowPlaying(video);
    // Scroll to top to see player
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate visualizer bars
  const visualizerBars = Array.from({ length: 40 }, (_, i) => ({
    height: 30 + Math.random() * 120,
    duration: 0.5 + Math.random() * 0.8,
  }));

  // Get genre color
  const getGenreColor = (genreId) => {
    return genres.find(g => g.id === genreId)?.color || '#e6b800';
  };

  return (
    <StationShell station={station} showNav={true} className="tv-station--music">
      {/* Hero with Visualizer */}
      <section className="music-hero">
        <div className="music-hero-visualizer">
          {visualizerBars.map((bar, i) => (
            <div
              key={i}
              className="music-hero-bar"
              style={{
                '--height': `${bar.height}px`,
                '--duration': `${bar.duration}s`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
        
        <div className="music-hero-content">
          {isLive && (
            <div className="music-hero-badge">
              <span className="tv-live-dot"></span>
              LIVE 24/7
            </div>
          )}
          <img
            src={station?.logo}
            alt={station?.name}
            className="music-hero-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="music-hero-title">Southern Power Music TV</h1>
          <p className="music-hero-subtitle">
            Non-stop music videos from the South. Hip-hop, R&B, gospel, and more.
          </p>
          
          <div className="music-hero-actions">
            <button
              className="music-btn music-btn--primary"
              onClick={() => nowPlaying && handlePlayVideo(nowPlaying)}
            >
              <span>▶</span>
              <span>Watch Now</span>
            </button>
            <button className="music-btn music-btn--secondary">
              <span>📺</span>
              <span>View Schedule</span>
            </button>
          </div>
        </div>
      </section>

      {/* Now Playing Bar */}
      {nowPlaying && (
        <div className="music-now-playing">
          <div className="music-now-playing-label">
            <span className="tv-live-dot"></span>
            NOW PLAYING
          </div>
          <div className="music-now-playing-track">
            <img
              src={nowPlaying.thumb_url || '/images/tv-default-thumb.jpg'}
              alt={nowPlaying.title}
              className="music-now-playing-thumb"
              onError={(e) => { e.target.src = '/images/tv-default-thumb.jpg'; }}
            />
            <div className="music-now-playing-info">
              <h4>{nowPlaying.title}</h4>
              <p>{nowPlaying.creator_name || 'Artist'}</p>
            </div>
          </div>
          <button
            className="music-btn music-btn--primary"
            style={{ padding: '0.5rem 1rem' }}
            onClick={() => handleVideoClick(nowPlaying)}
          >
            Watch
          </button>
        </div>
      )}

      {/* Genre Filter */}
      <div className="music-genres">
        {genres.map(genre => (
          <button
            key={genre.id}
            className={`music-genre ${selectedGenre === genre.id ? 'music-genre--active' : ''}`}
            style={{ '--genre-color': genre.color }}
            onClick={() => setSelectedGenre(genre.id)}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Videos Section */}
      <section className="music-section">
        <div className="music-section-header">
          <h2 className="music-section-title">
            {selectedGenre === 'all' ? 'Latest Videos' : genres.find(g => g.id === selectedGenre)?.name}
          </h2>
        </div>

        {loading ? (
          <div className="music-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="music-video-card" style={{ opacity: 0.5 }}>
                <div style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.1)', borderRadius: 12 }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="music-grid">
            {videos.map(video => {
              const videoGenre = video.tags?.find(t => genres.some(g => g.id === t)) || 'hiphop';
              return (
                <article
                  key={video.id}
                  className="music-video-card"
                  onClick={() => handleVideoClick(video)}
                >
                  <img
                    src={video.thumb_url || '/images/tv-default-thumb.jpg'}
                    alt={video.title}
                    className="music-video-thumb"
                    onError={(e) => { e.target.src = '/images/tv-default-thumb.jpg'; }}
                  />
                  <div className="music-video-overlay">
                    <span
                      className="music-video-genre"
                      style={{ '--genre-color': getGenreColor(videoGenre) }}
                    >
                      {videoGenre}
                    </span>
                    <h3 className="music-video-title">{video.title}</h3>
                    <p className="music-video-artist">{video.creator_name || 'Artist'}</p>
                  </div>
                  <div className="music-video-play">▶</div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && videos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#888' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🎵</span>
            <h3>No videos in this genre</h3>
            <p>Check back soon for new releases.</p>
          </div>
        )}
      </section>

      {/* Schedule */}
      <section className="music-schedule">
        <div className="music-section-header">
          <h2 className="music-section-title">Today's Playlist</h2>
        </div>
        <ScheduleGrid stationSlug="southern-power-music" />
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          station={station}
          onClose={() => setSelectedVideo(null)}
          onPlay={() => {
            handlePlayVideo(selectedVideo);
            setSelectedVideo(null);
          }}
        />
      )}
    </StationShell>
  );
}

