"use client";
import { TierBadge } from "@/components/TierBadge";

import { useMemo, useState } from "react";
import {
  BADGE_TIERS,

  type BadgeTier,
} from "@/lib/data";

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



const fieldClass =
  "h-11 w-full rounded border border-border-low bg-surface-container-lowest px-3 text-body-md text-on-surface";

function tierAtRating(
  badge: CapCalcBadge,
  attribute: string,
  rating: number,
): { tier: BadgeTier; companion: string[] } | null {
  let result: { tier: BadgeTier; companion: string[] } | null = null;
  for (const tier of BADGE_TIERS) {
    const req = badge.tiers[tier];
    const selected = req.conditions.find((condition) => condition.attribute === attribute);
    if (!selected || selected.min > rating) continue;
    const companion =
      req.logic === "AND"
        ? req.conditions
            .filter((condition) => condition.attribute !== attribute)
            .map((condition) => `${condition.attribute} ${condition.min}`)
        : [];
    result = { tier, companion };
  }
  return result;
}

export function CapBreakerCalculator({ badges }: { badges: CapCalcBadge[] }) {
  const attributes = useMemo(
    () =>
      Array.from(
        new Set(
          badges.flatMap((badge) =>
            BADGE_TIERS.flatMap((tier) =>
              badge.tiers[tier].conditions.map((condition) => condition.attribute),
            ),
          ),
        ),
      ).sort(),
    [badges],
  );
  const [attribute, setAttribute] = useState("Driving Dunk");
  // This standalone preview retains the existing 1–99 rating range;
  // badge thresholds are not attribute/build-specific rating limits.
  const minRating = 1;
  const maxRating = 99;
  const [current, setCurrent] = useState(85);
  const [currentDraft, setCurrentDraft] = useState("85");
  function updateCurrent(value: number) {
    const next = Math.min(maxRating, Math.max(minRating, Math.trunc(value)));
    setCurrent(next);
    setCurrentDraft(String(next));
  }
  const [breakers, setBreakers] = useState(0);
  const projected = Math.min(99, current + breakers);

  const rows = badges
    .map((badge) => {
      const before = tierAtRating(badge, attribute, current);
      const after = tierAtRating(badge, attribute, projected);
      return after ? { badge, before, after } : null;
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => {
      const rank = (tier: BadgeTier) => BADGE_TIERS.indexOf(tier);
      return rank(b.after.tier) - rank(a.after.tier) || a.badge.name.localeCompare(b.badge.name);
    });

  const newlyRaised = rows.filter((row) => row.before?.tier !== row.after.tier).length;

  return (
    <section
      aria-labelledby="cap-breaker-tool-title"
      className="cap-preview flex w-full flex-col gap-4 rounded border border-primary-container/60 bg-surface-card p-4 shadow-sm md:p-5"
    >
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-primary-container">
            Interactive preview
          </p>
          <h2 id="cap-breaker-tool-title" className="font-display text-headline-sm text-on-surface">
            Cap Breaker Badge Preview
          </h2>
        </div>
        <p className="text-body-sm font-semibold text-secondary">
          Permanent once spent — Cap Breakers cannot be refunded.
        </p>
      </div>

      <div className="cap-preview-layout">
      <div className="cap-preview-controls">
        <label className="flex flex-col gap-1 text-label-md text-text-muted">
          Attribute
          <select className={`${fieldClass} tool-select`} value={attribute} onChange={(event) => setAttribute(event.target.value)}>
            {attributes.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>
        <div className="cap-current flex flex-col gap-1 text-label-md text-text-muted">
          <label htmlFor="cap-current-value">Current value</label>
          <div className="cap-current-stepper" role="group" aria-label="Adjust current attribute value">
            <button type="button" aria-label="Decrease current value by 1" disabled={current <= minRating} onClick={() => updateCurrent(current - 1)}>−</button>
            <input
              id="cap-current-value"
              aria-label="Current attribute value"
              aria-describedby="cap-current-hint"
              inputMode="numeric"
              max={maxRating}
              min={minRating}
              step={1}
              onChange={(event) => {
                const raw = event.target.value;
                if (raw === "") {
                  setCurrentDraft("");
                  return;
                }
                if (Number.isFinite(event.target.valueAsNumber)) updateCurrent(event.target.valueAsNumber);
              }}
              onBlur={() => setCurrentDraft(String(current))}
              type="number"
              value={currentDraft}
            />
            <button type="button" aria-label="Increase current value by 1" disabled={current >= maxRating} onClick={() => updateCurrent(current + 1)}>+</button>
          </div>
          <p id="cap-current-hint" className="text-body-sm">Type a value or tap − / + · {minRating}–{maxRating}</p>
        </div>
        <div className="flex flex-col gap-1 text-label-md text-text-muted">
          Cap Breakers: {breakers} / 5
          <div className="cap-breaker-buttons" role="group" aria-label="Cap Breakers to add">
            {[0, 1, 2, 3, 4, 5].map((count) => (
              <button
                key={count}
                aria-pressed={breakers === count}
                className="bg-surface-container-lowest text-label-md text-on-surface transition-colors hover:bg-surface-container-high aria-pressed:bg-primary-container aria-pressed:text-on-primary"
                onClick={() => setBreakers(count)}
                type="button"
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div aria-live="polite" className="cap-preview-results rounded border border-border-low bg-surface-container-low p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-body-md text-on-surface">
            <strong>{projected - current} added · hard limit 5</strong>
            {projected - current < breakers ? <span className="text-on-surface-variant"> · rating capped at 99</span> : null}
          </p>
          <p className="text-body-sm text-text-muted">
            {rows.length} badge paths in reach · {newlyRaised} raised by this plan
          </p>
        </div>
        <div className="cap-preview-rows mt-3 grid grid-cols-1 gap-2 overflow-y-auto pr-1">
          {rows.length ? rows.map(({ badge, before, after }) => (
            <div key={badge.slug} className="flex min-h-14 items-center justify-between gap-2 rounded border border-border-low bg-surface-card px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-label-md text-on-surface">{badge.name}</p>
                <p className="text-body-sm text-text-muted">
                  {badge.category}
                  {after.companion.length ? ` · also needs ${after.companion.join(" + ")}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <TierBadge tier={after.tier} size={32} />
                {before?.tier !== after.tier ? <span className="text-[10px] font-semibold text-secondary">NEW</span> : null}
              </div>
            </div>
          )) : (
            <p className="text-body-sm text-on-surface-variant">No badge threshold is in reach at this rating yet.</p>
          )}
        </div>
        <p className="mt-2 text-body-sm text-text-muted">
          Each selected breaker previews one added rating point, capped at 99. AND badges also show the companion threshold you must meet.
        </p>
      </div>
      </div>
    </section>
  );
}
