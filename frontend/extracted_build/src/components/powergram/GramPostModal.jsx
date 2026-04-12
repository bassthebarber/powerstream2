// frontend/src/components/powergram/GramPostModal.jsx
// Instagram-style post viewer modal
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function GramPostModal({ 
  post, 
  onClose, 
  onLike,
  onComment,
  onDelete,
  onUpdate
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post?.comments || []);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const currentUserId = user?.id || user?._id;
  const displayName = user?.name || user?.displayName || 'Guest';
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    if (post) {
      setLiked(post.likes?.includes(currentUserId));
      setLikeCount(post.likes?.length || post.like_count || 0);
      setComments(post.comments || []);
    }
  }, [post, currentUserId]);

  if (!post) return null;

  const author = post.user || {};
  const authorName = author.name || post.username || 'User';
  const authorAvatar = author.avatarUrl || author.avatar;
  const authorInitials = authorName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const mediaUrl = post.media_url || post.imageUrl || post.mediaUrl;
  const isVideo = post.media_type === 'video' || mediaUrl?.includes('.mp4');

  const timeAgo = (() => {
    if (!post.created_at) return '';
    const diff = Date.now() - new Date(post.created_at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  })();

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    await onLike?.(post.id);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      user: { name: displayName, avatarUrl: user?.avatarUrl },
      text: commentText,
      created_at: new Date().toISOString()
    };

    setComments(prev => [...prev, newComment]);
    setCommentText('');
    await onComment?.(post.id, commentText);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.caption || 'Check out this post',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <div className="pg-modal-overlay" onClick={onClose}>
      <div className="pg-modal" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button className="pg-modal-close" onClick={onClose}>×</button>

        {/* Media Section */}
        <div className="pg-modal-media">
          {isVideo ? (
            <video 
              src={mediaUrl} 
              controls 
              autoPlay 
              playsInline
              className="pg-modal-video"
            />
          ) : (
            <img 
              src={mediaUrl} 
              alt={post.caption || 'Photo'} 
              className="pg-modal-image"
            />
          )}
        </div>

        {/* Details Section */}
        <div className="pg-modal-details">
          {/* Header */}
          <div className="pg-modal-header">
            <div 
              className="pg-modal-author"
              onClick={() => { onClose?.(); navigate(`/profile/${post.user_id}`); }}
            >
              <div className="pg-modal-avatar">
                {authorAvatar ? (
                  <img src={authorAvatar} alt="" />
                ) : (
                  <span>{authorInitials}</span>
                )}
              </div>
              <div className="pg-modal-author-info">
                <span className="pg-modal-username">{authorName}</span>
                {post.location && <span className="pg-modal-location">📍 {post.location}</span>}
              </div>
            </div>
            <button className="pg-modal-menu">···</button>
          </div>

          {/* Comments Section */}
          <div className="pg-modal-comments">
            {/* Caption as first comment */}
            {post.caption && (
              <div className="pg-modal-comment">
                <div className="pg-modal-comment-avatar">
                  {authorAvatar ? <img src={authorAvatar} alt="" /> : <span>{authorInitials}</span>}
                </div>
                <div className="pg-modal-comment-content">
                  <span className="pg-modal-comment-user">{authorName}</span>
                  <span className="pg-modal-comment-text">{post.caption}</span>
                  {post.hashtags && (
                    <div className="pg-modal-hashtags">
                      {post.hashtags.split(' ').filter(t => t.startsWith('#')).map((tag, i) => (
                        <span key={i} className="pg-modal-hashtag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <span className="pg-modal-comment-time">{timeAgo}</span>
                </div>
              </div>
            )}

            {/* Comments */}
            {comments.map((comment, idx) => (
              <div key={comment.id || idx} className="pg-modal-comment">
                <div className="pg-modal-comment-avatar">
                  {comment.user?.avatarUrl ? (
                    <img src={comment.user.avatarUrl} alt="" />
                  ) : (
                    <span>{(comment.user?.name || 'U')[0]}</span>
                  )}
                </div>
                <div className="pg-modal-comment-content">
                  <span className="pg-modal-comment-user">{comment.user?.name || comment.username || 'User'}</span>
                  <span className="pg-modal-comment-text">{comment.text || comment.content}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="pg-modal-actions">
            <div className="pg-modal-action-row">
              <div className="pg-modal-action-left">
                <button 
                  className={`pg-modal-action-btn ${liked ? 'pg-modal-action-btn--liked' : ''}`}
                  onClick={handleLike}
                >
                  {liked ? '❤️' : '🤍'}
                </button>
                <button className="pg-modal-action-btn">💬</button>
                <button className="pg-modal-action-btn" onClick={handleShare}>↗️</button>
              </div>
              <button className="pg-modal-action-btn">🔖</button>
            </div>
            <div className="pg-modal-likes">
              {likeCount > 0 && <strong>{likeCount.toLocaleString()} likes</strong>}
            </div>
            <div className="pg-modal-timestamp">{timeAgo}</div>
          </div>

          {/* Comment Input */}
          <form className="pg-modal-comment-form" onSubmit={handleSubmitComment}>
            <button type="button" className="pg-modal-emoji-btn">😊</button>
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
            />
            <button 
              type="submit" 
              className="pg-modal-post-btn"
              disabled={!commentText.trim()}
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

