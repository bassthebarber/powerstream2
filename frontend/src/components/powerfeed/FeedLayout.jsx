// frontend/src/components/powerfeed/FeedLayout.jsx
// Three-column responsive feed layout
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function FeedLayout({ 
  children, 
  leftSidebar, 
  rightSidebar,
  liveUsers = [],
  className = '' 
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = user?.name || user?.displayName || user?.email?.split('@')[0] || 'Guest';
  const avatarUrl = user?.avatarUrl || user?.avatar;
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const navItems = [
    { icon: '📱', label: 'Feed', path: '/feed', active: true },
    { icon: '📸', label: 'PowerGram', path: '/gram' },
    { icon: '🎞️', label: 'PowerReel', path: '/reel' },
    { icon: '💬', label: 'Messenger', path: '/powerline' },
    { icon: '📺', label: 'Watch', path: '/tv-stations' },
    { icon: '🎛️', label: 'Studio', path: '/studio' },
    { icon: '🛍️', label: 'Marketplace', path: '/feed/marketplace' },
    { icon: '📅', label: 'Events', path: '/feed/events' },
    { icon: '💾', label: 'Saved', path: '/feed/saved' },
  ];

  return (
    <div className={`pf-layout ${className}`}>
      {/* Left Sidebar - Desktop */}
      <aside className="pf-sidebar pf-sidebar--left">
        {/* Profile Card */}
        <div 
          className="pf-profile-card"
          onClick={() => navigate('/profile')}
        >
          <div className="pf-profile-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <span className="pf-profile-name">{displayName}</span>
        </div>

        {/* Navigation */}
        <nav className="pf-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`pf-nav-item ${item.active ? 'pf-nav-item--active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="pf-nav-icon">{item.icon}</span>
              <span className="pf-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Live Now Section */}
        {liveUsers.length > 0 && (
          <div className="pf-live-section">
            <h4>
              <span className="pf-live-dot"></span>
              Live Now
            </h4>
            {liveUsers.map(live => (
              <div key={live._id || live.id} className="pf-live-item">
                <div className="pf-live-avatar">
                  {live.avatarUrl ? (
                    <img src={live.avatarUrl} alt="" />
                  ) : (
                    <span>{(live.name || 'U')[0]}</span>
                  )}
                </div>
                <div className="pf-live-info">
                  <span className="pf-live-name">{live.name}</span>
                  <span className="pf-live-viewers">{live.viewers} watching</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom left sidebar content */}
        {leftSidebar}
      </aside>

      {/* Main Content */}
      <main className="pf-main">
        {children}
      </main>

      {/* Right Sidebar - Desktop */}
      <aside className="pf-sidebar pf-sidebar--right">
        {rightSidebar}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="pf-mobile-nav">
        <button onClick={() => navigate('/feed')} className="pf-mobile-nav-btn pf-mobile-nav-btn--active">
          <span>🏠</span>
        </button>
        <button onClick={() => navigate('/gram')} className="pf-mobile-nav-btn">
          <span>📸</span>
        </button>
        <button onClick={() => navigate('/reel')} className="pf-mobile-nav-btn">
          <span>🎬</span>
        </button>
        <button onClick={() => navigate('/powerline')} className="pf-mobile-nav-btn">
          <span>💬</span>
        </button>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="pf-mobile-nav-btn">
          <span>☰</span>
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="pf-mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="pf-mobile-drawer" onClick={e => e.stopPropagation()}>
            <div className="pf-mobile-drawer-header">
              <div className="pf-profile-avatar">
                {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{initials}</span>}
              </div>
              <span>{displayName}</span>
              <button onClick={() => setMobileMenuOpen(false)}>×</button>
            </div>
            <nav className="pf-mobile-drawer-nav">
              {navItems.map(item => (
                <button
                  key={item.path}
                  className="pf-mobile-drawer-item"
                  onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
