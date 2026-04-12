// frontend/src/lib/studioApi.js
// Studio API Client - Unified client for all /api/studio/* endpoints
// Uses the MAIN backend server (not the standalone Recording Studio server)

import { getToken } from "../utils/auth.js";
import { API_BASE_URL } from "../config/apiConfig.js";

/** Main backend /api + /studio */
const STUDIO_API = `${API_BASE_URL.replace(/\/+$/, "")}/studio`;

// Helper to handle JSON/fetch errors
async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// Get auth headers
function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ============================================
// HEALTH & STATUS
// ============================================

export async function checkStudioHealth() {
  try {
    const res = await fetch(`${STUDIO_API}/health`);
    const data = await res.json().catch(() => ({}));
    const ok = res.ok;
    const online =
      ok &&
      (data.status === "ok" ||
        data.online === true ||
        data.ok === true ||
        (typeof data === "object" && !("error" in data && data.error)));
    return { ok, online: !!online, ...data };
  } catch (err) {
    return { ok: false, online: false, error: err.message };
  }
}

// ============================================
// LIBRARY
// ============================================

export async function getLibraryItems(type, limit = 50) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (type) params.append("type", type);
  return handle(fetch(`${STUDIO_API}/library/all?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function getRecordings(limit = 50) {
  return handle(fetch(`${STUDIO_API}/library/recordings?limit=${limit}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function getMixes(limit = 50) {
  return handle(fetch(`${STUDIO_API}/library/mixes?limit=${limit}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function getLibraryStats() {
  return handle(fetch(`${STUDIO_API}/library/stats`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// ============================================
// BEATS
// ============================================

export async function getBeats(options = {}) {
  const params = new URLSearchParams();
  if (options.genre) params.append("genre", options.genre);
  if (options.mood) params.append("mood", options.mood);
  if (options.bpmMin) params.append("bpmMin", String(options.bpmMin));
  if (options.bpmMax) params.append("bpmMax", String(options.bpmMax));
  if (options.limit) params.append("limit", String(options.limit));
  if (options.search) params.append("search", options.search);
  
  return handle(fetch(`${STUDIO_API}/beats?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function getBeatById(id) {
  return handle(fetch(`${STUDIO_API}/beats/${id}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function useBeatForRecording(id) {
  return handle(fetch(`${STUDIO_API}/beats/${id}/use`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function saveBeat(beatData) {
  return handle(fetch(`${STUDIO_API}/beats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(beatData),
  }));
}

// ============================================
// AI BEAT GENERATION
// ============================================

export async function generateBeat(options = {}) {
  return handle(fetch(`${STUDIO_API}/ai/generate-beat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(options),
  }));
}

export async function getBeatGenerationOptions() {
  return handle(fetch(`${STUDIO_API}/ai/options`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function generateBeatWithPreset(presetName, options = {}) {
  return handle(fetch(`${STUDIO_API}/ai/preset/${presetName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(options),
  }));
}

// ============================================
// RECORDING
// ============================================

export async function startRecordingSession(options = {}) {
  return handle(fetch(`${STUDIO_API}/record/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(options),
  }));
}

export async function stopRecordingSession(sessionId) {
  return handle(fetch(`${STUDIO_API}/record/stop`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ sessionId }),
  }));
}

export async function uploadRecording(file, sessionId, takeNumber, title) {
  const formData = new FormData();
  formData.append("file", file);
  if (sessionId) formData.append("sessionId", sessionId);
  if (takeNumber) formData.append("takeNumber", String(takeNumber));
  if (title) formData.append("title", title);
  
  return handle(fetch(`${STUDIO_API}/record/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: formData,
  }));
}

export async function getRecordingSessions(limit = 20) {
  return handle(fetch(`${STUDIO_API}/record?limit=${limit}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function getRecordingSession(sessionId) {
  return handle(fetch(`${STUDIO_API}/record/${sessionId}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// ============================================
// UPLOAD
// ============================================

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  return handle(fetch(`${STUDIO_API}/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: formData,
  }));
}

export async function uploadMultipleFiles(files) {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  
  return handle(fetch(`${STUDIO_API}/upload/multiple`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: formData,
  }));
}

// ============================================
// MIX ENGINE
// ============================================

export async function applyMix(audioUrlOrOpts, settings, projectName) {
  const isOptsObject =
    audioUrlOrOpts &&
    typeof audioUrlOrOpts === "object" &&
    typeof audioUrlOrOpts !== "string" &&
    !Array.isArray(audioUrlOrOpts);
  const body = isOptsObject
    ? audioUrlOrOpts
    : { audioUrl: audioUrlOrOpts, settings, projectName };
  return handle(
    fetch(`${STUDIO_API}/mix/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(body),
    })
  );
}

export async function combineVocalAndBeat(vocalUrl, beatUrl, options = {}) {
  return handle(fetch(`${STUDIO_API}/mix/combine`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ vocalUrl, beatUrl, ...options }),
  }));
}

export async function getAIMixRecipe(genre, mood) {
  return handle(fetch(`${STUDIO_API}/mix/ai-recipe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ genre, mood }),
  }));
}

export async function getMixList(limit = 20) {
  return handle(fetch(`${STUDIO_API}/mix/list?limit=${limit}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// ============================================
// MASTERING
// ============================================

export async function applyMaster(audioUrl, preset = "streaming", settings = {}) {
  return handle(fetch(`${STUDIO_API}/master/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ audioUrl, preset, settings }),
  }));
}

export async function getMasteringPresets() {
  return handle(fetch(`${STUDIO_API}/master/presets`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function masterRecording(recordingId, preset = "streaming") {
  return handle(fetch(`${STUDIO_API}/master/recording`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ recordingId, preset }),
  }));
}

// ============================================
// SESSIONS
// ============================================

export async function saveSession(sessionData) {
  return handle(fetch(`${STUDIO_API}/session/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(sessionData),
  }));
}

export async function loadSession(sessionId) {
  return handle(fetch(`${STUDIO_API}/session/${sessionId}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function listSessions(typeOrOpts, limit = 50) {
  let type = null;
  let lim = limit;
  if (typeOrOpts && typeof typeOrOpts === "object" && !Array.isArray(typeOrOpts)) {
    type = typeOrOpts.type ?? null;
    lim = typeOrOpts.limit != null ? typeOrOpts.limit : limit;
  } else if (typeOrOpts !== undefined && typeOrOpts !== null) {
    type = typeOrOpts;
    lim = limit;
  }
  const params = new URLSearchParams({ limit: String(lim) });
  if (type) params.append("type", type);
  return handle(
    fetch(`${STUDIO_API}/session?${params}`, {
      credentials: "include",
      headers: getAuthHeaders(),
    })
  );
}

// ============================================
// LIVE ROOM
// ============================================

export async function createLiveRoom(options = {}) {
  return handle(fetch(`${STUDIO_API}/live-room/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(options),
  }));
}

export async function joinLiveRoom(roomCode) {
  return handle(fetch(`${STUDIO_API}/live-room/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ roomCode }),
  }));
}

export async function getLiveRoom(sessionId) {
  return handle(fetch(`${STUDIO_API}/live-room/${sessionId}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function getLiveRooms(status, limit = 20) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (status) params.append("status", status);
  return handle(fetch(`${STUDIO_API}/live-room?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// ============================================
// JOBS & CONTRACTS
// ============================================

export async function getJobPricing() {
  return handle(fetch(`${STUDIO_API}/jobs/pricing`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function createJob(jobData) {
  return handle(fetch(`${STUDIO_API}/jobs/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(jobData),
  }));
}

export async function getMyJobs(options = {}) {
  const params = new URLSearchParams();
  if (options.status) params.append("status", options.status);
  if (options.type) params.append("type", options.type);
  if (options.limit) params.append("limit", String(options.limit));
  return handle(fetch(`${STUDIO_API}/jobs/my-jobs?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function getOpenJobs(options = {}) {
  const params = new URLSearchParams();
  if (options.type) params.append("type", options.type);
  if (options.limit) params.append("limit", String(options.limit));
  return handle(fetch(`${STUDIO_API}/jobs/open?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// ============================================
// ROYALTIES
// ============================================

export async function getRoyalties() {
  return handle(fetch(`${STUDIO_API}/royalties`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function createRoyaltySplit(splitData) {
  return handle(fetch(`${STUDIO_API}/royalties`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(splitData),
  }));
}

// ============================================
// TV EXPORT
// ============================================

export async function createTVExport(exportData) {
  return handle(fetch(`${STUDIO_API}/tv/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(exportData),
  }));
}

export async function getTVExports(options = {}) {
  const params = new URLSearchParams();
  if (options.status) params.append("status", options.status);
  if (options.station) params.append("station", options.station);
  if (options.limit) params.append("limit", String(options.limit));
  return handle(fetch(`${STUDIO_API}/tv/exports?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function getTVStations() {
  return handle(fetch(`${STUDIO_API}/tv/stations`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// ============================================
// VOICE CLONE
// ============================================

export async function createVoiceProfile(profileData) {
  return handle(fetch(`${STUDIO_API}/voice/create-profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(profileData),
  }));
}

export async function getMyVoiceProfile() {
  return handle(fetch(`${STUDIO_API}/voice/my-profile`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

export async function synthesizeVoice(options) {
  return handle(fetch(`${STUDIO_API}/voice/synthesize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(options),
  }));
}

// ============================================
// DASHBOARD
// ============================================

export async function getStudioSummary() {
  return handle(fetch(`${STUDIO_API}/dashboard/summary`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}


// ============================================
// MAIN API + EXPORT EMAIL (StudioExportPage)
// ============================================

export async function checkMainApiHealth() {
  try {
    const res = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}/health`);
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

export async function checkAllStudioHealth() {
  const [mainApi, studio] = await Promise.all([checkMainApiHealth(), checkStudioHealth()]);
  return {
    mainApi,
    studio,
    fullyOperational: !!(mainApi.ok && studio.ok && studio.online),
  };
}

export async function exportProject(payload) {
  try {
    const res = await fetch(`${STUDIO_API}/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.message || data.error || String(res.status), ...data };
    }
    return { success: true, ...data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function sendExportEmail(data) {
  try {
    const res = await fetch(`${STUDIO_API}/export/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: out.message || out.error || String(res.status), ...out };
    }
    return { success: true, ...out };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function startRecording(options = {}) {
  const r = await startRecordingSession(options);
  return {
    ok: r?.ok !== false && r?.success !== false,
    sessionId: r?.sessionId || r?.id || r?.session?.id,
    ...r,
  };
}

export async function stopRecording(sessionId) {
  const r = await stopRecordingSession(sessionId);
  return {
    ok: r?.ok !== false && r?.success !== false,
    audioUrl: r?.audioUrl || r?.url || r?.recordingUrl,
    ...r,
  };
}

export async function applyMastering(body) {
  return handle(
    fetch(`${STUDIO_API}/master/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(body),
    })
  );
}

export async function getLastSession() {
  try {
    const r = await listSessions({ limit: 1 });
    const sessions = r?.sessions || r?.items || [];
    if (sessions.length) return { ok: true, session: sessions[0] };
    return { ok: false, code: "NO_SESSIONS", message: "No previous sessions" };
  } catch (e) {
    return { ok: false, message: e.message };
  }
}

export async function generateLyrics(payload) {
  return handle(
    fetch(`${STUDIO_API}/ai/lyrics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })
  );
}

export async function renderLoop(payload) {
  return handle(
    fetch(`${STUDIO_API}/beats/render-loop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })
  );
}

export async function evolveLoop(payload) {
  return handle(
    fetch(`${STUDIO_API}/beats/evolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })
  );
}

export async function saveRoyaltySplits(payload) {
  return createRoyaltySplit(payload);
}

export async function getRoyaltyStatements(options = {}) {
  try {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", String(options.limit));
    return handle(
      fetch(`${STUDIO_API}/royalties/statements?${params}`, {
        credentials: "include",
        headers: getAuthHeaders(),
      })
    );
  } catch {
    return { ok: true, statements: [] };
  }
}

// ============================================
// DAW / assets aliases (StudioDAW → api/studioApi re-exports)
// ============================================

export async function listAssets() {
  return handle(
    fetch(`${STUDIO_API}/assets`, {
      credentials: "include",
      headers: getAuthHeaders(),
    })
  );
}

export async function uploadToStudio(file, meta = {}) {
  const fd = new FormData();
  fd.append("file", file);
  Object.entries(meta).forEach(([k, v]) => fd.append(k, v));
  return handle(
    fetch(`${STUDIO_API}/upload`, {
      method: "POST",
      body: fd,
      credentials: "include",
      headers: getAuthHeaders(),
    })
  );
}

export async function aiMix(trackId, options = {}) {
  return handle(
    fetch(`${STUDIO_API}/mix/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({ trackId, ...options }),
    })
  );
}

export async function aiMaster(trackId, options = {}) {
  return handle(
    fetch(`${STUDIO_API}/master/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({ trackId, ...options }),
    })
  );
}

export async function requestExport(trackId, format = "wav") {
  return handle(
    fetch(`${STUDIO_API}/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({ trackId, format }),
    })
  );
}

export async function deleteAsset(id) {
  return handle(
    fetch(`${STUDIO_API}/assets/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
      headers: getAuthHeaders(),
    })
  );
}

// ============================================
// LEGACY ALIASES (for backward compatibility)
// ============================================

// Alias for getLibraryItems - used by StudioLibraryPage
export async function getLibrary(options = {}) {
  const params = new URLSearchParams();
  if (options.type) params.append("type", options.type);
  if (options.limit) params.append("limit", String(options.limit));
  return handle(fetch(`${STUDIO_API}/library/all?${params}`, {
    credentials: "include",
    headers: getAuthHeaders(),
  }));
}

// Alias for getAIMixRecipe - used by StudioMixPage
export async function getAIRecipe(options = {}) {
  return handle(fetch(`${STUDIO_API}/mix/ai-recipe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(options),
  }));
}

// Export default object for convenience
export default {
  checkStudioHealth,
  checkMainApiHealth,
  checkAllStudioHealth,
  exportProject,
  sendExportEmail,
  startRecording,
  stopRecording,
  applyMastering,
  getLastSession,
  generateLyrics,
  renderLoop,
  evolveLoop,
  saveRoyaltySplits,
  getRoyaltyStatements,
  listAssets,
  uploadToStudio,
  deleteAsset,
  aiMix,
  aiMaster,
  requestExport,
  getLibraryItems,
  getRecordings,
  getMixes,
  getLibraryStats,
  getBeats,
  getBeatById,
  useBeatForRecording,
  saveBeat,
  generateBeat,
  getBeatGenerationOptions,
  generateBeatWithPreset,
  startRecordingSession,
  stopRecordingSession,
  uploadRecording,
  getRecordingSessions,
  getRecordingSession,
  uploadFile,
  uploadMultipleFiles,
  applyMix,
  combineVocalAndBeat,
  getAIMixRecipe,
  getMixList,
  applyMaster,
  getMasteringPresets,
  masterRecording,
  saveSession,
  loadSession,
  listSessions,
  createLiveRoom,
  joinLiveRoom,
  getLiveRoom,
  getLiveRooms,
  getJobPricing,
  createJob,
  getMyJobs,
  getOpenJobs,
  getRoyalties,
  createRoyaltySplit,
  createTVExport,
  getTVExports,
  getTVStations,
  createVoiceProfile,
  getMyVoiceProfile,
  synthesizeVoice,
  getStudioSummary,
  // Legacy aliases
  getLibrary,
  getAIRecipe,
};
