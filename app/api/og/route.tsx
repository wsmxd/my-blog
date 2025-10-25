import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  const width = 1200;
  const height = 630;

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
          backgroundColor: "#f1f5f9",
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        <div style={{ marginBottom: 24, color: "#64748b" }}>
          Blog Cover Image
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  );
}