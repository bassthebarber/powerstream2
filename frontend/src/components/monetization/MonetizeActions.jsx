/**
 * Tip / Subscribe / Buy video — routes via POST /api/payments/unified/checkout
 */
import { useState } from "react";
import "./MonetizeActions.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

function token() {
  return (
    localStorage.getItem("powerstreamToken") ||
    localStorage.getItem("ps_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

export default function MonetizeActions({
  creatorId,
  stationSlug,
  filmId,
  filmTitle,
  priceCents,
  requiresSubscription,
  compact,
}) {
  const [busy, setBusy] = useState(null);

  const checkout = async (action, extra = {}) => {
    setBusy(action);
    try {
      const res = await fetch(`${API}/payments/unified/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          action,
          creatorId: creatorId || undefined,
          stationSlug: stationSlug || undefined,
          filmId: filmId || undefined,
          filmTitle: filmTitle || undefined,
          amountCents: extra.amountCents,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Payments unavailable (Stripe / login)");
      }
    } catch (e) {
      alert(e.message || "Checkout failed");
    } finally {
      setBusy(null);
    }
  };

  if (compact) {
    return (
      <div className="ps-mon compact">
        <button type="button" className="ps-mon-tip" disabled={!!busy} onClick={() => checkout("tip", { amountCents: 500 })}>
          {busy === "tip" ? "…" : "Tip"}
        </button>
      </div>
    );
  }

  return (
    <div className="ps-mon">
      <button type="button" className="ps-mon-tip" disabled={!!busy} onClick={() => checkout("tip", { amountCents: 500 })}>
        {busy === "tip" ? "…" : "Tip $5"}
      </button>
      {(requiresSubscription || stationSlug) && (
        <button
          type="button"
          className="ps-mon-sub"
          disabled={!!busy}
          onClick={() => checkout("station_subscription", { amountCents: 999 })}
        >
          {busy === "station_subscription" ? "…" : "Subscribe"}
        </button>
      )}
      {priceCents > 0 && filmId && (
        <button
          type="button"
          className="ps-mon-buy"
          disabled={!!busy}
          onClick={() => checkout("video_purchase", { amountCents: priceCents })}
        >
          {busy === "video_purchase" ? "…" : `Unlock $${(priceCents / 100).toFixed(2)}`}
        </button>
      )}
    </div>
  );
}
