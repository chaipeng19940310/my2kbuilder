"use client";

import { useState } from "react";

/**
 * R12I YouTube click-to-load facade (design handoff §5 contract):
 * 1. Initial HTML ships only a local thumbnail SVG + play button — no
 *    youtube.com / youtube-nocookie.com / ytimg.com request before click.
 * 2. On click the facade is replaced by a youtube-nocookie iframe.
 * 3. The unofficial-tool disclaimer stays near the module (rendered by the
 *    parent section).
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
      className="group relative block aspect-video w-full overflow-hidden rounded border border-border-low bg-surface-container-lowest text-left transition-colors hover:border-primary-container"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local static SVG facade thumbnail */}
      <img
        src={thumbnail}
        alt={`${title} video preview`}
        width={1280}
        height={720}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-primary-container bg-surface-container-lowest/80 text-primary-container transition-colors group-hover:bg-primary-container group-hover:text-on-primary">
          <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
      <span className="absolute bottom-2 left-2 rounded bg-surface-container-lowest/80 px-2 py-1 text-body-sm text-on-surface-variant">
        Loads YouTube only after you click.
      </span>
    </button>
  );
}
