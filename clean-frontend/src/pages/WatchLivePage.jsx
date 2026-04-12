import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LiveStreamPlayer from "../components/stream/LiveStreamPlayer.jsx";
import { fetchStreamBySlug } from "../lib/api.js";
import "../styles/live-stream-player.css";

export default function WatchLivePage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const json = await fetchStreamBySlug(slug);
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) {
          setErr(e.response?.data?.message || e.message || "Failed to load stream");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const playUrl = data?.hlsUrl || data?.streamUrl;

  return (
    <div className="ps-page ps-tv-stations-page" style={{ maxWidth: 960 }}>
      <div className="ps-tv-stations-hero">
        <p style={{ marginBottom: 8 }}>
          <Link to="/stations" style={{ color: "rgba(255,215,0,0.85)", fontWeight: 600 }}>
            ← All stations
          </Link>
        </p>
        <h1>{data?.name || slug || "Live"}</h1>
        <p className="ps-subtitle">
          {data?.isLive ? (
            <span style={{ color: "#ff6b6b", fontWeight: 700 }}>● LIVE</span>
          ) : (
            <span>Channel stream</span>
          )}
        </p>
      </div>

      {loading && <p style={{ textAlign: "center", opacity: 0.7 }}>Loading stream…</p>}
      {err && !loading && (
        <p style={{ textAlign: "center", color: "#ff8a8a", fontWeight: 600 }}>{err}</p>
      )}

      {!loading && !err && data && (
        <LiveStreamPlayer src={playUrl} poster={data.posterUrl} autoPlay={false} />
      )}
    </div>
  );
}
