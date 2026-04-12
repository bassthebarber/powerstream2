/**
 * 24/7 MTV-style channel player: LIVE (HLS) when stream active, else playlist auto-loop.
 */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import LivePlayer from "./LivePlayer.jsx";
import { fetchLiveEngineStatus } from "../../lib/liveEngineApi.js";
import "./StationBroadcastPlayer.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:8080";

function buildVodOrder(videos, startIdx, loop) {
  if (!videos?.length) return [];
  const s = Math.max(0, Math.min(startIdx || 0, videos.length - 1));
  if (loop) {
    return [...videos.slice(s), ...videos.slice(0, s)];
  }
  return videos.slice(s);
}

export default function StationBroadcastPlayer({
  stationId,
  liveEngineSlug,
  stationName = "Channel",
}) {
  const [live, setLive] = useState({ isLive: false, playbackUrl: null, title: "" });
  const [playlistRes, setPlaylistRes] = useState(null);
  const [err, setErr] = useState("");
  const [vodOrder, setVodOrder] = useState([]);
  const [vodIdx, setVodIdx] = useState(0);

  const slug = liveEngineSlug || stationId;

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        const d = await fetchLiveEngineStatus(slug);
        setLive({
          isLive: !!d?.isLive,
          playbackUrl: d?.playbackUrl || null,
          title: d?.title || stationName,
        });
      } catch {
        setLive({ isLive: false, playbackUrl: null, title: stationName });
      }
    };
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [slug, stationName]);

  useEffect(() => {
    if (!stationId) return;
    const load = async () => {
      try {
        const r = await fetch(
          `${API_BASE}/api/v2/stations/${encodeURIComponent(stationId)}/playlist`
        );
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Playlist unavailable");
        setPlaylistRes(d);
        setErr("");
      } catch (e) {
        setErr(e.message || "Offline");
        setPlaylistRes(null);
      }
    };
    load();
    const id = setInterval(load, 120000);
    return () => clearInterval(id);
  }, [stationId]);

  useEffect(() => {
    if (live.isLive || !playlistRes) return;
    const { broadcast, playlist } = playlistRes;
    const vids = playlist?.videos || [];
    const loop = playlist?.loop !== false;

    if (broadcast?.mode === "scheduled" && broadcast?.nowPlaying?.url) {
      const rest = buildVodOrder(
        vids.filter((x) => x.url !== broadcast.nowPlaying.url),
        0,
        loop
      );
      setVodOrder([broadcast.nowPlaying, ...rest]);
    } else {
      const start =
        broadcast?.nowPlayingIndex != null ? broadcast.nowPlayingIndex : 0;
      setVodOrder(buildVodOrder(vids, start, loop));
    }
    setVodIdx(0);
  }, [live.isLive, playlistRes]);

  const onVodEnded = useCallback(() => {
    setVodIdx((i) => {
      const next = i + 1;
      const loop = playlistRes?.playlist?.loop !== false;
      if (next >= vodOrder.length) {
        return loop ? 0 : i;
      }
      return next;
    });
  }, [vodOrder.length, playlistRes?.playlist?.loop]);

  const currentVod = vodOrder[vodIdx];
  const upNext = vodOrder[vodIdx + 1] || (playlistRes?.playlist?.loop ? vodOrder[0] : null);

  const nowPlayingLabel = useMemo(() => {
    if (live.isLive) return live.title || "LIVE";
    return currentVod?.title || playlistRes?.broadcast?.nowPlaying?.title || "Off air";
  }, [live, currentVod, playlistRes]);

  if (live.isLive && live.playbackUrl) {
    return (
      <div className="ps-broadcast">
        <div className="ps-broadcast-chyron">
          <span className="ps-broadcast-chyron-live">
            <span className="ps-broadcast-dot" /> LIVE
          </span>
          <span className="ps-broadcast-chyron-title">Now Playing: {nowPlayingLabel}</span>
        </div>
        <LivePlayer
          url={live.playbackUrl}
          title={stationName}
          isLive
          autoPlay
          className="ps-broadcast-player"
        />
        <div className="ps-broadcast-meta ps-broadcast-meta--live">
          <p>Broadcast stream — playlist resumes when live ends.</p>
        </div>
      </div>
    );
  }

  if (!vodOrder.length) {
    return (
      <div className="ps-broadcast ps-broadcast--empty">
        <div className="ps-broadcast-chyron">
          <span className="ps-broadcast-chyron-title">Now Playing: —</span>
        </div>
        <div className="ps-broadcast-offair">
          <span className="ps-broadcast-offair-icon">📡</span>
          <h3>Off air</h3>
          <p>{err || "Add videos to this station’s playlist (owner dashboard) or go live."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ps-broadcast">
      <div className="ps-broadcast-chyron">
        <span className="ps-broadcast-chyron-gold">NOW PLAYING</span>
        <span className="ps-broadcast-chyron-title">{currentVod?.title || "Video"}</span>
      </div>
      <LivePlayer
        key={(currentVod?.url || "") + vodIdx}
        url={currentVod?.url}
        poster={currentVod?.thumbnail}
        title={currentVod?.title}
        isLive={false}
        autoPlay
        onEnded={onVodEnded}
        className="ps-broadcast-player"
      />
      <div className="ps-broadcast-queue">
        <div className="ps-broadcast-queue-col">
          <h4>Up Next</h4>
          {upNext && upNext.url !== currentVod?.url ? (
            <div className="ps-broadcast-queue-card">
              {upNext.thumbnail && <img src={upNext.thumbnail} alt="" />}
              <div>
                <strong>{upNext.title}</strong>
              </div>
            </div>
          ) : (
            <p className="ps-broadcast-muted">
              {playlistRes?.playlist?.loop ? "Loops to start" : "End of queue"}
            </p>
          )}
        </div>
        <div className="ps-broadcast-queue-col ps-broadcast-queue-col--wide">
          <h4>Playlist queue</h4>
          <ol className="ps-broadcast-queue-list">
            {vodOrder.map((v, i) => (
              <li
                key={v._id || `${v.url}-${i}`}
                className={i === vodIdx ? "active" : i < vodIdx ? "done" : ""}
              >
                <span className="ps-broadcast-q-idx">{i + 1}</span>
                {v.title}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
