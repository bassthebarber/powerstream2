/**
 * Single entry for PowerStream Supabase reads/writes (5 tables only).
 */
import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { TABLES, POST_TYPE, isTimelinePostType } from '../config/supabaseSchema.js';

export function getAuthUserId(user) {
  const id = user?.id ?? user?._id ?? null;
  if (!id || String(id).trim() === '') {
    throw new Error('Authentication required');
  }
  return String(id);
}

function reactionsToLikesArray(reactions) {
  if (!reactions || typeof reactions !== 'object') return [];
  return Object.keys(reactions);
}

function likesArrayToReactions(likes) {
  const o = {};
  (likes || []).forEach((uid) => {
    if (uid) o[uid] = 'like';
  });
  return o;
}

export function rowToGramShape(row) {
  const likes = Array.isArray(row.likes)
    ? row.likes
    : reactionsToLikesArray(row.reactions);
  return {
    ...row,
    caption: row.caption ?? row.content ?? '',
    likes,
    comments: row.comments || [],
  };
}

export function rowToReelShape(row) {
  const likes = Array.isArray(row.likes)
    ? row.likes
    : reactionsToLikesArray(row.reactions);
  const meta = row.metadata || {};
  return {
    ...row,
    caption: row.caption ?? row.content ?? '',
    track_name: row.track_name ?? meta.track_name ?? 'Original Sound',
    likes,
    comments: row.comments || [],
    views: row.views ?? 0,
  };
}

export function rowToStoryShape(row) {
  return {
    id: row.id,
    user: { name: row.username || 'User' },
    hasNew: true,
    media_url: row.media_url,
    username: row.username,
    user_id: row.user_id,
    created_at: row.created_at,
  };
}

export async function fetchTimelinePosts({ page = 0, pageSize = 20 } = {}) {
  if (!isSupabaseConfigured()) return [];
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await supabase
    .from(TABLES.FEED_POSTS)
    .select('*')
    .or(
      'post_type.is.null,post_type.eq.feed,post_type.eq.post,post_type.eq.live_stream'
    )
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw error;
  return (data || []).filter((r) => isTimelinePostType(r.post_type));
}

export async function fetchActiveStories(limit = 20) {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from(TABLES.FEED_POSTS)
    .select('*')
    .eq('post_type', POST_TYPE.STORY)
    .order('created_at', { ascending: false })
    .limit(Math.min(limit * 2, 60));
  if (error) throw error;
  const now = Date.now();
  const active = (data || []).filter(
    (r) => !r.expires_at || new Date(r.expires_at).getTime() > now
  );
  return active.slice(0, limit).map(rowToStoryShape);
}

export async function fetchGramPosts(limit = 30) {
  const { data, error } = await supabase
    .from(TABLES.FEED_POSTS)
    .select('*')
    .eq('post_type', POST_TYPE.GRAM)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(rowToGramShape);
}

export async function fetchReelPosts(limit = 50) {
  const { data, error } = await supabase
    .from(TABLES.FEED_POSTS)
    .select('*')
    .eq('post_type', POST_TYPE.REEL)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(rowToReelShape);
}

export async function insertFeedPost(user, payload) {
  const user_id = getAuthUserId(user);
  const row = {
    user_id,
    username: user?.name || user?.displayName || 'User',
    post_type: payload.post_type || POST_TYPE.FEED,
    content: payload.content ?? null,
    media_url: payload.media_url ?? null,
    media_type: payload.media_type ?? null,
    reactions: payload.reactions ?? {},
    comments: payload.comments ?? [],
    views: payload.views ?? 0,
    station_slug: payload.station_slug ?? null,
    expires_at: payload.expires_at ?? null,
    ...(payload.tags != null && payload.tags.length >= 0
      ? { tags: payload.tags }
      : {}),
    ...(payload.track_name != null ? { track_name: payload.track_name } : {}),
    ...(payload.metadata != null ? { metadata: payload.metadata } : {}),
  };
  const { data, error } = await supabase
    .from(TABLES.FEED_POSTS)
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateFeedPost(postId, patch) {
  const { error } = await supabase
    .from(TABLES.FEED_POSTS)
    .update(patch)
    .eq('id', postId);
  if (error) throw error;
}

export async function fetchProfileRow(profileId) {
  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .select('*')
    .eq('id', profileId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Profile row linked to Express/Mongo user id (column app_user_id in Supabase). */
export async function fetchProfileByAppUserId(appUserId) {
  if (!appUserId || !isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .select('*')
    .eq('app_user_id', String(appUserId))
    .maybeSingle();
  if (error) return null;
  return data;
}

/**
 * Live rail: live_stream posts + stations that are is_live (single source for feed sidebar).
 */
export async function fetchLiveNowForFeed() {
  if (!isSupabaseConfigured()) return [];
  const [streams, stationsLive] = await Promise.all([
    supabase
      .from(TABLES.FEED_POSTS)
      .select('id,username,views,station_slug,created_at,media_url')
      .eq('post_type', POST_TYPE.LIVE_STREAM)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from(TABLES.STATIONS)
      .select('slug,name,viewer_count,is_live')
      .eq('is_live', true)
      .limit(8),
  ]);

  const seen = new Set();
  const out = [];

  for (const p of streams.data || []) {
    const key = p.station_slug ? `slug:${p.station_slug}` : `post:${p.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      _id: p.id,
      name: p.username || 'Live',
      viewers: p.views || 0,
      avatarUrl: null,
      href: p.station_slug ? `/tv/${p.station_slug}/channel` : "/feed",
    });
  }
  for (const s of stationsLive.data || []) {
    const key = `slug:${s.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      _id: `st-${s.slug}`,
      name: s.name,
      viewers: s.viewer_count || 0,
      avatarUrl: null,
      href: `/tv/${s.slug}/channel`,
    });
  }
  return out;
}

/**
 * Realtime: new timeline rows (including live_stream) appear without refresh.
 * Enable Replication for feed_posts in Supabase → Database → Publications.
 */
export function subscribeTimelineFeedChanges(onInsert) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('powerstream_timeline_feed')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: TABLES.FEED_POSTS },
      (payload) => {
        const row = payload.new;
        if (!row) return;
        if (
          row.post_type === POST_TYPE.LIVE_STREAM ||
          isTimelinePostType(row.post_type)
        ) {
          onInsert(row);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Connectivity + read tests. Optional deepWrites: feed insert/delete + subscription row (dev only).
 */
export async function verifyPowerstreamCore(user, { deepWrites = false } = {}) {
  const result = {
    configured: isSupabaseConfigured(),
    connected: false,
    latencyMs: null,
    supabaseAuthSession: false,
    apiUserPresent: !!(user?.id || user?._id),
    tests: {},
  };

  if (!result.configured) {
    result.tests.note = 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY';
    return result;
  }

  const t0 = Date.now();
  const { error: eFeed } = await supabase
    .from(TABLES.FEED_POSTS)
    .select('id')
    .limit(1);
  result.connected = !eFeed;
  result.latencyMs = Date.now() - t0;
  result.tests.feed_posts_read = eFeed ? eFeed.message : 'ok';

  const { error: eProf } = await supabase.from(TABLES.PROFILES).select('id').limit(1);
  result.tests.profiles_read = eProf ? eProf.message : 'ok';

  const { error: eSub } = await supabase
    .from(TABLES.STATION_SUBSCRIPTIONS)
    .select('id')
    .limit(1);
  result.tests.station_subscriptions_read = eSub ? eSub.message : 'ok';

  const { data: { session } } = await supabase.auth.getSession();
  result.supabaseAuthSession = !!session;
  result.tests.note_auth =
    'PowerStream posts use API user id; Supabase Auth session is optional unless you use RLS with JWT.';

  if (deepWrites && user) {
    try {
      const row = await insertFeedPost(user, {
        post_type: POST_TYPE.FEED,
        content: '__powerstream_verify__',
      });
      await supabase.from(TABLES.FEED_POSTS).delete().eq('id', row.id);
      result.tests.feed_posts_insert_delete = 'ok';
    } catch (e) {
      result.tests.feed_posts_insert_delete = String(e?.message || e);
    }
    try {
      const slug = '__ps_verify__';
      await setStationSubscription(user, slug, true);
      await supabase
        .from(TABLES.STATION_SUBSCRIPTIONS)
        .delete()
        .eq('user_id', getAuthUserId(user))
        .eq('station_slug', slug);
      result.tests.station_subscriptions_insert_delete = 'ok';
    } catch (e) {
      result.tests.station_subscriptions_insert_delete = String(e?.message || e);
    }
  }

  if (user) {
    const appId = String(user._id || user.id || '');
    if (appId) {
      const prow = await fetchProfileByAppUserId(appId);
      result.tests.profile_fetch_app_user_id = prow ? 'row found' : 'no row (add app_user_id in profiles)';
    }
  }

  return result;
}

export async function fetchUserFeedPostsByTypes(userId, types, limit = 30) {
  const { data, error } = await supabase
    .from(TABLES.FEED_POSTS)
    .select('*')
    .eq('user_id', userId)
    .in('post_type', types)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchLineMessages(threadId, limit = 100) {
  const { data, error } = await supabase
    .from(TABLES.LINE_MESSAGES)
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function insertLineMessage(user, { threadId, body }) {
  const sender_id = getAuthUserId(user);
  const { data, error } = await supabase
    .from(TABLES.LINE_MESSAGES)
    .insert({
      thread_id: threadId,
      sender_id,
      body: String(body || '').trim(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function isSubscribedToStation(user, stationSlug) {
  if (!user || !stationSlug) return false;
  let uid;
  try {
    uid = getAuthUserId(user);
  } catch {
    return false;
  }
  const { data, error } = await supabase
    .from(TABLES.STATION_SUBSCRIPTIONS)
    .select('id')
    .eq('user_id', uid)
    .eq('station_slug', stationSlug)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export async function setStationSubscription(user, stationSlug, subscribed) {
  const uid = getAuthUserId(user);
  if (subscribed) {
    const { error } = await supabase.from(TABLES.STATION_SUBSCRIPTIONS).insert({
      user_id: uid,
      station_slug: stationSlug,
    });
    if (error && error.code !== '23505') throw error;
  } else {
    const { error } = await supabase
      .from(TABLES.STATION_SUBSCRIPTIONS)
      .delete()
      .eq('user_id', uid)
      .eq('station_slug', stationSlug);
    if (error) throw error;
  }
}

export async function countStationSubscribers(stationSlug) {
  const { count, error } = await supabase
    .from(TABLES.STATION_SUBSCRIPTIONS)
    .select('*', { count: 'exact', head: true })
    .eq('station_slug', stationSlug);
  if (error) return 0;
  return count || 0;
}

export { likesArrayToReactions, reactionsToLikesArray, TABLES, POST_TYPE };
