import { getToken } from "../utils/auth.js";

const API = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:8080";

function headers() {
  const h = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export async function fetchLiveEngineStatus(slug) {
  const r = await fetch(`${API}/api/live-engine/stations/${encodeURIComponent(slug)}/status`);
  return r.json();
}

export async function claimStation(slug, name) {
  const r = await fetch(`${API}/api/live-engine/stations/${encodeURIComponent(slug)}/claim`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ name: name || slug }),
  });
  return r.json();
}

export async function fetchIngestCredentials(slug) {
  const r = await fetch(`${API}/api/live-engine/stations/${encodeURIComponent(slug)}/ingest`, {
    headers: headers(),
  });
  return r.json();
}

export async function regenerateStreamKey(slug) {
  const r = await fetch(`${API}/api/live-engine/stations/${encodeURIComponent(slug)}/regenerate-key`, {
    method: "POST",
    headers: headers(),
  });
  return r.json();
}

export async function updateLiveMeta(slug, { title, thumbnailUrl }) {
  const r = await fetch(`${API}/api/live-engine/stations/${encodeURIComponent(slug)}/live-meta`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ title, thumbnailUrl }),
  });
  return r.json();
}

export async function pingLiveViewer(slug, sessionId) {
  const r = await fetch(`${API}/api/live-engine/stations/${encodeURIComponent(slug)}/viewers/ping`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ sessionId }),
  });
  return r.json();
}

export async function sendTip(slug, amountCents) {
  const r = await fetch(`${API}/api/live-engine/stations/${encodeURIComponent(slug)}/tip`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ amountCents }),
  });
  return r.json();
}

export async function recordSubscribeLedger(slug, amountCents = 0) {
  const r = await fetch(`${API}/api/live-engine/stations/${encodeURIComponent(slug)}/subscribe-ledger`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ amountCents }),
  });
  return r.json();
}
