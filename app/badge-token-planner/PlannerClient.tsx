"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { FixtureBanner, SourceTag } from "@/components/SourceTag";
import {
  DISCIPLINES,
  badgeCatalog,
  costPoints,
  estimateCost,
  fetchBundle,
  type BadgeCatalogEntry,
  type CostMatrixBundle,
  type LoadState,
} from "@/lib/data";
import {
  DISCIPLINE_COUNT,
  HEIGHT_IN_MAX,
  HEIGHT_IN_MIN,
  MAX_BADGE_SLOTS,
  POSITIONS,
  decode,
  encode,
  type PlannerStateV1,
} from "@/lib/share-codec";

/**
 * Badge Token Planner (contract §2 #2, §6.2 state set).
 *
 * Planner state model == share-codec PlannerStateV1 (R8 frozen wire format):
 * position 0..4, heightIn 60..96, disciplinePriority permutation of 0..5,
 * badges [badgeIndex, slots] with total slots <= 20 (over-budget allowed in
 * UI so the over-budget state is reachable), blueprintRef 0..39 | -1.
 *
 * All badge names / token costs come from the gated fixture bundle and are
 * always labeled Unverified (contract §7/§8.1). The "Where the numbers come
 * from" block and cost-source FAQ stay offline until freeze v0.
 */

const DEFAULT_HEIGHT = 74;

function heightLabel(inches: number): string {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

interface ConflictHit {
  a: BadgeCatalogEntry;
  b: BadgeCatalogEntry;
  note?: string;
}

export function PlannerClient() {
  const router = useRouter();
  const [bundleState, setBundleState] = useState<LoadState<CostMatrixBundle>>({ status: "loading" });

  // R16 (H2): SSR ships the real controls, and a parse-time inline script
  // (see page.tsx) already answers position-select / guide-CTA clicks before
  // hydration, recording any pending choice on window.__m2kPendingPos. Here we
  // flag hydration for that bridge and adopt the pending choice into state.
  // Remaining secondary controls stay disabled until hydrated so nothing
  // presents a "clickable but dead" state.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const w = window as unknown as {
      __m2kPlannerHydrated?: boolean;
      __m2kPendingPos?: string;
    };
    w.__m2kPlannerHydrated = true;
    setHydrated(true);
    if (w.__m2kPendingPos !== undefined) {
      const p = Number.parseInt(w.__m2kPendingPos, 10);
      if (Number.isInteger(p) && p >= 0 && p < POSITIONS.length) setPosition(p);
      delete w.__m2kPendingPos;
    }
  }, []);

  const [position, setPosition] = useState<number>(-1); // -1 = empty state (copy: pick a position)
  const [heightIn, setHeightIn] = useState<number>(DEFAULT_HEIGHT);
  const [priorityOrder, setPriorityOrder] = useState<number[]>([]); // discipline indexes in click order
  const [allocations, setAllocations] = useState<Array<[number, number]>>([]); // [badgeIndex, slots]
  const [blueprintRef, setBlueprintRef] = useState<number>(-1);
  const [blueprintNote, setBlueprintNote] = useState<string | null>(null);

  // R16 (H1): the right-column empty state is a real CTA that scrolls back to
  // the Position controls and pulses a highlight ring as visual guidance.
  const posGroupRef = useRef<HTMLDivElement>(null);
  const [guideHighlight, setGuideHighlight] = useState(false);

  function guideToControls() {
    const el = posGroupRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setGuideHighlight(true);
    el.focus({ preventScroll: true });
    window.setTimeout(() => {
      setGuideHighlight(false);
      el.blur();
    }, 2400);
  }

  const load = useCallback(() => {
    setBundleState({ status: "loading" });
    fetchBundle<CostMatrixBundle>("/data/badge-cost-matrix.v0.json")
      .then((data) => setBundleState({ status: "ready", data }))
      .catch((e: unknown) =>
        setBundleState({
          status: "error",
          message: e instanceof Error ? e.message : "Data bundle failed to load.",
        }),
      );
  }, []);

  useEffect(load, [load]);

  // Restore state from hash: #v=<encoded> (from build card / shared link) or
  // #bp=<blueprintIndex> (from blueprints browser "Open in Planner").
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const encoded = params.get("v");
    const bp = params.get("bp");
    if (encoded) {
      const res = decode(encoded);
      if (res.ok) {
        setPosition(res.state.position);
        setHeightIn(res.state.heightIn);
        const ordered = res.state.disciplinePriority
          .map((rank, d) => ({ rank, d }))
          .sort((a, b) => a.rank - b.rank)
          .map((x) => x.d);
        setPriorityOrder(ordered);
        setAllocations(res.state.badges);
        setBlueprintRef(res.state.blueprintRef ?? -1);
      }
    } else if (bp !== null) {
      const idx = Number.parseInt(bp, 10);
      if (Number.isInteger(idx) && idx >= 0 && idx <= 39) {
        setBlueprintRef(idx);
        setBlueprintNote(`Starting from blueprint #${idx + 1} (fixture template).`);
      }
    }
    // Tool state lives in the hash only — never in an indexable URL (contract §2 rule 3).
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const catalog = useMemo(
    () => (bundleState.status === "ready" ? badgeCatalog(bundleState.data) : []),
    [bundleState],
  );
  const points = useMemo(
    () => (bundleState.status === "ready" ? costPoints(bundleState.data, catalog) : []),
    [bundleState, catalog],
  );

  const usedSlots = allocations.reduce((sum, [, s]) => sum + s, 0);
  const overBudget = usedSlots > MAX_BADGE_SLOTS;

  const conflicts = useMemo<ConflictHit[]>(() => {
    if (position < 0) return [];
    const assigned = new Map(allocations);
    const hits: ConflictHit[] = [];
    for (const badge of catalog) {
      if (!assigned.has(badge.index) || !badge.conflicts) continue;
      for (const c of badge.conflicts) {
        if (!assigned.has(c.withIndex)) continue;
        if (c.minHeightIn !== undefined && heightIn < c.minHeightIn) continue;
        const other = catalog.find((b) => b.index === c.withIndex);
        if (other && badge.index < other.index) {
          hits.push({ a: badge, b: other, note: c.note });
        }
      }
    }
    return hits;
  }, [allocations, catalog, heightIn, position]);

  const hasConflict = conflicts.length > 0;
  const complete = position >= 0 && usedSlots === MAX_BADGE_SLOTS && !overBudget && !hasConflict;

  function assignSlot(badgeIndex: number) {
    setAllocations((prev) => {
      const existing = prev.find(([b]) => b === badgeIndex);
      if (existing) {
        return prev.map(([b, s]): [number, number] => (b === badgeIndex ? [b, Math.min(s + 1, MAX_BADGE_SLOTS)] : [b, s]));
      }
      return [...prev, [badgeIndex, 1]];
    });
  }

  function removeSlot(badgeIndex: number) {
    setAllocations((prev) =>
      prev
        .map(([b, s]): [number, number] => (b === badgeIndex ? [b, s - 1] : [b, s]))
        .filter(([, s]) => s > 0),
    );
  }

  function togglePriority(d: number) {
    setPriorityOrder((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  function startOver() {
    setPosition(-1);
    setHeightIn(DEFAULT_HEIGHT);
    setPriorityOrder([]);
    setAllocations([]);
    setBlueprintRef(-1);
    setBlueprintNote(null);
  }

  function disciplinePriorityPermutation(): number[] {
    // Rank per discipline: clicked order first, unassigned disciplines fill the
    // remaining ranks in default order (keeps wire format a valid permutation).
    const remaining = Array.from({ length: DISCIPLINE_COUNT }, (_, i) => i).filter(
      (d) => !priorityOrder.includes(d),
    );
    const full = [...priorityOrder, ...remaining];
    const ranks = new Array<number>(DISCIPLINE_COUNT);
    full.forEach((d, rank) => {
      ranks[d] = rank;
    });
    return ranks;
  }

  function generateShareLink() {
    const state: PlannerStateV1 = {
      position,
      heightIn,
      disciplinePriority: disciplinePriorityPermutation(),
      badges: allocations,
      blueprintRef,
    };
    const res = encode(state);
    if (res.ok) {
      router.push(`/build-card#v=${res.id}`);
    }
  }

  /* ---------- data bundle states (contract §6.1) ---------- */

  // R16 (H2): the data bundle only gates the badge list (right column). The
  // Position/Height/Priorities controls do not depend on the bundle and are
  // rendered immediately (SSR) so the tool is usable the moment it hydrates,
  // instead of the whole tool sitting behind a skeleton until the fetch lands.
  const bundleLoading = bundleState.status === "loading";
  const bundleError = bundleState.status === "error" ? bundleState.message : null;

  const emptyCatalog = catalog.length === 0;

  /* ---------- derived UI state ---------- */

  const statusLine = (() => {
    if (position < 0) return { kind: "empty" as const, text: "Pick a position and height to see live token costs." };
    if (overBudget)
      return { kind: "over" as const, text: "Over budget. Remove tokens or lower a badge tier to finish your plan." };
    if (hasConflict)
      return {
        kind: "conflict" as const,
        text: "This combination isn't allowed. Adjust your allocation to continue.",
      };
    if (complete) return { kind: "complete" as const, text: "Plan complete. Generate a share link, or keep editing." };
    return { kind: "progress" as const, text: `${usedSlots} / ${MAX_BADGE_SLOTS} slots used` };
  })();

  const ctaDisabledReason = (() => {
    if (complete) return null;
    if (overBudget) return "Over budget. Remove tokens or lower a badge tier to finish your plan.";
    if (hasConflict) return "This combination isn't allowed. Adjust your allocation to continue.";
    return `Complete all ${MAX_BADGE_SLOTS} slots to generate a link`;
  })();

  return (
    <div className="flex flex-col gap-6">
      <FixtureBanner />
      {blueprintNote ? (
        <div className="flex items-center gap-2 rounded border border-secondary-container bg-surface-container-low p-3">
          <Icon name="info" size={18} className="text-secondary" />
          <p className="text-body-sm text-on-surface-variant">{blueprintNote}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: controls */}
        <section
          aria-busy={!hydrated}
          className="relative flex flex-col gap-8 rounded border border-border-low bg-surface-card p-6"
        >
          {!hydrated ? (
            // R16.1: absolute-positioned status pill — taking it out of the
            // flow means removing it at hydration causes zero layout shift
            // (previously the in-flow paragraph shifted the controls ~49px).
            <p role="status" className="absolute right-4 top-4 animate-pulse text-body-sm text-text-muted">
              Loading controls…
            </p>
          ) : null}
          <div
            id="planner-position-group"
            ref={posGroupRef}
            tabIndex={-1}
            className={`scroll-mt-24 rounded-lg outline-none transition-shadow ${
              guideHighlight ? "-m-2 p-2 ring-2 ring-primary-container" : ""
            }`}
          >
            <h2 className="mb-4 font-display text-headline-sm text-on-surface">Core Attributes</h2>
            <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Position</span>
            <div className="flex flex-wrap gap-2">
              {POSITIONS.map((p, i) => (
                <button
                  key={p}
                  type="button"
                  data-m2k-pos={i}
                  // R16: works pre-hydration via the inline bridge; React only
                  // manages aria-pressed after hydration so the bridge's
                  // pre-hydration selection never trips hydration matching.
                  aria-pressed={hydrated ? position === i : undefined}
                  onClick={() => setPosition(i)}
                  className={`rounded border px-4 py-2 text-label-md font-bold transition-colors ${
                    position === i
                      ? "border-primary-container bg-primary-container text-on-primary"
                      : "border-border-low bg-surface-container-high text-on-surface-variant hover:border-primary-container hover:text-on-surface"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-label-md uppercase text-on-surface-variant">Height</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Decrease height"
                disabled={!hydrated || heightIn <= HEIGHT_IN_MIN}
                onClick={() => setHeightIn((h) => Math.max(HEIGHT_IN_MIN, h - 1))}
                className="rounded border border-border-low bg-surface-container-high p-2 text-on-surface-variant hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="remove" size={18} />
              </button>
              <span className="min-w-16 text-center font-display text-headline-md text-primary-container">
                {heightLabel(heightIn)}
              </span>
              <button
                type="button"
                aria-label="Increase height"
                disabled={!hydrated || heightIn >= HEIGHT_IN_MAX}
                onClick={() => setHeightIn((h) => Math.min(HEIGHT_IN_MAX, h + 1))}
                className="rounded border border-border-low bg-surface-container-high p-2 text-on-surface-variant hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="add" size={18} />
              </button>
            </div>
            <p className="mt-2 text-body-sm text-text-muted">Token costs update live as you change height.</p>
          </div>

          <div>
            <h2 className="mb-1 font-display text-headline-sm text-on-surface">Priorities</h2>
            <span className="mb-3 block text-label-md uppercase text-on-surface-variant">
              Tier allocation — select disciplines in priority order
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DISCIPLINES.map((name, d) => {
                const rank = priorityOrder.indexOf(d);
                return (
                  <button
                    key={name}
                    type="button"
                    disabled={!hydrated}
                    onClick={() => togglePriority(d)}
                    aria-pressed={rank >= 0}
                    className={`flex items-center justify-between rounded border px-3 py-2 text-label-md transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      rank >= 0
                        ? "border-secondary bg-surface-container-high text-secondary"
                        : "border-border-low bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {name}
                    {rank >= 0 ? (
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-code-sm font-bold text-on-secondary">
                        P{rank + 1}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded border border-border-low bg-surface-container-low p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-headline-sm text-on-surface">Token Budget</h3>
              <span
                className={`text-code-sm ${overBudget ? "text-error" : "text-on-surface-variant"}`}
              >
                {usedSlots}/{MAX_BADGE_SLOTS} SLOTS USED
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div
                className={`h-full transition-all ${overBudget ? "bg-error" : "bg-primary-container"}`}
                style={{ width: `${Math.min(100, (usedSlots / MAX_BADGE_SLOTS) * 100)}%` }}
              />
            </div>
            <p
              role={statusLine.kind === "over" || statusLine.kind === "conflict" ? "alert" : "status"}
              className={`mt-3 text-body-sm ${
                statusLine.kind === "over" || statusLine.kind === "conflict"
                  ? "text-error"
                  : statusLine.kind === "complete"
                    ? "text-secondary"
                    : "text-on-surface-variant"
              }`}
            >
              {statusLine.text}
            </p>
            {hasConflict ? (
              <ul className="mt-2 flex flex-col gap-1">
                {conflicts.map((c) => (
                  <li key={`${c.a.index}-${c.b.index}`} className="flex items-center gap-2 text-body-sm text-error">
                    <Icon name="warning" size={16} />
                    {c.a.name} conflicts with {c.b.name}
                    {c.note ? ` — ${c.note}` : ""} (fixture rule)
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-2 text-body-sm text-text-muted">
              Costs shown are fixture placeholders. <SourceTag tier="unverified" />
            </p>
          </div>
        </section>

        {/* Right: badge loadout */}
        <section className="flex flex-col gap-4 rounded border border-border-low bg-surface-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-headline-sm text-on-surface">Badge Loadout</h2>
            <button
              type="button"
              disabled={!hydrated}
              onClick={startOver}
              className="flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="restart_alt" size={16} />
              Start over
            </button>
          </div>

          {bundleError !== null ? (
            <div className="flex flex-col items-center gap-4 rounded border border-border-low bg-surface-container-low p-8 text-center">
              <Icon name="warning" size={28} className="text-error" />
              <p className="text-body-md text-on-surface-variant">
                The badge data bundle couldn&apos;t be loaded. Check your connection and try again.
              </p>
              <button
                type="button"
                disabled={!hydrated}
                onClick={load}
                className="rounded bg-primary-container px-6 py-3 text-label-md font-bold text-on-primary hover:bg-surface-tint disabled:cursor-not-allowed disabled:opacity-50"
              >
                Retry
              </button>
            </div>
          ) : position < 0 ? (
            // R16 (H1): real CTA, not a dead info card. Works pre-hydration
            // via the inline bridge (scroll); post-hydration it also focuses
            // and highlights the Position group.
            <button
              type="button"
              data-m2k-guide="true"
              onClick={guideToControls}
              className="group flex flex-col items-center gap-3 rounded border border-dashed border-primary-container p-8 text-center transition-colors hover:bg-surface-container-low"
            >
              <Icon name="info" size={24} className="text-primary-container" />
              <span className="text-body-md text-on-surface-variant">
                Pick a position and height to see live token costs.
              </span>
              <span className="rounded bg-primary-container px-4 py-2 text-label-md font-bold text-on-primary transition-colors group-hover:bg-surface-tint">
                Choose a position
              </span>
            </button>
          ) : bundleLoading ? (
            <div className="flex flex-col gap-2" aria-busy="true">
              <p role="status" className="animate-pulse text-body-sm text-text-muted">
                Loading badge data…
              </p>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded border border-border-low bg-surface-container-high"
                />
              ))}
            </div>
          ) : emptyCatalog ? (
            <div className="rounded border border-dashed border-border-low p-8 text-center text-body-md text-on-surface-variant">
              No badges in the data bundle.
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {catalog.map((badge) => {
                const assigned = allocations.find(([b]) => b === badge.index)?.[1] ?? 0;
                const cost = estimateCost(points, badge.index, POSITIONS[position], heightIn);
                const minCost = estimateCost(points, badge.index, POSITIONS[position], HEIGHT_IN_MIN);
                const costsMoreHere = cost !== null && minCost !== null && cost > minCost;
                return (
                  <li
                    key={badge.index}
                    className="flex flex-wrap items-center gap-3 rounded border border-border-low bg-surface-container-low px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-body-md text-on-surface">{badge.name}</span>
                        <span className="rounded bg-surface-container-high px-1.5 py-0.5 text-code-sm text-on-surface-variant">
                          {DISCIPLINES[badge.discipline] ?? "—"}
                        </span>
                        {badge.fixtureOnly ? <SourceTag tier="unverified" /> : null}
                      </div>
                      <div className="mt-1 text-body-sm text-text-muted">
                        {cost !== null ? (
                          <>
                            Fixture cost at {heightLabel(heightIn)}: {cost} tokens
                            {costsMoreHere ? (
                              <span className="ml-2 text-error">
                                This badge costs more at your current height.
                              </span>
                            ) : null}
                          </>
                        ) : (
                          "No fixture cost sampled for this position."
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assigned > 0 ? (
                        <>
                          <button
                            type="button"
                            aria-label={`Remove a slot from ${badge.name}`}
                            onClick={() => removeSlot(badge.index)}
                            className="rounded border border-border-low bg-surface-container-high p-1.5 text-on-surface-variant hover:text-on-surface"
                          >
                            <Icon name="remove" size={16} />
                          </button>
                          <span className="min-w-8 text-center text-label-md text-primary-container">
                            {assigned}
                          </span>
                        </>
                      ) : null}
                      <button
                        type="button"
                        aria-label={`Assign a slot to ${badge.name}`}
                        onClick={() => assignSlot(badge.index)}
                        className="rounded border border-border-low bg-surface-container-high p-1.5 text-primary-container hover:bg-primary-container hover:text-on-primary"
                      >
                        <Icon name="add" size={16} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-auto flex flex-col gap-2 border-t border-border-low pt-4">
            <button
              type="button"
              disabled={!hydrated || !complete}
              onClick={generateShareLink}
              className={`flex items-center justify-center gap-2 rounded px-6 py-3 text-label-md font-bold transition-colors ${
                complete
                  ? "bg-primary-container text-on-primary hover:bg-surface-tint"
                  : "cursor-not-allowed bg-surface-container-high text-text-muted"
              }`}
            >
              <Icon name="share" size={16} />
              Generate Share Link
            </button>
            {ctaDisabledReason ? (
              <p className="text-center text-body-sm text-text-muted">{ctaDisabledReason}</p>
            ) : null}
            {overBudget || hasConflict ? (
              <button
                type="button"
                onClick={() => {
                  const first = overBudget ? allocations[allocations.length - 1]?.[0] : conflicts[0]?.a.index;
                  if (first !== undefined) removeSlot(first);
                }}
                className="mx-auto text-label-md text-primary-container hover:underline"
              >
                Adjust Allocation
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
