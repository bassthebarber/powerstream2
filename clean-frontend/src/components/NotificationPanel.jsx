import React from "react";

function routeForNotification(n) {
  const m = n.data || n.metadata || {};
  if (m.path) return m.path;
  switch (n.type) {
    case "dm":
      return "/powerline";
    case "live":
    case "video":
      return m.stationSlug
        ? `/tv/${encodeURIComponent(m.stationSlug)}/channel`
        : "/tv";
    case "subscription":
      return m.path || "/tv";
    case "post":
    case "like":
    case "comment":
    default:
      return "/powerfeed";
  }
}

export { routeForNotification };

export default function NotificationPanel({
  open,
  items,
  unread,
  loading,
  onMarkAll,
  onItemClick,
}) {
  if (!open) return null;

  return (
    <div className="ps-notify-dropdown" role="menu">
      <div className="ps-notify-head">
        <strong>Notifications</strong>
        {unread > 0 && (
          <button
            type="button"
            className="ps-notify-markall"
            onClick={onMarkAll}
            disabled={loading}
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="ps-notify-list">
        {items.length === 0 ? (
          <p className="ps-notify-empty">No notifications yet</p>
        ) : (
          items.map((n) => {
            const id = n.id || n._id;
            const isRead = n.isRead === true || n.read === true;
            return (
              <button
                key={id}
                type="button"
                role="menuitem"
                className={`ps-notify-item${isRead ? "" : " ps-notify-item--unread"}`}
                onClick={() => onItemClick(n)}
              >
                <span className="ps-notify-type">{n.type}</span>
                <span className="ps-notify-msg">{n.message}</span>
                <span className="ps-notify-time">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
