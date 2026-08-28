import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ContentPanel } from "@/components/ContentPanel";
import { JsonLdScript } from "@/components/JsonLdScript";
import { canonicalFor } from "@/lib/canonical";
import { socialMeta } from "@/lib/social";
import { webPageSchema } from "@/lib/schema";

// R10.1 finalized copy (compliance/legal-pages-final-v1.md §2.1).
// Finalized in R10.2 per owner decision; keep this page free of provisional-language notices.
export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "My2KBuilder is an independent, fan-made NBA 2K27 build planner. Not affiliated with or endorsed by 2K, Visual Concepts, Take-Two, the NBA, or any players association.",
  alternates: { canonical: canonicalFor("/disclaimer") },
  ...socialMeta({
    path: "/disclaimer",
    title: "Disclaimer",
    description:
      "My2KBuilder is an independent, fan-made NBA 2K27 build planner. Not affiliated with or endorsed by 2K, Visual Concepts, Take-Two, the NBA, or any players association.",
  }),
};

export default function DisclaimerPage() {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-grow flex-col gap-8 px-4 py-12 md:px-margin-desktop">
      <JsonLdScript schema={webPageSchema({ name: "Disclaimer" })} />

      {/* R12K-J: unified dark panel (site card spec) around all content. */}
      <ContentPanel>
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-display-lg text-primary-container">Disclaimer</h1>
        <p className="text-body-sm text-text-muted">Last Updated: August 24, 2026</p>
      </header>

      <p className="text-body-lg text-on-surface">
        My2KBuilder is an unofficial, fan-made tool for planning and comparing NBA 2K27 MyPLAYER
        builds. It is not affiliated with, endorsed by, sponsored by, or connected to 2K Games,
        Visual Concepts, Take-Two Interactive Software, Inc., the National Basketball Association
        (NBA), the Women&apos;s National Basketball Association (WNBA), NBA Properties, Inc., the
        National Basketball Players Association (NBPA), or the Women&apos;s National Basketball
        Players Association (WNBPA).
      </p>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-headline-md text-on-surface">Trademarks</h2>
        <p className="text-body-md text-on-surface-variant">
          All game-related names, marks, logos, mechanics, badges, and terminology — including but
          not limited to &quot;NBA 2K27,&quot; &quot;MyPLAYER,&quot; &quot;MyCAREER,&quot;
          &quot;Badge Tokens,&quot; &quot;Signature Blueprints,&quot; &quot;Synergy,&quot;
          &quot;Takeover,&quot; and &quot;The City&quot; — are trademarks, service marks, and/or
          copyrighted materials of their respective owners. Their use on this site is for
          informational and descriptive purposes only.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-headline-md text-on-surface">No Official Assets</h2>
        <p className="text-body-md text-on-surface-variant">
          This site does not use official NBA 2K27 screenshots, logos, player photos, team logos,
          league logos, or other copyrighted artwork. All user-interface elements, icons, share
          cards, and graphics are original designs created for this tool.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-headline-md text-on-surface">Build Data</h2>
        <p className="text-body-md text-on-surface-variant">
          Build data shown here is compiled from publicly available official builder information,
          in-app observations, and community cross-checks. Values may change as the game is patched
          or updated. We make no guarantees about accuracy, completeness, or future compatibility.
          Always confirm final costs, caps, and mechanics in the official NBA 2K27 HQ app or
          official channels.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-headline-md text-on-surface">Free Planning Tool</h2>
        <p className="text-body-md text-on-surface-variant">
          This is a free planning tool. It is not the official NBA 2K HQ app and does not connect to
          your game account, console, or platform profile.
        </p>
      </section>

      <div className="flex items-start gap-2 rounded border border-outline-variant bg-surface-container-low p-3">
        <Icon name="warning" size={18} className="mt-0.5 shrink-0 text-primary-container" />
        <p className="text-body-sm text-on-surface-variant">
          We do not sell VC, accounts, boosting services, mods, hacks, or cheats, and we never ask
          for your game login or platform credentials.
        </p>
      </div>

      <p className="text-body-sm text-on-surface-variant">
        If you have questions or concerns about this disclaimer, contact: contact@my2kbuilder.com.
      </p>

      <div>
        <Link
          href="/badge-token-planner"
          className="inline-flex items-center gap-2 rounded border border-outline px-6 py-3 text-label-md font-bold text-on-surface transition-colors duration-200 hover:bg-surface-card"
        >
          <Icon name="arrow_back" size={16} />
          Back to Planner
        </Link>
      </div>
      </ContentPanel>
    </main>
  );
}
