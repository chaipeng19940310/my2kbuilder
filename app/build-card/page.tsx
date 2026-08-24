import type { Metadata } from "next";
import { BuildCardClient } from "./BuildCardClient";

// Functional page (seo §3 noindex group): own H1/title for UX, never indexed,
// never in sitemap, no FAQ/rich schema.
export const metadata: Metadata = {
  title: "Create a Shareable Build Card",
  description:
    "Turn your NBA 2K27 Badge Token plan into a link and a clean text build card — no screenshots, no account.",
  robots: { index: false, follow: true },
};

export default function BuildCardPage() {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-site flex-grow flex-col gap-8 px-4 py-12 md:px-margin-desktop">
      <header className="flex max-w-3xl flex-col gap-4">
        <h1 className="font-display text-display-lg text-primary-container">
          Create a Shareable Build Card
        </h1>
        {/* Steps strip (copy §3.5): Review, Copy, Share */}
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label-md text-on-surface-variant">
          <li className="flex items-center gap-2">
            <span className="rounded bg-primary-container px-1.5 py-0.5 text-code-sm font-bold text-on-primary">1</span>
            Review your build
          </li>
          <li className="flex items-center gap-2">
            <span className="rounded bg-primary-container px-1.5 py-0.5 text-code-sm font-bold text-on-primary">2</span>
            Copy the link
          </li>
          <li className="flex items-center gap-2">
            <span className="rounded bg-primary-container px-1.5 py-0.5 text-code-sm font-bold text-on-primary">3</span>
            Paste it anywhere
          </li>
        </ol>
        <p className="text-body-lg text-on-surface-variant">
          Cards are generated from text and CSS only — no game screenshots, no logos, no player
          photos. Anyone with the link sees the same build you see.
        </p>
      </header>

      <BuildCardClient />
    </main>
  );
}
