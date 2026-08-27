import { ImageResponse } from "next/og";
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "@/lib/social";

// R15: site-wide social share image (1200x630), code-generated from approved
// brand assets (badge mark from public/assets/logo.svg) and the design-token
// palette in app/globals.css. No external design draft.
//
// Plain route handler (not the opengraph-image file convention) so the image
// URL is stable (/og-image) and every page — including nested routes that
// override openGraph — can reference it explicitly via lib/social.ts.
// Static by default: prerendered at build, served as a cached PNG asset.
// (Next 15 route handlers default to dynamic — pin this one to static.)
export const dynamic = "force-static";

// Badge mark extracted from public/assets/logo.svg (graphic only, no text).
const BADGE_MARK =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5NiA5NiIgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2Ij48ZyBmaWxsPSJub25lIj48ZyBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS13aWR0aD0iNCI+PGxpbmUgeDE9IjQ4IiB5MT0iNCIgeDI9IjQ4IiB5Mj0iMTEiIHN0cm9rZT0iI0EzRTYzNSIvPjxsaW5lIHgxPSI2OS42IiB5MT0iOS4zIiB4Mj0iNjYuNCIgeTI9IjE1LjQiIHN0cm9rZT0iI0ZGQjAzQSIvPjxsaW5lIHgxPSI4Ni43IiB5MT0iMjYuNCIgeDI9IjgwLjYiIHkyPSIyOS42IiBzdHJva2U9IiNGRkIwM0EiLz48bGluZSB4MT0iOTIiIHkxPSI0OCIgeDI9Ijg1IiB5Mj0iNDgiIHN0cm9rZT0iI0ZGQjAzQSIvPjxsaW5lIHgxPSI4Ni43IiB5MT0iNjkuNiIgeDI9IjgwLjYiIHkyPSI2Ni40IiBzdHJva2U9IiNGRkIwM0EiLz48bGluZSB4MT0iNjkuNiIgeTE9Ijg2LjciIHgyPSI2Ni40IiB5Mj0iODAuNiIgc3Ryb2tlPSIjQTNFNjM1Ii8+PGxpbmUgeDE9IjQ4IiB5MT0iOTIiIHgyPSI0OCIgeTI9Ijg1IiBzdHJva2U9IiNGRkIwM0EiLz48bGluZSB4MT0iMjYuNCIgeTE9Ijg2LjciIHgyPSIyOS42IiB5Mj0iODAuNiIgc3Ryb2tlPSIjRkZCMDNBIi8+PGxpbmUgeDE9IjkuMyIgeTE9IjY5LjYiIHgyPSIxNS40IiB5Mj0iNjYuNCIgc3Ryb2tlPSIjRkZCMDNBIi8+PGxpbmUgeDE9IjQiIHkxPSI0OCIgeDI9IjExIiB5Mj0iNDgiIHN0cm9rZT0iI0ZGQjAzQSIvPjxsaW5lIHgxPSI5LjMiIHkxPSIyNi40IiB4Mj0iMTUuNCIgeTI9IjI5LjYiIHN0cm9rZT0iI0EzRTYzNSIvPjxsaW5lIHgxPSIyNi40IiB5MT0iOS4zIiB4Mj0iMjkuNiIgeTI9IjE1LjQiIHN0cm9rZT0iI0ZGQjAzQSIvPjwvZz48cG9seWdvbiBwb2ludHM9IjQ4LDE0IDc3LjQsMzEgNzcuNCw2NSA0OCw4MiAxOC42LDY1IDE4LjYsMzEiIGZpbGw9IiMxNjIyM0MiIHN0cm9rZT0iI0ZGQjAzQSIgc3Ryb2tlLXdpZHRoPSIzIi8+PHBvbHlnb24gcG9pbnRzPSI0OCwyMiA3MC41LDM1IDcwLjUsNjEgNDgsNzQgMjUuNSw2MSAyNS41LDM1IiBmaWxsPSJub25lIiBzdHJva2U9IiNBM0U2MzUiIHN0cm9rZS13aWR0aD0iMS42Ii8+PHBvbHlsaW5lIHBvaW50cz0iMzMsNjAgMzgsMzYgNDgsNTAgNTgsMzYgNjMsNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0VERjJGQSIgc3Ryb2tlLXdpZHRoPSI1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L2c+PC9zdmc+";

const CHIP_STYLE = {
  display: "flex",
  alignItems: "center",
  borderRadius: 999,
  border: "2px solid #1e293b",
  backgroundColor: "#0e1628",
  color: "#d4e4fa",
  fontSize: 30,
  padding: "14px 28px",
} as const;

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #070d1a 0%, #051424 55%, #0d1c2d 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse/satori renders <img>, not next/image */}
          <img src={BADGE_MARK} width={132} height={132} alt="" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                fontSize: 76,
                fontWeight: 700,
                color: "#edf2fa",
                letterSpacing: 1,
              }}
            >
              My2KBuilder
            </div>
            <div
              style={{
                fontSize: 30,
                color: "#ffb03a",
                letterSpacing: 8,
              }}
            >
              NBA 2K27 BUILD PLANNER
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          <div style={CHIP_STYLE}>53 Badges · 20 Slots</div>
          <div style={CHIP_STYLE}>40 Signature Blueprints</div>
          <div style={CHIP_STYLE}>Shareable Build Cards</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 30, color: "#94a3b8" }}>
            Free · Unofficial · No sign-up
          </div>
          <div style={{ fontSize: 30, color: "#9ddf2e" }}>my2kbuilder.com</div>
        </div>
      </div>
    ),
    { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT },
  );
}
