// frontend/src/components/home/FeaturedRows.jsx
// PowerStream Featured Content Rows - Netflix-style horizontal scrolling
// Version: 7.0 - December 2025

import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../utils/auth.js";

// ============================================
// FEATURED CONTENT DATA
// ============================================
const FEATURED_SECTIONS = [
  {
    id: "social",
    title: "Social Hub",
    subtitle: "Connect with the community",
    items: [
      {
        id: "powerfeed",
        title: "PowerFeed",
        description: "Your social timeline",
        image: "/logos/powerfeedlogo.png",
        path: "/powerfeed",
        color: "#ffb84d",
      },
      {
        id: "powergram",
        title: "PowerGram",
        description: "Share photos & stories",
        image: "/logos/powergramlogo.png",
        path: "/powergram",
        color: "#ff6b9d",
      },
      {
        id: "powerreel",
        title: "PowerReel",
        description: "Short-form videos",
        image: "/logos/powerreellogo.png",
        path: "/powerreel",
        color: "#00d4ff",
      },
      {
        id: "powerline",
        title: "PowerLine",
        description: "Instant messaging",
        image: "/logos/powerlinelogo.png",
        path: "/powerline",
        color: "#9b59b6",
      },
    ],
  },
  {
    id: "tv",
    title: "TV & Entertainment",
    subtitle: "Watch live and on-demand",
    items: [
      {
        id: "southern-power",
        title: "Southern Power Network",
        description: "SPS flagship station",
        image: "/logos/southernpowernetworklogo.png",
        path: "/southern-power",
        color: "#f39c12",
      },
      {
        id: "ps-tv",
        title: "PowerStream TV",
        description: "Films & documentaries",
        image: "/logos/powerstream-logo.png",
        path: "/powerstream-tv",
        color: "#27ae60",
      },
      {
        id: "tv-stations",
        title: "TV Stations",
        description: "All live channels",
        image: "/logos/worldwidetvlogo.png",
        path: "/tv-stations",
        color: "#e74c3c",
      },
      {
        id: "nlf",
        title: "No Limit Forever TV",
        description: "Films & series",
        image: "/logos/powerstream-logo.png",
        path: "/network/no-limit-forever",
        color: "#c0392b",
      },
      {
        id: "tv-guide",
        title: "TV Guide",
        description: "What's on now",
        image: "/logos/powerstream-logo.png",
        path: "/tvguide",
        color: "#3498db",
      },
    ],
  },
  {
    id: "studio",
    title: "Create & Produce",
    subtitle: "Make music with AI",
    items: [
      {
        id: "studio-hub",
        title: "Studio Hub",
        description: "Your creative dashboard",
        image: "/logos/powerstream-logo.png",
        path: "/studio/hub",
        color: "#9b59b6",
      },
      {
        id: "ai-beats",
        title: "AI Beat Lab",
        description: "Generate beats with AI",
        image: "/logos/powerstream-logo.png",
        path: "/studio/ai-beat",
        color: "#e74c3c",
      },
      {
        id: "recording",
        title: "Recording Booth",
        description: "Record your vocals",
        image: "/logos/powerstream-logo.png",
        path: "/studio/record",
        color: "#27ae60",
      },
      {
        id: "mix-room",
        title: "Mix Room",
        description: "Mix your tracks",
        image: "/logos/powerstream-logo.png",
        path: "/studio/mix",
        color: "#3498db",
      },
      {
        id: "mastering",
        title: "Mastering Suite",
        description: "Master your music",
        image: "/logos/powerstream-logo.png",
        path: "/studio/master",
        color: "#f39c12",
      },
    ],
  },
  {
    id: "music",
    title: "Listen & Discover",
    subtitle: "Stream music",
    items: [
      {
        id: "music-library",
        title: "Music Library",
        description: "Browse all tracks",
        image: "/logos/powerstream-logo.png",
        path: "/music",
        color: "#1db954",
      },
      {
        id: "no-limit-audio",
        title: "No Limit Audio",
        description: "Houston's finest",
        image: "/logos/powerstream-logo.png",
        path: "/no-limit-audio",
        color: "#e74c3c",
      },
      {
        id: "upload-music",
        title: "Upload Music",
        description: "Share your tracks",
        image: "/logos/powerstream-logo.png",
        path: "/artist/upload",
        color: "#9b59b6",
      },
    ],
  },
  {
    id: "networks",
    title: "Community Networks",
    subtitle: "Connect with organizations",
    items: [
      {
        id: "schools",
        title: "School Network",
        description: "Educational content",
        image: "/logos/powerstream-logo.png",
        path: "/school-network",
        color: "#e67e22",
      },
      {
        id: "churches",
        title: "Church Network",
        description: "Faith-based content",
        image: "/logos/powerstream-logo.png",
        path: "/church-network",
        color: "#8e44ad",
      },
    ],
  },
];

// ============================================
// SCROLL ARROW BUTTON
// ============================================
const ScrollArrow = ({ direction, onClick, visible }) => {
  if (!visible) return null;

  const style = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [direction === "left" ? "left" : "right"]: "-20px",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "rgba(0, 0, 0, 0.8)",
    border: "1px solid rgba(255, 184, 77, 0.3)",
    color: "#ffb84d",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
  };

  return (
    <button
      style={style}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255, 184, 77, 0.2)";
        e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
        e.currentTarget.style.transform = "translateY(-50%) scale(1)";
      }}
      aria-label={`Scroll ${direction}`}
    >
      {direction === "left" ? "‹" : "›"}
    </button>
  );
};

// ============================================
// FEATURED CARD COMPONENT
// ============================================
const FeaturedCard = ({ item, onClick }) => {
  const cardStyle = {
    flexShrink: 0,
    width: "200px",
    height: "260px",
    borderRadius: "16px",
    background: `linear-gradient(145deg, ${item.color}22, rgba(0, 0, 0, 0.6))`,
    border: `1px solid ${item.color}44`,
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  };

  const imageContainerStyle = {
    height: "140px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `linear-gradient(180deg, ${item.color}33, transparent)`,
    padding: "20px",
  };

  const imageStyle = {
    width: "80px",
    height: "80px",
    objectFit: "contain",
    filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))",
  };

  const contentStyle = {
    padding: "16px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  };

  const titleStyle = {
    fontSize: "15px",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "4px",
    lineHeight: 1.2,
  };

  const descStyle = {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.6)",
    lineHeight: 1.3,
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
        e.currentTarget.style.boxShadow = `0 16px 32px ${item.color}33`;
        e.currentTarget.style.borderColor = item.color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = `${item.color}44`;
      }}
    >
      {/* Glow line at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`,
        }}
      />

      <div style={imageContainerStyle}>
        <img
          src={item.image}
          alt={item.title}
          style={imageStyle}
          onError={(e) => {
            e.target.src = "/logos/powerstream-logo.png";
          }}
        />
      </div>

      <div style={contentStyle}>
        <div style={titleStyle}>{item.title}</div>
        <div style={descStyle}>{item.description}</div>
      </div>
    </div>
  );
};

// ============================================
// FEATURED ROW COMPONENT
// ============================================
const FeaturedRow = ({ section, onItemClick }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  React.useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", updateScrollButtons);
      return () => el.removeEventListener("scroll", updateScrollButtons);
    }
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 440;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const headerStyle = {
    marginBottom: "16px",
    paddingLeft: "4px",
  };

  const titleStyle = {
    fontSize: "22px",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "4px",
    background: "linear-gradient(90deg, #fff, #ffb84d)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  const subtitleStyle = {
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.5)",
  };

  const containerStyle = {
    position: "relative",
    marginBottom: "40px",
  };

  const scrollContainerStyle = {
    display: "flex",
    gap: "16px",
    overflowX: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    padding: "8px 4px 16px",
    WebkitOverflowScrolling: "touch",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>{section.title}</h2>
        {section.subtitle && <p style={subtitleStyle}>{section.subtitle}</p>}
      </div>

      <div style={{ position: "relative" }}>
        <ScrollArrow
          direction="left"
          onClick={() => scroll("left")}
          visible={canScrollLeft}
        />

        <div
          ref={scrollRef}
          style={scrollContainerStyle}
          className="featured-row-scroll"
        >
          {section.items.map((item) => (
            <FeaturedCard
              key={item.id}
              item={item}
              onClick={() => onItemClick(item.path)}
            />
          ))}
        </div>

        <ScrollArrow
          direction="right"
          onClick={() => scroll("right")}
          visible={canScrollRight}
        />
      </div>
    </div>
  );
};

// ============================================
// MAIN FEATURED ROWS COMPONENT
// ============================================
const FeaturedRows = ({
  sections = FEATURED_SECTIONS,
  onItemClick,
  className = "",
}) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (onItemClick) {
      onItemClick(path);
      return;
    }

    if (isLoggedIn()) {
      navigate(path);
    } else {
      navigate("/login", { state: { from: { pathname: path } } });
    }
  };

  const containerStyle = {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "24px 16px",
  };

  return (
    <>
      <div style={containerStyle} className={`featured-rows ${className}`}>
        {sections.map((section) => (
          <FeaturedRow
            key={section.id}
            section={section}
            onItemClick={handleNavigate}
          />
        ))}
      </div>

      <style>{`
        .featured-row-scroll::-webkit-scrollbar {
          display: none;
        }

        .featured-row-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .featured-rows {
            padding: 16px 8px !important;
          }

          .featured-row-scroll {
            gap: 12px !important;
            padding: 4px 2px 12px !important;
          }
        }

        @media (max-width: 480px) {
          .featured-rows h2 {
            font-size: 18px !important;
          }
        }
      `}</style>
    </>
  );
};

// ============================================
// SINGLE ROW EXPORT - For individual use
// ============================================
export const SingleFeaturedRow = ({ 
  title, 
  subtitle, 
  items, 
  onItemClick 
}) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (onItemClick) {
      onItemClick(path);
      return;
    }

    if (isLoggedIn()) {
      navigate(path);
    } else {
      navigate("/login", { state: { from: { pathname: path } } });
    }
  };

  const section = { id: "custom", title, subtitle, items };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 16px" }}>
      <FeaturedRow section={section} onItemClick={handleNavigate} />
      <style>{`
        .featured-row-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// ============================================
// HERO FEATURED ROW - Larger cards
// ============================================
export const HeroFeaturedRow = ({ items, onItemClick }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const handleNavigate = (path) => {
    if (onItemClick) {
      onItemClick(path);
      return;
    }

    if (isLoggedIn()) {
      navigate(path);
    } else {
      navigate("/login", { state: { from: { pathname: path } } });
    }
  };

  const defaultItems = FEATURED_SECTIONS[0].items.slice(0, 4);
  const displayItems = items || defaultItems;

  const containerStyle = {
    display: "flex",
    gap: "24px",
    overflowX: "auto",
    padding: "16px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  };

  const cardStyle = {
    flexShrink: 0,
    width: "280px",
    height: "180px",
    borderRadius: "20px",
    background: "linear-gradient(145deg, rgba(255, 184, 77, 0.15), rgba(0, 0, 0, 0.6))",
    border: "1px solid rgba(255, 184, 77, 0.3)",
    display: "flex",
    alignItems: "center",
    padding: "24px",
    gap: "20px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  return (
    <>
      <div ref={scrollRef} style={containerStyle} className="hero-row-scroll">
        {displayItems.map((item) => (
          <div
            key={item.id}
            style={{
              ...cardStyle,
              background: `linear-gradient(145deg, ${item.color}22, rgba(0, 0, 0, 0.6))`,
              borderColor: `${item.color}44`,
            }}
            onClick={() => handleNavigate(item.path)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
              e.currentTarget.style.boxShadow = `0 20px 40px ${item.color}33`;
              e.currentTarget.style.borderColor = item.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = `${item.color}44`;
            }}
          >
            <img
              src={item.image}
              alt={item.title}
              style={{
                width: "64px",
                height: "64px",
                objectFit: "contain",
                filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))",
              }}
              onError={(e) => {
                e.target.src = "/logos/powerstream-logo.png";
              }}
            />
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: "6px",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255, 255, 255, 0.6)",
                }}
              >
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .hero-row-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

// ============================================
// EXPORTS
// ============================================
export { FEATURED_SECTIONS };
export default FeaturedRows;




