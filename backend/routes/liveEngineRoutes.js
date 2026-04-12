// PowerStream Live Engine API — stream keys, status, viewers, tips
import express from "express";
import { requireAuth, authOptional } from "../middleware/requireAuth.js";
import {
  claimStation,
  getOwnerIngestCredentials,
  regenerateStreamKey,
  updateLiveMeta,
  getStationLiveStatus,
  pingViewer,
  syncViewerCountToSupabase,
  recordTip,
  recordSubscriptionPayment,
  refreshStreamKeyCache,
  isSupabaseLiveEngineEnabled,
} from "../src/services/liveEngineService.js";
const router = express.Router();

const userId = (req) => String(req.user?.id || req.user?._id || "");

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    supabase: isSupabaseLiveEngineEnabled(),
    service: "live-engine",
  });
});

/** Public: live status for station page */
router.get("/stations/:slug/status", async (req, res) => {
  try {
    const status = await getStationLiveStatus(req.params.slug);
    res.json(status);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/** Claim station (first authenticated user). Required before ingest. */
router.post("/stations/:slug/claim", requireAuth, async (req, res) => {
  try {
    if (!isSupabaseLiveEngineEnabled()) {
      return res.status(503).json({ ok: false, error: "Live engine not configured" });
    }
    await claimStation(req.params.slug, userId(req), {
      name: req.body.name || req.params.slug,
    });
    res.json({ ok: true });
  } catch (e) {
    if (e.code === "OWNER_CONFLICT") {
      return res.status(403).json({ ok: false, error: e.message });
    }
    res.status(500).json({ ok: false, error: e.message });
  }
});

/** Owner only: RTMP server URL + stream key */
router.get("/stations/:slug/ingest", requireAuth, async (req, res) => {
  try {
    if (!isSupabaseLiveEngineEnabled()) {
      return res.status(503).json({ ok: false, error: "Live engine not configured" });
    }
    const creds = await getOwnerIngestCredentials(req.params.slug, userId(req));
    res.json({
      ok: true,
      ...creds,
      instructions: "OBS: Server = rtmpServerUrl, Stream Key = streamKey",
    });
  } catch (e) {
    const code = e.code === "FORBIDDEN" ? 403 : 500;
    res.status(code).json({ ok: false, error: e.message });
  }
});

router.post("/stations/:slug/regenerate-key", requireAuth, async (req, res) => {
  try {
    const creds = await regenerateStreamKey(req.params.slug, userId(req));
    await refreshStreamKeyCache();
    res.json({ ok: true, ...creds });
  } catch (e) {
    const code = e.code === "FORBIDDEN" ? 403 : 500;
    res.status(code).json({ ok: false, error: e.message });
  }
});

router.patch("/stations/:slug/live-meta", requireAuth, async (req, res) => {
  try {
    await updateLiveMeta(req.params.slug, userId(req), {
      title: req.body.title,
      thumbnailUrl: req.body.thumbnailUrl,
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(e.message === "Not authorized" ? 403 : 500).json({ ok: false, error: e.message });
  }
});

/** Viewer heartbeat — call every ~20s while watching live */
router.post("/stations/:slug/viewers/ping", authOptional, async (req, res) => {
  try {
    const sessionId =
      req.body.sessionId ||
      req.headers["x-session-id"] ||
      `anon-${req.ip}-${Date.now()}`;
    const count = pingViewer(req.params.slug, String(sessionId));
    if (Math.random() < 0.15) {
      await syncViewerCountToSupabase(req.params.slug);
    }
    res.json({ ok: true, viewerCount: count });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.post("/stations/:slug/tip", requireAuth, async (req, res) => {
  try {
    const amount = Math.max(0, Math.min(50000, Number(req.body.amountCents) || 0));
    if (amount < 50) {
      return res.status(400).json({ ok: false, error: "Minimum tip 50 cents" });
    }
    const row = await recordTip({
      fromUserId: userId(req),
      stationSlug: req.params.slug,
      amountCents: amount,
      currency: req.body.currency || "usd",
    });
    res.json({ ok: true, paymentId: row.id });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/** Paid subscribe ledger row (actual subscription still via Supabase station_subscriptions on client) */
router.post("/stations/:slug/subscribe-ledger", requireAuth, async (req, res) => {
  try {
    const uid = userId(req);
    const slug = req.params.slug;
    const row = await recordSubscriptionPayment({
      fromUserId: uid,
      stationSlug: slug,
      amountCents: Number(req.body.amountCents) || 0,
    });
    try {
      const { getSupabaseAdmin } = await import("../src/services/supabaseAdmin.js");
      const { createNotification } = await import("../services/notificationService.js");
      const sb = getSupabaseAdmin();
      if (sb) {
        const { data: st } = await sb
          .from("stations")
          .select("owner_user_id, name")
          .eq("slug", slug)
          .maybeSingle();
        if (st?.owner_user_id && String(st.owner_user_id) !== String(uid)) {
          await createNotification({
            userId: String(st.owner_user_id),
            actorId: String(uid),
            type: "subscription",
            entityId: slug,
            message: `New subscriber on ${st.name || slug}`,
            metadata: { path: `/broadcast/control/${encodeURIComponent(slug)}`, stationSlug: slug },
          });
        }
      }
    } catch {
      /* non-fatal */
    }
    res.json({ ok: true, paymentId: row.id });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * Webhook for external RTMP (nginx on_publish) — optional
 * POST { secret, streamKey, event: "start"|"end" }
 */
router.post("/webhook/rtmp", express.json(), async (req, res) => {
  const secret = process.env.LIVE_ENGINE_WEBHOOK_SECRET;
  if (!secret || req.body.secret !== secret) {
    return res.status(401).json({ ok: false });
  }
  try {
    const { handleStreamPublished, handleStreamEnded } = await import(
      "../src/services/liveEngineService.js"
    );
    const path = `/live/${req.body.streamKey}`;
    if (req.body.event === "start") await handleStreamPublished(path);
    else if (req.body.event === "end") await handleStreamEnded(path);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/** Admin: refresh key cache after DB edits */
router.post("/admin/refresh-keys", requireAuth, async (req, res) => {
  if (!req.user?.isAdmin && req.user?.role !== "admin") {
    return res.status(403).json({ ok: false });
  }
  await refreshStreamKeyCache();
  res.json({ ok: true });
});

export default router;
