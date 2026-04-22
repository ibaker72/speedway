"use client";

const RED = "#D31119";

export default function PrintButton() {
  return (
    <div style={{ marginTop: "40px", textAlign: "center" }}>
      <button
        onClick={() => window.print()}
        style={{
          background: RED,
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          padding: "12px 32px",
          fontSize: "15px",
          fontWeight: 600,
          cursor: "pointer",
          letterSpacing: "0.3px",
        }}
      >
        Save as PDF (Ctrl + P)
      </button>
      <p style={{ marginTop: "10px", fontSize: "12px", color: "#999" }}>
        Click above or use your browser&apos;s Print dialog → Save as PDF
      </p>
    </div>
  );
}
