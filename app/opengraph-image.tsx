import { ImageResponse } from "next/og";

export const alt = "Speedway Motors LLC — Quality Used Cars in Paterson, NJ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          position: "relative",
        }}
      >
        {/* Red accent bar at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #D31119, #ff3a40, #D31119)",
          }}
        />
        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(211,17,25,0.12), transparent 70%)",
          }}
        />
        {/* Logo icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "linear-gradient(135deg, #ff3a40, #D31119)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 48,
            fontWeight: 800,
            marginBottom: 32,
          }}
        >
          S
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.02em",
            marginBottom: 12,
          }}
        >
          Speedway Motors
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#a1a1aa",
            marginBottom: 40,
          }}
        >
          Quality Used Cars in Paterson, NJ
        </div>
        <div
          style={{
            fontSize: 20,
            color: "#D31119",
            fontWeight: 600,
          }}
        >
          (862) 264-2777
        </div>
      </div>
    ),
    { ...size }
  );
}
