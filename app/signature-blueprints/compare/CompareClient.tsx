"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { FixtureBanner, SourceTag } from "@/components/SourceTag";
import {
  BLUEPRINT_ATTRIBUTES,
  badgeCatalog,
  blueprintList,
  fetchBundle,
  type Blueprint,
  type BlueprintsBundle,
  type CostMatrixBundle,
  type LoadState,
} from "@/lib/data";

/**
 * Blueprint comparison (contract §2 #4, §6.2 state set) — noindex, follow.
 *
 * Selection arrives in the URL hash (#c=0,3,5) from the blueprints browser —
 * tool state never lives in an indexable URL (contract §2 rule 3).
 * Differences are measured against the first selected blueprint (baseline).
 * All values are gated fixture data, always labeled Unverified (§7).
 * PRD D3: this page has NO share CTA — sharing starts only from a Build Card.
 */

type BundlesState = LoadState<{ blueprints: Blueprint[]; badgeNames: Map<number, string> }>;

function heightLabel(inches: number): string {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

export function CompareClient() {
  const [state, setState] = useState<BundlesState>({ status: "loading" });
  const [selection, setSelection] = useState<number[] | null>(null);

  // Parse the selection hash once on mount.
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const raw = params.get("c");
    if (!raw) {
      setSelection(null);
      return;
    }
    const idx = raw
      .split(",")
      .map((s) => Number.parseInt(s, 10))
      .filter((n) => Number.isInteger(n) && n >= 0 && n <= 39);
    const unique = [...new Set(idx)].slice(0, 3);
    setSelection(unique.length >= 2 ? unique : null);
  }, []);

  const load = useCallback(() => {
    setState({ status: "loading" });
    Promise.all([
      fetchBundle<BlueprintsBundle>("/data/blueprints.v0.json"),
      fetchBundle<CostMatrixBundle>("/data/badge-cost-matrix.v0.json"),
    ])
      .then(([bpBundle, costBundle]) => {
        const names = new Map<number, string>();
        for (const b of badgeCatalog(costBundle)) names.set(b.index, b.name);
        setState({ status: "ready", data: { blueprints: blueprintList(bpBundle), badgeNames: names } });
      })
      .catch((e: unknown) =>
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Data bundle failed to load.",
        }),
      );
  }, []);

  useEffect(() => {
    if (selection !== null) load();
  }, [selection, load]);

  const picked: Blueprint[] = useMemo(() => {
    if (state.status !== "ready" || selection === null) return [];
    return selection
      .map((i) => state.data.blueprints.find((b) => b.index === i))
      .filter((b): b is Blueprint => Boolean(b));
  }, [state, selection]);

  /* ---------- no / insufficient selection (contract §6.2 未选中态) ---------- */
  if (selection === null) {
    return (
      <div className="flex flex-col items-center gap-4 rounded border border-dashed border-border-low p-10 text-center">
        <Icon name="view_cozy" size={24} className="text-on-surface-variant" />
        <p className="text-body-md text-on-surface-variant">
          Select 2–3 blueprints to open the comparison table.
        </p>
        <Link
          href="/signature-blueprints"
          className="rounded bg-primary-container px-6 py-3 text-label-md font-bold text-on-primary hover:bg-surface-tint"
        >
          Back to Blueprints
        </Link>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="animate-pulse rounded border border-border-low bg-surface-card p-6" aria-busy="true">
        <div className="mb-4 h-6 w-1/3 rounded bg-surface-container-high" />
        <div className="h-64 w-full rounded bg-surface-container-high" />
      </div>
    );
  }

  if (state.status === "error") {
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

  if (picked.length < 2) {
    return (
      <div className="flex flex-col items-center gap-4 rounded border border-dashed border-border-low p-10 text-center">
        <p className="text-body-md text-on-surface-variant">
          This comparison link doesn&apos;t match blueprints in the current data bundle.
        </p>
        <Link
          href="/signature-blueprints"
          className="rounded bg-primary-container px-6 py-3 text-label-md font-bold text-on-primary hover:bg-surface-tint"
        >
          Back to Blueprints
        </Link>
      </div>
    );
  }

  const baseline = picked[0];
  const baseAttrs = baseline.attributes;

  return (
    <div className="flex flex-col gap-6">
      <FixtureBanner />
      <p className="text-body-md text-on-surface-variant">
        Comparing {picked.length} blueprints. Differences are measured against the first blueprint
        you selected.
      </p>

      {/* Real <table> (contract §4.3); small screens scroll horizontally. */}
      <div className="overflow-x-auto rounded border border-border-low bg-surface-card">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border-low">
              <th className="p-4 align-bottom text-label-md uppercase text-on-surface-variant">
                Attribute
              </th>
              {picked.map((bp, i) => (
                <th key={bp.index} className="min-w-44 p-4 align-bottom">
                  <div className="flex flex-col gap-1">
                    {i === 0 ? (
                      <span className="w-fit rounded bg-secondary px-1.5 py-0.5 text-code-sm font-bold text-on-secondary">
                        Baseline
                      </span>
                    ) : null}
                    <span className="font-display text-headline-sm text-on-surface">{bp.name}</span>
                    <span className="text-body-sm text-text-muted">
                      {bp.position ?? "—"}
                      {bp.height_in ? ` · ${heightLabel(bp.height_in)}` : ""}
                      {bp.weight_lb ? ` · ${bp.weight_lb} lbs` : ""}
                    </span>
                    <Link
                      href={`/badge-token-planner#bp=${bp.index}`}
                      className="mt-1 flex items-center gap-1 text-label-md text-primary-container hover:underline"
                    >
                      Open in Planner <Icon name="open_in_new" size={14} />
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BLUEPRINT_ATTRIBUTES.map(([key, label]) => {
              const baseVal = baseAttrs?.[key as keyof NonNullable<typeof baseAttrs>] ?? 0;
              return (
                <tr key={key} className="border-b border-border-low last:border-0">
                  <th className="p-4 text-body-md font-normal text-on-surface-variant">{label}</th>
                  {picked.map((bp, i) => {
                    const v = bp.attributes?.[key as keyof NonNullable<typeof bp.attributes>] ?? 0;
                    const delta = v - baseVal;
                    return (
                      <td key={bp.index} className="p-4">
                        <span className="text-body-md text-on-surface">{v}</span>
                        {i > 0 && delta !== 0 ? (
                          <span
                            className={`ml-2 inline-flex items-center gap-0.5 text-code-sm ${
                              delta > 0 ? "text-secondary" : "text-error"
                            }`}
                          >
                            <Icon name={delta > 0 ? "arrow_upward" : "arrow_downward"} size={14} />
                            {Math.abs(delta)}
                          </span>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr>
              <th className="p-4 align-top text-body-md font-normal text-on-surface-variant">
                Key Badges
              </th>
              {picked.map((bp) => (
                <td key={bp.index} className="p-4">
                  <ul className="flex flex-col gap-1">
                    {(bp.keyBadges ?? []).map((bi) => (
                      <li key={bi} className="text-body-sm text-on-surface">
                        {state.data.badgeNames.get(bi) ?? `Badge #${bi}`}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SourceTag tier="unverified" />
        <span className="text-body-sm text-text-muted">
          Fixture attribute and badge values — placeholders pending freeze v0.
        </span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/signature-blueprints"
          className="flex items-center justify-center gap-2 rounded border border-outline px-6 py-3 text-label-md font-bold text-on-surface transition-colors duration-200 hover:bg-surface-card"
        >
          <Icon name="arrow_back" size={16} /> Back to Blueprints
        </Link>
        <Link
          href={`/badge-token-planner#bp=${baseline.index}`}
          className="flex items-center justify-center gap-2 rounded bg-primary-container px-6 py-3 text-label-md font-bold text-on-primary transition-colors duration-200 hover:bg-surface-tint"
        >
          Open in Planner <Icon name="arrow_forward" size={16} />
        </Link>
      </div>
    </div>
  );
}
