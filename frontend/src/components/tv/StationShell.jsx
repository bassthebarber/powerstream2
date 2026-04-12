// frontend/src/components/tv/StationShell.jsx
// Shared station wrapper component with common layout

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function StationShell({
  station,
  children,
  showNav = true,
  className = '',
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  // Apply station theme
  useEffect(() => {
    if (station?.style) {
      const root = document.documentElement;
      root.style.setProperty('--station-primary', station.style.primary);
      root.style.setProperty('--station-secondary', station.style.secondary);
      root.style.setProperty('--station-accent', station.style.accent);
      root.style.setProperty('--station-bg', station.style.background);
    }

    return () => {
      // Reset on unmount
      const root = document.documentElement;
      root.style.removeProperty('--station-primary');
      root.style.removeProperty('--station-secondary');
      root.style.removeProperty('--station-accent');
      root.style.removeProperty('--station-bg');
    };
  }, [station]);

  if (!station) {
    return (
      <div className="tv-station-error">
        <h2>Station Not Found</h2>
        <button onClick={() => navigate('/network/southernpower')}>
          ← Back to Network
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`tv-station tv-station--${station.theme} ${className}`}
      style={{ 
        '--station-primary': station.style?.primary,
        '--station-secondary': station.style?.secondary,
        '--station-accent': station.style?.accent,
        '--station-bg': station.style?.background,
      }}
    >
      {/* Station Header */}
      {showNav && (
        <header className="tv-station-header">
          <div className="tv-station-header-left">
            <button 
              className="tv-station-back"
              onClick={() => navigate('/network/southernpower')}
            >
              ←
            </button>
            <img 
              src={station.logo} 
              alt={station.name} 
              className="tv-station-logo"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="tv-station-info">
              <h1 className="tv-station-name">{station.name}</h1>
              <p className="tv-station-tagline">{station.tagline}</p>
            </div>
          </div>
          <div className="tv-station-header-right">
            {station.features?.includes('live') && (
              <div className={`tv-station-live-badge ${isLive ? 'tv-station-live-badge--active' : ''}`}>
                <span className="tv-live-dot"></span>
                {isLive ? 'LIVE' : 'OFFLINE'}
                {isLive && viewerCount > 0 && (
                  <span className="tv-viewer-count">{viewerCount.toLocaleString()}</span>
                )}
              </div>
            )}
            {station.features?.includes('upload') && user && (
              <button className="tv-station-upload-btn">
                <span>+</span>
                <span>Upload</span>
              </button>
            )}
          </div>
        </header>
      )}

      {/* Station Content */}
      <main className="tv-station-content">
        {children}
      </main>

      {/* Station Footer */}
      <footer className="tv-station-footer">
        <div className="tv-station-footer-left">
          <span>© {new Date().getFullYear()} {station.name}</span>
          <span>•</span>
          <span>Part of Southern Power Network</span>
        </div>
        <div className="tv-station-footer-right">
          <button onClick={() => navigate('/network/southernpower')}>Network Hub</button>
          <button onClick={() => navigate('/tv-guide')}>TV Guide</button>
        </div>
      </footer>
    </div>
  );
}

