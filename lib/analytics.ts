/**
 * R12.5/R12.6 consent-gated analytics — My2KBuilder.
 *
 * Owner-approved contract (owner-review/r12.5-indexnow-analytics-approval.md,
 * owner-review/analytics-public-ids-v2.md):
 *  - No consent  => 0 analytics scripts injected, 0 analytics requests.
 *  - After consent => load ONLY the configured providers, exactly once.
 *  - Plausible uses the Owner 2026-08-27 standard snippet verbatim:
 *      <script defer data-domain="my2kbuilder.com"
 *              src="https://plausible.shipsolo.io/js/script.js"></script>
 *    The earlier R12.5 rule ("managed pa-*.js must not be rewritten to
 *    /js/script.js") was explicitly voided by the Owner's 2026-08-27
 *    instruction that replaced it with this standard snippet.
 *  - Injection note: for dynamically-inserted scripts `defer` has no effect
 *    and `async` is the default behavior; the snippet semantics are preserved
 *    (non-blocking load + data-domain attribute), and the script is loaded
 *    verbatim from the owner-provided URL.
 *
 * Provider IDs are public install identifiers (non-secret). They are injected
 * at build time via next.config.ts `env` + committed `.env.production`,
 * following the same pattern as CANONICAL_HOST. An empty value disables that
 * provider entirely (nothing is injected for it).
 *
 * This module is client-only in practice: every function that touches
 * window/document/localStorage guards on `typeof window`, so accidental
 * import from a server component cannot crash SSR and — more importantly —
 * the server render NEVER emits any analytics markup or script tags.
 */

export const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID ?? "";
export const CLARITY_PROJECT_ID = process.env.CLARITY_PROJECT_ID ?? "";
export const PLAUSIBLE_SCRIPT_URL = process.env.PLAUSIBLE_SCRIPT_URL ?? "";
export const PLAUSIBLE_DATA_DOMAIN = process.env.PLAUSIBLE_DATA_DOMAIN ?? "";

export type ConsentState = "granted" | "denied" | null;

/** localStorage key holding the visitor's analytics consent choice. */
export const CONSENT_STORAGE_KEY = "m2k_analytics_consent_v1";
/** window event: re-open the consent banner (footer "Cookie preferences"). */
export const CONSENT_REOPEN_EVENT = "m2k:reopen-consent";
/** window event fired after the consent state changes. detail: ConsentState */
export const CONSENT_CHANGED_EVENT = "m2k:consent-changed";

function hasWindow(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/** Read the stored consent choice. Returns null when undecided or on SSR. */
export function readConsent(): ConsentState {
  if (!hasWindow()) return null;
  try {
    const v = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    // localStorage may be unavailable (private mode, disabled storage).
    return null;
  }
}

/** Persist the consent choice and notify listeners (banner, loader). */
export function writeConsent(value: Exclude<ConsentState, null>): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // If storage fails we still honor the choice for this page view below.
  }
  window.dispatchEvent(
    new CustomEvent<ConsentState>(CONSENT_CHANGED_EVENT, { detail: value }),
  );
}

/** True when at least one analytics provider is configured at build time. */
export function hasConfiguredProviders(): boolean {
  return Boolean(GA4_MEASUREMENT_ID || CLARITY_PROJECT_ID || PLAUSIBLE_SCRIPT_URL);
}

function injectExternalScriptOnce(
  id: string,
  src: string,
  dataset?: Record<string, string>,
): boolean {
  if (document.getElementById(id)) return false;
  const s = document.createElement("script");
  s.id = id;
  s.src = src;
  s.async = true;
  if (dataset) {
    for (const [key, value] of Object.entries(dataset)) {
      s.dataset[key] = value;
    }
  }
  document.head.appendChild(s);
  return true;
}

function injectInlineScriptOnce(id: string, code: string): boolean {
  if (document.getElementById(id)) return false;
  const s = document.createElement("script");
  s.id = id;
  s.text = code;
  document.head.appendChild(s);
  return true;
}

/**
 * Inject every configured provider's script exactly once.
 * Never call this before consent === "granted".
 * Returns the list of providers that were (newly or previously) loaded.
 */
export function loadConfiguredAnalytics(): string[] {
  if (!hasWindow()) return [];
  const loaded: string[] = [];

  if (PLAUSIBLE_SCRIPT_URL) {
    // Owner 2026-08-27 standard Plausible snippet:
    //   <script defer data-domain="my2kbuilder.com"
    //           src="https://plausible.shipsolo.io/js/script.js"></script>
    // Loaded verbatim with the data-domain attribute. (Dynamic insertion:
    // defer is a no-op, async is the default — semantics preserved.)
    injectExternalScriptOnce(
      "m2k-analytics-plausible",
      PLAUSIBLE_SCRIPT_URL,
      PLAUSIBLE_DATA_DOMAIN ? { domain: PLAUSIBLE_DATA_DOMAIN } : undefined,
    );
    loaded.push("plausible");
  }

  if (GA4_MEASUREMENT_ID) {
    // Standard gtag bootstrap, injected dynamically so SSR HTML stays clean.
    injectInlineScriptOnce(
      "m2k-analytics-ga4-init",
      [
        "window.dataLayer = window.dataLayer || [];",
        "function gtag(){dataLayer.push(arguments);}",
        "gtag('js', new Date());",
        `gtag('config', '${GA4_MEASUREMENT_ID}');`,
      ].join("\n"),
    );
    injectExternalScriptOnce(
      "m2k-analytics-ga4",
      `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`,
    );
    loaded.push("ga4");
  }

  if (CLARITY_PROJECT_ID) {
    // Standard Clarity bootstrap, injected dynamically so SSR HTML stays clean.
    injectInlineScriptOnce(
      "m2k-analytics-clarity-init",
      [
        "(function(c,l,a,r,i,t,y){",
        "c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};",
        "t=l.createElement(r);t.async=1;",
        `t.src="https://www.clarity.ms/tag/"+i;`,
        "y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);",
        `})(window,document,"clarity","script","${CLARITY_PROJECT_ID}");`,
      ].join("\n"),
    );
    loaded.push("clarity");
  }

  return loaded;
}
