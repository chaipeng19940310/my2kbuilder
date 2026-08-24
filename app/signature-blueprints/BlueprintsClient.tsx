"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { FixtureBanner, SourceTag } from "@/components/SourceTag";
import {
  BLUEPRINT_ATTRIBUTES,
  blueprintList,
  fetchBundle,
  type Blueprint,
  type BlueprintsBundle,
  type LoadState,
} from "@/lib/data";
import { POSITIONS } from "@/lib/share-codec";

/**
 * Signature Blueprints browser (contract §2 #3, §6.2 state set).
 *
 * All blueprint fields come from the gated fixture bundle (blueprints.v0.json)
 * and are always labeled Unverified — never presented as fact (contract §7).
 * No ItemList schema is emitted before freeze v0 (§8.1, enforced in lib/schema).
 *
 * Selection state travels in the URL hash (#c=...) — never in an indexable
 * URL (contract §2 rule 3). Compare itself is a noindex route.
 */

const SCORING_OPTS = [
  { value: "", label: "Scoring (Any)" },
  { value: "inside", label: "Inside" },
  { value: "mid-range", label: "Mid-Range" },
  { value: "3pt", label: "3PT" },
] as const;
const PLAYMAKING_OPTS = [
  { value: "", label: "Playmaking (Any)" },
  { value: "passer", label: "Passer" },
  { value: "ball-handler", label: "Ball Handler" },
] as const;
const DEFENSE_OPTS = [
  { value: "", label: "Defense (Any)" },
  { value: "perimeter", label: "Perimeter" },
  { value: "interior", label: "Interior" },
] as const;

function heightLabel(inches: number): string {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

function topAttributes(bp: Blueprint, count: number): Array<{ key: string; label: string; value: number }> {
  const attrs = bp.attributes;
  if (!attrs) return [];
  return BLUEPRINT_ATTRIBUTES.map(([key, label]) => ({
    key,
    label,
    value: attrs[key as keyof typeof attrs] ?? 0,
  }))
    .sort((a, b) => b.value - a.value)
    .slice(0, count);
}

function playstyleTags(bp: Blueprint): string[] {
  const tags: string[] = [];
  if (bp.playstyle?.scoring) tags.push(bp.playstyle.scoring === "3pt" ? "3PT" : bp.playstyle.scoring);
  if (bp.playstyle?.playmaking) tags.push(bp.playstyle.playmaking);
  if (bp.playstyle?.defense) tags.push(bp.playstyle.defense);
  return tags;
}

export function BlueprintsClient() {
  const router = useRouter();
  const [bundleState, setBundleState] = useState<LoadState<BlueprintsBundle>>({ status: "loading" });

  const [position, setPosition] = useState<string>("");
  const [scoring, setScoring] = useState<string>("");
  const [playmaking, setPlaymaking] = useState<string>("");
  const [defense, setDefense] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [selected, setSelected] = useState<number[]>([]);

  const load = useCallback(() => {
    setBundleState({ status: "loading" });
    fetchBundle<BlueprintsBundle>("/data/blueprints.v0.json")
      .then((data) => setBundleState({ status: "ready", data }))
      .catch((e: unknown) =>
        setBundleState({
          status: "error",
          message: e instanceof Error ? e.message : "Data bundle failed to load.",
        }),
      );
  }, []);

  useEffect(load, [load]);

  const blueprints = useMemo(
    () => (bundleState.status === "ready" ? blueprintList(bundleState.data) : []),
    [bundleState],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blueprints.filter((bp) => {
      if (position && bp.position !== position) return false;
      if (scoring && bp.playstyle?.scoring !== scoring) return false;
      if (playmaking && bp.playstyle?.playmaking !== playmaking) return false;
      if (defense && bp.playstyle?.defense !== defense) return false;
      if (q && !(bp.name ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [blueprints, position, scoring, playmaking, defense, query]);

  const hasActiveFilter = Boolean(position || scoring || playmaking || defense || query.trim());

  function clearFilters() {
    setPosition("");
    setScoring("");
    setPlaymaking("");
    setDefense("");
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

  /* ---------- data bundle states (contract §6.1) ---------- */

  if (bundleState.status === "loading") {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse rounded border border-border-low bg-surface-card p-6">
            <div className="mb-4 h-6 w-2/3 rounded bg-surface-container-high" />
            <div className="mb-2 h-4 w-1/3 rounded bg-surface-container-high" />
            <div className="h-24 w-full rounded bg-surface-container-high" />
          </div>
        ))}
      </div>
    );
  }

  if (bundleState.status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 rounded border border-border-low bg-surface-card p-8 text-center">
        <Icon name="warning" size={28} className="text-error" />
        <p className="text-body-md text-on-surface-variant">
          The blueprint data bundle couldn&apos;t be loaded. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={load}
          className="rounded bg-primary-container px-6 py-3 text-label-md font-bold text-on-primary hover:bg-surface-tint"
        >
          Retry
        </button>
      </div>
    );
  }

  const selectBase =
    "rounded border border-border-low bg-surface-container-high px-3 py-2 text-label-md text-on-surface-variant focus:border-primary-container focus:outline-none";

  return (
    <div className="flex flex-col gap-6 pb-28">
      <FixtureBanner />

      {/* Filters (copy §3.3 microcopy: Filter by position / playstyle / Clear filters) */}
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
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-label-md uppercase text-on-surface-variant">Filter by playstyle</span>
          <select value={scoring} onChange={(e) => setScoring(e.target.value)} className={selectBase} aria-label="Filter by scoring playstyle">
            {SCORING_OPTS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select value={playmaking} onChange={(e) => setPlaymaking(e.target.value)} className={selectBase} aria-label="Filter by playmaking style">
            {PLAYMAKING_OPTS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select value={defense} onChange={(e) => setDefense(e.target.value)} className={selectBase} aria-label="Filter by defense style">
            {DEFENSE_OPTS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 rounded border border-border-low bg-surface-container-high px-3 py-2">
            <Icon name="search" size={16} className="text-on-surface-variant" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name — e.g. 3-and-D…"
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
            return (
              <li
                key={bp.index}
                className={`flex flex-col gap-4 rounded border p-6 transition-colors ${
                  isSelected
                    ? "border-secondary bg-surface-container-low"
                    : "border-border-low bg-surface-card hover:border-primary-container"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display text-headline-sm text-on-surface">{bp.name}</h3>
                    <p className="mt-1 text-body-sm text-text-muted">
                      {bp.position ?? "—"}
                      {bp.height_in ? ` · ${heightLabel(bp.height_in)}` : ""}
                      {bp.weight_lb ? ` · ${bp.weight_lb} lbs` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSelect(bp.index)}
                    aria-pressed={isSelected}
                    aria-label={`Select ${bp.name} for comparison`}
                    disabled={!isSelected && selected.length >= 3}
                    className={`shrink-0 rounded border p-2 transition-colors ${
                      isSelected
                        ? "border-secondary bg-secondary text-on-secondary"
                        : "border-border-low bg-surface-container-high text-on-surface-variant hover:border-secondary hover:text-secondary disabled:opacity-40"
                    }`}
                  >
                    <Icon name={isSelected ? "check" : "add"} size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {playstyleTags(bp).map((t) => (
                    <span
                      key={t}
                      className="rounded bg-surface-container-high px-1.5 py-0.5 text-code-sm capitalize text-on-surface-variant"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <ul className="flex flex-col gap-1">
                  {topAttributes(bp, 3).map((a) => (
                    <li key={a.key} className="flex items-center justify-between text-body-sm">
                      <span className="text-on-surface-variant">{a.label}</span>
                      <span className="text-primary-container">{a.value}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-col gap-3 border-t border-border-low pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <SourceTag tier="unverified" />
                    <span className="text-body-sm text-text-muted">
                      {bp.keyBadges?.length ?? 0} key badges
                    </span>
                  </div>
                  <Link
                    href={`/badge-token-planner#bp=${bp.index}`}
                    className="flex items-center gap-1 text-label-md text-primary-container hover:underline"
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
