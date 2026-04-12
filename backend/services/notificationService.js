/**
 * Unified notifications — Supabase `notifications` + Socket.IO `notification:new`.
 */
import { getSupabaseAdmin } from "../src/services/supabaseAdmin.js";
import { getIO } from "../src/loaders/socket.js";
import { logger } from "../src/config/logger.js";

const VALID_TYPES = new Set([
  "post",
  "like",
  "comment",
  "dm",
  "live",
  "video",
  "subscription",
]);

function toRow(n) {
  return {
    id: n.id,
    userId: n.user_id,
    actorId: n.actor_id,
    type: n.type,
    entityId: n.entity_id,
    message: n.message,
    isRead: n.is_read,
    metadata: n.metadata || {},
    createdAt: n.created_at,
  };
}

export function emitNotificationToUser(userId, payload) {
  try {
    const io = getIO();
    if (!io) return;
    io.of("/notifications")
      .to(`user:${String(userId)}`)
      .emit("notification:new", payload);
  } catch (e) {
    logger.warn("[notifications] emit failed:", e.message);
  }
}

/**
 * @param {{ userId: string, actorId?: string, type: string, entityId?: string, message: string, metadata?: object }} opts
 */
export async function createNotification(opts) {
  const sb = getSupabaseAdmin();
  if (!sb) {
    logger.warn("[notifications] Supabase off — skip create");
    return null;
  }
  const { userId, actorId, type, entityId, message, metadata = {} } = opts;
  if (!userId || !VALID_TYPES.has(type)) return null;
  if (String(userId) === String(actorId || "")) return null;

  const row = {
    user_id: String(userId),
    actor_id: actorId != null ? String(actorId) : null,
    type,
    entity_id: entityId != null ? String(entityId) : null,
    message: String(message || "").slice(0, 500),
    is_read: false,
    metadata: typeof metadata === "object" && metadata ? metadata : {},
  };

  const { data, error } = await sb.from("notifications").insert(row).select("*").single();
  if (error) {
    logger.error("[notifications] insert:", error.message);
    throw error;
  }
  const out = toRow(data);
  emitNotificationToUser(userId, out);
  return out;
}

export async function createNotificationsBulk(rows) {
  const sb = getSupabaseAdmin();
  if (!sb || !rows?.length) return [];
  const inserts = rows
    .filter((r) => r.userId && VALID_TYPES.has(r.type) && String(r.userId) !== String(r.actorId || ""))
    .map((r) => ({
      user_id: String(r.userId),
      actor_id: r.actorId != null ? String(r.actorId) : null,
      type: r.type,
      entity_id: r.entityId != null ? String(r.entityId) : null,
      message: String(r.message || "").slice(0, 500),
      is_read: false,
      metadata: r.metadata && typeof r.metadata === "object" ? r.metadata : {},
    }));
  if (!inserts.length) return [];

  const { data, error } = await sb.from("notifications").insert(inserts).select("*");
  if (error) {
    logger.error("[notifications] bulk insert:", error.message);
    throw error;
  }
  const list = (data || []).map(toRow);
  for (const n of list) {
    emitNotificationToUser(n.userId, n);
  }
  return list;
}

export async function getUserNotifications(userId, { limit = 50, unreadOnly = false } = {}) {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const lim = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
  let q = sb
    .from("notifications")
    .select("*")
    .eq("user_id", String(userId))
    .order("created_at", { ascending: false })
    .limit(lim);
  if (unreadOnly) q = q.eq("is_read", false);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(toRow);
}

export async function getUnreadCount(userId) {
  const sb = getSupabaseAdmin();
  if (!sb) return 0;
  const { count, error } = await sb
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", String(userId))
    .eq("is_read", false);
  if (error) return 0;
  return count || 0;
}

export async function markAsRead(notificationId, userId) {
  const sb = getSupabaseAdmin();
  if (!sb) return false;
  const { data, error } = await sb
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", String(userId))
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function markAllRead(userId) {
  const sb = getSupabaseAdmin();
  if (!sb) return 0;
  const { data, error } = await sb
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", String(userId))
    .eq("is_read", false)
    .select("id");
  if (error) throw error;
  return (data || []).length;
}

/**
 * Notify Mongo User.followers when actor posts (feed / gram / reel).
 */
export async function notifyFollowersNewContent(actorId, entityId, postType, displayName) {
  try {
    const User = (await import("../models/User.js")).default;
    const actor = await User.findById(actorId).select("followers name").lean();
    if (!actor?.followers?.length) return;
    const name = displayName || actor.name || "Someone";
    const type = postType === "gram" ? "post" : postType === "reel" ? "post" : "post";
    const path =
      postType === "gram"
        ? "/powergram"
        : postType === "reel"
          ? "/powerreel"
          : "/powerfeed";
    const rows = actor.followers
      .map((fid) => String(fid))
      .filter((fid) => fid !== String(actorId))
      .map((userId) => ({
        userId,
        actorId: String(actorId),
        type,
        entityId: String(entityId),
        message: `${name} posted`,
        metadata: { path, postType },
      }));
    await createNotificationsBulk(rows);
  } catch (e) {
    logger.warn("[notifications] notifyFollowersNewContent:", e.message);
  }
}

/**
 * Notify station subscribers (Supabase station_subscriptions).
 */
export async function notifyStationSubscribers(stationSlug, actorId, type, entityId, message, metadata) {
  const sb = getSupabaseAdmin();
  if (!sb || !stationSlug) return;
  const { data: subs, error } = await sb
    .from("station_subscriptions")
    .select("user_id")
    .eq("station_slug", stationSlug);
  if (error || !subs?.length) return;
  const rows = subs
    .map((s) => String(s.user_id))
    .filter((uid) => uid && uid !== String(actorId || ""))
    .map((userId) => ({
      userId,
      actorId: actorId != null ? String(actorId) : null,
      type,
      entityId: entityId != null ? String(entityId) : null,
      message,
      metadata: metadata || {},
    }));
  await createNotificationsBulk(rows);
}
