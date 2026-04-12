import React, { useEffect, useState } from "react";
import { fetchPlatformStations } from "../lib/api.js";
import StationCard from "../components/tv/StationCard.jsx";
import "../components/tv/tv.css";

/**
 * Unified TV + artist stations from GET /api/stations
 */
export default function StationsHub() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchPlatformStations({ kind: "all" });
        const list = data?.stations || [];
        if (!cancelled) setStations(list);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Could not load stations");
          setStations([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tv = stations.filter((s) => s.kind === "tv" || s.type === "tv");
  const artists = stations.filter((s) => s.kind === "artist" || s.type === "artist" || s.type === "stream");

  const renderGrid = (list, emptyMsg) => {
    if (!list.length) {
      return <p style={{ textAlign: "center", opacity: 0.6 }}>{emptyMsg}</p>;
    }
    return (
      <div className="ps-tv-stations-grid">
        {list.map((s) => (
          <StationCard
            key={s.id || s.slug}
            station={{
              ...s,
              name: s.name,
              slug: s.slug,
              description: s.description,
              isLive: s.isLive,
              logoUrl: s.logoUrl,
              theme: {},
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="ps-page ps-tv-stations-page">
      <div className="ps-tv-stations-hero">
        <h1>Stations</h1>
        <p className="ps-subtitle">Live TV channels and artist streams — powered by your API</p>
      </div>

      {loading && <p style={{ textAlign: "center", opacity: 0.7 }}>Loading stations…</p>}
      {error && !loading && <p className="ps-lux-text-error">{error}</p>}

      {!loading && !error && (
        <>
          <section style={{ marginBottom: 48 }}>
            <h2 className="ps-lux-section-title">TV stations</h2>
            {renderGrid(tv, "No TV stations yet — add them in the admin / database.")}
          </section>

          <section>
            <h2 className="ps-lux-section-title">Artist channels</h2>
            {renderGrid(
              artists,
              "No artist channels yet — set type to artist or stream on Station records."
            )}
          </section>
        </>
      )}
    </div>
  );
}
