// frontend/src/components/layout/DockNavigation.jsx
// Mobile bottom dock navigation per Overlord Spec
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./layout.css";

const DOCK_ITEMS = [
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/powerfeed", label: "Feed", icon: "📰" },
  { path: "/powerreel", label: "Reels", icon: "🎬" },
  { path: "/explore", label: "Explore", icon: "🧭" },
  { path: "/menu", label: "Menu", icon: "☰" },
];

export default function DockNavigation() {
  const { user } = useAuth();
  
  return (
    <nav className="ps-dock">
      {DOCK_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `ps-dock-item ${isActive ? "ps-dock-item--active" : ""}`
          }
        >
          <span className="ps-dock-icon">{item.icon}</span>
          <span className="ps-dock-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}












