// frontend/src/pages/PowerReel.jsx
// PowerReel - TikTok-Class Vertical Video Experience
// Supabase + Black/Gold Theme - Production Ready

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { ReelPlayer, ReelComposer } from '../components/powerreel';
import '../styles/powerreel.css';

// Mock data fallback
const MOCK_REELS = [
  {
    id: '1',
    user_id: 'u1',
    username: 'Southern Power',
    media_url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    caption: 'Check out this new vibe 🔥 #music #reels',
    track_name: 'Original Sound',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    likes: [],
    comments: [],
    views: 1234,
  },
  {
    id: '2',
    user_id: 'u2',
    username: 'No Limit Houston',
    media_url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    caption: 'Studio session highlights 🎤',
    track_name: 'Beat by Producer X',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    likes: ['u3'],
    comments: [{ id: 'c1', user: { name: 'Fan' }, text: 'Fire!' }],
    views: 5678,
  },
];

export default function PowerReel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // State
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showComposer, setShowComposer] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [activeReelComments, setActiveReelComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  const userId = user?.id || user?._id || null;
  const displayName = user?.name || user?.displayName || user?.email?.split('@')[0] || 'Guest';
  const avatarUrl = user?.avatarUrl || user?.avatar;

  // Check for mode from navigation state
  useEffect(() => {
    if (location.state?.mode === 'create') {
      setShowComposer(true);
    }
  }, [location.state]);

  // Fetch reels from Supabase
  const fetchReels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supaError } = await supabase
        .from('reel_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (supaError) throw supaError;
      setReels(data?.length > 0 ? data : MOCK_REELS);
    } catch (err) {
      console.warn('Reels load error:', err);
      setReels(MOCK_REELS);
      setError('Could not load reels. Showing sample content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // Track view
  const handleViewReel = async (reelId) => {
    try {
      const reel = reels.find(r => r.id === reelId);
      if (reel) {
        await supabase
          .from('reel_posts')
          .update({ views: (reel.views || 0) + 1 })
          .eq('id', reelId);
      }
    } catch (err) {
      console.warn('View tracking error:', err);
    }
  };

  // Like handler
  const handleLike = async (reelId) => {
    if (!userId) return;

    try {
      const reel = reels.find(r => r.id === reelId);
      const alreadyLiked = reel?.likes?.includes(userId);
      const newLikes = alreadyLiked
        ? reel.likes.filter(id => id !== userId)
        : [...(reel.likes || []), userId];

      // Optimistic update
      setReels(prev => prev.map(r =>
        r.id === reelId ? { ...r, likes: newLikes } : r
      ));

      // Update in Supabase
      await supabase
        .from('reel_posts')
        .update({ likes: newLikes })
        .eq('id', reelId);
    } catch (err) {
      console.warn('Like error:', err);
    }
  };

  // Open comments panel
  const handleOpenComments = async (reelId) => {
    try {
      const reel = reels.find(r => r.id === reelId);
      setActiveReelComments(reel?.comments || []);
      setShowComments(true);
    } catch (err) {
      console.warn('Comments error:', err);
      setActiveReelComments([]);
      setShowComments(true);
    }
  };

  // Post comment
  const handlePostComment = async () => {
    if (!commentText.trim() || !reels[activeIndex] || !userId) return;
    
    const reelId = reels[activeIndex].id;
    const reel = reels.find(r => r.id === reelId);
    
    const newComment = {
      id: Date.now().toString(),
      user: { name: displayName, avatarUrl },
      text: commentText,
      created_at: new Date().toISOString(),
    };

    const newComments = [...(reel.comments || []), newComment];

    try {
      // Optimistic update
      setReels(prev => prev.map(r =>
        r.id === reelId ? { ...r, comments: newComments } : r
      ));
      setActiveReelComments(newComments);
      setCommentText('');

      // Update in Supabase
      await supabase
        .from('reel_posts')
        .update({ comments: newComments })
        .eq('id', reelId);
    } catch (err) {
      console.warn('Comment error:', err);
    }
  };

  // Share handler
  const handleShare = (reel) => {
    if (navigator.share) {
      navigator.share({
        title: reel.caption || 'Check out this PowerReel!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  // Upload handler
  const handleUpload = async ({ file, preview, caption, hashtags, trackName }) => {
    if (!userId) {
      setError('Please log in to post');
      throw new Error('Not authenticated');
    }

    try {
      let finalVideoUrl = preview;

      // Upload file to storage
      if (file) {
        const fileName = `${userId}/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('reel-videos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('reel-videos')
          .getPublicUrl(fileName);

        finalVideoUrl = publicUrl;
      }

      // Create reel
      const { error: insertError } = await supabase
        .from('reel_posts')
        .insert({
          user_id: userId,
          username: displayName,
          media_url: finalVideoUrl,
          caption: `${caption} ${hashtags}`.trim(),
          track_name: trackName || 'Original Sound',
          views: 0,
          likes: [],
          comments: [],
        });

      if (insertError) throw insertError;

      // Refresh data
      await fetchReels();
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload. Please try again.');
      throw err;
    }
  };

  // Go Live
  const handleGoLive = () => {
    navigate('/powerharmony/live');
  };

  if (loading) {
    return (
      <div className="pr-page pr-page--loading">
        <div className="pr-loading">
          <div className="pr-loading-spinner"></div>
          <span>Loading Reels...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pr-page">
      {/* Header Controls */}
      <div className="pr-header-controls">
        <button className="pr-header-btn" onClick={() => setShowComposer(true)}>
          <span>+</span>
          <span>Create</span>
        </button>
        <button className="pr-header-btn pr-header-btn--live" onClick={handleGoLive}>
          <span>🔴</span>
          <span>Go Live</span>
        </button>
      </div>

      {/* Reel Player */}
      <ReelPlayer
        reels={reels}
        initialIndex={0}
        userId={userId}
        onReelChange={setActiveIndex}
        onLike={handleLike}
        onComment={handleOpenComments}
        onShare={handleShare}
        onViewReel={handleViewReel}
      />

      {/* Comments Panel */}
      {showComments && (
        <div className="pr-comments-overlay" onClick={() => setShowComments(false)}>
          <div className="pr-comments-panel" onClick={e => e.stopPropagation()}>
            <div className="pr-comments-header">
              <h3>Comments ({activeReelComments.length})</h3>
              <button onClick={() => setShowComments(false)}>×</button>
            </div>
            <div className="pr-comments-list">
              {activeReelComments.length === 0 ? (
                <div className="pr-comments-empty">
                  <span>💬</span>
                  <p>No comments yet. Be the first!</p>
                </div>
              ) : (
                activeReelComments.map((comment, idx) => (
                  <div key={comment.id || idx} className="pr-comment">
                    <div className="pr-comment-avatar">
                      {comment.user?.avatarUrl ? (
                        <img src={comment.user.avatarUrl} alt="" />
                      ) : (
                        <span>{(comment.user?.name || 'U')[0]}</span>
                      )}
                    </div>
                    <div className="pr-comment-content">
                      <span className="pr-comment-name">{comment.user?.name || 'User'}</span>
                      <p>{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="pr-comments-input">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                onKeyPress={e => e.key === 'Enter' && handlePostComment()}
              />
              <button onClick={handlePostComment} disabled={!commentText.trim()}>
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Composer Modal */}
      <ReelComposer
        open={showComposer}
        onClose={() => setShowComposer(false)}
        onSubmit={handleUpload}
      />

      {/* Error Toast */}
      {error && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 71, 87, 0.9)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '999px',
          fontSize: '14px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
