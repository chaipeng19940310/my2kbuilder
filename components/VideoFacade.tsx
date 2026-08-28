"use client";

import { useState } from "react";

/**
 * R12K-C YouTube click-to-load facade (design handoff §5 contract, Owner
 * 2026-08-28 revision):
 * 1. Initial HTML ships only a self-hosted real video cover (YouTube official
 *    thumbnail downloaded to /assets/video/) + ONE play affordance — no
 *    youtube.com / youtube-nocookie.com / ytimg.com request before click.
 * 2. The whole card is a single <button>; the play glyph is a plain icon,
 *    not a nested button-styled element. Hover and focus-visible share one
 *    state; keyboard reachable.
 * 3. Single frame: one border on the card itself (the cover image carries no
 *    drawn frame of its own).
 * 4. On click the facade is replaced by a youtube-nocookie iframe.
 */
export function VideoFacade({
  videoId,
  title,
  thumbnail,
}: {
  videoId: string;
  title: string;
  thumbnail: string;
}) {
  const [activated, setActivated] = useState(false);

  if (activated) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded border border-border-low bg-surface-container-lowest">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      aria-label={`Play ${title}`}
      className="group relative block aspect-video w-full overflow-hidden rounded border border-border-low bg-surface-container-lowest text-left transition-colors hover:border-primary-container focus-visible:border-primary-container focus-visible:outline-none"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- self-hosted static cover image */}
      <img
        src={thumbnail}
        alt={`${title} video preview`}
        width={1280}
        height={720}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      {/* Single play affordance: a plain glyph, no nested button chrome. */}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <svg
          aria-hidden="true"
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-primary-container drop-shadow-[0_2px_6px_rgba(1,15,31,0.8)] transition-transform duration-200 group-hover:scale-110 group-focus-visible:scale-110"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span className="absolute bottom-2 left-2 rounded bg-surface-container-lowest/80 px-2 py-1 text-body-sm text-on-surface-variant">
        Loads YouTube only after you click.
      </span>
    </button>
  );
}
