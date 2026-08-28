import type { ReactNode } from "react";

/**
 * R12K-J shared content panel (Owner 2026-08-28 confirmed spec): one unified
 * dark frame wrapping the entire main content of /build-card, /disclaimer,
 * /privacy, and /terms.
 *
 * Uses the site's existing card/frame spec verbatim — bg-surface-card
 * (#0e1628), 1px border-border-low (#1E293B), rounded — the same color,
 * border, and radius as the homepage tool cards and Build Guides frames.
 * Padding p-6/md:p-8 matches those same frames and adapts at 390px.
 *
 * Visual container only: no page copy is altered by this wrapper.
 */
export function ContentPanel({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-8 rounded border border-border-low bg-surface-card p-6 md:p-8">
      {children}
    </div>
  );
}
