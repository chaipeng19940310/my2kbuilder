"use client";

import { useEffect, useState } from "react";
import { POSITIONS } from "@/lib/share-codec";
import { PositionIcon } from "./PositionIcon";

export function PositionGroupNav() {
  const [active, setActive] = useState("");
  useEffect(() => {
    const sync = () => setActive(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  return <nav aria-label="Jump to position group" className="position-options">
    {POSITIONS.map((position) => {
      const href = `#position-${position.toLowerCase()}`;
      return <a key={position} href={href} aria-label={position} className="position-option"
        aria-current={active === href ? "location" : undefined} onClick={() => setActive(href)}>
        <PositionIcon position={position} />
      </a>;
    })}
  </nav>;
}
