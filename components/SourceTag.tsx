import { Icon } from "@/components/Icon";

/**
 * Source-tier labels shown next to key data points (contract §4.3, R11D P2-2).
 * Tiers of the current public version only: official / cross / unverified.
 * The former "hq" (HQ App Observed) variant is removed — no HQ App observed
 * data is published until manual collection + dual review + freeze v0.
 */
export function SourceTag({
  tier,
  verifiedDate,
}: {
  tier: "official" | "cross" | "unverified";
  verifiedDate?: string;
}) {
  if (tier === "official") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-secondary-container bg-surface-card px-2 py-0.5 text-code-sm text-secondary">
        <Icon name="check" size={14} />
        Source: Official{verifiedDate ? `, verified ${verifiedDate}` : ""}
      </span>
    );
  }
  if (tier === "cross") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-secondary-container bg-surface-card px-2 py-0.5 text-code-sm text-secondary">
        <Icon name="check" size={14} />
        Community reference — cross-checked
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded border border-outline-variant bg-surface-card px-2 py-0.5 text-code-sm text-error">
      <Icon name="warning" size={14} />
      Unverified — pending confirmation
    </span>
  );
}

/** Banner marking gated fixture data (contract §7: fixture must never read as fact). */
export function FixtureBanner() {
  return (
    <div className="flex items-start gap-2 rounded border border-outline-variant bg-surface-container-low p-3">
      <Icon name="warning" size={18} className="mt-0.5 shrink-0 text-error" />
      <p className="text-body-sm text-on-surface-variant">
        Fixture data — placeholder values pending HQ App collection, dual review, and freeze v0.
        Nothing here is a verified NBA 2K27 number.{" "}
        <span className="text-text-muted">See Methodology for source tiers.</span>
      </p>
    </div>
  );
}
