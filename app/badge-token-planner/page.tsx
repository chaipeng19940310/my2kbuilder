import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/JsonLdScript";
import { DisciplineIcon } from "@/components/DisciplineIcon";
import { SourceTag } from "@/components/SourceTag";
import { canonicalFor } from "@/lib/canonical";
import { socialMeta } from "@/lib/social";
import {
  breadcrumbSchema,
  faqPageSchema,
  softwareApplicationSchema,
} from "@/lib/schema";
import {
  BADGE_TIERS,
  BADGE_TIER_LABEL,
  DISCIPLINES,
  badgeCatalog,
  heightRestrictionLabel,
  tokenCostMap,
  type BadgeRequirementsBundle,
  type BadgeTier,
  type BadgeTierRequirement,
  type TokenCostBundle,
} from "@/lib/data";
import badgeRequirementsBundle from "@/public/data/badge-requirements.v1.json";
import tokenCostsBundle from "@/public/data/badge-token-costs.v1.json";
import { PlannerClient } from "./PlannerClient";

// SEO freeze (seo §3): title/H1/meta for `/badge-token-planner`.
export const metadata: Metadata = {
  title: "NBA 2K27 Badge Token Planner — 53 Badges, 20 Slots",
  description:
    "Allocate Badge Tokens across 20 slots with reference token costs (single-source, unverified) and real unlock requirements. Free tool, no download.",
  alternates: { canonical: canonicalFor("/badge-token-planner") },
  ...socialMeta({
    path: "/badge-token-planner",
    title: "NBA 2K27 Badge Token Planner — 53 Badges, 20 Slots",
    description:
      "Allocate Badge Tokens across 20 slots with reference token costs (single-source, unverified) and real unlock requirements. Free tool, no download.",
  }),
};

// FAQ freeze (copy §5.2). 2026-09-04 (Owner decision): single-source community
// reference-build token costs are now published with the Unverified label.
const FAQS = [
  {
    question: "Why do token costs change when I change height?",
    answer:
      "That's how NBA 2K27 works: badge token costs vary by height and position, a mechanic described on 2K's builder pages. The costs shown in this planner are single-source community reference-build values labeled Unverified — treat them as a baseline and confirm the exact cost of your build in the in-game Builder.",
  },
  {
    question: "Can I save my plan?",
    answer:
      "Yes — generate a share link and keep it. Opening that link restores the exact same allocation.",
  },
] as const;

// R12I-D: build-time catalog for the server-rendered roster below — the full
// 53-badge list with four-tier requirements must be crawlable without JS.
const CATALOG = badgeCatalog(badgeRequirementsBundle as BadgeRequirementsBundle);
const COSTS = tokenCostMap(tokenCostsBundle as TokenCostBundle);

const TIER_CHIP_CLASS: Record<BadgeTier, string> = {
  bronze: "tier-chip tier-bronze",
  silver: "tier-chip tier-silver",
  gold: "tier-chip tier-gold",
  hof: "tier-chip tier-hof",
};

function tierRequirementText(req: BadgeTierRequirement): string {
  const connective = req.logic === "AND" ? " and " : req.logic === "OR" ? " or " : "";
  return req.conditions.map((c) => `${c.attribute} ${c.min_rating}`).join(connective);
}

export default function BadgeTokenPlannerPage() {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-site flex-grow flex-col gap-12 bg-page-bg px-4 py-12 md:px-margin-desktop">
      <JsonLdScript
        schema={[
          softwareApplicationSchema({
            name: "NBA 2K27 Badge Token Planner",
            description:
              "Allocate Badge Tokens across 20 slots with reference token costs (single-source, unverified) and real unlock requirements.",
            applicationCategory: "WebApplication",
          }),
          faqPageSchema([...FAQS]),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Badge Token Planner", path: "/badge-token-planner" },
          ]),
        ]}
      />

      <header className="flex max-w-3xl flex-col gap-4">
        <h1 className="font-display text-display-lg text-primary-container">
          NBA 2K27 Badge Token Planner
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          In NBA 2K27, every badge costs tokens — and the price changes with your height and
          position. Build your allocation here first, then spend with confidence in-game.
        </p>
      </header>

      {/* Tool body first (copy §3.2 design placement) */}
      <PlannerClient bundle={badgeRequirementsBundle as BadgeRequirementsBundle} costs={tokenCostsBundle as TokenCostBundle} />

      {/* Owner-authorized 2K screenshot below the tool (tool keeps first
          placement per copy §3.2; local static asset, no third-party request). */}
      <figure className="flex max-w-4xl flex-col gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- local static asset */}
        <img
          src="/assets/keyart/nba2k27-badge-loadouts-1920x1080.jpg"
          alt="NBA 2K27 Badge Loadouts in the MyPLAYER Builder"
          width={1920}
          height={1080}
          loading="lazy"
          className="h-auto w-full rounded border border-border-low"
        />
        <figcaption className="text-body-sm text-text-muted">
          {
            "NBA 2K27 Badge Loadouts (2K). My2KBuilder is an independent, fan-made planning tool and is not affiliated with 2K."
          }
        </figcaption>
      </figure>

      {/* Explanatory sections below the tool (copy §3.2 H2 structure) */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-3 rounded border border-border-low bg-surface-card p-6">
          <h2 className="font-display text-headline-sm text-on-surface">Allocate Your 20 Badge Slots</h2>
          <p className="text-body-md text-on-surface-variant">
            NBA 2K27 gives every MyPLAYER 20 badge slots across 53 badges and six disciplines —
            Finishing, Shooting, Playmaking, Defense, Rebounding, and the new Physicals. Pick a
            position, set your height, rank the disciplines you care about, then assign slots
            badge by badge. The budget bar tracks every slot you spend, and the planner warns you
            the moment an allocation goes over budget — before you lock anything in-game.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded border border-border-low bg-surface-card p-6">
          <h2 className="font-display text-headline-sm text-on-surface">Why Token Costs Move</h2>
          <p className="text-body-md text-on-surface-variant">
            Token costs in NBA 2K27 are not flat: the same badge can cost more or less depending on
            your height and position — a mechanic described on 2K&apos;s builder pages. The costs
            shown here are single-source community reference-build values labeled Unverified: a
            baseline for planning, not your build&apos;s exact price — the in-game Builder is
            authoritative. Alongside them you get the real data: the
            53-badge roster from 2K&apos;s published list, plus every badge&apos;s{" "}
            <Link href="/badge-requirements" className="text-primary-container hover:underline">
              attribute unlock requirements
            </Link>{" "}
            cross-checked across two public community tables, and every{" "}
            <Link href="/takeover-requirements" className="text-primary-container hover:underline">
              Takeover unlock threshold
            </Link>{" "}
            with its source label. And when a target threshold sits
            above your build&apos;s creation cap, the{" "}
            <Link href="/cap-breakers" className="text-primary-container hover:underline">
              Cap Breakers guide
            </Link>{" "}
            shows how to plan that gap backwards. And before copying a 2K26 build over, check the{" "}
            <Link href="/2k26-to-2k27-build-pitfalls" className="text-primary-container hover:underline">
              2K26-to-2K27 pitfalls guide
            </Link>{" "}
            — body penalties, animation thresholds, and season resets all changed.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded border border-border-low bg-surface-card p-6">
          <h2 className="font-display text-headline-sm text-on-surface">Share Your Plan</h2>
          <p className="text-body-md text-on-surface-variant">
            A finished plan turns into a single link. The full allocation — position, height,
            discipline priorities, and badge slots — is encoded inside the link itself, so there is
            no account, no sign-up, and nothing stored on a server. Anyone who opens the link sees
            the exact same build, and you can keep editing from{" "}
            <Link href="/build-card" className="text-primary-container hover:underline">
              the build card
            </Link>{" "}
            or start over any time.
          </p>
        </div>
      </section>

      {/* R12I-D: server-rendered badge roster — all 53 badges with four-tier
          unlock requirements, grouped by discipline with tier visuals and
          discipline icons (design pack t_65009bdd). Crawlable without JS. */}
      <section className="flex flex-col gap-6">
        <div className="flex max-w-3xl flex-col gap-3">
          <h2 className="font-display text-headline-md text-on-surface">
            All 53 Badges — Unlock Requirements
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Every badge with the attribute ratings needed for Bronze, Silver, Gold, and Hall of
            Fame. AND means every listed attribute must qualify; OR means one is enough. Height
            limits are shown where they apply. Badge names and categories come from 2K&apos;s
            published roster; requirement cells are a community reference cross-checked across two
            public tables. Legend is not a direct unlock tier — it requires Synergy boosts once the
            badge is part of the build.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <SourceTag tier="cross" />
            <span className="text-body-sm text-text-muted">
              Token costs: single-source reference-build values — Unverified.
            </span>
          </div>
        </div>
        {DISCIPLINES.map((discipline) => {
          const badges = CATALOG.filter((b) => b.category === discipline);
          if (badges.length === 0) return null;
          return (
            <div key={discipline} className="roster-group">
              <h3 className="roster-title">
                <DisciplineIcon discipline={discipline} size={24} />
                {discipline}
                <span className="roster-count">
                  {badges.length} badges
                </span>
              </h3>
              <ul className="roster-list">
                {badges.map((badge) => {
                  const heightText = heightRestrictionLabel(
                    badge.requirements.bronze.height_restriction,
                  );
                  return (
                    <li key={badge.index} className="roster-card">
                      <div className="roster-head">
                        <span>{badge.name}</span>
                        {badge.is_new_2k27 ? (
                          <span className="roster-new">
                            NEW
                          </span>
                        ) : null}
                        {heightText ? (
                          <span className="roster-meta">Height {heightText}</span>
                        ) : null}
                        {badge.conflicts.length > 0 ? (
                          <span className="roster-conflict">
                            Sources differ
                          </span>
                        ) : null}
                      </div>
                      <div className="roster-tiers">
                        {BADGE_TIERS.map((tier) => (
                          <span key={tier} className={`${TIER_CHIP_CLASS[tier]} roster-tier`}>
                            {BADGE_TIER_LABEL[tier]}: {tierRequirementText(badge.requirements[tier])}
                          </span>
                        ))}
                      </div>
                      {COSTS.get(badge.slug) ? (
                        <p className="mt-2 text-body-sm text-text-muted">
                          Token cost B/S/G/H: {COSTS.get(badge.slug)!.bronze}/{COSTS.get(badge.slug)!.silver}/{COSTS.get(badge.slug)!.gold}/{COSTS.get(badge.slug)!.hof} — reference build, unverified
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        <p className="text-body-sm text-text-muted">
          Source tiers and update log →{" "}
          <Link href="/methodology" className="text-primary-container hover:underline">
            See our Methodology
          </Link>
        </p>
      </section>

      {/* FAQ at page bottom (copy §3.2). Content from the copy freeze only. */}
      <section className="flex max-w-3xl flex-col gap-4">
        <h2 className="font-display text-headline-md text-on-surface">Badge Token Planner FAQ</h2>
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
