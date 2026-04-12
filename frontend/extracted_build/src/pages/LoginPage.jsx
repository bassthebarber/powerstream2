import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/mobile-responsive.css";

/**
 * LoginPage - PowerStream authentication login page
 * SUPER UPGRADE PACK:
 * - Double-submit prevention
 * - Retry on network failure (max 2 tries)
 * - Clear error messages
 * - Mobile Safari optimized
 * - iOS form zoom prevention
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Double-submit prevention ref
  const isSubmittingRef = useRef(false);

  // Redirect destination after login (default to /powerfeed)
  const from = location.state?.from?.pathname || "/powerfeed";

  // Reset retry count when form changes
  useEffect(() => {
    setRetryCount(0);
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // DOUBLE SUBMIT PREVENTION
    if (isSubmittingRef.current || loading) {
      console.log("[Login] Prevented double submission");
      return;
    }
    
    isSubmittingRef.current = true;
    setError("");
    setLoading(true);

    const maxRetries = 2;
    let currentTry = 0;
    let lastError = null;

    while (currentTry <= maxRetries) {
      try {
        currentTry++;
        setRetryCount(currentTry > 1 ? currentTry : 0);
        
        if (currentTry > 1) {
          console.log(`[Login] Retry attempt ${currentTry - 1}/${maxRetries}`);
          // Wait before retry
          await new Promise(r => setTimeout(r, 1000));
        }

        await signIn(email, password);
        
        // SUCCESS - Redirect to previous page or feed
        isSubmittingRef.current = false;
        navigate(from, { replace: true });
        return;
        
      } catch (err) {
        console.error(`Login attempt ${currentTry} failed:`, err);
        lastError = err;
        
        // Don't retry on auth errors (wrong password)
        if (err.response?.status === 401 || err.response?.status === 400) {
          break;
        }
        
        // Check if it's a network error worth retrying
        const isNetworkError = 
          err.isNetworkError || 
          err.code === "ERR_NETWORK" || 
          err.message === "Network Error" ||
          err.message?.includes("fetch") ||
          err.message?.includes("network");
        
        if (!isNetworkError || currentTry > maxRetries) {
          break;
        }
      }
    }

    // Handle final error
    let message;
    const err = lastError;
    
    if (err.isNetworkError || err.code === "ERR_NETWORK" || err.message === "Network Error") {
      message = currentTry > maxRetries 
        ? `Unable to connect after ${maxRetries} attempts. Please check your connection.`
        : "Unable to connect to PowerStream. Please ensure the server is running.";
    } else if (err.response?.status === 401) {
      message = err.response?.data?.message || "Invalid email or password.";
    } else if (err.response?.status === 400) {
      message = err.response?.data?.message || "Please check your email and password.";
    } else if (err.response?.status >= 500) {
      message = "Server error. Please try again in a moment.";
    } else {
      message = err.response?.data?.message || err.message || "Login failed. Please check your credentials.";
    }
    
    setError(message);
    setLoading(false);
    isSubmittingRef.current = false;
    setRetryCount(0);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* PowerStream Logo */}
        <div style={styles.logoContainer}>
          <img
            src="/logos/powerstream-logo.png"
            alt="PowerStream"
            style={styles.logo}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        {/* Title */}
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to continue to PowerStream</p>

        {/* Error Message */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={styles.input}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer Links */}
        <div style={styles.footer}>
          <span>Don't have an account?</span>
          <Link to="/register" style={styles.link}>
            Sign Up
          </Link>
        </div>

        {/* Forgot Password Link */}
        <div style={styles.forgotPassword}>
          <Link to="/forgot-password" style={styles.linkMuted}>
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    padding: "40px 32px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
  },
  logoContainer: {
    textAlign: "center",
    marginBottom: "24px",
  },
  logo: {
    width: "80px",
    height: "80px",
    objectFit: "contain",
    animation: "spin 8s linear infinite",
  },
  title: {
    fontSize: "28px",
    fontWeight: "900",
    background: "linear-gradient(90deg, #ffb84d, #ffda5c)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textAlign: "center",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#888",
    textAlign: "center",
    marginBottom: "24px",
    fontSize: "14px",
  },
  error: {
    background: "rgba(255, 0, 0, 0.1)",
    border: "1px solid rgba(255, 0, 0, 0.3)",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "16px",
    color: "#ff6b6b",
    fontSize: "14px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "13px",
    color: "#fff",
    fontWeight: "600",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    background: "rgba(255, 255, 255, 0.04)",
    color: "#fff",
    fontSize: "16px", // Prevents iOS zoom on focus
    outline: "none",
    transition: "border-color 0.2s ease",
    WebkitAppearance: "none", // iOS reset
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #ffb84d, #e6a000)",
    color: "#000",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "8px",
    transition: "all 0.2s ease",
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
    color: "#888",
    fontSize: "14px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
  },
  link: {
    color: "#ffb84d",
    textDecoration: "none",
    fontWeight: "600",
  },
  forgotPassword: {
    marginTop: "12px",
    textAlign: "center",
  },
  linkMuted: {
    color: "#666",
    textDecoration: "none",
    fontSize: "13px",
  },
};
