import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/JsonLdScript";
import { canonicalFor } from "@/lib/canonical";
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
};

// FAQ freeze (copy §5.2). The cost-provenance FAQ stays offline until the
// cost matrix freeze v0 ships (contract §8.1 hard gate).
const FAQS = [
  {
    question: "Why do token costs change when I change height?",
    answer:
      "That's how NBA 2K27 works: badge token costs vary by height and position. The planner mirrors that so you can see the trade-offs before spending in-game.",
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
            the moment an allocation goes over budget or breaks a badge combination rule — before
            you lock anything in-game.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded border border-border-low bg-surface-card p-6">
          <h2 className="font-display text-headline-sm text-on-surface">Why Token Costs Move</h2>
          <p className="text-body-md text-on-surface-variant">
            Token costs in NBA 2K27 are not flat: the same badge can cost more or less depending on
            your height and position. That is an officially confirmed mechanic, and the planner
            mirrors it — change your height and every badge&apos;s cost updates live, so the
            trade-offs are visible while you plan instead of after you spend. Values shown right
            now are labeled fixture placeholders while our HQ App collection and dual review
            finish; the mechanic itself is real.
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
