"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { FixtureBanner, SourceTag } from "@/components/SourceTag";
import {
  DISCIPLINES,
  badgeCatalog,
  fetchBundle,
  type CostMatrixBundle,
} from "@/lib/data";
import {
  MAX_BADGE_SLOTS,
  POSITIONS,
  decode,
  type PlannerStateV1,
} from "@/lib/share-codec";

/**
 * Build Card (contract §2 #5, §4.4, §6.2 state set) — noindex, follow.
 *
 * The ONLY share entry point. The planner pushes here with the encoded state
 * in the URL hash (#v=...); this page turns it into a /b/[id] link and a
 * text/CSS build card. Encoding/decoding is 100% client-side; nothing is
 * stored server-side (contract §4.4 zero-storage clause).
 *
 * States: no planner state (guidance) / generated (link + card) /
 * copy success toast "Link copied." / copy-failure fallback (manual copy).
 */

type Phase =
  | { kind: "empty" } // no #v hash — guidance state
  | { kind: "invalid"; message: string } // hash present but undecodable
  | { kind: "ready"; id: string; state: PlannerStateV1 };

function heightLabel(inches: number): string {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

export function BuildCardClient() {
  const [phase, setPhase] = useState<Phase>({ kind: "empty" });
  const [shareUrl, setShareUrl] = useState<string>("");
  const [badgeNames, setBadgeNames] = useState<Map<number, string>>(new Map());
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const encoded = new URLSearchParams(hash).get("v");
    if (!encoded) return;
    const res = decode(encoded);
    if (!res.ok) {
      setPhase({ kind: "invalid", message: res.error.message });
      return;
    }
    setPhase({ kind: "ready", id: encoded, state: res.state });
    setShareUrl(`${window.location.origin}/b/${encoded}`);
    // Badge names come from the same-origin catalog bundle (fixture labels apply).
    fetchBundle<CostMatrixBundle>("/data/badge-cost-matrix.v0.json")
      .then((b) => {
        const names = new Map<number, string>();
        for (const entry of badgeCatalog(b)) names.set(entry.index, entry.name);
        setBadgeNames(names);
      })
      .catch(() => setBadgeNames(new Map()));
  }, []);

  const copyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setCopyFailed(false);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      // Copy-failure fallback (contract §6.2): show the link for manual copy.
      setCopyFailed(true);
    }
  }, [shareUrl]);

  /* ---------- guidance state: no planner state in the URL ---------- */
  if (phase.kind === "empty") {
    return (
      <div className="flex flex-col items-center gap-4 rounded border border-dashed border-border-low p-10 text-center">
        <Icon name="ios_share" size={24} className="text-on-surface-variant" />
        <p className="max-w-md text-body-md text-on-surface-variant">
          Build cards are generated from a finished plan. Start in the Badge Token Planner,
          complete your 20-slot allocation, then generate a share link.
        </p>
        <Link
          href="/badge-token-planner"
          className="rounded bg-primary-container px-6 py-3 text-label-md font-bold text-on-primary hover:bg-surface-tint"
        >
          Open Badge Token Planner
        </Link>
      </div>
    );
  }

  /* ---------- undecodable state ---------- */
  if (phase.kind === "invalid") {
    return (
      <div className="flex flex-col items-center gap-4 rounded border border-border-low bg-surface-card p-10 text-center">
        <Icon name="warning" size={24} className="text-error" />
        <p className="max-w-md text-body-md text-on-surface-variant">
          This planner state can&apos;t be read. It may be incomplete.
        </p>
        <Link
          href="/badge-token-planner"
          className="rounded bg-primary-container px-6 py-3 text-label-md font-bold text-on-primary hover:bg-surface-tint"
        >
          Start a New Plan
        </Link>
      </div>
    );
  }

  const { state, id } = phase;
  const usedSlots = state.badges.reduce((sum, [, s]) => sum + s, 0);
  const orderedDisciplines = state.disciplinePriority
    .map((rank, d) => ({ rank, d }))
    .sort((a, b) => a.rank - b.rank)
    .map((x) => x.d);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Build card — text/CSS only, no official assets (copy §3.5) */}
      <section className="flex flex-col gap-5 rounded border border-border-low bg-surface-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-label-md uppercase tracking-widest text-on-surface-variant">
              NBA 2K27 MyPLAYER Plan
            </span>
            <h2 className="mt-1 font-display text-headline-md text-primary-container">
              {POSITIONS[state.position]} · {heightLabel(state.heightIn)}
            </h2>
            <p className="mt-1 text-body-sm text-text-muted">
              {usedSlots}/{MAX_BADGE_SLOTS} slots allocated
              {state.blueprintRef !== undefined && state.blueprintRef >= 0
                ? ` · Started from blueprint #${state.blueprintRef + 1} (fixture template)`
                : ""}
            </p>
          </div>
          <img src="/assets/logo-mark.svg" alt="" className="h-10 w-10 object-contain" />
        </div>

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
            <p className="text-body-sm text-text-muted">No badges allocated.</p>
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
          <div className="mt-3">
            <SourceTag tier="unverified" />
          </div>
        </div>

        <p className="mt-auto border-t border-border-low pt-3 text-body-sm text-text-muted">
          Generated by My2KBuilder — independent, fan-made, not affiliated with 2K.
        </p>
      </section>

      {/* Share panel */}
      <section className="flex flex-col gap-5">
        <FixtureBanner />
        <div className="flex flex-col gap-4 rounded border border-border-low bg-surface-card p-6">
          <h2 className="font-display text-headline-sm text-on-surface">Share Link</h2>
          <p className="text-body-sm text-on-surface-variant">
            Links encode the build state — no account or storage needed.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              readOnly
              value={shareUrl}
              aria-label="Share link"
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 truncate rounded border border-border-low bg-surface-container-low px-3 py-2 text-code-sm text-on-surface focus:border-primary-container focus:outline-none"
            />
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center justify-center gap-2 rounded bg-primary-container px-5 py-2.5 text-label-md font-bold text-on-primary hover:bg-surface-tint"
            >
              <Icon name="content_copy" size={16} />
              Copy Link
            </button>
          </div>
          {copied ? (
            <p role="status" className="flex items-center gap-1.5 text-body-sm text-secondary">
              <Icon name="check_circle" size={16} /> Link copied.
            </p>
          ) : null}
          {copyFailed ? (
            <p role="alert" className="text-body-sm text-error">
              Copy failed — select the link above and copy it manually.
            </p>
          ) : null}
          <div className="flex flex-col gap-3 border-t border-border-low pt-4 sm:flex-row">
            <Link
              href={`/badge-token-planner#v=${id}`}
              className="flex items-center justify-center gap-2 rounded border border-outline px-6 py-3 text-label-md font-bold text-on-surface hover:bg-surface-card"
            >
              <Icon name="open_in_new" size={16} /> Edit in Planner
            </Link>
            <Link
              href={`/b/${id}`}
              className="flex items-center justify-center gap-2 text-label-md text-primary-container hover:underline sm:px-2"
            >
              Preview the shared page <Icon name="arrow_forward" size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
