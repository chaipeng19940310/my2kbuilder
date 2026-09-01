import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { JsonLdScript } from "@/components/JsonLdScript";
import { SourceTag } from "@/components/SourceTag";
import { canonicalFor } from "@/lib/canonical";
import { socialMeta } from "@/lib/social";
import { DATA_LAST_VERIFIED } from "@/lib/env";
import { aboutPageSchema, breadcrumbSchema } from "@/lib/schema";
import {
  displayTier,
  tierCounts,
  type DataRecord,
  type PublicReferenceBundle,
  type SourceType,
} from "@/lib/data";
import publicRef from "@/public/data/public-reference.v1.json";

// SEO freeze (seo §3): title/H1/meta for `/methodology`.
// R11D P2-2: description names only the tiers of the current public version.
export const metadata: Metadata = {
  title: "Data Methodology — How We Source NBA 2K27 Builder Data",
  description:
    "My2KBuilder labels each field by source tier: official confirmed, cross-checked community reference, or community unverified. See what's verified and when.",
  alternates: { canonical: canonicalFor("/methodology") },
  ...socialMeta({
    path: "/methodology",
    title: "Data Methodology — How We Source NBA 2K27 Builder Data",
    description:
      "My2KBuilder labels each field by source tier: official confirmed, cross-checked community reference, or community unverified. See what's verified and when.",
  }),
};

/**
 * Source tiers of the current public version (R11D, QA P2-2 + owner approval).
 * hq_app_observed is intentionally absent: it is disabled as a current public
 * version type until HQ App manual collection + dual review + freeze v0.
 */
const TIERS = [
  {
    tag: "OFFICIAL_CONFIRMED",
    title: "Official Confirmed",
    body: "Announced by 2K on official channels. Example: the September 4, 2026 launch date.",
    tools: [
      { label: "Badge Token Planner", href: "/badge-token-planner" },
      { label: "Signature Blueprints", href: "/signature-blueprints" },
    ],
  },
  {
    tag: "CROSS_CHECKED",
    title: "Cross-Checked Community Reference",
    body: "Two independent public community sources agree on the same value. Shown as a community reference — never presented as official, and never copied from paid or proprietary data.",
    tools: [],
  },
  {
    tag: "COMMUNITY_UNVERIFIED",
    title: "Community Unverified",
    body: "A single public community source, or a value we cannot confirm yet. Always labeled Unverified on the page; rumors and leaks never appear in our data tables.",
    tools: [],
  },
] as const;

const DONT_PUBLISH = [
  "Rumors, leaks, and community predictions presented as fact.",
  "Badge token cost numbers before collection, dual review, and a frozen v0 — the public reference layer ships the cost matrix as a skeleton with null values and a gap statement, never as invented numbers.",
  "HQ App observed data of any kind — that tier is disabled until manual collection, dual review, and freeze are complete.",
  "Paid or proprietary data copied from community sites.",
] as const;

const bundle = publicRef as PublicReferenceBundle;
const records = bundle.records;
const tiers = tierCounts(records);

const isBadgeRequirement = (r: DataRecord) => r.key.startsWith("badge.") && r.key.includes(".requirement.");
const isBadgeIdentity = (r: DataRecord) => r.key.startsWith("badge.") && !r.key.includes(".requirement.");

const badgeIdentity = records.filter(isBadgeIdentity);
const badgeRequirements = records.filter(isBadgeRequirement);
const officialFacts = records.filter((r) => r.key.startsWith("official.") || r.key.startsWith("mechanic."));
const blueprintRecords = records.filter((r) => r.key.startsWith("blueprint."));
const takeoverRebirth = records.filter((r) => r.key.startsWith("takeover.") || r.key.startsWith("rebirth."));
const badgeTokenCost = records.filter((r) => r.key.startsWith("badge_token.cost."));

function groupTierBreakdown(list: DataRecord[]): Array<[SourceType, number]> {
  const counts = tierCounts(list);
  return (Object.entries(counts) as Array<[SourceType, number]>).filter(([, n]) => n > 0);
}

const TIER_LABEL: Record<SourceType, string> = {
  official_confirmed: "Official Confirmed",
  cross_checked: "Cross-Checked",
  community_unverified: "Community Unverified",
};

function TierChips({ list }: { list: DataRecord[] }) {
  return (
    <span className="flex flex-wrap gap-2">
      {groupTierBreakdown(list).map(([tier, n]) => (
        <span
          key={tier}
          className="rounded border border-secondary-container px-2 py-0.5 text-code-sm text-secondary"
        >
          {TIER_LABEL[tier]} × {n}
        </span>
      ))}
    </span>
  );
}

export default function MethodologyPage() {
  const positionCoverage = records.find((r) => r.key === "blueprint.position_coverage");
  const conflicts = bundle.conflicts ?? [];
  const nullCostRecords = badgeTokenCost.filter((r) => r.value === null).length;

  return (
    <main className="r18-page r18-methodology relative z-10 mx-auto flex w-full max-w-site flex-grow flex-col gap-12 px-4 py-12 md:px-margin-desktop">
      <JsonLdScript
        schema={[
          aboutPageSchema({
            name: "Data Methodology",
            description:
              "How My2KBuilder sources NBA 2K27 build data: official announcements, cross-checked community references, and clearly labeled unverified data.",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Methodology", path: "/methodology" },
          ]),
        ]}
      />

      <section className="flex flex-col items-center gap-4 border-b border-dashed border-border-low py-8 text-center">
        <h1 className="font-display text-display-lg text-primary-container">Data Methodology</h1>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">
          How we verify every number on this site, and when it was last checked.
        </p>
      </section>

      <section>
        <h2 className="mb-6 font-display text-headline-md text-on-surface">Source Tiers</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <div key={t.tag} className="flex flex-col gap-3 rounded border border-border-low bg-surface-card p-6">
              <span className="w-fit rounded border border-secondary-container px-2 py-0.5 text-code-sm text-secondary">
                {t.tag}
              </span>
              <h3 className="font-display text-headline-sm text-on-surface">{t.title}</h3>
              <p className="text-body-md text-on-surface-variant">{t.body}</p>
              {t.tools.length > 0 ? (
                <p className="text-body-sm text-text-muted">
                  Used by:{" "}
                  {t.tools.map((tool, i) => (
                    <span key={tool.href}>
                      {i > 0 ? ", " : ""}
                      <Link href={tool.href} className="text-primary-container hover:underline">
                        {tool.label}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          ))}
        </div>
        <p className="mt-4 text-body-sm text-text-muted">
          A fourth tier — HQ App Observed, hand-collected from the official 2K HQ App builder and
          dual-reviewed — is planned for the badge token cost matrix. It is not part of the current
          public version: no HQ App observed data is published anywhere on this site yet.
        </p>
      </section>

      {/* R11D: public reference bundle v1, vendored and rendered with tiers. */}
      <section className="rounded border border-border-low bg-surface-card p-6 md:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-headline-md text-on-surface">Public Reference Data (v1)</h2>
          <SourceTag tier="cross" />
        </div>
        <p className="mb-6 text-body-md text-on-surface-variant">
          Our public reference layer is a {records.length}-record snapshot captured on{" "}
          {DATA_LAST_VERIFIED} from public sources only — official 2K channels and community
          reference sites. Every record carries a source tier, a source link, and a confidence
          label. Current tier mix:{" "}
          <span className="text-on-surface">
            {TIER_LABEL.official_confirmed} × {tiers.official_confirmed}
          </span>
          ,{" "}
          <span className="text-on-surface">
            {TIER_LABEL.cross_checked} × {tiers.cross_checked}
          </span>
          ,{" "}
          <span className="text-on-surface">
            {TIER_LABEL.community_unverified} × {tiers.community_unverified}
          </span>
          .
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3 rounded border border-border-low p-5">
            <h3 className="font-display text-headline-sm text-on-surface">Official timeline &amp; mechanics</h3>
            <TierChips list={officialFacts} />
            <p className="text-body-sm text-on-surface-variant">
              Launch date, early access, platforms, pricing, and core builder mechanics from
              official 2K announcements; the badge equippable-tier table is a cross-checked
              community reference. <SourceTag tier="official" />
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded border border-border-low p-5">
            <h3 className="font-display text-headline-sm text-on-surface">Badge names &amp; categories</h3>
            <TierChips list={badgeIdentity} />
            <p className="text-body-sm text-on-surface-variant">
              The 53-badge list with categories and new-badge flags, as published on the official
              2K features pages; the requirement-roster cross-check against community tables is
              labeled Cross-Checked.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded border border-border-low p-5">
            <h3 className="font-display text-headline-sm text-on-surface">Badge unlock requirements</h3>
            <TierChips list={badgeRequirements} />
            <p className="text-body-sm text-on-surface-variant">
              Attribute and height requirements per badge tier. Two independent public community
              sources agree on every stored value; presented as a community reference, not as
              official data. <SourceTag tier="cross" />
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded border border-border-low p-5">
            <h3 className="font-display text-headline-sm text-on-surface">Signature Blueprint profiles</h3>
            <TierChips list={blueprintRecords} />
            <p className="text-body-sm text-on-surface-variant">
              The launch count and the officially named Bulldozer comparisons are official; the 40
              per-blueprint profile fields come from a single community source and are labeled
              Unverified.
              {positionCoverage ? (
                <>
                  {" "}
                  The 8-per-position coverage split is single-source too, so it is shown here as{" "}
                  {TIER_LABEL[displayTier(positionCoverage)]} even though its 40-template aggregate
                  matches the official count.
                </>
              ) : null}{" "}
              <SourceTag tier="unverified" />
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded border border-border-low p-5">
            <h3 className="font-display text-headline-sm text-on-surface">Takeover &amp; Rebirth values</h3>
            <TierChips list={takeoverRebirth} />
            <p className="text-body-sm text-on-surface-variant">
              Takeover and Rebirth counts are official; per-ability and per-tier values come from a
              single community source and stay Unverified pending in-game confirmation.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded border border-border-low p-5">
            <h3 className="font-display text-headline-sm text-on-surface">Badge Token cost matrix</h3>
            <TierChips list={badgeTokenCost} />
            <p className="text-body-sm text-on-surface-variant">
              Gap statement: no public source publishes the full token cost matrix, so this layer
              ships a skeleton only — {nullCostRecords} of {badgeTokenCost.length} records are
              deliberately null and the rest describe the sampling grid and the official pricing
              mechanic, not costs. No numeric token costs are published anywhere on this site.{" "}
              <SourceTag tier="unverified" />
            </p>
          </div>
        </div>
        {conflicts.length > 0 ? (
          <div className="mt-6 flex items-start gap-2 rounded border border-outline-variant bg-surface-container-low p-3">
            <Icon name="warning" size={18} className="mt-0.5 shrink-0 text-error" />
            <p className="text-body-sm text-on-surface-variant">
              Known source conflicts ({conflicts.length}):{" "}
              {conflicts.map((c) => `${c.badge} — ${c.issue}`).join("; ")}. Conflicted records keep
              their conflict flags and stay at medium confidence until in-game confirmation.
            </p>
          </div>
        ) : null}
      </section>

      <section className="rounded border border-border-low bg-surface-card p-6 md:p-8">
        <h2 className="mb-4 font-display text-headline-md text-on-surface">Update Log</h2>
        <p className="text-body-md text-on-surface-variant">
          Last data refresh: <span className="text-on-surface">{DATA_LAST_VERIFIED}</span>
        </p>
        <p className="mt-2 text-body-sm text-text-muted">
          Every page shows this date above the footer. During the launch window we re-verify on a
          weekly cadence and after each official 2K update.
        </p>
      </section>

      <section className="rounded border border-border-low bg-surface-card p-6 md:p-8">
        <h2 className="mb-4 font-display text-headline-md text-on-surface">
          What We Don&apos;t Publish
        </h2>
        <ul className="flex flex-col gap-3">
          {DONT_PUBLISH.map((item) => (
            <li key={item} className="flex gap-3">
              <Icon name="close" size={20} className="mt-0.5 shrink-0 text-error" />
              <span className="text-body-md text-on-surface-variant">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex justify-center">
        <Link
          href="/badge-token-planner"
          className="rounded bg-primary-container px-6 py-3 text-label-md font-bold text-on-primary transition-colors duration-200 hover:bg-surface-tint"
        >
          Use the Planner
        </Link>
      </div>
    </main>
  );
}
