#!/usr/bin/env node
/**
 * R12I-A acceptance check — verifies the generated tool bundles against the
 * public reference layer, cell by cell.
 *
 *   node scripts/verify-tool-data.mjs
 *
 * Hard checks (exit 1 on any failure):
 *   badge-requirements.v1.json
 *     - exactly 53 badge records, frozen indexes unique 0..52
 *     - every badge name / category / is_new_2k27 equals the reference layer
 *     - all 212 requirement cells (53 badges x 4 tiers) deep-equal the
 *       reference layer (conditions / logic / height_restriction)
 *     - discipline_index maps to the category name via DISCIPLINES
 *   blueprints.v1.json
 *     - exactly 40 blueprint records, frozen indexes unique 0..39
 *     - every name equals the reference profile name; comparisons match the
 *       reference (set equality; the Bulldozer record uses the official order)
 *     - field_tiers are truthful: only Bulldozer may claim official_confirmed
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "public", "data");
const DISCIPLINES = ["Finishing", "Shooting", "Playmaking", "Defense", "Rebounding", "Physicals"];
const TIERS = ["bronze", "silver", "gold", "hof"];

const ref = JSON.parse(readFileSync(join(here, "..", "reference", "public-reference.v1.json"), "utf8"));
const badges = JSON.parse(readFileSync(join(dataDir, "badge-requirements.v1.json"), "utf8"));
const blueprints = JSON.parse(readFileSync(join(dataDir, "blueprints.v1.json"), "utf8"));

const byKey = new Map(ref.records.map((r) => [r.key, r]));
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.error(`FAIL ${msg}`);
};

/* ---------------- badges ---------------- */

const badgeRecords = badges.records.filter((r) => r.key.startsWith("badge.") && !r.key.startsWith("badge_token."));
if (badgeRecords.length !== 53) fail(`badge count ${badgeRecords.length} != 53`);

const idx = badgeRecords.map((r) => r.value.index).sort((a, b) => a - b);
if (!eq(idx, Array.from({ length: 53 }, (_, i) => i))) fail("badge indexes are not a unique 0..52 set");

let cells = 0;
let cellsMatched = 0;
for (const r of badgeRecords) {
  const slug = r.value.slug;
  const refName = byKey.get(`badge.${slug}.name`);
  const refCat = byKey.get(`badge.${slug}.category`);
  const refNew = byKey.get(`badge.${slug}.is_new_2k27`);
  if (!refName || !refCat || !refNew) {
    fail(`badge.${slug}: reference identity records missing`);
    continue;
  }
  if (r.value.name !== refName.value) fail(`badge.${slug}.name mismatch`);
  if (r.value.category !== refCat.value) fail(`badge.${slug}.category mismatch`);
  if (r.value.is_new_2k27 !== (refNew.value === true)) fail(`badge.${slug}.is_new_2k27 mismatch`);
  if (DISCIPLINES[r.value.discipline_index] !== r.value.category) {
    fail(`badge.${slug}: discipline_index ${r.value.discipline_index} does not map to ${r.value.category}`);
  }
  if (r.value.field_tiers?.requirements !== "cross_checked") fail(`badge.${slug}: requirements tier not cross_checked`);
  for (const tier of TIERS) {
    cells += 1;
    const refReq = byKey.get(`badge.${slug}.requirement.${tier}`);
    if (refReq && eq(r.value.requirements?.[tier], refReq.value)) cellsMatched += 1;
    else fail(`badge.${slug}.requirement.${tier}: cell differs from reference layer`);
  }
}
console.log(`badge requirement cells: ${cellsMatched}/${cells} matched (expect 212/212)`);
if (cells !== 212) fail(`expected 212 cells, compared ${cells}`);

/* ---------------- blueprints ---------------- */

const bpRecords = blueprints.records.filter((r) => r.key.startsWith("blueprint."));
if (bpRecords.length !== 40) fail(`blueprint count ${bpRecords.length} != 40`);

const bpIdx = bpRecords.map((r) => r.value.index).sort((a, b) => a - b);
if (!eq(bpIdx, Array.from({ length: 40 }, (_, i) => i))) fail("blueprint indexes are not a unique 0..39 set");

for (const r of bpRecords) {
  const slug = r.value.slug;
  const refProfile = byKey.get(`blueprint.${slug}.profile`);
  if (!refProfile) {
    fail(`blueprint.${slug}: reference profile missing`);
    continue;
  }
  if (r.value.name !== refProfile.value.name) fail(`blueprint.${slug}.name mismatch vs reference profile`);
  const refCmp = [...(byKey.get(`blueprint.${slug}.comparisons`)?.value ?? refProfile.value.comparisons_2k)].sort();
  const outCmp = [...r.value.comparisons].sort();
  if (!eq(outCmp, refCmp)) fail(`blueprint.${slug}.comparisons mismatch`);
  if (!eq(r.value.profile, refProfile.value)) fail(`blueprint.${slug}.profile not verbatim`);
  const official = slug === "bulldozer";
  const expectNameTier = official ? "official_confirmed" : "community_unverified";
  if (r.value.field_tiers?.name !== expectNameTier) fail(`blueprint.${slug}: name tier ${r.value.field_tiers?.name} != ${expectNameTier}`);
  if (r.value.field_tiers?.profile !== "community_unverified") fail(`blueprint.${slug}: profile tier not community_unverified`);
}

console.log(`blueprints: ${bpRecords.length} records, names+comparisons+profiles verified against reference layer`);

if (failures > 0) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll checks passed.");
