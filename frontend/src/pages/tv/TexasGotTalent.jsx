// frontend/src/pages/tv/TexasGotTalent.jsx
// Texas Got Talent TV - Talent Show with Voting & Submissions

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import { getStationBySlug } from '../../data/tvStations.js';
import StationShell from '../../components/tv/StationShell.jsx';
import VideoModal from '../../components/tv/VideoModal.jsx';
import UploadPanel from '../../components/tv/UploadPanel.jsx';
import VotePanel from '../../components/tv/VotePanel.jsx';
import ScheduleGrid from '../../components/tv/ScheduleGrid.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { submitVote, getVoteCounts } from '../../components/tv/tvUtils.js';
import '../../styles/tv-station-base.css';
import '../../styles/tv-talent.css';

export default function TexasGotTalent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const station = getStationBySlug('texas-got-talent');

  const [contestants, setContestants] = useState([]);
  const [featuredContestant, setFeaturedContestant] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [votedFor, setVotedFor] = useState(new Set());
  const [isLive, setIsLive] = useState(false);
  const [liveShow, setLiveShow] = useState(null);

  const userId = user?.id || user?._id;

  // Fetch contestants with vote counts
  useEffect(() => {
    const fetchContestants = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tv_videos')
          .select('*')
          .eq('station_slug', 'texas-got-talent')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const videos = data || [];

        // Get vote counts for each
        const withVotes = await Promise.all(
          videos.map(async (v) => {
            const counts = await getVoteCounts(v.id).catch(() => ({ total: 0 }));
            return { ...v, voteCount: counts.total };
          })
        );

        // Sort by votes
        withVotes.sort((a, b) => b.voteCount - a.voteCount);
        setContestants(withVotes);

        // Check for live show
        const live = videos.find(v => v.is_live);
        if (live) {
          setIsLive(true);
          setLiveShow(live);
        }

        // Featured = top voted or most recent
        setFeaturedContestant(withVotes[0]);
      } catch (err) {
        console.error('Error fetching contestants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContestants();
  }, []);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleVote = async (videoId) => {
    if (!userId) {
      alert('Please log in to vote');
      return;
    }

    if (votedFor.has(videoId)) return;

    try {
      await submitVote('texas-got-talent', videoId, userId, 1);
      setVotedFor(prev => new Set([...prev, videoId]));
      
      // Update local state
      setContestants(prev =>
        prev.map(c =>
          c.id === videoId
            ? { ...c, voteCount: (c.voteCount || 0) + 1 }
            : c
        ).sort((a, b) => b.voteCount - a.voteCount)
      );
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    window.location.reload();
  };

  // Get rank emoji
  const getRankEmoji = (idx) => {
    if (idx === 0) return '🥇';
    if (idx === 1) return '🥈';
    if (idx === 2) return '🥉';
    return `#${idx + 1}`;
  };

  return (
    <StationShell station={station} showNav={true} className="tv-station--talent">
      {/* Spotlight Hero */}
      <section className="tgt-hero">
        <div className="tgt-hero-spotlight"></div>
        <div className="tgt-hero-stars"></div>
        
        <div className="tgt-hero-content">
          <img
            src={station?.logo}
            alt={station?.name}
            className="tgt-hero-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="tgt-hero-title">Texas Got Talent</h1>
          <p className="tgt-hero-subtitle">★ Discover Tomorrow's Stars Today ★</p>
          <p className="tgt-hero-tagline">
            The ultimate talent showcase. Submit your performance, vote for your favorites, and watch stars rise.
          </p>
          
          <div className="tgt-hero-actions">
            {isLive && liveShow ? (
              <button
                className="tgt-btn tgt-btn--primary"
                onClick={() => handleVideoClick(liveShow)}
              >
                <span>▶</span> Watch Live Show
              </button>
            ) : (
              <button
                className="tgt-btn tgt-btn--primary"
                onClick={() => document.querySelector('.tgt-contestants')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span>👍</span> Vote Now
              </button>
            )}
            {user && (
              <button
                className="tgt-btn tgt-btn--secondary"
                onClick={() => setShowUpload(true)}
              >
                <span>🎭</span> Submit Performance
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Live Show Banner */}
      {isLive && liveShow && (
        <div className="tgt-live-banner">
          <div className="tgt-live-badge">
            <span className="pulse"></span>
            LIVE NOW
          </div>
          <span className="tgt-live-text">{liveShow.title || 'Texas Got Talent Live!'}</span>
          <button
            className="tgt-live-cta"
            onClick={() => handleVideoClick(liveShow)}
          >
            Join Now →
          </button>
        </div>
      )}

      {/* Contestants / Voting Section */}
      <section className="tgt-contestants">
        <div className="tgt-section-header">
          <h2 className="tgt-section-title">
            <span>🎭</span> Current Contestants
          </h2>
        </div>

        {loading ? (
          <div className="tgt-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="tgt-contestant-card" style={{ opacity: 0.5 }}>
                <div style={{ aspectRatio: '4/3', background: 'rgba(255,255,255,0.1)' }}></div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ height: 20, background: 'rgba(255,255,255,0.1)', marginBottom: 8 }}></div>
                  <div style={{ height: 14, width: '60%', background: 'rgba(255,255,255,0.05)' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="tgt-grid">
            {contestants.map((contestant, idx) => {
              const hasVoted = votedFor.has(contestant.id);

              return (
                <article
                  key={contestant.id}
                  className={`tgt-contestant-card ${idx < 3 ? `tgt-contestant-card--rank-${idx + 1}` : ''}`}
                >
                  {/* Rank Badge */}
                  {idx < 3 && (
                    <div className="tgt-contestant-rank">{getRankEmoji(idx)}</div>
                  )}

                  {/* Media */}
                  <div
                    className="tgt-contestant-media"
                    onClick={() => handleVideoClick(contestant)}
                  >
                    <img
                      src={contestant.thumb_url || '/images/tv-default-thumb.jpg'}
                      alt={contestant.title}
                      onError={(e) => { e.target.src = '/images/tv-default-thumb.jpg'; }}
                    />
                    <div className="tgt-contestant-media-overlay"></div>
                    <div className="tgt-contestant-play">▶</div>
                  </div>

                  {/* Info */}
                  <div className="tgt-contestant-info">
                    <h3 className="tgt-contestant-name">{contestant.title || 'Contestant'}</h3>
                    <p className="tgt-contestant-talent">
                      {contestant.creator_name || 'Unknown'} • {contestant.tags?.[0] || 'Performance'}
                    </p>

                    <div className="tgt-contestant-stats">
                      <div className="tgt-stat">
                        <span className="tgt-stat-value">{contestant.voteCount || 0}</span>
                        <span className="tgt-stat-label">Votes</span>
                      </div>
                      <div className="tgt-stat">
                        <span className="tgt-stat-value">{contestant.views || 0}</span>
                        <span className="tgt-stat-label">Views</span>
                      </div>
                    </div>

                    <button
                      className={`tgt-vote-btn ${hasVoted ? 'tgt-vote-btn--voted' : ''}`}
                      onClick={() => handleVote(contestant.id)}
                      disabled={hasVoted}
                    >
                      {hasVoted ? '✓ Voted' : '👍 Vote'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && contestants.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#888' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🎭</span>
            <h3>No contestants yet</h3>
            <p>Be the first to submit your performance!</p>
            {user && (
              <button
                className="tgt-btn tgt-btn--primary"
                onClick={() => setShowUpload(true)}
                style={{ marginTop: '1rem' }}
              >
                Submit Now
              </button>
            )}
          </div>
        )}
      </section>

      {/* Submit Performance Section */}
      <section className="tgt-submit-section">
        <div className="tgt-submit-card">
          <span className="tgt-submit-icon">🌟</span>
          <h2 className="tgt-submit-title">Got Talent?</h2>
          <p className="tgt-submit-description">
            Submit your audition video and let Texas see what you've got! 
            Singers, dancers, comedians, musicians - all talents welcome.
          </p>
          <div className="tgt-submit-features">
            <span className="tgt-submit-feature"><span>✓</span> Free to submit</span>
            <span className="tgt-submit-feature"><span>✓</span> Public voting</span>
            <span className="tgt-submit-feature"><span>✓</span> Cash prizes</span>
            <span className="tgt-submit-feature"><span>✓</span> TV exposure</span>
          </div>
          {user ? (
            <button
              className="tgt-btn tgt-btn--primary"
              onClick={() => setShowUpload(true)}
            >
              Submit Your Performance
            </button>
          ) : (
            <button
              className="tgt-btn tgt-btn--secondary"
              onClick={() => navigate('/login')}
            >
              Sign In to Submit
            </button>
          )}
        </div>
      </section>

      {/* Leaderboard */}
      {contestants.length > 0 && (
        <section className="tgt-leaderboard">
          <div className="tgt-section-header">
            <h2 className="tgt-section-title">
              <span>🏆</span> Leaderboard
            </h2>
          </div>
          <div className="tgt-leaderboard-list">
            {contestants.slice(0, 10).map((contestant, idx) => (
              <div
                key={contestant.id}
                className={`tgt-leaderboard-item tgt-leaderboard-item--${idx + 1}`}
              >
                <div className="tgt-leaderboard-rank">{getRankEmoji(idx)}</div>
                <img
                  src={contestant.thumb_url || '/images/tv-default-avatar.jpg'}
                  alt=""
                  className="tgt-leaderboard-avatar"
                  onError={(e) => { e.target.src = '/images/tv-default-avatar.jpg'; }}
                />
                <div className="tgt-leaderboard-info">
                  <h4 className="tgt-leaderboard-name">{contestant.title}</h4>
                  <p className="tgt-leaderboard-talent">{contestant.creator_name}</p>
                </div>
                <div className="tgt-leaderboard-votes">
                  <span className="tgt-leaderboard-votes-count">{contestant.voteCount || 0}</span>
                  <span className="tgt-leaderboard-votes-label">votes</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Schedule */}
      <section style={{ padding: '3rem 2rem', background: 'rgba(255,215,0,0.03)' }}>
        <div className="tgt-section-header">
          <h2 className="tgt-section-title">
            <span>📅</span> Show Schedule
          </h2>
        </div>
        <ScheduleGrid stationSlug="texas-got-talent" />
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          station={station}
          onClose={() => setSelectedVideo(null)}
          showVoting={true}
          onVote={(videoId, value) => handleVote(videoId)}
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

