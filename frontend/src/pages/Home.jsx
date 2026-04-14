import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const modules = [
    { name: "PowerFeed", path: "/feed" },
    { name: "PowerGram", path: "/gram" },
    { name: "PowerReels", path: "/reel" },
    { name: "PowerLine", path: "/line" },
    { name: "TV Stations", path: "/stations" },
    { name: "Southern Power Network", path: "/network/southernpower" },
    { name: "Studio", path: "/studio" },
    { name: "AI Brain", path: "/ai-brain" },
    { name: "Music", path: "/music" }
  ];

  return (
    <div style={{ padding: 40, textAlign: "center", background: "#000", minHeight: "100vh" }}>
      <h1 style={{ color: "gold", fontSize: "40px" }}>
        🔥 PowerStream Platform
      </h1>

      <p style={{ color: "#ccc", marginBottom: 30 }}>
        Select a module to enter
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 20
      }}>
        {modules.map((mod, i) => (
          <Link key={i} to={mod.path} style={{
            padding: 20,
            background: "#111",
            border: "1px solid gold",
            borderRadius: 10,
            color: "white",
            textDecoration: "none"
          }}>
            {mod.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
