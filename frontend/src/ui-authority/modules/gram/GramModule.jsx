import React, { memo } from "react";

export const StoryBar = memo(function StoryBar({ stories = [], onSelect }) {
  return (
    <div className="ps-ui-storybar">
      {stories.map((s) => (
        <button key={s.id} type="button" onClick={() => onSelect?.(s)}>
          {s.user?.name || "Story"}
        </button>
      ))}
    </div>
  );
});

export const GramGrid = memo(function GramGrid({ items = [], onOpen }) {
  return (
    <div className="ps-ui-gram-grid">
      {items.map((g) => (
        <button key={g.id} type="button" onClick={() => onOpen?.(g)}>
          <img src={g.media_url} alt={g.caption || "gram"} loading="lazy" />
        </button>
      ))}
    </div>
  );
});

export const GramModal = memo(function GramModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="ps-ui-modal" role="dialog">
      <button type="button" onClick={onClose}>Close</button>
      <img src={item.media_url} alt={item.caption || "gram"} />
      <p>{item.caption}</p>
    </div>
  );
});

export default { StoryBar, GramGrid, GramModal };
