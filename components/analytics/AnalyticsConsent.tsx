"use client";

import { useEffect, useState } from "react";
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

  if (!mounted || !bannerOpen) return null;

  const choose = (value: Exclude<ConsentState, null>) => {
    writeConsent(value);
    setBannerOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Analytics consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border-low bg-surface-container-lowest"
    >
      <div className="mx-auto flex w-full max-w-site flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:gap-gutter md:px-margin-desktop">
        <div className="flex max-w-2xl flex-col gap-2">
          <p className="font-display text-headline-sm text-on-surface">
            Analytics consent
          </p>
          <p className="text-body-sm text-on-surface-variant">
            With your permission, we use Plausible, Google Analytics 4, and
            Microsoft Clarity to understand aggregate site usage. No analytics
            scripts load and nothing is sent before you choose. Declining keeps
            analytics fully off. You can change your choice anytime via
            &quot;Cookie preferences&quot; in the footer. See our{" "}
            <Link
              href="/privacy"
              className="underline decoration-secondary hover:text-on-surface"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="rounded border border-outline px-6 py-3 text-label-md font-bold text-on-surface transition-colors duration-200 hover:bg-surface-card"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="rounded bg-primary-container px-6 py-3 text-label-md font-bold text-on-primary transition-colors duration-200 hover:bg-surface-tint"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
