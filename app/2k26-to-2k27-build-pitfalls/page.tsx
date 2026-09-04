import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/JsonLdScript";
import { VideoFacade } from "@/components/VideoFacade";
import { canonicalFor } from "@/lib/canonical";
import { socialMeta } from "@/lib/social";
import { articleSchema, breadcrumbSchema, faqPageSchema } from "@/lib/schema";
import { GuideToc } from "@/components/GuideToc";

// R12J-D pitfall-guide article page. Copy freeze: copy/r12j-wave2-copy-v1.md §3
// (rendered verbatim; the Chinese parenthetical notes in that file are pipeline
// annotations and are rendered here as English source-label chips).
// Route slug per task card: /2k26-to-2k27-build-pitfalls.
const PAGE_PATH = "/2k26-to-2k27-build-pitfalls";
const PAGE_TITLE = "Don't Copy Your 2K26 Build — NBA 2K27 Traps";
const PAGE_DESCRIPTION =
  "NBA 2K27 reworked body-type penalties, retired old animation thresholds, and resets seasonal Tokens and Synergy. Read this before copying a 2K26 build.";
const PAGE_H1 = "Don't Copy Your NBA 2K26 Build";
const LAST_VERIFIED = "2026-08-28";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalFor(PAGE_PATH) },
  ...socialMeta({
    path: PAGE_PATH,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  }),
};

// FAQ freeze (copy §3, 4 entries, verbatim; Chinese source notes rendered as
// inline English labels). FAQPage schema carries the same words.
const FAQS = [
  {
    question: "Can I still use my 2K26 build as a starting point?",
    answer:
      "Yes — as a hypothesis, not a finished plan. Community testing found the same 22 attributes and caps (Unverified), but body penalties, animation thresholds, and badge mechanics all changed. Re-check every threshold your build depends on before committing.",
  },
  {
    question: "Which 2K26 badges were removed in 2K27?",
    answer:
      "Six badges were removed and 19 added, for 53 total (2K-published roster count) — but 2K has not published which six were cut. We won't guess. Before building around any badge from a 2K26 guide, confirm it exists in the 2K27 badge list.",
  },
  {
    question: "Do the new animation thresholds apply to every build?",
    answer:
      "Requirements vary by animation, and some carry additional conditions. The examples on this page — like 94 Shooting for the KD Go-To Shot or 91 Ball Handle for the SGA Escape — are third-party compiled and labeled Unverified. Check the full requirement in-game before engineering a build around it.",
  },
  {
    question: "Where do the numbers on this page come from?",
    answer:
      "Each claim carries a label. Badge thresholds come from this site's cross-checked requirement layer. Body-penalty findings come from third-party testing and are labeled Unverified. Removed-badge counts and season reset mechanics are 2K-published. Anything we can't source, we don't print.",
  },
] as const;

/* Inline source-label chips (data-tier discipline from the R12J owner
   decision): third-party numbers get Unverified, 2K-published mechanics get a
   2K-published marker, and this site's cross-checked thresholds get
   cross_checked. */
function UnverifiedChip() {
  return (
    <span className="ml-1 inline-flex items-center rounded border border-outline-variant px-1.5 py-0.5 align-middle text-[10px] font-semibold tracking-wide text-error">
      Unverified
    </span>
  );
}

function PublishedChip() {
  return (
    <span className="ml-1 inline-flex items-center rounded border border-secondary-container px-1.5 py-0.5 align-middle text-[10px] font-semibold tracking-wide text-secondary">
      2K-published
    </span>
  );
}

function CrossCheckedChip() {
  return (
    <span className="ml-1 inline-flex items-center rounded border border-secondary-container px-1.5 py-0.5 align-middle text-[10px] font-semibold tracking-wide text-secondary">
      cross_checked
    </span>
  );
}

/** Section heading with a leading R12I-G discipline/tier icon. */
function SectionHeading({ icon, alt, children }: { icon?: string; alt?: string; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 font-display text-headline-md text-on-surface">
      {icon ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-low bg-surface-container-lowest p-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- local static SVG from the R12I-G design pack */}
          <img src={icon} alt={alt ?? ""} width={28} height={28} className="h-7 w-7 object-contain" />
        </span>
      ) : null}
      {children}
    </h2>
  );
}

export default function BuildPitfallsPage() {
  return (
    <main className="r18-page r18-guide-page relative z-10 mx-auto w-full max-w-site flex-grow gap-12 px-4 py-12 md:px-margin-desktop">
      <JsonLdScript
        schema={[
          articleSchema({
            headline: PAGE_H1,
            description: PAGE_DESCRIPTION,
            url: canonicalFor(PAGE_PATH),
            datePublished: LAST_VERIFIED,
          }),
          faqPageSchema([...FAQS]),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Don't Copy Your 2K26 Build", path: PAGE_PATH },
          ]),
        ]}
      />
      <GuideToc items={[
        { href: "#body-penalties", label: "Body Penalties" },
        { href: "#animation-thresholds", label: "Animation Thresholds" },
        { href: "#badge-math", label: "Badge Math" },
        { href: "#season-resets", label: "Season Resets" },
        { href: "#safer-build", label: "A Safer Build" },
        { href: "#pitfalls-faq", label: "FAQ" },
      ]} />

      <header className="flex max-w-3xl flex-col gap-4">
        <h1 className="font-display text-display-lg text-primary-container">{PAGE_H1}</h1>
        {/* Article lead (copy §3 正文 paragraph 1, verbatim). */}
        <p className="text-body-lg text-on-surface-variant">
          {
            "At a glance, NBA 2K27's builder looks familiar. Community testing found the same 22 attributes and the same caps as 2K26."
          }
          <UnverifiedChip />
          {
            " That surface similarity is exactly the trap: the rules underneath — body-type penalties, animation thresholds, badge math, and season resets — all changed. A build copied from a 2K26 guide can cost you weeks of progress before you notice what's wrong. Here's what actually changed, and how to plan around it."
          }
        </p>
        <p className="text-body-sm text-text-muted">Last verified: {LAST_VERIFIED}</p>
        {/* R12I-G original hero visual (design handoff §1): 1600x900 SVG,
            dark-first, readable over the page background. */}
        <div className="overflow-hidden rounded border border-border-low bg-surface-card">
          {/* eslint-disable-next-line @next/next/no-img-element -- local static SVG from the R12I-G design pack */}
          <img
            src="/assets/r12i/hero/hero-home-visual.svg"
            alt="Abstract My2KBuilder court visual with build-planning accents"
            width={1600}
            height={900}
            className="h-auto w-full object-cover"
          />
        </div>
      </header>

      {/* §1 Body penalties (copy §3, verbatim + source chips). */}
      <section id="body-penalties" className="flex max-w-3xl flex-col gap-4">
        <SectionHeading icon="/assets/r12i/icons/icon-defense.svg" alt="Defense discipline icon">
          Body Penalties Were Reworked
        </SectionHeading>
        <p className="text-body-md text-on-surface-variant">
          {
            "In 2K26, the standard min-max move was simple: minimum weight, shortest wingspan, take the speed and move on. In 2K27 that move has a price. Third-party testing shows that on smaller builds, cutting to minimum weight and the shortest wingspan now costs significantly more perimeter defense and driving dunk than it used to."
          }
          <UnverifiedChip />
        </p>
        {/* Visual callout: the two body-setting traps, with R12I-G discipline
            icons (defense / finishing) — not a text wall. */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2 rounded border border-border-low bg-surface-card p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-low bg-surface-container-lowest p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element -- local static SVG from the R12I-G design pack */}
              <img src="/assets/r12i/icons/icon-defense.svg" alt="Defense discipline icon" width={28} height={28} className="h-7 w-7 object-contain" />
            </span>
            <p className="text-body-sm text-on-surface-variant">
              Small builds: minimum weight + shortest wingspan now costs more perimeter defense and driving dunk than it used to.
              <UnverifiedChip />
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded border border-border-low bg-surface-card p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-low bg-surface-container-lowest p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element -- local static SVG from the R12I-G design pack */}
              <img src="/assets/r12i/icons/icon-finishing.svg" alt="Finishing discipline icon" width={28} height={28} className="h-7 w-7 object-contain" />
            </span>
            <p className="text-body-sm text-on-surface-variant">
              Big builds: at roughly 6&apos;10&quot; and above, dropping weight can raise perimeter defense — the opposite of 2K26 habits.
              <UnverifiedChip />
            </p>
          </div>
        </div>
        <p className="text-body-md text-on-surface-variant">
          {
            "Bigger builds flip the logic. At roughly 6'10\" and above, dropping weight can actually raise perimeter defense — the opposite of what 2K26 habits tell you."
          }
          <UnverifiedChip />
          {
            " If your old center build started at minimum weight to chase speed, the same setting in 2K27 may be leaving defense on the table. Wingspan deserves the same suspicion: the shortest setting used to be a default choice, and now it's a trade you should make on purpose or not at all."
          }
        </p>
        <p className="text-body-md text-on-surface-variant">
          {
            "The practical rule: body settings are no longer a free lunch you grab from a template. Set your position, then test height, weight, and wingspan combinations in the builder and watch how the attribute caps move — before you spend a single attribute point."
          }
        </p>
      </section>

      {/* §2 Animation thresholds (copy §3, verbatim + source chips). */}
      <section id="animation-thresholds" className="flex max-w-3xl flex-col gap-4">
        <SectionHeading icon="/assets/r12i/icons/icon-shooting.svg" alt="Shooting discipline icon">
          The Old &quot;85 Threshold&quot; Era Is Over
        </SectionHeading>
        <p className="text-body-md text-on-surface-variant">
          {
            "For years, 85 was the magic number. Huge parts of the animation store unlocked at 85 ratings, so 2K26 builds were often engineered to hit exactly 85 in key attributes and stop. In NBA 2K27, animation requirements moved, and the 85 habit is now a liability."
          }
        </p>
        <p className="text-body-md text-on-surface-variant">
          {
            "Two examples from third-party compiled requirement lists, labeled Unverified: the KD Go-To Shot now asks for 94 Shooting, and the SGA Escape asks for 91 Ball Handle."
          }
          <UnverifiedChip />
          {
            " Under the old logic, a build stopping at 85 Shooting or 85 Ball Handle would have assumed it qualified. In 2K27, it doesn't."
          }
        </p>
        <p className="text-body-md text-on-surface-variant">
          {
            "This inverts the planning order. Instead of maxing attributes and seeing which animations you get, pick your must-have animations first — go-to shot, escape move, dunk packages — then reverse-engineer the attribute targets from their requirements. Animation requirements are among the fastest-moving data in early access, so check the label and the last-verified date on any threshold before building around it."
          }
        </p>
      </section>

      {/* §3 Badge math (copy §3, verbatim + source chips + tier visuals). */}
      <section id="badge-math" className="flex max-w-3xl flex-col gap-4">
        <SectionHeading icon="/assets/r12i/tiers/tier-gold.svg" alt="Gold tier mark">
          The Badge Math Changed Under Your Feet
        </SectionHeading>
        {/* R12I-G tier strip (920x180 SVG): the five badge tiers as a visual
            breather; Legend stays a planning marker, never a promise. */}
        <div className="overflow-hidden rounded border border-border-low bg-surface-card p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- local static SVG from the R12I-G design pack */}
          <img
            src="/assets/r12i/tiers/tier-strip.svg"
            alt="Badge tier strip: Bronze, Silver, Gold, Hall of Fame, Legend"
            width={920}
            height={180}
            className="h-auto w-full object-contain"
          />
        </div>
        <p className="text-body-md text-on-surface-variant">
          {"NBA 2K27 ships 53 badges: 19 new, 6 removed."}
          <PublishedChip />
          {
            " Which six were removed? 2K hasn't published that list, and we won't guess — if a 2K26 guide tells you to plan around a specific badge, confirm it still exists before committing. The current 53-badge list lives on the "
          }
          <Link href="/badge-requirements" className="text-primary-container hover:underline">
            badge requirements page
          </Link>
          .
        </p>
        <p className="text-body-md text-on-surface-variant">
          {
            "The bigger change is how badges get equipped. Attribute requirements no longer give you the badge — they put it in your inventory. Equipping it costs Badge Tokens, earned through discipline meters and training, across 20 slots in six disciplines."
          }
          <PublishedChip />
          {
            " Token costs vary by height and position; on this site, the planner shows single-source reference-build cost values labeled Unverified — confirm your build's exact costs in-game."
          }
        </p>
        <p className="text-body-md text-on-surface-variant">
          {
            "And Legend tier is no longer something attributes can reach at creation. Legend requires Synergy — 16 slots of Fuse and Reaction boosts."
          }
          <PublishedChip />
          {
            ' A 2K26 build guide that says "hit 94 and you\'re done" is describing a game that no longer exists.'
          }
        </p>
      </section>

      {/* §4 Season resets (copy §3, verbatim + source chips). */}
      <section id="season-resets" className="flex max-w-3xl flex-col gap-4">
        <SectionHeading icon="/assets/r12i/icons/icon-physicals.svg" alt="Physicals discipline icon">
          Seasons Reset More Than You Think
        </SectionHeading>
        <p className="text-body-md text-on-surface-variant">
          Two reset mechanics catch returning players off guard:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-body-md text-on-surface-variant">
          <li>
            <strong className="text-on-surface">Season-earned Synergy expires at the end of the season.</strong>
            <PublishedChip />
            {
              " If your build's whole plan leans on +1s and +2s from season rewards, you have a seasonal build — plan for what it looks like in week one of the next season, not just week eight of this one."
            }
          </li>
          <li>
            <strong className="text-on-surface">
              Bonus badge tokens and slots come from seasons, Build Specialization, Crew, and REP
            </strong>
            {" — of these, REP rewards are permanent."}
            <PublishedChip />
            {" A build that only functions with season-pass bonus slots is a build that breaks when the pass ends."}
          </li>
        </ul>
        <p className="text-body-md text-on-surface-variant">
          {
            "None of this makes seasonal rewards bad. It makes them a planning input. Know which parts of your build are permanent and which parts reset, before the reset teaches you the hard way."
          }
        </p>
      </section>

      {/* §5 Planning order (copy §3, verbatim; steps as cards; interlinks to
          /badge-requirements and the planner per the card's 互链 requirement). */}
      <section id="safer-build" className="flex max-w-3xl flex-col gap-4">
        <SectionHeading>A Safer Way to Build in 2K27</SectionHeading>
        <p className="text-body-md text-on-surface-variant">
          Putting it together, the 2K27 planning order looks like this:
        </p>
        <ol className="flex flex-col gap-3">
          <li className="flex gap-3 rounded border border-border-low bg-surface-card p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-container font-display text-label-md font-bold text-primary-container">
              1
            </span>
            <p className="text-body-md text-on-surface-variant">
              <strong className="text-on-surface">Pick your animations first.</strong>
              {" Requirements moved; the animation you build around decides your attribute floors."}
            </p>
          </li>
          <li className="flex gap-3 rounded border border-border-low bg-surface-card p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-container font-display text-label-md font-bold text-primary-container">
              2
            </span>
            <p className="text-body-md text-on-surface-variant">
              <strong className="text-on-surface">Check badge thresholds second.</strong>
              {" Gold Posterizer at 93 Driving Dunk"}
              <CrossCheckedChip />
              {" on the "}
              <Link href="/badge-requirements" className="text-primary-container hover:underline">
                badge requirements page
              </Link>
              {
                ", your must-have defensive badges, your playmaking targets — list them before touching the attribute panel."
              }
            </p>
          </li>
          <li className="flex gap-3 rounded border border-border-low bg-surface-card p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-container font-display text-label-md font-bold text-primary-container">
              3
            </span>
            <p className="text-body-md text-on-surface-variant">
              <strong className="text-on-surface">Set body settings third.</strong>
              {" Test weight and wingspan against the reworked penalties instead of copying 2K26 numbers."}
            </p>
          </li>
          <li className="flex gap-3 rounded border border-border-low bg-surface-card p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-container font-display text-label-md font-bold text-primary-container">
              4
            </span>
            <p className="text-body-md text-on-surface-variant">
              <strong className="text-on-surface">Count tokens before spending.</strong>
              {
                " Attribute requirements unlock inventory; tokens equip badges. Costs vary by build — the planner's cost values are single-source reference-build numbers labeled Unverified, so leave margin. The "
              }
              <Link href="/badge-token-planner" className="text-primary-container hover:underline">
                Badge Token Planner
              </Link>
              {" maps the spend once you know your targets."}
            </p>
          </li>
          <li className="flex gap-3 rounded border border-border-low bg-surface-card p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-container font-display text-label-md font-bold text-primary-container">
              5
            </span>
            <p className="text-body-md text-on-surface-variant">
              <strong className="text-on-surface">Mark what&apos;s seasonal.</strong>
              {
                " Synergy from season rewards expires; REP and specialization rewards are permanent. Know which is which."
              }
            </p>
          </li>
        </ol>
        <p className="text-body-md text-on-surface-variant">
          {
            "Your 2K26 build isn't worthless — it's a hypothesis. Test it against 2K27's numbers before you commit, and it becomes a plan."
          }
        </p>
      </section>

      {/* 2K Builder Courtside Report — click-to-load facade per design
          handoff §5: initial HTML is a self-hosted real cover image + play button
          only; the youtube-nocookie iframe is created after a click. Same
          video asset as the sibling wave-2 pages (the other thumbnail's
          filename trips the banned-word grep on production HTML). */}
      <section className="flex max-w-3xl flex-col gap-4">
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

      {/* Interlink block (card requirement: Planner / badge-requirements /
          cap-breakers). /cap-breakers ships from sibling card R12J-C in the
          same wave. */}
      <section className="flex max-w-3xl flex-col gap-3 rounded border border-border-low bg-surface-card p-6">
        <h2 className="font-display text-headline-sm text-on-surface">Keep Planning</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-body-md text-on-surface-variant">
          <li>
            <Link href="/badge-token-planner" className="text-primary-container hover:underline">
              Badge Token Planner
            </Link>
            {" — map your build around the thresholds you just checked."}
          </li>
          <li>
            <Link href="/badge-requirements" className="text-primary-container hover:underline">
              Badge Requirements
            </Link>
            {" — all 53 badges with four-tier attribute thresholds and source labels."}
          </li>
          <li>
            <Link href="/cap-breakers" className="text-primary-container hover:underline">
              Cap Breakers
            </Link>
            {" — plan breakers backwards from the badge thresholds this page warns you about."}
          </li>
        </ul>
      </section>

      {/* FAQ at page bottom (copy §3; 4 freeze entries, verbatim). */}
      <section id="pitfalls-faq" className="flex max-w-3xl flex-col gap-4">
        <h2 className="font-display text-headline-md text-on-surface">2K26-to-2K27 Pitfalls FAQ</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((f) => (
            <details key={f.question} className="group rounded border border-border-low bg-surface-card p-4">
              <summary className="cursor-pointer list-none text-label-md text-on-surface group-open:text-primary-container">
                {f.question}
              </summary>
              <p className="mt-2 text-body-md text-on-surface-variant">{f.answer}</p>
            </details>
          ))}
        </div>
        <p className="text-body-sm text-text-muted">Last verified: {LAST_VERIFIED}</p>
      </section>
    </main>
  );
}
