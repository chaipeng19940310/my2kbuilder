"use client";

import { CONSENT_REOPEN_EVENT } from "@/lib/analytics";

/**
 * Re-opens the analytics consent banner so visitors can change or withdraw
 * their choice at any time (linked from the site footer and /privacy copy).
 */
export function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(CONSENT_REOPEN_EVENT))}
    >
      Cookie preferences
    </button>
  );
}
