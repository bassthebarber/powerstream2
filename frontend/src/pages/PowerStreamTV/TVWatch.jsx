import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MonetizeActions from "../../components/monetization/MonetizeActions";
import "./TVWatch.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

function token() {
  return localStorage.getItem("powerstreamToken") || localStorage.getItem("ps_token") || localStorage.getItem("token") || "";
}

export default function TVWatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [film, setFilm] = useState(null);
  const [access, setAccess] = useState({ unlocked: true, loading: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        fetch(`${API_BASE}/api/powerstream/film/${id}/view`, { method: "POST" }).catch(() => {});
        const res = await fetch(`${API_BASE}/api/powerstream/film/${id}`);
        const data = await res.json();
        if (data.ok && data.film) {
          setFilm(data.film);
          const paid = (data.film.priceCents || 0) > 0;
          if (!paid) {
            setAccess({ unlocked: true, loading: false });
          } else {
            const ar = await fetch(`${API_BASE}/api/powerstream/film/${id}/access`, {
              headers: { Authorization: `Bearer ${token()}` },
            });
            const ad = await ar.json();
            setAccess({ unlocked: !!ad.unlocked, loading: false, ...ad });
          }
        } else {
          setError(data.error || "Not found");
        }
      } catch (e) {
        setError("Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="tv-watch-wrapper tv-watch-fs">
        <div className="tv-watch-loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error || !film) {
    return (
      <div className="tv-watch-wrapper tv-watch-fs">
        <div className="tv-watch-error">
          <h2>{error || "Not found"}</h2>
          <button type="button" onClick={() => navigate("/powerstream")}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const videoUrl = film.filmUrl || film.videoUrl || film.url;
  const locked = !access.unlocked && (film.priceCents || 0) > 0;

  return (
    <div className="tv-watch-wrapper tv-watch-fs">
      <header className="tv-watch-bar">
        <button type="button" className="tv-watch-back" onClick={() => navigate("/powerstream")}>
          ←
        </button>
        <div className="tv-watch-bar-meta">
          <h1>{film.title}</h1>
          <span>{film.creatorName || "Creator"}</span>
        </div>
        <MonetizeActions
          creatorId={film.uploadedBy?._id || film.uploadedBy}
          stationSlug={film.stationSlug}
          filmId={film._id}
          filmTitle={film.title}
          priceCents={film.priceCents}
          requiresSubscription={film.requiresSubscription}
        />
      </header>

      <div className="tv-watch-stage">
        {locked ? (
          <div className="tv-watch-lock">
            <p>Unlock to watch</p>
            <MonetizeActions
              creatorId={film.uploadedBy?._id || film.uploadedBy}
              stationSlug={film.stationSlug}
              filmId={film._id}
              filmTitle={film.title}
              priceCents={film.priceCents || 299}
              requiresSubscription={film.requiresSubscription}
            />
            {!token() && <p className="tv-watch-hint">Log in to purchase.</p>}
          </div>
        ) : videoUrl ? (
          <video controls autoPlay playsInline className="tv-watch-video" poster={film.posterUrl || film.thumbnailUrl}>
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="no-video">No video URL</div>
        )}
      </div>
    </div>
  );
}
