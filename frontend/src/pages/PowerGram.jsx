// frontend/src/pages/PowerGram.jsx
// PowerGram - Instagram-Class Photo Grid Experience
// Supabase + Black/Gold Theme - Production Ready

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { GramGrid, GramPostModal, GramComposer } from '../components/powergram';
import { getGrams, postGram, likeGram, commentGram, getStories, postStory } from '../services/api.js';
import '../styles/powergram.css';

// Mock data fallback
const MOCK_GRAMS = [
  {
    id: '1',
    user_id: 'u1',
    username: 'Southern Power',
    media_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    caption: 'Studio vibes tonight 🎤 #music #studio',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    likes: [],
    comments: [],
  },
  {
    id: '2',
    user_id: 'u2',
    username: 'No Limit Houston',
    media_url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600',
    caption: 'New beat coming soon 🔥',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    likes: ['u3'],
    comments: [{ id: 'c1', user: { name: 'Fan' }, text: 'Fire!' }],
  },
  {
    id: '3',
    user_id: 'u3',
    username: 'Studio Pro',
    media_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600',
    caption: 'Recording session complete ✅',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    likes: ['u1', 'u2'],
    comments: [],
  },
];

const MOCK_STORIES = [
  { id: 's1', user: { name: 'Southern Power' }, hasNew: true },
  { id: 's2', user: { name: 'No Limit' }, hasNew: true },
  { id: 's3', user: { name: 'Studio Pro' }, hasNew: false },
  { id: 's4', user: { name: 'Texas Talent' }, hasNew: true },
];

export default function PowerGram() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // State
  const [grams, setGrams] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGram, setSelectedGram] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [composerMode, setComposerMode] = useState('grid');
  const [activeStory, setActiveStory] = useState(null);
  const [storyProgress, setStoryProgress] = useState(0);

  const userId = user?.id || user?._id || null;
  const displayName = user?.name || user?.displayName || user?.email?.split('@')[0] || 'Guest';
  const avatarUrl = user?.avatarUrl || user?.avatar;
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  // Check for mode from navigation state
  useEffect(() => {
    if (location.state?.mode === 'story') {
      setComposerMode('story');
      setShowComposer(true);
    } else if (location.state?.mode === 'create') {
      setShowComposer(true);
    }
  }, [location.state]);

  // Fetch grams from Supabase
  const fetchGrams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGrams();
      setGrams(data?.length > 0 ? data : MOCK_GRAMS);
    } catch (err) {
      console.warn('Gram load error:', err);
      setGrams(MOCK_GRAMS);
      setError('Could not load posts. Showing sample content.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stories
  const fetchStories = useCallback(async () => {
    try {
      const data = await getStories();
      setStories(data?.length > 0 ? data : MOCK_STORIES);
    } catch (err) {
      console.warn('Stories load error:', err);
      setStories(MOCK_STORIES);
    }
  }, []);

  useEffect(() => {
    fetchGrams();
    fetchStories();
  }, [fetchGrams, fetchStories]);

  // Story auto-progress
  useEffect(() => {
    if (!activeStory) return;
    
    const interval = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) {
          const currentIdx = stories.findIndex(s => s.id === activeStory.id);
          if (currentIdx < stories.length - 1) {
            setActiveStory(stories[currentIdx + 1]);
            return 0;
          } else {
            setActiveStory(null);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStory, stories]);

  // Upload handler
  const handleUpload = async ({ file, preview, mediaType, caption, hashtags, location: postLocation, postType }) => {
    if (!userId) {
      setError('Please log in to post');
      throw new Error('Not authenticated');
    }

    try {
      let finalMediaUrl = preview;
      if (file && !finalMediaUrl) {
        throw new Error("Upload endpoint not configured for raw files. Provide mediaUrl.");
      }

      // Create gram post
      if (postType === 'grid' || postType === 'both') {
        await postGram({
          media_url: finalMediaUrl,
          media_type: mediaType,
          caption: [caption, hashtags, postLocation].filter(Boolean).join(" ").trim(),
        });
      }

      // Create story
      if (postType === 'story' || postType === 'both') {
        await postStory({
          media_url: finalMediaUrl,
          media_type: mediaType,
          username: displayName,
        });
      }

      // Refresh data
      await fetchGrams();
      await fetchStories();
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload. Please try again.');
      throw err;
    }
  };

  // Like handler
  const handleLike = async (gramId) => {
    if (!userId) return;

    try {
      const gram = grams.find(g => g.id === gramId);
      const alreadyLiked = gram?.likes?.includes(userId);
      const newLikes = alreadyLiked
        ? gram.likes.filter(id => id !== userId)
        : [...(gram.likes || []), userId];

      // Optimistic update
      setGrams(prev => prev.map(g =>
        g.id === gramId ? { ...g, likes: newLikes } : g
      ));

      await likeGram(gramId);
    } catch (err) {
      console.warn('Like error:', err);
    }
  };

  // Comment handler
  const handleComment = async (gramId, text) => {
    if (!text.trim() || !userId) return;

    try {
      const gram = grams.find(g => g.id === gramId);
      const newComment = {
        id: Date.now().toString(),
        user: { name: displayName, avatarUrl },
        text,
        created_at: new Date().toISOString(),
      };

      const newComments = [...(gram.comments || []), newComment];

      // Optimistic update
      setGrams(prev => prev.map(g =>
        g.id === gramId ? { ...g, comments: newComments } : g
      ));

      if (selectedGram?.id === gramId) {
        setSelectedGram(prev => ({ ...prev, comments: newComments }));
      }

      await commentGram(gramId, text);
    } catch (err) {
      console.warn('Comment error:', err);
    }
  };

  return (
    <div className="pg-page">
      {/* Header */}
      <header className="pg-header">
        <div className="pg-header-left">
          <h1 className="pg-title">PowerGram</h1>
        </div>
        <div className="pg-header-right">
          <button 
            className="pg-upload-btn"
            onClick={() => { setComposerMode('grid'); setShowComposer(true); }}
          >
            <span>+</span>
            <span className="pg-upload-btn-text">New Post</span>
          </button>
        </div>
      </header>

      {/* Stories Bar */}
      <section className="pg-stories-bar">
        <div className="pg-stories-scroll">
          {/* Your Story */}
          <div 
            className="pg-story-bubble pg-story-bubble--own"
            onClick={() => { setComposerMode('story'); setShowComposer(true); }}
          >
            <div className="pg-story-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} />
              ) : (
                <span>{initials}</span>
              )}
              <div className="pg-story-add">+</div>
            </div>
            <span className="pg-story-name">Your Story</span>
          </div>

          {/* Other Stories */}
          {stories.map(story => {
            const storyUser = story.user || {};
            const name = storyUser.name || story.username || 'User';
            const avatar = storyUser.avatarUrl || story.media_url;
            const storyInitials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            const hasNew = story.hasNew !== false && !story.viewed;

            return (
              <div 
                key={story.id}
                className={`pg-story-bubble ${hasNew ? 'pg-story-bubble--active' : 'pg-story-bubble--viewed'}`}
                onClick={() => { setActiveStory(story); setStoryProgress(0); }}
              >
                <div className="pg-story-avatar">
                  {avatar ? (
                    <img src={avatar} alt={name} />
                  ) : (
                    <span>{storyInitials}</span>
                  )}
                </div>
                <span className="pg-story-name">
                  {name.length > 10 ? name.slice(0, 9) + '…' : name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="pg-error-banner" style={{
          padding: '12px 20px',
          background: 'rgba(255, 71, 87, 0.1)',
          borderBottom: '1px solid var(--ps-error)',
          color: 'var(--ps-error)',
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', color: 'var(--ps-error)', fontSize: '18px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Grid */}
      <main className="pg-grid-container">
        <GramGrid
          posts={grams}
          loading={loading}
          onPostClick={setSelectedGram}
          emptyMessage="Share your first photo to get started!"
        />
      </main>

      {/* Composer Modal */}
      <GramComposer
        open={showComposer}
        onClose={() => setShowComposer(false)}
        onSubmit={handleUpload}
        initialPostType={composerMode}
      />

      {/* Post Modal */}
      {selectedGram && (
        <GramPostModal
          post={selectedGram}
          onClose={() => setSelectedGram(null)}
          onLike={handleLike}
          onComment={handleComment}
          onUpdate={fetchGrams}
        />
      )}

      {/* Story Viewer */}
      {activeStory && (
        <div className="pg-story-viewer" onClick={() => setActiveStory(null)}>
          <div className="pg-story-viewer-content" onClick={e => e.stopPropagation()}>
            {/* Progress Bar */}
            <div className="pg-story-progress">
              <div className="pg-story-progress-fill" style={{ width: `${storyProgress}%` }} />
            </div>

            {/* Header */}
            <div className="pg-story-viewer-header">
              <div className="pg-story-viewer-user">
                {activeStory.user?.avatarUrl ? (
                  <img src={activeStory.user.avatarUrl} alt="" />
                ) : (
                  <span>{(activeStory.user?.name || activeStory.username || 'U')[0]}</span>
                )}
                <span>{activeStory.user?.name || activeStory.username || 'User'}</span>
              </div>
              <button onClick={() => setActiveStory(null)}>×</button>
            </div>

            {/* Media */}
            <div className="pg-story-viewer-media">
              {activeStory.media_url ? (
                activeStory.media_type === 'video' ? (
                  <video src={activeStory.media_url} autoPlay muted loop />
                ) : (
                  <img src={activeStory.media_url} alt="" />
                )
              ) : (
                <div className="pg-story-placeholder">
                  <span>📸</span>
                  <p>Story Preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
