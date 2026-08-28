"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SourceTag } from "@/components/SourceTag";
import {
  badgeCatalog,
  blueprintList,
  DISCIPLINES,
  fetchBundle,
  type BadgeRequirementsBundle,
  type BlueprintsBundle,
} from "@/lib/data";
import {
  MAX_BADGE_SLOTS,
  POSITIONS,
  decode,
  type DecodeErrorKind,
  type PlannerStateV1,
} from "@/lib/share-codec";

/**
 * Shared build restore (contract §2 #6, §4.4, §6.2) — noindex, follow.
 *
 * HTTP semantics are ALWAYS 200 (contract §6.2 freeze): there is no server
 * record of share links, so validity can only be judged client-side. Decoding
 * runs 100% in the browser — zero server storage of share state.
 *
 * States: decode success (restored build + Open in Planner) / failure by
 * kind (ERR_FORMAT / ERR_VERSION / ERR_LENGTH / ERR_SEMANTIC) — every failure
 * state offers the `Start a New Plan` exit. No real-404 semantics.
 */

type Phase =
  | { kind: "ready"; state: PlannerStateV1 }
  | { kind: "invalid"; errorKind: DecodeErrorKind };

function heightLabel(inches: number): string {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

const FAILURE_COPY: Record<DecodeErrorKind, { title: string; body: string }> = {
  ERR_FORMAT: {
    title: "This share link can't be read",
    body: "This share link can't be read. It may be incomplete.",
  },
  ERR_SEMANTIC: {
    title: "This share link can't be read",
    body: "This share link can't be read. It may be incomplete.",
  },
  ERR_VERSION: {
    title: "This share link uses a newer format",
    body: "This link was created with a share format version this site can't read yet.",
  },
  ERR_LENGTH: {
    title: "This share link is too long",
    body: "This link exceeds the maximum share-link length, so it can't be a valid build link.",
  },
};

export function SharedBuildClient({ id }: { id: string }) {
  const [phase, setPhase] = useState<Phase | null>(null);
  const [badgeNames, setBadgeNames] = useState<Map<number, string>>(new Map());
  const [blueprintNames, setBlueprintNames] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    const res = decode(id);
    if (!res.ok) {
      setPhase({ kind: "invalid", errorKind: res.error.kind });
      return;
    }
    setPhase({ kind: "ready", state: res.state });
    // R12I-A: names resolve from the real production bundles.
    fetchBundle<BadgeRequirementsBundle>("/data/badge-requirements.v1.json")
      .then((b) => {
        const names = new Map<number, string>();
        for (const entry of badgeCatalog(b)) names.set(entry.index, entry.name);
        setBadgeNames(names);
      })
      .catch(() => setBadgeNames(new Map()));
    fetchBundle<BlueprintsBundle>("/data/blueprints.v1.json")
      .then((b) => {
        const names = new Map<number, string>();
        for (const bp of blueprintList(b)) names.set(bp.index, bp.name);
        setBlueprintNames(names);
      })
      .catch(() => setBlueprintNames(new Map()));
  }, [id]);

  // Hydration placeholder — the shell renders immediately (contract §6.1).
  if (phase === null) {
    return (
      <div className="animate-pulse rounded border border-border-low bg-surface-card p-6" aria-busy="true">
        <div className="mb-4 h-6 w-1/3 rounded bg-surface-container-high" />
        <div className="h-40 w-full rounded bg-surface-container-high" />
      </div>
    );
  }

  if (phase.kind === "invalid") {
    const copy = FAILURE_COPY[phase.errorKind];
    return (
      <div className="flex flex-col items-center gap-4 rounded border border-border-low bg-surface-card p-10 text-center">
        <Icon name="warning" size={28} className="text-error" />
        <h2 className="font-display text-headline-md text-on-surface">{copy.title}</h2>
        <p className="max-w-md text-body-md text-on-surface-variant">{copy.body}</p>
        <Link
          href="/badge-token-planner"
          className="rounded bg-primary-container px-6 py-3 text-label-md font-bold text-on-primary hover:bg-surface-tint"
        >
          Start a New Plan
        </Link>
      </div>
    );
  }

  const { state } = phase;
  const usedSlots = state.badges.reduce((sum, [, s]) => sum + s, 0);
  const orderedDisciplines = state.disciplinePriority
    .map((rank, d) => ({ rank, d }))
    .sort((a, b) => a.rank - b.rank)
    .map((x) => x.d);

  return (
    <div className="flex flex-col gap-6">
      <p role="status" className="flex w-fit items-center gap-2 rounded border border-secondary-container bg-surface-container-low px-3 py-2 text-body-sm text-secondary">
        <Icon name="check_circle" size={18} /> Build restored from link
      </p>

      <section className="flex flex-col gap-5 rounded border border-border-low bg-surface-card p-6">
        <div>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant">
            Shared Build
          </span>
          <h2 className="mt-1 font-display text-headline-md text-primary-container">
            {POSITIONS[state.position]} · {heightLabel(state.heightIn)}
            {state.blueprintRef !== undefined && state.blueprintRef >= 0
              ? ` · Blueprint ${blueprintNames.get(state.blueprintRef) ?? `#${state.blueprintRef + 1}`}`
              : ""}
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-body-sm text-text-muted">
            <span className="flex items-center gap-1">
              <Icon name="memory" size={14} />
              {usedSlots}/{MAX_BADGE_SLOTS} slots allocated
            </span>
            <SourceTag tier="official" />
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
              Discipline priorities
            </span>
            <ol className="flex flex-col gap-1">
              {orderedDisciplines.map((d, i) => (
                <li key={d} className="flex items-center gap-2 text-body-md">
                  <span className="w-8 rounded bg-surface-container-high px-1.5 py-0.5 text-center text-code-sm font-bold text-secondary">
                    P{i + 1}
                  </span>
                  <span className="text-on-surface">{DISCIPLINES[d]}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
              Allocated badges
            </span>
            {state.badges.length === 0 ? (
              <p className="text-body-sm text-text-muted">No badges allocated in this build.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {state.badges.map(([bi, slots]) => (
                  <li
                    key={bi}
                    className="flex items-center gap-2 rounded border border-border-low bg-surface-container-low px-2.5 py-1"
                  >
                    <span className="text-body-sm text-on-surface">
                      {badgeNames.get(bi) ?? `Badge #${bi}`}
                    </span>
                    <span className="rounded bg-primary-container px-1.5 py-0.5 text-code-sm font-bold text-on-primary">
                      {slots}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href={`/badge-token-planner#v=${id}`}
          className="flex items-center justify-center gap-2 rounded bg-primary-container px-6 py-3 text-label-md font-bold text-on-primary transition-colors duration-200 hover:bg-surface-tint"
        >
          <Icon name="open_in_new" size={16} /> Open in Planner
        </Link>
        <Link
          href="/badge-token-planner"
          className="flex items-center justify-center gap-2 rounded border border-outline px-6 py-3 text-label-md font-bold text-on-surface transition-colors duration-200 hover:bg-surface-card"
        >
          Start a New Plan
        </Link>
      </div>

      <p className="flex items-start gap-2 text-body-sm text-text-muted">
        <Icon name="info" size={16} className="mt-0.5 shrink-0" />
        This link encodes the full build state. Sharing pages are not indexed by search engines.
      </p>
    </div>
  );
}
