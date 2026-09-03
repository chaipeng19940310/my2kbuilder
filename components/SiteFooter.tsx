import Link from "next/link";
import { DATA_LAST_VERIFIED } from "@/lib/env";

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
          </div>
        </div>
        {/* R12F: SaaSTool listing badge (Owner-approved 2026-08-27, one card per small change).
            R12G: Findly badge added alongside (Owner-provided code after manual submission).
            R23.2: FirstLook light badge and AiTop10 text backlink slot added.
            R23.4: PostYourStartup light badge appended after slug assignment.
            Badge snippets embedded verbatim — href/src/rel/target/alt must not be altered;
            inline height/width kept, but sizing is unified via .directory-badges container
            CSS (Owner layout standard from BAH two-round rework). */}
        <div className="border-t border-border-low">
          <div
            className="directory-badges-marquee mx-auto w-full max-w-site overflow-hidden px-4 py-6 md:px-margin-desktop"
            aria-label="Directory listings"
          >
            <div className="directory-badges-track flex w-max flex-nowrap">
              <DirectoryBadgeSet />
              <DirectoryBadgeSet ariaHidden />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

function DirectoryBadgeSet({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div className="directory-badges" aria-hidden={ariaHidden || undefined}>
      <a href="https://saastool.site/item/my2kbuilder" target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element -- third-party badge embed, code provided as-is */}
        <img src="https://saastool.site/badges/saastool-light.svg" alt="Featured on SaaSTool.site" height="54px" width="auto" />
      </a>
      <a href="https://findly.tools/my2kbuilder?utm_source=my2kbuilder" target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element -- third-party badge embed, code provided as-is */}
        <img src="https://findly.tools/badges/findly-tools-badge-light.svg" alt="Featured on Findly.tools" width="175" height="55" />
      </a>
      {/* Launchpadly — My2KBuilder (light) — R12H, verbatim from
          postlaunch/directory-badge-codes-v0.md §4 (Owner-approved mount
          2026-08-28); inline img style converted to a JSX style object,
          everything else (href/rel/target/alt/src/width/height/data-*)
          unchanged. */}
      <a href="https://launchpadly.co/startup/my2kbuilder?ref=badge" target="_blank" rel="noopener noreferrer" data-launchpadly-badge="my2kbuilder" data-launchpadly-badge-variant="light">
        {/* eslint-disable-next-line @next/next/no-img-element -- third-party badge embed, code provided as-is */}
        <img src="https://launchpadly.co/embed/badges/startup/my2kbuilder.svg?variant=light" alt="Launchpadly Startup Directory" width="220" height="48" style={{ display: "block", border: 0 }} />
      </a>
      <a href="https://firstlook.tools" target="_blank">
        {/* eslint-disable-next-line @next/next/no-img-element -- third-party badge embed, code provided as-is */}
        <img src="https://firstlook.tools/badge/badge_light.svg" alt="Featured on First Look" width="200" height="54" />
      </a>
      <a href="https://aitop10.tools/" target="_blank">AiTop10 Tools</a>
      <a href="https://postyourstartup.co/startup/my2kbuilder-1?ref=badge" target="_blank">
        {/* eslint-disable-next-line @next/next/no-img-element -- third-party badge embed, code provided as-is */}
        <img src="https://postyourstartup.co/api/badge/my2kbuilder-1?theme=light" alt="Featured on PostYourStartup" width="212" height="55" />
      </a>
    </div>
  );
}
