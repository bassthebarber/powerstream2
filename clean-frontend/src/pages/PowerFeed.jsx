// frontend/src/pages/PowerFeed.jsx
// PowerFeed - Facebook-Class Social Timeline
// Supabase + Black/Gold Theme - Production Ready

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FeedLayout, StoriesRow, CreatePostCard, FeedPostCard, RightRail } from '../components/powerfeed';
import { getFeed, postFeed, likeFeed, commentFeed, getStories } from '../services/api.js';
import '../styles/powerfeed.css';

// Mock data fallback
const MOCK_POSTS = [
  {
    id: '1',
    user_id: 'u1',
    username: 'Southern Power',
    content: 'Just dropped a new track! 🔥 Check it out on the studio.',
    media_url: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    reactions: {},
    comments: [],
  },
  {
    id: '2',
    user_id: 'u2',
    username: 'No Limit Houston',
    content: 'Live session tonight at 9PM! Don\'t miss it. 🎤',
    media_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    media_type: 'image',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    reactions: { u3: 'like', u4: 'love' },
    comments: [{ id: 'c1', user: { name: 'Fan' }, text: 'Can\'t wait!' }],
  },
];

const MOCK_STORIES = [
  { id: 's1', user: { name: 'Southern Power' }, hasNew: true, media_url: null },
  { id: 's2', user: { name: 'No Limit' }, hasNew: true, media_url: null },
  { id: 's3', user: { name: 'Studio Pro' }, hasNew: false, media_url: null },
  { id: 's4', user: { name: 'Texas Talent' }, hasNew: true, media_url: null },
];

const MOCK_SUGGESTED = [
  { id: 'u1', name: 'Southern Power', role: 'Artist' },
  { id: 'u2', name: 'No Limit Houston', role: 'Producer' },
  { id: 'u3', name: 'Studio Pro', role: 'Engineer' },
  { id: 'u4', name: 'Texas Beats', role: 'Beatmaker' },
];

const MOCK_TRENDING = [
  { id: 't1', name: '#NewMusic', posts: 2400, trend: 'up' },
  { id: 't2', name: '#StudioSession', posts: 1800, trend: 'up' },
  { id: 't3', name: '#LiveNow', posts: 924, trend: 'stable' },
  { id: 't4', name: '#BeatsForSale', posts: 756, trend: 'up' },
];

export default function PowerFeed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const loadMoreRef = useRef(null);
  
  // State
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [liveUsers, setLiveUsers] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState(null);
  
  // Story viewer state
  const [activeStory, setActiveStory] = useState(null);

  const userId = user?.id || user?._id || null;
  const PAGE_SIZE = 20;

  // Fetch posts from Supabase
  const fetchPosts = useCallback(async (pageNum = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);

      const fetchedPosts = await getFeed({ skip: pageNum * PAGE_SIZE, limit: PAGE_SIZE });
      
      if (append) {
        setPosts(prev => [...prev, ...fetchedPosts]);
      } else {
        setPosts(fetchedPosts.length > 0 ? fetchedPosts : MOCK_POSTS);
      }
      
      setHasMore(fetchedPosts.length >= PAGE_SIZE);
    } catch (err) {
      console.warn('Feed load error:', err);
      if (!append) setPosts(MOCK_POSTS);
      setError('Could not load posts. Showing sample content.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
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

  // Fetch suggested users
  const fetchSuggestions = useCallback(async () => {
    // For now, use mock data - can be connected to a real endpoint later
    setSuggestedUsers(MOCK_SUGGESTED);
    setTrendingTopics(MOCK_TRENDING);
    setLiveUsers([
      { _id: 'l1', name: 'DJ SouthSide', viewers: 234, avatarUrl: null },
      { _id: 'l2', name: 'Studio Session', viewers: 156, avatarUrl: null },
    ]);
  }, []);

  // Initial load
  useEffect(() => {
    fetchPosts(0);
    fetchStories();
    fetchSuggestions();
  }, [fetchPosts, fetchStories, fetchSuggestions]);

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loadingMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, fetchPosts]);

  // Create post handler
  const handleCreatePost = async ({ content, mediaUrl, mediaType, file }) => {
    if (!userId) {
      setError('Please log in to post');
      return;
    }

    try {
      let finalMediaUrl = mediaUrl;
      if (file && !finalMediaUrl) {
        throw new Error("Upload endpoint not configured for raw files. Provide mediaUrl.");
      }
      const data = await postFeed({
        content,
        media_url: finalMediaUrl,
        media_type: mediaType !== 'none' ? mediaType : null,
      });

      // Add to top of feed
      if (data) setPosts(prev => [data, ...prev]);
    } catch (err) {
      console.error('Post creation error:', err);
      setError('Failed to create post');
      throw err;
    }
  };

  // Reaction handler
  const handleReaction = async (postId, reactionType) => {
    if (!userId) return;

    try {
      // Optimistic update
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const reactions = { ...p.reactions };
          if (reactions[userId] === reactionType) {
            delete reactions[userId];
          } else {
            reactions[userId] = reactionType;
          }
          return { ...p, reactions };
        }
        return p;
      }));

      await likeFeed(postId);
    } catch (err) {
      console.warn('Reaction error:', err);
    }
  };

  // Comment handler
  const handleComment = async (postId, text, parentId = null) => {
    if (!text.trim() || !userId) return;

    try {
      const newComment = {
        id: Date.now().toString(),
        user: { name: user?.name || 'User', avatarUrl: user?.avatarUrl },
        text,
        parent_id: parentId,
        created_at: new Date().toISOString(),
      };

      // Optimistic update
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, comments: [...(p.comments || []), newComment] };
        }
        return p;
      }));

      await commentFeed(postId, text);
    } catch (err) {
      console.warn('Comment error:', err);
    }
  };

  // Share handler
  const handleShare = async (postId, shareType) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    switch (shareType) {
      case 'copy':
        navigator.clipboard?.writeText(`${window.location.origin}/post/${postId}`);
        break;
      case 'messenger':
        navigate('/powerline', { state: { sharePost: post } });
        break;
      case 'feed':
        // Repost functionality
        break;
      default:
        break;
    }
  };

  // Follow handler
  const handleFollow = async (targetUserId) => {
    setSuggestedUsers(prev => prev.filter(u => u.id !== targetUserId));
  };

  // Story handlers
  const handleCreateStory = () => {
    navigate('/gram', { state: { mode: 'story' } });
  };

  const handleViewStory = (story) => {
    setActiveStory(story);
  };

  return (
    <FeedLayout
      liveUsers={liveUsers}
      rightSidebar={
        <RightRail
          suggestedUsers={suggestedUsers}
          trendingTopics={trendingTopics}
          onFollow={handleFollow}
        />
      }
    >
      {/* Stories Row */}
      <StoriesRow
        stories={stories}
        loading={loading}
        onCreateStory={handleCreateStory}
        onViewStory={handleViewStory}
      />

      {/* Post Composer */}
      <CreatePostCard
        onSubmit={handleCreatePost}
        onLiveClick={() => navigate('/powerharmony/live')}
        error={error}
      />

      {/* Error Banner */}
      {error && (
        <div className="pf-error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Feed Posts */}
      {loading ? (
        <div className="pf-loading">
          <div className="pf-spinner"></div>
          <span>Loading feed...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="pf-empty">
          <div className="pf-empty-icon">📭</div>
          <h3>No posts yet</h3>
          <p>Be the first to share something!</p>
        </div>
      ) : (
        posts.map(post => (
          <FeedPostCard
            key={post.id}
            post={post}
            currentUserId={userId}
            onReaction={handleReaction}
            onComment={handleComment}
            onShare={handleShare}
          />
        ))
      )}

      {/* Load More */}
      <div ref={loadMoreRef} className="pf-load-more">
        {loadingMore && <div className="pf-spinner"></div>}
        {!hasMore && posts.length > 0 && (
          <div className="pf-end-of-feed">You're all caught up! 🎉</div>
        )}
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <StoryViewer
          story={activeStory}
          stories={stories}
          onClose={() => setActiveStory(null)}
          onNext={(next) => setActiveStory(next)}
        />
      )}
    </FeedLayout>
  );
}

// Story Viewer Component
function StoryViewer({ story, stories, onClose, onNext }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          const currentIdx = stories.findIndex(s => s.id === story.id);
          if (currentIdx < stories.length - 1) {
            onNext(stories[currentIdx + 1]);
            return 0;
          } else {
            onClose();
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [story, stories, onClose, onNext]);

  const author = story.user || {};

  return (
    <div className="pg-story-viewer" onClick={onClose}>
      <div className="pg-story-viewer-content" onClick={e => e.stopPropagation()}>
        {/* Progress Bar */}
        <div className="pg-story-progress">
          <div className="pg-story-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Header */}
        <div className="pg-story-viewer-header">
          <div className="pg-story-viewer-user">
            {author.avatarUrl ? (
              <img src={author.avatarUrl} alt="" />
            ) : (
              <span>{(author.name || 'U')[0]}</span>
            )}
            <span>{author.name || 'User'}</span>
          </div>
          <button onClick={onClose}>×</button>
        </div>

        {/* Media */}
        <div className="pg-story-viewer-media">
          {story.media_url ? (
            story.media_type === 'video' ? (
              <video src={story.media_url} autoPlay muted loop />
            ) : (
              <img src={story.media_url} alt="" />
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
  );
}
