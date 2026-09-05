"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { DataSourceBanner } from "@/components/SourceTag";
import { DisciplineIcon } from "@/components/DisciplineIcon";
import {
  DISCIPLINES,
  badgeCatalog,
  badgeLockedAtHeight,
  requirementSummary,
  tokenCostAtTier,
  tokenCostMap,
  type BadgeRequirementsBundle,
  type TokenCostBundle,
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

const DEFAULT_HEIGHT = 74;
const STEP_LABELS = ["Choose a position", "Priorities", "Badge Loadout", "Summary"] as const;
const POSITION_DETAILS = [
  { name: "Point Guard", note: "Ball handler, playmaking first" },
  { name: "Shooting Guard", note: "Primary scorer, perimeter threat" },
  { name: "Small Forward", note: "Versatile wing, two-way player" },
  { name: "Power Forward", note: "Post presence, strong rebounder" },
  { name: "Center", note: "Paint protector, interior anchor" },
] as const;
const TIER_NAMES = ["BRZ", "SLV", "GLD", "HOF"] as const;
const TIER_CLASSES = ["tier-bronze", "tier-silver", "tier-gold", "tier-hof"] as const;

function heightLabel(inches: number): string {
  return `${Math.floor(inches / 12)}'${inches % 12}\"`;
}

export function PlannerClient({ bundle, costs }: { bundle: BadgeRequirementsBundle; costs: TokenCostBundle }) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(1);
  const [position, setPosition] = useState(-1);
  const [heightIn, setHeightIn] = useState(DEFAULT_HEIGHT);
  const [priorityOrder, setPriorityOrder] = useState<number[]>([]);
  const [allocations, setAllocations] = useState<Array<[number, number]>>([]);
  const [blueprintRef, setBlueprintRef] = useState(-1);
  const [blueprintNote, setBlueprintNote] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
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
        setPriorityOrder(
          res.state.disciplinePriority
            .map((rank, d) => ({ rank, d }))
            .sort((a, b) => a.rank - b.rank)
            .map(({ d }) => d),
        );
        setAllocations(res.state.badges);
        setBlueprintRef(res.state.blueprintRef ?? -1);
        setStep(3);
      }
    } else if (bp !== null) {
      const idx = Number.parseInt(bp, 10);
      if (Number.isInteger(idx) && idx >= 0 && idx <= 39) {
        setBlueprintRef(idx);
        setBlueprintNote("Starting from a Signature Blueprint template.");
        setStep(3);
      }
    }
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const catalog = useMemo(() => badgeCatalog(bundle), [bundle]);
  const costBySlug = useMemo(() => tokenCostMap(costs), [costs]);
  const usedSlots = allocations.reduce((sum, [, slots]) => sum + slots, 0);
  // Reference-build token estimate for the current allocation (single-source,
  // unverified — displayed with the reference label, never as official).
  const estimatedTokens = allocations.reduce((sum, [index, slots]) => {
    const badge = catalog.find((item) => item.index === index);
    const cost = badge ? costBySlug.get(badge.slug) : undefined;
    return cost ? sum + tokenCostAtTier(cost, slots) : sum;
  }, 0);
  const overBudget = usedSlots > MAX_BADGE_SLOTS;
  const complete = position >= 0 && usedSlots === MAX_BADGE_SLOTS && !overBudget;
  const lockedBadges = catalog.filter((badge) => badgeLockedAtHeight(badge, heightIn));

  function assignSlot(badgeIndex: number) {
    setAllocations((previous) => {
      const existing = previous.find(([index]) => index === badgeIndex);
      if (existing) {
        return previous.map(([index, slots]): [number, number] =>
          index === badgeIndex ? [index, Math.min(slots + 1, MAX_BADGE_SLOTS)] : [index, slots],
        );
      }
      return [...previous, [badgeIndex, 1]];
    });
  }

  function removeSlot(badgeIndex: number) {
    setAllocations((previous) =>
      previous
        .map(([index, slots]): [number, number] =>
          index === badgeIndex ? [index, slots - 1] : [index, slots],
        )
        .filter(([, slots]) => slots > 0),
    );
  }

  function togglePriority(discipline: number) {
    setPriorityOrder((previous) =>
      previous.includes(discipline)
        ? previous.filter((item) => item !== discipline)
        : [...previous, discipline],
    );
  }

  function startOver() {
    setPosition(-1);
    setHeightIn(DEFAULT_HEIGHT);
    setPriorityOrder([]);
    setAllocations([]);
    setBlueprintRef(-1);
    setBlueprintNote(null);
    setStep(1);
  }

  function disciplinePriorityPermutation(): number[] {
    const remaining = Array.from({ length: DISCIPLINE_COUNT }, (_, index) => index).filter(
      (discipline) => !priorityOrder.includes(discipline),
    );
    const ranks = new Array<number>(DISCIPLINE_COUNT);
    [...priorityOrder, ...remaining].forEach((discipline, rank) => {
      ranks[discipline] = rank;
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
    const result = encode(state);
    if (result.ok) router.push(`/build-card#v=${result.id}`);
  }

  const statusLine = position < 0
    ? "Pick a position and height to plan your badge loadout."
    : overBudget
      ? "Over budget. Remove tokens or lower a badge tier to finish your plan."
      : complete
        ? "Plan complete. Generate a share link, or keep editing."
        : `${usedSlots} / ${MAX_BADGE_SLOTS} slots used`;
  const nextDisabled = !hydrated || (step === 1 && position < 0) || (step === 3 && !complete);

  return (
    <div
      className="planner-wizard flex flex-col gap-6"
      data-step={hydrated ? step : undefined}
      aria-busy={!hydrated}
    >
      <DataSourceBanner scope="badges" />
      {blueprintNote ? (
        <div className="flex items-center gap-2 rounded-lg border border-secondary-container bg-surface-container-low p-3">
          <Icon name="info" size={18} className="text-secondary" />
          <p className="text-body-sm text-on-surface-variant">{blueprintNote}</p>
        </div>
      ) : null}

      <div className="border-y border-border-low py-4">
        <div className="mb-2 flex items-center justify-between text-label-md">
          <span className="font-bold uppercase tracking-wider text-on-surface-variant">Step {step} of 4</span>
          <span className="font-bold text-primary-container">{STEP_LABELS[step - 1]}</span>
        </div>
        <div className="flex gap-2" aria-hidden="true">
          {STEP_LABELS.map((label, index) => (
            <span
              key={label}
              className={`h-1.5 flex-1 rounded-full ${index < step ? "bg-primary-container" : "bg-border-low"}`}
            />
          ))}
        </div>
      </div>

      <section className="wizard-step py-8 md:py-14" data-wizard-step="1" aria-labelledby="wizard-position-title">
        <div className="mb-10 text-center">
          <h2 id="wizard-position-title" className="font-display text-display-lg font-bold text-on-surface">Choose a position</h2>
          <p className="mt-3 text-body-lg text-on-surface-variant">Pick a position and height to plan your badge loadout.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {POSITIONS.map((abbr, index) => {
            const selected = position === index;
            const details = POSITION_DETAILS[index];
            return (
              <button
                key={abbr}
                type="button"
                disabled={!hydrated}
                aria-pressed={selected}
                onClick={() => setPosition(index)}
                className={`relative flex min-h-60 flex-col items-center justify-center rounded-xl bg-surface-card p-5 text-center transition-all disabled:cursor-wait ${selected ? "border-2 border-primary-container shadow-[0_0_15px_rgba(255,176,58,0.15)]" : "border border-border-low hover:border-on-surface-variant hover:bg-surface-container-low"}`}
              >
                {selected ? <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-container text-on-primary"><Icon name="check" size={16} fill /></span> : null}
                {/* eslint-disable-next-line @next/next/no-img-element -- local position artwork */}
                <img
                  src={`/assets/r12i/positions/pos-${abbr.toLowerCase()}.svg`}
                  alt=""
                  width={112}
                  height={112}
                  className="mb-4 h-28 w-28 shrink-0"
                />
                <span className={`block font-display text-headline-md font-black ${selected ? "text-on-surface" : "text-on-surface-variant"}`}>{abbr}</span>
                <span className={`mt-1 block text-label-md font-bold uppercase tracking-widest ${selected ? "text-primary-container" : "text-on-surface-variant"}`}>{details.name}</span>
                <span className="mt-2 block text-body-sm text-text-muted">{details.note}</span>
              </button>
            );
          })}
        </div>
        <div className="mx-auto mt-8 max-w-4xl">
          <div className="mb-6 text-center">
            <h2 id="wizard-height-title" className="font-display text-display-lg font-bold text-on-surface">Height</h2>
            <p className="mt-3 text-body-lg text-on-surface-variant">Some badges carry height limits — a badge row tells you when your current height locks it.</p>
          </div>
          <div className="rounded-xl border border-border-low bg-surface-card p-6 md:p-8">
            <div className="mb-6 flex items-center justify-center gap-4 md:gap-6">
              <button type="button" aria-label="Decrease height" disabled={!hydrated || heightIn <= HEIGHT_IN_MIN} onClick={() => setHeightIn((height) => Math.max(HEIGHT_IN_MIN, height - 1))} className="flex h-12 w-12 items-center justify-center rounded-full border border-border-low bg-surface-container-high text-on-surface-variant hover:text-on-surface disabled:opacity-40"><Icon name="remove" size={22} /></button>
              <output className="min-w-40 text-center font-display text-display-lg font-black text-primary-container">{heightLabel(heightIn)}</output>
              <button type="button" aria-label="Increase height" disabled={!hydrated || heightIn >= HEIGHT_IN_MAX} onClick={() => setHeightIn((height) => Math.min(HEIGHT_IN_MAX, height + 1))} className="flex h-12 w-12 items-center justify-center rounded-full border border-border-low bg-surface-container-high text-on-surface-variant hover:text-on-surface disabled:opacity-40"><Icon name="add" size={22} /></button>
            </div>
            <input aria-label="Height in inches" type="range" min={HEIGHT_IN_MIN} max={HEIGHT_IN_MAX} value={heightIn} disabled={!hydrated} onChange={(event) => setHeightIn(Number(event.target.value))} className="h-2 w-full cursor-pointer accent-primary-container disabled:cursor-wait" />
            <div className="mt-2 flex justify-between text-body-sm text-text-muted"><span>{heightLabel(HEIGHT_IN_MIN)}</span><span>{heightLabel(HEIGHT_IN_MAX)}</span></div>
            <div className="mt-3 flex items-start gap-2 text-body-sm text-text-muted" aria-live="polite">
              <Icon name={lockedBadges.length > 0 ? "warning" : "info"} size={16} className={`mt-0.5 shrink-0 ${lockedBadges.length > 0 ? "text-error" : ""}`} />
              <div>
                <h3 className="font-bold text-on-surface-variant">Locked at {heightLabel(heightIn)}</h3>
            {lockedBadges.length > 0 ? (
              <ul className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
                {lockedBadges.map((badge) => <li key={badge.index} className="text-error">{badge.name}</li>)}
              </ul>
            ) : <p className="mt-1">No badges are locked at this height.</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="wizard-step py-8 md:py-14" data-wizard-step="2" aria-labelledby="wizard-priority-title">
        <div className="mb-10 text-center">
          <h2 id="wizard-priority-title" className="font-display text-display-lg font-bold text-on-surface">Priorities</h2>
          <p className="mt-3 text-body-lg text-on-surface-variant">Tier allocation — select disciplines in priority order</p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DISCIPLINES.map((name, discipline) => {
            const rank = priorityOrder.indexOf(discipline);
            return (
              <button key={name} type="button" disabled={!hydrated} aria-pressed={rank >= 0} onClick={() => togglePriority(discipline)} className={`relative flex min-h-44 flex-col items-center justify-center gap-4 rounded-xl border p-6 transition-all disabled:cursor-wait ${rank >= 0 ? "border-secondary bg-surface-container-low text-secondary" : "border-border-low bg-surface-card text-on-surface-variant hover:border-on-surface-variant"}`}>
                {rank >= 0 ? <span className="absolute right-3 top-3 rounded bg-secondary px-2 py-1 text-code-sm font-bold text-on-secondary">P{rank + 1}</span> : null}
                <DisciplineIcon discipline={name} size={44} />
                <span className="font-display text-headline-sm font-bold">{name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="wizard-step py-6" data-wizard-step="3" aria-labelledby="wizard-loadout-title">
        <h2 id="wizard-loadout-title" className="mb-8 font-display text-display-lg font-bold text-on-surface">Badge Loadout</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-4">
            <div className="rounded-xl border border-border-low bg-surface-card p-6 lg:sticky lg:top-24">
              <h3 className="flex items-center gap-2 font-display text-headline-sm font-bold text-on-surface"><Icon name="data_usage" size={22} className="text-primary-container" />Token Budget</h3>
              <div className="mt-6 flex items-end justify-between"><span className={`font-display text-display-lg font-black ${overBudget ? "text-error" : "text-primary-container"}`}>{usedSlots}<span className="text-headline-sm text-text-muted">/{MAX_BADGE_SLOTS}</span></span><span className="text-code-sm uppercase tracking-widest text-on-surface-variant">SLOTS USED</span></div>
              <div className="mt-3 flex gap-1" aria-label={`${usedSlots} of ${MAX_BADGE_SLOTS} slots used`}>
                {Array.from({ length: MAX_BADGE_SLOTS }, (_, index) => <span key={index} className={`h-6 min-w-0 flex-1 rounded-sm ${index < Math.min(usedSlots, MAX_BADGE_SLOTS) ? (overBudget ? "bg-error" : "bg-primary-container") : "bg-surface-container-high"}`} />)}
              </div>
              <p role={overBudget ? "alert" : "status"} className={`mt-4 text-body-sm ${overBudget ? "text-error" : complete ? "text-secondary" : "text-on-surface-variant"}`}>{statusLine}</p>
              <p className="mt-4 text-body-sm text-on-surface-variant">
                Estimated token spend: <strong className="text-on-surface">{estimatedTokens}</strong> tokens
                <span className="text-text-muted"> (reference build)</span>
              </p>
              <p className="mt-4 flex items-start gap-2 rounded-lg border border-border-low bg-surface-container-low p-3 text-body-sm text-text-muted"><Icon name="info" size={16} className="mt-0.5 shrink-0" />Token costs shown are single-source community reference-build values — Unverified. Actual costs vary with height, position and build size; confirm in the in-game Builder.</p>
            </div>
          </aside>
          <div className="overflow-hidden rounded-xl border border-border-low bg-surface-card lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-low bg-surface-container-low p-4"><span className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant">Available Badges</span><div className="flex gap-2">{TIER_NAMES.map((tier, index) => <span key={tier} className={`tier-chip ${TIER_CLASSES[index]}`}>{tier}</span>)}</div></div>
            {catalog.length === 0 ? <p className="p-8 text-center text-on-surface-variant">No badges in the data bundle.</p> : (
              <ul className="badge-list">
                {catalog.map((badge) => {
                  const assigned = allocations.find(([index]) => index === badge.index)?.[1] ?? 0;
                  const locked = badgeLockedAtHeight(badge, heightIn);
                  const req = requirementSummary(badge);
                  const cost = costBySlug.get(badge.slug);
                  const tierIndex = Math.min(assigned, 4) - 1;
                  return (
                    <li key={badge.index} className="badge-row" data-locked={locked} data-assigned={assigned > 0}>
                      <span className="badge-icon"><img src={`/assets/r12i/icons/icon-${badge.category.toLowerCase()}.svg`} alt="" width="20" height="20" loading="lazy" /></span>
                      <div className="badge-copy">
                        <div><span className="badge-name">{badge.name}</span>{badge.is_new_2k27 ? <span className="badge-new">NEW</span> : null}<span className="badge-category">{badge.category}</span></div>
                        <p className="badge-req">Unlock: {req.attributesText}{req.heightText ? ` · Height ${req.heightText}` : ""}</p>
                        {cost ? <p className="badge-req">Tokens B/S/G/H: {cost.bronze}/{cost.silver}/{cost.gold}/{cost.hof} <span className="text-text-muted">(reference build, unverified)</span></p> : null}
                        {locked ? <p className="badge-locked">Not unlockable at {heightLabel(heightIn)}.</p> : null}
                      </div>
                      <div className="badge-actions">
                        {assigned > 0 ? <span className={`tier-chip ${TIER_CLASSES[tierIndex]}`}>{TIER_NAMES[tierIndex]}</span> : <span className="badge-none">NONE</span>}
                        <div className="badge-stepper"><button type="button" aria-label={`Remove a slot from ${badge.name}`} disabled={!hydrated || assigned === 0 || locked} onClick={() => removeSlot(badge.index)}><Icon name="remove" size={16} /></button><span className="badge-count">{assigned}</span><button type="button" aria-label={`Assign a slot to ${badge.name}`} disabled={!hydrated || locked} onClick={() => assignSlot(badge.index)}><Icon name="add" size={16} /></button></div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="wizard-step py-8 md:py-14" data-wizard-step="4" aria-labelledby="wizard-summary-title">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center"><h2 id="wizard-summary-title" className="font-display text-display-lg font-bold text-on-surface">Summary</h2><p className="mt-3 text-body-lg text-on-surface-variant">A finished plan turns into a single link.</p></div>
          <div className="rounded-xl border border-border-low bg-surface-card p-6 md:p-8">
            <div className="flex flex-wrap gap-2"><span className="rounded bg-surface-container-high px-3 py-2 text-label-md text-on-surface">Position: {position >= 0 ? POSITIONS[position] : "—"}</span><span className="rounded bg-surface-container-high px-3 py-2 text-label-md text-on-surface">Height: {heightLabel(heightIn)}</span>{priorityOrder.map((discipline, rank) => <span key={discipline} className="rounded bg-secondary/15 px-3 py-2 text-label-md text-secondary">P{rank + 1} {DISCIPLINES[discipline]}</span>)}</div>
            <div className="my-8 flex items-end justify-between border-y border-border-low py-6"><span className="font-display text-headline-sm font-bold text-on-surface">Badge Loadout</span><span className={`font-display text-display-lg font-black ${complete ? "text-secondary" : "text-primary-container"}`}>{usedSlots}/{MAX_BADGE_SLOTS}</span></div>
            <div className="flex flex-wrap gap-2">{allocations.length > 0 ? allocations.map(([index, slots]) => { const badge = catalog.find((item) => item.index === index); const tierIndex = Math.min(slots, 4) - 1; return badge ? <span key={index} className={`tier-chip ${TIER_CLASSES[tierIndex]}`}>{badge.name} · {TIER_NAMES[tierIndex]}</span> : null; }) : <span className="text-body-md text-text-muted">Complete all 20 slots to generate a link</span>}</div>
            <button type="button" disabled={!hydrated || !complete} onClick={generateShareLink} className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-6 py-4 text-label-md font-bold text-on-primary hover:bg-surface-tint disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-text-muted"><Icon name="share" size={18} />Generate Share Link</button>
            {!complete ? <p className="mt-3 text-center text-body-sm text-text-muted">Complete all 20 slots to generate a link</p> : null}
            <button type="button" disabled={!overBudget} onClick={() => setStep(3)} className={`mx-auto mt-3 text-label-md text-primary-container hover:underline ${overBudget ? "block" : "invisible block"}`}>Adjust Allocation</button>
          </div>
        </div>
      </section>

      <nav aria-label="Planner steps" className="sticky bottom-0 z-30 -mx-4 mt-2 flex items-center justify-between border-t border-border-low bg-page-bg/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
        <button type="button" disabled={!hydrated} onClick={startOver} className="flex items-center gap-2 text-label-md font-bold uppercase text-on-surface-variant hover:text-on-surface disabled:opacity-50"><Icon name="restart_alt" size={18} /><span className="hidden sm:inline">Start over</span></button>
        <div className="flex items-center gap-3">
          <button type="button" disabled={!hydrated || step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))} className="flex items-center gap-2 rounded-lg px-4 py-2 text-label-md font-bold uppercase text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-35"><Icon name="arrow_back" size={18} /><span className="hidden sm:inline">Back</span></button>
          {step < 4 ? <button type="button" disabled={nextDisabled} onClick={() => setStep((current) => Math.min(4, current + 1))} className="flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3 text-label-md font-bold uppercase text-on-primary hover:bg-surface-tint disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-text-muted"><span>Next</span><Icon name="arrow_forward" size={18} /></button> : null}
        </div>
      </nav>
    </div>
  );
}
