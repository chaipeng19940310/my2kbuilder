import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/JsonLdScript";
import { DisciplineIcon } from "@/components/DisciplineIcon";
import { VideoFacade } from "@/components/VideoFacade";
import { SourceTag } from "@/components/SourceTag";
import { CapBreakerCalculator, type CapCalcBadge, type CapCalcTierReq } from "@/components/CapBreakerCalculator";
import { canonicalFor } from "@/lib/canonical";
import { socialMeta } from "@/lib/social";
import { breadcrumbSchema, faqPageSchema, webPageSchema } from "@/lib/schema";
import {
  BADGE_TIERS,
  DISCIPLINES,
  badgeCatalog,
  heightRestrictionLabel,
  type BadgeTier,
  type BadgeRequirementsBundle,
} from "@/lib/data";
import badgeRequirementsBundle from "@/public/data/badge-requirements.v1.json";
import { GuideToc } from "@/components/GuideToc";

// SEO freeze (copy/r12j-wave2-copy-v1.md §2; title kept without the layout
// suffix — "%s | My2KBuilder" renders 54 chars total, within the R12J-F
// <=60-char rule; meta trimmed to 153 chars, within the <=155 rule).
const PAGE_TITLE = "NBA 2K27 Cap Breakers — How to Plan Them";
const PAGE_DESCRIPTION =
  "Cap Breakers return in NBA 2K27 with in-game 99 OVR previews and Build Specialization. Learn mechanics and plan breakers backwards from badge thresholds.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalFor("/cap-breakers") },
  ...socialMeta({
    path: "/cap-breakers",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  }),
};

// FAQ freeze (copy §2, 5 entries, verbatim).
const FAQS = [
  {
    question: "What is a Cap Breaker?",
    answer:
      "A cap breaker raises an attribute past the maximum your body settings allowed at creation. Cap Breakers return in NBA 2K27, and the in-game builder previews each breaker's gain once you reach 99 OVR.",
  },
  {
    question: "Where can I see exact cap-breaker gains?",
    answer:
      "In the in-game builder's 99 OVR preview. This site does not list per-attribute gain values — they are pending verification and will only appear after collection and double-checking. No estimates, no placeholders.",
  },
  {
    question: "How many cap breakers do I need for a specific badge?",
    answer:
      "Work backwards. Find the badge's attribute threshold — for example, Gold Posterizer at 93 Driving Dunk (cross-checked) — subtract your build's cap, then check the in-game preview to see how many breakers cover the difference.",
  },
  {
    question: "What is Build Specialization?",
    answer:
      "A returning progression system with six tracks — Finishing, Shooting, Playmaking, Defense, Rebounding, and the new Physicals. Each track has 10 tasks; completing one to level 10 grants a permanent +2 Synergy.",
  },
  {
    question: "Do cap breakers and Synergy do the same thing?",
    answer:
      "No — they solve different halves of the same plan. Cap breakers raise attribute ratings. Synergy raises badge tiers, and it's the only path to Legend. A common pattern is cap breakers to reach a Gold threshold, then Synergy to push beyond it.",
  },
] as const;

// R12I-A production bundle: 53 real badges, four-tier requirements, every
// requirement cell cross_checked. The calculator runs on this bundle only.
const BADGES = badgeCatalog(badgeRequirementsBundle as BadgeRequirementsBundle);

/** Compact, serializable calculator dataset derived at build time. */
const CALC_BADGES: CapCalcBadge[] = BADGES.map((b) => ({
  slug: b.slug,
  name: b.name,
  category: b.category,
  tiers: Object.fromEntries(
    BADGE_TIERS.map((t: BadgeTier) => [
      t,
      {
        logic: b.requirements[t].logic,
        conditions: b.requirements[t].conditions.map((c) => ({
          attribute: c.attribute,
          min: c.min_rating,
        })),
        height: heightRestrictionLabel(b.requirements[t].height_restriction),
      } satisfies CapCalcTierReq,
    ]),
  ) as Record<BadgeTier, CapCalcTierReq>,
}));

const SPECIALIZATION_TRACKS: Array<{ name: string; isNew: boolean }> = DISCIPLINES.map((d) => ({
  name: d,
  isNew: d === "Physicals",
}));

export default function CapBreakersPage() {
  return (
    <main className="r18-page r18-guide-page relative z-10 mx-auto w-full max-w-site flex-grow gap-12 px-4 py-12 md:px-margin-desktop">
      <JsonLdScript
        schema={[
          webPageSchema({
            name: PAGE_TITLE,
            description: PAGE_DESCRIPTION,
            url: canonicalFor("/cap-breakers"),
          }),
          faqPageSchema([...FAQS]),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cap Breakers", path: "/cap-breakers" },
          ]),
        ]}
      />
      <GuideToc items={[
        { href: "#how-cap-breakers-work", label: "How They Work" },
        { href: "#build-specialization", label: "Build Specialization" },
        { href: "#plan-backwards", label: "Plan Backwards" },
        { href: "#cap-breakers-video", label: "Builder Video" },
        { href: "#cap-breakers-faq", label: "FAQ" },
      ]} />

      <header className="flex max-w-3xl flex-col gap-4">
        <h1 className="font-display text-display-lg text-primary-container">
          NBA 2K27 Cap Breakers
        </h1>
        {/* Page intro (copy §2, verbatim). */}
        <p className="text-body-lg text-on-surface-variant">
          {
            "Cap Breakers return in NBA 2K27, and the builder now previews what each breaker adds to every attribute once you hit 99 OVR. This page explains the mechanics and shows you how to plan breakers backwards from badge thresholds. Exact per-attribute gain values are not listed here — those numbers live in the in-game preview and are pending verification on this site."
          }
        </p>
      </header>

      {/* H2 #1 (copy §2, verbatim) + mechanics flow strip (visual reuse of the
          R12I-G tier-chip design language; no pure-text sections). */}
      <section id="how-cap-breakers-work" className="flex max-w-3xl flex-col gap-4">
        <h2 className="font-display text-headline-md text-on-surface">How Cap Breakers Work</h2>
        <p className="text-body-md text-on-surface-variant">
          {
            "Cap Breakers let you push attributes past the caps your height, weight, and wingspan set at creation. New in NBA 2K27: when your MyPLAYER reaches 99 OVR, the in-game builder shows a preview of the gain each cap breaker would give each attribute, so you can see the payoff before you spend."
          }
        </p>
        <ol className="flex flex-col gap-2 md:flex-row md:items-stretch md:gap-3">
          {[
            "Reach 99 OVR on your MyPLAYER",
            "Preview each breaker's gain in-game",
            "Spend breakers past the creation cap",
          ].map((step, i) => (
            <li
              key={step}
              className="flex flex-1 items-center gap-3 rounded border border-border-low bg-surface-card p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-container text-label-md font-bold text-primary-container">
                {i + 1}
              </span>
              <span className="text-body-md text-on-surface">{step}</span>
            </li>
          ))}
        </ol>
        <p className="text-body-md text-on-surface-variant">
          {
            "What this site does not show: the specific gain per breaker, per attribute. Those values are pending verification — collection and double-checking come first, numbers later. Until then, use the in-game preview as the source of truth for exact gains."
          }
        </p>
      </section>

      {/* H2 #2 (copy §2, verbatim) + six-track icon grid (R12I-G discipline
          icons, design handoff §2). */}
      <section id="build-specialization" className="flex flex-col gap-4">
        <h2 className="font-display text-headline-md text-on-surface">Build Specialization</h2>
        <p className="max-w-3xl text-body-md text-on-surface-variant">
          {
            "Build Specialization returns with six tracks, including the new Physicals discipline. Each track has 10 tasks, and finishing a track to level 10 grants a permanent +2 Synergy. Synergy is how badges reach Legend — it can't be unlocked from attributes at creation — so a finished specialization track is part of any Legend-tier plan."
          }
        </p>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {SPECIALIZATION_TRACKS.map((t) => (
            <li
              key={t.name}
              className="flex flex-col items-center gap-2 rounded border border-border-low bg-surface-card p-4 text-center"
            >
              <DisciplineIcon discipline={t.name} size={32} />
              <span className="text-label-md text-on-surface">{t.name}</span>
              {t.isNew ? (
                <span className="rounded border border-secondary-container px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-secondary">
                  NEW
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {/* H2 #3 (copy §2, verbatim steps) + worked examples + interactive gap
          calculator. Tier strip visual from the R12I-G pack (design handoff §1). */}
      <section id="plan-backwards" className="flex flex-col gap-6">
        <div className="flex max-w-3xl flex-col gap-4">
          <h2 className="font-display text-headline-md text-on-surface">
            Plan Backwards from Thresholds
          </h2>
          <p className="text-body-md text-on-surface-variant">
            {
              "The practical way to use cap breakers is to start from the badge you want, not from the attribute you like."
            }
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- local static SVG asset from the R12I-G pack */}
          <img
            src="/assets/r12i/tiers/tier-strip.svg"
            alt="Badge tier path from Bronze through Silver, Gold, and Hall of Fame, with Legend as a planning marker"
            width={920}
            height={180}
            loading="lazy"
            className="w-full max-w-2xl rounded border border-border-low object-contain"
          />
          <ol className="flex list-decimal flex-col gap-3 pl-5 text-body-md text-on-surface-variant">
            <li>
              <span className="font-semibold text-on-surface">Pick the target badge tier.</span>{" "}
              Example: Gold Posterizer requires 93 Driving Dunk (cross-checked threshold layer on{" "}
              <Link href="/badge-requirements" className="text-primary-container hover:underline">
                Badge Requirements
              </Link>
              ).
            </li>
            <li>
              <span className="font-semibold text-on-surface">Check your build&apos;s cap.</span> If
              your body settings cap Driving Dunk below 93, the gap is what cap breakers need to
              cover.
            </li>
            <li>
              <span className="font-semibold text-on-surface">Check the in-game preview.</span> At
              99 OVR the builder shows what each breaker adds — count how many breakers close the
              gap. Per-breaker gains are pending verification here, so this step happens in-game.
            </li>
            <li>
              <span className="font-semibold text-on-surface">Plan the rest of the plan.</span> A
              permanent +2 Synergy from Build Specialization can then carry the badge path toward
              Legend.
            </li>
          </ol>
          <p className="text-body-md text-on-surface-variant">
            {
              "The same logic works for any threshold on this site — badge requirements are cross-checked, Takeover thresholds are labeled Unverified, and animation thresholds are third-party compiled. The label tells you how much to trust the number before you build around it."
            }
          </p>
        </div>

        {/* Static worked examples (task requirement): target threshold → gap →
            breaker recommendation, each with its source label. The 93 Driving
            Dunk (AND Vertical 80) and 91 Three-Point Shot thresholds are bundle
            values; the 85/84 current ratings are illustrative inputs. No
            per-breaker gain numbers appear anywhere. */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3 rounded border border-border-low bg-surface-card p-6">
            <h3 className="font-display text-headline-sm text-on-surface">
              Worked example — Gold Posterizer
            </h3>
            <SourceTag tier="cross" />
            <p className="text-body-md text-on-surface-variant">
              {
                "Target: Gold Posterizer requires Driving Dunk 93 and Vertical 80. If your build caps Driving Dunk at 85, that attribute alone is 8 points short — cap breakers must cover the gap before the tier can unlock."
              }
            </p>
            <p className="text-body-md text-on-surface-variant">
              {
                "Exact gains are shown in the in-game preview and are pending verification here — count in-game at 99 OVR how many breakers close the gap, then let a finished specialization track's +2 Synergy carry the badge toward Legend."
              }
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded border border-border-low bg-surface-card p-6">
            <h3 className="font-display text-headline-sm text-on-surface">
              Worked example — Zip Code (Takeover)
            </h3>
            <SourceTag tier="unverified" />
            <p className="text-body-md text-on-surface-variant">
              {
                "Target: the Zip Code Takeover asks for Three-Point Shot 91 — a single-source threshold, labeled Unverified. If your build caps Three-Point Shot at 84, the gap is 7."
              }
            </p>
            <p className="text-body-md text-on-surface-variant">
              {
                "Treat the threshold as a planning reference and confirm it in-game before you spend. Exact gains are shown in the in-game preview and are pending verification here."
              }
            </p>
          </div>
        </div>

        {/* Interactive calculator (task requirement): current rating + target
            badge tier in, gap out. Pure client-side arithmetic on the verified
            bundle; per-breaker gains stay pending-verification verbatim. */}
        <div className="flex max-w-3xl flex-col gap-3">
          <h3 className="font-display text-headline-sm text-on-surface">Gap Calculator</h3>
          <p className="text-body-md text-on-surface-variant">
            {
              "Pick a badge and tier, enter your current rating, and see the gap cap breakers would need to cover. Then "
            }
            <Link href="/badge-token-planner" className="text-primary-container hover:underline">
              open the Badge Token Planner
            </Link>
            {" to map the rest of the build around it."}
          </p>
          <CapBreakerCalculator badges={CALC_BADGES} />
        </div>
      </section>

      {/* 2K Builder Courtside Report — click-to-load facade per design handoff
          §5 (Owner re-confirmed 2026-08-28: embed the builder video here). */}
      <section id="cap-breakers-video" className="flex max-w-3xl flex-col gap-4">
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

      {/* FAQ at page bottom (copy §2 design placement; 5 freeze entries). */}
      <section id="cap-breakers-faq" className="flex max-w-3xl flex-col gap-4">
        <h2 className="font-display text-headline-md text-on-surface">Cap Breakers FAQ</h2>
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
          {"Check the thresholds you are planning around on "}
          <Link href="/badge-requirements" className="text-primary-container hover:underline">
            Badge Requirements
          </Link>
          {", then map the full build in the "}
          <Link href="/badge-token-planner" className="text-primary-container hover:underline">
            Badge Token Planner
          </Link>
          {"."}
        </p>
        <p className="text-body-sm text-text-muted">
          {"Last verified: 2026-08-28. Thresholds can move with game updates — confirm in-game before you commit attribute points."}
        </p>
      </section>
    </main>
  );
}
