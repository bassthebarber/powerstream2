// frontend/src/components/tv/tvUtils.js
// Shared utilities for TV stations

import { supabase } from '../../lib/supabaseClient.js';

// Storage bucket names
export const STORAGE_BUCKETS = {
  uploads: 'tv_uploads',
  thumbnails: 'tv_thumbs',
};

// Table names
export const TABLES = {
  videos: 'tv_videos',
  schedule: 'tv_schedule',
  votes: 'tv_votes',
};

// Fetch videos for a station
export const fetchStationVideos = async (stationSlug, options = {}) => {
  const { limit = 50, category = null, isLive = null, orderBy = 'created_at' } = options;

  let query = supabase
    .from(TABLES.videos)
    .select('*')
    .eq('station_slug', stationSlug)
    .order(orderBy, { ascending: false });

  if (category) {
    query = query.contains('tags', [category]);
  }

  if (isLive !== null) {
    query = query.eq('is_live', isLive);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// Fetch schedule for a station
export const fetchStationSchedule = async (stationSlug, dayOfWeek = null) => {
  let query = supabase
    .from(TABLES.schedule)
    .select('*')
    .eq('station_slug', stationSlug)
    .order('start_time', { ascending: true });

  if (dayOfWeek !== null) {
    query = query.eq('day_of_week', dayOfWeek);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// Upload video to storage
export const uploadVideoFile = async (file, stationSlug, userId, onProgress = null) => {
  const fileName = `${stationSlug}/${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.uploads)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.uploads)
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};

// Upload thumbnail
export const uploadThumbnail = async (file, stationSlug, userId) => {
  const fileName = `${stationSlug}/${userId}/${Date.now()}_thumb_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.thumbnails)
    .upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.thumbnails)
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};

// Create video record
export const createVideoRecord = async (videoData) => {
  const { data, error } = await supabase
    .from(TABLES.videos)
    .insert(videoData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Submit vote
export const submitVote = async (stationSlug, videoId, userId, voteValue) => {
  // Upsert vote (update if exists, insert if not)
  const { data, error } = await supabase
    .from(TABLES.votes)
    .upsert({
      station_slug: stationSlug,
      video_id: videoId,
      user_id: userId,
      vote_value: voteValue,
      created_at: new Date().toISOString(),
    }, {
      onConflict: 'station_slug,video_id,user_id',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get vote count for a video
export const getVoteCounts = async (videoId) => {
  const { data, error } = await supabase
    .from(TABLES.votes)
    .select('vote_value')
    .eq('video_id', videoId);

  if (error) throw error;

  const counts = (data || []).reduce((acc, v) => {
    acc.total += v.vote_value;
    acc.count += 1;
    return acc;
  }, { total: 0, count: 0 });

  return counts;
};

// Format duration
export const formatDuration = (seconds) => {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format view count
export const formatViews = (count) => {
  if (!count) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

// Format relative time
export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

// Get day name
export const getDayName = (dayNum) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNum] || '';
};

// Get current day of week (0-6)
export const getCurrentDay = () => new Date().getDay();

export default {
  fetchStationVideos,
  fetchStationSchedule,
  uploadVideoFile,
  uploadThumbnail,
  createVideoRecord,
  submitVote,
  getVoteCounts,
  formatDuration,
  formatViews,
  formatRelativeTime,
  getDayName,
  getCurrentDay,
  STORAGE_BUCKETS,
  TABLES,
};

