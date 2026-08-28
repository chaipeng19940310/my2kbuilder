import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { JsonLdScript } from "@/components/JsonLdScript";
import { canonicalFor } from "@/lib/canonical";
import { socialMeta } from "@/lib/social";
import { webPageSchema } from "@/lib/schema";

// R10.1 finalized copy (compliance/legal-pages-final-v1.md §2.2), revised in
// R12K per the Owner 2026-08-28 no-banner/no-gating directive using the
// R12K-D legal final (compliance/legal/r12k-privacy-analytics-v1.md):
// sections 3–5 rewritten for always-on analytics, new section 9
// (privacy rights / opt-out), Last Updated 2026-08-28. R12K-G: all three
// providers (Plausible, GA4, Clarity) are now installed and enumerated in
// section 3 with their opt-out links. /disclaimer and /terms are unchanged.
export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "My2KBuilder has no accounts, no email sign-ups, and no payments. Build share links encode the build in the URL itself. We use Plausible, Google Analytics 4, and Microsoft Clarity to understand site usage.",
  alternates: { canonical: canonicalFor("/privacy") },
  ...socialMeta({
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "My2KBuilder has no accounts, no email sign-ups, and no payments. Build share links encode the build in the URL itself. We use Plausible, Google Analytics 4, and Microsoft Clarity to understand site usage.",
  }),
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
    body: [
      "This site uses three analytics services, all of which load automatically when you visit. There is no cookie consent banner and no consent gating: Plausible Analytics, running on our own self-hosted installation, for anonymous, aggregate usage such as pages visited, referral sources, and device or browser types in broad form (Plausible does not use tracking cookies, does not collect personal information, and does not build individual user profiles); Google Analytics 4 (Google), which sets cookies and collects usage data to help us understand how the site is used; and Microsoft Clarity (Microsoft), which sets cookies and collects usage and interaction data, such as anonymized session recordings and heatmaps, to help us improve the site.",
      "No analytics data is used by us for advertising or marketing profiles. Google Analytics and Microsoft Clarity process data under their own privacy policies. You can opt out of Google Analytics with Google's browser add-on at https://tools.google.com/dlpage/gaoptout, and you can manage or opt out of Microsoft data collection at https://choice.microsoft.com.",
    ],
  },
  {
    title: "4. Third-Party Services",
    body: "The site is served through Cloudflare's edge network. Analytics data is processed by our self-hosted Plausible installation, by Google (Google Analytics 4), and by Microsoft (Microsoft Clarity). We do not sell personal data, and we do not use analytics data for advertising or marketing profiles.",
  },
  {
    title: "5. Cookies",
    body: [
      "This site does not set advertising cookies. Plausible Analytics is cookieless. Google Analytics 4 and Microsoft Clarity set first-party analytics cookies to measure site usage. Because we use these services without a consent gate, we do not show a cookie consent banner.",
      "We may use small amounts of browser storage that are strictly necessary for basic site functionality. For example, site preferences such as theme or planner UI state may be stored locally in your browser's localStorage. These values stay on your device and are not sent to our servers.",
    ],
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
  {
    title: "9. Your Privacy Rights / Opt-Out",
    body: "Because we do not collect personal information, most individual data rights requests do not apply to information we hold. If you are a California resident and wish to opt out of any future sale or sharing of personal information, or if you have any privacy-related request, contact: contact@my2kbuilder.com.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-grow flex-col gap-8 px-4 py-12 md:px-margin-desktop">
      <JsonLdScript schema={webPageSchema({ name: "Privacy Policy" })} />

      <header className="flex flex-col gap-3">
        <h1 className="font-display text-display-lg text-primary-container">Privacy Policy</h1>
        <p className="text-body-sm text-text-muted">Last Updated: August 28, 2026</p>
      </header>

      <div className="flex flex-col gap-6">
        {SECTIONS.map((s) => (
          <section key={s.title} className="flex flex-col gap-3">
            <h2 className="font-display text-headline-md text-on-surface">{s.title}</h2>
            {typeof s.body === "string" ? (
              <p className="text-body-md text-on-surface-variant">{s.body}</p>
            ) : (
              s.body.map((p) => (
                <p key={p.slice(0, 48)} className="text-body-md text-on-surface-variant">
                  {p}
                </p>
              ))
            )}
          </section>
        ))}
      </div>

      <p className="text-body-sm text-text-muted">Last Updated: August 28, 2026</p>

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
