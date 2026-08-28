/**
 * R12I discipline icons (design pack t_65009bdd, handoff §2): six original
 * thin-stroke glyphs served as local static assets under /assets/r12i/icons/.
 * Server-safe (plain <img>, no client JS, no third-party requests).
 */
const DISCIPLINE_ICON_FILE: Record<string, string> = {
  Finishing: "icon-finishing.svg",
  Shooting: "icon-shooting.svg",
  Playmaking: "icon-playmaking.svg",
  Defense: "icon-defense.svg",
  Rebounding: "icon-rebounding.svg",
  Physicals: "icon-physicals.svg",
};

export function DisciplineIcon({
  discipline,
  size = 24,
}: {
  discipline: string;
  size?: number;
}) {
  const file = DISCIPLINE_ICON_FILE[discipline];
  if (!file) return null;
  return (
    <span className="discipline-icon" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- local static SVG asset */}
      <img src={`/assets/r12i/icons/${file}`} alt="" width={size} height={size} loading="lazy" />
    </span>
  );
}
