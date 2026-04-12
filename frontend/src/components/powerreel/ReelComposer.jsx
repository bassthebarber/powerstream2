// frontend/src/components/powerreel/ReelComposer.jsx
// TikTok-style reel upload composer
import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ReelComposer({ 
  open, 
  onClose, 
  onSubmit 
}) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [trackName, setTrackName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const displayName = user?.name || user?.displayName || 'Guest';

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    // Check file size (max 100MB)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('Video must be under 100MB');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !preview) {
      setError('Please select a video to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await onSubmit?.({
        file,
        preview,
        caption: caption.trim(),
        hashtags: hashtags.trim(),
        trackName: trackName.trim()
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Reset form
      resetForm();
      setTimeout(() => onClose?.(), 500);
    } catch (err) {
      setError(err.message || 'Failed to upload reel');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setCaption('');
    setHashtags('');
    setTrackName('');
    setError(null);
    setUploadProgress(0);
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="pr-composer-overlay" onClick={handleClose}>
      <div className="pr-composer-modal" onClick={e => e.stopPropagation()}>
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="video/*"
          onChange={handleFileSelect}
        />

        {/* Header */}
        <div className="pr-composer-header">
          <h3>Create Reel</h3>
          <button className="pr-composer-close" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="pr-composer-form">
          {/* Video Upload Area */}
          {!preview ? (
            <div 
              className="pr-composer-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="pr-composer-dropzone-icon">🎬</span>
              <p>Click to upload video</p>
              <span className="pr-composer-dropzone-hint">Share short-form content with your audience</span>
              <span className="pr-composer-dropzone-limit">Max 100MB</span>
            </div>
          ) : (
            <div className="pr-composer-preview">
              <video src={preview} controls />
              {uploading && (
                <div className="pr-composer-progress-overlay">
                  <div className="pr-composer-progress-bar">
                    <div 
                      className="pr-composer-progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span>{uploadProgress}%</span>
                </div>
              )}
              <button 
                type="button" 
                className="pr-composer-preview-remove"
                onClick={() => { setFile(null); setPreview(null); }}
                disabled={uploading}
              >
                ×
              </button>
            </div>
          )}

          {/* Caption */}
          <div className="pr-composer-field">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              rows={2}
              maxLength={2200}
              disabled={uploading}
            />
          </div>

          {/* Hashtags */}
          <div className="pr-composer-field">
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#hashtags"
              disabled={uploading}
            />
          </div>

          {/* Track/Music */}
          <div className="pr-composer-field">
            <input
              type="text"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              placeholder="🎵 Add music (optional)"
              disabled={uploading}
            />
            <span className="pr-composer-field-hint">Connect to Studio for beat selection</span>
          </div>

          {/* Error */}
          {error && <div className="pr-composer-error">{error}</div>}

          {/* Actions */}
          <div className="pr-composer-actions">
            <button 
              type="button" 
              className="pr-composer-cancel"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="pr-composer-submit"
              disabled={uploading || !preview}
            >
              {uploading ? 'Uploading...' : 'Post Reel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

