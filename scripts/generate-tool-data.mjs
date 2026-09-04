#!/usr/bin/env node
/**
 * R12I-A tool-data generator — derives the production display bundles from the
 * public reference layer (public/data/public-reference.v1.json).
 *
 * Outputs (committed, consumed by the tool frontend):
 *   public/data/badge-requirements.v1.json
 *     - 53 real badges: name / category / is_new_2k27 (official_confirmed, O2
 *       roster) + four-tier (bronze/silver/gold/hof) attribute unlock
 *       requirements (cross_checked, C1 NBA2KLab x C4 SGO, 212/212 cells
 *       matched), incl. AND/OR logic and height restrictions.
 *     - index order is FROZEN once shipped (share-codec badgeIndex stability):
 *       sorted by discipline (DISCIPLINES order) then name A-Z.
 *   public/data/blueprints.v1.json
 *     - 40 real Signature Blueprints: name + three-player comparisons
 *       (official_confirmed only for the Bulldozer example named on 2K's
 *       builder page; the other 39 names/comparisons come from the C2
 *       community source and stay community_unverified) + per-blueprint
 *       profile (position/height/attributes — community_unverified, labeled
 *       per item in the UI).
 *     - index order is FROZEN once shipped (share-codec blueprintRef
 *       stability): sorted by name A-Z.
 *
 * Token cost values are NOT published by 2K: no cost numbers exist in these
 * bundles by design (gap statement record carried over verbatim).
 *
 * No dependencies; run: node scripts/generate-tool-data.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "public", "data");

const GENERATED_AT = "2026-08-28";
const DISCIPLINES = ["Finishing", "Shooting", "Playmaking", "Defense", "Rebounding", "Physicals"];
const TIERS = ["bronze", "silver", "gold", "hof"];

const ref = JSON.parse(readFileSync(join(here, "..", "reference", "public-reference.v1.json"), "utf8"));
const byKey = new Map(ref.records.map((r) => [r.key, r]));

function must(key) {
  const r = byKey.get(key);
  if (!r) throw new Error(`reference record missing: ${key}`);
  return r;
}

/* ---------------- badges ---------------- */

const badgeSlugs = [
  ...new Set(
    ref.records
      .map((r) => r.key.match(/^badge\.([a-z0-9-]+)\.name$/)?.[1])
      .filter(Boolean),
  ),
];
if (badgeSlugs.length !== 53) {
  throw new Error(`expected 53 badges in reference layer, found ${badgeSlugs.length}`);
}

const badges = badgeSlugs.map((slug) => {
  const name = must(`badge.${slug}.name`);
  const category = must(`badge.${slug}.category`);
  const isNew = must(`badge.${slug}.is_new_2k27`);
  const requirements = {};
  const conflictSources = new Set();
  for (const tier of TIERS) {
    const rec = must(`badge.${slug}.requirement.${tier}`);
    if (rec.source_type !== "cross_checked") {
      throw new Error(`badge.${slug}.requirement.${tier} is ${rec.source_type}, expected cross_checked`);
    }
    requirements[tier] = rec.value; // verbatim: conditions / logic / height_restriction
    for (const c of rec.conflict_with ?? []) conflictSources.add(c);
  }
  const disciplineIndex = DISCIPLINES.indexOf(category.value);
  if (disciplineIndex < 0) throw new Error(`badge ${slug}: unmapped category ${category.value}`);
  return {
    slug,
    name: name.value,
    category: category.value,
    discipline_index: disciplineIndex,
    is_new_2k27: isNew.value === true,
    requirements,
    conflictSources: [...conflictSources],
    nameSource: name,
    reqSource: must(`badge.${slug}.requirement.bronze`),
  };
});

// Frozen index order: discipline (DISCIPLINES order), then name A-Z.
badges.sort((a, b) => a.discipline_index - b.discipline_index || a.name.localeCompare(b.name));
badges.forEach((b, i) => (b.index = i));

const refConflicts = ref.conflicts ?? [];
const badgeRecords = badges.map((b) => ({
  key: `badge.${b.slug}`,
  value: {
    index: b.index,
    slug: b.slug,
    name: b.name,
    category: b.category,
    discipline_index: b.discipline_index,
    is_new_2k27: b.is_new_2k27,
    requirements: b.requirements,
    field_tiers: {
      name: "official_confirmed",
      category: "official_confirmed",
      is_new_2k27: "official_confirmed",
      requirements: "cross_checked",
    },
    sources: {
      name: b.nameSource.source_url_or_capture_ref,
      requirements: b.reqSource.source_url_or_capture_ref,
    },
    conflicts: b.conflictSources.map((source) => ({
      source,
      issue: refConflicts.find((c) => c.badge === b.name)?.issue ?? "see reference-layer conflict table",
    })),
  },
  source_type: "cross_checked",
  source_url_or_capture_ref: `${b.nameSource.source_url_or_capture_ref} ; ${b.reqSource.source_url_or_capture_ref}`,
  captured_at: b.nameSource.captured_at,
  verified_by: null,
  confidence: "medium",
  notes:
    "Name/category/new-flag from 2K's published MyPLAYER Builder roster (official_confirmed). " +
    "Four-tier unlock requirements are a community reference cross-checked across NBA2KLab and " +
    "SportsGamersOnline (212/212 cells matched); not official values." +
    (b.conflictSources.length > 0
      ? ` Source conflict on record: ${refConflicts.find((c) => c.badge === b.name)?.issue ?? ""}`
      : ""),
}));

const roster = must("badge.roster.count");
const crosscheck = must("badge.roster.requirement_crosscheck");
const costStatus = must("badge_token.cost.matrix_status");
const costMechanism = must("badge_token.cost.pricing_mechanism_note");

const badgeBundle = {
  bundle: "badge-requirements",
  version: "v1",
  data_classification: "public_reference",
  gate_status: "public_reference_integrated_r12i",
  generated_at: GENERATED_AT,
  description:
    "Production badge bundle derived 1:1 from public-reference.v1.json (R12I-A). " +
    "53 real badges with official names/categories and cross-checked four-tier unlock " +
    "requirements. Token cost values are not published by 2K: this bundle carries no " +
    "cost numbers (gap statement preserved in badge_token.cost.matrix_status).",
  derived_from: {
    bundle: ref.bundle,
    version: ref.version,
    source_sha256: ref.source_sha256,
    records: ref.records.length,
  },
  records: [
    { ...roster, key: "meta.roster" },
    { ...crosscheck, key: "meta.requirement_crosscheck" },
    { ...costStatus, key: "badge_token.cost.matrix_status" },
    { ...costMechanism, key: "badge_token.cost.pricing_mechanism_note" },
    ...badgeRecords,
  ].map(scrub),
};

/* ---------------- blueprints ---------------- */

const profileRecords = ref.records.filter((r) => /^blueprint\.[a-z0-9-]+\.profile$/.test(r.key));
if (profileRecords.length !== 40) {
  throw new Error(`expected 40 blueprint profiles in reference layer, found ${profileRecords.length}`);
}

const blueprints = profileRecords.map((rec) => {
  const slug = rec.key.split(".")[1];
  const profile = rec.value;
  const officialName = byKey.get(`blueprint.${slug}.name`);
  const officialComparisons = byKey.get(`blueprint.${slug}.comparisons`);
  const name = officialName ? officialName.value : profile.name;
  const comparisons = officialComparisons ? officialComparisons.value : profile.comparisons_2k;
  if (typeof name !== "string" || !Array.isArray(comparisons) || comparisons.length !== 3) {
    throw new Error(`blueprint ${slug}: name/comparisons incomplete`);
  }
  return {
    slug,
    name,
    comparisons,
    profile,
    nameTier: officialName ? "official_confirmed" : "community_unverified",
    comparisonsTier: officialComparisons ? "official_confirmed" : "community_unverified",
    nameSource: officialName?.source_url_or_capture_ref ?? rec.source_url_or_capture_ref,
    profileSource: rec.source_url_or_capture_ref,
    capturedAt: rec.captured_at,
  };
});

// Frozen index order: name A-Z.
blueprints.sort((a, b) => a.name.localeCompare(b.name));
blueprints.forEach((b, i) => (b.index = i));

const blueprintRecords = blueprints.map((b) => ({
  key: `blueprint.${b.slug}`,
  value: {
    index: b.index,
    slug: b.slug,
    name: b.name,
    comparisons: b.comparisons,
    profile: b.profile,
    field_tiers: {
      name: b.nameTier,
      comparisons: b.comparisonsTier,
      profile: "community_unverified",
    },
    sources: { name: b.nameSource, profile: b.profileSource },
  },
  source_type: b.nameTier === "official_confirmed" && b.comparisonsTier === "official_confirmed"
    ? "official_confirmed"
    : "community_unverified",
  source_url_or_capture_ref: `${b.nameSource} ; ${b.profileSource}`,
  captured_at: b.capturedAt,
  verified_by: null,
  confidence: b.nameTier === "official_confirmed" ? "high" : "low",
  notes:
    b.nameTier === "official_confirmed"
      ? "Name and three-player comparisons are named on 2K's published builder page; profile fields (position/height/attributes/badge unlocks) are single-source community data, labeled Unverified."
      : "Name, comparisons and profile fields are single-source community data (NBA2KLab), labeled Unverified; only the 40-count and the three-player blend mechanism are confirmed on 2K's published builder page.",
}));

const countLaunch = must("blueprint.count_launch");
const positionCoverage = must("blueprint.position_coverage");

// Owner 2026-09-04: public production bundles carry no source naming — no
// source URLs, no source-map fields, no capture notes (provenance stays in
// reference/public-reference.v1.json and workspace evidence). source_type is
// kept: the UI renders source-tier chips from it.
function scrub(rec) {
  const { source_url_or_capture_ref: _url, captured_by: _by, notes: _notes, ...rest } = rec;
  const value = rest.value;
  if (value && typeof value === "object") {
    const { sources: _sources, ...vRest } = value;
    // conflict flags keep the issue text but never a named/linked source
    if (Array.isArray(vRest.conflicts)) {
      vRest.conflicts = vRest.conflicts.map((c) => ({ ...c, source: "community reference" }));
    }
    return { ...rest, value: vRest };
  }
  return rest;
}

const blueprintBundle = {
  bundle: "blueprints",
  version: "v1",
  data_classification: "public_reference",
  gate_status: "public_reference_integrated_r12i",
  generated_at: GENERATED_AT,
  description:
    "Production Signature Blueprint bundle derived 1:1 from public-reference.v1.json (R12I-A). " +
    "40 real blueprints. Launch count, three-player blend mechanism and the Bulldozer example are " +
    "confirmed on 2K's published builder page (official_confirmed); all other names, comparisons " +
    "and per-blueprint profile fields are single-source community data (community_unverified) and " +
    "must be labeled Unverified per item.",
  derived_from: {
    bundle: ref.bundle,
    version: ref.version,
    source_sha256: ref.source_sha256,
    records: ref.records.length,
  },
  records: [
    { ...countLaunch, key: "meta.count_launch" },
    { ...positionCoverage, key: "meta.position_coverage" },
    ...blueprintRecords,
  ].map(scrub),
};

writeFileSync(join(dataDir, "badge-requirements.v1.json"), JSON.stringify(badgeBundle, null, 2) + "\n");
writeFileSync(join(dataDir, "blueprints.v1.json"), JSON.stringify(blueprintBundle, null, 2) + "\n");
console.log(`badge-requirements.v1.json: ${badgeRecords.length} badges + 4 meta records`);
console.log(`blueprints.v1.json: ${blueprintRecords.length} blueprints + 2 meta records`);
console.log(
  `blueprint tiers: official name+comparisons = ${blueprints.filter((b) => b.nameTier === "official_confirmed").length}, community = ${blueprints.filter((b) => b.nameTier !== "official_confirmed").length}`,
);
