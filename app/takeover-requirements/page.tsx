import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/JsonLdScript";
import { DisciplineIcon } from "@/components/DisciplineIcon";
import { VideoFacade } from "@/components/VideoFacade";
import { canonicalFor } from "@/lib/canonical";
import { socialMeta } from "@/lib/social";
import { breadcrumbSchema, faqPageSchema, webPageSchema } from "@/lib/schema";
import { takeoverCatalog, TAKEOVER_DISCIPLINES, type TakeoverEntry } from "@/lib/takeovers";
import { DataSourceBanner } from "@/components/SourceTag";
import { GuideToc } from "@/components/GuideToc";

// SEO freeze (copy/r12j-wave2-copy-v1.md §1; title per R12J-F rule: freeze
// text, no brand suffix, <=60 chars — this one is 43; meta trimmed to <=155
// per the same rule). Banned words
// official/best/guaranteed never used.
const PAGE_TITLE = "NBA 2K27 Takeover Requirements & Thresholds";
const PAGE_DESCRIPTION =
  "All 24 NBA 2K27 Takeover abilities with attribute unlock requirements and per-row source labels: cross-checked roster, Unverified thresholds, pending gaps.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalFor("/takeover-requirements") },
  ...socialMeta({
    path: "/takeover-requirements",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  }),
};

// FAQ freeze (copy §1, 4 entries, verbatim — backticks from the markdown copy
// are formatting only; rendered text and FAQPage schema carry the same words).
const FAQS = [
  {
    question: "How do Takeovers work in NBA 2K27?",
    answer:
      "There are 24 Takeover abilities. Five are active from the start; the other 19 unlock when your attributes meet their requirements. More than one Takeover can be active at the same time once unlocked.",
  },
  {
    question: "What does each requirement row mean?",
    answer:
      "It shows the attribute rating your build needs to unlock that Takeover. Meet the number and the ability becomes available; fall short and it stays locked, no matter how the rest of the build looks.",
  },
  {
    question: "What do the source labels mean?",
    answer:
      "cross_checked means two independent references agree — that covers the ability roster itself. Unverified means the threshold comes from a single public reference and hasn't been confirmed against a second source. pending means no value is published, so we show none.",
  },
  {
    question: "Will these requirements change after launch?",
    answer:
      "They can. Patches are a normal part of the 2K cycle. Every table on this site carries a last-verified date, and a full re-check is scheduled after launch — treat any threshold as a planning reference and confirm in-game before spending points.",
  },
] as const;

// R12J-B: 24 Takeover abilities from the public-reference layer (build-time
// import, fully server-rendered). Per-item source labels come from each
// record's source_type; the roster itself is cross-checked (see legend).
const TAKEOVERS = takeoverCatalog();

/** Per-row source chip (copy §5: roster cross_checked, per-ability thresholds Unverified). */
function SourceChip({ sourceType }: { sourceType: string }) {
  if (sourceType === "official_confirmed") {
    return (
      <span className="rounded border border-secondary-container px-1.5 py-0.5 text-code-sm text-secondary">
        2K-published
      </span>
    );
  }
  if (sourceType === "cross_checked") {
    return (
      <span className="rounded border border-secondary-container px-1.5 py-0.5 text-code-sm text-secondary">
        cross_checked
      </span>
    );
  }
  return (
    <span className="rounded border border-outline-variant px-1.5 py-0.5 text-code-sm text-error">
      Unverified
    </span>
  );
}

/** Requirement cell: threshold lines joined by AND/OR logic, or always-on text. */
function RequirementCell({ entry }: { entry: TakeoverEntry }) {
  if (entry.unlock.kind === "always_available") {
    return (
      <span className="text-body-sm text-on-surface-variant">
        Active from the start{entry.kind === "universal" ? " — assignable to any slot" : ""}
      </span>
    );
  }
  const { logic, conditions } = entry.unlock;
  return (
    <div className="r18-c">
      {conditions.map((c, i) => (
        <span key={c.attribute} className="r18-v">
          {i > 0 && logic !== "single" ? (
            <span className="r18-op">
              {logic}
            </span>
          ) : null}
          {c.attribute} {c.minRating}
        </span>
      ))}
    </div>
  );
}

function TakeoverRow({ entry }: { entry: TakeoverEntry }) {
  return (
    <tr className="r18-r">
      <th
        scope="row"
        className="r18-n"
      >
        <span className="r18-i">
          {entry.name}
          {entry.kind === "default" ? (
            <span className="r18-new">
              DEFAULT
            </span>
          ) : null}
        </span>
      </th>
      <td className="r18-p">
        <span className="r18-cat">
          <DisciplineIcon discipline={entry.discipline} size={20} />
          {entry.discipline}
        </span>
      </td>
      <td className="r18-t">
        <RequirementCell entry={entry} />
      </td>
      <td className="r18-t">
        <SourceChip sourceType={entry.sourceType} />
      </td>
    </tr>
  );
}

export default function TakeoverRequirementsPage() {
  return (
    <main className="r18-page r18-guide-page relative z-10 mx-auto w-full max-w-site flex-grow gap-12 px-4 py-12 md:px-margin-desktop">
      <JsonLdScript
        schema={[
          webPageSchema({
            name: PAGE_TITLE,
            description: PAGE_DESCRIPTION,
            url: canonicalFor("/takeover-requirements"),
          }),
          faqPageSchema([...FAQS]),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Takeover Requirements", path: "/takeover-requirements" },
          ]),
        ]}
      />
      <GuideToc items={[
        { href: "#source-labels", label: "Source Labels" },
        { href: "#requirements", label: "Requirements" },
        { href: "#takeover-video", label: "Builder Video" },
        { href: "#takeover-faq", label: "FAQ" },
      ]} />

      <header className="flex max-w-3xl flex-col gap-4">
        <h1 className="font-display text-display-lg text-primary-container">
          NBA 2K27 Takeover Requirements
        </h1>
        {/* Page intro (copy §1, verbatim). */}
        <p className="text-body-lg text-on-surface-variant">
          {
            "NBA 2K27 ships 24 Takeover abilities. Five are active from the start; the rest unlock when your attributes meet their requirements. This page lists every Takeover with its unlock threshold and a source label on each row — the 24-ability roster is cross-checked against 2K-published counts, while per-ability thresholds come from a single public reference and are marked Unverified."
          }
        </p>
      </header>

      {/* Owner-authorized 2K key art at page head (R12J wave-2 multimedia
          principle; local static asset, no third-party request). */}
      <figure className="flex max-w-4xl flex-col gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- local static asset */}
        <img
          src="/assets/keyart/nba2k27-takeover-system-1920x1080.jpg"
          alt="NBA 2K27 Takeover system key art"
          width={1920}
          height={1080}
          loading="lazy"
          className="h-auto w-full rounded border border-border-low"
        />
        <figcaption className="text-body-sm text-text-muted">
          {
            "NBA 2K27 key art (2K). My2KBuilder is an independent, fan-made planning tool and is not affiliated with 2K."
          }
        </figcaption>
      </figure>

      {/* Source label legend (copy §1, verbatim bullets) — placed above the
          table per the copy design placement. */}
      <section id="source-labels" className="flex max-w-3xl flex-col gap-4 rounded border border-border-low bg-surface-card p-6">
        <h2 className="font-display text-headline-sm text-on-surface">Source Labels</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-body-md text-on-surface-variant">
          <li>
            cross_checked — the 24-ability roster and the 5 default Takeovers, matched between a
            public reference table and 2K-published counts.
          </li>
          <li>
            Unverified — single-source per-ability thresholds. Shown with this label, never as
            settled fact.
          </li>
          <li>pending — not published anywhere we can check; no value is shown.</li>
        </ul>
      </section>

      <section id="requirements" className="flex flex-col gap-4">
        {/* Above-table helper (copy §1, verbatim; planner link = bidirectional
            interlink with /badge-token-planner). */}
        <p className="max-w-3xl text-body-md text-on-surface-variant">
          {
            "A Takeover requirement tells you the attribute rating your build needs before that ability can unlock. Check your target Takeovers first, then plan attributes around them in the "
          }
          <Link href="/badge-token-planner" className="text-primary-container hover:underline">
            planner
          </Link>
          {"."}
        </p>

        <DataSourceBanner scope="takeovers" />

        {/* 24 Takeover rows, SSR'd in full, grouped by discipline. Horizontal
            scroll on small viewports; the Takeover column stays sticky so rows
            remain readable at 390px. */}
        {TAKEOVER_DISCIPLINES.map((d) => {
          const rows = TAKEOVERS.filter((t) => t.discipline === d);
          if (rows.length === 0) return null;
          return (
            <section key={d} className="flex flex-col gap-3">
              <h2 className="flex items-center gap-3 font-display text-headline-md text-on-surface">
                <DisciplineIcon discipline={d} size={28} />
                {d}
                <span className="text-body-sm font-normal text-text-muted">
                  {rows.length} {rows.length === 1 ? "Takeover" : "Takeovers"}
                </span>
              </h2>
              <div className="overflow-x-auto rounded border border-border-low bg-surface-card">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border-low">
                      <th
                        scope="col"
                        className="sticky left-0 bg-surface-card p-3 text-label-md text-text-muted"
                      >
                        Takeover
                      </th>
                      <th scope="col" className="p-3 text-label-md text-text-muted">
                        Discipline
                      </th>
                      <th scope="col" className="p-3 text-label-md text-text-muted">
                        Requirement
                      </th>
                      <th scope="col" className="p-3 text-label-md text-text-muted">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((t) => (
                      <TakeoverRow key={t.slug} entry={t} />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}

        {/* Below-table note (copy §1, verbatim; Last verified follows the table). */}
        <p className="max-w-3xl text-body-sm text-text-muted">
          {
            "Last verified: 2026-08-28. Thresholds can move with game updates — confirm in-game before you commit attribute points."
          }
        </p>
      </section>

      {/* 2K Builder Courtside Report — click-to-load YouTube facade per design
          handoff §5: initial HTML is a self-hosted real cover image + play button only;
          the youtube-nocookie iframe is created after a click. */}
      <section id="takeover-video" className="flex max-w-3xl flex-col gap-4">
        <h2 className="font-display text-headline-md text-on-surface">
          Watch the 2K Builder Courtside Report
        </h2>
        <VideoFacade
          videoId="MSZre4MBSBA"
          title="2K Builder Courtside Report"
          thumbnail="/assets/video/courtside-report.jpg"
        />
        <p className="text-body-sm text-text-muted">
          {
            "Video hosted on YouTube by 2K. My2KBuilder is an independent, fan-made planning tool and is not affiliated with 2K."
          }
        </p>
      </section>

      {/* FAQ at page bottom (copy §1 design placement; 4 freeze entries). */}
      <section id="takeover-faq" className="flex max-w-3xl flex-col gap-4">
        <h2 className="font-display text-headline-md text-on-surface">Takeover Requirements FAQ</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((f) => (
            <details
              key={f.question}
              className="group rounded border border-border-low bg-surface-card p-4"
            >
              <summary className="cursor-pointer list-none text-label-md text-on-surface group-open:text-primary-container">
                {f.question}
              </summary>
              <p className="mt-2 text-body-md text-on-surface-variant">{f.answer}</p>
            </details>
          ))}
        </div>
        <p className="text-body-md text-on-surface-variant">
          {"Planning a build around these thresholds? Check the "}
          <Link href="/badge-requirements" className="text-primary-container hover:underline">
            Badge Requirements
          </Link>
          {" table for the badge tiers your attributes also unlock, then open the "}
          <Link href="/badge-token-planner" className="text-primary-container hover:underline">
            Badge Token Planner
          </Link>
          {" to map the full build."}
        </p>
      </section>
    </main>
  );
}
