/**
 * Full 24/7 channel experience: broadcast player + TV guide + shell.
 */
import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import StationShell from "../components/tv/StationShell.jsx";
import StationBroadcastPlayer from "../components/tv/StationBroadcastPlayer.jsx";
import TVGuide from "../components/tv/TVGuide.jsx";
import { TV_STATIONS } from "../data/tvStations.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./StationBroadcastManagePage.css";

function findStationConfig(slug) {
  if (TV_STATIONS.hub?.slug === slug) return { ...TV_STATIONS.hub, id: TV_STATIONS.hub.id };
  const s = TV_STATIONS.stations?.find(
    (x) => x.slug === slug || x.id === slug || x.route?.includes(slug)
  );
  return s || null;
}

export default function StationChannelPage() {
  const { stationSlug } = useParams();
  const { user } = useAuth();
  const cfg = useMemo(() => findStationConfig(stationSlug), [stationSlug]);

  const station = cfg
    ? {
        name: cfg.name,
        slug: cfg.slug,
        tagline: cfg.tagline,
        logo: cfg.logo,
        theme: cfg.theme || "default",
        features: cfg.features || [],
        subscriberDisplay: cfg.subscriberDisplay,
        style: cfg.style || {
          primary: "#c9a227",
          secondary: "#1a1a1a",
          accent: "#f4e4a6",
          background: "#0a0a0a",
        },
        liveEngineSlug: cfg.slug,
      }
    : {
        name: stationSlug || "Station",
        slug: stationSlug,
        tagline: "24/7 Channel",
        logo: "/logos/southernpowernetworklogo.png",
        theme: "default",
        features: ["live"],
        style: {
          primary: "#c9a227",
          secondary: "#111",
          accent: "#f4e4a6",
          background: "#0a0a0a",
        },
        liveEngineSlug: stationSlug,
      };

  /** Playlist API resolves Mongo by slug or _id — URL slug must match station record. */
  const apiStationId = stationSlug;

  return (
    <StationShell station={station} showNav>
      <div className="ps-channel-page">
        <div className="ps-channel-grid">
          <div className="ps-channel-main">
            <div className="ps-channel-banner">
              <h2>Broadcast</h2>
              <p>Live when on air · Auto-loop playlist 24/7</p>
              {user && (cfg?.features?.includes("upload") || cfg?.features?.includes("vod")) && (
                <Link
                  to={`/tv/${encodeURIComponent(stationSlug)}/broadcast/manage`}
                  className="ps-channel-dash-link"
                >
                  Station owner dashboard →
                </Link>
              )}
            </div>
            <StationBroadcastPlayer
              stationId={apiStationId}
              liveEngineSlug={station.liveEngineSlug}
              stationName={station.name}
            />
          </div>
          <TVGuideWrapper
            stationSlug={apiStationId}
            stationName={station.name}
            liveSlug={station.liveEngineSlug}
          />
        </div>
      </div>
    </StationShell>
  );
}

function TVGuideWrapper({ stationSlug, stationName, liveSlug }) {
  const [data, setData] = React.useState(null);
  const [live, setLive] = React.useState(false);

  React.useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:8080";
    let cancelled = false;
    (async () => {
      try {
        const [pr, lr] = await Promise.all([
          fetch(`${API_BASE}/api/v2/stations/${encodeURIComponent(stationSlug)}/playlist`),
          fetch(`${API_BASE}/api/live-engine/stations/${encodeURIComponent(liveSlug || stationSlug)}/status`),
        ]);
        const pj = await pr.json();
        const lj = await lr.json();
        if (!cancelled && pj.ok) setData(pj);
        if (!cancelled) setLive(!!lj?.isLive);
      } catch {
        if (!cancelled) setData(null);
      }
    })();
    const id = setInterval(async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:8080";
        const lr = await fetch(
          `${API_BASE}/api/live-engine/stations/${encodeURIComponent(liveSlug || stationSlug)}/status`
        );
        const lj = await lr.json();
        if (!cancelled) setLive(!!lj?.isLive);
      } catch {
        /* ignore */
      }
    }, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [stationSlug, liveSlug]);

  return (
    <TVGuide
      stationName={stationName}
      isLive={live}
      schedule={data?.playlist?.schedule || []}
      videos={data?.playlist?.videos || []}
      nowPlayingTitle={data?.broadcast?.nowPlaying?.title || ""}
    />
  );
}
