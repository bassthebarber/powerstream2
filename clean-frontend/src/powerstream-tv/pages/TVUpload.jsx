import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

function token() {
  return localStorage.getItem("powerstreamToken") || localStorage.getItem("ps_token") || "";
}

export default function TVUpload() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    posterUrl: "",
    stationSlug: "",
    priceCents: "",
    requiresSubscription: false,
  });
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/powerstream/films`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          ...form,
          priceCents: parseInt(form.priceCents, 10) || 0,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        navigate(`/powerstream/watch/${data.film._id}`);
      } else {
        setMsg(data.error || "Failed");
      }
    } catch {
      setMsg("Network error");
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "32px auto", padding: 24, color: "#e6e6e6", background: "#0c0c0c", borderRadius: 12, border: "1px solid rgba(212,175,55,0.25)" }}>
      <h1 style={{ color: "#d4af37" }}>Filmmaker upload</h1>
      <p style={{ color: "#8a8070", fontSize: 14 }}>Tie content to a station slug. Optional price (cents) or subscription gate.</p>
      <form onSubmit={submit} style={{ display: "grid", gap: 14, marginTop: 20 }}>
        <input
          placeholder="Title *"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          style={inp}
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          style={{ ...inp, minHeight: 80 }}
        />
        <input
          placeholder="Video URL (mp4/hls) *"
          required
          value={form.videoUrl}
          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
          style={inp}
        />
        <input placeholder="Poster URL" value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })} style={inp} />
        <input
          placeholder="station_slug (e.g. nolimit-east-houston)"
          value={form.stationSlug}
          onChange={(e) => setForm({ ...form, stationSlug: e.target.value })}
          style={inp}
        />
        <input
          placeholder="Price in cents (0 = free)"
          value={form.priceCents}
          onChange={(e) => setForm({ ...form, priceCents: e.target.value })}
          style={inp}
        />
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={form.requiresSubscription}
            onChange={(e) => setForm({ ...form, requiresSubscription: e.target.checked })}
          />
          Requires active subscription
        </label>
        <button
          type="submit"
          style={{
            padding: 14,
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg,#c9a227,#e6c04a)",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Publish
        </button>
      </form>
      {msg && <p style={{ color: "#c66", marginTop: 12 }}>{msg}</p>}
    </div>
  );
}

const inp = {
  padding: 12,
  borderRadius: 8,
  border: "1px solid #333",
  background: "#111",
  color: "#eee",
};
