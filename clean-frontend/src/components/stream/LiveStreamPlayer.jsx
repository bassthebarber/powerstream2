import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import "../../styles/live-stream-player.css";

/**
 * HLS-aware live player. Falls back to native src for MP4 etc.
 */
export default function LiveStreamPlayer({ src, poster, autoPlay = false, className = "" }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return undefined;

    let hls;
    const isHls = /\.m3u8(\?|$)/i.test(src) || src.includes("application/x-mpegURL");

    if (isHls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30,
        liveSyncDurationCount: 3,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data?.fatal && import.meta.env.DEV) {
          console.warn("[HLS]", data.type, data.details);
        }
      });
    } else if (isHls && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      video.src = src;
    }

    if (autoPlay) {
      video.play().catch(() => {});
    }

    return () => {
      if (hls) hls.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, autoPlay]);

  if (!src) {
    return (
      <div className={`ps-live-player ps-live-player--empty ${className}`.trim()}>
        <p>No stream URL available for this channel.</p>
      </div>
    );
  }

  return (
    <div className={`ps-live-player ${className}`.trim()}>
      <video
        ref={videoRef}
        className="ps-live-player__video"
        poster={poster || undefined}
        controls
        playsInline
        muted={autoPlay}
      />
    </div>
  );
}
