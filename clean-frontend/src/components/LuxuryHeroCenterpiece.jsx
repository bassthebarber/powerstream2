import React, { useMemo, useState } from "react";
import "../styles/premium-home.css";

const PARTICLE_COUNT = 20;

/**
 * Shared luxury hero: inward spiral gold streaks, sun core, rays, corona, particles, centered logo.
 */
export default function LuxuryHeroCenterpiece({ logoSrc, logoAlt = "PowerStream", fetchPriority }) {
  const [logoOk, setLogoOk] = useState(true);

  const particleDelays = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => `${(i * 0.31) % 5}s`);
  }, []);

  return (
    <div className="ps-home__hero-luxury">
      <div className="ps-home__hero-luxury-bg" aria-hidden />
      {/* Sun core — radiant power source behind logo */}
      <div className="ps-home__hero-sun-core" aria-hidden />
      <div className="ps-home__hero-rays" aria-hidden />
      <div className="ps-home__hero-corona" aria-hidden />
      <div className="ps-home__hero-spiral ps-home__hero-spiral--a" aria-hidden />
      <div className="ps-home__hero-spiral ps-home__hero-spiral--b" aria-hidden />
      <div className="ps-home__hero-spiral ps-home__hero-spiral--c" aria-hidden />
      <div className="ps-home__hero-spiral ps-home__hero-spiral--d" aria-hidden />
      <div className="ps-home__hero-particles" aria-hidden>
        {particleDelays.map((delay, i) => (
          <span
            key={i}
            className="ps-home__hero-particle"
            style={{
              animationDelay: delay,
              "--a": `${(360 / PARTICLE_COUNT) * i}deg`,
            }}
          />
        ))}
      </div>
      <div className="ps-home__hero-logo-shell">
        <div className="ps-home__hero-power-ring" aria-hidden />
        {logoOk ? (
          <img
            className="ps-home__logo"
            src={logoSrc}
            alt={logoAlt}
            width={200}
            height={200}
            decoding="async"
            fetchPriority={fetchPriority}
            onError={() => setLogoOk(false)}
          />
        ) : (
          <div className="ps-home__logo ps-home__logo--fallback" aria-label={logoAlt}>
            PS
          </div>
        )}
      </div>
    </div>
  );
}
