# API Configuration - Development vs Production

## ✅ Configuration Complete

The frontend API client is now configured to:
- **Development**: Always use `http://localhost:5001/api` (forced, cannot be overridden)
- **Production**: Use `VITE_API_URL` env var or fallback to `https://studio-api.southernpowertvmusic.com/api`

## 📝 Changes Made

### 1. `frontend/src/lib/api.js`
- ✅ Added `getApiBaseUrl()` function that:
  - Forces `http://localhost:5001/api` in development mode
  - Uses `VITE_API_URL` env var in production (if set)
  - Falls back to `https://studio-api.southernpowertvmusic.com/api` in production
- ✅ Added comprehensive logging:
  - Development: Logs mode, baseURL, and env var status
  - Production: Logs baseURL for debugging

### 2. `frontend/src/context/AuthContext.jsx`
- ✅ Added logging in `signIn()` to show which URL login requests go to

### 3. `frontend/.env`
- ✅ Set `VITE_API_URL=http://localhost:5001/api` for development
- ✅ Removed duplicate/conflicting entries

## 🔍 Verification

When you start the dev server, you should see in the browser console:

```
🔧 [API Client] Development mode detected
🔧 [API Client] baseURL: http://localhost:5001/api
🔧 [API Client] VITE_API_URL env: http://localhost:5001/api
🔧 [API Client] MODE: development
```

When you attempt to login:

```
🔧 [Auth] Attempting login to: http://localhost:5001/api/auth/login
```

## 🚀 Production Deployment

For production builds, set the environment variable:

```bash
VITE_API_URL=https://studio-api.southernpowertvmusic.com/api
```

Or the code will automatically use `https://studio-api.southernpowertvmusic.com/api` as the fallback.

## 📋 Files Modified

1. `frontend/src/lib/api.js` - Main API client configuration
2. `frontend/src/context/AuthContext.jsx` - Added login URL logging
3. `frontend/.env` - Set `VITE_API_URL` for development

## ⚠️ Important

**Restart the Vite dev server** after these changes to pick up the new configuration:

```powershell
# Stop current server (Ctrl+C)
cd frontend
npm run dev
```

---

**Status:** ✅ Complete - Development forced to localhost, production uses env var or fallback















