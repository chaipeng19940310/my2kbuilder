import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/JsonLdScript";
import { DisciplineIcon } from "@/components/DisciplineIcon";
import { VideoFacade } from "@/components/VideoFacade";
import { SourceTag } from "@/components/SourceTag";
import { canonicalFor } from "@/lib/canonical";
import { socialMeta } from "@/lib/social";
import { breadcrumbSchema, faqPageSchema, itemListSchema } from "@/lib/schema";
import {
  blueprintList,
  blueprintUnlocks,
  type Blueprint,
  type BlueprintsBundle,
} from "@/lib/data";
import { POSITIONS } from "@/lib/share-codec";
import blueprintsBundle from "@/public/data/blueprints.v1.json";

// SEO freeze (copy/r12j-wave2-copy-v1.md §4): title/H1/meta for
// `/signature-blueprints/by-position`. Banned words (official/best/guaranteed)
// never appear in page copy. R12J-I P2: title keeps the freeze text with no
// brand suffix (41 chars), meta trimmed to 152 chars (<=155).
const PAGE_TITLE = "NBA 2K27 Signature Blueprints by Position";
const PAGE_DESCRIPTION =
  "Browse 40 NBA 2K27 Signature Blueprints by position and playstyle. Single-source profiles are labeled Unverified; we do not rank blueprints — your pick.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalFor("/signature-blueprints/by-position") },
  ...socialMeta({
    path: "/signature-blueprints/by-position",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  }),
};

// FAQ freeze (copy §4, 3 entries, verbatim). FAQPage schema carries the same
// words only — no extrapolation.
const FAQS = [
  {
    question: "What is a Signature Blueprint?",
    answer:
      "A ready-made MyPLAYER template that blends three NBA/WNBA play styles into one build. NBA 2K27 launches with 40 of them, replacing the Pro-Tuned and NBA templates from previous years, with more added each season.",
  },
  {
    question: "Why is some blueprint data labeled Unverified?",
    answer:
      "Because 39 of the 40 detailed profiles currently come from a single public reference. Single-source data gets the Unverified label on this site — shown for planning, never presented as confirmed. Verification continues after launch.",
  },
  {
    question: "Which blueprint should I pick?",
    answer:
      "That's your call — we don't rank blueprints or name a strongest one. Filter by position, then playstyle, compare your shortlist side by side, and open the winner in the planner to adjust it for your body settings.",
  },
] as const;

// R12I real data bundle (blueprints.v1.json): 40 real Signature Blueprints.
const BLUEPRINTS = blueprintList(blueprintsBundle as BlueprintsBundle);

const POSITION_LABEL: Record<string, string> = {
  PG: "Point Guard",
  SG: "Shooting Guard",
  SF: "Small Forward",
  PF: "Power Forward",
  C: "Center",
};

// Playstyle (best_skill) display order inside each position group.
const PLAYSTYLE_ORDER = [
  "Finishing",
  "Shooting",
  "Playmaking",
  "Defense",
  "Rebounding",
  "Balanced",
] as const;

function topAttributes(bp: Blueprint, count: number): Array<{ label: string; value: number }> {
  const attrs = bp.profile?.attributes_start ?? {};
  return Object.entries(attrs)
    .filter((e): e is [string, number] => typeof e[1] === "number")
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, count);
}

function BlueprintCard({ bp }: { bp: Blueprint }) {
  const p = bp.profile;
  const nameIsConfirmed = bp.field_tiers.name === "official_confirmed";
  const unlockCount = blueprintUnlocks(bp).length;
  return (
    <li
      id={`bp-${bp.slug}`}
      className="flex flex-col gap-4 overflow-hidden rounded border border-border-low bg-surface-card transition-colors hover:border-primary-container"
    >
      {/* R12I-G card visual: original abstract court/position/playstyle art,
          local static asset (same pack as the main blueprints browser). */}
      {/* eslint-disable-next-line @next/next/no-img-element -- local static SVG asset */}
      <img
        src={`/assets/r12i/blueprints/blueprint-${bp.slug}.svg`}
        alt={`${bp.name} blueprint visual`}
        width={640}
        height={400}
        loading="lazy"
        className="aspect-[8/5] w-full border-b border-border-low object-cover"
      />
      <div className="flex flex-col gap-1 px-6">
        <h4 className="font-display text-headline-sm text-on-surface">{bp.name}</h4>
        <p className="text-body-sm text-text-muted">
          {p?.position ?? "—"}
          {p?.height ? ` · ${p.height}` : ""}
          {p?.weight_lb ? ` · ${p.weight_lb} lbs` : ""}
        </p>
      </div>
      <div className="flex flex-col gap-1.5 px-6">
        <p className="text-body-sm text-on-surface-variant">
          Blends: {bp.comparisons.join(" · ")}
        </p>
        {nameIsConfirmed ? <SourceTag tier="official" /> : null}
      </div>
      <ul className="flex flex-col gap-1 px-6">
        {topAttributes(bp, 3).map((a) => (
          <li key={a.label} className="flex items-center justify-between text-body-sm">
            <span className="text-on-surface-variant">{a.label}</span>
            <span className="text-primary-container">{a.value}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-3 border-t border-border-low px-6 pb-6 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Profile fields are single-source community data on every card;
              for Bulldozer the name/blend carry the confirmed tag above and
              this tag covers the profile only. */}
          <SourceTag tier="unverified" />
          <span className="text-body-sm text-text-muted">
            {unlockCount} badge unlocks at start
          </span>
        </div>
        <Link
          href={`/badge-token-planner#bp=${bp.index}`}
          className="text-label-md text-primary-container hover:underline"
        >
          Open in Planner →
        </Link>
      </div>
    </li>
  );
}

export default function BlueprintsByPositionPage() {
  const byPosition = POSITIONS.map((pos) => {
    const list = BLUEPRINTS.filter((bp) => bp.profile?.position === pos);
    const byPlaystyle = PLAYSTYLE_ORDER.map((skill) => ({
      skill,
      list: list.filter((bp) => bp.profile?.best_skill === skill),
    })).filter((g) => g.list.length > 0);
    return { pos, list, byPlaystyle };
  });

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-site flex-grow flex-col gap-12 px-4 py-12 md:px-margin-desktop">
      <JsonLdScript
        schema={[
          // ItemList: real blueprint roster, guard lifted per owner decision
          // r12i-wave1-owner-decision-2026-08-28 (same口径 as /signature-blueprints).
          itemListSchema({
            name: "NBA 2K27 Signature Blueprints by Position",
            items: BLUEPRINTS.map((bp) => ({
              name: bp.name,
              path: canonicalFor(`/signature-blueprints/by-position#bp-${bp.slug}`),
            })),
          }),
          faqPageSchema([...FAQS]),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Signature Blueprints", path: "/signature-blueprints" },
            { name: "By Position", path: "/signature-blueprints/by-position" },
          ]),
        ]}
      />

      <header className="flex max-w-3xl flex-col gap-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-body-sm text-text-muted">
          <Link href="/signature-blueprints" className="hover:text-on-surface">
            Blueprints
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-on-surface-variant">By Position</span>
        </nav>
        <h1 className="font-display text-display-lg text-primary-container">
          NBA 2K27 Signature Blueprints by Position
        </h1>
        {/* Page intro (copy §4, verbatim). */}
        <p className="text-body-lg text-on-surface-variant">
          {
            "All 40 launch Signature Blueprints, organized by position and playstyle so you can find a starting point fast. Pick your position, pick how you like to play, compare up to three side by side, then open one in the planner and make it yours."
          }
        </p>
      </header>

      {/* Position group nav (copy §4 design placement: 置顶). */}
      <nav
        aria-label="Jump to position group"
        className="flex flex-wrap gap-2 rounded border border-border-low bg-surface-card p-4"
      >
        {byPosition.map(({ pos, list }) => (
          <a
            key={pos}
            href={`#position-${pos.toLowerCase()}`}
            className="rounded border border-border-low bg-surface-container-high px-3 py-1.5 text-label-md font-bold text-on-surface-variant transition-colors hover:border-primary-container hover:text-on-surface"
          >
            {pos} · {POSITION_LABEL[pos]} ({list.length})
          </a>
        ))}
      </nav>

      {/* H2: How to Pick a Blueprint (copy §4, verbatim). */}
      <section className="flex max-w-3xl flex-col gap-4 rounded border border-border-low bg-surface-card p-6">
        <h2 className="font-display text-headline-md text-on-surface">How to Pick a Blueprint</h2>
        <p className="text-body-md text-on-surface-variant">
          {
            "Blueprints are starter templates, not verdicts. The shortest path is: position first, playstyle second, details third."
          }
        </p>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-body-md text-on-surface-variant">
          <li>
            <span className="font-semibold text-on-surface">Start at your position.</span> Every
            blueprint is grouped by the position it&apos;s built for.
          </li>
          <li>
            <span className="font-semibold text-on-surface">Filter by playstyle.</span> Each
            blueprint blends three NBA/WNBA play styles into one template — pick the blend that
            matches how you actually play, not how a tier list says you should.
          </li>
          <li>
            <span className="font-semibold text-on-surface">Compare, then adjust.</span> Shortlist
            up to three, open the comparison table, and load your pick into the Badge Token
            Planner to retune it for your height and body settings.
          </li>
        </ol>
        <p className="text-body-md text-on-surface-variant">
          {
            "We don't rank blueprints and we don't call any of them the strongest. A blueprint is a starting point — the right one depends on your mode, your squad, and your hands."
          }
        </p>
      </section>

      {/* H2: Browse by Position — 40 blueprints grouped by PG/SG/SF/PF/C, with
          playstyle sub-groups inside each position. Fully server-rendered. */}
      <section className="flex flex-col gap-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-headline-md text-on-surface">Browse by Position</h2>
          <span className="text-body-sm text-text-muted">
            {BLUEPRINTS.length} blueprints · {POSITIONS.length} positions
          </span>
        </div>
        {byPosition.map(({ pos, list, byPlaystyle }) => (
          <section
            key={pos}
            id={`position-${pos.toLowerCase()}`}
            className="flex scroll-mt-24 flex-col gap-6"
          >
            <h3 className="flex flex-wrap items-center gap-3 font-display text-headline-md text-on-surface">
              {/* Position group icons: playstyle discipline glyphs present in
                  this group (R12I-G pack has no per-position icon; discipline
                  icons are the approved position/playstyle visual markers). */}
              <span className="flex items-center gap-1" aria-hidden="true">
                {byPlaystyle.map(({ skill }) => (
                  <DisciplineIcon key={skill} discipline={skill} size={28} />
                ))}
              </span>
              {POSITION_LABEL[pos]}
              <span className="text-body-sm font-normal text-text-muted">
                {pos} · {list.length} blueprints
              </span>
            </h3>
            {byPlaystyle.map(({ skill, list: group }) => (
              <div key={skill} className="flex flex-col gap-3">
                <h4 className="flex items-center gap-2 text-label-md uppercase tracking-wide text-on-surface-variant">
                  <DisciplineIcon discipline={skill} size={20} />
                  Playstyle: {skill}{" "}
                  <span className="font-normal text-text-muted">({group.length})</span>
                </h4>
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((bp) => (
                    <BlueprintCard key={bp.index} bp={bp} />
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </section>

      {/* Interlinks: main browser + comparison table (mutual links per R12J-E). */}
      <section className="flex max-w-3xl flex-col gap-3 rounded border border-border-low bg-surface-card p-6">
        <h2 className="font-display text-headline-sm text-on-surface">Keep Exploring</h2>
        <p className="text-body-md text-on-surface-variant">
          {"Filter and search the full roster on the "}
          <Link href="/signature-blueprints" className="text-primary-container hover:underline">
            Signature Blueprints browser
          </Link>
          {", or open the "}
          <Link
            href="/signature-blueprints/compare"
            className="text-primary-container hover:underline"
          >
            comparison table
          </Link>
          {" to see attribute deltas across your shortlist."}
        </p>
      </section>

      {/* 2K Builder Courtside Report — click-to-load YouTube facade per design
          handoff §5 (approved video; initial HTML is a local SVG thumbnail +
          play button only, no third-party request before click). */}
      <section className="flex max-w-3xl flex-col gap-4">
        <h2 className="font-display text-headline-md text-on-surface">
          Watch the 2K Builder Courtside Report
        </h2>
        <VideoFacade
          videoId="MSZre4MBSBA"
          title="2K Builder Courtside Report"
          thumbnail="/assets/r12i/video/video-facade-courtside-report.svg"
        />
        <p className="text-body-sm text-text-muted">
          {
            "Video hosted on YouTube by 2K. My2KBuilder is an independent, fan-made planning tool and is not affiliated with 2K."
          }
        </p>
      </section>

      {/* H2: About Blueprint Data (copy §4 footer block, verbatim — must not
          be removed; carries the Unverified roster note + last-verified). */}
      <section className="flex max-w-3xl flex-col gap-3 rounded border border-border-low bg-surface-card p-6">
        <h2 className="font-display text-headline-sm text-on-surface">About Blueprint Data</h2>
        <p className="text-body-md text-on-surface-variant">
          {
            "The count — 40 blueprints at launch, with more added each season — comes from 2K-published material. Detailed per-blueprint profiles are still being verified: 39 of the 40 currently come from a single public reference and are labeled Unverified; one profile matches 2K-published material. Unverified fields are shown with their label, never as settled fact, and a full re-check is scheduled after launch. Last verified: 2026-08-28."
          }
        </p>
      </section>

      {/* FAQ at page bottom (copy §4 design placement; 3 freeze entries). */}
      <section className="flex max-w-3xl flex-col gap-4">
        <h2 className="font-display text-headline-md text-on-surface">Blueprints by Position FAQ</h2>
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
      </section>
    </main>
  );
}
