/**
 * Data layer — typed access to the same-origin JSON bundles (contract §4).
 *
 * Bundles (source of truth: backend/data/, vendored to public/data/):
 *   /data/mechanics.v0.json          launch_data  (official_confirmed facts)
 *   /data/badge-cost-matrix.v0.json  gated_data   (fixtureOnly placeholders)
 *   /data/blueprints.v0.json         gated_data   (fixtureOnly placeholders)
 *
 * Record-level minimum fields (contract §4.2): key / value /
 * source_type / source_url_or_capture_ref / captured_at / verified_by /
 * confidence / notes (+ fixtureOnly on gated placeholders).
 *
 * Hard rules honored here:
 *  - No silent fallback: a failed fetch surfaces an error state (§6.1);
 *    this module never substitutes mock data for a failed bundle load.
 *  - community_unverified tier never enters the fact layer; gated fixture
 *    records are always presented with an "Unverified" label in the UI.
 *  - R11D (owner approval r11d-public-ref-frontend-integration-approval):
 *    the public reference bundle is vendored to
 *    /data/public-reference.v1.json and rendered with explicit source tiers
 *    (Community reference / Unverified). hq_app_observed is NOT part of the
 *    current public version: no HQ App observed data is published anywhere
 *    on the site until manual collection + dual review + freeze v0.
 */

/**
 * Source tiers of the current public version (R11D, QA P2-2 fix).
 * Aligned with the backend public-reference bundle vocabulary.
 * Removed for the current public version:
 *  - "hq_app_observed"   — forbidden upstream until HQ App collection,
 *                          dual review, and freeze; re-add only after that gate.
 *  - "competitor_crosscheck" — superseded by the bundle's "cross_checked".
 */
export type SourceType =
  | "official_confirmed"
  | "cross_checked"
  | "community_unverified";

export interface DataRecord<V = unknown> {
  key: string;
  value: V;
  source_type: SourceType;
  source_url_or_capture_ref: string;
  captured_at: string;
  verified_by: string | null;
  confidence: string;
  notes: string;
  fixtureOnly?: boolean;
  /* Public-reference schema fields (present on public_reference records). */
  value_type?: string;
  captured_by?: string;
  conflict_with?: string[];
}

export interface DataBundle<V = unknown> {
  bundle: string;
  version: string;
  data_classification: "launch_data" | "gated_data" | "public_reference";
  gate_status: string;
  generated_at: string;
  description: string;
  records: DataRecord<V>[];
}

/* ---------------- mechanics.v0.json (launch_data) ---------------- */

export interface MechanicsFactValues {
  launch_date_global: string;
  early_access_start: string;
  platforms: string[];
  hq_app_launch: { date: string; platforms: string[]; features: string[] };
  badge_tokens_system: { total_badges: number; new_badges: number; slots: number; token_cost_varies_by: string[] };
  disciplines: { count: number; includes_new: string };
  synergy_system: { mechanics: string[]; cap_break: string };
  female_myplayer: string;
  signature_blueprints: { count: number; type: string; replaces: string[]; cadence: string };
  takeover_rework: string;
  named_new_badges?: string[];
}

export type MechanicsBundle = DataBundle<unknown>;

export function mechanicsFact(bundle: MechanicsBundle, key: string): DataRecord | undefined {
  return bundle.records.find((r) => r.key === key);
}

/* ---------------- badge-cost-matrix.v0.json (gated fixture) ---------------- */

export const DISCIPLINES = [
  "Finishing",
  "Shooting",
  "Playmaking",
  "Defense",
  "Rebounding",
  "Physicals",
] as const;
export type DisciplineName = (typeof DISCIPLINES)[number];

export interface BadgeCatalogValue {
  index: number;
  name: string;
  discipline: number; // 0..5 index into DISCIPLINES
  conflicts?: Array<{ withIndex: number; minHeightIn?: number; note?: string }>;
}

export interface CostRecordValue {
  badge: string; // fixture badge name
  badgeIndex?: number; // index into the 53-badge catalog (when provided)
  position: string; // PG/SG/SF/PF/C
  height_in: number;
  token_cost: number; // fixture values are deliberately out of realistic range
}

export type CostMatrixBundle = DataBundle<CostRecordValue | BadgeCatalogValue>;

export interface BadgeCatalogEntry extends BadgeCatalogValue {
  fixtureOnly: boolean;
}

/** Extract the 53-entry badge catalog (records keyed fixture_badge_XX). */
export function badgeCatalog(bundle: CostMatrixBundle): BadgeCatalogEntry[] {
  const out: BadgeCatalogEntry[] = [];
  for (const r of bundle.records) {
    const v = r.value as Partial<BadgeCatalogValue>;
    if (typeof v.index === "number" && typeof v.name === "string" && typeof v.discipline === "number") {
      out.push({
        index: v.index,
        name: v.name,
        discipline: v.discipline,
        conflicts: v.conflicts,
        fixtureOnly: r.fixtureOnly === true,
      });
    }
  }
  out.sort((a, b) => a.index - b.index);
  return out;
}

export interface CostPoint {
  badgeIndex: number;
  badgeName: string;
  position: string;
  heightIn: number;
  tokenCost: number;
}

/** Extract cost sample points (badge x position x height). */
export function costPoints(bundle: CostMatrixBundle, catalog: BadgeCatalogEntry[]): CostPoint[] {
  const indexByName = new Map(catalog.map((b) => [b.name, b.index]));
  const pts: CostPoint[] = [];
  for (const r of bundle.records) {
    const v = r.value as Partial<CostRecordValue>;
    if (typeof v.token_cost === "number" && typeof v.position === "string" && typeof v.height_in === "number") {
      const badgeIndex =
        typeof v.badgeIndex === "number" ? v.badgeIndex : indexByName.get(v.badge ?? "") ?? -1;
      if (badgeIndex >= 0) {
        pts.push({
          badgeIndex,
          badgeName: v.badge ?? "",
          position: v.position,
          heightIn: v.height_in,
          tokenCost: v.token_cost,
        });
      }
    }
  }
  return pts;
}

/**
 * Estimate the (fixture) token cost of a badge at a position/height by
 * linear interpolation across the sampled height points for that
 * badge+position. Fixture-only display value — always labeled Unverified.
 */
export function estimateCost(
  points: CostPoint[],
  badgeIndex: number,
  position: string,
  heightIn: number,
): number | null {
  const pts = points
    .filter((p) => p.badgeIndex === badgeIndex && p.position === position)
    .sort((a, b) => a.heightIn - b.heightIn);
  if (pts.length === 0) return null;
  if (heightIn <= pts[0].heightIn) return pts[0].tokenCost;
  const last = pts[pts.length - 1];
  if (heightIn >= last.heightIn) return last.tokenCost;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (heightIn >= a.heightIn && heightIn <= b.heightIn) {
      const t = (heightIn - a.heightIn) / (b.heightIn - a.heightIn);
      return Math.round(a.tokenCost + t * (b.tokenCost - a.tokenCost));
    }
  }
  return last.tokenCost;
}

/* ---------------- blueprints.v0.json (gated fixture) ---------------- */

export interface BlueprintValue {
  name: string;
  summary?: string;
  position?: string; // PG/SG/SF/PF/C
  height_in?: number;
  weight_lb?: number;
  playstyle?: {
    scoring?: "inside" | "mid-range" | "3pt";
    playmaking?: "passer" | "ball-handler";
    defense?: "perimeter" | "interior";
  };
  attributes?: {
    threePointShot: number;
    midRange: number;
    drivingDunk: number;
    ballHandle: number;
    speedWithBall: number;
    perimeterDefense: number;
    block: number;
    offensiveRebound: number;
  };
  keyBadges?: number[]; // badge catalog indexes
  disciplines?: string[];
  suggested_slots?: number;
}

export type BlueprintsBundle = DataBundle<BlueprintValue>;

export interface Blueprint extends BlueprintValue {
  index: number; // 0..39 — matches share-codec blueprintRef
  fixtureOnly: boolean;
}

export function blueprintList(bundle: BlueprintsBundle): Blueprint[] {
  return bundle.records.map((r, i) => ({
    index: i,
    fixtureOnly: r.fixtureOnly === true,
    ...r.value,
  }));
}

export const BLUEPRINT_ATTRIBUTES = [
  ["threePointShot", "Three-Point Shot"],
  ["midRange", "Mid-Range"],
  ["drivingDunk", "Driving Dunk"],
  ["ballHandle", "Ball Handle"],
  ["speedWithBall", "Speed with Ball"],
  ["perimeterDefense", "Perimeter Defense"],
  ["block", "Block"],
  ["offensiveRebound", "Offensive Rebound"],
] as const;

/* ---------------- public-reference.v1.json (R11D public reference layer) ---------------- */

export interface PublicReferenceConflict {
  badge: string;
  issue: string;
}

export type PublicReferenceBundle = DataBundle & {
  data_classification: "public_reference";
  source_sha256?: string;
  conflicts?: PublicReferenceConflict[];
  records: DataRecord[];
};

/** Asset group derived from the record key prefix (official/mechanic/badge/...). */
export function assetGroupOf(key: string): string {
  return key.split(".")[0] ?? key;
}

/** Tier histogram over a record list (computed, never hardcoded). */
export function tierCounts(records: DataRecord[]): Record<SourceType, number> {
  const counts: Record<SourceType, number> = {
    official_confirmed: 0,
    cross_checked: 0,
    community_unverified: 0,
  };
  for (const r of records) counts[r.source_type] += 1;
  return counts;
}

export function recordsByGroup(records: DataRecord[]): Map<string, DataRecord[]> {
  const groups = new Map<string, DataRecord[]>();
  for (const r of records) {
    const g = assetGroupOf(r.key);
    const list = groups.get(g);
    if (list) list.push(r);
    else groups.set(g, [r]);
  }
  return groups;
}

/**
 * Display tier unification (R11D, QA P2-3 + owner approval).
 *
 * `blueprint.position_coverage` is stored in the backend bundle as
 * cross_checked/low (its 8x5 aggregate = 40 cross-validates against the
 * official launch count), but its own notes admit the per-position split is
 * single-source. To keep the user-facing tier consistent with the
 * single-source downgrade rule applied to the 40 blueprint profiles, the UI
 * presents this record as community_unverified (Unverified). The stored
 * record is NOT modified; this is a display-layer normalization only.
 */
const DISPLAY_TIER_OVERRIDES: Record<string, SourceType> = {
  "blueprint.position_coverage": "community_unverified",
};

export function displayTier(record: DataRecord): SourceType {
  return DISPLAY_TIER_OVERRIDES[record.key] ?? record.source_type;
}

/* ---------------- client fetch helper (§6.1 states) ---------------- */
export type LoadState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: T };

/** Same-origin bundle fetch. No silent fallback on failure (contract §6.1). */
export async function fetchBundle<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Data bundle failed to load (${res.status}).`);
  }
  return (await res.json()) as T;
}
