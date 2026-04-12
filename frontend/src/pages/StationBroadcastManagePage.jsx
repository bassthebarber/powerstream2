/**
 * Station owner: upload URLs, reorder playlist, toggle loop.
 */
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getToken } from "../utils/auth.js";
import "./StationBroadcastManagePage.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:8080";

export default function StationBroadcastManagePage() {
  const { stationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [title, setTitle] = useState("Channel 24/7");
  const [loop, setLoop] = useState(true);
  const [videos, setVideos] = useState([]);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const headers = useCallback(() => {
    const h = { "Content-Type": "application/json" };
    const t = getToken();
    if (t) h.Authorization = `Bearer ${t}`;
    return h;
  }, []);

  const load = useCallback(async () => {
    if (!stationId) return;
    setLoading(true);
    try {
      const r = await fetch(
        `${API_BASE}/api/v2/stations/${encodeURIComponent(stationId)}/playlist`
      );
      const d = await r.json();
      if (d.ok && d.playlist) {
        setTitle(d.playlist.title || "Channel 24/7");
        setLoop(d.playlist.loop !== false);
        setVideos(
          (d.playlist.videos || []).map((v) => ({
            url: v.url,
            title: v.title || "Untitled",
            thumbnail: v.thumbnail || "",
            durationSeconds: v.durationSeconds || 600,
          }))
        );
      }
    } catch {
      setMsg("Could not load playlist");
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveFull = async () => {
    setSaving(true);
    setMsg("");
    try {
      const r = await fetch(
        `${API_BASE}/api/v2/stations/${encodeURIComponent(stationId)}/playlist`,
        {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ title, loop, videos }),
        }
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Save failed");
      setMsg("Saved.");
    } catch (e) {
      setMsg(e.message || "Save failed — must be station owner");
    } finally {
      setSaving(false);
    }
  };

  const addVideo = () => {
    const url = newUrl.trim();
    if (!url) return;
    setVideos((v) => [
      ...v,
      {
        url,
        title: newTitle.trim() || "New video",
        thumbnail: "",
        durationSeconds: 600,
      },
    ]);
    setNewUrl("");
    setNewTitle("");
  };

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= videos.length) return;
    const next = [...videos];
    [next[i], next[j]] = [next[j], next[i]];
    setVideos(next);
  };

  const remove = (i) => {
    setVideos((v) => v.filter((_, idx) => idx !== i));
  };

  if (loading) {
    return (
      <div className="ps-bmanage">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="ps-bmanage">
      <Link to={`/tv/${encodeURIComponent(stationId)}/channel`} className="ps-bmanage-back">
        ← Back to channel
      </Link>
      <h1>Broadcast playlist</h1>
      <p className="ps-bmanage-sub">Station ID: {stationId}</p>

      <label className="ps-bmanage-label">Playlist title</label>
      <input
        className="ps-bmanage-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="ps-bmanage-check">
        <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
        Loop 24/7 (when live is off)
      </label>

      <h2>Videos (order = play order)</h2>
      <ul className="ps-bmanage-list">
        {videos.map((v, i) => (
          <li key={i}>
            <span className="ps-bmanage-idx">{i + 1}</span>
            <div className="ps-bmanage-v">
              <input
                value={v.title}
                onChange={(e) => {
                  const next = [...videos];
                  next[i] = { ...next[i], title: e.target.value };
                  setVideos(next);
                }}
              />
              <input
                className="ps-bmanage-url"
                value={v.url}
                onChange={(e) => {
                  const next = [...videos];
                  next[i] = { ...next[i], url: e.target.value };
                  setVideos(next);
                }}
              />
            </div>
            <div className="ps-bmanage-actions">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === videos.length - 1}>
                ↓
              </button>
              <button type="button" className="danger" onClick={() => remove(i)}>
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      <h3>Add video URL</h3>
      <div className="ps-bmanage-add">
        <input
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <input
          placeholder="Video URL (MP4 or direct link)"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
        />
        <button type="button" onClick={addVideo}>
          Add to queue
        </button>
      </div>

      {msg && <p className="ps-bmanage-msg">{msg}</p>}

      <button
        type="button"
        className="ps-bmanage-save"
        disabled={saving}
        onClick={saveFull}
      >
        {saving ? "Saving…" : "Save playlist"}
      </button>
    </div>
  );
}
