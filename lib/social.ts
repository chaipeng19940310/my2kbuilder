import type { Metadata } from "next";
import { canonicalFor } from "@/lib/canonical";

/**
 * R15: per-page social share meta (Open Graph + Twitter Card).
 *
 * Reuses each page's existing frozen title/description verbatim — the
 * AITDK-verified title (58 chars) / description (155 chars) copy must not
 * change.
 *
 * IMPORTANT: Next.js replaces (not deep-merges) the page-level openGraph /
 * twitter objects over the layout-level ones, so every page object must
 * carry the full field set. This helper is the single source of truth for
 * those fields; the root layout spreads the same helper for site defaults.
 * The 1200x630 og:image (+alt) comes from app/opengraph-image.tsx and is
 * merged in by the file convention at every segment.
 *
 * `path` is the canonical route path (e.g. "/privacy"). Omit it for dynamic
 * routes (e.g. /b/[id]) so no misleading og:url is emitted — crawlers then
 * use the actual shared URL.
 */
export const SOCIAL_SITE_NAME = "My2KBuilder";
export const SOCIAL_LOCALE = "en_US";
export const SOCIAL_TWITTER_CARD = "summary_large_image";

export function socialMeta(options: {
  title: string;
  description: string;
  path?: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const { title, description, path } = options;
  return {
    openGraph: {
      type: "website",
      siteName: SOCIAL_SITE_NAME,
      locale: SOCIAL_LOCALE,
      title,
      description,
      ...(path ? { url: canonicalFor(path) } : {}),
    },
    twitter: {
      card: SOCIAL_TWITTER_CARD,
      title,
      description,
    },
  };
}
