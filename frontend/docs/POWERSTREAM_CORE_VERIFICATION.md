# PowerStream core — verification checklist

## 1. Environment

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set in `.env` / Vite env.
- Backend API reachable for login (`/users/me`).

## 2. Automatic check (dev)

With `npm run dev`, open the browser console after load (and after login):

- **`[PowerStream] Supabase core:`** — object with:
  - `configured` / `connected` / `latencyMs`
  - `tests.feed_posts_read`, `profiles_read`, `station_subscriptions_read`
  - `supabaseAuthSession` — optional; PowerStream uses **API user id** on rows unless you wire Supabase JWT.

## 3. Deep write test (optional)

In the browser console (while logged in):

```js
const { verifyPowerstreamCore } = await import('./src/lib/supabasePowerstream.js');
// Or from app context: pass your user object
verifyPowerstreamCore(window.__PS_USER__, { deepWrites: true });
```

Requires RLS policies that allow the logged-in user to insert/delete their own `feed_posts` and `station_subscriptions` rows.

## 4. Realtime (instant live feed)

Supabase → **Database** → **Replication** — enable for `feed_posts` (or add table to `supabase_realtime` publication).  
Then new `live_stream` (and other timeline) inserts appear on `/feed` without refresh.

## 5. Profile → station

- Set `profiles.station_slug` (and optionally `profiles.app_user_id` = API user id).
- Run `docs/supabase-profiles-app-user.sql` if you use non-UUID API users.

## 6. Station pages

- `stations` row per slug; VOD = `feed_posts` with `post_type = station_vod`.
- Hub loads live + featured + trending in **one parallel batch** per poll.
