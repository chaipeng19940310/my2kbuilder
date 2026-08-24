import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { AnalyticsConsent } from "@/components/analytics/AnalyticsConsent";

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

export const metadata: Metadata = {
  title: {
    default: "My2KBuilder — NBA 2K27 Builder",
    template: "%s | My2KBuilder",
  },
  description:
    "Plan NBA 2K27 MyPLAYER builds in your browser: allocate Badge Tokens, compare 40 Signature Blueprints and share a build card. Free, unofficial, no sign-up.",
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
