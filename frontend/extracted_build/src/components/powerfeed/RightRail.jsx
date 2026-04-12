// frontend/src/components/powerfeed/RightRail.jsx
// Right sidebar with suggestions, trending, and shortcuts
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RightRail({ 
  suggestedUsers = [], 
  trendingTopics = [],
  onFollow 
}) {
  const navigate = useNavigate();

  return (
    <div className="pf-right-rail">
      {/* Friend Suggestions */}
      {suggestedUsers.length > 0 && (
        <div className="pf-widget">
          <div className="pf-widget-header">
            <h4>People You May Know</h4>
            <button className="pf-see-all" onClick={() => navigate('/feed/friends')}>
              See All
            </button>
          </div>
          {suggestedUsers.slice(0, 5).map(user => {
            const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2);
            return (
              <div key={user.id || user._id} className="pf-suggestion">
                <div 
                  className="pf-suggestion-avatar"
                  onClick={() => navigate(`/profile/${user.id || user._id}`)}
                >
                  {user.avatarUrl || user.avatar ? (
                    <img src={user.avatarUrl || user.avatar} alt="" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="pf-suggestion-info">
                  <div 
                    className="pf-suggestion-name"
                    onClick={() => navigate(`/profile/${user.id || user._id}`)}
                  >
                    {user.name || user.username}
                  </div>
                  <div className="pf-suggestion-meta">
                    {user.role || user.mutualFriends ? `${user.mutualFriends} mutual` : 'Suggested'}
                  </div>
                </div>
                <button 
                  className="pf-add-friend" 
                  onClick={() => onFollow?.(user.id || user._id)}
                >
                  <span>+</span> Add
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Trending Topics */}
      {trendingTopics.length > 0 && (
        <div className="pf-widget">
          <div className="pf-widget-header">
            <h4>🔥 Trending</h4>
          </div>
          {trendingTopics.map((topic, idx) => (
            <div key={topic.id || topic._id || idx} className="pf-trending-item">
              <div className="pf-trending-name">{topic.name}</div>
              <div className="pf-trending-posts">
                {(topic.posts || topic.count || 0).toLocaleString()} posts
              </div>
              {topic.trend === 'up' && <span className="pf-trend-up">📈</span>}
              {topic.trend === 'down' && <span className="pf-trend-down">📉</span>}
            </div>
          ))}
        </div>
      )}

      {/* Shortcuts */}
      <div className="pf-widget">
        <div className="pf-widget-header">
          <h4>Your Shortcuts</h4>
        </div>
        <div className="pf-shortcuts">
          <button className="pf-shortcut" onClick={() => navigate('/studio')}>
            <span>🎛️</span>
            <span>Studio</span>
          </button>
          <button className="pf-shortcut" onClick={() => navigate('/tv-stations')}>
            <span>📺</span>
            <span>TV Stations</span>
          </button>
          <button className="pf-shortcut" onClick={() => navigate('/powerline')}>
            <span>💬</span>
            <span>Messenger</span>
          </button>
        </div>
      </div>

      {/* Footer Links */}
      <div className="pf-footer-links">
        <a href="#">Privacy</a> · <a href="#">Terms</a> · <a href="#">Advertising</a> · <a href="#">Cookies</a>
        <div className="pf-copyright">PowerStream © {new Date().getFullYear()}</div>
      </div>
    </div>
  );
}

