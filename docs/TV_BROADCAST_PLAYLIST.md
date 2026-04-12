# 24/7 TV broadcast playlist (MTV-style)

## API (`/api/v2/stations`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/:id/playlist` | No | Playlist + **broadcast** hint (synced index, schedule slot, queue). `id` = Mongo `_id` or `slug`. |
| POST | `/:id/playlist` | Yes (owner/admin) | Replace full playlist: `{ title, videos[], loop, schedule[] }` |
| PUT | `/:id/playlist` | Yes | Patch: `{ loop, title, schedule, appendVideo, videos }` |

### Video entry

```json
{ "url": "https://...", "title": "...", "thumbnail": "", "durationSeconds": 600 }
```

### Schedule slot (optional)

```json
{
  "startTime": "20:00",
  "endTime": "22:00",
  "dayOfWeek": 5,
  "slotTitle": "Friday Night",
  "videoIndex": 0,
  "url": ""
}
```

Use `url` for a one-off stream URL during the slot; otherwise `videoIndex` selects from `videos[]`.

## Frontend

- **Channel:** `/tv/:stationSlug/channel` — live HLS if live-engine reports live; else VOD auto-advance + loop.
- **Owner dashboard:** `/tv/:stationSlug/broadcast/manage` — reorder, add URLs, loop toggle.

## Mongo

- Model: `StationBroadcastPlaylist` (`backend/models/PlaylistModel.js`)
- First GET creates an empty playlist or seeds from `Station.videos` if present.
