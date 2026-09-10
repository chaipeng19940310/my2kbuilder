import Image from "next/image";

/** Shared compact position artwork; the SVG already contains the abbreviation. */
export function PositionIcon({ position }: { position: string }) {
  return position ? (
    <Image className="position-icon" src={`/assets/r12i/positions/pos-${position.toLowerCase()}.svg`} alt={position} width={36} height={36} unoptimized />
  ) : <span className="position-all">All</span>;
}
