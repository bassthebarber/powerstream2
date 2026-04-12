import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../lib/api.js";
import { getToken } from "../utils/auth.js";
import { SOCKET_URL } from "../config/apiConfig.js";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationPanel, { routeForNotification } from "./NotificationPanel.jsx";
import "./NotificationBell.css";

export default function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const socketRef = useRef(null);
  const seenIds = useRef(new Set());

  const fetchList = useCallback(async () => {
    const token = getToken();
    if (!token || !userId) return;
    try {
      const { data } = await api.get(`/notifications/${userId}`, { params: { limit: 50 } });
      if (data?.ok) {
        const list = data.notifications || [];
        setItems(list);
        seenIds.current = new Set(list.map((n) => String(n.id || n._id)));
        setUnread(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      }
    } catch {
      /* ignore */
    }
  }, [userId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    const token = getToken();
    if (!token || !userId) return;

    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("notification:new", (n) => {
      const nid = String(n.id || n._id || "");
      const forUser = String(n.userId || "") === String(userId);
      if (!forUser || !nid) return;
      if (seenIds.current.has(nid)) return;
      seenIds.current.add(nid);
      setItems((prev) => [n, ...prev].slice(0, 50));
      const isRead = n.isRead === true || n.read === true;
      if (!isRead) setUnread((c) => c + 1);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setItems((prev) =>
        prev.map((x) =>
          String(x.id || x._id) === String(id) ? { ...x, isRead: true, read: true } : x
        )
      );
      setUnread((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  };

  const markAll = async () => {
    setLoading(true);
    try {
      const unreadItems = items.filter((x) => !x.isRead && !x.read);
      await Promise.all(
        unreadItems.map((x) => api.put(`/notifications/${x.id || x._id}/read`).catch(() => {}))
      );
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true, read: true })));
      setUnread(0);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const onItemClick = (n) => {
    const id = n.id || n._id;
    const isRead = n.isRead === true || n.read === true;
    if (!isRead) markRead(id);
    setOpen(false);
    navigate(routeForNotification(n));
  };

  if (!userId) return null;

  return (
    <div className="ps-notify" ref={wrapRef}>
      <button
        type="button"
        className="ps-notify-bell"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
          if (!open) fetchList();
        }}
      >
        <span className="ps-notify-bell-icon">🔔</span>
        {unread > 0 && (
          <span className="ps-notify-badge">{unread > 99 ? "99+" : unread}</span>
        )}
      </button>

      <NotificationPanel
        open={open}
        items={items}
        unread={unread}
        loading={loading}
        onMarkAll={markAll}
        onItemClick={onItemClick}
      />
    </div>
  );
}
