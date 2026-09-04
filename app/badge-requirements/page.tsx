import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/JsonLdScript";
import { DisciplineIcon } from "@/components/DisciplineIcon";
import { VideoFacade } from "@/components/VideoFacade";
import { canonicalFor } from "@/lib/canonical";
import { socialMeta } from "@/lib/social";
import { breadcrumbSchema, faqPageSchema, webPageSchema } from "@/lib/schema";
import {
  BADGE_TIERS,
  BADGE_TIER_LABEL,
  DISCIPLINES,
  badgeCatalog,
  heightRestrictionLabel,
  type BadgeCatalogEntry,
  type BadgeRequirementsBundle,
  type BadgeTier,
  type BadgeTierRequirement,
} from "@/lib/data";
import { DataSourceBanner } from "@/components/SourceTag";
import badgeRequirementsBundle from "@/public/data/badge-requirements.v1.json";

// SEO freeze (seo §3 rules: title <=60 chars / meta <=155 chars; banned words
// official/best/guaranteed never used). Copy source: copy/r12i-wave1-copy-v1.md.
const PAGE_TITLE = "NBA 2K27 Badge Requirements — All 53 Badges, 4 Tiers";
const PAGE_DESCRIPTION =
  "Check NBA 2K27 badge requirements for all 53 badges: Bronze through Hall of Fame attribute thresholds, AND/OR rules, height limits, and source labels.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalFor("/badge-requirements") },
  ...socialMeta({
    path: "/badge-requirements",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  }),
};

// FAQ freeze (copy §1, 6 entries, verbatim — backticks from the markdown copy
// are formatting only; rendered text and FAQPage schema carry the same words).
const FAQS = [
  {
    question: "What does each badge requirement row mean?",
    answer:
      "It shows the attribute ratings needed to unlock that badge at Bronze, Silver, Gold, or Hall of Fame tier. AND means every listed attribute must qualify; OR means one qualifying attribute is enough. Height limits are shown when they apply.",
  },
  {
    question: "Where do these badge requirements come from?",
    answer:
      "Badge names and categories come from 2K's published builder list. Requirement cells come from the public reference layer and are marked cross_checked where two public reference tables match; anything not fully confirmed is labeled instead of being presented as settled fact.",
  },
  {
    question: "Why do some badges have height limits?",
    answer:
      "NBA 2K27 gates some badges by body type, so the same badge can be available on one build and unavailable on another. When a limit applies, the table shows it next to the requirement instead of hiding it in footnotes.",
  },
  {
    question: "Can I unlock Legend tier directly from attributes?",
    answer:
      "No. Legend is not a direct unlock tier in the builder. Meet the Hall of Fame requirement first, then use Synergy boosts to push the badge beyond its normal tier path.",
  },
  {
    question: "Why are there no token cost numbers?",
    answer:
      "Token costs pending — 2K has not published a full cost table. Collection is still in progress, so the site shows no token cost numbers and no estimates.",
  },
  {
    question: "Will these requirements ever change?",
    answer:
      "They can change with game updates. Each table carries source labels and a last-verified date so you can see when the data was checked before you spend points in-game.",
  },
] as const;

// R12I-A production bundle: 53 real badges, four-tier unlock requirements,
// every requirement cell cross_checked across two public reference tables.
const BADGES = badgeCatalog(badgeRequirementsBundle as BadgeRequirementsBundle);

/* Tier color blocks: .tier-chip classes from globals.css (design handoff
   r12i-visual-handoff-v1.md §2 contract, committed by R12I-D). Legend is a
   planning marker only, never a direct-unlock tier. */
const TIER_CHIP_CLASS: Record<BadgeTier, string> = {
  bronze: "tier-chip tier-bronze",
  silver: "tier-chip tier-silver",
  gold: "tier-chip tier-gold",
  hof: "tier-chip tier-hof",
};

/** One tier cell: attribute + minimum rating lines joined by the AND/OR logic. */
function TierCell({ req }: { req: BadgeTierRequirement }) {
  return (
    <div className="r18-c">
      {req.conditions.map((c, i) => (
        <span key={c.attribute} className="r18-v">
          {i > 0 && req.logic !== "single" ? (
            <span className="r18-op">
              {req.logic}
            </span>
          ) : null}
          {c.attribute} {c.min_rating}
        </span>
      ))}
    </div>
  );
}

function BadgeRow({ badge }: { badge: BadgeCatalogEntry }) {
  const height = heightRestrictionLabel(badge.requirements.bronze.height_restriction);
  return (
    <tr className="r18-r">
      <th
        scope="row"
        className="r18-n"
      >
        <span className="r18-i">
          {badge.name}
          {badge.is_new_2k27 ? (
            <span className="r18-new">
              NEW
            </span>
          ) : null}
        </span>
      </th>
      <td data-label="Category" className="r18-p">
        <span className="r18-cat">
          <DisciplineIcon discipline={badge.category} size={20} />
          {badge.category}
        </span>
      </td>
      {BADGE_TIERS.map((t) => (
        <td key={t} data-label={BADGE_TIER_LABEL[t]} className="r18-t">
          <TierCell req={badge.requirements[t]} />
        </td>
      ))}
      <td data-label="Height limit" className="r18-h">{height ?? "None"}</td>
      <td data-label="Source" className="r18-t">
        <span className="r18-src">
          {badge.field_tiers.requirements}
        </span>
      </td>
    </tr>
  );
}

export default function BadgeRequirementsPage() {
  return (
    <main className="r18-page r18-table relative z-10 mx-auto flex w-full max-w-site flex-grow flex-col gap-12 px-4 py-12 md:px-margin-desktop">
      <JsonLdScript
        schema={[
          webPageSchema({
            name: PAGE_TITLE,
            description: PAGE_DESCRIPTION,
            url: canonicalFor("/badge-requirements"),
          }),
          faqPageSchema([...FAQS]),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Badge Requirements", path: "/badge-requirements" },
          ]),
        ]}
      />

      {/* Pre-hydration enhancement bridge (same pattern as the planner page):
          the table below is fully server-rendered; this parse-time script only
          wires the discipline filter chips so they work before/without React.
          It mutates no React-managed DOM (the filter UI is server-rendered and
          stateless in React), so there is nothing to hydrate. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){if(window.__m2kBadgeReqBoot)return;window.__m2kBadgeReqBoot=true;document.addEventListener("click",function(e){var t=e.target;if(!t||!t.closest)return;var btn=t.closest("[data-m2k-filter]");if(!btn)return;var f=btn.getAttribute("data-m2k-filter");var all=document.querySelectorAll("[data-m2k-filter]");for(var i=0;i<all.length;i++)all[i].setAttribute("aria-pressed",all[i]===btn?"true":"false");var secs=document.querySelectorAll("[data-m2k-discipline]");var shown=0;for(var j=0;j<secs.length;j++){var hide=f!=="all"&&secs[j].getAttribute("data-m2k-discipline")!==f;secs[j].hidden=hide;if(!hide)shown+=parseInt(secs[j].getAttribute("data-m2k-count")||"0",10);}var n=document.getElementById("badge-requirements-shown");if(n)n.textContent=String(shown);},true);})();`,
        }}
      />

      <header className="flex max-w-3xl flex-col gap-4">
        <h1 className="font-display text-display-lg text-primary-container">
          NBA 2K27 Badge Requirements
        </h1>
        {/* Page intro (copy §1, verbatim). */}
        <p className="text-body-lg text-on-surface-variant">
          {
            "All 53 NBA 2K27 badges, listed with the attribute requirements for Bronze, Silver, Gold, and Hall of Fame tiers. Rows show AND/OR logic and height limits when they apply. Badge names and categories come from 2K's published builder list; requirement cells are marked cross_checked where two public reference tables match. Legend tier is not a direct unlock — it requires Synergy."
          }
        </p>
      </header>

      {/* Owner-authorized 2K builder screenshot at page head (same pattern as
          /takeover-requirements; local static asset, no third-party request). */}
      <figure className="flex max-w-4xl flex-col gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- local static asset */}
        <img
          src="/assets/keyart/nba2k27-badge-tokens-1920x1080.jpg"
          alt="NBA 2K27 Badge Tokens in the MyPLAYER Builder"
          width={1920}
          height={1080}
          loading="lazy"
          className="h-auto w-full rounded border border-border-low"
        />
        <figcaption className="text-body-sm text-text-muted">
          {
            "NBA 2K27 Badge Tokens (2K). My2KBuilder is an independent, fan-made planning tool and is not affiliated with 2K."
          }
        </figcaption>
      </figure>

      {/* How to read this table (copy §1: logic labels, source labels, Legend
          note, conflict/gap state) + tier color blocks from the design pack. */}
      <section className="flex max-w-3xl flex-col gap-4 rounded border border-border-low bg-surface-card p-6">
        <h2 className="font-display text-headline-sm text-on-surface">How to Read This Table</h2>
        <div className="flex flex-wrap items-center gap-2">
          {BADGE_TIERS.map((t) => (
            <span key={t} className={TIER_CHIP_CLASS[t]}>
              {BADGE_TIER_LABEL[t]}
            </span>
          ))}
          <span className="tier-chip tier-legend">Legend</span>
        </div>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-body-md text-on-surface-variant">
          <li>AND — every listed attribute must meet the requirement.</li>
          <li>OR — any one listed attribute can meet the requirement.</li>
          <li>Height limit — the badge is unavailable outside the listed height range.</li>
          <li>cross_checked — two public reference tables matched this requirement cell.</li>
          <li>community_unverified — single-source or not fully confirmed; shown only with this label.</li>
          <li>pending — not published yet; no value is shown.</li>
        </ul>
        <p className="text-body-md text-on-surface-variant">
          {
            "Legend is not a direct unlock tier in the builder. Plan for Hall of Fame requirements first; Legend requires Synergy boosts after the badge is part of the build."
          }
        </p>
        <p className="text-body-sm text-text-muted">
          {
            "If two sources disagree, the row is flagged and the value is not guessed. Token cost cells stay pending until collection is complete."
          }
        </p>
      </section>

      {/* Discipline filter (置顶 per copy §1 design placement). Pure
          progressive enhancement: all 53 rows are in the SSR HTML; the chips
          only toggle section visibility via the bridge script above. */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter badges by discipline">
          <button
            type="button"
            data-m2k-filter="all"
            aria-pressed="true"
            className="rounded border border-border-low bg-surface-card px-3 py-2 text-label-md text-on-surface-variant transition-colors hover:text-on-surface aria-pressed:border-primary-container aria-pressed:bg-primary-container aria-pressed:text-on-primary"
          >
            All ({BADGES.length})
          </button>
          {DISCIPLINES.map((d) => {
            const count = BADGES.filter((b) => b.category === d).length;
            return (
              <button
                key={d}
                type="button"
                data-m2k-filter={d}
                aria-pressed="false"
                className="flex items-center gap-2 rounded border border-border-low bg-surface-card px-3 py-2 text-label-md text-on-surface-variant transition-colors hover:text-on-surface aria-pressed:border-primary-container aria-pressed:bg-primary-container aria-pressed:text-on-primary"
              >
                <DisciplineIcon discipline={d} size={20} />
                {d} ({count})
              </button>
            );
          })}
        </div>
        <p className="text-body-sm text-text-muted">
          Showing <span id="badge-requirements-shown">{BADGES.length}</span> of {BADGES.length} badges
        </p>

        {/* Above-table helper (copy §1, verbatim; planner link = bidirectional
            interlink with /badge-token-planner). */}
        <p className="max-w-3xl text-body-md text-on-surface-variant">
          {
            "Requirements tell you which attributes unlock each badge tier. Higher tiers need higher ratings, and some badges also carry height limits. Use this page to check eligibility, then "
          }
          <Link href="/badge-token-planner" className="text-primary-container hover:underline">
            open the planner
          </Link>
          {" to map the build around it."}
        </p>

        {/* Source labels sit directly above the table (copy §3). */}
        <DataSourceBanner scope="badges" />

        {/* 53-badge × four-tier table, SSR'd in full, grouped by the six
            disciplines. Horizontal scroll on small viewports; the Badge column
            stays sticky so rows remain readable at 390px. */}
        {DISCIPLINES.map((d) => {
          const rows = BADGES.filter((b) => b.category === d);
          return (
            <section
              key={d}
              data-m2k-discipline={d}
              data-m2k-count={rows.length}
              className="flex flex-col gap-3"
            >
              <h2 className="flex items-center gap-3 font-display text-headline-md text-on-surface">
                <DisciplineIcon discipline={d} size={28} />
                {d}
                <span className="text-body-sm font-normal text-text-muted">{rows.length} badges</span>
              </h2>
              <div className="overflow-x-auto rounded border border-border-low bg-surface-card">
                <table className="w-full min-w-[880px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border-low">
                      <th
                        scope="col"
                        className="sticky left-0 bg-surface-card p-3 text-label-md text-text-muted"
                      >
                        Badge
                      </th>
                      <th scope="col" className="p-3 text-label-md text-text-muted">
                        Category
                      </th>
                      {BADGE_TIERS.map((t) => (
                        <th key={t} scope="col" className="p-3">
                          <span className={TIER_CHIP_CLASS[t]}>{BADGE_TIER_LABEL[t]}</span>
                        </th>
                      ))}
                      <th scope="col" className="p-3 text-label-md text-text-muted">
                        Height limit
                      </th>
                      <th scope="col" className="p-3 text-label-md text-text-muted">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((b) => (
                      <BadgeRow key={b.slug} badge={b} />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </section>

      {/* 2K Builder Courtside Report — click-to-load YouTube facade per design
          handoff §5 (shared VideoFacade component from R12I-D): initial HTML is
          a self-hosted real cover image + play button only; the youtube-nocookie iframe
          is created after a click. No third-party request fires before that. */}
      <section className="flex max-w-3xl flex-col gap-4">
        <h2 className="font-display text-headline-md text-on-surface">
          Watch the 2K Builder Courtside Report
        </h2>
        <VideoFacade
          videoId="MSZre4MBSBA"
          title="2K Builder Courtside Report"
          thumbnail="/assets/video/courtside-report.jpg"
        />
        <p className="text-body-sm text-text-muted">
          {
            "Video hosted on YouTube by 2K. My2KBuilder is an independent, fan-made planning tool and is not affiliated with 2K."
          }
        </p>
      </section>

      {/* FAQ at page bottom (copy §1 design placement; 6 freeze entries). */}
      <section className="flex max-w-3xl flex-col gap-4">
        <h2 className="font-display text-headline-md text-on-surface">Badge Requirements FAQ</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((f) => (
            <details
              key={f.question}
              className="group rounded border border-border-low bg-surface-card p-4"
            >
              <summary className="cursor-pointer list-none text-label-md text-on-surface group-open:text-primary-container">
                {f.question}
              </summary>
              <p className="mt-2 text-body-md text-on-surface-variant">{f.answer}</p>
            </details>
          ))}
        </div>
        <p className="text-body-md text-on-surface-variant">
          {"Ready to plan around these requirements? Open the "}
          <Link href="/badge-token-planner" className="text-primary-container hover:underline">
            Badge Token Planner
          </Link>
          {" and map your build — check the "}
          <Link href="/takeover-requirements" className="text-primary-container hover:underline">
            Takeover Requirements
          </Link>
          {" table before locking your attribute targets, and when a threshold sits above your creation cap, the "}
          <Link href="/cap-breakers" className="text-primary-container hover:underline">
            Cap Breakers guide
          </Link>
          {" shows how to plan the gap backwards. Copying a 2K26 build instead? Read the "}
          <Link href="/2k26-to-2k27-build-pitfalls" className="text-primary-container hover:underline">
            2K26-to-2K27 pitfalls guide
          </Link>
          {" first — thresholds and badge math all moved."}
        </p>
      </section>
    </main>
  );
}
