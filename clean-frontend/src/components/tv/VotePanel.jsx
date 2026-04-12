// frontend/src/components/tv/VotePanel.jsx
// Voting component for talent shows

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { submitVote, getVoteCounts, fetchStationVideos } from './tvUtils.js';

export default function VotePanel({
  stationSlug,
  video = null, // Single video voting
  category = null, // Category for listing
  title = 'Vote for Your Favorite',
  onVoteSuccess,
  className = '',
}) {
  const { user } = useAuth();
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(null);
  const [votedFor, setVotedFor] = useState(new Set());
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const userId = user?.id || user?._id;

  // Fetch contestants if showing category
  useEffect(() => {
    if (video) {
      // Single video mode
      setContestants([video]);
      setLoading(false);
      return;
    }

    const loadContestants = async () => {
      try {
        setLoading(true);
        const videos = await fetchStationVideos(stationSlug, {
          category: category || 'contestant',
          limit: 20,
        });
        
        // Load vote counts for each
        const withVotes = await Promise.all(
          videos.map(async (v) => {
            const counts = await getVoteCounts(v.id).catch(() => ({ total: 0, count: 0 }));
            return { ...v, voteCount: counts.total };
          })
        );

        // Sort by vote count
        withVotes.sort((a, b) => b.voteCount - a.voteCount);
        setContestants(withVotes);
      } catch (err) {
        console.error('Failed to load contestants:', err);
        setError('Failed to load contestants');
      } finally {
        setLoading(false);
      }
    };

    loadContestants();
  }, [stationSlug, category, video]);

  // Handle vote
  const handleVote = async (videoId) => {
    if (!userId) {
      setError('Please log in to vote');
      return;
    }

    if (votedFor.has(videoId)) {
      setError('You already voted for this contestant');
      return;
    }

    setVoting(videoId);
    setError(null);

    try {
      await submitVote(stationSlug, videoId, userId, 1);
      
      setVotedFor(prev => new Set([...prev, videoId]));
      setSuccess('Vote submitted successfully!');
      
      // Update local vote count
      setContestants(prev => 
        prev.map(c => 
          c.id === videoId 
            ? { ...c, voteCount: (c.voteCount || 0) + 1 }
            : c
        ).sort((a, b) => b.voteCount - a.voteCount)
      );

      onVoteSuccess?.(videoId);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Vote error:', err);
      setError('Failed to submit vote. Please try again.');
    } finally {
      setVoting(null);
    }
  };

  if (loading) {
    return (
      <section className={`tv-vote-panel tv-vote-panel--loading ${className}`}>
        <h3 className="tv-vote-title">{title}</h3>
        <div className="tv-vote-skeleton">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="tv-vote-card tv-vote-card--skeleton">
              <div className="tv-vote-thumb-skeleton"></div>
              <div className="tv-vote-info-skeleton"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`tv-vote-panel ${className}`}>
      <h3 className="tv-vote-title">{title}</h3>

      {/* Success message */}
      {success && (
        <div className="tv-vote-success">
          <span>✓</span>
          <p>{success}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="tv-vote-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Empty state */}
      {contestants.length === 0 && (
        <div className="tv-vote-empty">
          <span>🎭</span>
          <p>No contestants available for voting</p>
        </div>
      )}

      {/* Contestants grid */}
      <div className="tv-vote-grid">
        {contestants.map((contestant, idx) => {
          const hasVoted = votedFor.has(contestant.id);
          const isVoting = voting === contestant.id;
          const rank = idx + 1;

          return (
            <div 
              key={contestant.id}
              className={`tv-vote-card ${hasVoted ? 'tv-vote-card--voted' : ''} ${rank <= 3 ? `tv-vote-card--rank-${rank}` : ''}`}
            >
              {/* Rank badge */}
              {rank <= 3 && (
                <div className="tv-vote-rank">
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                </div>
              )}

              {/* Thumbnail */}
              <div className="tv-vote-thumb">
                <img 
                  src={contestant.thumb_url || '/images/tv-default-thumb.jpg'} 
                  alt={contestant.title}
                  onError={(e) => { e.target.src = '/images/tv-default-thumb.jpg'; }}
                />
                {contestant.is_live && (
                  <span className="tv-vote-live">
                    <span className="tv-live-dot"></span>
                    LIVE
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="tv-vote-info">
                <h4 className="tv-vote-name">{contestant.title}</h4>
                {contestant.creator_name && (
                  <p className="tv-vote-creator">{contestant.creator_name}</p>
                )}
                <div className="tv-vote-count">
                  <span className="tv-vote-count-num">{contestant.voteCount || 0}</span>
                  <span className="tv-vote-count-label">votes</span>
                </div>
              </div>

              {/* Vote button */}
              <button
                className={`tv-vote-btn ${hasVoted ? 'tv-vote-btn--voted' : ''}`}
                onClick={() => handleVote(contestant.id)}
                disabled={isVoting || hasVoted}
              >
                {isVoting ? (
                  <span className="tv-vote-spinner"></span>
                ) : hasVoted ? (
                  <>
                    <span>✓</span>
                    <span>Voted</span>
                  </>
                ) : (
                  <>
                    <span>👍</span>
                    <span>Vote</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Login prompt */}
      {!userId && (
        <div className="tv-vote-login-prompt">
          <p>Log in to vote for your favorites!</p>
        </div>
      )}
    </section>
  );
}

