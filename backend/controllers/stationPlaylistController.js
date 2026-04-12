import mongoose from "mongoose";
import Station from "../models/Station.js";
import Playlist from "../models/PlaylistModel.js";
import {
  activeScheduleSlot,
  cyclicPlaybackState,
  nextIndex,
} from "../utils/broadcastPlayback.js";

function stationQuery(id) {
  if (mongoose.isValidObjectId(id)) {
    return { $or: [{ _id: id }, { slug: id }] };
  }
  return { slug: id };
}

async function resolveStation(id) {
  return Station.findOne(stationQuery(id)).lean();
}

function canManage(station, user) {
  const userId = user?.id || user?._id || user?.userId;
  if (!userId) return false;
  if (user?.isAdmin) return true;
  if (!station?.owner) return false;
  return String(station.owner) === String(userId);
}

function serializeVideo(v) {
  const o = v.toObject?.() ?? v;
  return {
    _id: o._id,
    url: o.url,
    title: o.title || "Untitled",
    thumbnail: o.thumbnail || "",
    durationSeconds: o.durationSeconds || 600,
    videoId: o.videoId || "",
  };
}

async function ensurePlaylistDoc(station) {
  let pl = await Playlist.findOne({ stationId: station._id });
  const embedded = station.videos || [];
  if (!pl && embedded.length > 0) {
    pl = await Playlist.create({
      stationId: station._id,
      title: `${station.name || "Station"} 24/7`,
      loop: true,
      videos: embedded.map((v) => ({
        url: v.url || v.videoUrl,
        title: v.title || "Video",
        thumbnail: v.thumbnail || v.thumbnailUrl || "",
        durationSeconds: v.durationSeconds || 600,
        videoId: v._id ? String(v._id) : "",
      })),
    });
  }
  if (!pl) {
    pl = await Playlist.create({
      stationId: station._id,
      title: `${station.name || "Station"} 24/7`,
      loop: true,
      videos: [],
    });
  }
  return pl;
}

/**
 * GET /api/v2/stations/:id/playlist
 */
export async function getPlaylist(req, res) {
  try {
    const station = await resolveStation(req.params.id);
    if (!station) {
      return res.status(404).json({ ok: false, error: "Station not found" });
    }
    const pl = await ensurePlaylistDoc(station);
    const videos = pl.videos || [];
    const slot = activeScheduleSlot(pl.schedule || []);
    let nowPlayingIndex = 0;
    let mode = "loop";
    let slotMeta = null;

    if (slot) {
      mode = "scheduled";
      if (slot.url) {
        nowPlayingIndex = -1;
        slotMeta = {
          title: slot.slotTitle || "Scheduled",
          url: slot.url,
          startTime: slot.startTime,
          endTime: slot.endTime,
        };
      } else {
        const vi = Math.min(
          Math.max(0, Number(slot.videoIndex) || 0),
          Math.max(0, videos.length - 1)
        );
        nowPlayingIndex = videos.length ? vi : 0;
        slotMeta = {
          title: slot.slotTitle || videos[nowPlayingIndex]?.title,
          startTime: slot.startTime,
          endTime: slot.endTime,
        };
      }
    } else if (videos.length) {
      const state = cyclicPlaybackState(videos, pl.loop);
      nowPlayingIndex = state.index;
      slotMeta = {
        offsetInBlockSeconds: state.offsetInBlockSeconds,
        blockDurationSeconds: state.blockDurationSeconds,
      };
    }

    const nowVideo =
      slotMeta?.url && nowPlayingIndex < 0
        ? {
            url: slotMeta.url,
            title: slotMeta.title,
            thumbnail: "",
            durationSeconds: 3600,
          }
        : videos[nowPlayingIndex]
          ? serializeVideo(videos[nowPlayingIndex])
          : null;

    const upNextIdx =
      nowPlayingIndex >= 0
        ? nextIndex(nowPlayingIndex, videos.length, pl.loop)
        : nextIndex(0, videos.length, pl.loop);
    const upNext =
      upNextIdx >= 0 && videos[upNextIdx]
        ? serializeVideo(videos[upNextIdx])
        : pl.loop && videos[0] && nowPlayingIndex !== 0
          ? serializeVideo(videos[0])
          : null;

    const queue = [];
    if (videos.length && nowPlayingIndex >= 0) {
      if (pl.loop) {
        for (let k = 1; k < videos.length; k++) {
          const i = (nowPlayingIndex + k) % videos.length;
          queue.push(serializeVideo(videos[i]));
        }
      } else {
        for (let i = nowPlayingIndex + 1; i < videos.length; i++) {
          queue.push(serializeVideo(videos[i]));
        }
      }
    }

    res.json({
      ok: true,
      stationId: String(station._id),
      slug: station.slug,
      playlist: {
        title: pl.title,
        loop: pl.loop,
        videos: videos.map(serializeVideo),
        schedule: pl.schedule || [],
        updatedAt: pl.updatedAt,
      },
      broadcast: {
        mode,
        nowPlaying: nowVideo,
        nowPlayingIndex: nowPlayingIndex < 0 ? null : nowPlayingIndex,
        upNext,
        queue,
        slot: slotMeta,
      },
    });
  } catch (e) {
    console.error("[playlist]", e);
    res.status(500).json({ ok: false, error: e.message });
  }
}

/**
 * POST /api/v2/stations/:id/playlist — replace playlist (owner)
 */
export async function postPlaylist(req, res) {
  try {
    const station = await Station.findOne(stationQuery(req.params.id));
    if (!station) return res.status(404).json({ ok: false, error: "Station not found" });
    if (!canManage(station, req.user)) {
      return res.status(403).json({ ok: false, error: "Station owner only" });
    }

    const { title, videos, loop, schedule } = req.body || {};
    if (!Array.isArray(videos)) {
      return res.status(400).json({ ok: false, error: "videos array required" });
    }

    const normalized = videos
      .filter((x) => x && (x.url || x.videoUrl))
      .map((x) => ({
        url: String(x.url || x.videoUrl),
        title: String(x.title || "Untitled"),
        thumbnail: String(x.thumbnail || x.thumbnailUrl || ""),
        durationSeconds: Math.max(30, parseInt(x.durationSeconds, 10) || 600),
        videoId: x.videoId ? String(x.videoId) : "",
      }));

    let pl = await Playlist.findOne({ stationId: station._id });
    if (!pl) {
      pl = new Playlist({
        stationId: station._id,
        title: title || "Channel 24/7",
        videos: normalized,
        loop: loop !== false,
        schedule: Array.isArray(schedule) ? schedule : [],
      });
    } else {
      if (title != null) pl.title = title;
      pl.videos = normalized;
      if (typeof loop === "boolean") pl.loop = loop;
      if (Array.isArray(schedule)) pl.schedule = schedule;
    }
    await pl.save();
    res.json({ ok: true, playlist: pl.toObject() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

/**
 * PUT /api/v2/stations/:id/playlist — partial update
 */
export async function putPlaylist(req, res) {
  try {
    const station = await Station.findOne(stationQuery(req.params.id));
    if (!station) return res.status(404).json({ ok: false, error: "Station not found" });
    if (!canManage(station, req.user)) {
      return res.status(403).json({ ok: false, error: "Station owner only" });
    }

    const pl = await ensurePlaylistDoc(station.toObject ? station.toObject() : station);
    const doc = await Playlist.findById(pl._id);
    const { title, videos, loop, schedule, appendVideo } = req.body || {};

    if (title !== undefined) doc.title = title;
    if (typeof loop === "boolean") doc.loop = loop;
    if (Array.isArray(schedule)) doc.schedule = schedule;
    if (appendVideo?.url || appendVideo?.videoUrl) {
      doc.videos.push({
        url: String(appendVideo.url || appendVideo.videoUrl),
        title: String(appendVideo.title || "Untitled"),
        thumbnail: String(appendVideo.thumbnail || ""),
        durationSeconds: Math.max(30, parseInt(appendVideo.durationSeconds, 10) || 600),
      });
    } else if (Array.isArray(videos)) {
      doc.videos = videos
        .filter((x) => x && (x.url || x.videoUrl))
        .map((x) => ({
          url: String(x.url || x.videoUrl),
          title: String(x.title || "Untitled"),
          thumbnail: String(x.thumbnail || ""),
          durationSeconds: Math.max(30, parseInt(x.durationSeconds, 10) || 600),
          videoId: x.videoId ? String(x.videoId) : "",
        }));
    }

    await doc.save();
    res.json({ ok: true, playlist: doc.toObject() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
