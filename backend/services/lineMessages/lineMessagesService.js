/**
 * PowerLine — Supabase line_messages + profiles only (no Mongo for messaging).
 */
import { getSupabaseAdmin } from "../../src/services/supabaseAdmin.js";

const HEX24 = /^[a-f0-9]{24}$/i;

export function buildDmThreadId(userIdA, userIdB) {
  const [a, b] = [String(userIdA), String(userIdB)].sort();
  return `dm_${a}_${b}`;
}

function parseThreadParticipants(threadId) {
  if (!threadId || !threadId.startsWith("dm_")) return null;
  const rest = threadId.slice(3);
  const parts = rest.split("_");
  if (parts.length !== 2) return null;
  return parts;
}

export function isLineMessengerEnabled() {
  return !!getSupabaseAdmin();
}

/** Resolve display names via profiles.external_user_id (see migration SQL). */
async function profilesByExternalIds(externalIds) {
  const sb = getSupabaseAdmin();
  const map = new Map();
  const ids = [...new Set(externalIds.filter(Boolean))];
  if (!sb || !ids.length) return map;
  try {
    const { data, error } = await sb
      .from("profiles")
      .select("external_user_id, display_name, avatar_url")
      .in("external_user_id", ids);
    if (error) return map;
    for (const row of data || []) {
      if (row.external_user_id) {
        map.set(String(row.external_user_id), {
          name: row.display_name || "Member",
          avatarUrl: row.avatar_url || null,
        });
      }
    }
  } catch {
    /* column external_user_id may not exist yet */
  }
  return map;
}

export async function listThreadsForUser(userId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const uid = String(userId);
  const { data: rows, error } = await supabase
    .from("line_messages")
    .select("thread_id, sender_id, body, created_at")
    .or(`thread_id.like.dm_${uid}_%,thread_id.like.dm_%_${uid}`)
    .order("created_at", { ascending: false })
    .limit(800);

  if (error) throw error;

  const threadLast = new Map();
  for (const row of rows || []) {
    const parts = parseThreadParticipants(row.thread_id);
    if (!parts || !parts.includes(uid)) continue;
    if (!parts.every((p) => HEX24.test(p))) continue;
    if (!threadLast.has(row.thread_id)) {
      threadLast.set(row.thread_id, row);
    }
  }

  const otherIds = [...threadLast.keys()].map((tid) => {
    const p = parseThreadParticipants(tid);
    return p.find((id) => id !== uid);
  });

  const profileMap = await profilesByExternalIds(otherIds);

  const threads = [];
  for (const [threadId, last] of threadLast) {
    const parts = parseThreadParticipants(threadId);
    const otherId = parts.find((id) => id !== uid);
    const prof = profileMap.get(otherId) || {
      name: `Member ··${(otherId || "").slice(-4)}`,
      avatarUrl: null,
    };

    threads.push({
      _id: threadId,
      id: threadId,
      threadId,
      title: prof.name,
      participants: [
        { _id: uid, name: "You", avatarUrl: null },
        { _id: otherId, name: prof.name, email: "", avatarUrl: prof.avatarUrl },
      ],
      lastMessage: {
        text: last.body,
        createdAt: last.created_at,
        sender: last.sender_id,
      },
      unreadCount: 0,
      source: "line_messages",
    });
  }

  threads.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
  return threads;
}

export async function listMessages(threadId, userId, { limit = 100 } = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const uid = String(userId);
  const parts = parseThreadParticipants(threadId);
  if (!parts || !parts.includes(uid)) {
    const err = new Error("Not a participant");
    err.status = 403;
    throw err;
  }

  const { data: rows, error } = await supabase
    .from("line_messages")
    .select("id, thread_id, sender_id, body, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(parseInt(limit, 10));

  if (error) throw error;

  const senderIds = [...new Set((rows || []).map((r) => r.sender_id))];
  const profileMap = await profilesByExternalIds(senderIds);

  return (rows || []).map((row) => {
    const prof = profileMap.get(String(row.sender_id)) || {
      name: "Member",
      avatarUrl: null,
    };
    return {
      id: row.id,
      _id: row.id,
      threadId: row.thread_id,
      text: row.body,
      body: row.body,
      fromSelf: String(row.sender_id) === uid,
      sender: {
        _id: row.sender_id,
        id: row.sender_id,
        name: prof.name,
        avatarUrl: prof.avatarUrl,
      },
      createdAt: row.created_at,
    };
  });
}

export async function sendLineMessage(threadId, senderId, body) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const trimmed = (body || "").trim();
  if (!trimmed) {
    const err = new Error("Message required");
    err.status = 400;
    throw err;
  }

  const uid = String(senderId);
  const parts = parseThreadParticipants(threadId);
  if (!parts || !parts.includes(uid)) {
    const err = new Error("Not a participant");
    err.status = 403;
    throw err;
  }

  const { data, error } = await supabase
    .from("line_messages")
    .insert({
      thread_id: threadId,
      sender_id: uid,
      body: trimmed,
    })
    .select("id, thread_id, sender_id, body, created_at")
    .single();

  if (error) throw error;

  const receiverId = parts.find((p) => String(p) !== uid);
  if (receiverId) {
    try {
      const { createNotification } = await import("../notificationService.js");
      const preview = trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed;
      await createNotification({
        userId: String(receiverId),
        actorId: uid,
        type: "dm",
        entityId: threadId,
        message: preview,
        metadata: { path: "/powerline", threadId },
      });
    } catch {
      /* ignore */
    }
  }

  const profileMap = await profilesByExternalIds([uid]);
  const prof = profileMap.get(uid) || { name: "You", avatarUrl: null };

  return {
    id: data.id,
    _id: data.id,
    threadId: data.thread_id,
    text: data.body,
    body: data.body,
    fromSelf: true,
    sender: {
      _id: uid,
      name: prof.name,
      avatarUrl: prof.avatarUrl,
    },
    createdAt: data.created_at,
  };
}

export async function ensureDmThread(currentUserId, otherUserId) {
  const oid = String(otherUserId || "").trim();
  if (!HEX24.test(oid)) {
    const err = new Error("otherUserId must be a 24-char app user id");
    err.status = 400;
    throw err;
  }
  if (oid === String(currentUserId)) {
    const err = new Error("Cannot DM yourself");
    err.status = 400;
    throw err;
  }

  const profileMap = await profilesByExternalIds([oid]);
  const prof = profileMap.get(oid) || {
    name: `Member ··${oid.slice(-4)}`,
    avatarUrl: null,
  };

  const threadId = buildDmThreadId(currentUserId, oid);
  return {
    threadId,
    other: {
      _id: oid,
      name: prof.name,
      email: "",
      avatarUrl: prof.avatarUrl,
    },
  };
}
