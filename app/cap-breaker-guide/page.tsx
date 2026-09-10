import type { Metadata } from "next";
import Link from "next/link";
import { GuideToc } from "@/components/GuideToc";
import { JsonLdScript } from "@/components/JsonLdScript";
import { canonicalFor } from "@/lib/canonical";
import { socialMeta } from "@/lib/social";
import { articleSchema, breadcrumbSchema, faqPageSchema } from "@/lib/schema";

const PAGE_PATH = "/cap-breaker-guide";
const PAGE_TITLE = "NBA 2K27 Cap Breaker Planning Guide | My2KBuilder";
const PAGE_DESCRIPTION =
  "NBA 2K27 cap breaker rules: max 5 per attribute, permanent once applied, every way to earn them, and a badge-first method to plan each breaker.";
const PAGE_H1 = "NBA 2K27 Cap Breaker Planning Guide";
const LAST_VERIFIED = "2026-09-07";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalFor(PAGE_PATH) },
  ...socialMeta({ path: PAGE_PATH, title: PAGE_TITLE, description: PAGE_DESCRIPTION }),
};

const FAQS = [
  {
    question: "How many cap breakers can you put on one attribute in NBA 2K27?",
    answer:
      "A maximum of five per attribute. The limit is cross-checked between 2K-published support documentation and multiple independent community guides. You cannot funnel your entire supply into a single rating — plan for spread, not stacking.",
  },
  {
    question: "Can you undo or move a cap breaker after applying it?",
    answer:
      "No. Applying a cap breaker is a permanent change that cannot be moved or undone. There is no respec, which is why every breaker should be planned against a badge threshold before it is spent.",
  },
  {
    question: "How do you get more cap breakers in NBA 2K27?",
    answer:
      "Build Specialization quests award them — six tracks, ten quests each, including the new Physicals discipline. Community guides also report breakers on the 40-level season reward ladder, through Crew progression, and in the Pro Pass / Hall of Fame Pass tracks. Supply is finite and arrives over the season.",
  },
  {
    question: "Are cap breaker builds worth it in 2K27?",
    answer:
      "Yes when every breaker crosses a threshold — a badge tier, an animation requirement, a Takeover gate. Not when breakers chase a rating that unlocks nothing, or when the plan assumes breakers you cannot name a source for. Breakers are permanent, so the worth is decided on paper first: set badge targets, measure the gap, spend only where a tier unlocks.",
  },
  {
    question: "Where can I preview cap breaker gains before spending?",
    answer:
      "In-game: once your build reaches 99 OVR, the builder previews each breaker's boost per attribute, and the companion app offers the same preview. On this site: the cap breaker preview tool lets you test how many breakers an attribute can take and which badge tiers come into reach. Exact per-breaker gain values are pending verification here — no estimates, no placeholders.",
  },
] as const;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-headline-md text-on-surface">{children}</h2>;
}

function SourceChip({ children, pending = false }: { children: React.ReactNode; pending?: boolean }) {
  return (
    <span
      className={`ml-1 inline-flex items-center rounded border px-1.5 py-0.5 align-middle text-[10px] font-semibold tracking-wide ${
        pending
          ? "border-outline-variant text-error"
          : "border-secondary-container text-secondary"
      }`}
    >
      {children}
    </span>
  );
}

const cardClass = "rounded border border-border-low bg-surface-card p-4 text-body-md text-on-surface-variant";
const linkClass = "font-semibold text-primary-container hover:underline";

export default function CapBreakerGuidePage() {
  return (
    <main className="r18-page r18-guide-page relative z-10 mx-auto w-full max-w-site flex-grow gap-12 px-4 py-6 md:py-12 md:px-margin-desktop">
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
            { name: "Cap Breaker Planning Guide", path: PAGE_PATH },
          ]),
        ]}
      />

      <GuideToc
        items={[
          { href: "#rules", label: "Cap Breaker Rules" },
          { href: "#planning-method", label: "Planning Method" },
          { href: "#worth-it", label: "Are They Worth It?" },
          { href: "#mistakes", label: "Mistakes to Avoid" },
          { href: "#practice", label: "Plan Your Spend" },
          { href: "#faq", label: "FAQ" },
        ]}
      />

      <header className="flex max-w-3xl flex-col gap-4">
        <h1 className="mb-2 md:mb-8 font-display text-headline-lg text-primary-container md:text-display-lg">{PAGE_H1}</h1>
        <div className="rounded border border-primary-container/40 bg-surface-card p-5">
          <p className="mb-3 text-body-lg text-on-surface">
            Cap breakers are permanent, capped at five per attribute, and too scarce to improvise. Plan them in this order:
          </p>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-body-md text-on-surface-variant">
            <li>Learn the rules — the limit, the permanence, and every way to earn them.</li>
            <li>Set badge tier targets before you touch an attribute.</li>
            <li>Measure the gap between your cap and the requirement.</li>
            <li>Spend breakers only where they unlock a tier.</li>
            <li>Preview first; commit last.</li>
          </ol>
          <p className="mt-3 text-body-md text-on-surface">Each step is explained below.</p>
        </div>
        <p className="text-body-sm text-text-muted">Last verified: {LAST_VERIFIED}</p>
      </header>

      <section id="rules" className="flex max-w-3xl flex-col gap-5">
        <SectionHeading>The Rules of Cap Breakers</SectionHeading>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-headline-sm text-on-surface">What a cap breaker does</h3>
          <p className="text-body-md text-on-surface-variant">
            A cap breaker pushes one attribute past the maximum your height, weight, and wingspan allowed at creation. They return in NBA 2K27, and the guessing is gone: once your build reaches 99 OVR, the builder shows a preview of the boost each attribute would get from a breaker, so you can see the payoff before you spend. The same preview is available in the companion app.<SourceChip>2K-published</SourceChip>
          </p>
          <p className="text-body-md text-on-surface-variant">
            What no preview changes is the math underneath. Your body settings still set the ceiling a breaker can push toward<SourceChip>cross_checked</SourceChip>, and breakers are a finite supply you earn over a season, not a currency you buy in bulk. Treat each one like a draft pick.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-headline-sm text-on-surface">Five per attribute — and permanent</h3>
          <p className="text-body-md text-on-surface-variant">Two rules decide everything else about cap breaker planning:</p>
          <ul className="grid gap-3">
            <li className={cardClass}>
              <strong className="text-on-surface">Five per attribute.</strong> A cap breaker can be applied to any single attribute a maximum of five times<SourceChip>cross_checked</SourceChip>. You cannot funnel your entire stash into one rating.
            </li>
            <li className={cardClass}>
              <strong className="text-on-surface">Permanent once applied.</strong> Applying a breaker is a permanent change that cannot be moved or undone<SourceChip>cross_checked</SourceChip>. There is no respec. A breaker spent on the wrong attribute is gone for that MyPLAYER.
            </li>
          </ul>
          <div className="flex flex-wrap gap-2 rounded border border-border-low bg-surface-container-low p-3 text-body-sm text-on-surface-variant">
            <span className="w-full font-semibold text-on-surface">Rule labels used on this page</span>
            <SourceChip>cross_checked</SourceChip>
            <span>confirmed across independent references</span>
            <SourceChip>community_unverified</SourceChip>
            <span>reported, pending confirmation</span>
            <SourceChip pending>pending</SourceChip>
            <span>not published here until verified</span>
          </div>
          <p className="text-body-md text-on-surface-variant">
            This pair of rules is why planning exists at all. If breakers were refundable, you could experiment. They are not, so the experimenting has to happen on paper — or in a preview tool — before it happens in-game.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-headline-sm text-on-surface">Five is a budget, not a target</h3>
          <p className="text-body-md text-on-surface-variant">
            A useful mindset shift: the five-per-attribute limit<SourceChip>cross_checked</SourceChip> is not a goal to hit on your favorite rating. It is the maximum size of a gap you are allowed to close. A build that needs six breakers on one attribute is not an ambitious build — it is a build whose body settings disagree with its badge targets, and the fix is a different height or a different target, not a bigger stash. The builds that get the most from breakers usually spread two or three across two or three attributes, each one placed exactly on a threshold.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-headline-sm text-on-surface">Every way to earn cap breakers</h3>
          <p className="text-body-md text-on-surface-variant">Cap breakers come from progression, not from the store shelf you browse first:</p>
          <ul className="flex list-disc flex-col gap-3 pl-5 text-body-md text-on-surface-variant">
            <li><strong className="text-on-surface">Build Specialization quests.</strong> Each of the six tracks — including the new Physicals discipline — runs ten objective-based quests, and cap breakers are among the rewards<SourceChip>2K-published</SourceChip>. One restriction to plan around: breakers earned through a specialization track must be applied within that track&apos;s attribute category, or to a Physicals attribute<SourceChip>community_unverified</SourceChip>. A shooting-track breaker cannot jump to your defense.</li>
            <li><strong className="text-on-surface">The season reward ladder.</strong> Community guides report a cap breaker on the 40-level season rewards track each season<SourceChip>community_unverified</SourceChip>.</li>
            <li><strong className="text-on-surface">Crew progression.</strong> Leveling your Crew awards breakers<SourceChip>community_unverified</SourceChip>. One confirmed detail: if you leave a Crew, the cap breakers you earned stay with you — but they are not re-rewarded when you join a new one<SourceChip>cross_checked</SourceChip>.</li>
            <li><strong className="text-on-surface">Pro Pass / Hall of Fame Pass.</strong> The premium season tracks are reported to include breakers among their rewards<SourceChip>community_unverified</SourceChip>.</li>
          </ul>
          <p className="text-body-md text-on-surface-variant">
            The exact earnable total shifts with seasons and patches, so we do not print a fixed count. What matters for planning is the shape: your supply is finite, it arrives over weeks, and some of it is locked to a discipline before you earn it.
          </p>
        </div>
      </section>

      <section id="planning-method" className="flex max-w-3xl flex-col gap-5">
        <SectionHeading>The Planning Method: Badge First, Breaker Last</SectionHeading>
        <p className="text-body-md text-on-surface-variant">Most breaker regret comes from planning in the wrong direction — attribute first, badge second. Flip it.</p>
        <div className="grid gap-4">
          <article className={cardClass}>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">Step 1: Set badge tier targets first</h3>
            <p>Pick the three to five badges your build cannot function without, and the tier each one needs. The <Link href="/badge-requirements" className={linkClass}>badge requirements table</Link> lists Bronze through Hall of Fame thresholds for all 53 badges, with AND/OR logic and height limits where they apply — cross-checked against two public reference tables, 212 of 212 cells matched<SourceChip>cross_checked</SourceChip>. This list is your breaker budget&apos;s reason to exist.</p>
          </article>
          <article className={cardClass}>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">Step 2: Measure the gap</h3>
            <p>For each target, subtract your build&apos;s attribute cap from the requirement. If your body caps Driving Dunk below the threshold your dunk badge wants, the difference is what breakers would need to cover. No gap, no breaker — an attribute that already meets its target&apos;s requirement has nothing to gain here.</p>
          </article>
          <article className={cardClass}>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">Step 3: The unlock test</h3>
            <p>Here is the question that decides whether a breaker is worth spending: <em>does this breaker cross a threshold?</em> A breaker that carries an attribute across a badge tier requirement converts a locked badge into an inventory item — that is value. A breaker that nudges a rating you already planned to max, without crossing any tier, is a permanent spend for a marginal gain. Breakers are a targeting tool, not a power-up.</p>
          </article>
          <article className={cardClass}>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">Step 4: Count breakers with the in-game preview</h3>
            <p>Per-breaker gain values are shown in the in-game 99 OVR preview and are pending verification on this site — we list no numbers until collection and double-checking are done. So the count happens in-game: open the preview, see what each breaker adds to the attribute from Step 2, and count how many breakers close the gap<SourceChip pending>pending</SourceChip>. If the gap needs more than five, the plan needs a new body or a new badge target, not more hope.</p>
          </article>
          <article className={cardClass}>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">Step 5: Sequence with Synergy</h3>
            <p>Breakers and Synergy solve different halves of the same plan. Breakers raise attributes toward a threshold; pushing a badge beyond its normal cap up to Legend requires the Synergy system — Fuse and Reaction<SourceChip>2K-published</SourceChip>. A common pattern: breakers to reach a Gold or Hall of Fame requirement, then Synergy to carry the badge to Legend. Budget both steps or neither.</p>
            <p className="mt-3">You can rehearse the whole sequence in the <Link href="/cap-breakers" className={linkClass}>cap breaker preview tool</Link>: pick an attribute, set your current value, add up to five breakers, and watch which badge tiers come into reach — then confirm the exact gains in the in-game preview before you commit anything.</p>
          </article>
        </div>
      </section>

      <section id="worth-it" className="flex max-w-3xl flex-col gap-4">
        <SectionHeading>Are Cap Breaker Builds Worth It in 2K27?</SectionHeading>
        <p className="text-body-md text-on-surface-variant">Worth it, when the build is a <em>plan</em> and the breakers are the last mile. A build that maps its badge targets, finds two or three gaps it cannot close at creation, and reserves breakers exactly for those gaps is using the system as designed — five per attribute is plenty when every one of them crosses a threshold.</p>
        <p className="text-body-md text-on-surface-variant">Not worth it, when &quot;cap breaker build&quot; means a rating that only works after breakers you have not earned yet. Three warning signs:</p>
        <ol className="grid gap-3">
          <li className={cardClass}><strong className="text-on-surface">1. The plan needs breakers you cannot name a source for.</strong> Supply is finite and partly discipline-locked. If the spreadsheet assumes ten breakers and you can list sources for six, the plan has a hole.</li>
          <li className={cardClass}><strong className="text-on-surface">2. The breakers cross no threshold.</strong> Ratings without a badge, animation, or Takeover requirement behind them are decoration.</li>
          <li className={cardClass}><strong className="text-on-surface">3. The plan was copied.</strong> Someone else&apos;s breaker map was built against their body caps, their targets, their modes. Permanence does not care that it worked for a video.</li>
        </ol>
        <p className="text-body-md text-on-surface-variant">The honest verdict: cap breakers are the highest-leverage permanent resource in the builder, and the least forgiving. Builds that earn the label &quot;worth it&quot; are the ones where every breaker has a threshold attached to it before it has a home.</p>
      </section>

      <section id="mistakes" className="flex max-w-3xl flex-col gap-4">
        <SectionHeading>Cap Breaker Mistakes to Avoid</SectionHeading>
        <ol className="grid gap-3">
          <li className={cardClass}><strong className="text-on-surface">1. Spending before planning.</strong> Permanence is the whole risk profile<SourceChip>cross_checked</SourceChip>. No breaker should be applied before the badge target list exists.</li>
          <li className={cardClass}><strong className="text-on-surface">2. Stacking five into one attribute that crosses nothing.</strong> The five-per-attribute limit<SourceChip>cross_checked</SourceChip> makes this mistake expensive and common at the same time.</li>
          <li className={cardClass}><strong className="text-on-surface">3. Forgetting the discipline lock.</strong> Specialization-earned breakers are reported to be restricted to their track&apos;s category or Physicals<SourceChip>community_unverified</SourceChip>. Count them only toward gaps they are allowed to fill.</li>
          <li className={cardClass}><strong className="text-on-surface">4. Planning around unverified gain numbers.</strong> Early tables disagree, and per-breaker gains are pending verification on this site. The in-game 99 OVR preview is the source of truth until collection completes.</li>
          <li className={cardClass}><strong className="text-on-surface">5. Treating supply as unlimited.</strong> Season, Crew, and pass rewards arrive over weeks<SourceChip>community_unverified</SourceChip>. A week-one breaker spend is a week-eight breaker you no longer have.</li>
          <li className={cardClass}><strong className="text-on-surface">6. Skipping the preview.</strong> The builder and the companion app both preview boosts at 99 OVR<SourceChip>2K-published</SourceChip>. Five minutes of preview beats one permanent mistake.</li>
        </ol>
      </section>

      <section id="practice" className="flex max-w-3xl flex-col gap-4">
        <SectionHeading>Plan It Before You Spend It</SectionHeading>
        <p className="text-body-md text-on-surface-variant">Reading about breakers is the warm-up. The rep is rehearsing the spend:</p>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-body-md text-on-surface-variant">
          <li>Open the <Link href="/cap-breakers" className={linkClass}>cap breaker preview tool</Link> and pick the attribute your gap lives in.</li>
          <li>Check the target tier on the <Link href="/badge-requirements" className={linkClass}>badge requirements table</Link> so the goal is a threshold, not a vibe.</li>
          <li>Add breakers one at a time — up to five — and stop where a tier unlocks.</li>
          <li>Run the same targets through the <Link href="/badge-token-planner" className={linkClass}>badge token planner</Link>: meeting a requirement stocks your inventory, but tokens are what equip the badge<SourceChip>2K-published</SourceChip>.</li>
          <li>Save the plan, then confirm every gain in the in-game 99 OVR preview before applying anything in-game.</li>
        </ol>
        <p className="text-body-md text-on-surface-variant">The tool shows reach, not gospel: exact per-breaker gains live in the in-game preview and are pending verification here, and this page gets updated when collection completes. Last verified: {LAST_VERIFIED}.</p>
        <p className="text-body-md text-on-surface-variant">My2KBuilder is an independent, unofficial planning tool — not affiliated with 2K, Visual Concepts, or Take-Two. The game builder lives in-game and in the companion app; this site exists so your breaker decisions happen before your attributes do.</p>
      </section>

      <section id="faq" className="flex max-w-3xl flex-col gap-4">
        <SectionHeading>Cap Breaker Planning FAQ</SectionHeading>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, index) => (
            <details key={faq.question} className="group rounded border border-border-low bg-surface-card p-4">
              <summary className="cursor-pointer list-none text-label-md text-on-surface group-open:text-primary-container">{faq.question}</summary>
              <p className="mt-2 text-body-md text-on-surface-variant">
                {index === 4 ? (
                  <>In-game: once your build reaches 99 OVR, the builder previews each breaker&apos;s boost per attribute, and the companion app offers the same preview<SourceChip>2K-published</SourceChip>. On this site: the <Link href="/cap-breakers" className={linkClass}>cap breaker preview tool</Link> lets you test how many breakers an attribute can take and which badge tiers come into reach. Exact per-breaker gain values are pending verification here — no estimates, no placeholders.</>
                ) : faq.answer}
              </p>
            </details>
          ))}
        </div>
        <p className="text-body-sm text-text-muted">Last verified: {LAST_VERIFIED}</p>
      </section>
    </main>
  );
}
