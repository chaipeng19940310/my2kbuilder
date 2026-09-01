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
import "./r18-home.css";

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
    title: "Badge Token Planner",
    body: "NBA 2K27 gives you 20 badge slots, and every badge costs tokens that shift with your height and position. Test your allocation here before you spend a single token in-game.",
    cta: "Start planning",
    href: "/badge-token-planner",
    image: "/assets/r12i/tool-cards/tool-card-badge-token-planner.svg",
    imageAlt: "Badge Token Planner illustration",
  },
  {
    title: "Signature Blueprint Browser",
    body: "All 40 launch blueprints in one filterable list. Shortlist up to three and compare attributes and badges side by side.",
    cta: "Browse blueprints",
    href: "/signature-blueprints",
    image: "/assets/r12i/tool-cards/tool-card-signature-blueprints.svg",
    imageAlt: "Signature Blueprints illustration",
  },
  {
    title: "Share a Build Card",
    body: "Turn any plan into a link and a clean text build card. Paste it in Discord, Reddit, or a video description — no screenshots, no account.",
    cta: "Create a card",
    href: "/build-card",
    image: "/assets/r12i/tool-cards/tool-card-build-card.svg",
    imageAlt: "Share a Build Card illustration",
  },
] as const;

const GUIDE_CARDS = [
  {
    title: "Launch Day Build Guide",
    body: "Run a five-step launch checklist, set the first job at every position, and budget 53 badges across 20 slots.",
    href: "/launch-day-build-guide",
  },
  {
    title: "Takeover Requirements",
    body: "All 24 Takeover abilities with attribute unlock thresholds and per-row source labels.",
    href: "/takeover-requirements",
  },
  {
    title: "Cap Breakers",
    body: "Plan cap breakers backwards from badge thresholds with 99 OVR previews and Build Specialization.",
    href: "/cap-breakers",
  },
  {
    title: "2K26 Build Pitfalls",
    body: "Check body-type penalties, animation thresholds, and seasonal resets before copying a 2K26 build.",
    href: "/2k26-to-2k27-build-pitfalls",
  },
  {
    title: "Blueprints by Position",
    body: "Browse all 40 Signature Blueprints grouped by position and playstyle.",
    href: "/signature-blueprints/by-position",
  },
] as const;

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

const VIDEOS = [
  {
    videoId: "MSZre4MBSBA",
    title: "2K Builder Courtside Report",
    thumbnail: "/assets/video/courtside-report.jpg",
  },
  {
    videoId: "vQ2jNNbh1TU",
    title: "NBA 2K27 Gameplay Trailer",
    thumbnail: "/assets/video/official-trailer.jpg",
  },
] as const;

const BLUEPRINT_PREVIEWS = [
  ["Splash", "/assets/r12i/blueprints/blueprint-splash.svg"],
  ["Conductor", "/assets/r12i/blueprints/blueprint-conductor.svg"],
  ["Clamps", "/assets/r12i/blueprints/blueprint-clamps.svg"],
  ["Paint Beast", "/assets/r12i/blueprints/blueprint-paint-beast.svg"],
] as const;

const WHATS_NEW_ICONS = ["physicals", "shooting", "playmaking", "finishing", "rebounding"] as const;

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
    <main className="relative z-10 mx-auto flex w-full max-w-site flex-grow flex-col gap-20 bg-page-bg px-4 py-12 md:gap-24 md:px-margin-desktop md:py-16">
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

      <div className="flex flex-col gap-12 md:gap-16">
        <section className="mx-auto flex max-w-4xl flex-col items-center gap-8 pt-4 text-center md:pt-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-border-low bg-surface-card px-3 py-1 text-code-sm uppercase tracking-widest text-text-muted">
            <Icon name="bolt" size={14} className="text-primary-container" />
            Web-first · No download · No sign-up
          </span>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-on-surface md:text-6xl">
            NBA 2K27 Builder for Badge Tokens &amp; Blueprints
          </h1>
          <p className="max-w-2xl text-body-lg leading-relaxed text-text-muted md:text-xl">
            Plan your MyPLAYER build in the browser. Allocate Badge Tokens across 20 slots, compare
            all 40 Signature Blueprints side by side, and share the result as a link — no download, no
            sign-up.
          </p>
          <div className="flex w-full flex-col gap-4 pt-2 sm:w-auto sm:flex-row">
            <Link
              href="/badge-token-planner"
              className="inline-flex items-center justify-center gap-2 rounded bg-primary-container px-8 py-4 text-body-md font-bold uppercase tracking-wide text-on-primary transition-colors hover:bg-surface-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container"
            >
              Open Badge Token Planner <Icon name="arrow_forward" size={18} />
            </Link>
            <Link
              href="/signature-blueprints"
              className="inline-flex items-center justify-center rounded border-2 border-primary-container px-8 py-4 text-body-md font-bold uppercase tracking-wide text-primary-container transition-colors hover:bg-primary-container hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container"
            >
              Browse Signature Blueprints
            </Link>
          </div>
        </section>

        <section aria-label="Builder inventory" className="r18-stats">
          {[
            { number: "53", label: "Badges", tone: "amber", icon: "/assets/r19/stat-badges.svg" },
            { number: "40", label: "Signature Blueprints", tone: "violet", icon: "/assets/r19/stat-blueprints.svg" },
            { number: "20", label: "Badge Slots", tone: "cyan", icon: "/assets/r19/stat-slots.svg" },
          ].map(({ number, label, tone, icon }) => (
            <div key={label} data-tone={tone}>
              {/* eslint-disable-next-line @next/next/no-img-element -- original local SVG asset */}
              <img src={icon} alt="" width={64} height={64} aria-hidden="true" />
              <strong>{number}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>
      </div>

      <section aria-label="Signature Blueprints preview strip" className="r18-blueprints">
        {BLUEPRINT_PREVIEWS.map(([name, image]) => (
          // eslint-disable-next-line @next/next/no-img-element -- local static SVG asset
          <img key={name} src={image} alt={`Signature Blueprint: ${name}`} width={800} height={500} loading="lazy" />
        ))}
      </section>

      <figure className="r19-blueprint-showcase">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- owner-approved local screenshot */}
          <img
            src="/assets/owner-screenshot-2k27-signature-blueprints-builder-v2-official-1920x1080.jpg"
            alt="NBA 2K27 Signature Blueprints builder screen showing the Launchpad point guard build"
            width={1920}
            height={1080}
            loading="lazy"
          />
        </div>
        <figcaption>The real NBA 2K27 Blueprints screen — plan your build here first.</figcaption>
      </figure>

      <section className="r18-tools">
        {TOOL_CARDS.map((card) => (
          <Link key={card.href} href={card.href} className="r18-tool">
            {/* eslint-disable-next-line @next/next/no-img-element -- local static SVG asset */}
            <img src={card.image} alt={card.imageAlt} width={800} height={500} loading="lazy" className="r18-band" />
            <div className="r18-tool-copy">
              <h2>{card.title}</h2>
              <p>{card.body}</p>
              <span>
                {card.cta} <Icon name="arrow_forward" size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
        <Link href="/takeover-requirements" className="r18-tool">
          <div className="r18-icons">
            {["shooting", "finishing", "playmaking", "defense", "rebounding", "physicals"].map((icon) => (
              // eslint-disable-next-line @next/next/no-img-element -- local static SVG asset
              <img key={icon} src={`/assets/r12i/icons/icon-${icon}.svg`} alt="" width={48} height={48} loading="lazy" />
            ))}
          </div>
          <div className="r18-tool-copy">
            <h2>Build Guides</h2>
            <p>Quick references for Takeovers, cap breakers, 2K26 copy-over traps, and blueprints by position.</p>
            <span>Start reading <Icon name="arrow_forward" size={16} /></span>
          </div>
        </Link>
      </section>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-24">
        <section className="flex flex-col gap-6">
          <h2 className="font-display text-headline-md text-on-surface">Build Guides</h2>
          <div className="r18-guide-list">
            {GUIDE_CARDS.map((guide) => (
              <Link key={guide.href} href={guide.href}>
                <span>
                  <strong>{guide.title}</strong>
                  <small>{guide.body}</small>
                </span>
                <Icon name="chevron_right" size={22} className="shrink-0 text-text-muted transition-colors group-hover:text-primary-container" />
              </Link>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-headline-md text-on-surface">What&apos;s new in NBA 2K27 builds</h2>
            <SourceTag tier="official" />
          </div>
          <ul className="r18-whatsnew">
            {whatsNew.map((item, index) => (
              <li key={item.title}>
                {/* eslint-disable-next-line @next/next/no-img-element -- local static SVG asset */}
                <img src={`/assets/r12i/icons/icon-${WHATS_NEW_ICONS[index]}.svg`} alt="" width={32} height={32} loading="lazy" />
                <div>
                  <h3>{item.title}</h3>
                  <p>
                    {item.body}
                    {item.href ? (
                      <>
                        {" "}<Link href={item.href}>{item.href === "/badge-token-planner" ? "Plan badge tokens" : "Browse blueprints"}</Link>
                      </>
                    ) : null}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="border-t border-border-low pt-4 text-body-sm text-text-muted">
            Sources: official 2K announcements. Dates, source tiers, and update log →{" "}
            <Link href="/methodology" className="text-primary-container hover:underline">See our Methodology</Link>
          </p>
        </section>
      </div>

      <section className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-display text-headline-lg text-on-surface">Watch the systems in action</h2>
          <p className="max-w-2xl text-body-md text-text-muted">2K&apos;s builder walkthrough and gameplay trailer. Videos load from YouTube only after you click play.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {VIDEOS.map((video) => (
            <div key={video.videoId} className="flex flex-col gap-4">
              <VideoFacade videoId={video.videoId} title={video.title} thumbnail={video.thumbnail} />
              <div>
                <h3 className="font-display text-lg font-bold text-on-surface">{video.title}</h3>
                <p className="mt-1 text-body-sm text-text-muted">{video.title} — 2K&apos;s YouTube channel. My2KBuilder is an unofficial, independent tool and is not affiliated with 2K.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-12 rounded-xl border border-border-low bg-surface-card p-6 md:p-12">
        <h2 className="text-center font-display text-headline-md text-on-surface">Release Timeline</h2>
        <div className="relative mx-auto w-full max-w-3xl px-4">
          <div className="absolute left-0 right-0 top-1/2 z-0 hidden h-0.5 -translate-y-1/2 bg-border-low md:block" />
          <div className="absolute left-0 top-1/2 z-0 hidden h-0.5 w-[72%] -translate-y-1/2 bg-primary-container/80 md:block" />
          <div className="absolute bottom-0 left-8 top-0 z-0 block w-0.5 bg-border-low md:hidden" />
          <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:gap-0">
            {[
              { date: "Aug 21", label: "2K HQ App Live", complete: true },
              { date: "Aug 26", label: "Early Access", complete: true },
              { date: "Sep 4, 2026", label: "Global Launch", complete: false },
            ].map((event) => (
              <div key={event.date} className="flex items-center gap-4 pl-4 text-left md:flex-col md:gap-3 md:pl-0 md:text-center">
                <div className={`shrink-0 rounded-full ${event.complete ? "h-4 w-4 border-4 border-surface-card bg-secondary shadow-[0_0_0_1px_#1e293b]" : "h-5 w-5 bg-primary-container shadow-[0_0_15px_rgba(255,176,58,0.8)] md:animate-pulse"}`} />
                <div>
                  <div className={`mb-1 text-body-sm font-bold uppercase tracking-wider ${event.complete ? "text-text-muted" : "text-primary-container"}`}>{event.date}</div>
                  <div className={`font-display ${event.complete ? "font-semibold text-on-surface" : "text-lg font-bold text-on-surface"}`}>{event.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mx-auto max-w-2xl text-center text-body-sm text-text-muted">
          NBA 2K27 launches {String(mechanicsFact(bundle, "launch_date_global")?.value ?? "2026-09-04")}.
          Early access opens August 26. The official 2K HQ App — with the full in-game builder — has
          been live since August 21. <SourceTag tier="official" />
        </p>
      </section>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <h2 className="text-center font-display text-headline-lg text-on-surface">FAQ</h2>
        <div className="r18-faq">
          {FAQS.map((faq) => (
            <details key={faq.question}>
              <summary>
                {faq.question}<Icon name="expand_more" size={22} className="shrink-0 text-primary-container transition-transform group-open:rotate-180" />
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
