/**
 * Build-time injected environment (contract §5). All non-secret.
 * Inlined by next.config.ts `env` — safe to read in client components.
 */
export const SITE_VERSION = process.env.SITE_VERSION ?? "0.1.0-r8";
export const DATA_LAST_VERIFIED = process.env.DATA_LAST_VERIFIED ?? "2026-08-24";
/** Empty until R10.5 production approval (contract §2 rule 6). */
export const CANONICAL_HOST = process.env.CANONICAL_HOST ?? "";
