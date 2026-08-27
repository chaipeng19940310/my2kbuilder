import type { NextConfig } from "next";
import { edgeHeaders, edgeRedirects } from "./edge/next.config.edge";

// R8 frontend implementation — My2KBuilder MVP.
// Route hard rules (contract §2): no-trailing-slash canonical (edge redirects),
// relative canonicals until R10.5 (CANONICAL_HOST stays empty), no API routes,
// no bindings. Edge layer source of truth: backend/edge/ (see backend handoff).
const nextConfig: NextConfig = {
  redirects: edgeRedirects,
  headers: edgeHeaders,
  env: {
    // Build-time injected, all non-secret (contract §5).
    SITE_VERSION: process.env.SITE_VERSION ?? "0.1.0-r8",
    DATA_LAST_VERIFIED: process.env.DATA_LAST_VERIFIED ?? "2026-08-24",
    // MUST stay empty until R10.5 production approval (contract §2 rule 6).
    CANONICAL_HOST: process.env.CANONICAL_HOST ?? "",
    // R12.5/R12.6 consent-gated analytics — public install identifiers (non-secret,
    // committed via .env.production). Empty disables the provider.
    GA4_MEASUREMENT_ID: process.env.GA4_MEASUREMENT_ID ?? "",
    CLARITY_PROJECT_ID: process.env.CLARITY_PROJECT_ID ?? "",
    PLAUSIBLE_SCRIPT_URL: process.env.PLAUSIBLE_SCRIPT_URL ?? "",
    PLAUSIBLE_DATA_DOMAIN: process.env.PLAUSIBLE_DATA_DOMAIN ?? "",
  },
};

export default nextConfig;
