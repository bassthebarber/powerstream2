# Supabase as primary database

## Source of truth (Supabase)

| Domain      | Table(s)        | Notes                                      |
|------------|-----------------|--------------------------------------------|
| Profiles   | `profiles`      | Use `external_user_id` = app user id (Mongo ObjectId string during transition). |
| Feed       | `feed_posts`    | `post_type`: `feed`, `gram`, `reel`, `audio`, … |
| Stations   | `stations`      |                                            |
| PowerLine  | `line_messages` | Threads derived from DM pairs + messages.  |
| Payments   | `payments`      | All completed Stripe / ledger rows.       |

## MongoDB (temporary)

- **Auth**: User sessions / JWT user document until Supabase Auth or full migration.
- **Film / legacy**: `Film`, entitlements on Mongo until migrated.

## Deprecated Mongo models (do not add features)

- `User` — profile fields → `profiles`
- `Conversation`, `Message` — → `line_messages`
- `Purchase` — → `payments` (PPV list = `payments` where `type` in `ppv`, `video_purchase`)
- `PowerGramPost` — → `feed_posts` (`post_type = gram`)
- `Reel` / reel Mongo models — → `feed_posts` (`post_type = reel`)

## SQL: profiles ↔ app user

```sql
-- If not present, add and backfill from existing users:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS external_user_id text UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_external_user_id ON profiles (external_user_id);
-- Backfill: set external_user_id to Mongo User._id string for each mapped user.
```

## API

- PowerLine: `/api/powerline/messenger/*` only (legacy `/threads` removed / 503).
- PPV history: `GET /api/ppv/purchases` reads Supabase `payments`.
