/**
 * Data layer — typed access to the same-origin JSON bundles (contract §4).
 *
 * Bundles (source of truth: public/data/, derived from public-reference.v1.json
 * by scripts/generate-tool-data.mjs):
 *   /data/mechanics.v0.json            launch_data  (official_confirmed facts)
 *   /data/public-reference.v1.json     public_reference (R11D reference layer)
 *   /data/badge-requirements.v1.json   public_reference (R12I-A production bundle:
 *                                      53 real badges + four-tier unlock requirements)
 *   /data/blueprints.v1.json           public_reference (R12I-A production bundle:
 *                                      40 real Signature Blueprints)
 *
 * Record-level minimum fields (contract §4.2): key / value /
 * source_type / source_url_or_capture_ref / captured_at / verified_by /
 * confidence / notes.
 *
 * Hard rules honored here:
 *  - No silent fallback: a failed fetch surfaces an error state (§6.1);
 *    this module never substitutes mock data for a failed bundle load.
 *  - community_unverified tier never enters the fact layer; unverified fields
 *    are always presented with an "Unverified" label in the UI.
 *  - Token cost values are not published by 2K: no cost numbers exist in any
 *    bundle, and the UI labels them "Token costs pending — official values not
 *    published" (owner decision r12i-wave1-owner-decision-2026-08-28).
 *  - hq_app_observed is NOT part of the current public version: no HQ App
 *    observed data is published anywhere on the site until manual collection +
 *    dual review + freeze v0.
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

/* ---------------- badge-requirements.v1.json (R12I-A production bundle) ---------------- */

export const DISCIPLINES = [
  "Finishing",
  "Shooting",
  "Playmaking",
  "Defense",
  "Rebounding",
  "Physicals",
] as const;
export type DisciplineName = (typeof DISCIPLINES)[number];

export const BADGE_TIERS = ["bronze", "silver", "gold", "hof"] as const;
export type BadgeTier = (typeof BADGE_TIERS)[number];

export const BADGE_TIER_LABEL: Record<BadgeTier, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  hof: "Hall of Fame",
};

export interface BadgeRequirementCondition {
  attribute: string;
  min_rating: number;
}

export interface BadgeTierRequirement {
  conditions: BadgeRequirementCondition[];
  logic: "AND" | "OR" | "single";
  /** Inches, inclusive bounds. null = no height limit. */
  height_restriction: { min?: number; max?: number } | null;
}

/** value shape of each badge.* record in badge-requirements.v1.json */
export interface BadgeRecordValue {
  index: number; // 0..52 — frozen; share-codec badgeIndex references it
  slug: string;
  name: string;
  category: DisciplineName;
  discipline_index: number; // 0..5 index into DISCIPLINES
  is_new_2k27: boolean;
  requirements: Record<BadgeTier, BadgeTierRequirement>;
  field_tiers: {
    name: SourceType;
    category: SourceType;
    is_new_2k27: SourceType;
    requirements: SourceType;
  };
  sources: { name: string; requirements: string };
  conflicts: Array<{ source: string; issue: string }>;
}

export type BadgeRequirementsBundle = DataBundle<unknown>;

export type BadgeCatalogEntry = BadgeRecordValue;

/** Extract the 53-entry real badge catalog (records keyed badge.<slug>). */
export function badgeCatalog(bundle: BadgeRequirementsBundle): BadgeCatalogEntry[] {
  const out: BadgeCatalogEntry[] = [];
  for (const r of bundle.records) {
    if (!r.key.startsWith("badge.") || r.key.startsWith("badge_token.")) continue;
    const v = r.value as Partial<BadgeRecordValue>;
    if (typeof v.index === "number" && typeof v.name === "string" && v.requirements) {
      out.push(v as BadgeRecordValue);
    }
  }
  out.sort((a, b) => a.index - b.index);
  return out;
}

function inchesLabel(inches: number): string {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

/** "≤ 6'4\"" / "≥ 6'3\"" for a height restriction, null when unrestricted. */
export function heightRestrictionLabel(hr: BadgeTierRequirement["height_restriction"]): string | null {
  if (!hr) return null;
  if (hr.max !== undefined && hr.min !== undefined) {
    return `${inchesLabel(hr.min)}–${inchesLabel(hr.max)} only`;
  }
  if (hr.max !== undefined) return `≤ ${inchesLabel(hr.max)}`;
  if (hr.min !== undefined) return `≥ ${inchesLabel(hr.min)}`;
  return null;
}

/**
 * Compact, truthful summary of a badge's four-tier requirements for list rows.
 * Per attribute, shows the min–max rating range across the tiers where that
 * attribute appears (e.g. "Mid-Range Shot 65–99"); the connective reflects the
 * logic ("or" for OR, "and" for AND). Height limits appended separately.
 */
export function requirementSummary(badge: BadgeCatalogEntry): {
  attributesText: string;
  logic: "AND" | "OR" | "single";
  heightText: string | null;
} {
  const tiers = badge.requirements;
  const logic = tiers.bronze.logic;
  const connective = logic === "AND" ? " and " : logic === "OR" ? " or " : "";
  const names: string[] = [];
  for (const t of BADGE_TIERS) {
    for (const c of tiers[t].conditions) {
      if (!names.includes(c.attribute)) names.push(c.attribute);
    }
  }
  const parts = names.map((name) => {
    const ratings = BADGE_TIERS.flatMap((t) =>
      tiers[t].conditions.filter((c) => c.attribute === name).map((c) => c.min_rating),
    );
    const lo = Math.min(...ratings);
    const hi = Math.max(...ratings);
    return lo === hi ? `${name} ${lo}` : `${name} ${lo}–${hi}`;
  });
  const heightText = heightRestrictionLabel(tiers.bronze.height_restriction);
  return { attributesText: parts.join(connective), logic, heightText };
}

/** True when the badge cannot be unlocked at the given height (any tier). */
export function badgeLockedAtHeight(badge: BadgeCatalogEntry, heightIn: number): boolean {
  return BADGE_TIERS.every((t) => {
    const hr = badge.requirements[t].height_restriction;
    if (!hr) return false;
    if (hr.max !== undefined && heightIn > hr.max) return true;
    if (hr.min !== undefined && heightIn < hr.min) return true;
    return false;
  });
}

/* ---------------- blueprints.v1.json (R12I-A production bundle) ---------------- */

export interface BlueprintProfile {
  name: string;
  position: string; // PG/SG/SF/PF/C
  position_label?: string;
  best_skill?: string;
  height?: string; // display string, e.g. 6'10"
  weight_lb?: number | null;
  wingspan?: string;
  potential_overall?: number | null;
  comparisons_2k?: string[];
  attributes_start?: Record<string, number | null>;
  attributes_cap?: Record<string, number | null>;
  badge_unlocks_at_start?: Record<string, Array<{ badge: string; tier: string }>>;
}

/** value shape of each blueprint.<slug> record in blueprints.v1.json */
export interface BlueprintRecordValue {
  index: number; // 0..39 — frozen; share-codec blueprintRef references it
  slug: string;
  name: string;
  comparisons: string[]; // three-player blend
  profile: BlueprintProfile | null;
  field_tiers: { name: SourceType; comparisons: SourceType; profile: SourceType };
  sources: { name: string; profile: string };
}

export type BlueprintsBundle = DataBundle<unknown>;

export type Blueprint = BlueprintRecordValue;

export function blueprintList(bundle: BlueprintsBundle): Blueprint[] {
  const out: Blueprint[] = [];
  for (const r of bundle.records) {
    if (!r.key.startsWith("blueprint.")) continue;
    const v = r.value as Partial<BlueprintRecordValue>;
    if (typeof v.index === "number" && typeof v.name === "string") {
      out.push(v as BlueprintRecordValue);
    }
  }
  out.sort((a, b) => a.index - b.index);
  return out;
}

/**
 * Attribute rows for blueprint cards / comparison table — real NBA 2K27
 * attribute names as stored in profile.attributes_start.
 */
export const BLUEPRINT_COMPARE_ATTRIBUTES = [
  "Three-Point Shot",
  "Mid-Range Shot",
  "Driving Dunk",
  "Ball Handle",
  "Speed With Ball",
  "Perimeter Defense",
  "Block",
  "Offensive Rebound",
] as const;

/** Badge unlocks at start, flattened with discipline + tier. */
export function blueprintUnlocks(bp: Blueprint): Array<{ badge: string; tier: string; discipline: string }> {
  const out: Array<{ badge: string; tier: string; discipline: string }> = [];
  const groups = bp.profile?.badge_unlocks_at_start ?? {};
  for (const [discipline, list] of Object.entries(groups)) {
    for (const e of list) out.push({ badge: e.badge, tier: e.tier, discipline });
  }
  return out;
}

const UNLOCK_TIER_RANK: Record<string, number> = { "Hall of Fame": 4, HoF: 4, Gold: 3, Silver: 2, Bronze: 1 };

/** Highest-tier unlocks first (for card/compare display). */
export function topUnlocks(bp: Blueprint, count: number): Array<{ badge: string; tier: string }> {
  return blueprintUnlocks(bp)
    .sort((a, b) => (UNLOCK_TIER_RANK[b.tier] ?? 0) - (UNLOCK_TIER_RANK[a.tier] ?? 0))
    .slice(0, count)
    .map(({ badge, tier }) => ({ badge, tier }));
}

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
