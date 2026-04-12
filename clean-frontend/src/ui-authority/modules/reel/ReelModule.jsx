import React, { memo } from "react";

export const ReelStack = memo(function ReelStack({ reels = [] }) {
  return (
    <div className="ps-ui-reel-stack">
      {reels.map((r) => (
        <article key={r.id} className="ps-ui-reel-item">
          <video src={r.media_url} controls playsInline autoPlay muted loop preload="metadata" />
          <p>{r.caption || ""}</p>
        </article>
      ))}
    </div>
  );
});

export default ReelStack;
