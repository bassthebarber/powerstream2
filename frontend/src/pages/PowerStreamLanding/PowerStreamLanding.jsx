import React from "react";
import { Link } from "react-router-dom";
import PublicMarketingNav from "../../components/PublicMarketingNav.jsx";
import LuxuryHeroCenterpiece from "../../components/LuxuryHeroCenterpiece.jsx";
import "../../styles/premium-home.css";

/**
 * Marketing landing — black glass nav + luxury gold hero.
 */
export default function PowerStreamLanding() {
  return (
    <>
      <PublicMarketingNav />
      <div className="ps-home">
        <div className="ps-home__inner">
          <LuxuryHeroCenterpiece logoSrc="/logos/powerstream-logo.png" logoAlt="PowerStream" />

          <h1 className="ps-home__title">PowerStream</h1>
          <p className="ps-home__subtitle">
            Live TV, artist channels, and social — one refined platform for creators and audiences.
          </p>

          <div className="ps-home__cta-row">
            <Link to="/stations" className="ps-home__btn-primary" style={{ textDecoration: "none", textAlign: "center" }}>
              Browse stations
            </Link>
            <Link to="/login" className="ps-home__btn-secondary" style={{ textDecoration: "none", textAlign: "center" }}>
              Sign in
            </Link>
          </div>

          <p className="ps-landing__hint">
            <Link to="/home" className="ps-landing__hint-link">
              Open full platform hub →
            </Link>
          </p>

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <Link to="/tv" className="ps-landing__secondary-link">
              Southern Power Network →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
