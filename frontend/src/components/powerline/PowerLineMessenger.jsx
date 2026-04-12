/**
 * PowerLine — Supabase line_messages only via /api/powerline/messenger/*.
 * Legacy Mongo threads are removed; 503 = configure Supabase + env.
 */
import React, { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./PowerLineMessenger.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
const POWERLINE_BASE = `${API_BASE}/powerline`;
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5001";

function getAuthToken() {
  return (
    localStorage.getItem("powerstreamToken") ||
    localStorage.getItem("ps_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

let socket;

export default function PowerLineMessenger() {
  const { user } = useAuth();
  const [messengerError, setMessengerError] = useState(null);
  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [mobileList, setMobileList] = useState(true);
  const [newDmOpen, setNewDmOpen] = useState(false);
  const [otherUserId, setOtherUserId] = useState("");
  const messagesEndRef = useRef(null);
  const activeThreadRef = useRef(null);
  const typingTimeout = useRef(null);

  const meId = user?._id || user?.id || localStorage.getItem("ps_user_id") || "";

  useEffect(() => {
    activeThreadRef.current = activeThread;
  }, [activeThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
  });

  const loadThreads = useCallback(async () => {
    setThreadsLoading(true);
    setMessengerError(null);
    try {
      const res = await fetch(`${POWERLINE_BASE}/messenger/threads`, { headers: authHeaders(), credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setThreads(data.data || data.threads || []);
        return;
      }
      if (res.status === 503 && data.code === "POWERLINE_SUPABASE_ONLY") {
        setMessengerError(data.message || "PowerLine requires Supabase (line_messages).");
      } else {
        setMessengerError(data.message || `Chats unavailable (${res.status}).`);
      }
      setThreads([]);
    } catch {
      setMessengerError("Could not load chats. Check API and Supabase.");
      setThreads([]);
    } finally {
      setThreadsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const loadMessages = async (thread) => {
    if (!thread) return;
    const tid = thread.threadId || thread._id || thread.id;
    setMessagesLoading(true);
    try {
      const res = await fetch(`${POWERLINE_BASE}/messenger/threads/${encodeURIComponent(tid)}/messages`, {
        headers: authHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      setMessages(data.messages || data.data || []);
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    socket = io(SOCKET_URL, { transports: ["websocket", "polling"], auth: token ? { token } : undefined });
    socket.on("message:new", (msg) => {
      const cur = activeThreadRef.current;
      const tid = cur?.threadId || cur?._id || cur?.id;
      const mid = msg.threadId || msg.thread_id;
      if (cur && mid === tid) {
        setMessages((prev) => {
          if (prev.some((m) => (m.id || m._id) === (msg.id || msg._id))) return prev;
          return [...prev, msg];
        });
      }
      loadThreads();
    });
    socket.on("typing", ({ threadId }) => {
      const cur = activeThreadRef.current;
      const tid = cur?.threadId || cur?._id || cur?.id;
      if (threadId === tid) {
        setTyping(true);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTyping(false), 2500);
      }
    });
    return () => socket?.disconnect();
  }, [loadThreads]);

  useEffect(() => {
    if (!socket?.connected || !activeThread) return;
    const tid = activeThread.threadId || activeThread._id || activeThread.id;
    socket.emit("joinThread", tid);
    return () => socket?.emit("leaveThread", tid);
  }, [activeThread]);

  const selectThread = async (t) => {
    setActiveThread(t);
    setMobileList(false);
    await loadMessages(t);
  };

  const sendMessage = async () => {
    const text = composerText.trim();
    if (!activeThread || !text) return;
    const tid = activeThread.threadId || activeThread._id || activeThread.id;
    setSending(true);
    try {
      await fetch(`${POWERLINE_BASE}/messenger/threads/${encodeURIComponent(tid)}/messages`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({ text }),
      });
      setComposerText("");
      await loadMessages(activeThread);
      loadThreads();
    } finally {
      setSending(false);
    }
  };

  const onComposerChange = (e) => {
    setComposerText(e.target.value);
    const tid = activeThread?.threadId || activeThread?._id || activeThread?.id;
    if (tid && socket?.connected) socket.emit("typing", tid);
  };

  const startDm = async () => {
    if (!otherUserId.trim()) return;
    try {
      const res = await fetch(`${POWERLINE_BASE}/messenger/dm`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({ otherUserId: otherUserId.trim() }),
      });
      const data = await res.json();
      if (data.thread) {
        setNewDmOpen(false);
        setOtherUserId("");
        await loadThreads();
        selectThread(data.thread);
      } else alert(data.message || "Could not start chat");
    } catch {
      alert("Could not start chat. Check Supabase and user IDs.");
    }
  };

  const formatTime = (d) => {
    if (!d) return "";
    const date = new Date(d);
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    return sameDay
      ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      : date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const otherParticipant = (thread) => {
    const parts = thread.participants || [];
    return parts.find((p) => String(p._id || p.id) !== String(meId)) || parts[0];
  };

  return (
    <div className="pl-msn">
      <aside className={`pl-msn-sidebar ${!mobileList && activeThread ? "pl-msn-sidebar--hidden-mobile" : ""}`}>
        <div className="pl-msn-sidebar-head">
          <h1>Chats</h1>
          <div className="pl-msn-sidebar-actions">
            <button type="button" className="pl-msn-icon-btn" onClick={loadThreads} title="Refresh">
              ↻
            </button>
            <button type="button" className="pl-msn-new-msg" onClick={() => setNewDmOpen(true)}>
              New message
            </button>
          </div>
        </div>
        {messengerError && (
          <p className="pl-msn-banner" role="alert">
            {messengerError} See docs/MIGRATION_SUPABASE_PRIMARY.md
          </p>
        )}
        <div className="pl-msn-conv-list">
          {threadsLoading && <div className="pl-msn-muted">Loading…</div>}
          {!threadsLoading &&
            threads.map((t) => {
              const other = otherParticipant(t);
              const active = (activeThread?.threadId || activeThread?._id) === (t.threadId || t._id);
              const preview = t.lastMessage?.text || "";
              const initials = (other?.name || t.title || "?").charAt(0).toUpperCase();
              return (
                <button
                  key={t.threadId || t._id}
                  type="button"
                  className={`pl-msn-conv ${active ? "pl-msn-conv--active" : ""}`}
                  onClick={() => selectThread(t)}
                >
                  <div className="pl-msn-avatar">
                    {other?.avatarUrl ? <img src={other.avatarUrl} alt="" /> : <span>{initials}</span>}
                  </div>
                  <div className="pl-msn-conv-body">
                    <div className="pl-msn-conv-top">
                      <span className="pl-msn-conv-name">{t.title || other?.name || "Chat"}</span>
                      <span className="pl-msn-conv-time">{formatTime(t.lastMessage?.createdAt)}</span>
                    </div>
                    <div className="pl-msn-conv-preview">{preview}</div>
                  </div>
                </button>
              );
            })}
        </div>
      </aside>

      <main className={`pl-msn-chat ${mobileList && !activeThread ? "pl-msn-chat--hidden-mobile" : ""}`}>
        {!activeThread ? (
          <div className="pl-msn-empty">
            <div className="pl-msn-empty-icon">💬</div>
            <p>Select a conversation</p>
          </div>
        ) : (
          <>
            <header className="pl-msn-chat-head">
              <button type="button" className="pl-msn-back" onClick={() => { setActiveThread(null); setMobileList(true); }}>
                ←
              </button>
              <div className="pl-msn-avatar pl-msn-avatar--sm">
                {(() => {
                  const o = otherParticipant(activeThread);
                  const ini = (o?.name || activeThread.title || "?").charAt(0).toUpperCase();
                  return o?.avatarUrl ? <img src={o.avatarUrl} alt="" /> : <span>{ini}</span>;
                })()}
              </div>
              <div className="pl-msn-chat-head-text">
                <strong>{activeThread.title || otherParticipant(activeThread)?.name}</strong>
                <span className="pl-msn-active-now">Messenger</span>
              </div>
              {otherParticipant(activeThread)?._id && (
                <Link to={`/profile/${otherParticipant(activeThread)._id}`} className="pl-msn-profile-link">
                  Profile
                </Link>
              )}
            </header>

            <div className="pl-msn-messages">
              {messagesLoading && <div className="pl-msn-muted">Loading messages…</div>}
              {!messagesLoading &&
                messages.map((msg) => {
                  const own = msg.fromSelf;
                  const text = msg.text || msg.body || "";
                  const sender = msg.sender || {};
                  return (
                    <div key={msg.id || msg._id} className={`pl-msn-row ${own ? "pl-msn-row--own" : ""}`}>
                      {!own && (
                        <div className="pl-msn-avatar pl-msn-avatar--xs">
                          {sender.avatarUrl ? <img src={sender.avatarUrl} alt="" /> : <span>{(sender.name || "U").charAt(0)}</span>}
                        </div>
                      )}
                      <div className="pl-msn-bubble-wrap">
                        <div className="pl-msn-bubble">
                          <p>{text}</p>
                          <time>{formatTime(msg.createdAt)}</time>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {typing && <div className="pl-msn-typing"><span /><span /><span /></div>}
              <div ref={messagesEndRef} />
            </div>

            <footer className="pl-msn-composer">
              <textarea
                placeholder="Aa"
                value={composerText}
                onChange={onComposerChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
              />
              <button type="button" className="pl-msn-send" disabled={!composerText.trim() || sending} onClick={sendMessage}>
                Send
              </button>
            </footer>
          </>
        )}
      </main>

      {newDmOpen && (
        <div className="pl-msn-modal-bg" onClick={() => setNewDmOpen(false)}>
          <div className="pl-msn-modal" onClick={(e) => e.stopPropagation()}>
            <h3>New message</h3>
            <p className="pl-msn-muted">Enter the other member&apos;s user ID (same id used in profiles.external_user_id / auth).</p>
            <input
              value={otherUserId}
              onChange={(e) => setOtherUserId(e.target.value)}
              placeholder="User ID"
              className="pl-msn-input"
            />
            <div className="pl-msn-modal-actions">
              <button type="button" className="pl-msn-btn-secondary" onClick={() => setNewDmOpen(false)}>
                Cancel
              </button>
              <button type="button" className="pl-msn-btn-gold" onClick={startDm}>
                Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
