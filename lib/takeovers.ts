/**
 * R12J-B /takeover-requirements data loader.
 *
 * Source: public/data/public-reference.v1.json — 24 `takeover.*.requirement`
 * records (names/disciplines/thresholds single-sourced from NBA2KLab's
 * takeover-requirements page → community_unverified per item; roster
 * aggregates cross-checked against 2K-published counts; Hydration Hero
 * official_confirmed). Records are imported at build time and rendered
 * fully server-side — no runtime fetch.
 */

import publicReference from "@/public/data/public-reference.v1.json";

export interface TakeoverUnlockCondition {
  attribute: string;
  minRating: number;
}

export type TakeoverUnlock =
  | { kind: "always_available" }
  | { kind: "threshold"; logic: "single" | "AND" | "OR"; conditions: TakeoverUnlockCondition[] };

export interface TakeoverEntry {
  slug: string;
  name: string;
  /** Display grouping: the five badge disciplines or "Universal". */
  discipline: string;
  /** default = one of the 5 always-on starters; specialist = threshold-gated; universal = any slot. */
  kind: "default" | "specialist" | "universal";
  unlock: TakeoverUnlock;
  /** Raw source_type from the reference layer (community_unverified / official_confirmed / cross_checked). */
  sourceType: string;
}

interface ReferenceRecord {
  key: string;
  value: unknown;
  source_type: string;
}

interface RawTakeoverValue {
  name: string;
  discipline: string;
  kind: "default" | "specialist" | "universal";
  unlock: "always_available" | { logic: "single" | "AND" | "OR"; conditions: [string, number][] };
}

/** All 24 Takeover abilities, sorted by discipline then name. */
export function takeoverCatalog(): TakeoverEntry[] {
  const records = (publicReference as { records: ReferenceRecord[] }).records;
  const out: TakeoverEntry[] = [];
  for (const r of records) {
    if (!r.key.startsWith("takeover.") || !r.key.endsWith(".requirement")) continue;
    const v = r.value as RawTakeoverValue;
    const slug = r.key.slice("takeover.".length, -".requirement".length);
    out.push({
      slug,
      name: v.name,
      discipline: v.discipline,
      kind: v.kind,
      unlock:
        v.unlock === "always_available"
          ? { kind: "always_available" }
          : {
              kind: "threshold",
              logic: v.unlock.logic,
              conditions: v.unlock.conditions.map(([attribute, minRating]) => ({
                attribute,
                minRating,
              })),
            },
      sourceType: r.source_type,
    });
  }
  const order = ["Shooting", "Finishing", "Playmaking", "Defense", "Rebounding", "Universal"];
  out.sort(
    (a, b) =>
      order.indexOf(a.discipline) - order.indexOf(b.discipline) || a.name.localeCompare(b.name),
  );
  return out;
}

/** Discipline groups in display order (Universal last; no Physicals takeovers exist). */
export const TAKEOVER_DISCIPLINES = [
  "Shooting",
  "Finishing",
  "Playmaking",
  "Defense",
  "Rebounding",
  "Universal",
] as const;
