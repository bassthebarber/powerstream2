import React from "react";
import { Link, NavLink } from "react-router-dom";
import "../styles/public-marketing-nav.css";

/**
 * Sticky glass bar for public marketing surfaces (Home hub, login).
 */
export default function PublicMarketingNav() {
  return (
    <nav className="ps-marketing-nav" aria-label="Primary">
      <NavLink to="/" end className="ps-marketing-nav__brand">
        <img src="/logos/powerstream-logo.png" alt="" width={36} height={36} loading="lazy" decoding="async" />
        <span>PowerStream</span>
      </NavLink>
      <div className="ps-marketing-nav__links">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `ps-marketing-nav__link${isActive ? " ps-marketing-nav__link--active" : ""}`}
        >
          Home
        </NavLink>
        <NavLink
          to="/tv"
          className={({ isActive }) => `ps-marketing-nav__link${isActive ? " ps-marketing-nav__link--active" : ""}`}
        >
          TV
        </NavLink>
        <NavLink
          to="/feed"
          className={({ isActive }) => `ps-marketing-nav__link${isActive ? " ps-marketing-nav__link--active" : ""}`}
        >
          Feed
        </NavLink>
        <Link to="/login" className="ps-marketing-nav__link ps-marketing-nav__link--cta">
          Login
        </Link>
      </div>
    </nav>
  );
}
