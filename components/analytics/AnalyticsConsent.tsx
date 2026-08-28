"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CONSENT_CHANGED_EVENT,
  CONSENT_REOPEN_EVENT,
  loadConfiguredAnalytics,
  readConsent,
  writeConsent,
  type ConsentState,
} from "@/lib/analytics";

/**
 * R12.5 consent-gated analytics controller.
 *
 * Mounted once in the root layout. Guarantees:
 *  - SSR HTML contains zero analytics markup/scripts (renders null until
 *    mounted client-side, and even then only renders the consent banner UI).
 *  - No analytics script or request exists before the visitor accepts.
 *  - On "granted" (stored or fresh), configured providers load exactly once
 *    via loadConfiguredAnalytics() (element-id idempotency guards).
 *  - "Decline" persists "denied" and nothing ever loads.
 *  - Footer "Cookie preferences" re-opens this banner via CONSENT_REOPEN_EVENT
 *    so consent can be changed/withdrawn at any time.
 */
export function AnalyticsConsent() {
  const [mounted, setMounted] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const initial = readConsent();
    if (initial === "granted") {
      loadConfiguredAnalytics();
    } else if (initial === null) {
      setBannerOpen(true);
    }
    // "denied": keep everything off, no banner.

    const onReopen = () => setBannerOpen(true);
    const onChanged = (e: Event) => {
      const value = (e as CustomEvent<ConsentState>).detail;
      if (value === "granted") loadConfiguredAnalytics();
      // Switching to "denied" cannot unload already-injected scripts for the
      // current page view; the choice is persisted and honored on next load.
    };
    window.addEventListener(CONSENT_REOPEN_EVENT, onReopen);
    window.addEventListener(CONSENT_CHANGED_EVENT, onChanged);
    return () => {
      window.removeEventListener(CONSENT_REOPEN_EVENT, onReopen);
      window.removeEventListener(CONSENT_CHANGED_EVENT, onChanged);
    };
  }, []);

  // R16.1: while the banner is open, keep page content reachable above it:
  // scroll-padding-bottom steers scrollIntoView/scroll-to-bottom so targets
  // never land under the banner, and body padding-bottom extends the scroll
  // range by the banner height so users can always scroll content clear.
  useEffect(() => {
    if (!mounted || !bannerOpen) return;
    const el = bannerRef.current;
    if (!el) return;
    const apply = () => {
      const h = `${el.offsetHeight}px`;
      document.documentElement.style.scrollPaddingBottom = h;
      document.body.style.paddingBottom = h;
    };
    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      document.documentElement.style.scrollPaddingBottom = "";
      document.body.style.paddingBottom = "";
    };
  }, [mounted, bannerOpen]);

  if (!mounted || !bannerOpen) return null;

  const choose = (value: Exclude<ConsentState, null>) => {
    writeConsent(value);
    setBannerOpen(false);
  };

  return (
    // R16.1: pointer-events-none on the banner chrome so its inert regions
    // never swallow real taps aimed at page content behind/below it; only the
    // actual interactive elements (buttons, privacy link) receive events.
    // R12K-C (Owner 2026-08-28): banner shrinks to ~0.8x of its previous
    // scale (padding / font-size / max-width all scaled together, a 20%
    // reduction — not halved) and is centered horizontally as a floating
    // panel on both desktop and mobile. Consent logic unchanged.
    <div
      ref={bannerRef}
      role="dialog"
      aria-modal="false"
      aria-label="Analytics consent"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 md:px-6 md:pb-4"
    >
      <div className="flex w-full max-w-[1152px] flex-col gap-1.5 rounded-lg border border-border-low bg-surface-container-lowest px-3 py-2.5 shadow-lg shadow-black/40 md:flex-row md:items-center md:justify-between md:gap-3 md:px-6 md:py-4">
        <div className="flex max-w-[538px] flex-col gap-1 md:gap-1.5">
          <p className="hidden font-display text-base font-semibold text-on-surface md:block">
            Analytics consent
          </p>
          <p className="text-[10px] leading-[1.4] text-on-surface-variant">
            With your permission, we use Plausible, Google Analytics 4, and
            Microsoft Clarity to understand aggregate site usage. No analytics
            scripts load and nothing is sent before you choose. Declining keeps
            analytics fully off. You can change your choice anytime via
            &quot;Cookie preferences&quot; in the footer. See our{" "}
            <Link
              href="/privacy"
              className="pointer-events-auto underline decoration-secondary hover:text-on-surface"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-row flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="pointer-events-auto rounded border border-outline px-3 py-1.5 text-[10px] font-bold tracking-[0.05em] text-on-surface transition-colors duration-200 hover:bg-surface-card md:px-5 md:py-2.5"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="pointer-events-auto rounded bg-primary-container px-3 py-1.5 text-[10px] font-bold tracking-[0.05em] text-on-primary transition-colors duration-200 hover:bg-surface-tint md:px-5 md:py-2.5"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
