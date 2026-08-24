import iconPaths from "@/lib/icon-paths.json";

/**
 * Inline SVG icons (Material Symbols Outlined path data, vendored at build
 * time into lib/icon-paths.json). R7B condition C-02: no runtime icon-font
 * requests — zero third-party requests in the build output.
 */
const paths = iconPaths as Record<string, string>;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  fill = false,
  size = 24,
  className,
}: {
  name: string;
  fill?: boolean;
  size?: number;
  className?: string;
}) {
  const key = fill && paths[`${name}__fill`] ? `${name}__fill` : name;
  const d = paths[key];
  if (!d) return null;
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      fill="currentColor"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
