import React, { memo } from "react";

export const LineLayout = memo(function LineLayout({ threads = [], activeThread, children }) {
  return (
    <div className="ps-ui-line">
      <aside className="ps-ui-line-sidebar">
        {threads.map((t) => (
          <div key={t.id} className={activeThread === t.id ? "active" : ""}>
            <strong>{t.title || "Chat"}</strong>
            <small>{t.online ? "online" : "offline"}</small>
          </div>
        ))}
      </aside>
      <section className="ps-ui-line-chat">{children}</section>
    </div>
  );
});

export default LineLayout;
