// frontend/src/components/powerreel/ReelPlayer.jsx
// TikTok-style fullscreen vertical player with snap scroll
import React, { useRef, useEffect, useState } from 'react';
import ReelCard from './ReelCard.jsx';

export default function ReelPlayer({ 
  reels = [], 
  initialIndex = 0,
  onReelChange,
  onLike,
  onComment,
  onShare,
  onViewReel,
  userId 
}) {
  const containerRef = useRef(null);
  const reelRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // Intersection Observer for detecting which reel is in view
  useEffect(() => {
    if (!reels.length) return;

    const options = {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 0.6,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.dataset.reelIdx);
          if (!isNaN(idx)) {
            setActiveIndex(idx);
            onReelChange?.(idx);
          }
        }
      });
    }, options);

    reelRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [reels, onReelChange]);

  // Track view when reel becomes active
  useEffect(() => {
    if (reels[activeIndex]) {
      const reelId = reels[activeIndex].id || reels[activeIndex]._id;
      if (reelId) {
        onViewReel?.(reelId);
      }
    }
  }, [activeIndex, reels, onViewReel]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' && activeIndex < reels.length - 1) {
        e.preventDefault();
        scrollToReel(activeIndex + 1);
      } else if (e.key === 'ArrowUp' && activeIndex > 0) {
        e.preventDefault();
        scrollToReel(activeIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, reels.length]);

  const scrollToReel = (index) => {
    const ref = reelRefs.current[index];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (reels.length === 0) {
    return (
      <div className="pr-empty">
        <div className="pr-empty-icon">🎬</div>
        <h3>No Reels Yet</h3>
        <p>Be the first to share a PowerReel!</p>
      </div>
    );
  }

  return (
    <div className="pr-container" ref={containerRef}>
      {reels.map((reel, idx) => (
        <ReelCard
          key={reel.id || reel._id || idx}
          ref={(el) => (reelRefs.current[idx] = el)}
          reel={reel}
          index={idx}
          isActive={idx === activeIndex}
          userId={userId}
          onLike={() => onLike?.(reel.id || reel._id)}
          onComment={() => onComment?.(reel.id || reel._id)}
          onShare={() => onShare?.(reel)}
        />
      ))}
    </div>
  );
}
