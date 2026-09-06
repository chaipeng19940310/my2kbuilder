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
      className="planner-wizard flex flex-col gap-2"
      data-step={hydrated ? step : undefined}
      aria-busy={!hydrated}
    >
      <div className="mobile-compact-source-banner">
        <DataSourceBanner scope="badges" />
      </div>
      {blueprintNote ? (
        <div className="flex items-center gap-2 rounded-lg border border-secondary-container bg-surface-container-low p-3">
          <Icon name="info" size={18} className="text-secondary" />
          <p className="text-body-sm text-on-surface-variant">{blueprintNote}</p>
        </div>
      ) : null}

      <div className="border-y border-border-low py-2">
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

      <section className="wizard-step py-2 md:py-14" data-wizard-step="1" aria-labelledby="wizard-position-title">
        <div className="mb-2 text-center md:mb-10">
          <h2 id="wizard-position-title" className="font-display text-headline-sm font-bold text-on-surface md:text-display-lg">Choose a position</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant md:mt-3 md:text-body-lg">Pick a position and height to plan your badge loadout.</p>
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:px-8 md:mx-0 md:grid md:grid-cols-5 md:gap-3 md:overflow-visible md:px-0 md:pb-0">
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
                className={`relative flex h-[72px] w-[120px] min-w-[120px] shrink-0 snap-start flex-row items-center justify-start gap-2 rounded-xl bg-surface-card px-3 text-left transition-all active:scale-[0.98] disabled:cursor-wait md:h-[104px] md:w-auto md:min-w-0 md:max-w-none md:flex-row md:justify-start md:gap-2 md:p-3 md:text-left ${selected ? "border-2 border-primary-container bg-surface-container-low shadow-[0_0_15px_rgba(255,176,58,0.15)]" : "border border-border-low hover:border-on-surface-variant hover:bg-surface-container-low"}`}
              >
                {selected ? <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-container text-on-primary"><Icon name="check" size={14} fill /></span> : null}
                {/* eslint-disable-next-line @next/next/no-img-element -- local position artwork */}
                <img
                  src={`/assets/r12i/positions/pos-${abbr.toLowerCase()}.svg`}
                  alt=""
                  width={64}
                  height={64}
                  className="h-10 w-10 shrink-0 md:h-16 md:w-16"
                />
                <span className="min-w-0">
                  <span className={`block font-display text-body-lg font-black leading-none md:text-headline-sm ${selected ? "text-on-surface" : "text-on-surface-variant"}`}>{abbr}</span>
                  <span className={`mt-1 block truncate text-[9px] font-bold uppercase leading-tight tracking-wide md:pr-4 md:text-[10px] md:tracking-wider ${selected ? "text-primary-container" : "text-on-surface-variant"}`}>{details.name}</span>
                  <span className="sr-only md:mt-1 md:block md:truncate md:text-[10px] md:leading-tight md:text-text-muted">{details.note}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="mx-auto mt-3 max-w-4xl md:mt-8">
          <div className="mb-2 text-center md:mb-6">
            <h2 id="wizard-height-title" className="font-display text-headline-sm font-bold text-on-surface md:text-display-lg">Height</h2>
            <p className="mt-1 text-body-sm text-on-surface-variant md:mt-3 md:text-body-lg">Some badges carry height limits — a badge row tells you when your current height locks it.</p>
          </div>
          <div className="rounded-xl border border-border-low bg-surface-card p-3 md:p-8">
            <div className="mb-3 flex items-center justify-center gap-3 md:mb-6 md:gap-6">
              <button type="button" aria-label="Decrease height" disabled={!hydrated || heightIn <= HEIGHT_IN_MIN} onClick={() => setHeightIn((height) => Math.max(HEIGHT_IN_MIN, height - 1))} className="flex h-10 w-10 items-center justify-center rounded-full border border-border-low bg-surface-container-high text-on-surface-variant hover:text-on-surface disabled:opacity-40 md:h-12 md:w-12"><Icon name="remove" size={22} /></button>
              <output className="min-w-28 text-center font-display text-headline-md font-black text-primary-container md:min-w-40 md:text-display-lg">{heightLabel(heightIn)}</output>
              <button type="button" aria-label="Increase height" disabled={!hydrated || heightIn >= HEIGHT_IN_MAX} onClick={() => setHeightIn((height) => Math.min(HEIGHT_IN_MAX, height + 1))} className="flex h-10 w-10 items-center justify-center rounded-full border border-border-low bg-surface-container-high text-on-surface-variant hover:text-on-surface disabled:opacity-40 md:h-12 md:w-12"><Icon name="add" size={22} /></button>
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

      <section className="wizard-step py-2 md:py-4" data-wizard-step="2" aria-labelledby="wizard-priority-title">
        <div className="mb-3 text-center md:mb-4">
          <h2 id="wizard-priority-title" className="font-display text-headline-sm font-bold text-on-surface md:text-headline-md">Priorities</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">Tier allocation — select disciplines in priority order</p>
        </div>
        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
          {DISCIPLINES.map((name, discipline) => {
            const rank = priorityOrder.indexOf(discipline);
            return (
              <button key={name} type="button" disabled={!hydrated} aria-pressed={rank >= 0} onClick={() => togglePriority(discipline)} className={`flex min-h-12 items-center gap-3 rounded-full px-3 py-2 text-left transition-all disabled:cursor-wait ${rank >= 0 ? "bg-secondary/15 text-secondary ring-1 ring-inset ring-secondary/60" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"}`}>
                <DisciplineIcon discipline={name} size={24} />
                <span className="min-w-0 flex-1 font-display text-body-lg font-bold">{name}</span>
                {rank >= 0 ? (
                  <span className="min-w-9 rounded bg-secondary px-2 py-1 text-center text-code-sm font-bold text-on-secondary">P{rank + 1}</span>
                ) : (
                  <span aria-hidden="true" className="h-6 w-9 rounded bg-surface-container-high" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="wizard-step py-2 md:py-4" data-wizard-step="3" aria-labelledby="wizard-loadout-title">
        <h2 id="wizard-loadout-title" className="mb-3 font-display text-headline-sm font-bold text-on-surface md:mb-4 md:text-headline-md">Badge Loadout</h2>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
          <aside className="lg:col-span-4">
            <div className="rounded-xl border border-border-low bg-surface-card p-3 md:p-4 lg:sticky lg:top-24">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 font-display text-body-lg font-bold text-on-surface"><Icon name="data_usage" size={18} className="text-primary-container" />Token Budget</h3>
                <div className="flex items-baseline gap-2"><span className={`font-display text-headline-md font-black ${overBudget ? "text-error" : "text-primary-container"}`}>{usedSlots}<span className="text-body-sm text-text-muted">/{MAX_BADGE_SLOTS}</span></span><span className="text-[10px] uppercase tracking-wider text-on-surface-variant">SLOTS USED</span></div>
              </div>
              <div className="mt-2 flex gap-1" aria-label={`${usedSlots} of ${MAX_BADGE_SLOTS} slots used`}>
                {Array.from({ length: MAX_BADGE_SLOTS }, (_, index) => <span key={index} className={`h-2 min-w-0 flex-1 rounded-sm ${index < Math.min(usedSlots, MAX_BADGE_SLOTS) ? (overBudget ? "bg-error" : "bg-primary-container") : "bg-surface-container-high"}`} />)}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p role={overBudget ? "alert" : "status"} className={`text-[11px] leading-tight ${overBudget ? "text-error" : complete ? "text-secondary" : "text-on-surface-variant"}`}>{statusLine}</p>
              <p className="text-[11px] leading-tight text-on-surface-variant">
                Estimated token spend: <strong className="text-on-surface">{estimatedTokens}</strong> tokens
                <span className="text-text-muted"> (reference build)</span>
              </p>
              </div>
              <p className="mt-2 flex min-w-0 items-center gap-1 truncate text-[10px] leading-tight text-text-muted"><Icon name="info" size={13} className="shrink-0" /><span className="truncate">Token costs shown are single-source community reference-build values — Unverified. Actual costs vary with height, position and build size; confirm in the in-game Builder.</span></p>
            </div>
          </aside>
          <div className="overflow-hidden rounded-xl border border-border-low bg-surface-card lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-low bg-surface-container-low px-3 py-2"><span className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant">Available Badges</span><div className="flex gap-1">{TIER_NAMES.map((tier, index) => <span key={tier} className={`tier-chip ${TIER_CLASSES[index]}`}>{tier}</span>)}</div></div>
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

      <section className="wizard-step py-2 md:py-4" data-wizard-step="4" aria-labelledby="wizard-summary-title">
        <div className="mx-auto max-w-4xl">
          <div className="mb-3 text-center"><h2 id="wizard-summary-title" className="font-display text-headline-sm font-bold text-on-surface md:text-headline-md">Summary</h2><p className="mt-1 text-body-sm text-on-surface-variant">A finished plan turns into a single link.</p></div>
          <div className="rounded-xl border border-border-low bg-surface-card p-3 md:p-4">
            <div className="flex flex-wrap gap-1.5"><span className="rounded bg-surface-container-high px-2 py-1 text-body-sm text-on-surface">Position: {position >= 0 ? POSITIONS[position] : "—"}</span><span className="rounded bg-surface-container-high px-2 py-1 text-body-sm text-on-surface">Height: {heightLabel(heightIn)}</span>{priorityOrder.map((discipline, rank) => <span key={discipline} className="rounded bg-secondary/15 px-2 py-1 text-body-sm text-secondary">P{rank + 1} {DISCIPLINES[discipline]}</span>)}</div>
            <div className="my-3 flex items-center justify-between border-y border-border-low py-2"><span className="font-display text-body-lg font-bold text-on-surface">Badge Loadout</span><span className={`font-display text-headline-md font-black ${complete ? "text-secondary" : "text-primary-container"}`}>{usedSlots}/{MAX_BADGE_SLOTS}</span></div>
            <div className="max-h-24 overflow-y-auto"><div className="flex flex-wrap gap-1.5">{allocations.length > 0 ? allocations.map(([index, slots]) => { const badge = catalog.find((item) => item.index === index); const tierIndex = Math.min(slots, 4) - 1; return badge ? <span key={index} className={`tier-chip ${TIER_CLASSES[tierIndex]}`}>{badge.name} · {TIER_NAMES[tierIndex]}</span> : null; }) : <span className="text-body-md text-text-muted">Complete all 20 slots to generate a link</span>}</div></div>
            <button type="button" disabled={!hydrated || !complete} onClick={generateShareLink} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-5 py-3 text-label-md font-bold text-on-primary hover:bg-surface-tint disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-text-muted"><Icon name="share" size={18} />Generate Share Link</button>
            {!complete ? <p className="mt-1 text-center text-[11px] text-text-muted">Complete all 20 slots to generate a link</p> : null}
            <button type="button" disabled={!overBudget} onClick={() => setStep(3)} className={`mx-auto mt-1 text-label-md text-primary-container hover:underline ${overBudget ? "block" : "invisible block"}`}>Adjust Allocation</button>
          </div>
        </div>
      </section>

      <nav aria-label="Planner steps" className="sticky bottom-0 z-30 -mx-4 mt-2 flex items-center justify-between border-t border-border-low bg-page-bg/95 px-4 py-2 backdrop-blur md:-mx-8 md:px-8">
        <button type="button" aria-label="Start over" disabled={!hydrated} onClick={startOver} className="flex items-center gap-2 text-label-md font-bold uppercase text-on-surface-variant hover:text-on-surface disabled:opacity-50"><Icon name="restart_alt" size={18} /><span className="hidden sm:inline">Start over</span></button>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Back" disabled={!hydrated || step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))} className="flex items-center gap-2 rounded-lg px-4 py-2 text-label-md font-bold uppercase text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-35"><Icon name="arrow_back" size={18} /><span className="hidden sm:inline">Back</span></button>
          {step < 4 ? <button type="button" disabled={nextDisabled} onClick={() => setStep((current) => Math.min(4, current + 1))} className="flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3 text-label-md font-bold uppercase text-on-primary hover:bg-surface-tint disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-text-muted"><span>Next</span><Icon name="arrow_forward" size={18} /></button> : null}
        </div>
      </nav>
    </div>
  );
}
