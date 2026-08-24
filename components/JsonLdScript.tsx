import type { JsonLd } from "@/lib/schema";

/** Renders one or more JSON-LD schema blocks (build-time injected, contract §2). */
export function JsonLdScript({ schema }: { schema: JsonLd | JsonLd[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
