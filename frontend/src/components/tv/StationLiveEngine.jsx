// PowerStream Live Engine UI — owner Go Live, viewers tip + subscribe
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  fetchLiveEngineStatus,
  claimStation,
  fetchIngestCredentials,
  regenerateStreamKey,
  updateLiveMeta,
  pingLiveViewer,
  sendTip,
  recordSubscribeLedger,
} from "../../lib/liveEngineApi.js";
import {
  setStationSubscription,
  isSubscribedToStation,
  getAuthUserId,
} from "../../lib/supabasePowerstream.js";
import "./StationLiveEngine.css";

function sessionKey(slug) {
  return `ps_live_sess_${slug}`;
}

export default function StationLiveEngine({ stationSlug, stationName, showGoLive = true }) {
  const { user } = useAuth();
  const uid = user?.id || user?._id;
  const [status, setStatus] = useState(null);
  const [ingest, setIngest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [title, setTitle] = useState("");
  const [tipOpen, setTipOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState("500");
  const [subscribed, setSubscribed] = useState(false);

  const isOwner = useMemo(() => {
    if (!uid || !status?.ownerUserId) return false;
    return String(uid) === String(status.ownerUserId);
  }, [uid, status?.ownerUserId]);

  const stationUnclaimed = status?.ok && !status?.ownerUserId;

  const refresh = useCallback(async () => {
    if (!stationSlug) return;
    try {
      const d = await fetchLiveEngineStatus(stationSlug);
      setStatus(d);
    } catch {
      setStatus(null);
    }
  }, [stationSlug]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 8000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!user || !stationSlug) return;
    isSubscribedToStation(user, stationSlug).then(setSubscribed);
  }, [user, stationSlug]);

  useEffect(() => {
    if (!status?.isLive || !stationSlug) return;
    let sid = sessionStorage.getItem(sessionKey(stationSlug));
    if (!sid) {
      sid = `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(sessionKey(stationSlug), sid);
    }
    const ping = () => pingLiveViewer(stationSlug, sid).catch(() => {});
    ping();
    const iv = setInterval(ping, 22000);
    return () => clearInterval(iv);
  }, [status?.isLive, stationSlug]);

  const handleClaim = async () => {
    if (!user) return alert("Log in to claim this station");
    setLoading(true);
    setErr("");
    try {
      const d = await claimStation(stationSlug, stationName);
      if (!d.ok) throw new Error(d.error || "Claim failed");
      await refresh();
    } catch (e) {
      setErr(e.message || "Claim failed");
    } finally {
      setLoading(false);
    }
  };

  const loadIngest = async () => {
    setLoading(true);
    setErr("");
    try {
      const d = await fetchIngestCredentials(stationSlug);
      if (!d.ok) throw new Error(d.error || "Failed");
      setIngest(d);
      await updateLiveMeta(stationSlug, { title: title || `${stationName || stationSlug} LIVE` });
    } catch (e) {
      setErr(e.message || "Could not load stream credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm("Regenerate key? Old OBS settings will stop working.")) return;
    setLoading(true);
    try {
      const d = await regenerateStreamKey(stationSlug);
      if (d.ok) setIngest(d);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return alert("Log in to subscribe");
    try {
      getAuthUserId(user);
      await setStationSubscription(user, stationSlug, !subscribed);
      await recordSubscribeLedger(stationSlug, 0);
      setSubscribed(!subscribed);
    } catch (e) {
      alert(e.message || "Subscribe failed");
    }
  };

  const handleTip = async () => {
    const cents = Math.round(parseFloat(tipAmount) * 100) || 0;
    if (cents < 50) return alert("Minimum $0.50");
    setLoading(true);
    try {
      const d = await sendTip(stationSlug, cents);
      if (d.ok) {
        setTipOpen(false);
        alert("Thanks — tip sent!");
      } else throw new Error(d.error);
    } catch (e) {
      alert(e.message || "Tip failed");
    } finally {
      setLoading(false);
    }
  };

  if (!stationSlug) return null;

  return (
    <div className="ps-live-engine">
      {status?.isLive && (
        <div className="ps-live-engine-banner">
          <span className="ps-live-engine-live-badge">
            <span className="ps-live-dot" /> LIVE
          </span>
          <span className="ps-live-engine-viewers">
            {(status.viewerCount ?? 0).toLocaleString()} watching
          </span>
        </div>
      )}

      <div className="ps-live-engine-actions">
        <button type="button" className="ps-live-btn ps-live-btn--gold" onClick={handleSubscribe}>
          {subscribed ? "✓ Subscribed" : "Subscribe to Station"}
        </button>
        <button
          type="button"
          className="ps-live-btn ps-live-btn--outline"
          onClick={() => setTipOpen(true)}
          disabled={!status?.isLive}
        >
          Tip Creator
        </button>
      </div>

      {showGoLive && stationUnclaimed && user && (
        <div className="ps-live-engine-owner">
          <h4>Broadcast this station</h4>
          <p className="ps-live-engine-hint">
            Claim once as the station owner — only you can get RTMP keys and go live.
          </p>
          <button type="button" className="ps-live-btn ps-live-btn--primary" onClick={handleClaim} disabled={loading}>
            {loading ? "…" : "Claim station & enable Go Live"}
          </button>
          {err && <p className="ps-live-engine-err">{err}</p>}
        </div>
      )}

      {showGoLive && isOwner && !stationUnclaimed && (
        <div className="ps-live-engine-owner">
          <h4>Go Live (OBS / Larix)</h4>
          <p className="ps-live-engine-hint">
            Set stream title before going live (optional):
          </p>
          <input
            className="ps-live-engine-input"
            placeholder="Stream title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {!ingest ? (
            <button type="button" className="ps-live-btn ps-live-btn--primary" onClick={loadIngest} disabled={loading}>
              {loading ? "…" : "Reveal RTMP credentials"}
            </button>
          ) : (
            <div className="ps-live-engine-creds">
              <label>Server (OBS URL)</label>
              <code className="ps-live-code">{ingest.rtmpServerUrl || ingest.rtmpUrl}</code>
              <label>Stream key</label>
              <code className="ps-live-code">{ingest.streamKey}</code>
              <p className="ps-live-engine-mini">
                OBS: Settings → Stream → Custom → URL = server above (rtmp://…/live), Key = stream key only.
              </p>
              <div className="ps-live-engine-row">
                <button type="button" className="ps-live-btn ps-live-btn--sm" onClick={() => navigator.clipboard?.writeText(ingest.streamKey)}>
                  Copy key
                </button>
                <button type="button" className="ps-live-btn ps-live-btn--sm ps-live-btn--danger" onClick={handleRegenerate}>
                  Regenerate key
                </button>
              </div>
            </div>
          )}
          {err && <p className="ps-live-engine-err">{err}</p>}
        </div>
      )}

      {showGoLive && status?.ownerUserId && !isOwner && user && (
        <p className="ps-live-engine-hint">
          This station is linked to another account. Only the owner can broadcast.
        </p>
      )}

      {tipOpen && (
        <div className="ps-live-modal" role="dialog">
          <div className="ps-live-modal-inner">
            <h3>Tip creator</h3>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              className="ps-live-engine-input"
            />
            <span className="ps-live-engine-mini">USD (min $0.50)</span>
            <div className="ps-live-engine-row">
              <button type="button" className="ps-live-btn" onClick={() => setTipOpen(false)}>
                Cancel
              </button>
              <button type="button" className="ps-live-btn ps-live-btn--gold" onClick={handleTip} disabled={loading}>
                Send tip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
