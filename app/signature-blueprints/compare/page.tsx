import type { Metadata } from "next";
import { CompareClient } from "./CompareClient";

// Functional page (seo §3 noindex group): own H1/title for UX, never indexed,
// never in sitemap, no FAQ/rich schema. PRD D3: no share CTA on this page.
export const metadata: Metadata = {
  title: "Compare Signature Blueprints",
  description:
    "Compare up to 3 NBA 2K27 Signature Blueprints side by side: attribute deltas and key badges against your first pick.",
  robots: { index: false, follow: true },
};

export default function CompareBlueprintsPage() {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-site flex-grow flex-col gap-8 px-4 py-12 md:px-margin-desktop">
      <header className="flex max-w-3xl flex-col gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-body-sm text-text-muted">
          <a href="/signature-blueprints" className="hover:text-on-surface">
            Blueprints
          </a>
          <span aria-hidden="true">/</span>
          <span className="text-on-surface-variant">Compare</span>
        </nav>
        <h1 className="font-display text-display-lg text-primary-container">
          Compare Signature Blueprints
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Analyzing attribute deltas across selected builds.
        </p>
      </header>

      <CompareClient />
    </main>
  );
}
