import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/JsonLdScript";
import { canonicalFor } from "@/lib/canonical";
import { socialMeta } from "@/lib/social";
import { breadcrumbSchema, faqPageSchema, itemListSchema } from "@/lib/schema";
import { blueprintList, type BlueprintsBundle } from "@/lib/data";
import blueprintsBundle from "@/public/data/blueprints.v1.json";
import { BlueprintsClient } from "./BlueprintsClient";

// SEO freeze (seo §3): title/H1/meta for `/signature-blueprints`.
export const metadata: Metadata = {
  title: "NBA 2K27 Signature Blueprints — Browse & Compare 40 Builds",
  description:
    "Browse all 40 Signature Blueprints in NBA 2K27, compare up to 3 side by side, then open one in the Badge Token Planner. Free, unofficial, no sign-up.",
  alternates: { canonical: canonicalFor("/signature-blueprints") },
  ...socialMeta({
    path: "/signature-blueprints",
    title: "NBA 2K27 Signature Blueprints — Browse & Compare 40 Builds",
    description:
      "Browse all 40 Signature Blueprints in NBA 2K27, compare up to 3 side by side, then open one in the Badge Token Planner. Free, unofficial, no sign-up.",
  }),
};

// FAQ freeze (copy §5.3). R12I-A: data-provenance answer updated for the real
// production bundle — unverified fields are labeled, never presented as fact.
const FAQS = [
  {
    question: "What is a Signature Blueprint?",
    answer:
      "A ready-made MyPLAYER template in NBA 2K27 that blends the playstyles of three players. There are 40 at launch, with more added each season.",
  },
  {
    question: "Are these the same as last year's templates?",
    answer:
      "No. Signature Blueprints replace the Pro-Tuned and NBA templates from previous years.",
  },
  {
    question: "Can I edit a blueprint?",
    answer:
      "Yes. Open any blueprint in the Badge Token Planner and adjust the allocation for your height and position.",
  },
  {
    question: "Where does blueprint data come from?",
    answer:
      "The 40-template count, the three-player blend mechanism, and Bulldozer's blend are described on 2K's builder pages. Every other blueprint's name, blend, and profile fields come from a single public community source and are labeled Unverified per item — never shown as fact.",
  },
] as const;

// R12I-A: real blueprint names power the ItemList schema (the contract §8.1
// gate was lifted for the real-name roster per owner decision
// r12i-wave1-owner-decision-2026-08-28).
const BLUEPRINTS = blueprintList(blueprintsBundle as BlueprintsBundle);

export default function SignatureBlueprintsPage() {
  return (
    <main className="r18-page r18-cards relative z-10 mx-auto flex w-full max-w-site flex-grow flex-col gap-12 px-4 py-12 md:px-margin-desktop">
      <JsonLdScript
        schema={[
          itemListSchema({
            name: "NBA 2K27 Signature Blueprints",
            items: BLUEPRINTS.map((bp) => ({
              name: bp.name,
              path: canonicalFor(`/signature-blueprints#bp-${bp.slug}`),
            })),
          }),
          faqPageSchema([...FAQS]),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Signature Blueprints", path: "/signature-blueprints" },
          ]),
        ]}
      />

      <header className="flex max-w-3xl flex-col gap-4">
        <h1 className="font-display text-display-lg text-primary-container">
          NBA 2K27 Signature Blueprints
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Signature Blueprints are NBA 2K27&apos;s new starter templates: 40 three-player hybrid
          builds at launch, with more added each season. Filter by position and playstyle,
          shortlist up to three, and see exactly how their attributes and badges differ.
        </p>
      </header>

      {/* H2 structure (copy §3.3): Browse All 40 Blueprints / Compare Up to 3 Side by Side */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-headline-md text-on-surface">Browse All 40 Blueprints</h2>
          {/* R12J-E mutual link: guided by-position view */}
          <span className="text-body-sm text-text-muted">
            Compare up to 3 side by side ·{" "}
            <Link href="/signature-blueprints/by-position" className="text-primary-container hover:underline">
              Browse by position
            </Link>
          </span>
        </div>
        <BlueprintsClient bundle={blueprintsBundle as BlueprintsBundle} />
      </section>

      {/* About blueprint data (R12I-A: source annotation for the real bundle) */}
      <section className="flex max-w-3xl flex-col gap-3 rounded border border-border-low bg-surface-card p-6">
        <h2 className="font-display text-headline-sm text-on-surface">About blueprint data</h2>
        <p className="text-body-md text-on-surface-variant">
          Blueprint cards show the real 40-template launch roster. The template count, the
          three-player blend mechanism, and Bulldozer&apos;s blend (LeBron James, Pascal Siakam,
          Scottie Barnes) are described on 2K&apos;s builder pages. Every other blueprint&apos;s
          name, player blend, and profile fields (position, height, attributes, badge unlocks) come
          from a single public community source and are labeled Unverified per item — labeled,
          never presented as fact.
        </p>
      </section>

      {/* FAQ at page bottom (copy §3.3). Content from the copy freeze only. */}
      <section className="flex max-w-3xl flex-col gap-4">
        <h2 className="font-display text-headline-md text-on-surface">Signature Blueprints FAQ</h2>
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
