// frontend/src/components/tv/UploadPanel.jsx
// Creator upload panel for approved users

import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { uploadVideoFile, uploadThumbnail, createVideoRecord } from './tvUtils.js';

export default function UploadPanel({
  station,
  onSuccess,
  onClose,
  allowLongForm = false, // For No Limit Forever films
}) {
  const { user } = useAuth();
  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [hlsUrl, setHlsUrl] = useState('');
  const [useHls, setUseHls] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const userId = user?.id || user?._id;

  // Handle video selection
  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (500MB for long-form, 100MB for regular)
    const maxSize = allowLongForm ? 500 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Video must be under ${allowLongForm ? '500MB' : '100MB'}`);
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setError(null);
  };

  // Handle thumbnail selection
  const handleThumbSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Thumbnail must be an image');
      return;
    }

    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
    setError(null);
  };

  // Handle upload
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!videoFile && !hlsUrl) {
      setError('Please select a video file or enter an HLS URL');
      return;
    }

    if (!userId) {
      setError('Please log in to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      let videoUrl = hlsUrl;
      let thumbUrl = null;

      // Upload video file if provided
      if (videoFile && !useHls) {
        setUploadProgress(10);
        videoUrl = await uploadVideoFile(videoFile, station.slug, userId, (p) => {
          setUploadProgress(10 + (p * 0.6));
        });
        setUploadProgress(70);
      }

      // Upload thumbnail if provided
      if (thumbFile) {
        thumbUrl = await uploadThumbnail(thumbFile, station.slug, userId);
        setUploadProgress(85);
      }

      // Create video record
      const videoData = {
        station_slug: station.slug,
        title: title.trim(),
        description: description.trim(),
        video_url: videoUrl,
        hls_url: useHls ? hlsUrl : null,
        thumb_url: thumbUrl,
        creator_id: userId,
        creator_name: user?.name || user?.displayName || 'Creator',
        tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        is_live: false,
        created_at: new Date().toISOString(),
      };

      await createVideoRecord(videoData);
      setUploadProgress(100);
      setSuccess(true);

      // Reset form
      setTimeout(() => {
        setVideoFile(null);
        setVideoPreview(null);
        setThumbFile(null);
        setThumbPreview(null);
        setTitle('');
        setDescription('');
        setTags('');
        setHlsUrl('');
        setUseHls(false);
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="tv-upload-overlay" onClick={onClose}>
      <div className="tv-upload-panel" onClick={(e) => e.stopPropagation()}>
        {/* Hidden inputs */}
        <input
          type="file"
          ref={videoInputRef}
          style={{ display: 'none' }}
          accept="video/*"
          onChange={handleVideoSelect}
        />
        <input
          type="file"
          ref={thumbInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleThumbSelect}
        />

        {/* Header */}
        <div className="tv-upload-header">
          <h3>Upload to {station?.name}</h3>
          <button className="tv-upload-close" onClick={onClose}>×</button>
        </div>

        {/* Success message */}
        {success && (
          <div className="tv-upload-success">
            <span>✓</span>
            <p>Upload successful!</p>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleUpload} className="tv-upload-form">
            {/* Video input */}
            <div className="tv-upload-section">
              <label>Video</label>
              
              {/* Toggle between file and HLS */}
              <div className="tv-upload-toggle">
                <button 
                  type="button"
                  className={!useHls ? 'active' : ''}
                  onClick={() => setUseHls(false)}
                >
                  Upload File
                </button>
                <button 
                  type="button"
                  className={useHls ? 'active' : ''}
                  onClick={() => setUseHls(true)}
                >
                  HLS URL
                </button>
              </div>

              {!useHls ? (
                <>
                  {!videoPreview ? (
                    <div 
                      className="tv-upload-dropzone"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <span>🎬</span>
                      <p>Click to select video</p>
                      <span className="tv-upload-hint">
                        Max {allowLongForm ? '500MB' : '100MB'}
                      </span>
                    </div>
                  ) : (
                    <div className="tv-upload-preview">
                      <video src={videoPreview} controls />
                      <button 
                        type="button"
                        className="tv-upload-remove"
                        onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <input
                  type="url"
                  placeholder="https://stream.example.com/video.m3u8"
                  value={hlsUrl}
                  onChange={(e) => setHlsUrl(e.target.value)}
                  className="tv-upload-input"
                />
              )}
            </div>

            {/* Thumbnail */}
            <div className="tv-upload-section">
              <label>Thumbnail (Optional)</label>
              {!thumbPreview ? (
                <div 
                  className="tv-upload-dropzone tv-upload-dropzone--small"
                  onClick={() => thumbInputRef.current?.click()}
                >
                  <span>🖼</span>
                  <p>Add thumbnail</p>
                </div>
              ) : (
                <div className="tv-upload-preview tv-upload-preview--thumb">
                  <img src={thumbPreview} alt="Thumbnail" />
                  <button 
                    type="button"
                    className="tv-upload-remove"
                    onClick={() => { setThumbFile(null); setThumbPreview(null); }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="tv-upload-section">
              <label>Title *</label>
              <input
                type="text"
                placeholder="Enter video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
                className="tv-upload-input"
              />
            </div>

            {/* Description */}
            <div className="tv-upload-section">
              <label>Description</label>
              <textarea
                placeholder="Enter description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={2000}
                className="tv-upload-textarea"
              />
            </div>

            {/* Tags */}
            <div className="tv-upload-section">
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. music, live, houston"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="tv-upload-input"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="tv-upload-error">{error}</div>
            )}

            {/* Progress */}
            {uploading && (
              <div className="tv-upload-progress">
                <div className="tv-upload-progress-bar">
                  <div 
                    className="tv-upload-progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
            )}

            {/* Actions */}
            <div className="tv-upload-actions">
              <button 
                type="button"
                className="tv-upload-btn tv-upload-btn--cancel"
                onClick={onClose}
                disabled={uploading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="tv-upload-btn tv-upload-btn--submit"
                disabled={uploading || (!videoFile && !hlsUrl) || !title.trim()}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

