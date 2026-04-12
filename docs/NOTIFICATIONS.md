# Real-time notifications

## Supabase

Run `docs/notifications-table.sql` in the Supabase SQL editor.

## API (`/api/v2/notifications`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List notifications (`?limit=`, `?unreadOnly=true`) + `unreadCount` |
| GET | `/unread-count` | `{ unreadCount }` |
| POST | `/read` | `{ notificationId }` or `{ markAll: true }` |

## Socket.IO

- Namespace: **`/notifications`**
- Auth: `auth: { token: JWT }` (same secret as REST JWT)
- Server joins socket to room **`user:<userId>`**
- Event: **`notification:new`** — payload matches API row (camelCase: `userId`, `isRead`, `createdAt`, …)

## Triggers (server)

| Event | Type | Recipients |
|-------|------|------------|
| New feed_posts (PowerFeed / Gram / Reel) | `post` | Mongo **followers** of author |
| PowerLine DM | `dm` | Other thread participant |
| Station goes LIVE | `live` | **station_subscriptions** for that slug |
| TV video upload (`POST /api/tv/stations/:slug/videos`) | `video` | Station subscribers (when route mounted) |
| Subscribe ledger (live engine) | `subscription` | Station **owner** |

## Frontend

- **`NotificationBell`** in `Layout` header — badge, dropdown, socket updates.
- Deep links via `metadata.path` (set by server).

## Phase 2 — Push (optional)

- **FCM**: store `fcm_tokens` per user; on `createNotification`, also call Firebase Admin `sendEachForMulticast`.
- **Browser**: `Notification.requestPermission()` + `new Notification(title, { body })` when tab hidden (only after user gesture permission).
