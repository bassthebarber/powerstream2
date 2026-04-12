import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./AudioHub.css";
import { cachedJsonFetch } from "../lib/apiCache.js";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

function token() {
  return localStorage.getItem("powerstreamToken") || localStorage.getItem("ps_token") || "";
}

export default function AudioHub() {
  const [tracks, setTracks] = useState([]);
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [upload, setUpload] = useState({ media_url: "", track_name: "", content: "" });
  const audioRef = useRef(null);

  const load = async () => {
    try {
      const data = await cachedJsonFetch(`${API}/audio/tracks`, {}, 8000).catch(() => ({}));
      setTracks(data.tracks || []);
    } catch (err) {
      console.warn("[AudioHub] load failed:", err);
      setTracks([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !current?.media_url) return;
    a.src = current.media_url;
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [current]);

  const publish = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/audio/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(upload),
      });
      if (!res.ok) {
        console.warn("[AudioHub] publish failed", res.status);
        return;
      }
      setUpload({ media_url: "", track_name: "", content: "" });
      load();
    } catch (err) {
      console.warn("[AudioHub] publish failed:", err);
    }
  };

  return (
    <div className="ps-audio-page">
      <header className="ps-audio-head">
        <h1>PowerStream Audio</h1>
        <p>Tracks from feed (post_type: audio)</p>
      </header>

      <div className="ps-audio-layout">
        <section className="ps-audio-list">
          {tracks.length === 0 && <p className="ps-audio-muted">No tracks yet. Publish below.</p>}
          {tracks.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`ps-audio-row ${current?.id === t.id ? "active" : ""}`}
              onClick={() => setCurrent(t)}
            >
              <span className="ps-audio-row-play">{current?.id === t.id && playing ? "❚❚" : "▶"}</span>
              <div>
                <div className="ps-audio-track-name">{t.track_name || t.content?.slice(0, 40) || "Audio"}</div>
                <div className="ps-audio-artist">
                  <Link to={`/profile/${t.user_id}`}>{t.username || t.user_id}</Link>
                </div>
              </div>
            </button>
          ))}
        </section>

        <aside className="ps-audio-side">
          <h3>Upload audio</h3>
          <p className="ps-audio-muted">Direct URL to mp3/m4a/wav (host on CDN or upload service).</p>
          <form onSubmit={publish} className="ps-audio-form">
            <input
              placeholder="Audio URL *"
              value={upload.media_url}
              onChange={(e) => setUpload({ ...upload, media_url: e.target.value })}
              required
            />
            <input
              placeholder="Track name"
              value={upload.track_name}
              onChange={(e) => setUpload({ ...upload, track_name: e.target.value })}
            />
            <textarea
              placeholder="Caption"
              value={upload.content}
              onChange={(e) => setUpload({ ...upload, content: e.target.value })}
            />
            <button type="submit">Publish to feed</button>
          </form>
        </aside>
      </div>

      {current && (
        <footer className="ps-audio-bar">
          <audio ref={audioRef} controls className="ps-audio-el" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
          <div className="ps-audio-bar-meta">
            <strong>{current.track_name || "Track"}</strong>
            <span>{current.username}</span>
          </div>
        </footer>
      )}
    </div>
  );
}
