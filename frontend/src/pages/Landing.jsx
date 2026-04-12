import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth.js";

// PowerStream brand colors
const COLORS = {
  gold: "#ffb84d",
  goldLight: "#ffda5c",
  goldDark: "#cc9340",
  black: "#000000",
  blackLight: "#0a0a0a",
  blackCard: "#111111",
};

// Platform modules for feature showcase
const MODULES = [
  {
    name: "PowerFeed",
    icon: "/logos/powerfeedlogo.png",
    description: "Discover trending content from creators worldwide",
    path: "/powerfeed",
    gradient: "linear-gradient(135deg, #ff6b35, #f7931e)",
  },
  {
    name: "PowerGram",
    icon: "/logos/powergramlogo.png",
    description: "Share moments with your community",
    path: "/powergram",
    gradient: "linear-gradient(135deg, #667eea, #764ba2)",
  },
  {
    name: "PowerReel",
    icon: "/logos/powerreellogo.png",
    description: "Short-form vertical video entertainment",
    path: "/powerreel",
    gradient: "linear-gradient(135deg, #f093fb, #f5576c)",
  },
  {
    name: "PowerLine",
    icon: "/logos/powerlinelogo.png",
    description: "Real-time messaging and voice chat",
    path: "/powerline",
    gradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
  },
  {
    name: "TV Stations",
    icon: "/logos/worldwidetvlogo.png",
    description: "24/7 live TV channels from around the globe",
    path: "/tv-stations",
    gradient: "linear-gradient(135deg, #43e97b, #38f9d7)",
  },
  {
    name: "AI Studio",
    icon: "/logos/powerstream-logo.png",
    description: "Create professional music with AI assistance",
    path: "/studio",
    gradient: "linear-gradient(135deg, #fa709a, #fee140)",
  },
];

// Platform stats
const STATS = [
  { value: "10M+", label: "Active Users" },
  { value: "500K+", label: "Creators" },
  { value: "1B+", label: "Streams Daily" },
  { value: "150+", label: "Countries" },
];

const Landing = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll("[data-animate]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn()) {
      navigate("/powerfeed");
    } else {
      navigate("/register");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleModuleClick = (path) => {
    if (isLoggedIn()) {
      navigate(path);
    } else {
      navigate("/login", { state: { from: { pathname: path } } });
    }
  };

  // Inject keyframes
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      @keyframes ps-landing-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes ps-landing-pulse {
        0%, 100% { opacity: 0.4; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
      }
      @keyframes ps-landing-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
      @keyframes ps-landing-glow {
        0%, 100% { box-shadow: 0 0 30px rgba(255, 184, 77, 0.3); }
        50% { box-shadow: 0 0 60px rgba(255, 184, 77, 0.6); }
      }
      @keyframes ps-landing-slide-up {
        from { opacity: 0; transform: translateY(40px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes ps-landing-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes ps-gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.black,
        color: "#fff",
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "0 24px",
        }}
      >
        {/* Animated background gradients */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            zIndex: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "10%",
              width: "500px",
              height: "500px",
              background: `radial-gradient(circle, ${COLORS.gold}20 0%, transparent 70%)`,
              borderRadius: "50%",
              animation: "ps-landing-pulse 8s ease-in-out infinite",
              transform: `translateY(${scrollY * 0.2}px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "20%",
              right: "5%",
              width: "400px",
              height: "400px",
              background: `radial-gradient(circle, ${COLORS.goldLight}15 0%, transparent 70%)`,
              borderRadius: "50%",
              animation: "ps-landing-pulse 6s ease-in-out infinite 2s",
              transform: `translateY(${scrollY * -0.15}px)`,
            }}
          />
        </div>

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: "900px",
          }}
        >
          {/* Floating logo */}
          <div
            style={{
              marginBottom: "32px",
              animation: "ps-landing-float 6s ease-in-out infinite",
            }}
          >
            <img
              src="/logos/powerstream-logo.png"
              alt="PowerStream"
              style={{
                width: "180px",
                height: "180px",
                objectFit: "contain",
                animation: "ps-landing-spin 20s linear infinite, ps-landing-glow 4s ease-in-out infinite",
                borderRadius: "50%",
              }}
            />
          </div>

          {/* Main headline */}
          <h1
            style={{
              fontSize: "clamp(42px, 8vw, 80px)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "24px",
              background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldLight} 50%, ${COLORS.gold} 100%)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "ps-gradient-shift 4s ease infinite",
              textShadow: `0 0 80px ${COLORS.gold}40`,
            }}
          >
            PowerStream
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontSize: "clamp(18px, 3vw, 26px)",
              color: COLORS.goldLight,
              marginBottom: "48px",
              maxWidth: "700px",
              margin: "0 auto 48px",
              opacity: 0.9,
              lineHeight: 1.5,
            }}
          >
            The Ultimate Entertainment Platform.
            <br />
            <span style={{ opacity: 0.7, fontSize: "0.9em" }}>
              Stream • Create • Connect • Thrive
            </span>
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleGetStarted}
              style={{
                padding: "18px 48px",
                fontSize: "18px",
                fontWeight: 700,
                background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
                color: COLORS.black,
                border: "none",
                borderRadius: "999px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: `0 4px 30px ${COLORS.gold}50`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                e.currentTarget.style.boxShadow = `0 8px 40px ${COLORS.gold}70`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = `0 4px 30px ${COLORS.gold}50`;
              }}
            >
              🚀 Get Started Free
            </button>

            <button
              onClick={handleLogin}
              style={{
                padding: "18px 48px",
                fontSize: "18px",
                fontWeight: 600,
                background: "transparent",
                color: COLORS.gold,
                border: `2px solid ${COLORS.gold}`,
                borderRadius: "999px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${COLORS.gold}15`;
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            color: COLORS.gold,
            opacity: 0.6,
            animation: "ps-landing-float 2s ease-in-out infinite",
          }}
        >
          <span style={{ fontSize: "14px", letterSpacing: "2px" }}>SCROLL</span>
          <div style={{ marginTop: "8px", fontSize: "24px" }}>↓</div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          STATS SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        id="stats"
        data-animate
        style={{
          padding: "80px 24px",
          background: COLORS.blackLight,
          borderTop: `1px solid ${COLORS.gold}20`,
          borderBottom: `1px solid ${COLORS.gold}20`,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            opacity: isVisible.stats ? 1 : 0,
            transform: isVisible.stats ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease-out",
          }}
        >
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              style={{
                textAlign: "center",
                padding: "24px",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(36px, 6vw, 56px)",
                  fontWeight: 900,
                  color: COLORS.gold,
                  marginBottom: "8px",
                  background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          MODULES SHOWCASE
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        id="modules"
        data-animate
        style={{
          padding: "100px 24px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "64px",
            opacity: isVisible.modules ? 1 : 0,
            transform: isVisible.modules ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease-out",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 800,
              marginBottom: "16px",
              color: COLORS.gold,
            }}
          >
            One Platform, Endless Possibilities
          </h2>
          <p
            style={{
              fontSize: "18px",
              color: "#aaa",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Explore our suite of integrated entertainment modules designed for creators and viewers alike.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {MODULES.map((module, idx) => (
            <div
              key={module.name}
              onClick={() => handleModuleClick(module.path)}
              style={{
                background: COLORS.blackCard,
                borderRadius: "24px",
                padding: "32px",
                cursor: "pointer",
                border: `1px solid ${COLORS.gold}20`,
                transition: "all 0.4s ease",
                opacity: isVisible.modules ? 1 : 0,
                transform: isVisible.modules ? "translateY(0)" : "translateY(40px)",
                transitionDelay: `${idx * 100}ms`,
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                e.currentTarget.style.border = `1px solid ${COLORS.gold}60`;
                e.currentTarget.style.boxShadow = `0 20px 60px ${COLORS.gold}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.border = `1px solid ${COLORS.gold}20`;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Gradient accent bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: module.gradient,
                }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: module.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 8px 24px ${COLORS.gold}30`,
                  }}
                >
                  <img
                    src={module.icon}
                    alt={module.name}
                    style={{
                      width: "32px",
                      height: "32px",
                      objectFit: "contain",
                      filter: "brightness(10)",
                    }}
                  />
                </div>
                <h3
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  {module.name}
                </h3>
              </div>

              <p
                style={{
                  fontSize: "15px",
                  color: "#888",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {module.description}
              </p>

              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: COLORS.gold,
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                <span>Explore</span>
                <span style={{ transition: "transform 0.3s" }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURES SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        id="features"
        data-animate
        style={{
          padding: "100px 24px",
          background: `linear-gradient(180deg, ${COLORS.black} 0%, ${COLORS.blackLight} 50%, ${COLORS.black} 100%)`,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "64px",
              opacity: isVisible.features ? 1 : 0,
              transform: isVisible.features ? "translateY(0)" : "translateY(40px)",
              transition: "all 0.8s ease-out",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(32px, 5vw, 48px)",
                fontWeight: 800,
                marginBottom: "16px",
                color: COLORS.gold,
              }}
            >
              Why PowerStream?
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "32px",
            }}
          >
            {[
              {
                icon: "⚡",
                title: "Lightning Fast",
                desc: "Ultra-low latency streaming with global CDN distribution",
              },
              {
                icon: "🎨",
                title: "Creator Tools",
                desc: "Professional-grade tools for content creation and monetization",
              },
              {
                icon: "🔒",
                title: "Secure & Private",
                desc: "End-to-end encryption for messages and secure content delivery",
              },
              {
                icon: "🌍",
                title: "Global Community",
                desc: "Connect with millions of users from 150+ countries worldwide",
              },
              {
                icon: "💰",
                title: "Earn & Grow",
                desc: "Multiple monetization options including tips, subscriptions & ads",
              },
              {
                icon: "🤖",
                title: "AI-Powered",
                desc: "Smart recommendations and AI-assisted content creation tools",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                style={{
                  padding: "32px",
                  background: `${COLORS.blackCard}80`,
                  borderRadius: "20px",
                  border: `1px solid ${COLORS.gold}15`,
                  opacity: isVisible.features ? 1 : 0,
                  transform: isVisible.features ? "translateY(0)" : "translateY(40px)",
                  transition: "all 0.6s ease-out",
                  transitionDelay: `${idx * 100}ms`,
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                    marginBottom: "16px",
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: "12px",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: "15px",
                    color: "#888",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FINAL CTA SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        id="cta"
        data-animate
        style={{
          padding: "120px 24px",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            background: `radial-gradient(circle, ${COLORS.gold}15 0%, transparent 70%)`,
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "700px",
            margin: "0 auto",
            opacity: isVisible.cta ? 1 : 0,
            transform: isVisible.cta ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease-out",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(32px, 6vw, 52px)",
              fontWeight: 900,
              marginBottom: "24px",
              background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Ready to Stream?
          </h2>
          <p
            style={{
              fontSize: "18px",
              color: "#aaa",
              marginBottom: "40px",
              lineHeight: 1.6,
            }}
          >
            Join millions of creators and viewers on the most innovative entertainment platform.
            Your journey starts now.
          </p>

          <button
            onClick={handleGetStarted}
            style={{
              padding: "20px 64px",
              fontSize: "20px",
              fontWeight: 700,
              background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
              color: COLORS.black,
              border: "none",
              borderRadius: "999px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: `0 8px 40px ${COLORS.gold}50`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
              e.currentTarget.style.boxShadow = `0 12px 50px ${COLORS.gold}70`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = `0 8px 40px ${COLORS.gold}50`;
            }}
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <footer
        style={{
          padding: "60px 24px 40px",
          borderTop: `1px solid ${COLORS.gold}20`,
          background: COLORS.blackLight,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "32px",
          }}
        >
          {/* Logo */}
          <img
            src="/logos/powerstream-logo.png"
            alt="PowerStream"
            style={{
              width: "60px",
              height: "60px",
              objectFit: "contain",
              opacity: 0.8,
            }}
          />

          {/* Links */}
          <div
            style={{
              display: "flex",
              gap: "32px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {["About", "Terms", "Privacy", "Help", "Contact"].map((link) => (
              <a
                key={link}
                href={`/${link.toLowerCase()}`}
                style={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.gold)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p
            style={{
              color: "#444",
              fontSize: "13px",
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} PowerStream. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;




