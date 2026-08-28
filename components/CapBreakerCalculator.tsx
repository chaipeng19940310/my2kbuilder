"use client";

import { useState } from "react";
import { BADGE_TIER_LABEL, DISCIPLINES, type BadgeTier } from "@/lib/data";

/**
 * R12J-C /cap-breakers gap calculator (interactive block).
 *
 * Contract (owner decision r12j-wave2-owner-decision-2026-08-28):
 * - Inputs: current attribute rating(s) + target badge tier. Output: the gap
 *   between the cross_checked threshold and the current rating. Pure
 *   client-side arithmetic on the verified bundle passed in via props.
 * - Per-breaker gain values are NEVER shown: no numbers, no estimates. The
 *   mandated sentence is rendered verbatim wherever a gap exists:
 *   "Exact gains are shown in the in-game preview and are pending
 *   verification here."
 */

export interface CapCalcCondition {
  attribute: string;
  min: number;
}

export interface CapCalcTierReq {
  logic: "AND" | "OR" | "single";
  conditions: CapCalcCondition[];
  height: string | null;
}

export interface CapCalcBadge {
  slug: string;
  name: string;
  category: string;
  tiers: Record<BadgeTier, CapCalcTierReq>;
}

const TIER_CHIP_CLASS: Record<BadgeTier, string> = {
  bronze: "tier-chip tier-bronze",
  silver: "tier-chip tier-silver",
  gold: "tier-chip tier-gold",
  hof: "tier-chip tier-hof",
};

const inputClass =
  "w-full rounded border border-border-low bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface";

/** Parse a rating input; null when empty/invalid/out of the 1–99 scale. */
function parseRating(raw: string | undefined): number | null {
  if (raw === undefined || raw.trim() === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1 || n > 99) return null;
  return Math.round(n);
}

export function CapBreakerCalculator({ badges }: { badges: CapCalcBadge[] }) {
  // Default selection mirrors the page's worked example (copy §2 step 1).
  const [slug, setSlug] = useState("posterizer");
  const [tier, setTier] = useState<BadgeTier>("gold");
  const [values, setValues] = useState<Record<string, string>>({});

  const badge = badges.find((b) => b.slug === slug) ?? badges[0];
  const req = badge.tiers[tier];

  const rows = req.conditions.map((c) => {
    const current = parseRating(values[c.attribute]);
    return { ...c, current, gap: current === null ? null : Math.max(0, c.min - current) };
  });
  const allEntered = rows.every((r) => r.current !== null);

  return (
    <div className="flex flex-col gap-4 rounded border border-border-low bg-surface-card p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-label-md text-text-muted">
          Target badge
          <select
            className={inputClass}
            value={badge.slug}
            onChange={(e) => setSlug(e.target.value)}
          >
            {DISCIPLINES.map((d) => (
              <optgroup key={d} label={d}>
                {badges
                  .filter((b) => b.category === d)
                  .map((b) => (
                    <option key={b.slug} value={b.slug}>
                      {b.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-label-md text-text-muted">
          Target tier
          <select
            className={inputClass}
            value={tier}
            onChange={(e) => setTier(e.target.value as BadgeTier)}
          >
            {(["bronze", "silver", "gold", "hof"] as const).map((t) => (
              <option key={t} value={t}>
                {BADGE_TIER_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Current threshold for the selection (cross_checked bundle values). */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={TIER_CHIP_CLASS[tier]}>{BADGE_TIER_LABEL[tier]}</span>
        <span className="text-body-md text-on-surface">
          {badge.name} requires{" "}
          {rows.map((r, i) => (
            <span key={r.attribute}>
              {i > 0 ? (req.logic === "AND" ? " and " : " or ") : ""}
              {r.attribute} {r.min}
            </span>
          ))}
        </span>
        {req.height ? (
          <span className="text-body-sm text-text-muted">Height {req.height}</span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rows.map((r) => (
          <label
            key={r.attribute}
            className="flex flex-col gap-1 text-label-md text-text-muted"
          >
            Your current {r.attribute}
            <input
              type="number"
              min={1}
              max={99}
              step={1}
              inputMode="numeric"
              className={inputClass}
              value={values[r.attribute] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [r.attribute]: e.target.value }))
              }
              placeholder={`1–99 (target ${r.min})`}
            />
          </label>
        ))}
      </div>

      <div aria-live="polite" className="flex flex-col gap-2 rounded border border-secondary-container bg-surface-container-low p-4">
        {!allEntered ? (
          <p className="text-body-md text-on-surface-variant">
            Enter your current {rows.length > 1 ? "ratings" : "rating"} above to see the gap
            to {BADGE_TIER_LABEL[tier]} {badge.name}.
          </p>
        ) : req.logic === "OR" ? (
          <OrResult rows={rows} tierLabel={BADGE_TIER_LABEL[tier]} badgeName={badge.name} />
        ) : (
          <AndResult rows={rows} tierLabel={BADGE_TIER_LABEL[tier]} badgeName={badge.name} />
        )}
        <p className="text-body-sm text-text-muted">
          Threshold source: this site&apos;s cross-checked badge requirement layer. Last
          verified: 2026-08-28.
        </p>
      </div>
    </div>
  );
}

interface Row extends CapCalcCondition {
  current: number | null;
  gap: number | null;
}

function GapLine({ row }: { row: Row }) {
  return (
    <li className="text-body-md text-on-surface">
      {row.attribute}: {row.current} → {row.min}{" "}
      <span className="text-primary-container">(gap {row.gap})</span>
    </li>
  );
}

function PendingGainsNote() {
  return (
    <p className="text-body-md text-on-surface-variant">
      Exact gains are shown in the in-game preview and are pending verification here — count
      in-game at 99 OVR how many breakers close the gap.
    </p>
  );
}

function AndResult({
  rows,
  tierLabel,
  badgeName,
}: {
  rows: Row[];
  tierLabel: string;
  badgeName: string;
}) {
  const unmet = rows.filter((r) => (r.gap ?? 0) > 0);
  if (unmet.length === 0) {
    return (
      <p className="text-body-md text-on-surface">
        {tierLabel} {badgeName} is already in reach at your current ratings — no cap breakers
        needed for this threshold. Save them for the next target.
      </p>
    );
  }
  return (
    <>
      <p className="text-body-md text-on-surface-variant">
        {reqSummaryLead(rows.length)} {tierLabel} {badgeName}:
      </p>
      <ul className="flex list-disc flex-col gap-1 pl-5">
        {unmet.map((r) => (
          <GapLine key={r.attribute} row={r} />
        ))}
      </ul>
      <PendingGainsNote />
    </>
  );
}

function reqSummaryLead(count: number): string {
  return count > 1
    ? "Every listed attribute must qualify. Cap breakers need to cover"
    : "Cap breakers need to cover";
}

function OrResult({
  rows,
  tierLabel,
  badgeName,
}: {
  rows: Row[];
  tierLabel: string;
  badgeName: string;
}) {
  const met = rows.find((r) => r.gap === 0);
  if (met) {
    return (
      <p className="text-body-md text-on-surface">
        {tierLabel} {badgeName} is already in reach via {met.attribute} — no cap breakers
        needed for this threshold. Save them for the next target.
      </p>
    );
  }
  const gaps = rows.filter((r): r is Row & { gap: number } => r.gap !== null);
  const cheapest = gaps.reduce((a, b) => (b.gap < a.gap ? b : a));
  return (
    <>
      <p className="text-body-md text-on-surface-variant">
        Either condition qualifies for {tierLabel} {badgeName}. The smallest gap is{" "}
        {cheapest.gap} on {cheapest.attribute}:
      </p>
      <ul className="flex list-disc flex-col gap-1 pl-5">
        {gaps.map((r) => (
          <GapLine key={r.attribute} row={r} />
        ))}
      </ul>
      <PendingGainsNote />
    </>
  );
}
