/**
 * PowerStream Live Engine — RTMP keys, Supabase stations/feed, viewers, webhooks.
 */
import { randomBytes } from "crypto";
import env from "../config/env.js";
import { logger } from "../config/logger.js";
import { getSupabaseAdmin, isSupabaseLiveEngineEnabled } from "./supabaseAdmin.js";
import {
  recordLiveTipPayment,
  recordLiveSubscriptionSignal,
} from "../../services/monetization/unifiedPaymentService.js";

const STREAM_APP = "live";

/** @type {Map<string, { slug: string, ownerUserId: string }>} */
const streamKeyCache = new Map();

/** @type {Map<string, Map<string, number>>} slug -> sessionId -> lastPing */
const viewerSessions = new Map();

let streamKeyValidator = null;

export function setStreamKeyValidator(fn) {
  streamKeyValidator = fn;
}

export function isStreamKeyAllowed(streamKey) {
  if (!streamKey) return false;
  if (env.RTMP_SECRET && streamKey === env.RTMP_SECRET) return true;
  return streamKeyCache.has(streamKey);
}

/**
 * Load all station RTMP keys into memory for sync prePublish checks.
 */
export async function refreshStreamKeyCache() {
  streamKeyCache.clear();
  const sb = getSupabaseAdmin();
  if (!sb) {
    logger.warn("[LiveEngine] Supabase not configured — RTMP only accepts RTMP_SECRET if set");
    return;
  }
  const { data, error } = await sb
    .from("stations")
    .select("slug, rtmp_stream_key, owner_user_id")
    .not("rtmp_stream_key", "is", null);

  if (error) {
    logger.error("[LiveEngine] refreshStreamKeyCache:", error.message);
    return;
  }
  for (const row of data || []) {
    if (row.rtmp_stream_key) {
      streamKeyCache.set(row.rtmp_stream_key, {
        slug: row.slug,
        ownerUserId: row.owner_user_id || "",
      });
    }
  }
  logger.info(`[LiveEngine] Stream key cache: ${streamKeyCache.size} stations`);
}

function generateRtmpKey(slug) {
  const part = randomBytes(12).toString("hex");
  return `ps_${slug.replace(/[^a-z0-9]/gi, "_")}_${part}`;
}

function publicHlsUrl(streamKey) {
  const base =
    env.LIVE_HLS_PUBLIC_BASE?.replace(/\/+$/, "") ||
    `http://${env.STREAM_DOMAIN}:${env.HLS_PORT}`;
  return `${base}/${STREAM_APP}/${streamKey}/index.m3u8`;
}

function rtmpServerUrl() {
  return `rtmp://${env.STREAM_DOMAIN}:${env.RTMP_PORT}/${STREAM_APP}`;
}

function rtmpIngestUrl(streamKey) {
  return `${rtmpServerUrl()}/${streamKey}`;
}

/**
 * Ensure station row exists and return owner check.
 */
export async function ensureStationLiveRow(slug, defaults = {}) {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase not configured");

  const { data: existing } = await sb.from("stations").select("*").eq("slug", slug).maybeSingle();
  if (existing) return existing;

  const { data, error } = await sb
    .from("stations")
    .insert({
      slug,
      name: defaults.name || slug,
      is_live: false,
      viewer_count: 0,
      ...defaults,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Claim station (first user wins). Does not expose stream key alone.
 */
export async function claimStation(slug, ownerUserId, stationMeta = {}) {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase not configured");

  await ensureStationLiveRow(slug, { name: stationMeta.name, logo_url: stationMeta.logo_url });
  const { data: row } = await sb.from("stations").select("*").eq("slug", slug).single();
  if (row.owner_user_id && row.owner_user_id !== ownerUserId) {
    const err = new Error("Station already claimed by another user");
    err.code = "OWNER_CONFLICT";
    throw err;
  }
  if (!row.owner_user_id) {
    await sb.from("stations").update({ owner_user_id: ownerUserId }).eq("slug", slug);
  }
  return { ok: true, slug, ownerUserId };
}

/**
 * RTMP credentials — only if owner_user_id matches.
 */
export async function getOwnerIngestCredentials(slug, ownerUserId) {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase not configured");

  const { data: row } = await sb.from("stations").select("*").eq("slug", slug).single();
  if (!row) throw new Error("Station not found");
  if (!row.owner_user_id || row.owner_user_id !== ownerUserId) {
    const err = new Error("Only the station owner can view stream credentials");
    err.code = "FORBIDDEN";
    throw err;
  }

  let key = row.rtmp_stream_key;
  if (!key) {
    key = generateRtmpKey(slug);
    await sb.from("stations").update({ rtmp_stream_key: key }).eq("slug", slug);
  }
  await refreshStreamKeyCache();
  return {
    streamKey: key,
    rtmpUrl: rtmpIngestUrl(key),
    rtmpServerUrl: rtmpServerUrl(),
    playbackUrl: publicHlsUrl(key),
  };
}

export async function regenerateStreamKey(slug, ownerUserId) {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase not configured");

  const { data: row } = await sb.from("stations").select("*").eq("slug", slug).single();
  if (!row || row.owner_user_id !== ownerUserId) {
    const err = new Error("Not authorized");
    err.code = "FORBIDDEN";
    throw err;
  }

  const oldKey = row.rtmp_stream_key;
  const key = generateRtmpKey(slug);
  await sb
    .from("stations")
    .update({ rtmp_stream_key: key, is_live: false })
    .eq("slug", slug);
  if (oldKey) streamKeyCache.delete(oldKey);
  await refreshStreamKeyCache();
  return {
    streamKey: key,
    rtmpUrl: rtmpIngestUrl(key),
    rtmpServerUrl: rtmpServerUrl(),
    playbackUrl: publicHlsUrl(key),
  };
}

export async function updateLiveMeta(slug, ownerUserId, { title, thumbnailUrl }) {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase not configured");
  const { data: row } = await sb.from("stations").select("owner_user_id").eq("slug", slug).single();
  if (!row || row.owner_user_id !== ownerUserId) throw new Error("Not authorized");
  const patch = {};
  if (title != null) patch.live_title = title;
  if (thumbnailUrl != null) patch.live_thumbnail_url = thumbnailUrl;
  await sb.from("stations").update(patch).eq("slug", slug);
  return patch;
}

export async function handleStreamPublished(streamPath) {
  const streamKey = streamPath.split("/").filter(Boolean).pop();
  const meta = streamKeyCache.get(streamKey);
  if (!meta) {
    logger.warn(`[LiveEngine] Unknown stream key published: ${streamKey}`);
    return;
  }
  const sb = getSupabaseAdmin();
  if (!sb) return;

  const { data: st } = await sb.from("stations").select("*").eq("slug", meta.slug).single();
  if (!st) return;

  const hlsUrl = publicHlsUrl(streamKey);
  const title = st.live_title || `${st.name} is LIVE`;
  const thumb = st.live_thumbnail_url || st.logo_url || null;

  await sb
    .from("stations")
    .update({
      is_live: true,
      live_stream_url: hlsUrl,
      viewer_count: 0,
    })
    .eq("slug", meta.slug);

  const userId = st.owner_user_id || "system";
  const { data: post, error: pe } = await sb
    .from("feed_posts")
    .insert({
      user_id: userId,
      username: st.name,
      post_type: "live_stream",
      content: title,
      media_url: hlsUrl,
      media_type: "video",
      station_slug: meta.slug,
      metadata: {
        station_id: meta.slug,
        title,
        thumbnail_url: thumb,
        stream_key_suffix: streamKey.slice(-8),
      },
      reactions: {},
      comments: [],
      views: 0,
    })
    .select("id")
    .single();

  if (pe) {
    logger.error("[LiveEngine] feed_posts insert:", pe.message);
  } else if (post?.id) {
    await sb.from("stations").update({ live_feed_post_id: post.id }).eq("slug", meta.slug);
  }

  logger.info(`[LiveEngine] LIVE started: ${meta.slug} → ${hlsUrl}`);

  try {
    const { notifyStationSubscribers } = await import("../../services/notificationService.js");
    await notifyStationSubscribers(
      meta.slug,
      userId,
      "live",
      meta.slug,
      `${st.name || meta.slug} is LIVE`,
      { path: `/tv/${encodeURIComponent(meta.slug)}/channel`, stationSlug: meta.slug }
    );
  } catch (e) {
    logger.warn("[LiveEngine] notify subscribers:", e.message);
  }
}

export async function handleStreamEnded(streamPath) {
  const streamKey = streamPath.split("/").filter(Boolean).pop();
  const meta = streamKeyCache.get(streamKey);
  if (!meta) return;
  const sb = getSupabaseAdmin();
  if (!sb) return;

  await sb
    .from("stations")
    .update({
      is_live: false,
      viewer_count: 0,
    })
    .eq("slug", meta.slug);

  viewerSessions.delete(meta.slug);
  logger.info(`[LiveEngine] LIVE ended: ${meta.slug}`);
}

export function pingViewer(stationSlug, sessionId) {
  if (!stationSlug || !sessionId) return 0;
  if (!viewerSessions.has(stationSlug)) viewerSessions.set(stationSlug, new Map());
  const room = viewerSessions.get(stationSlug);
  const now = Date.now();
  room.set(sessionId, now);
  for (const [sid, t] of room.entries()) {
    if (now - t > 45000) room.delete(sid);
  }
  return room.size;
}

export async function syncViewerCountToSupabase(stationSlug) {
  const count = viewerSessions.get(stationSlug)?.size ?? 0;
  const sb = getSupabaseAdmin();
  if (!sb) return count;
  await sb.from("stations").update({ viewer_count: count }).eq("slug", stationSlug);
  return count;
}

export async function getStationLiveStatus(slug) {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, configured: false };
  const { data, error } = await sb
    .from("stations")
    .select(
      "slug,name,is_live,viewer_count,live_stream_url,owner_user_id,live_title,live_thumbnail_url,logo_url"
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  const mem = viewerSessions.get(slug)?.size ?? 0;
  const viewers = Math.max(data?.viewer_count || 0, mem);
  return {
    ok: true,
    slug,
    isLive: !!data?.is_live,
    viewerCount: viewers,
    playbackUrl: data?.live_stream_url || null,
    title: data?.live_title || data?.name,
    thumbnailUrl: data?.live_thumbnail_url || data?.logo_url,
    ownerUserId: data?.owner_user_id || null,
  };
}

export async function recordTip({ fromUserId, stationSlug, amountCents }) {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase not configured");
  const { data: st } = await sb
    .from("stations")
    .select("owner_user_id")
    .eq("slug", stationSlug)
    .maybeSingle();
  const creatorId = st?.owner_user_id || null;
  return recordLiveTipPayment({
    userId: fromUserId,
    creatorId,
    stationSlug,
    amountCents,
  });
}

export async function recordSubscriptionPayment({ fromUserId, stationSlug, amountCents = 0 }) {
  return recordLiveSubscriptionSignal({
    userId: fromUserId,
    stationSlug,
    amountCents,
  });
}

export { isSupabaseLiveEngineEnabled, publicHlsUrl, rtmpIngestUrl, rtmpServerUrl };
