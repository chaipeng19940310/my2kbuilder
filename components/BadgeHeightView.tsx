"use client";
import { TierBadge } from "@/components/TierBadge";

import { useMemo, useState } from "react";
import {
  BADGE_TIERS,

  DISCIPLINES,
  type BadgeTier,
  type DisciplineName,
} from "@/lib/data";

export interface HeightTierRequirement {
  min?: number;
  max?: number;
}

export interface HeightBadge {
  slug: string;
  name: string;
  category: DisciplineName;
  tiers: Record<BadgeTier, HeightTierRequirement | null>;
}



function heightLabel(inches: number): string {
  return `${Math.floor(inches / 12)}'${inches % 12}\"`;
}

function permitsHeight(restriction: HeightTierRequirement | null, height: number): boolean {
  if (!restriction) return true;
  if (restriction.min !== undefined && height < restriction.min) return false;
  if (restriction.max !== undefined && height > restriction.max) return false;
  return true;
}

function highestTier(badge: HeightBadge, height: number): BadgeTier | null {
  for (const tier of [...BADGE_TIERS].reverse()) {
    if (permitsHeight(badge.tiers[tier], height)) return tier;
  }
  return null;
}

export function BadgeHeightView({ badges }: { badges: HeightBadge[] }) {
  const [height, setHeight] = useState(78);
  const [discipline, setDiscipline] = useState<"All" | DisciplineName>("All");
  const heights = useMemo(() => Array.from({ length: 19 }, (_, index) => 69 + index), []);
  const rows = badges
    .filter((badge) => discipline === "All" || badge.category === discipline)
    .map((badge) => ({ badge, tier: highestTier(badge, height) }));
  const available = rows.filter((row) => row.tier !== null).length;

  return (
    <section
      id="by-height"
      aria-labelledby="height-view-title"
      className="flex w-full flex-col gap-3 rounded border border-primary-container/60 bg-surface-card p-4 shadow-sm md:p-5"
    >
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-primary-container">By-height view</p>
          <h2 id="height-view-title" className="font-display text-headline-sm text-on-surface">Highest Badge Tier by Height</h2>
        </div>
        <nav className="flex gap-2 text-label-md" aria-label="Badge requirement views">
          <a aria-current="page" className="rounded bg-primary-container px-3 py-2 text-on-primary" href="#by-height">By height</a>
          <a className="rounded border border-border-low px-3 py-2 text-on-surface-variant hover:text-on-surface" href="#full-requirements">Full requirements</a>
        </nav>
      </div>

      <div className="grid grid-cols-2 gap-3 md:max-w-xl">
        <label className="flex flex-col gap-1 text-label-md text-text-muted">
          MyPLAYER height
          <select className="tool-select h-11 rounded border border-border-low bg-surface-container-lowest px-3 text-body-md text-on-surface" value={height} onChange={(event) => setHeight(Number(event.target.value))}>
            {heights.map((value) => <option key={value} value={value}>{heightLabel(value)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-label-md text-text-muted">
          Discipline
          <select className="tool-select h-11 rounded border border-border-low bg-surface-container-lowest px-3 text-body-md text-on-surface" value={discipline} onChange={(event) => setDiscipline(event.target.value as "All" | DisciplineName)}>
            <option value="All">All</option>
            {DISCIPLINES.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
      </div>

      <div aria-live="polite" className="rounded border border-border-low bg-surface-container-low p-3">
        <p className="text-body-md text-on-surface">
          <strong>{heightLabel(height)}:</strong> {available} of {rows.length} shown badges can reach a direct attribute tier.
        </p>
        <div className="mt-3 grid max-h-56 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ badge, tier }) => (
            <div key={badge.slug} className="flex min-h-12 items-center justify-between gap-2 rounded border border-border-low bg-surface-card px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-label-md text-on-surface">{badge.name}</p>
                <p className="text-body-sm text-text-muted">{badge.category}</p>
              </div>
              {tier ? <TierBadge tier={tier} size={40} /> : <span className="rounded border border-border-low px-2 py-1 text-label-sm text-text-muted">Unavailable</span>}
            </div>
          ))}
        </div>
        <p className="mt-2 text-body-sm text-text-muted">
          Calculated from this site&apos;s height restrictions for every badge tier. Attribute thresholds still apply; Legend requires Synergy.
        </p>
      </div>
    </section>
  );
}
