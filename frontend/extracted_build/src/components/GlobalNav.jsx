// frontend/src/components/GlobalNav.jsx
// Global Navigation Bar Component
// RESPONSIVE UPGRADE - Hamburger menu for mobile
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { clearToken } from "../utils/auth.js";

export default function GlobalNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // Don't show nav on home page
  if (location.pathname === "/") {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      clearToken();
      setMobileMenuOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const navItems = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/powerfeed", label: "Feed", icon: "📱" },
    { path: "/powergram", label: "Gram", icon: "📸" },
    { path: "/music", label: "Music", icon: "🎵" },
    { path: "/powerreel", label: "Reel", icon: "🎬" },
    { path: "/powerline", label: "Line", icon: "💬" },
    { path: "/tvguide", label: "TV Guide", icon: "📺" },
    { path: "/powerstream-tv", label: "PS TV", icon: "🎥" },
    { path: "/studio/hub", label: "Studio", icon: "🎛️" },
    { path: "/school-network", label: "Schools", icon: "🏫" },
    { path: "/church-network", label: "Churches", icon: "⛪" },
    { path: "/network/no-limit-forever", label: "No Limit Forever", icon: "🔥" },
  ];

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    : user?.email?.[0]?.toUpperCase() || "G";

  return (
    <>
      <nav className="ps-global-nav">
        <div className="ps-nav-container">
          {/* Left: Logo */}
          <Link to="/" className="ps-nav-logo">
            <img
              src="/logos/powerstream-logo.png"
              alt="PowerStream"
              style={{ height: "32px", width: "auto" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <span className="ps-nav-logo-text">PowerStream</span>
          </Link>

          {/* Center: Navigation Links (Desktop) */}
          <div className="ps-nav-links desktop-nav-links">
            {navItems.slice(0, 8).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`ps-nav-link ${
                  location.pathname === item.path ? "ps-nav-link--active" : ""
                }`}
              >
                <span>{item.icon}</span>
                <span className="ps-nav-link-text">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right: Search + User Menu + Hamburger */}
          <div className="ps-nav-right">
            {/* Search (desktop only) */}
            <div className="ps-nav-search desktop-only">
              <input
                type="text"
                placeholder="Search..."
                className="ps-nav-search-input"
              />
            </div>

            {/* User Avatar */}
            <div className="ps-nav-user">
              <div className="ps-nav-avatar">{userInitials}</div>
            </div>

            {/* Hamburger Menu Button (mobile only) */}
            <button
              className="hamburger-menu mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className={`hamburger-line ${mobileMenuOpen ? "open" : ""}`}></span>
              <span className={`hamburger-line ${mobileMenuOpen ? "open" : ""}`}></span>
              <span className={`hamburger-line ${mobileMenuOpen ? "open" : ""}`}></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav-menu ${mobileMenuOpen ? "open" : ""}`}>
        {/* Search in mobile menu */}
        <div className="mobile-nav-search">
          <input
            type="text"
            placeholder="Search PowerStream..."
            className="mobile-nav-search-input"
          />
        </div>

        {/* Navigation Links */}
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`mobile-nav-link ${
              location.pathname === item.path ? "mobile-nav-link--active" : ""
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        ))}

        {/* User section */}
        <div className="mobile-nav-user">
          {user ? (
            <>
              <div className="mobile-nav-user-info">
                <div className="mobile-nav-avatar">{userInitials}</div>
                <div className="mobile-nav-user-name">{user.name || user.email}</div>
              </div>
              <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <span className="mobile-nav-icon">👤</span>
                <span className="mobile-nav-label">Profile</span>
              </Link>
              <Link to="/settings" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <span className="mobile-nav-icon">⚙️</span>
                <span className="mobile-nav-label">Settings</span>
              </Link>
              <button onClick={handleSignOut} className="mobile-nav-signout">
                🚪 Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="mobile-nav-link mobile-nav-login" onClick={() => setMobileMenuOpen(false)}>
              <span className="mobile-nav-icon">🔐</span>
              <span className="mobile-nav-label">Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-nav-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <style>{`
        /* Hamburger Animation */
        .hamburger-menu {
          display: none;
        }
        
        .hamburger-line {
          display: block;
          width: 24px;
          height: 2px;
          background: #fff;
          border-radius: 2px;
          transition: all 0.3s ease;
        }
        
        .hamburger-line.open:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        .hamburger-line.open:nth-child(2) {
          opacity: 0;
        }
        .hamburger-line.open:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        /* Mobile Menu */
        .mobile-nav-menu {
          position: fixed;
          top: 54px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 10, 15, 0.98);
          padding: 16px;
          padding-bottom: calc(16px + env(safe-area-inset-bottom));
          z-index: 999;
          display: none;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .mobile-nav-menu.open {
          display: flex;
        }

        .mobile-nav-search {
          margin-bottom: 16px;
        }

        .mobile-nav-search-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #fff;
          font-size: 16px;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          color: #fff;
          text-decoration: none;
          font-size: 1rem;
          border-radius: 12px;
          transition: background 0.2s;
        }

        .mobile-nav-link:hover,
        .mobile-nav-link:active,
        .mobile-nav-link--active {
          background: rgba(255, 184, 77, 0.15);
        }

        .mobile-nav-link--active {
          color: #ffb84d;
        }

        .mobile-nav-icon {
          font-size: 1.2rem;
          width: 28px;
          text-align: center;
        }

        .mobile-nav-user {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .mobile-nav-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          margin-bottom: 8px;
        }

        .mobile-nav-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffb84d, #e6a000);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #000;
        }

        .mobile-nav-user-name {
          color: #fff;
          font-weight: 500;
        }

        .mobile-nav-signout {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255, 77, 77, 0.1);
          border: 1px solid rgba(255, 77, 77, 0.3);
          border-radius: 12px;
          color: #ff6b6b;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 8px;
          text-align: left;
        }

        .mobile-nav-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 998;
        }

        @media (max-width: 768px) {
          .hamburger-menu {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            width: 28px;
            height: 24px;
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 0;
            margin-left: 12px;
          }

          .desktop-nav-links,
          .desktop-only {
            display: none !important;
          }

          .ps-nav-logo-text {
            display: none;
          }
        }

        @media (min-width: 769px) {
          .mobile-menu-toggle,
          .mobile-nav-menu,
          .mobile-nav-overlay {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

