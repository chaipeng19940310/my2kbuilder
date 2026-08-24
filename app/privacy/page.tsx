import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { JsonLdScript } from "@/components/JsonLdScript";
import { canonicalFor } from "@/lib/canonical";
import { webPageSchema } from "@/lib/schema";

// R10.1 finalized copy (compliance/legal-pages-final-v1.md §2.2).
// Finalized in R10.2 per owner decision; keep this page free of provisional-language notices.
export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "My2KBuilder has no accounts, no email sign-ups, and no payments. Build share links encode the build in the URL itself — nothing is stored on a server.",
  alternates: { canonical: canonicalFor("/privacy") },
};

const SECTIONS = [
  {
    title: "1. Information We Do Not Collect",
    body: "This MVP does not have accounts, email sign-ups, payments, or any form of user authentication. We do not collect your name, email address, phone number, mailing address, payment details, game credentials, platform account, or any other personal information.",
  },
  {
    title: "2. Information We Do Collect",
    body: "We do not actively collect information about you. The site operates as a static planning tool in your browser. If you copy a share link, your current build state is encoded directly into the URL itself. The link is generated and stored entirely on your device. We do not receive, store, or process the build data contained in the link on our servers.",
  },
  {
    title: "3. Analytics and Tracking",
    body: "This MVP does not use analytics, advertising, or tracking cookies. We do not use Google Analytics, Meta Pixel, Clarity, or similar tracking services. If privacy-respecting analytics are added in the future, this policy will be updated before they are enabled.",
  },
  {
    title: "4. Third-Party Services",
    body: "The site is served through Cloudflare's edge network. No personal data is sent to third parties for processing, marketing, or analytics.",
  },
  {
    title: "5. Cookies",
    body: "This MVP does not use advertising or tracking cookies. Only cookies that are strictly necessary for the site to function may be used.",
  },
  {
    title: "6. Children's Privacy",
    body: "This site is not directed to children under 13, and we do not knowingly collect personal information from children.",
  },
  {
    title: "7. Changes to This Policy",
    body: 'We may update this Privacy Policy from time to time. The "Last Updated" date at the top of this page reflects the most recent revision.',
  },
  {
    title: "8. Contact",
    body: "For privacy questions or to exercise any data rights, contact: contact@my2kbuilder.com.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-grow flex-col gap-8 px-4 py-12 md:px-margin-desktop">
      <JsonLdScript schema={webPageSchema({ name: "Privacy Policy" })} />

      <header className="flex flex-col gap-3">
        <h1 className="font-display text-display-lg text-primary-container">Privacy Policy</h1>
        <p className="text-body-sm text-text-muted">Last Updated: August 24, 2026</p>
      </header>

      <div className="flex flex-col gap-6">
        {SECTIONS.map((s) => (
          <section key={s.title} className="flex flex-col gap-3">
            <h2 className="font-display text-headline-md text-on-surface">{s.title}</h2>
            <p className="text-body-md text-on-surface-variant">{s.body}</p>
          </section>
        ))}
      </div>

      <div>
        <Link
          href="/badge-token-planner"
          className="inline-flex items-center gap-2 rounded border border-outline px-6 py-3 text-label-md font-bold text-on-surface transition-colors duration-200 hover:bg-surface-card"
        >
          <Icon name="arrow_back" size={16} />
          Back to Planner
        </Link>
      </div>
    </main>
  );
}
