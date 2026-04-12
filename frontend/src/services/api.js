import api, {
  fetchFeed,
  createFeedPost,
  likeFeedPost,
  createFeedComment,
  fetchStories,
  createStory,
  fetchGrams,
  uploadGram,
  likeGramPost,
  createGramComment,
  fetchReels,
  createReel,
  likeReelPost,
  createReelComment,
} from "../lib/api.js";

export const API_BASE_URL = "http://104.248.73.68:5001/api";

export async function getFeed(params = {}) {
  const data = await fetchFeed(params);
  return data?.posts || data?.data || [];
}

export async function postFeed(payload) {
  const data = await createFeedPost(payload);
  return data?.post || data?.data || null;
}

export async function likeFeed(id) {
  return likeFeedPost(id);
}

export async function commentFeed(id, content) {
  return createFeedComment(id, { content });
}

export async function getStories() {
  const data = await fetchStories();
  return data?.stories || data?.data || [];
}

export async function postStory(payload) {
  return createStory(payload);
}

export async function getGrams() {
  const data = await api.get("/gram");
  return data.data?.grams || data.data?.data || [];
}

export async function postGram(payload) {
  const data = await api.post("/gram", payload);
  return data.data?.gram || data.data?.data || null;
}

export async function likeGram(id) {
  return likeGramPost(id);
}

export async function commentGram(id, content) {
  return createGramComment(id, { content });
}

export async function getReels() {
  const data = await api.get("/reels");
  return data.data?.reels || data.data?.data || [];
}

export async function postReel(payload) {
  const data = await createReel(payload);
  return data?.reel || data?.data || null;
}

export async function likeReel(id) {
  return likeReelPost(id);
}

export async function commentReel(id, content) {
  return createReelComment(id, { content });
}

export async function getUsers(limit = 50) {
  const res = await api.get(`/users?limit=${limit}`);
  return res.data?.users || [];
}

export async function getStations() {
  const res = await api.get("/stations");
  return res.data?.stations || res.data?.data || [];
}

export default api;
