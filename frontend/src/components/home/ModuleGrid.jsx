// frontend/src/components/home/ModuleGrid.jsx
// PowerStream Module Navigation Grid - Reusable Home Component
// Version: 7.0 - December 2025

import React from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../utils/auth.js";

// ============================================
// MODULE CONFIGURATION
// ============================================
const MODULES = [
  {
    id: "powerfeed",
    label: "PowerFeed",
    icon: "/logos/powerfeedlogo.png",
    path: "/powerfeed",
    description: "Social feed & posts",
    color: "#ffb84d",
  },
  {
    id: "powergram",
    label: "PowerGram",
    icon: "/logos/powergramlogo.png",
    path: "/powergram",
    description: "Photo sharing",
    color: "#ff6b9d",
  },
  {
    id: "powerreel",
    label: "PowerReel",
    icon: "/logos/powerreellogo.png",
    path: "/powerreel",
    description: "Short videos",
    color: "#00d4ff",
  },
  {
    id: "powerline",
    label: "PowerLine",
    icon: "/logos/powerlinelogo.png",
    path: "/powerline",
    description: "Messaging",
    color: "#9b59b6",
  },
  {
    id: "tv-stations",
    label: "TV Stations",
    icon: "/logos/worldwidetvlogo.png",
    path: "/tv-stations",
    description: "Live TV channels",
    color: "#e74c3c",
  },
  {
    id: "southern-power",
    label: "Southern Power",
    icon: "/logos/southernpowernetworklogo.png",
    path: "/southern-power",
    description: "SPS Network",
    color: "#f39c12",
  },
  {
    id: "ps-tv",
    label: "PS TV",
    icon: "/logos/powerstream-logo.png",
    path: "/powerstream-tv",
    description: "Films & Shows",
    color: "#27ae60",
  },
  {
    id: "studio",
    label: "AI Studio",
    icon: "/logos/powerstream-logo.png",
    path: "/studio/hub",
    description: "Create music",
    color: "#3498db",
  },
  {
    id: "music",
    label: "Music",
    icon: "/logos/powerstream-logo.png",
    path: "/music",
    description: "Stream music",
    color: "#1db954",
  },
  {
    id: "schools",
    label: "Schools",
    icon: "/logos/powerstream-logo.png",
    path: "/school-network",
    description: "School network",
    color: "#e67e22",
  },
  {
    id: "churches",
    label: "Churches",
    icon: "/logos/powerstream-logo.png",
    path: "/church-network",
    description: "Church network",
    color: "#8e44ad",
  },
  {
    id: "nlf",
    label: "No Limit Forever",
    icon: "/logos/powerstream-logo.png",
    path: "/network/no-limit-forever",
    description: "NLF TV",
    color: "#c0392b",
  },
];

// ============================================
// MODULE TILE COMPONENT
// ============================================
const ModuleTile = ({ module, onClick, variant = "default" }) => {
  const handleHover = (e, isHover) => {
    if (isHover) {
      e.currentTarget.style.background = "rgba(255, 184, 77, 0.15)";
      e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
      e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 184, 77, 0.4)";
      e.currentTarget.style.borderColor = "#ffb84d";
    } else {
      e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
      e.currentTarget.style.transform = "translateY(0) scale(1)";
      e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.3)";
      e.currentTarget.style.borderColor = "rgba(255, 184, 77, 0.3)";
    }
  };

  const baseStyle = {
    display: "flex",
    flexDirection: variant === "compact" ? "row" : "column",
    alignItems: "center",
    justifyContent: "center",
    gap: variant === "compact" ? "10px" : "12px",
    padding: variant === "compact" ? "12px 16px" : "20px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(255, 184, 77, 0.3)",
    background: "rgba(255, 255, 255, 0.03)",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
    position: "relative",
    overflow: "hidden",
  };

  const iconStyle = {
    width: variant === "compact" ? "24px" : "40px",
    height: variant === "compact" ? "24px" : "40px",
    objectFit: "contain",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
  };

  const labelStyle = {
    fontSize: variant === "compact" ? "14px" : "15px",
    fontWeight: 700,
    color: "#fff",
    textAlign: "center",
    letterSpacing: "0.02em",
  };

  const descStyle = {
    fontSize: "11px",
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    display: variant === "compact" ? "none" : "block",
  };

  return (
    <button
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={(e) => handleHover(e, true)}
      onMouseLeave={(e) => handleHover(e, false)}
      aria-label={`Navigate to ${module.label}`}
    >
      {/* Glow Effect */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${module.color || "#ffb84d"}, transparent)`,
          opacity: 0.6,
        }}
      />

      <img
        src={module.icon}
        alt={module.label}
        style={iconStyle}
        onError={(e) => {
          e.target.src = "/logos/powerstream-logo.png";
        }}
      />

      <div>
        <div style={labelStyle}>{module.label}</div>
        {module.description && <div style={descStyle}>{module.description}</div>}
      </div>
    </button>
  );
};

// ============================================
// MAIN MODULE GRID COMPONENT
// ============================================
const ModuleGrid = ({
  modules = MODULES,
  columns = 4,
  variant = "default",
  showAll = false,
  maxItems = 8,
  onModuleClick,
  className = "",
}) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (onModuleClick) {
      onModuleClick(path);
      return;
    }

    if (isLoggedIn()) {
      navigate(path);
    } else {
      navigate("/login", { state: { from: { pathname: path } } });
    }
  };

  const displayModules = showAll ? modules : modules.slice(0, maxItems);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: variant === "compact" ? "12px" : "20px",
    width: "100%",
    maxWidth: "1200px",
    padding: "0 16px",
    boxSizing: "border-box",
  };

  return (
    <>
      <div style={gridStyle} className={`module-grid ${className}`}>
        {displayModules.map((module) => (
          <ModuleTile
            key={module.id}
            module={module}
            variant={variant}
            onClick={() => handleNavigate(module.path)}
          />
        ))}
      </div>

      {/* Responsive Styles */}
      <style>{`
        .module-grid {
          /* Default: 4 columns on desktop */
        }

        /* Tablet: 3 columns */
        @media (max-width: 900px) {
          .module-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 16px !important;
          }
        }

        /* Mobile: 2 columns */
        @media (max-width: 600px) {
          .module-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
            padding: 0 8px !important;
          }

          .module-grid button {
            padding: 14px 10px !important;
          }

          .module-grid button img {
            width: 32px !important;
            height: 32px !important;
          }
        }

        /* Small Mobile: 2 columns tighter */
        @media (max-width: 375px) {
          .module-grid {
            gap: 8px !important;
            padding: 0 4px !important;
          }

          .module-grid button {
            padding: 12px 8px !important;
            border-radius: 12px !important;
          }

          .module-grid button img {
            width: 28px !important;
            height: 28px !important;
          }
        }
      `}</style>
    </>
  );
};

// ============================================
// COMPACT VARIANT - Horizontal Pills
// ============================================
export const ModulePills = ({ modules = MODULES.slice(0, 6), onModuleClick }) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (onModuleClick) {
      onModuleClick(path);
      return;
    }

    if (isLoggedIn()) {
      navigate(path);
    } else {
      navigate("/login", { state: { from: { pathname: path } } });
    }
  };

  const containerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
    padding: "0 16px",
  };

  const pillStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "999px",
    border: "1px solid rgba(255, 184, 77, 0.4)",
    background: "rgba(255, 184, 77, 0.1)",
    color: "#ffb84d",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  };

  return (
    <div style={containerStyle}>
      {modules.map((module) => (
        <button
          key={module.id}
          style={pillStyle}
          onClick={() => handleNavigate(module.path)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 184, 77, 0.2)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 184, 77, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 184, 77, 0.1)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <img
            src={module.icon}
            alt=""
            style={{ width: "16px", height: "16px", objectFit: "contain" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          {module.label}
        </button>
      ))}
    </div>
  );
};

// ============================================
// FEATURED MODULE CARDS - Larger Hero Cards
// ============================================
export const FeaturedModules = ({ modules = MODULES.slice(0, 4) }) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (isLoggedIn()) {
      navigate(path);
    } else {
      navigate("/login", { state: { from: { pathname: path } } });
    }
  };

  const containerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    padding: "0 16px",
    maxWidth: "1200px",
    width: "100%",
  };

  const cardStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 24px",
    borderRadius: "20px",
    background: "linear-gradient(145deg, rgba(255, 184, 77, 0.1), rgba(0, 0, 0, 0.4))",
    border: "1px solid rgba(255, 184, 77, 0.2)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minHeight: "200px",
  };

  return (
    <div style={containerStyle}>
      {modules.map((module) => (
        <div
          key={module.id}
          style={cardStyle}
          onClick={() => handleNavigate(module.path)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 20px 40px rgba(255, 184, 77, 0.2)";
            e.currentTarget.style.borderColor = "rgba(255, 184, 77, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.borderColor = "rgba(255, 184, 77, 0.2)";
          }}
        >
          <img
            src={module.icon}
            alt={module.label}
            style={{
              width: "64px",
              height: "64px",
              objectFit: "contain",
              marginBottom: "16px",
              filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))",
            }}
            onError={(e) => {
              e.target.src = "/logos/powerstream-logo.png";
            }}
          />
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#fff",
              marginBottom: "8px",
              textAlign: "center",
            }}
          >
            {module.label}
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.6)",
              textAlign: "center",
            }}
          >
            {module.description}
          </p>
        </div>
      ))}
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================
export { MODULES };
export default ModuleGrid;




