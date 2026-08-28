import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/JsonLdScript";
import { canonicalFor } from "@/lib/canonical";
import { socialMeta } from "@/lib/social";
import {
  breadcrumbSchema,
  faqPageSchema,
  softwareApplicationSchema,
} from "@/lib/schema";
import { PlannerClient } from "./PlannerClient";

// SEO freeze (seo §3): title/H1/meta for `/badge-token-planner`.
export const metadata: Metadata = {
  title: "NBA 2K27 Badge Token Planner — 53 Badges, 20 Slots",
  description:
    "Allocate Badge Tokens across 20 slots, see how height and position change token costs, and catch conflicts before you lock a build. Free web tool, no download.",
  alternates: { canonical: canonicalFor("/badge-token-planner") },
  ...socialMeta({
    path: "/badge-token-planner",
    title: "NBA 2K27 Badge Token Planner — 53 Badges, 20 Slots",
    description:
      "Allocate Badge Tokens across 20 slots, see how height and position change token costs, and catch conflicts before you lock a build. Free web tool, no download.",
  }),
};

// FAQ freeze (copy §5.2). R12I-A: cost-provenance answer updated for the real
// production bundle — 2K has not published the cost table, so the planner
// labels costs as pending and shows real unlock requirements instead.
const FAQS = [
  {
    question: "Why do token costs change when I change height?",
    answer:
      "That's how NBA 2K27 works: badge token costs vary by height and position, a mechanic described on 2K's builder pages. The exact cost table has not been published, so the planner labels costs as pending and instead shows each badge's real attribute unlock requirements.",
  },
  {
    question: "Can I save my plan?",
    answer:
      "Yes — generate a share link and keep it. Opening that link restores the exact same allocation.",
  },
] as const;

export default function BadgeTokenPlannerPage() {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-site flex-grow flex-col gap-12 px-4 py-12 md:px-margin-desktop">
      <JsonLdScript
        schema={[
          softwareApplicationSchema({
            name: "NBA 2K27 Badge Token Planner",
            description:
              "Allocate Badge Tokens across 20 slots, see how height and position change token costs, and catch conflicts before you lock a build.",
            applicationCategory: "WebApplication",
          }),
          faqPageSchema([...FAQS]),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Badge Token Planner", path: "/badge-token-planner" },
          ]),
        ]}
      />

      <header className="flex max-w-3xl flex-col gap-4">
        <h1 className="font-display text-display-lg text-primary-container">
          NBA 2K27 Badge Token Planner
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          In NBA 2K27, every badge costs tokens — and the price changes with your height and
          position. Build your allocation here first, then spend with confidence in-game.
        </p>
      </header>

      {/* R16 (H2): pre-hydration interaction bridge. On slow networks React
          hydration lands seconds after first paint; this tiny parse-time
          script makes the two critical first interactions (position select,
          empty-state CTA guide) work before hydration, and hands any pending
          position to PlannerClient via window.__m2kPendingPos. It mutates no
          React-managed DOM (aria-pressed is only rendered by React once
          hydrated), so hydration stays clean. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){if(window.__m2kPlannerBoot)return;window.__m2kPlannerBoot=true;document.addEventListener("click",function(e){if(window.__m2kPlannerHydrated)return;var t=e.target;if(!t||!t.closest)return;var pos=t.closest("[data-m2k-pos]");if(pos){e.preventDefault();var all=document.querySelectorAll("[data-m2k-pos]");for(var i=0;i<all.length;i++)all[i].setAttribute("aria-pressed","false");pos.setAttribute("aria-pressed","true");window.__m2kPendingPos=pos.getAttribute("data-m2k-pos");return;}var guide=t.closest("[data-m2k-guide]");if(guide){e.preventDefault();var g=document.getElementById("planner-position-group");if(g&&g.scrollIntoView)g.scrollIntoView({behavior:"smooth",block:"start"});}},true);})();`,
        }}
      />

      {/* Tool body first (copy §3.2 design placement) */}
      <PlannerClient />

      {/* Explanatory sections below the tool (copy §3.2 H2 structure) */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-3 rounded border border-border-low bg-surface-card p-6">
          <h2 className="font-display text-headline-sm text-on-surface">Allocate Your 20 Badge Slots</h2>
          <p className="text-body-md text-on-surface-variant">
            NBA 2K27 gives every MyPLAYER 20 badge slots across 53 badges and six disciplines —
            Finishing, Shooting, Playmaking, Defense, Rebounding, and the new Physicals. Pick a
            position, set your height, rank the disciplines you care about, then assign slots
            badge by badge. The budget bar tracks every slot you spend, and the planner warns you
            the moment an allocation goes over budget — before you lock anything in-game.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded border border-border-low bg-surface-card p-6">
          <h2 className="font-display text-headline-sm text-on-surface">Why Token Costs Move</h2>
          <p className="text-body-md text-on-surface-variant">
            Token costs in NBA 2K27 are not flat: the same badge can cost more or less depending on
            your height and position — a mechanic described on 2K&apos;s builder pages. The exact
            cost table has not been published, so this planner shows no cost numbers: token costs
            pending — official values not published. What you can plan with today is real: the
            53-badge roster from 2K&apos;s published list, plus every badge&apos;s attribute unlock
            requirements cross-checked across two public community tables.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded border border-border-low bg-surface-card p-6">
          <h2 className="font-display text-headline-sm text-on-surface">Share Your Plan</h2>
          <p className="text-body-md text-on-surface-variant">
            A finished plan turns into a single link. The full allocation — position, height,
            discipline priorities, and badge slots — is encoded inside the link itself, so there is
            no account, no sign-up, and nothing stored on a server. Anyone who opens the link sees
            the exact same build, and you can keep editing from{" "}
            <Link href="/build-card" className="text-primary-container hover:underline">
              the build card
            </Link>{" "}
            or start over any time.
          </p>
        </div>
      </section>

      {/* FAQ at page bottom (copy §3.2). Content from the copy freeze only. */}
      <section className="flex max-w-3xl flex-col gap-4">
        <h2 className="font-display text-headline-md text-on-surface">Badge Token Planner FAQ</h2>
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
