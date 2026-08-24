import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { JsonLdScript } from "@/components/JsonLdScript";
import { canonicalFor } from "@/lib/canonical";
import { webPageSchema } from "@/lib/schema";

// R10.1 finalized copy (compliance/legal-pages-final-v1.md §2.3).
// New route added in R10.2 per owner decision r10.1-legal-pages-finalization-decision.md.
export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of service for My2KBuilder, an unofficial fan-made NBA 2K27 build planner with no accounts, no payments, and no server-side build storage.",
  alternates: { canonical: canonicalFor("/terms") },
};

const SECTIONS: ReadonlyArray<{ title: string; body?: string; list?: string[] }> = [
  {
    title: "1. About the Service",
    body: "My2KBuilder is an unofficial, fan-made web tool for planning and comparing NBA 2K27 MyPLAYER builds. The Service is provided free of charge and does not require an account, payment, or game login.",
  },
  {
    title: "2. Acceptance of Terms",
    body: "By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.",
  },
  {
    title: "3. No Accounts, No Payments, No Server Storage",
    body: "The Service does not offer user accounts, subscriptions, or paid features. We do not collect or store your personal information on our servers. Any build you create can be shared only by copying a link that encodes the build state locally in your browser.",
  },
  {
    title: "4. Intellectual Property",
    body: "The Service's original code, design, icons, share cards, and user-interface elements are the property of the site operator and are protected by applicable intellectual property laws. All game-related names, marks, logos, mechanics, badges, and terminology displayed or referenced on the Service are the property of their respective owners, including but not limited to 2K Games, Visual Concepts, Take-Two Interactive Software, Inc., the NBA, the WNBA, NBA Properties, Inc., the NBPA, and the WNBPA. Their use here is for informational and descriptive purposes only and does not imply affiliation, endorsement, or authorization. The Service does not use official screenshots, logos, player photos, team logos, or other copyrighted artwork without authorization.",
  },
  {
    title: "5. Acceptable Use",
    body: "You agree not to use the Service to:",
    list: [
      "violate any applicable law or regulation;",
      "infringe the intellectual property or other rights of any third party;",
      "harass, abuse, or harm others;",
      "distribute malware, spam, or malicious code;",
      "attempt to gain unauthorized access to the Service or its infrastructure;",
      "generate, share, or promote content related to cheats, hacks, mods, unauthorized VC sales, account selling, boosting services, or any activity that violates the NBA 2K or platform terms of service.",
    ],
  },
  {
    title: "6. Disclaimer of Warranties",
    body: 'The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be accurate, complete, reliable, error-free, secure, or available at all times. Build data is compiled from publicly available information and community cross-checks and may change as the game is patched or updated. Always confirm final values in the official game or official channels.',
  },
  {
    title: "7. Limitation of Liability",
    body: "To the fullest extent permitted by law, the site operator shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of or inability to use the Service.",
  },
  {
    title: "8. Modifications to the Service",
    body: "We may change, suspend, or discontinue all or part of the Service at any time without notice.",
  },
  {
    title: "9. Governing Law",
    body: "These Terms shall be governed by the laws of the United States, without regard to conflict of law principles.",
  },
  {
    title: "10. Contact",
    body: "For questions about these Terms, contact: contact@my2kbuilder.com.",
  },
];

export default function TermsPage() {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-grow flex-col gap-8 px-4 py-12 md:px-margin-desktop">
      <JsonLdScript schema={webPageSchema({ name: "Terms of Service" })} />

      <header className="flex flex-col gap-3">
        <h1 className="font-display text-display-lg text-primary-container">Terms of Service</h1>
        <p className="text-body-sm text-text-muted">Last Updated: August 24, 2026</p>
        <p className="text-body-lg text-on-surface">
          Please read these Terms of Service carefully before using My2KBuilder.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {SECTIONS.map((s) => (
          <section key={s.title} className="flex flex-col gap-3">
            <h2 className="font-display text-headline-md text-on-surface">{s.title}</h2>
            {s.body ? <p className="text-body-md text-on-surface-variant">{s.body}</p> : null}
            {s.list ? (
              <ul className="list-disc space-y-1 pl-6 text-body-md text-on-surface-variant">
                {s.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
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
