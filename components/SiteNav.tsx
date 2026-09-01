"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";

const PRIMARY_LINKS = [
  { href: "/badge-token-planner", label: "Badge Planner" },
  { href: "/badge-requirements", label: "Badge Requirements" },
  { href: "/signature-blueprints", label: "Blueprints" },
] as const;

const GUIDE_LINKS = [
  { href: "/launch-day-build-guide", label: "Launch Day Build Guide" },
  { href: "/takeover-requirements", label: "Takeover Requirements" },
  { href: "/cap-breakers", label: "Cap Breakers" },
  { href: "/2k26-to-2k27-build-pitfalls", label: "2K26 Build Pitfalls" },
  { href: "/signature-blueprints/by-position", label: "Blueprints by Position" },
] as const;

const SECONDARY_LINKS = [{ href: "/methodology", label: "Methodology" }] as const;

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [guidesOpen, setGuidesOpen] = useState(false);
  const guidesActive = GUIDE_LINKS.some((l) => isActivePath(pathname, l.href));

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
          {PRIMARY_LINKS.map((l) => {
            const active = isActivePath(pathname, l.href);
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
          <div className="relative">
            <button
              type="button"
              aria-expanded={guidesOpen}
              aria-haspopup="true"
              onClick={() => setGuidesOpen((v) => !v)}
              className={`flex items-center gap-1 text-label-md tracking-wide transition-colors duration-200 ${
                guidesActive
                  ? "text-primary-container"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Guides
              <Icon
                name="expand_more"
                size={18}
                className={`transition-transform duration-200 ${guidesOpen ? "rotate-180" : ""}`}
              />
            </button>
            {guidesOpen ? (
              <div className="absolute right-0 top-full mt-2 w-64 rounded border border-border-low bg-surface-card p-2 shadow-lg">
                <div className="flex flex-col gap-1">
                  {GUIDE_LINKS.map((l) => {
                    const active = isActivePath(pathname, l.href);
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setGuidesOpen(false)}
                        className={`rounded px-3 py-2 text-label-md transition-colors duration-200 ${
                          active
                            ? "bg-surface-container-high text-primary-container"
                            : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                        }`}
                      >
                        {l.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
          {SECONDARY_LINKS.map((l) => {
            const active = isActivePath(pathname, l.href);
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
            {PRIMARY_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-label-md text-on-surface-variant hover:text-on-surface"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 rounded border border-border-low bg-surface-card p-3">
              <span className="text-code-sm uppercase tracking-wider text-text-muted">Guides</span>
              {GUIDE_LINKS.map((l) => (
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
            {SECONDARY_LINKS.map((l) => (
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
