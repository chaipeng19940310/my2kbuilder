import type { ReactNode } from "react";

export const METAL_TIERS = ["bronze", "silver", "gold", "hof", "legend"] as const;
export type MetalTier = (typeof METAL_TIERS)[number];
const LABELS: Record<MetalTier, string> = {
  bronze: "Bronze", silver: "Silver", gold: "Gold", hof: "Hall of Fame", legend: "Legend",
};

/** Approved original SVGs; separate images keep gradient IDs isolated. */
export function TierBadge({ tier, size = 20, children, className = "" }: {
  tier: MetalTier; size?: 20 | 32 | 40; children?: ReactNode; className?: string;
}) {
  return (
    <span className={`tier-badge ${className}`} data-tier={tier}>
      {/* eslint-disable-next-line @next/next/no-img-element -- immutable local SVG, no optimization required */}
      <img src={`/assets/tier-icons/tier-${tier}.svg`} width={size} height={size} alt="" aria-hidden="true" className="tier-badge-icon" />
      <span>{children ?? LABELS[tier]}</span>
    </span>
  );
}

export function TierStrip() {
  return <div className="metal-tier-strip" aria-label="Badge tiers; Legend requires Synergy">
    {METAL_TIERS.map((tier) => <TierBadge key={tier} tier={tier} size={40} />)}
  </div>;
}
