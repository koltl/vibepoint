import { ImageResponse } from "next/og";

export const alt = "VibePoint — Planning poker for agile teams";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          padding: 48,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "white",
            marginBottom: 16,
          }}
        >
          VibePoint
        </div>
        <div
          style={{
            fontSize: 36,
            color: "rgba(255,255,255,0.95)",
            marginBottom: 8,
          }}
        >
          Planning poker for agile teams
        </div>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          Scrum poker · Real-time estimation
        </div>
      </div>
    ),
    { width: size.width, height: size.height }
  );
}
