import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/premium-ui.css";

/**
 * Public shell: glass top nav, no forced login (use inside routes that should stay public).
 */
export default function PlatformLayout({ children }) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="ps-platform-shell">
      <header className="ps-platform-nav" role="navigation" aria-label="Platform">
        <Link to="/" className="ps-platform-nav__brand">
          <img src="/logos/powerstream-logo.png" alt="" width={34} height={34} loading="lazy" />
          <span>PowerStream</span>
        </Link>
        <div className="ps-platform-nav__links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `ps-platform-nav__link${isActive ? " ps-platform-nav__link--active" : ""}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/tv"
            className={({ isActive }) => `ps-platform-nav__link${isActive ? " ps-platform-nav__link--active" : ""}`}
          >
            Network TV
          </NavLink>
          <NavLink
            to="/stations"
            className={({ isActive }) => `ps-platform-nav__link${isActive ? " ps-platform-nav__link--active" : ""}`}
          >
            Stations
          </NavLink>
          <NavLink
            to="/tv-guide"
            className={({ isActive }) => `ps-platform-nav__link${isActive ? " ps-platform-nav__link--active" : ""}`}
          >
            Guide
          </NavLink>
          <NavLink
            to="/world-tv"
            className={({ isActive }) => `ps-platform-nav__link${isActive ? " ps-platform-nav__link--active" : ""}`}
          >
            World TV
          </NavLink>
          {user ? (
            <Link to="/feed" className="ps-platform-nav__link ps-platform-nav__link--accent">
              Enter app
            </Link>
          ) : (
            <Link to="/login" className="ps-platform-nav__link ps-platform-nav__link--accent">
              Login
            </Link>
          )}
        </div>
      </header>
      <div className="ps-platform-body ps-route-enter" key={location.pathname}>
        {children}
      </div>
    </div>
  );
}
