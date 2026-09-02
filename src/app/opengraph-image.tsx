import { ImageResponse } from "next/og";

export const alt = "Unofficial community MCP for fonio.ai — not fonio GmbH, MIT";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F7F8FC",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#585dfe",
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#585dfe",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            C
          </div>
          Community MCP for fonio
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 650,
              color: "#0f0f16",
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            Unofficial. Workspace API key. Paste-ready agents.
          </div>
          <div style={{ marginTop: 24, fontSize: 28, color: "#5c6070", maxWidth: 820 }}>
            Not fonio GmbH. MIT, no warranty. Prefer self-host.
          </div>
        </div>
        <div style={{ display: "flex", gap: 28, color: "#585dfe", fontSize: 22 }}>
          <span>Claude</span>
          <span>ChatGPT</span>
          <span>Cursor</span>
          <span>MIT</span>
          <span>Unofficial</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
