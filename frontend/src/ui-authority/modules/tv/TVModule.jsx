import React, { memo } from "react";

export const TVStationGrid = memo(function TVStationGrid({ stations = [], onOpen }) {
  return (
    <div className="ps-ui-tv-grid">
      {stations.map((s) => (
        <button key={s._id || s.slug} type="button" className="ps-ui-tv-card" onClick={() => onOpen?.(s)}>
          <strong>{s.name}</strong>
          {s.isLive ? <span className="live">LIVE</span> : null}
          <small>{s.slug}</small>
        </button>
      ))}
    </div>
  );
});

export const TVStationPanel = memo(function TVStationPanel({ station }) {
  if (!station) return null;
  return (
    <section className="ps-ui-tv-panel">
      <h3>{station.name}</h3>
      <p>{station.description || "Station profile"}</p>
      <div>Schedule: {(station.schedule || []).length} events</div>
      {station.streamUrl ? <a href={station.streamUrl}>Open Stream</a> : <span>No stream URL</span>}
    </section>
  );
});

export default { TVStationGrid, TVStationPanel };
