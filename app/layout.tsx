import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { AnalyticsConsent } from "@/components/analytics/AnalyticsConsent";
import { CANONICAL_HOST, hasCanonicalHost } from "@/lib/canonical";
import { socialMeta } from "@/lib/social";

// Self-hosted fonts (R7B condition C-02): woff2 vendored in app/fonts,
// served same-origin via next/font/local. Zero third-party font requests.
const spaceGrotesk = localFont({
  src: [
    { path: "./fonts/space-grotesk-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/space-grotesk-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-space-grotesk",
  display: "swap",
});

const ibmPlexSans = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

// R15: site-wide social share defaults. metadataBase tracks CANONICAL_HOST
// (build-time env, approved host = my2kbuilder.com) so og:/twitter: URLs are
// absolute in production. Pages override title/description/url via
// lib/social.ts socialMeta() using their existing frozen copy.
// R12J-F: no brand suffix template — SEO §3 frozen titles are ≤60 chars
// verbatim and the 15-char " | My2KBuilder" suffix pushed 4 pages past the
// 60-char SERP budget. Brand presence stays via og:site_name, og:image, the
// nav logo, and this default title (404 / untitled pages). og:title and
// twitter:title reuse the same frozen string via socialMeta, so <title> and
// social titles stay identical site-wide.
const DEFAULT_TITLE = "My2KBuilder — NBA 2K27 Builder";
const DEFAULT_DESCRIPTION =
  "Plan NBA 2K27 MyPLAYER builds in your browser: allocate Badge Tokens, compare 40 Signature Blueprints and share a build card. Free, unofficial, no sign-up.";

export const metadata: Metadata = {
  metadataBase: new URL(
    hasCanonicalHost() ? `https://${CANONICAL_HOST}` : "http://localhost:3000",
  ),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  // R12D: Bing Webmaster Tools site verification (public token, owner-supplied
  // 2026-08-27). Rendered in <head> of every page via root metadata.
  verification: {
    other: {
      "msvalidate.01": "9EE64B2BA012B70180975735D1030CD3",
    },
  },
  ...socialMeta({
    path: "/",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  }),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} dark`}>
      <body
        className="flex min-h-screen flex-col font-body text-body-md antialiased"
        style={{
          // Wire next/font variable fonts into the Tailwind theme families.
          ["--font-display" as string]: "var(--font-space-grotesk), Arial, sans-serif",
          ["--font-body" as string]: "var(--font-ibm-plex-sans), Arial, sans-serif",
        }}
      >
        {/* Approved readability overlay: rgba(7,13,26) top .5 / mid .3 / bottom .55
            (contract §8.6, unchanged from design v6). */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(7, 13, 26, 0.5) 0%, rgba(7, 13, 26, 0.3) 50%, rgba(7, 13, 26, 0.55) 100%)",
          }}
        />
        <SiteNav />
        {children}
        <SiteFooter />
        {/* R12.5: consent-gated analytics. Client-only; SSR HTML carries
            zero analytics scripts (no consent => 0 scripts / 0 requests). */}
        <AnalyticsConsent />
      </body>
    </html>
  );
}
