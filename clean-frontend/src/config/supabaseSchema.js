/**
 * PowerStream — allowed Supabase tables (frontend contract).
 * Do not add legacy table names here.
 */
export const TABLES = {
  FEED_POSTS: 'feed_posts',
  PROFILES: 'profiles',
  STATIONS: 'stations',
  STATION_SUBSCRIPTIONS: 'station_subscriptions',
  LINE_MESSAGES: 'line_messages',
};

/** post_type values stored in feed_posts */
export const POST_TYPE = {
  FEED: 'feed',
  GRAM: 'gram',
  REEL: 'reel',
  STORY: 'story',
  LIVE_STREAM: 'live_stream',
  STATION_VOD: 'station_vod',
};

/** Timeline excludes gram/reel/story/station_vod */
export const TIMELINE_POST_TYPES = [
  POST_TYPE.FEED,
  'post',
  POST_TYPE.LIVE_STREAM,
];

export function isTimelinePostType(t) {
  if (t == null || t === '' || t === POST_TYPE.FEED || t === 'post') return true;
  if (t === POST_TYPE.LIVE_STREAM) return true;
  return false;
}
