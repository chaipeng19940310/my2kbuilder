"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { DataSourceBanner, SourceTag } from "@/components/SourceTag";
import {
  blueprintList,
  blueprintUnlocks,
  type Blueprint,
  type BlueprintsBundle,
} from "@/lib/data";
import { POSITIONS } from "@/lib/share-codec";

/**
 * Signature Blueprints browser (contract §2 #3, §6.2 state set).
 *
 * R12I-A: cards run on the real production bundle (/data/blueprints.v1.json).
 * The 40-template count, the three-player blend mechanism and Bulldozer's
 * blend are described on 2K's published builder pages (official_confirmed);
 * every other blueprint's name, comparisons and profile fields are
 * single-source community data and are labeled Unverified per item (owner
 * decision r12i-wave1-owner-decision-2026-08-28).
 *
 * R12I-D: the bundle is imported at build time and passed in as a prop, so
 * the full 40-card grid (real names + three-player blends) is server-rendered
 * into the HTML — crawlers see real content without executing JS. Position /
 * search filters and compare selection stay client-side enhancements.
 *
 * Selection state travels in the URL hash (#c=...) — never in an indexable
 * URL (contract §2 rule 3). Compare itself is a noindex route.
 */

function topAttributes(bp: Blueprint, count: number): Array<{ label: string; value: number }> {
  const attrs = bp.profile?.attributes_start ?? {};
  return Object.entries(attrs)
    .filter((e): e is [string, number] => typeof e[1] === "number")
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, count);
}

export function BlueprintsClient({ bundle }: { bundle: BlueprintsBundle }) {
  const router = useRouter();

  const [position, setPosition] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [selected, setSelected] = useState<number[]>([]);

  const blueprints = useMemo(() => blueprintList(bundle), [bundle]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blueprints.filter((bp) => {
      if (position && bp.profile?.position !== position) return false;
      if (q && !bp.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [blueprints, position, query]);

  const hasActiveFilter = Boolean(position || query.trim());

  function clearFilters() {
    setPosition("");
    setQuery("");
  }

  function toggleSelect(index: number) {
    setSelected((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      if (prev.length >= 3) return prev;
      return [...prev, index];
    });
  }

  function goCompare() {
    if (selected.length >= 2) {
      router.push(`/signature-blueprints/compare#c=${selected.join(",")}`);
    }
  }

  /* ---------- data bundle states (contract §6.1) ----------
     R12I-D: no runtime fetch — the bundle is a build-time prop, so the grid
     renders on the server and there is no loading/error shell here. */

  return (
    <div className="flex flex-col gap-6 pb-28">
      <DataSourceBanner scope="blueprints" />

      {/* Filters (copy §3.3 microcopy: Filter by position / Clear filters) */}
      <section
        aria-label="Blueprint filters"
        className="flex flex-col gap-4 rounded border border-border-low bg-surface-card p-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-label-md uppercase text-on-surface-variant">Filter by position</span>
          <div className="flex flex-wrap gap-2">
            {["", ...POSITIONS].map((p) => (
              <button
                key={p || "all"}
                type="button"
                onClick={() => setPosition(p)}
                aria-pressed={position === p}
                className={`rounded border px-3 py-1.5 text-label-md font-bold transition-colors ${
                  position === p
                    ? "border-primary-container bg-primary-container text-on-primary"
                    : "border-border-low bg-surface-container-high text-on-surface-variant hover:border-primary-container hover:text-on-surface"
                }`}
              >
                {p || "All"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded border border-border-low bg-surface-container-high px-3 py-2">
            <Icon name="search" size={16} className="text-on-surface-variant" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name — e.g. Bulldozer…"
              aria-label="Search blueprints by name"
              className="w-44 bg-transparent text-label-md text-on-surface placeholder:text-text-muted focus:outline-none"
            />
          </div>
          {hasActiveFilter ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-label-md text-primary-container hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded border border-dashed border-border-low p-10 text-center">
          <Icon name="search" size={24} className="text-on-surface-variant" />
          <p className="text-body-md text-on-surface-variant">
            No blueprints match these filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded border border-outline px-6 py-3 text-label-md font-bold text-on-surface hover:bg-surface-card"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((bp) => {
            const isSelected = selected.includes(bp.index);
            const p = bp.profile;
            const nameIsConfirmed = bp.field_tiers.name === "official_confirmed";
            const unlockCount = blueprintUnlocks(bp).length;
            return (
              <li
                key={bp.index}
                id={`bp-${bp.slug}`}
                className={`flex flex-col overflow-hidden rounded-xl border transition-colors ${
                  isSelected
                    ? "border-2 border-secondary bg-surface-container-low shadow-[0_0_15px_rgba(157,223,46,0.15)]"
                    : "border-border-low bg-surface-card hover:border-primary-container"
                }`}
              >
                <div className="flex flex-grow flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-3">
                      <span className="rounded bg-primary-container/10 px-2.5 py-1 font-display text-code-sm font-bold uppercase text-primary-container">
                        {p?.position ?? "—"}
                      </span>
                      <span className="text-body-sm text-on-surface-variant">
                        {p?.height ?? "—"}
                        {p?.weight_lb ? ` · ${p.weight_lb} lbs` : ""}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSelect(bp.index)}
                      aria-pressed={isSelected}
                      aria-label={`Select ${bp.name} for comparison`}
                      disabled={!isSelected && selected.length >= 3}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border transition-colors ${
                        isSelected
                          ? "border-secondary bg-secondary text-on-secondary"
                          : "border-border-low bg-surface-container-high text-on-surface-variant hover:border-secondary hover:text-secondary disabled:opacity-40"
                      }`}
                    >
                      <Icon name={isSelected ? "check" : "add"} size={18} />
                    </button>
                  </div>
                  <h3 className="font-display text-headline-md font-bold text-on-surface">{bp.name}</h3>
                  <p className="text-body-sm text-on-surface-variant">
                    Blends: {bp.comparisons.join(" · ")}
                  </p>
                  {nameIsConfirmed ? <SourceTag tier="official" /> : null}

                <div className="my-4 flex flex-wrap gap-1.5">
                  {p?.best_skill ? (
                    <span className="rounded border border-border-low bg-surface-container-high px-2 py-0.5 text-code-sm capitalize text-on-surface-variant">
                      {p.best_skill}
                    </span>
                  ) : null}
                </div>

                <ul className="mt-auto flex flex-col gap-3">
                  {topAttributes(bp, 3).map((a) => (
                    <li key={a.label} className="text-body-sm">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-text-muted">{a.label}</span>
                        <span className="font-bold text-primary-container">{a.value}</span>
                      </div>
                      <span className="block h-1.5 overflow-hidden rounded-full border border-border-low bg-surface-container-high">
                        <span className="block h-full rounded-full bg-primary-container" style={{ width: `${a.value}%` }} />
                      </span>
                    </li>
                  ))}
                </ul>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-low bg-surface-container-high px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Profile fields are single-source community data on every
                        card; for Bulldozer the name/blend carry the confirmed
                        tag above and this tag covers the profile only. */}
                    <SourceTag tier="unverified" />
                    <span className="text-body-sm text-text-muted">
                      {unlockCount} badge unlocks at start
                    </span>
                  </div>
                  <Link
                    href={`/badge-token-planner#bp=${bp.index}`}
                    className="flex items-center gap-1 text-code-sm font-bold uppercase text-primary-container hover:text-secondary"
                  >
                    Open in Planner <Icon name="arrow_forward" size={16} />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Compare tray (copy §3.3: sticky bottom, active at >=2 selected) */}
      <div className="sticky bottom-4 z-20 mt-2">
        <div className="mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3 rounded border border-border-low bg-surface-container-lowest/95 px-4 py-3 shadow-lg backdrop-blur">
          {selected.length < 2 ? (
            <p className="text-body-sm text-on-surface-variant">
              Select 2–3 blueprints to open the comparison table.
            </p>
          ) : (
            <p className="text-body-sm text-on-surface-variant">
              {selected.length}/3 selected — differences measured against the first pick.
            </p>
          )}
          <div className="flex items-center gap-3">
            {selected.length > 0 ? (
              <button
                type="button"
                onClick={() => setSelected([])}
                className="text-label-md text-on-surface-variant hover:text-on-surface"
              >
                Clear
              </button>
            ) : null}
            <button
              type="button"
              onClick={goCompare}
              disabled={selected.length < 2}
              className={`flex items-center gap-2 rounded px-5 py-2.5 text-label-md font-bold transition-colors ${
                selected.length >= 2
                  ? "bg-primary-container text-on-primary hover:bg-surface-tint"
                  : "cursor-not-allowed bg-surface-container-high text-text-muted"
              }`}
            >
              Compare Selected {selected.length > 0 ? `(${selected.length}/3)` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
