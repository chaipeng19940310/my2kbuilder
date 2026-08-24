import Link from "next/link";
import { DATA_LAST_VERIFIED } from "@/lib/env";
import { CookiePreferencesButton } from "@/components/analytics/CookiePreferencesButton";

/**
 * Site-wide footer + pre-footer trust strip.
 * Contract §4.3: every page shows the non-affiliation line and a
 * "Data last verified: YYYY-MM-DD" line (build-time injected).
 * Route hard rule 5: footer links must never 404 — these routes
 * are part of the frozen route contract (/terms added in R10.2).
 */
export function SiteFooter() {
  return (
    <>
      <div className="relative z-10 mt-auto border-t border-dashed border-border-low px-4 py-4 text-center">
        <p className="text-body-sm text-text-muted">
          My2KBuilder is an independent, fan-made planning tool. Not affiliated with or endorsed by
          2K, NBA, Visual Concepts, or Take-Two Interactive.
        </p>
        <p className="mt-1 text-body-sm text-text-muted">
          Data last verified: {DATA_LAST_VERIFIED} ·{" "}
          <Link href="/methodology" className="underline decoration-secondary hover:text-on-surface">
            Source tiers
          </Link>
        </p>
      </div>
      <footer className="relative z-10 border-t border-border-low bg-surface-container-lowest">
        <div className="mx-auto flex w-full max-w-site flex-col items-center justify-between gap-gutter px-4 py-8 md:flex-row md:px-margin-desktop">
          <div className="flex flex-col gap-2">
            <span className="font-display text-headline-sm text-on-surface">My2KBuilder</span>
            <p className="max-w-lg text-body-sm text-secondary">
              © 2026 My2KBuilder. Fan-made tool not affiliated with 2K Games or Take-Two
              Interactive. Data last verified: {DATA_LAST_VERIFIED}.
            </p>
          </div>
          <div className="flex gap-6">
            <Link
              href="/methodology"
              className="text-label-md text-text-muted transition-all duration-300 hover:text-on-surface hover:underline decoration-secondary"
            >
              Methodology
            </Link>
            <Link
              href="/disclaimer"
              className="text-label-md text-text-muted transition-all duration-300 hover:text-on-surface hover:underline decoration-secondary"
            >
              Disclaimer
            </Link>
            <Link
              href="/privacy"
              className="text-label-md text-text-muted transition-all duration-300 hover:text-on-surface hover:underline decoration-secondary"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-label-md text-text-muted transition-all duration-300 hover:text-on-surface hover:underline decoration-secondary"
            >
              Terms
            </Link>
            {/* R12.5: re-open the analytics consent banner (change/withdraw). */}
            <CookiePreferencesButton className="text-label-md text-text-muted transition-all duration-300 hover:text-on-surface hover:underline decoration-secondary" />
          </div>
        </div>
      </footer>
    </>
  );
}
