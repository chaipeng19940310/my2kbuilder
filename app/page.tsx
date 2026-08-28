import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { JsonLdScript } from "@/components/JsonLdScript";
import { SourceTag } from "@/components/SourceTag";
import { VideoFacade } from "@/components/VideoFacade";
import { canonicalFor } from "@/lib/canonical";
import { socialMeta } from "@/lib/social";
import { faqPageSchema, softwareApplicationSchema, websiteSchema } from "@/lib/schema";
import { mechanicsFact, type MechanicsBundle } from "@/lib/data";
import mechanics from "@/public/data/mechanics.v0.json";

// SEO freeze (seo §3): title/H1/meta for `/`.
export const metadata: Metadata = {
  title: "NBA 2K27 Builder — Badge Token Planner & Blueprint Compare",
  description:
    "Plan NBA 2K27 MyPLAYER builds in your browser: allocate Badge Tokens, compare 40 Signature Blueprints and share a build card. Free, unofficial, no sign-up.",
  alternates: { canonical: canonicalFor("/") },
  ...socialMeta({
    path: "/",
    title: "NBA 2K27 Builder — Badge Token Planner & Blueprint Compare",
    description:
      "Plan NBA 2K27 MyPLAYER builds in your browser: allocate Badge Tokens, compare 40 Signature Blueprints and share a build card. Free, unofficial, no sign-up.",
  }),
};

const bundle = mechanics as MechanicsBundle;

const TOOL_CARDS = [
  {
    icon: "calculate",
    title: "Badge Token Planner",
    body: "NBA 2K27 gives you 20 badge slots, and every badge costs tokens that shift with your height and position. Test your allocation here before you spend a single token in-game.",
    cta: "Start planning",
    href: "/badge-token-planner",
    image: "/assets/r12i/tool-cards/tool-card-badge-token-planner.svg",
  },
  {
    icon: "view_cozy",
    title: "Signature Blueprint Browser",
    body: "All 40 launch blueprints in one filterable list. Shortlist up to three and compare attributes and badges side by side.",
    cta: "Browse blueprints",
    href: "/signature-blueprints",
    image: "/assets/r12i/tool-cards/tool-card-signature-blueprints.svg",
  },
  {
    icon: "ios_share",
    title: "Share a Build Card",
    body: "Turn any plan into a link and a clean text build card. Paste it in Discord, Reddit, or a video description — no screenshots, no account.",
    cta: "Create a card",
    href: "/build-card",
    image: null,
  },
] as const;

// R12I wave-1 homepage FAQ (copy/r12i-wave1-copy-v1.md §2, frozen — 4 Q/A only).
const FAQS = [
  {
    question: "Is this the NBA 2K27 builder?",
    answer:
      "No. The game builder lives in the 2K HQ App and in-game. My2KBuilder is an independent web tool for planning Badge Token allocations and comparing blueprints before you commit in-game.",
  },
  {
    question: "Do I need to download anything or create an account?",
    answer:
      "No. Everything runs in your browser, and there are no accounts. Your plan saves into its share link — copy the link to keep it.",
  },
  {
    question: "Where does the tool data come from?",
    answer:
      "Mechanics and badge or blueprint names come from 2K-published material. Badge requirement cells are cross-checked against two public reference tables, unconfirmed fields are labeled, and token costs stay pending until collection is complete.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes — the MVP is free to use, with no sign-up and no paywall. Open the planner, build your allocation, and share it as a link.",
  },
] as const;

// R12I official-video embeds (youtube-nocookie click-to-load facade, design
// handoff §5). No third-party request is made before the visitor clicks play.
const VIDEOS = [
  {
    videoId: "MSZre4MBSBA",
    title: "2K Builder Courtside Report",
    thumbnail: "/assets/r12i/video/video-facade-courtside-report.svg",
  },
  {
    videoId: "vQ2jNNbh1TU",
    title: "NBA 2K27 Gameplay Trailer",
    thumbnail: "/assets/r12i/video/video-facade-official-trailer.svg",
  },
] as const;

export default function HomePage() {
  const whatsNew = [
    {
      title: "Badge Tokens",
      body: "53 badges (19 new), 20 slots, and token costs that change with your height and position.",
      href: "/badge-token-planner",
    },
    {
      title: "Signature Blueprints",
      body: "40 three-player hybrid templates replace the Pro-Tuned and NBA templates from previous years, with more added each season.",
      href: "/signature-blueprints",
    },
    {
      title: "Synergy",
      body: "Fuse and Reaction badges can push attributes past their normal caps, up to Legend.",
    },
    {
      title: "Takeover rework",
      body: "Multiple Takeovers can be active at the same time.",
    },
    {
      title: "Female MyPLAYERs",
      body: "Female MyPLAYERs debut in NBA 2K27.",
    },
  ];

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-site flex-grow flex-col gap-12 px-4 py-12 md:px-margin-desktop">
      <JsonLdScript
        schema={[
          websiteSchema({
            name: "My2KBuilder",
            description:
              "Unofficial web planner for NBA 2K27 MyPLAYER builds: Badge Tokens, Signature Blueprints, shareable build cards.",
          }),
          softwareApplicationSchema({
            name: "My2KBuilder",
            description:
              "Plan NBA 2K27 MyPLAYER builds in your browser: allocate Badge Tokens across 20 slots, compare 40 Signature Blueprints, and share a build card.",
            applicationCategory: "WebApplication",
          }),
          faqPageSchema([...FAQS]),
        ]}
      />

      {/* Hero — tool entry first (copy §2.1/§3.1) */}
      <section className="flex flex-col items-center gap-6 border-b border-dashed border-border-low py-12 text-center">
        <span className="rounded border border-border-low bg-surface-card px-3 py-1 text-code-sm uppercase tracking-wider text-secondary">
          Web-first · No download · No sign-up
        </span>
        <h1 className="max-w-4xl font-display text-display-lg text-primary-container">
          NBA 2K27 Builder for Badge Tokens &amp; Blueprints
        </h1>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">
          Plan your MyPLAYER build in the browser. Allocate Badge Tokens across 20 slots, compare
          all 40 Signature Blueprints side by side, and share the result as a link — no download, no
          sign-up.
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/badge-token-planner"
            className="rounded bg-primary-container px-6 py-3 text-label-md font-bold text-on-primary transition-colors duration-200 hover:bg-surface-tint"
          >
            Open Badge Token Planner
          </Link>
          <Link
            href="/signature-blueprints"
            className="rounded border border-outline px-6 py-3 text-label-md font-bold text-on-surface transition-colors duration-200 hover:bg-surface-card"
          >
            Browse Signature Blueprints
          </Link>
        </div>
        {/* R12I hero visual (design pack t_65009bdd): original dark-first
            console artwork, local static asset. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- local static SVG asset */}
        <img
          src="/assets/r12i/hero/hero-home-visual.svg"
          alt="My2KBuilder planning console artwork — badge slots, blueprint cards, and a share link"
          width={1600}
          height={900}
          className="mt-6 w-full max-w-4xl rounded border border-border-low"
        />
      </section>

      {/* Tool entry grid */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {TOOL_CARDS.map((c) => (
          <div
            key={c.title}
            className="group flex flex-col gap-4 overflow-hidden rounded border border-border-low bg-surface-card transition-colors duration-200 hover:border-primary-container"
          >
            {c.image ? (
              // R12I tool-card visual (design pack t_65009bdd), local static SVG.
              /* eslint-disable-next-line @next/next/no-img-element -- local static SVG asset */
              <img
                src={c.image}
                alt={`${c.title} illustration`}
                width={800}
                height={500}
                loading="lazy"
                className="aspect-[8/5] w-full border-b border-border-low object-cover"
              />
            ) : null}
            <div className="flex flex-col gap-4 p-6 pt-2">
              <div className="flex h-12 w-12 items-center justify-center rounded border border-border-low bg-surface-container-high text-primary-container transition-colors duration-200 group-hover:bg-primary-container group-hover:text-on-primary">
                <Icon name={c.icon} fill />
              </div>
              <h2 className="font-display text-headline-sm text-on-surface">{c.title}</h2>
              <p className="flex-grow text-body-md text-on-surface-variant">{c.body}</p>
              <Link
                href={c.href}
                className="flex items-center gap-1 text-label-md text-primary-container group-hover:underline"
              >
                {c.cta} <Icon name="arrow_forward" size={16} />
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* What's new — official_confirmed facts only (contract §9, PRD D8) */}
      <section className="rounded border border-border-low bg-surface-card p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-headline-md text-on-surface">
            What&apos;s new in NBA 2K27 builds
          </h2>
          <SourceTag tier="official" />
        </div>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
          {whatsNew.map((f) => (
            <li key={f.title} className="flex gap-3">
              <Icon name="check_circle" fill size={22} className="mt-0.5 shrink-0 text-secondary" />
              <div>
                <span className="mb-1 block text-label-md text-on-surface">{f.title}</span>
                <span className="text-body-sm text-on-surface-variant">
                  {f.body}
                  {f.href ? (
                    <>
                      {" "}
                      <Link href={f.href} className="text-primary-container hover:underline">
                        {f.href === "/badge-token-planner" ? "Plan badge tokens" : "Browse blueprints"}
                      </Link>
                    </>
                  ) : null}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-body-sm text-text-muted">
          Sources: official 2K announcements. Dates, source tiers, and update log →{" "}
          <Link href="/methodology" className="text-primary-container hover:underline">
            See our Methodology
          </Link>
        </p>
      </section>

      {/* R12I: 2K official videos via click-to-load youtube-nocookie facade
          (design handoff §5) — no third-party request before click. */}
      <section className="flex flex-col gap-6">
        <div className="flex max-w-3xl flex-col gap-2">
          <h2 className="font-display text-headline-md text-on-surface">Watch the systems in action</h2>
          <p className="text-body-md text-on-surface-variant">
            2K&apos;s builder walkthrough and gameplay trailer. Videos load from YouTube only after
            you click play.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {VIDEOS.map((v) => (
            <div key={v.videoId} className="flex flex-col gap-2">
              <VideoFacade videoId={v.videoId} title={v.title} thumbnail={v.thumbnail} />
              <p className="text-body-sm text-text-muted">
                {v.title} — 2K&apos;s YouTube channel. My2KBuilder is an unofficial, independent
                tool and is not affiliated with 2K.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Official timeline (official_confirmed, mechanics.v0.json) */}
      <section className="py-8">
        <h2 className="mb-6 text-center text-label-md uppercase tracking-widest text-on-surface-variant">
          Release Timeline
        </h2>
        <div className="relative mx-auto max-w-3xl">
          <div className="absolute left-0 top-1/2 z-0 h-px w-full -translate-y-1/2 bg-border-low" />
          <div className="relative z-10 flex justify-between">
            {[
              { date: "Aug 21", label: "2K HQ App Live", hot: false },
              { date: "Aug 26", label: "Early Access", hot: false },
              { date: "Sep 4, 2026", label: "Global Launch", hot: true },
            ].map((n) => (
              <div key={n.date} className="group flex cursor-default flex-col items-center">
                <div
                  className={`mb-2 text-code-sm transition-colors ${
                    n.hot ? "text-primary-container" : "text-on-surface-variant group-hover:text-secondary"
                  }`}
                >
                  {n.date}
                </div>
                <div
                  className={`h-3 w-3 rounded-full border-2 bg-surface transition-colors ${
                    n.hot
                      ? "border-primary-container shadow-[0_0_8px_rgba(255,176,58,0.5)]"
                      : "border-border-low group-hover:border-secondary"
                  }`}
                />
                <div
                  className={`mt-2 max-w-[100px] text-center text-label-md ${
                    n.hot ? "text-primary-container" : "text-on-surface"
                  }`}
                >
                  {n.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-6 text-center text-body-sm text-text-muted">
          NBA 2K27 launches {String(mechanicsFact(bundle, "launch_date_global")?.value ?? "2026-09-04")}.
          Early access opens August 26. The official 2K HQ App — with the full in-game builder — has
          been live since August 21. <SourceTag tier="official" />
        </p>
      </section>

      {/* R12I wave-1 homepage FAQ (copy §2 freeze) + FAQPage schema above */}
      <section className="flex max-w-3xl flex-col gap-4">
        <h2 className="font-display text-headline-md text-on-surface">FAQ</h2>
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
      </section>
    </main>
  );
}
