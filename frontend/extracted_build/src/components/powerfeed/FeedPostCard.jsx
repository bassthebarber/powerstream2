// frontend/src/components/powerfeed/FeedPostCard.jsx
// Facebook-style feed post with reactions and comments
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like', color: '#2d88ff' },
  { type: 'love', emoji: '❤️', label: 'Love', color: '#f33e58' },
  { type: 'haha', emoji: '😂', label: 'Haha', color: '#f7b928' },
  { type: 'wow', emoji: '😮', label: 'Wow', color: '#f7b928' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: '#f7b928' },
  { type: 'angry', emoji: '😠', label: 'Angry', color: '#e9710f' },
];

export default function FeedPostCard({ 
  post, 
  currentUserId,
  isPinned = false,
  onReaction,
  onComment,
  onShare 
}) {
  const navigate = useNavigate();
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const reactionTimeout = useRef(null);

  // Author info
  const author = useMemo(() => {
    if (post.user && typeof post.user === 'object') {
      return {
        id: post.user_id || post.user._id || post.user.id,
        name: post.user.name || post.username || 'User',
        avatarUrl: post.user.avatarUrl || post.user.avatar || null,
      };
    }
    return { 
      id: post.user_id,
      name: post.username || 'User', 
      avatarUrl: null 
    };
  }, [post]);
  
  const initials = author.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  // Time ago
  const timeAgo = useMemo(() => {
    if (!post.created_at) return '';
    const diff = Date.now() - new Date(post.created_at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(post.created_at).toLocaleDateString();
  }, [post.created_at]);

  // Reaction counts
  const reactionCounts = useMemo(() => {
    const counts = {};
    Object.values(post.reactions || {}).forEach(type => {
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [post.reactions]);

  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);
  const myReaction = post.reactions?.[currentUserId];
  const topReactions = Object.entries(reactionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => REACTIONS.find(r => r.type === type)?.emoji);

  // Comment threads
  const rootComments = (post.comments || []).filter(c => !c.parent_id);
  const getReplies = useCallback((parentId) => 
    (post.comments || []).filter(c => c.parent_id === parentId), [post.comments]);

  const handleReactionHover = () => {
    reactionTimeout.current = setTimeout(() => setShowReactions(true), 500);
  };

  const handleReactionLeave = () => {
    clearTimeout(reactionTimeout.current);
    setShowReactions(false);
  };

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment?.(post.id, commentText, replyTo);
      setCommentText('');
      setReplyTo(null);
    }
  };

  const goToProfile = () => {
    if (author.id) navigate(`/profile/${author.id}`);
  };

  return (
    <article className={`pf-post ${isPinned ? 'pf-post--pinned' : ''}`}>
      {isPinned && (
        <div className="pf-post-pinned-badge">📌 Pinned Post</div>
      )}

      {/* Post Header */}
      <div className="pf-post-header">
        <div className="pf-post-avatar" onClick={goToProfile}>
          {author.avatarUrl ? <img src={author.avatarUrl} alt="" /> : <span>{initials}</span>}
        </div>
        <div className="pf-post-meta">
          <div className="pf-post-author" onClick={goToProfile}>{author.name}</div>
          <div className="pf-post-time">{timeAgo} · 🌍</div>
        </div>
        <button className="pf-post-menu">···</button>
      </div>

      {/* Post Content */}
      {post.content && <div className="pf-post-text">{post.content}</div>}

      {/* Post Media */}
      {post.media_url && (
        <div className="pf-post-media">
          {post.media_type === 'video' ? (
            <video src={post.media_url} controls playsInline />
          ) : (
            <img src={post.media_url} alt="" loading="lazy" />
          )}
        </div>
      )}

      {/* Reaction & Comment Stats */}
      <div className="pf-post-stats">
        {totalReactions > 0 && (
          <div className="pf-post-reactions-count">
            <span className="pf-reaction-icons">{topReactions.join('')}</span>
            <span>{totalReactions}</span>
          </div>
        )}
        <div className="pf-post-engagement">
          {(post.comments?.length || 0) > 0 && (
            <span onClick={() => setShowComments(!showComments)}>
              {post.comments.length} comment{post.comments.length > 1 ? 's' : ''}
            </span>
          )}
          {(post.shares || 0) > 0 && <span>{post.shares} shares</span>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pf-post-actions">
        <div 
          className="pf-action-wrap"
          onMouseEnter={handleReactionHover}
          onMouseLeave={handleReactionLeave}
        >
          <button 
            className={`pf-action-btn ${myReaction ? 'pf-action-btn--active' : ''}`}
            style={myReaction ? { color: REACTIONS.find(r => r.type === myReaction)?.color } : {}}
            onClick={() => onReaction?.(post.id, myReaction || 'like')}
          >
            {myReaction ? REACTIONS.find(r => r.type === myReaction)?.emoji : '👍'} 
            {myReaction ? REACTIONS.find(r => r.type === myReaction)?.label : 'Like'}
          </button>

          {/* Reaction Picker */}
          {showReactions && (
            <div className="pf-reaction-picker">
              {REACTIONS.map(r => (
                <button
                  key={r.type}
                  className="pf-reaction-option"
                  onClick={() => {
                    onReaction?.(post.id, r.type);
                    setShowReactions(false);
                  }}
                  title={r.label}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="pf-action-btn" onClick={() => setShowComments(!showComments)}>
          💬 Comment
        </button>

        <div className="pf-action-wrap">
          <button className="pf-action-btn" onClick={() => setShowShareMenu(!showShareMenu)}>
            ↗️ Share
          </button>
          {showShareMenu && (
            <div className="pf-share-menu">
              <button onClick={() => { onShare?.(post.id, 'feed'); setShowShareMenu(false); }}>
                Share to Feed
              </button>
              <button onClick={() => { onShare?.(post.id, 'messenger'); setShowShareMenu(false); }}>
                Send in Messenger
              </button>
              <button onClick={() => { onShare?.(post.id, 'copy'); setShowShareMenu(false); }}>
                Copy Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="pf-comments">
          {/* Comment Input */}
          <div className="pf-comment-input">
            <div className="pf-comment-avatar">{currentUserId ? 'Y' : '?'}</div>
            <div className="pf-comment-input-wrap">
              {replyTo && (
                <div className="pf-reply-indicator">
                  Replying to comment <button onClick={() => setReplyTo(null)}>×</button>
                </div>
              )}
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmitComment()}
              />
              <div className="pf-comment-actions">
                <button>😊</button>
                <button>📷</button>
                <button>GIF</button>
              </div>
            </div>
          </div>

          {/* Comment Threads */}
          {rootComments.map(comment => (
            <CommentThread
              key={comment.id || comment._id}
              comment={comment}
              replies={getReplies(comment.id || comment._id)}
              onReply={() => setReplyTo(comment.id || comment._id)}
            />
          ))}
        </div>
      )}
    </article>
  );
}

// Comment Thread Component
function CommentThread({ comment, replies, onReply }) {
  const [showReplies, setShowReplies] = useState(false);
  const author = comment.user || {};
  const initials = (author.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <div className="pf-comment-thread">
      <div className="pf-comment">
        <div className="pf-comment-avatar">
          {author.avatarUrl ? <img src={author.avatarUrl} alt="" /> : <span>{initials}</span>}
        </div>
        <div className="pf-comment-content">
          <div className="pf-comment-bubble">
            <div className="pf-comment-author">{author.name || comment.username || 'User'}</div>
            <div className="pf-comment-text">{comment.text || comment.content}</div>
          </div>
          <div className="pf-comment-meta">
            <button>Like</button>
            <button onClick={onReply}>Reply</button>
            <span>1h</span>
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <>
          {!showReplies && (
            <button className="pf-show-replies" onClick={() => setShowReplies(true)}>
              ↳ View {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
          {showReplies && (
            <div className="pf-replies">
              {replies.map(reply => (
                <div key={reply.id || reply._id} className="pf-comment pf-comment--reply">
                  <div className="pf-comment-avatar">
                    {reply.user?.avatarUrl ? (
                      <img src={reply.user.avatarUrl} alt="" />
                    ) : (
                      <span>{(reply.user?.name || 'U')[0]}</span>
                    )}
                  </div>
                  <div className="pf-comment-content">
                    <div className="pf-comment-bubble">
                      <div className="pf-comment-author">{reply.user?.name || 'User'}</div>
                      <div className="pf-comment-text">{reply.text || reply.content}</div>
                    </div>
                    <div className="pf-comment-meta">
                      <button>Like</button>
                      <button>Reply</button>
                      <span>1h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

