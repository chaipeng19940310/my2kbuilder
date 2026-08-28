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

/**
 * Source-annotation banner (R12I-A): replaces the old placeholder banner now
 * that the tool pages run on the real production bundles derived from the
 * public reference layer. States what each data class is and its tier — never
 * a self-deprecating disclaimer. Token cost values remain unpublished by 2K,
 * so the mandated pending label is shown verbatim.
 */
export function DataSourceBanner({ scope }: { scope: "badges" | "blueprints" }) {
  return (
    <div className="flex items-start gap-2 rounded border border-secondary-container bg-surface-container-low p-3">
      <Icon name="info" size={18} className="mt-0.5 shrink-0 text-secondary" />
      {scope === "badges" ? (
        <p className="text-body-sm text-on-surface-variant">
          Badge names and categories come from 2K&apos;s published roster. Unlock requirements are a
          community reference cross-checked across two public tables. Token costs pending — official
          values not published.{" "}
          <span className="text-text-muted">See Methodology for source tiers.</span>
        </p>
      ) : (
        <p className="text-body-sm text-on-surface-variant">
          The 40-template count, the three-player blend mechanism, and Bulldozer&apos;s blend are
          described on 2K&apos;s builder pages. Every other blueprint name, blend, and profile field
          is single-source community data, labeled Unverified per item.{" "}
          <span className="text-text-muted">See Methodology for source tiers.</span>
        </p>
      )}
    </div>
  );
}
