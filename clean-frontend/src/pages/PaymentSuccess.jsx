import { Link, useSearchParams } from "react-router-dom";

export default function PaymentSuccess() {
  const [sp] = useSearchParams();
  const sid = sp.get("session_id");
  return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: 24, color: "#e6e6e6", background: "#0a0a0a" }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <h1 style={{ color: "#d4af37" }}>Payment received</h1>
        <p>Thank you for supporting creators. Platform share 30% / creator 70%.</p>
        {sid && <code style={{ fontSize: 12, opacity: 0.7 }}>{sid.slice(0, 24)}…</code>}
        <p style={{ marginTop: 24 }}>
          <Link to="/powerstream" style={{ color: "#d4af37" }}>
            Back to TV
          </Link>
        </p>
      </div>
    </div>
  );
}
