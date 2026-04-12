# PowerStream + AI Studio Launch Checklist

## Overview

PowerStream is a full-stack music streaming and production platform with:
- **Main Backend** (port 5001): Core API, auth, feed, social features
- **Studio Backend** (port 5100): Recording studio, AI beat generation, mixing/mastering
- **Main Frontend** (port 5173): User-facing application
- **Studio Frontend** (port 5174): Standalone studio app

---

## 1. Starting Services Locally

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- FFmpeg (for audio processing)
- Redis (optional, for caching)

### Environment Setup

1. **Create `.env.local` in `/backend/`:**

```env
# Database
MONGO_URI=mongodb://localhost:27017/powerstream
STUDIO_MONGO_URI=mongodb://localhost:27017/powerstream

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# Cloudinary (for media uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: MusicGen API for real AI beat generation
MUSICGEN_API_BASE=http://localhost:9100
MUSICGEN_API_KEY=your-musicgen-key

# Optional: OpenAI (for AI features)
OPENAI_API_KEY=sk-your-openai-key

# Optional: Stripe (for payments - TEST MODE)
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Environment
NODE_ENV=development
PORT=5001
STUDIO_PORT=5100
```

2. **Create `.env` in `/frontend/`:**

```env
VITE_API_URL=http://localhost:5001/api
VITE_STUDIO_API_URL=http://localhost:5100
VITE_WS_URL=ws://localhost:5001
```

### Starting All Services

```bash
# Terminal 1: Main Backend
cd backend
npm install
$env:NODE_ENV="development"  # PowerShell
# export NODE_ENV=development  # Bash
node server.js

# Terminal 2: Studio Backend  
cd backend/recordingStudio
npm install
node RecordingStudioServer.js

# Terminal 3: Main Frontend
cd frontend
npm install
npm run dev

# Terminal 4: Studio Frontend (optional)
cd frontend/studio-app
npm install
npm run dev
```

---

## 2. Required Environment Variables

### Main Backend (`/backend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token secret (min 32 chars) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `PORT` | ❌ | Main backend port (default: 5001) |
| `NODE_ENV` | ❌ | Environment (development/production) |

### Studio Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `STUDIO_MONGO_URI` | ❌ | Studio DB (falls back to MONGO_URI) |
| `STUDIO_PORT` | ❌ | Studio port (default: 5100) |
| `MUSICGEN_API_BASE` | ❌ | MusicGen API URL for AI beats |
| `MUSICGEN_API_KEY` | ❌ | MusicGen API key |
| `OPENAI_API_KEY` | ❌ | OpenAI API key for AI features |

### Payments (Test Mode)

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | ❌ | Stripe secret key (use `sk_test_` prefix) |
| `STRIPE_WEBHOOK_SECRET` | ❌ | Stripe webhook signing secret |

---

## 3. Running Tests

### Unit Tests

```bash
# Backend tests
cd backend
npm test

# Studio tests
cd backend/recordingStudio
npm test
```

### Health Checks

```bash
# Main backend health
curl http://localhost:5001/api/health

# Studio health
curl http://localhost:5100/api/health

# Auth health
curl http://localhost:5001/api/auth/health

# Studio AI health
curl http://localhost:5100/api/studio/ai/health

# Mix engine health
curl http://localhost:5100/api/mix/health

# Master engine health
curl http://localhost:5100/api/studio/master/health
```

### Health Check All Script

```bash
cd backend
npm run health:all
```

---

## 4. Feature Status

### ✅ Fully Wired (Real Logic)

| Feature | Endpoint | Notes |
|---------|----------|-------|
| **Auth** | POST `/api/auth/login` | JWT-based authentication |
| **Auth** | POST `/api/auth/register` | User registration |
| **Recording** | POST `/api/studio/record/start` | Creates real StudioSession |
| **Recording** | POST `/api/studio/record/upload` | Uploads to Cloudinary |
| **Beat Generation** | POST `/api/studio/ai/generate-beat` | MusicGen/pattern fallback |
| **Beat Store** | GET `/api/studio/beats` | List/search beats |
| **Mixing** | POST `/api/mix/apply` | Real FFmpeg processing |
| **Mixing** | POST `/api/mix/combine` | Combine vocals + beat |
| **Mastering** | POST `/api/studio/master/apply` | Real FFmpeg mastering |
| **Contracts** | POST `/api/studio/contracts/generate` | Studio service agreements |
| **Contracts** | POST `/api/studio/contracts/:id/sign` | E-signature flow |
| **Studio Jobs** | GET `/api/studio/jobs` | Paid task management |

### ⚠️ Partially Mocked

| Feature | Notes |
|---------|-------|
| **MusicGen** | Falls back to pattern generation if API not configured |
| **Payments** | Uses test/simulated mode - wire Stripe for production |
| **Email** | Export email endpoint logs only - integrate SendGrid/SMTP |

### 📋 Manual Steps Required

1. **Cloudinary Account**: Create account at cloudinary.com and add credentials
2. **MusicGen API** (optional): Set up local MusicGen server or use cloud service
3. **Stripe Account** (optional): Create Stripe account for payments
4. **MongoDB**: Ensure MongoDB is running locally or use Atlas

---

## 5. API Quick Reference

### Authentication

```bash
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "User Name"}'
```

### Recording Studio

```bash
# Start recording session
curl -X POST http://localhost:5100/api/studio/record/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectName": "My Track", "room": "vocal"}'

# Upload recording
curl -X POST http://localhost:5100/api/studio/record/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@recording.webm" \
  -F "sessionId=SESSION_ID"
```

### Beat Generation

```bash
# Generate AI beat
curl -X POST http://localhost:5100/api/studio/ai/generate-beat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bpm": 140, "style": "trap", "mood": "dark", "bars": 16}'
```

### Mixing & Mastering

```bash
# Apply mix
curl -X POST http://localhost:5100/api/mix/apply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@track.mp3" \
  -F "settings={\"bass\": 3, \"treble\": 2, \"comp\": 4}"

# Master track
curl -X POST http://localhost:5100/api/studio/master/apply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@mixed.mp3" \
  -F "preset=streaming"
```

---

## 6. Production Deployment

### Security Checklist

- [ ] Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET` (32+ random chars)
- [ ] Use production MongoDB with authentication
- [ ] Set `NODE_ENV=production`
- [ ] Configure HTTPS/TLS
- [ ] Set up rate limiting
- [ ] Review CORS origins
- [ ] Use production Cloudinary settings
- [ ] Switch to Stripe live keys

### PM2 Process Management

```bash
# Start with PM2
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Restart
pm2 restart all
```

---

## 7. Troubleshooting

### Common Issues

1. **"Network Error" on login**
   - Check backend is running on port 5001
   - Verify `NODE_ENV=development` is set
   - Check MongoDB connection

2. **"JWT Secret not set" error**
   - Ensure `.env.local` exists in `/backend/`
   - Set `JWT_SECRET` and `JWT_REFRESH_SECRET`

3. **Cloudinary upload fails**
   - Verify all 3 Cloudinary env vars are set
   - Check Cloudinary account limits

4. **Beat generation returns pattern only**
   - MusicGen API not configured - this is expected
   - Set `MUSICGEN_API_BASE` for real audio generation

5. **Mix/Master endpoints fail**
   - Ensure `ffmpeg-static` is installed
   - Check temp directory permissions

---

## 8. Architecture Overview

```
PowerStream/
├── backend/                    # Main backend (port 5001)
│   ├── server.js              # Entry point
│   ├── src/                   # Meta-style architecture
│   │   ├── loaders/           # Express, socket, DB loaders
│   │   ├── domain/            # Models, services
│   │   └── sockets/           # Unified socket handlers
│   ├── routes/                # API routes
│   ├── controllers/           # Route handlers
│   └── middleware/            # Auth, validation
│
├── backend/recordingStudio/   # Studio backend (port 5100)
│   ├── RecordingStudioServer.js
│   ├── routes/                # Studio API routes
│   ├── controllers/           # Beat, mix, master handlers
│   ├── ai/studio/             # AI engines (beat, mix, render)
│   ├── models/                # Studio-specific models
│   └── services/              # Contract, royalty engines
│
├── frontend/                  # Main frontend (port 5173)
│   ├── src/
│   │   ├── pages/             # Route pages
│   │   ├── components/        # React components
│   │   └── context/           # Auth, theme context
│   └── studio-app/            # Studio frontend (port 5174)
│
└── docs/                      # Documentation
    └── LAUNCH_CHECKLIST.md    # This file
```

---

## 9. Support

For issues or questions:
- Check the `/backend/logs/` directory for error logs
- Review console output for specific error messages
- Ensure all environment variables are correctly set

---

*Last updated: December 2024*
*Version: 2.0.0*












