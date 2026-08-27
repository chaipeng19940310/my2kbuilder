import type { Metadata } from "next";
import { socialMeta } from "@/lib/social";
import { SharedBuildClient } from "./SharedBuildClient";

// Shared build restore (contract §2 #6) — noindex, follow, never in sitemap.
// HTTP semantics: this route ALWAYS returns 200 (contract §6.2 freeze);
// link validity is judged client-side because share state is never stored.
export const metadata: Metadata = {
  title: "Shared NBA 2K27 Build",
  description:
    "A player shared this NBA 2K27 build with you. Open it in the planner to see the full allocation — or change anything and make it your own.",
  robots: { index: false, follow: true },
  // R15: shared build links are the top social-share surface — emit OG/Twitter
  // card but no og:url so crawlers keep the actual shared URL.
  ...socialMeta({
    title: "Shared NBA 2K27 Build",
    description:
      "A player shared this NBA 2K27 build with you. Open it in the planner to see the full allocation — or change anything and make it your own.",
  }),
};

export default async function SharedBuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-grow flex-col gap-8 px-4 py-12 md:px-margin-desktop">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-display-lg text-primary-container">
          Shared NBA 2K27 Build
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          A player shared this build with you. Open it in the planner to see the full allocation —
          or change anything and make it your own.
        </p>
      </header>

      <SharedBuildClient id={id} />
    </main>
  );
}
