// frontend/src/layout/MainLayout.jsx
// PowerStream Main Layout - Deployment Ready
// Version: 7.0 - December 2025

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { clearToken } from "../utils/auth.js";

// ============================================
// ROUTE TITLE MAPPING
// ============================================
const routeTitles = {
  "/": "Home",
  "/powerfeed": "PowerFeed",
  "/powergram": "PowerGram",
  "/powerreel": "PowerReel",
  "/powerline": "PowerLine",
  "/tv-stations": "TV Stations",
  "/tv-guide": "TV Guide",
  "/tvguide": "TV Guide",
  "/southern-power": "Southern Power Network",
  "/NoLimitEastHouston": "No Limit East Houston",
  "/civic-connect": "Civic Connect",
  "/texas-got-talent": "Texas Got Talent",
  "/world-tv": "World TV",
  "/powerstream-tv": "PowerStream TV",
  "/ps-tv": "PowerStream TV",
  "/studio": "AI Studio",
  "/studio/hub": "Studio Hub",
  "/studio/record": "Recording Studio",
  "/studio/beats": "Beat Studio",
  "/studio/mix": "Mix Room",
  "/studio/master": "Mastering Suite",
  "/powerharmony/master": "PowerHarmony Master",
  "/powerharmony/write": "Writing Room",
  "/powerharmony/live": "Live Booth",
  "/powerharmony/vocal": "Vocal Booth",
  "/powerharmony/mix": "Mix Room",
  "/powerharmony/mastering": "Mastering Suite",
  "/music": "Music Library",
  "/music-library": "Music Library",
  "/profile": "Profile",
  "/church-network": "Church Network",
  "/school-network": "School Network",
  "/network/no-limit-forever": "No Limit Forever TV",
};

const getTitleForPath = (pathname = "") => {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith("/tv-stations/")) return "Station Detail";
  if (pathname.startsWith("/stations/")) return "Station";
  if (pathname.startsWith("/tv/")) return "PowerStream TV";
  if (pathname.startsWith("/ps-tv")) return "PowerStream TV";
  if (pathname.startsWith("/powerstream-tv")) return "PowerStream TV";
  if (pathname.startsWith("/studio/")) return "Studio";
  if (pathname.startsWith("/powerharmony/")) return "PowerHarmony";
  if (pathname.startsWith("/church/")) return "Church Network";
  if (pathname.startsWith("/school/")) return "School Network";
  if (pathname.startsWith("/nlf/")) return "No Limit Forever";
  if (pathname.startsWith("/profile/")) return "Profile";
  return "PowerStream";
};

// ============================================
// NAVIGATION ITEMS
// ============================================
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

const dockItems = [
  { label: "Home", path: "/", icon: "🏠" },
  { label: "Feed", path: "/powerfeed", icon: "📰" },
  { label: "Gram", path: "/powergram", icon: "📸" },
  { label: "Reel", path: "/powerreel", icon: "🎬" },
  { label: "Line", path: "/powerline", icon: "💬" },
  { label: "Menu", path: "/feed/menu", icon: "☰" },
  { label: "Profile", path: "/profile", icon: "👤" },
];

// ============================================
// MAIN LAYOUT COMPONENT
// ============================================
export default function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut, refreshUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBuyCoins, setShowBuyCoins] = useState(false);

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
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [user, loading, navigate, location]);

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

  // Loading state
  if (loading) {
    return (
      <div className="ps-layout-loading">
        <div className="ps-loading-spinner">⚡</div>
        <p>Loading PowerStream...</p>
      </div>
    );
  }

  // Not authenticated - show minimal loading (redirect will happen)
  if (!user) {
    return (
      <div className="ps-layout-loading">
        <div className="ps-loading-spinner">⚡</div>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const title = getTitleForPath(location.pathname);
  const currentPath = location.pathname;

  // User initials for avatar
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="ps-main-layout">
      {/* ========== TOP NAVIGATION ========== */}
      <nav className="ps-top-nav">
        <div className="ps-nav-container">
          {/* Logo */}
          <Link to="/" className="ps-nav-logo">
            <img
              src="/logos/powerstream-logo.png"
              alt="PowerStream"
              className="ps-logo-img"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <span className="ps-logo-text">PowerStream</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="ps-nav-links">
            {navItems.slice(0, 8).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`ps-nav-link ${
                  currentPath === item.path ? "ps-nav-link--active" : ""
                }`}
              >
                <span className="ps-nav-icon">{item.icon}</span>
                <span className="ps-nav-label">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="ps-nav-right">
            {/* Search */}
            <div className="ps-nav-search">
              <input
                type="text"
                placeholder="Search..."
                className="ps-search-input"
              />
            </div>

            {/* Coin Balance */}
            <button
              className="ps-coin-balance"
              onClick={() => setShowBuyCoins(true)}
            >
              <span className="ps-coin-icon">🪙</span>
              <span className="ps-coin-amount">
                {typeof user?.coinBalance === "number"
                  ? user.coinBalance.toLocaleString()
                  : "0"}
              </span>
            </button>

            {/* User Avatar */}
            <Link to="/profile" className="ps-nav-avatar">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} />
              ) : (
                <span>{userInitials}</span>
              )}
            </Link>

            {/* Hamburger Menu (Mobile) */}
            <button
              className="ps-hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className={`ps-hamburger-line ${mobileMenuOpen ? "open" : ""}`} />
              <span className={`ps-hamburger-line ${mobileMenuOpen ? "open" : ""}`} />
              <span className={`ps-hamburger-line ${mobileMenuOpen ? "open" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* ========== MOBILE NAVIGATION MENU ========== */}
      <div className={`ps-mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        {/* Mobile Search */}
        <div className="ps-mobile-search">
          <input type="text" placeholder="Search PowerStream..." />
        </div>

        {/* Mobile Nav Links */}
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`ps-mobile-link ${
              currentPath === item.path ? "ps-mobile-link--active" : ""
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="ps-mobile-icon">{item.icon}</span>
            <span className="ps-mobile-label">{item.label}</span>
          </Link>
        ))}

        {/* Mobile User Section */}
        <div className="ps-mobile-user">
          <div className="ps-mobile-user-info">
            <div className="ps-mobile-avatar">{userInitials}</div>
            <div className="ps-mobile-name">{user?.name || user?.email}</div>
          </div>
          <Link
            to="/profile"
            className="ps-mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="ps-mobile-icon">👤</span>
            <span className="ps-mobile-label">Profile</span>
          </Link>
          <Link
            to="/feed/settings"
            className="ps-mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="ps-mobile-icon">⚙️</span>
            <span className="ps-mobile-label">Settings</span>
          </Link>
          <button onClick={handleSignOut} className="ps-mobile-signout">
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="ps-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ========== PAGE HEADER ========== */}
      <header className="ps-page-header">
        <div className="ps-header-content">
          <div
            className="ps-header-brand"
            onClick={() => navigate("/powerfeed")}
          >
            <img
              src="/logos/powerstream-logo.png"
              alt="PowerStream"
              className="ps-header-logo"
            />
            <div className="ps-header-titles">
              <div className="ps-header-brand-name">PowerStream</div>
              <div className="ps-header-page-title">{title}</div>
            </div>
          </div>

          <div className="ps-header-user">
            {/* Coin Balance */}
            <button
              className="ps-header-coins"
              onClick={() => setShowBuyCoins(true)}
            >
              <span>🪙</span>
              <span>
                {typeof user?.coinBalance === "number"
                  ? user.coinBalance.toLocaleString()
                  : "0"}
              </span>
            </button>

            {/* User Info */}
            <div
              className="ps-header-profile"
              onClick={() => navigate("/profile")}
            >
              <div className="ps-header-user-info">
                <div className="ps-header-user-name">
                  {user?.name || "Member"}
                </div>
                <div className="ps-header-user-email">{user?.email}</div>
              </div>
              <div className="ps-header-avatar">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} />
                ) : (
                  <span>{userInitials}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <main className="ps-main-content">
        {children || <Outlet />}
      </main>

      {/* ========== BOTTOM DOCK (Mobile) ========== */}
      <nav className="ps-bottom-dock">
        {dockItems.map((item) => {
          const isActive =
            currentPath === item.path ||
            (item.path !== "/" && currentPath.startsWith(item.path));

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`ps-dock-item ${isActive ? "ps-dock-item--active" : ""}`}
            >
              <span className="ps-dock-icon">{item.icon}</span>
              <span className="ps-dock-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ========== BUY COINS MODAL ========== */}
      {showBuyCoins && (
        <div className="ps-modal-overlay" onClick={() => setShowBuyCoins(false)}>
          <div className="ps-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ps-modal-header">
              <h2>Buy PowerCoins</h2>
              <button
                className="ps-modal-close"
                onClick={() => setShowBuyCoins(false)}
              >
                ✕
              </button>
            </div>
            <div className="ps-modal-body">
              <div className="ps-coin-packages">
                <button className="ps-coin-package">
                  <span className="ps-package-coins">🪙 100</span>
                  <span className="ps-package-price">$0.99</span>
                </button>
                <button className="ps-coin-package">
                  <span className="ps-package-coins">🪙 500</span>
                  <span className="ps-package-price">$4.99</span>
                </button>
                <button className="ps-coin-package ps-coin-package--popular">
                  <span className="ps-package-badge">Best Value</span>
                  <span className="ps-package-coins">🪙 1,000</span>
                  <span className="ps-package-price">$9.99</span>
                </button>
                <button className="ps-coin-package">
                  <span className="ps-package-coins">🪙 5,000</span>
                  <span className="ps-package-price">$39.99</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== STYLES ========== */}
      <style>{`
        /* ===== CSS VARIABLES ===== */
        :root {
          --ps-black: #000000;
          --ps-black-light: #111111;
          --ps-black-lighter: #1a1a1a;
          --ps-gold: #ffb84d;
          --ps-gold-dark: #e6a000;
          --ps-gold-light: #ffd280;
          --ps-text: #ffffff;
          --ps-text-muted: #888888;
          --ps-border: rgba(255, 184, 77, 0.2);
          --ps-border-light: rgba(255, 255, 255, 0.1);
        }

        /* ===== LAYOUT CONTAINER ===== */
        .ps-main-layout {
          min-height: 100vh;
          background: var(--ps-black);
          color: var(--ps-text);
        }

        /* ===== LOADING STATE ===== */
        .ps-layout-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--ps-black);
          color: var(--ps-gold);
        }

        .ps-loading-spinner {
          font-size: 3rem;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ===== TOP NAVIGATION ===== */
        .ps-top-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: linear-gradient(135deg, var(--ps-black-light), var(--ps-black));
          border-bottom: 1px solid var(--ps-border);
          backdrop-filter: blur(10px);
        }

        .ps-nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ps-nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--ps-gold);
        }

        .ps-logo-img {
          height: 32px;
          width: auto;
        }

        .ps-logo-text {
          font-weight: 700;
          font-size: 1.1rem;
        }

        .ps-nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ps-nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--ps-text);
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .ps-nav-link:hover {
          background: rgba(255, 184, 77, 0.1);
        }

        .ps-nav-link--active {
          color: var(--ps-gold);
          background: rgba(255, 184, 77, 0.15);
        }

        .ps-nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ps-nav-search {
          display: none;
        }

        .ps-search-input {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid var(--ps-border-light);
          border-radius: 20px;
          padding: 8px 16px;
          color: var(--ps-text);
          font-size: 0.9rem;
          width: 200px;
        }

        .ps-coin-balance {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255, 184, 77, 0.1);
          border: 1px solid rgba(255, 184, 77, 0.3);
          border-radius: 20px;
          cursor: pointer;
          color: var(--ps-gold);
          font-weight: 600;
        }

        .ps-nav-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--ps-gold), var(--ps-gold-dark));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #000;
          overflow: hidden;
        }

        .ps-nav-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* ===== HAMBURGER MENU ===== */
        .ps-hamburger {
          display: none;
          flex-direction: column;
          justify-content: space-around;
          width: 28px;
          height: 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .ps-hamburger-line {
          display: block;
          width: 24px;
          height: 2px;
          background: #fff;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .ps-hamburger-line.open:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .ps-hamburger-line.open:nth-child(2) {
          opacity: 0;
        }

        .ps-hamburger-line.open:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        /* ===== MOBILE MENU ===== */
        .ps-mobile-menu {
          position: fixed;
          top: 56px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 10, 15, 0.98);
          padding: 16px;
          z-index: 99;
          display: none;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }

        .ps-mobile-menu.open {
          display: flex;
        }

        .ps-mobile-search input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid var(--ps-border-light);
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font-size: 16px;
          margin-bottom: 16px;
        }

        .ps-mobile-link {
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

        .ps-mobile-link:hover,
        .ps-mobile-link--active {
          background: rgba(255, 184, 77, 0.15);
        }

        .ps-mobile-link--active {
          color: var(--ps-gold);
        }

        .ps-mobile-icon {
          font-size: 1.2rem;
          width: 28px;
          text-align: center;
        }

        .ps-mobile-user {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid var(--ps-border-light);
        }

        .ps-mobile-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          margin-bottom: 8px;
        }

        .ps-mobile-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--ps-gold), var(--ps-gold-dark));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #000;
        }

        .ps-mobile-signout {
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

        .ps-mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 98;
        }

        /* ===== PAGE HEADER ===== */
        .ps-page-header {
          position: sticky;
          top: 56px;
          z-index: 50;
          background: linear-gradient(135deg, var(--ps-black-light), var(--ps-black));
          border-bottom: 1px solid var(--ps-border);
          backdrop-filter: blur(6px);
          display: none;
        }

        .ps-header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ps-header-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .ps-header-logo {
          width: 44px;
          height: 44px;
          object-fit: contain;
        }

        .ps-header-brand-name {
          font-weight: 700;
          font-size: 1rem;
          color: var(--ps-gold);
        }

        .ps-header-page-title {
          font-size: 0.85rem;
          color: var(--ps-gold-light);
        }

        .ps-header-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ps-header-coins {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255, 184, 77, 0.1);
          border: 1px solid rgba(255, 184, 77, 0.3);
          border-radius: 20px;
          cursor: pointer;
          color: var(--ps-gold);
          font-weight: 700;
          font-size: 0.85rem;
        }

        .ps-header-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .ps-header-user-info {
          text-align: right;
          line-height: 1.2;
        }

        .ps-header-user-name {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .ps-header-user-email {
          font-size: 0.75rem;
          color: var(--ps-text-muted);
        }

        .ps-header-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid var(--ps-gold);
          box-shadow: 0 0 12px var(--ps-gold);
          background: linear-gradient(135deg, var(--ps-gold), var(--ps-gold-dark));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #000;
        }

        .ps-header-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* ===== MAIN CONTENT ===== */
        .ps-main-content {
          min-height: calc(100vh - 56px - 72px);
          padding: 24px;
          padding-bottom: 96px;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* ===== BOTTOM DOCK ===== */
        .ps-bottom-dock {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--ps-black);
          border-top: 1px solid var(--ps-border);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.45);
          padding: 8px 12px;
          padding-bottom: calc(8px + env(safe-area-inset-bottom));
          display: flex;
          justify-content: space-between;
          gap: 8px;
          z-index: 90;
          backdrop-filter: blur(6px);
        }

        .ps-dock-item {
          flex: 1;
          border: none;
          border-radius: 12px;
          padding: 10px 6px;
          background: rgba(255, 255, 255, 0.05);
          color: #ccc;
          font-size: 0.75rem;
          font-weight: 500;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ps-dock-item--active {
          background: rgba(255, 184, 77, 0.1);
          color: var(--ps-gold);
          font-weight: 700;
        }

        .ps-dock-icon {
          font-size: 1rem;
        }

        /* ===== MODAL ===== */
        .ps-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .ps-modal {
          background: var(--ps-black-light);
          border: 1px solid var(--ps-border);
          border-radius: 16px;
          width: 100%;
          max-width: 400px;
          overflow: hidden;
        }

        .ps-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--ps-border-light);
        }

        .ps-modal-header h2 {
          font-size: 1.2rem;
          color: var(--ps-gold);
        }

        .ps-modal-close {
          background: none;
          border: none;
          color: #fff;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 4px;
        }

        .ps-modal-body {
          padding: 20px;
        }

        .ps-coin-packages {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ps-coin-package {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--ps-border-light);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .ps-coin-package:hover {
          background: rgba(255, 184, 77, 0.1);
          border-color: var(--ps-gold);
        }

        .ps-coin-package--popular {
          border-color: var(--ps-gold);
          background: rgba(255, 184, 77, 0.1);
        }

        .ps-package-badge {
          position: absolute;
          top: -10px;
          right: 12px;
          background: var(--ps-gold);
          color: #000;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .ps-package-coins {
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
        }

        .ps-package-price {
          font-size: 1rem;
          font-weight: 700;
          color: var(--ps-gold);
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .ps-nav-links,
          .ps-nav-search {
            display: none;
          }

          .ps-hamburger {
            display: flex;
          }

          .ps-logo-text {
            display: none;
          }

          .ps-page-header {
            display: block;
          }

          .ps-main-content {
            padding: 16px;
            padding-bottom: 88px;
          }
        }

        @media (min-width: 769px) {
          .ps-nav-search {
            display: block;
          }

          .ps-bottom-dock {
            display: none;
          }

          .ps-mobile-menu,
          .ps-mobile-overlay {
            display: none !important;
          }
        }

        @media (min-width: 1024px) {
          .ps-nav-label {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}




