import { ImageResponse } from "next/og";

export const alt = "Groundquote — ask the text, check the source";
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
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f6ef",
          color: "#17201a",
          fontFamily: "Arial, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            right: -110,
            top: -170,
            borderRadius: "50%",
            background: "#d8ec73",
            opacity: 0.35,
          }}
        />
        <div style={{ width: 980, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 70,
                height: 70,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 19,
                color: "#d8ec73",
                background: "#245a42",
                fontSize: 46,
                fontWeight: 800,
              }}
            >
              “
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
              ground<span style={{ color: "#245a42" }}>quote</span>
            </div>
          </div>
          <div
            style={{
              width: 870,
              marginTop: 72,
              display: "flex",
              flexDirection: "column",
              fontSize: 76,
              fontWeight: 650,
              lineHeight: 1.03,
              letterSpacing: "-4px",
            }}
          >
            Ask the text.
            <span style={{ color: "#245a42" }}>Check the source.</span>
          </div>
          <div
            style={{
              marginTop: 42,
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: "#657168",
              fontSize: 26,
            }}
          >
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: "50%",
                background: "#5da272",
              }}
            />
            Citation-backed document answers with a safe no-answer path.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
