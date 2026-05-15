import { ImageResponse } from "next/og";
import { business } from "@/lib/business";

export const alt = `${business.name} — commercial & residential roofing`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          color: "#ffffff",
          padding: "80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: "#ea580c",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 28, fontWeight: 600 }}>{business.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 600,
              lineHeight: 1.05,
              maxWidth: 980,
              display: "flex",
            }}
          >
            Roofs that last. Service that's on time.
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#a1a1aa",
              maxWidth: 960,
              display: "flex",
            }}
          >
            Residential and commercial roofing across the {business.serviceAreaSummary}.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#a1a1aa",
          }}
        >
          <div style={{ display: "flex" }}>
            Licensed since {business.foundingYear} | {business.warranty.years}-year
            workmanship warranty | {business.rating.value} avg. rating ({business.rating.count}+ reviews)
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
