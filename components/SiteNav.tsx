"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";

const NAV_LINKS = [
  { href: "/badge-token-planner", label: "Badge Planner" },
  { href: "/signature-blueprints", label: "Blueprints" },
  { href: "/methodology", label: "Methodology" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border-low bg-surface/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-site items-center justify-between px-4 py-4 md:px-margin-desktop">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3" aria-label="My2KBuilder home">
            {/* Approved local asset (design/assets/logo-mark.svg) — C-01: no remote images */}
            <img src="/assets/logo-mark.svg" alt="My2KBuilder logo" className="h-8 w-8 object-contain" />
            <span className="font-display text-headline-md font-bold tracking-tighter text-primary">
              My2KBuilder
            </span>
          </Link>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`text-label-md tracking-wide transition-colors duration-200 ${
                  active ? "text-primary-container" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/badge-token-planner"
            className="rounded bg-primary-container px-4 py-2 text-label-md font-bold text-on-primary transition-colors duration-200 hover:bg-surface-tint"
          >
            Create Build
          </Link>
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded p-2 text-on-surface-variant hover:text-on-surface md:hidden"
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-border-low bg-surface px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-label-md text-on-surface-variant hover:text-on-surface"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
