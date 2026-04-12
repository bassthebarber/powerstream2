// frontend/src/components/powerfeed/CreatePostCard.jsx
// Facebook-style post composer
import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CreatePostCard({ 
  onSubmit, 
  onLiveClick,
  uploading = false,
  error = null 
}) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('none');
  const [mediaPreview, setMediaPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const displayName = user?.name || user?.displayName || user?.email?.split('@')[0] || 'Guest';
  const avatarUrl = user?.avatarUrl || user?.avatar;
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) return;

    setMediaPreview({
      url: URL.createObjectURL(file),
      type: isVideo ? 'video' : 'image',
      file
    });
    setMediaType(isVideo ? 'video' : 'image');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaPreview) return;

    setSubmitting(true);
    try {
      await onSubmit?.({
        content: content.trim(),
        mediaUrl: mediaPreview?.url || mediaUrl,
        mediaType,
        file: mediaPreview?.file
      });
      setContent('');
      setMediaUrl('');
      setMediaType('none');
      setMediaPreview(null);
      setExpanded(false);
    } catch (err) {
      console.error('Post error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const removeMedia = () => {
    setMediaPreview(null);
    setMediaUrl('');
    setMediaType('none');
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        hidden 
        accept="image/*,video/*" 
        onChange={handleFileSelect} 
      />

      {/* Collapsed Composer */}
      <div className="pf-composer">
        <div className="pf-composer-top">
          <div className="pf-composer-avatar">
            {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{initials}</span>}
          </div>
          <button 
            className="pf-composer-trigger"
            onClick={() => setExpanded(true)}
          >
            What's on your mind, {displayName.split(' ')[0]}?
          </button>
        </div>
        <div className="pf-composer-divider"></div>
        <div className="pf-composer-actions">
          <button className="pf-composer-action" onClick={onLiveClick}>
            <span className="pf-composer-action-icon pf-composer-action-icon--live">🔴</span>
            Live Video
          </button>
          <button className="pf-composer-action" onClick={() => { setExpanded(true); fileInputRef.current?.click(); }}>
            <span className="pf-composer-action-icon pf-composer-action-icon--photo">🖼️</span>
            Photo/Video
          </button>
          <button className="pf-composer-action" onClick={() => setExpanded(true)}>
            <span className="pf-composer-action-icon pf-composer-action-icon--feeling">😊</span>
            Feeling/Activity
          </button>
        </div>
      </div>

      {/* Expanded Modal */}
      {expanded && (
        <div className="pf-composer-modal-overlay" onClick={() => setExpanded(false)}>
          <div className="pf-composer-modal" onClick={e => e.stopPropagation()}>
            <div className="pf-composer-modal-header">
              <h3>Create Post</h3>
              <button className="pf-modal-close" onClick={() => setExpanded(false)}>×</button>
            </div>
            
            <div className="pf-composer-modal-user">
              <div className="pf-composer-avatar">
                {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{initials}</span>}
              </div>
              <div>
                <div className="pf-composer-modal-name">{displayName}</div>
                <button className="pf-privacy-btn">🌍 Public ▾</button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <textarea
                className="pf-composer-textarea"
                placeholder={`What's on your mind, ${displayName.split(' ')[0]}?`}
                value={content}
                onChange={e => setContent(e.target.value)}
                autoFocus
              />

              {mediaPreview && (
                <div className="pf-composer-preview">
                  {mediaPreview.type === 'video' ? (
                    <video src={mediaPreview.url} controls />
                  ) : (
                    <img src={mediaPreview.url} alt="Preview" />
                  )}
                  <button type="button" className="pf-preview-remove" onClick={removeMedia}>×</button>
                  {uploading && <div className="pf-upload-progress">Uploading...</div>}
                </div>
              )}

              {error && <div className="pf-error">{error}</div>}

              <div className="pf-composer-modal-footer">
                <div className="pf-add-to-post">
                  <span>Add to your post</span>
                  <div className="pf-add-icons">
                    <button type="button" onClick={() => fileInputRef.current?.click()}>🖼️</button>
                    <button type="button">👤</button>
                    <button type="button">😊</button>
                    <button type="button">📍</button>
                    <button type="button">🎵</button>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="pf-post-submit"
                  disabled={submitting || uploading || (!content.trim() && !mediaPreview)}
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

