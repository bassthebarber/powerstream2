// frontend/src/components/powergram/GramComposer.jsx
// Instagram-style upload composer
import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function GramComposer({ 
  open, 
  onClose, 
  onSubmit,
  initialPostType = 'grid' // 'grid' | 'story' | 'both'
}) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [location, setLocation] = useState('');
  const [postType, setPostType] = useState(initialPostType);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const displayName = user?.name || user?.displayName || 'Guest';
  const avatarUrl = user?.avatarUrl || user?.avatar;
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const isVideo = selectedFile.type.startsWith('video/');
    const isImage = selectedFile.type.startsWith('image/');
    
    if (!isVideo && !isImage) {
      setError('Please select an image or video file');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setMediaType(isVideo ? 'video' : 'image');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !preview) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await onSubmit?.({
        file,
        preview,
        mediaType,
        caption: caption.trim(),
        hashtags: hashtags.trim(),
        location: location.trim(),
        postType
      });

      // Reset form
      resetForm();
      onClose?.();
    } catch (err) {
      setError(err.message || 'Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setMediaType('image');
    setCaption('');
    setHashtags('');
    setLocation('');
    setPostType('grid');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="pg-composer-overlay" onClick={handleClose}>
      <div className="pg-composer-modal" onClick={e => e.stopPropagation()}>
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*,video/*"
          onChange={handleFileSelect}
        />

        {/* Header */}
        <div className="pg-composer-header">
          <button className="pg-composer-back" onClick={handleClose}>
            ←
          </button>
          <h3>Create New Post</h3>
          <button 
            className="pg-composer-share"
            onClick={handleSubmit}
            disabled={uploading || !preview}
          >
            {uploading ? 'Sharing...' : 'Share'}
          </button>
        </div>

        <div className="pg-composer-body">
          {/* Media Upload Area */}
          {!preview ? (
            <div 
              className="pg-composer-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="pg-composer-dropzone-icon">📷</div>
              <p>Click to upload photo or video</p>
              <span className="pg-composer-dropzone-hint">Share moments with your audience</span>
            </div>
          ) : (
            <div className="pg-composer-preview">
              {mediaType === 'video' ? (
                <video src={preview} controls />
              ) : (
                <img src={preview} alt="Preview" />
              )}
              <button 
                type="button" 
                className="pg-composer-preview-remove"
                onClick={() => { setFile(null); setPreview(null); }}
              >
                ×
              </button>
            </div>
          )}

          {/* Form Fields */}
          <div className="pg-composer-form">
            {/* User Row */}
            <div className="pg-composer-user">
              <div className="pg-composer-avatar">
                {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{initials}</span>}
              </div>
              <span>{displayName}</span>
            </div>

            {/* Caption */}
            <div className="pg-composer-field">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                rows={3}
                maxLength={2200}
              />
              <span className="pg-composer-char-count">{caption.length}/2,200</span>
            </div>

            {/* Hashtags */}
            <div className="pg-composer-field">
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#hashtags (optional)"
              />
            </div>

            {/* Location */}
            <div className="pg-composer-field">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="📍 Add location (optional)"
              />
            </div>

            {/* Post Type Selection */}
            <div className="pg-composer-type">
              <label className={`pg-composer-type-option ${postType === 'grid' ? 'pg-composer-type-option--active' : ''}`}>
                <input
                  type="radio"
                  name="postType"
                  value="grid"
                  checked={postType === 'grid'}
                  onChange={(e) => setPostType(e.target.value)}
                />
                <span>📱 Grid Post</span>
              </label>
              <label className={`pg-composer-type-option ${postType === 'story' ? 'pg-composer-type-option--active' : ''}`}>
                <input
                  type="radio"
                  name="postType"
                  value="story"
                  checked={postType === 'story'}
                  onChange={(e) => setPostType(e.target.value)}
                />
                <span>⭕ Story Only</span>
              </label>
              <label className={`pg-composer-type-option ${postType === 'both' ? 'pg-composer-type-option--active' : ''}`}>
                <input
                  type="radio"
                  name="postType"
                  value="both"
                  checked={postType === 'both'}
                  onChange={(e) => setPostType(e.target.value)}
                />
                <span>✨ Both</span>
              </label>
            </div>

            {/* Error */}
            {error && <div className="pg-composer-error">{error}</div>}

            {/* Actions */}
            <div className="pg-composer-actions">
              <button 
                type="button" 
                className="pg-composer-cancel"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="pg-composer-submit"
                onClick={handleSubmit}
                disabled={uploading || !preview}
              >
                {uploading ? 'Sharing...' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

