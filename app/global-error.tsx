
"use client";
import { useTx } from "../store/language-store";

// Root crash screen — must be self-contained (own <html>/<body>) so it
// renders even when the layout itself fails. Bengali + reload.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const tx = useTx();
  return (
    <html lang="bn">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#faf8f5" }}>
        <div style={{ maxWidth: 420, margin: "48px auto", padding: 32, textAlign: "center", background: "#fff", borderRadius: 24, boxShadow: "0 8px 32px rgba(0,0,0,.08)" }}>
          <div style={{ fontSize: 40 }}>🕌</div>
          <h2 style={{ margin: "12px 0 4px" }}>{tx("ইসলাহ লোড হয়নি")}</h2>
          <p style={{ color: "#666", fontSize: 14 }}>{tx("অ্যাপটি চালু করা যায়নি। আবার চেষ্টা করুন।")}</p>
          <button
            onClick={() => reset()}
            style={{ marginTop: 16, width: "100%", padding: "12px 16px", borderRadius: 16, border: "none", background: "#0e7c5b", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
          >
            {tx("আবার চেষ্টা করুন")}
          </button>
          <button
            onClick={() => { try { localStorage.clear(); } catch {} location.href = "/"; }}
            style={{ marginTop: 8, width: "100%", padding: "12px 16px", borderRadius: 16, border: "1px solid #ddd", background: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            {tx("ক্যাশ মুছে হোমে যান")}
          </button>
        </div>
      </body>
    </html>
  );
}
