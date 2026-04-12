// frontend/src/components/powerfeed/StoriesRow.jsx
// Horizontal scrolling stories row
import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function StoriesRow({ 
  stories = [], 
  onCreateStory, 
  onViewStory,
  loading = false 
}) {
  const { user } = useAuth();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const displayName = user?.name || user?.displayName || 'You';
  const avatarUrl = user?.avatarUrl || user?.avatar;
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 300;
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="pf-stories pf-stories--loading">
        <div className="pf-story pf-story--skeleton"></div>
        <div className="pf-story pf-story--skeleton"></div>
        <div className="pf-story pf-story--skeleton"></div>
        <div className="pf-story pf-story--skeleton"></div>
      </div>
    );
  }

  return (
    <section className="pf-stories-container">
      {/* Scroll Buttons */}
      {canScrollLeft && (
        <button className="pf-stories-arrow pf-stories-arrow--left" onClick={() => scroll('left')}>
          ‹
        </button>
      )}
      {canScrollRight && stories.length > 4 && (
        <button className="pf-stories-arrow pf-stories-arrow--right" onClick={() => scroll('right')}>
          ›
        </button>
      )}

      <div 
        className="pf-stories" 
        ref={scrollRef}
        onScroll={checkScroll}
      >
        {/* Create Story */}
        <div className="pf-story pf-story--create" onClick={onCreateStory}>
          <div className="pf-story-bg">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" />
            ) : (
              <div className="pf-story-bg-placeholder">{initials}</div>
            )}
          </div>
          <div className="pf-story-create-btn">+</div>
          <span className="pf-story-label">Create Story</span>
        </div>

        {/* User Stories */}
        {stories.map(story => {
          const storyUser = story.user || {};
          const name = storyUser.name || storyUser.username || story.username || 'User';
          const avatar = storyUser.avatarUrl || story.media_url;
          const storyInitials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          const hasNew = !story.viewed && story.expires_at && new Date(story.expires_at) > new Date();

          return (
            <div 
              key={story.id || story._id}
              className={`pf-story ${hasNew ? 'pf-story--new' : 'pf-story--viewed'}`}
              onClick={() => onViewStory?.(story)}
            >
              <div className="pf-story-ring">
                <div className="pf-story-avatar">
                  {avatar ? (
                    <img src={avatar} alt={name} />
                  ) : (
                    <span>{storyInitials}</span>
                  )}
                </div>
              </div>
              <span className="pf-story-label">
                {name.length > 10 ? name.slice(0, 9) + '…' : name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

