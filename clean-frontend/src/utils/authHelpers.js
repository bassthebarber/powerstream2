// frontend/src/utils/authHelpers.js
// PowerStream Authentication Helpers
// SUPER UPGRADE PACK - Robust auth with retry logic

const TOKEN_KEY = "powerstream_token";
const REFRESH_TOKEN_KEY = "powerstream_refresh_token";
const USER_KEY = "powerstream_user";

// ============================================
// TOKEN MANAGEMENT
// ============================================

/**
 * Get stored auth token
 */
export function getToken() {
  try {
    // Try localStorage first
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) return token;
    
    // Fallback to sessionStorage
    return sessionStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.warn("[Auth] Error reading token:", e);
    return null;
  }
}

/**
 * Store auth token
 */
export function setToken(token, remember = true) {
  try {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  } catch (e) {
    console.warn("[Auth] Error storing token:", e);
  }
}

/**
 * Get refresh token
 */
export function getRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || 
           sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

/**
 * Store refresh token
 */
export function setRefreshToken(token, remember = true) {
  try {
    if (remember) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  } catch (e) {
    console.warn("[Auth] Error storing refresh token:", e);
  }
}

/**
 * Clear all auth data
 */
export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch (e) {
    console.warn("[Auth] Error clearing tokens:", e);
  }
}

/**
 * Get stored user data
 */
export function getStoredUser() {
  try {
    const data = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Store user data
 */
export function setStoredUser(user, remember = true) {
  try {
    const data = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(USER_KEY, data);
    } else {
      sessionStorage.setItem(USER_KEY, data);
    }
  } catch (e) {
    console.warn("[Auth] Error storing user:", e);
  }
}

// ============================================
// LOGIN WITH RETRY
// ============================================

/**
 * Login with automatic retry on network failure
 * @param {string} email 
 * @param {string} password 
 * @param {object} options - { maxRetries, retryDelay, remember }
 */
export async function loginWithRetry(email, password, options = {}) {
  const {
    maxRetries = 2,
    retryDelay = 1000,
    remember = true,
    apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001",
  } = options;

  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      console.log(`[Auth] Login attempt ${attempt}/${maxRetries + 1}`);
      
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Don't retry on auth errors (wrong password, etc.)
        if (response.status === 401 || response.status === 400) {
          return {
            ok: false,
            error: data.message || data.error || "Invalid credentials",
            status: response.status,
          };
        }
        throw new Error(data.message || data.error || `HTTP ${response.status}`);
      }

      // Store tokens
      if (data.token || data.accessToken) {
        setToken(data.token || data.accessToken, remember);
      }
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken, remember);
      }
      if (data.user) {
        setStoredUser(data.user, remember);
      }

      return {
        ok: true,
        user: data.user,
        token: data.token || data.accessToken,
      };

    } catch (error) {
      lastError = error;
      console.warn(`[Auth] Login attempt ${attempt} failed:`, error.message);

      // Check if it's a network error (worth retrying)
      const isNetworkError = 
        error.name === "TypeError" ||
        error.message.includes("fetch") ||
        error.message.includes("network") ||
        error.message.includes("Failed to fetch");

      if (isNetworkError && attempt <= maxRetries) {
        console.log(`[Auth] Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      break;
    }
  }

  return {
    ok: false,
    error: lastError?.message || "Login failed after multiple attempts",
    isNetworkError: true,
  };
}

// ============================================
// REFRESH TOKEN
// ============================================

/**
 * Refresh the auth token using refresh token
 */
export async function refreshAuthToken(options = {}) {
  const {
    apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001",
  } = options;

  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return { ok: false, error: "No refresh token" };
  }

  try {
    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Clear tokens if refresh failed
      if (response.status === 401) {
        clearToken();
      }
      return { ok: false, error: data.message || "Token refresh failed" };
    }

    // Store new tokens
    if (data.token || data.accessToken) {
      setToken(data.token || data.accessToken);
    }
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
    }
    if (data.user) {
      setStoredUser(data.user);
    }

    return {
      ok: true,
      token: data.token || data.accessToken,
      user: data.user,
    };

  } catch (error) {
    console.error("[Auth] Token refresh error:", error);
    return { ok: false, error: error.message };
  }
}

// ============================================
// AUTO RE-AUTH
// ============================================

/**
 * Attempt to restore session from stored tokens
 */
export async function tryAutoAuth(options = {}) {
  const {
    apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001",
  } = options;

  // Check for existing token
  const token = getToken();
  
  if (token) {
    try {
      // Verify token is still valid
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setStoredUser(data.user);
          return { ok: true, user: data.user };
        }
      }
    } catch (e) {
      console.warn("[Auth] Token validation failed:", e.message);
    }
  }

  // Try refresh token
  const refreshResult = await refreshAuthToken(options);
  if (refreshResult.ok) {
    return refreshResult;
  }

  // No valid session
  return { ok: false, error: "No valid session" };
}

// ============================================
// LOGOUT
// ============================================

/**
 * Logout and clear all auth data
 */
export async function logout(options = {}) {
  const {
    apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001",
  } = options;

  const token = getToken();

  // Call logout endpoint
  if (token) {
    try {
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
    } catch (e) {
      // Ignore logout API errors
    }
  }

  // Clear local data
  clearToken();

  return { ok: true };
}

// ============================================
// DOUBLE SUBMIT PREVENTION
// ============================================

let loginInProgress = false;

/**
 * Prevent double submission on login
 */
export function isLoginInProgress() {
  return loginInProgress;
}

export function setLoginInProgress(value) {
  loginInProgress = value;
}

/**
 * Safe login wrapper that prevents double submission
 */
export async function safeLogin(email, password, options = {}) {
  if (loginInProgress) {
    return { ok: false, error: "Login already in progress" };
  }

  setLoginInProgress(true);
  
  try {
    const result = await loginWithRetry(email, password, options);
    return result;
  } finally {
    setLoginInProgress(false);
  }
}

export default {
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  clearToken,
  getStoredUser,
  setStoredUser,
  loginWithRetry,
  refreshAuthToken,
  tryAutoAuth,
  logout,
  isLoginInProgress,
  setLoginInProgress,
  safeLogin,
};










