import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * ProtectedRoute - Guards routes requiring authentication
 * SUPER UPGRADE PACK:
 * - Auto-reauth when refresh token exists
 * - Graceful loading states
 * - Prevents 401 after page reload
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const { user, loading, tryAutoLogin } = useAuth();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryComplete, setRetryComplete] = useState(false);

  // Try auto-login if we have stored tokens but no user
  useEffect(() => {
    const attemptAutoLogin = async () => {
      // Check for stored token
      const storedToken = localStorage.getItem("powerstream_token") || 
                          sessionStorage.getItem("powerstream_token");
      
      if (!user && !loading && storedToken && !retryComplete && tryAutoLogin) {
        setIsRetrying(true);
        try {
          await tryAutoLogin();
        } catch (err) {
          console.warn("[ProtectedRoute] Auto-login failed:", err);
        } finally {
          setIsRetrying(false);
          setRetryComplete(true);
        }
      } else if (!loading) {
        setRetryComplete(true);
      }
    };

    attemptAutoLogin();
  }, [user, loading, tryAutoLogin, retryComplete]);

  // Show loading state while checking auth or retrying
  if (loading || isRetrying || (!retryComplete && !user)) {
    return (
      <div 
        className="ps-page" 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          minHeight: "100vh",
          background: "#0a0a0f",
        }}
      >
        <div style={{ textAlign: "center", color: "#e6b800" }}>
          <div style={{ 
            fontSize: "36px", 
            marginBottom: "16px",
            animation: "pulse 1.5s infinite",
          }}>⚡</div>
          <div style={{ color: "#888" }}>
            {isRetrying ? "Restoring session..." : "Loading..."}
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(0.95); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated after retry complete
  if (!user && retryComplete) {
    // Clear any stale tokens
    localStorage.removeItem("powerstream_token");
    sessionStorage.removeItem("powerstream_token");
    
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Check admin requirement if specified
  if (requireAdmin && !user?.isAdmin && user?.role !== "admin") {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location, error: "Admin access required" }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
