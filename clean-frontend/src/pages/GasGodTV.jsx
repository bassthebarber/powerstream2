import React, { useMemo } from "react";
import StationShell from "../components/tv/StationShell.jsx";
import StationBroadcastPlayer from "../components/tv/StationBroadcastPlayer.jsx";
import TVGuide from "../components/tv/TVGuide.jsx";

const DEFAULT_STATION = {
  name: "Gas God TV",
  slug: "gas-god-tv",
  tagline: "Street heat, live energy, Houston culture.",
  logo: "/logos/tv/gas-god-tv.png",
  liveEngineSlug: "gasgod",
  style: {
    primary: "#f5b700",
    secondary: "#111111",
    accent: "#ff5f1f",
    background: "#050505",
  },
};

/**
 * GasGodTV page:
 * - Uses the shared station shell/player stack
 * - Keeps styling + behavior consistent with the TV architecture
 */
export default function GasGodTV() {
  const station = useMemo(() => DEFAULT_STATION, []);

  return (
    <StationShell station={station} showNav>
      <div className="ps-channel-page">
        <div className="ps-channel-grid">
          <div className="ps-channel-main">
            <div className="ps-channel-banner">
              <h2>Gas God Live Channel</h2>
              <p>Live when on air. Automated loop when offline.</p>
            </div>
            <StationBroadcastPlayer
              stationId={station.slug}
              liveEngineSlug={station.liveEngineSlug}
              stationName={station.name}
            />
          </div>

          <TVGuide
            stationName={station.name}
            isLive={false}
            schedule={[
              {
                title: "Gas God Daily Mix",
                startsAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
                durationMin: 60,
              },
              {
                title: "Houston Street Stories",
                startsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                durationMin: 45,
              },
            ]}
            videos={[]}
            nowPlayingTitle="Waiting for live signal"
          />
        </div>
      </div>
    </StationShell>
  );
}
