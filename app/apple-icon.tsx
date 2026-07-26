import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 38,
          color: "#d8ec73",
          background: "#245a42",
          fontFamily: "Arial, sans-serif",
          fontSize: 118,
          fontWeight: 800,
          position: "relative",
        }}
      >
        <span style={{ display: "flex", transform: "translateY(-12px)" }}>“</span>
        <span
          style={{
            position: "absolute",
            left: 43,
            right: 43,
            bottom: 39,
            height: 10,
            borderRadius: 8,
            background: "#f8faf5",
          }}
        />
        <span
          style={{
            position: "absolute",
            width: 18,
            height: 18,
            right: 34,
            bottom: 35,
            borderRadius: "50%",
            background: "#d8ec73",
          }}
        />
      </div>
    ),
    size,
  );
}
