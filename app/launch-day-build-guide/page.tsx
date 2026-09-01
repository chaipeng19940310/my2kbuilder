import type { Metadata } from "next";
import Link from "next/link";
import { GuideToc } from "@/components/GuideToc";
import { JsonLdScript } from "@/components/JsonLdScript";
import { canonicalFor } from "@/lib/canonical";
import { socialMeta } from "@/lib/social";
import { articleSchema, breadcrumbSchema, faqPageSchema } from "@/lib/schema";

const PAGE_PATH = "/launch-day-build-guide";
const PAGE_TITLE = "NBA 2K27 Launch Day Build Checklist | My2KBuilder";
const PAGE_DESCRIPTION =
  "Your NBA 2K27 launch day build checklist: five steps, the first job at every position, and a badge token budget for 53 badges and 20 slots.";
const PAGE_H1 = "NBA 2K27 Launch Day Build Guide";
const LAST_VERIFIED = "2026-09-01";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalFor(PAGE_PATH) },
  ...socialMeta({ path: PAGE_PATH, title: PAGE_TITLE, description: PAGE_DESCRIPTION }),
};

const FAQS = [
  {
    question: "What should I do first on NBA 2K27 launch day?",
    answer:
      "Set your position and body settings before anything else. Height and position now decide which badges are available to you and how much they cost in tokens, so they are budget decisions, not just attribute decisions. Then lock three to five core badges, budget your tokens, plan Hall of Fame before Legend, and test-fit the plan before spending.",
  },
  {
    question: "How many badges and badge slots does NBA 2K27 have?",
    answer:
      "53 badges — including 19 new ones — competing for 20 equip slots, spread across 6 disciplines including the new Physicals discipline. The badge list and slot count are 2K-published.",
  },
  {
    question: "Do badge token costs really change with height and position?",
    answer:
      "Yes. 2K confirms that Badge Token costs vary by height and position and that the builder recalculates them live as you adjust your build. The same badge can price differently on two different bodies, so a badge loadout is a token budget, not a fixed sheet.",
  },
  {
    question: "Why doesn't this guide list actual token cost numbers?",
    answer:
      "Token costs pending — 2K has not published a full cost table, and no public source carries the complete cost matrix. Instead of printing unverified numbers, we built the badge token planner so you can test-fit your allocation at your exact height and position. Costs will be added to the tool once collection is complete.",
  },
  {
    question: "Is My2KBuilder the official 2K planner?",
    answer:
      "No. My2KBuilder is an independent, unofficial web tool for planning Badge Token allocations and comparing blueprints. It is not affiliated with 2K, Visual Concepts, or Take-Two. The official builder lives in the 2K HQ App and in-game.",
  },
] as const;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-headline-md text-on-surface">{children}</h2>;
}

function SourceChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1 inline-flex items-center rounded border border-secondary-container px-1.5 py-0.5 align-middle text-[10px] font-semibold tracking-wide text-secondary">
      {children}
    </span>
  );
}

const cardClass = "rounded border border-border-low bg-surface-card p-4 text-body-md text-on-surface-variant";
const linkClass = "font-semibold text-primary-container hover:underline";

export default function LaunchDayBuildGuidePage() {
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
            { name: "Launch Day Build Guide", path: PAGE_PATH },
          ]),
        ]}
      />

      <GuideToc
        items={[
          { href: "#checklist", label: "Launch Day Checklist" },
          { href: "#positions", label: "First Job by Position" },
          { href: "#token-budget", label: "Token Budget" },
          { href: "#pitfalls", label: "Pitfalls" },
          { href: "#practice", label: "Put It Into Practice" },
          { href: "#faq", label: "FAQ" },
        ]}
      />

      <header className="flex max-w-3xl flex-col gap-5">
        <span className="w-fit rounded-full border border-primary-container/40 bg-surface-card px-3 py-1 text-code-sm uppercase tracking-widest text-primary-container">
          Launch day checklist
        </span>
        <h1 className="font-display text-display-lg text-primary-container">{PAGE_H1}</h1>
        <div className="rounded border border-primary-container/40 bg-surface-card p-5">
          <p className="mb-3 text-body-lg text-on-surface">Launch day is not the time to freestyle a build. Run this checklist before you spend:</p>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-body-md text-on-surface-variant">
            <li>Set position and body first — height is a budget decision now.</li>
            <li>Lock three to five core badges against their requirements.</li>
            <li>Budget your tokens — 53 badges, 20 slots, costs that move.</li>
            <li>Plan Hall of Fame first; Legend is a second spend.</li>
            <li>Test-fit the plan, save it, keep flex slots in reserve.</li>
          </ol>
          <p className="mt-3 text-body-md text-on-surface">Every step explained below.</p>
        </div>
        <Link href="/badge-token-planner" className="w-fit rounded bg-primary-container px-5 py-3 font-semibold text-on-primary-container transition hover:brightness-110">
          Test-fit your Badge Token plan
        </Link>
        <p className="text-body-sm text-text-muted">Last verified: {LAST_VERIFIED}</p>
      </header>

      <section id="checklist" className="flex max-w-3xl flex-col gap-6">
        <SectionHeading>The Launch Day Build Checklist</SectionHeading>
        <div className="grid gap-4">
          <article className={cardClass}>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">Step 1: Set your position and body first</h3>
            <p>In older 2K games, body settings were mostly an attribute decision. In NBA 2K27 they are a badge decision too. Some badges carry maximum height limits, others carry minimum height floors, so the height you pick opens one shelf of badges and closes another<SourceChip>cross_checked</SourceChip>. And Badge Token costs vary with height and position, recalculating live as you adjust your build<SourceChip>2K-published</SourceChip>. Pick your position, then test height, weight, and wingspan in the builder before you touch a single attribute.</p>
          </article>
          <article className={cardClass}>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">Step 2: Lock three to five core badges</h3>
            <p>Not the twenty you&apos;d enjoy having — the three to five your build cannot function without. For each one, check the requirement that puts it in your inventory: some badges ask for a single attribute, some accept either of two (OR), and some demand two attributes together (AND)<SourceChip>cross_checked</SourceChip>. An AND badge is the trap: one attribute short and the badge never enters your inventory at all. The <Link href="/badge-requirements" className={linkClass}>badge requirements table</Link> lists Bronze through Hall of Fame thresholds for all 53 badges, with AND/OR logic and height limits where they apply, cross-checked against two public reference tables (212 of 212 cells matched).</p>
          </article>
          <article className={cardClass}>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">Step 3: Budget your Badge Tokens</h3>
            <p>Attribute requirements put a badge in your inventory; Badge Tokens are what equip it — 53 badges competing for 20 slots across 6 disciplines<SourceChip>2K-published</SourceChip>. A badge list tells you what you qualify for, not what you can afford. This step is the heart of the guide, and it gets its own chapter below.</p>
          </article>
          <article className={cardClass}>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">Step 4: Plan Hall of Fame first, Legend through Synergy</h3>
            <p>Legend is not a tier your attributes can unlock at creation. Meet the Hall of Fame requirement first; pushing a badge beyond its normal cap up to Legend requires the Synergy system — Fuse and Reaction mechanics that boost badges already in your build<SourceChip>2K-published</SourceChip>. If a badge only matters to you at Legend, budget for both steps or cut it from the core list.</p>
          </article>
          <article className={cardClass}>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">Step 5: Test-fit, save, and keep flex slots</h3>
            <p>Do not allocate all 20 slots on paper. Leave two to four slots unassigned as flex space — costs move, and the badge you assumed was cheap can price differently on your body. Then test-fit the whole plan in the <Link href="/badge-token-planner" className={linkClass}>badge token planner</Link> at your exact height and position, and save it as a share link so you can re-test it when cost data lands.</p>
          </article>
        </div>
      </section>

      <section id="positions" className="flex max-w-3xl flex-col gap-5">
        <SectionHeading>The First Job at Every Position</SectionHeading>
        <p className="text-body-md text-on-surface-variant">Every position&apos;s first job is a different version of the same question: which badges does your body keep open? No attribute numbers here — those are your call to make in the builder. This is the order to make them in.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <article className={cardClass}>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">Point Guard</h3>
            <p>Several ball-handling and playmaking badges carry maximum height limits<SourceChip>cross_checked</SourceChip> — every inch you add closes part of that shelf. So a point guard&apos;s first job is not picking animations; it is deciding which playmaking badges are core, then finding the tallest height that keeps every one of them available. Height is a badge-gate decision before it is anything else.</p>
          </article>
          <article className={cardClass}>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">Shooting Guard</h3>
            <p>Across the 53-badge roster, requirements come in three shapes: single-attribute checks, OR pairs, and AND pairs<SourceChip>cross_checked</SourceChip>. A shooting guard&apos;s first job is to list the shooting core and read each badge&apos;s logic — because an AND pair means two attributes must climb together, and budgeting for one while ignoring the other strands the badge outside your inventory.</p>
          </article>
          <article className={cardClass}>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">Small Forward</h3>
            <p>Your 20 slots spread across 6 disciplines, including the new Physicals discipline<SourceChip>2K-published</SourceChip>. A two-way wing cannot max both sides of the ball inside one budget — the math does not allow it. The first job is choosing: which side gets the core badges, and which side gets the leftovers. Make that call on purpose, not by accident in week two.</p>
          </article>
          <article className={cardClass}>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">Power Forward</h3>
            <p>Paint, post, and rebounding badges carry minimum height floors; perimeter and ball-handling badges carry maximum height caps<SourceChip>cross_checked</SourceChip>. A power forward sits exactly where those two walls meet. The first job is the identity call — interior or stretch — because that call, not the height slider, should be what sets your height.</p>
          </article>
          <article className={`${cardClass} md:col-span-2`}>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">Center</h3>
            <p>Interior badges are the most gated group on the roster: several combine minimum height floors with AND multi-attribute requirements<SourceChip>cross_checked</SourceChip>. A center&apos;s first job is to anchor on those badges first — confirm the height floor, then confirm both attributes can climb together — and only then fill the rest of the budget around them. Check the new Physicals discipline while you are there; it is part of the 2K27 badge map<SourceChip>2K-published</SourceChip>.</p>
          </article>
        </div>
      </section>

      <section id="token-budget" className="flex max-w-3xl flex-col gap-6">
        <SectionHeading>Badge Token Budget Planning</SectionHeading>
        <p className="text-body-lg text-on-surface-variant">This is the chapter most launch guides skip — and the one that decides whether your build works in week one.</p>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-headline-sm text-on-surface">The three numbers that define your budget</h3>
          <p className="text-body-md text-on-surface-variant">Everything comes back to three 2K-published numbers:</p>
          <ul className="grid gap-3 sm:grid-cols-3">
            <li className={cardClass}><strong className="block font-display text-3xl text-primary-container">53</strong><strong className="text-on-surface">badges</strong> — the full roster, including 19 new to this year. Every badge you might want is in this pool, and the pool is bigger than your capacity by design.</li>
            <li className={cardClass}><strong className="block font-display text-3xl text-primary-container">20</strong><strong className="text-on-surface">slots</strong> — your hard ceiling. You cannot equip your way out of a bad plan; you can only re-budget.</li>
            <li className={cardClass}><strong className="block font-display text-3xl text-primary-container">6</strong><strong className="text-on-surface">disciplines</strong> — including the new Physicals discipline. Your slots spread across all six, so balance is part of the budget.</li>
          </ul>
          <p className="text-body-md text-on-surface-variant">53 into 20 is the whole problem. Roughly three badges compete for every slot you own — before token costs enter the picture at all.</p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-headline-sm text-on-surface">Costs move with your height and position</h3>
          <p className="text-body-md text-on-surface-variant">2K has confirmed that Badge Token costs vary by height and position, and that the builder recalculates cost in real time<SourceChip>2K-published</SourceChip>. What 2K has not published is the cost matrix itself — no official table of position-by-height-by-badge-by-tier prices exists.</p>
          <p className="text-body-md text-on-surface-variant">So treat cost as a range, not a number:</p>
          <ol className="grid gap-3">
            <li className={cardClass}><strong className="text-on-surface">1. The same badge can price differently on two different bodies.</strong> A budget that works on your friend&apos;s build may not fit yours.</li>
            <li className={cardClass}><strong className="text-on-surface">2. Changing your body settings mid-plan can move the prices.</strong> Height and position are not just attribute decisions anymore; they are budget decisions.</li>
            <li className={cardClass}><strong className="text-on-surface">3. Early plans need margin.</strong> If your plan only works when every cost lands at the low end of its range, it is not a plan — it is a hope.</li>
          </ol>
          <p className="rounded border border-primary-container/40 bg-surface-card p-5 text-body-md text-on-surface-variant">This is exactly why we built the planner around trial fitting instead of fixed numbers. Open the <Link href="/badge-token-planner" className={linkClass}>badge token planner</Link>, set your height and position, and test-fit your loadout against the live cost behavior before you commit anything in-game.</p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-headline-sm text-on-surface">Lock your core, keep your flex</h3>
          <p className="text-body-md text-on-surface-variant">Start with the three to five core badges from Step 2 and verify each against the <Link href="/badge-requirements" className={linkClass}>requirements table</Link>. Then fill toward your slots — but stop short of 20. Keep two to four flex slots in reserve. Costs move, patches land, and flex slots are how a budget absorbs surprises without tearing down the core. If your plan needs all 20 slots to work at all, your plan has no slack — and no slack is the most common way 2K27 builds break in week one.</p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-headline-sm text-on-surface">Expect the cost curve to move</h3>
          <p className="text-body-md text-on-surface-variant">Because token costs shift with height and position and recalculate live<SourceChip>2K-published</SourceChip>, your budget is not finished when the badge list is finished. Re-test the same loadout at your exact body settings, and re-test it again if you adjust height even an inch. Until the full cost table is published, every number-free plan should carry the same assumption: real costs may land higher than expected. Budget for the high side and be pleasantly surprised, not the reverse.</p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-headline-sm text-on-surface">Hall of Fame first, Legend through Synergy</h3>
          <p className="text-body-md text-on-surface-variant">In budget terms, Legend is a second spend stacked on top of the first. Meet the Hall of Fame requirement, then invest through Synergy — Fuse and Reaction — to push the badge up to Legend<SourceChip>2K-published</SourceChip>. If a badge only matters to you at Legend, budget for the Hall of Fame unlock <em>and</em> the Synergy investment, or cut it from the core list.</p>
          <p className="text-body-md text-on-surface-variant">One more long-term input: Rebirth runs four tiers, and each tier unlocks a default Badge Token ratio<SourceChip>2K-published</SourceChip>. If you plan to rebirth, your second build&apos;s budget starts from a different baseline than your first — worth knowing before you treat build one as disposable.</p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-headline-sm text-on-surface">Why there are no token cost numbers in this guide</h3>
          <p className="text-body-md text-on-surface-variant">You may have noticed this guide quotes no prices. That is a decision, not an omission. Token costs pending — 2K has not published a full cost table, and no public source carries the complete position-by-height cost matrix. Rather than print community-rumored numbers that may be wrong for your build, we show no numbers at all — and we built the planner so you can test-fit your own allocation instead of trusting someone else&apos;s table. When collection completes, the numbers land in the tool first, and this guide gets updated to match.</p>
        </div>
      </section>

      <section id="pitfalls" className="flex max-w-3xl flex-col gap-4">
        <SectionHeading>Launch-Day Pitfalls to Avoid</SectionHeading>
        <p className="text-body-md text-on-surface-variant">Five ways first builds go wrong — each one avoidable with the checklist above:</p>
        <ol className="grid gap-3">
          <li className={cardClass}><strong className="text-on-surface">1. Copying a 2K26 build wholesale.</strong> The surface looks familiar, but the rules underneath changed; our <Link href="/2k26-to-2k27-build-pitfalls" className={linkClass}>2K26-to-2K27 pitfalls guide</Link> documents the reworked body penalties and moved thresholds, with third-party findings labeled Unverified.</li>
          <li className={cardClass}><strong className="text-on-surface">2. Planning badges without planning tokens.</strong> Attribute requirements stock your inventory; tokens equip it<SourceChip>2K-published</SourceChip>. A badge list is half a plan.</li>
          <li className={cardClass}><strong className="text-on-surface">3. Filling all 20 slots on paper.</strong> No flex means the first repricing breaks the build.</li>
          <li className={cardClass}><strong className="text-on-surface">4. Chasing Legend at creation.</strong> Legend requires Synergy on top of Hall of Fame<SourceChip>2K-published</SourceChip> — budget for both steps or neither.</li>
          <li className={cardClass}><strong className="text-on-surface">5. Assuming a copied badge list survives your height.</strong> Height gates run in both directions<SourceChip>cross_checked</SourceChip>. Re-check every core badge at your exact height.</li>
        </ol>
      </section>

      <section id="practice" className="flex max-w-3xl flex-col gap-4">
        <SectionHeading>Put the Plan Into Practice</SectionHeading>
        <p className="text-body-md text-on-surface-variant">Reading about budgets is the warm-up. The rep is doing it:</p>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-body-md text-on-surface-variant">
          <li>Open the <Link href="/badge-token-planner" className={linkClass}>badge token planner</Link> and set your position, height, and discipline spread.</li>
          <li>Add your core badges — three to five, no more — and check them against the <Link href="/badge-requirements" className={linkClass}>requirements table</Link>.</li>
          <li>Fill toward your slots, but stop short of 20. Keep your flex reserve.</li>
          <li>Save the plan as a share link so you can re-test it when cost data lands.</li>
        </ol>
        <p className="text-body-md text-on-surface-variant">Not sure what a coherent build looks like yet? Start from a <Link href="/signature-blueprints" className={linkClass}>Signature Blueprint</Link> — 40 three-player hybrid templates, with new blueprints added each season<SourceChip>2K-published</SourceChip> — then adjust the badge budget to your own body settings instead of starting from a blank page.</p>
        <p className="text-body-md text-on-surface-variant">My2KBuilder is an independent, unofficial planning tool — not affiliated with 2K, Visual Concepts, or Take-Two. The game builder lives in the 2K HQ App and in-game; this site exists so your token decisions happen before your points do.</p>
      </section>

      <section id="faq" className="flex max-w-3xl flex-col gap-4">
        <SectionHeading>Launch Day Build FAQ</SectionHeading>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, index) => (
            <details key={faq.question} className="group rounded border border-border-low bg-surface-card p-4">
              <summary className="cursor-pointer list-none text-label-md text-on-surface group-open:text-primary-container">{faq.question}</summary>
              <p className="mt-2 text-body-md text-on-surface-variant">
                {index === 3 ? (
                  <>Token costs pending — 2K has not published a full cost table, and no public source carries the complete cost matrix. Instead of printing unverified numbers, we built the <Link href="/badge-token-planner" className={linkClass}>badge token planner</Link> so you can test-fit your allocation at your exact height and position. Costs will be added to the tool once collection is complete.</>
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
