import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api.js";
import TVPlayer from "../components/tv/TVPlayer.jsx";

export default function StationLiveById() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState(null);
  const [live, setLive] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const [stationRes, liveRes] = await Promise.all([
          api.get(`/stations/${encodeURIComponent(id)}`),
          api.get(`/stations/${encodeURIComponent(id)}/live`),
        ]);
        if (cancelled) return;
        setStation(stationRes.data?.station || null);
        setLive(liveRes.data || null);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load station");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="ps-page">
        <p style={{ textAlign: "center", opacity: 0.75 }}>Loading station…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ps-page">
        <h2>Station Load Error</h2>
        <p style={{ opacity: 0.8 }}>{error}</p>
        <Link to="/stations">← Back to Stations</Link>
      </div>
    );
  }

  const playbackUrl = live?.playbackUrl || station?.playbackUrl || "";
  const isLive = !!live?.isLive;

  return (
    <div className="ps-page" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>{station?.name || "Station"}</h1>
          <div style={{ opacity: 0.8, fontSize: 14 }}>
            {isLive ? "LIVE" : "OFFLINE"} {station?.streamKey ? `• streamKey: ${station.streamKey}` : ""}
          </div>
        </div>
        <Link to="/stations">← Stations</Link>
      </div>

      <div style={{ marginTop: 16, borderRadius: 12, overflow: "hidden" }}>
        <TVPlayer src={playbackUrl} autoPlay muted={!isLive} />
      </div>

      <div style={{ marginTop: 10, fontSize: 13, opacity: 0.8 }}>
        HLS URL: <code>{playbackUrl || "(none)"}</code>
      </div>
    </div>
  );
}

