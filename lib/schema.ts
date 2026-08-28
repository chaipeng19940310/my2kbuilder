/**
 * My2KBuilder — JSON-LD schema 构建期注入（契约 §2 Schema 列；架构 v1 §9）。
 *
 * 路由 → schema 映射（契约 §2 冻结）：
 *   /                        WebSite + SoftwareApplication（offers price 0 USD + isAccessibleForFree，禁 aggregateRating）
 *   /badge-token-planner     SoftwareApplication + FAQPage + BreadcrumbList
 *   /signature-blueprints    ItemList + FAQPage + BreadcrumbList（R12I-A：真名接入后守卫解除，
 *                            见 owner-review/r12i-wave1-owner-decision-2026-08-28）
 *   /methodology             AboutPage
 *   /disclaimer, /privacy, /terms    WebPage（/terms 于 R10.2 新增）
 *   compare / build-card / /b/[id]   无或 WebPage（noindex）
 */

export interface JsonLd {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

const BASE = "https://schema.org";

export function websiteSchema(opts: { name: string; url?: string; description?: string }): JsonLd {
  return {
    "@context": BASE,
    "@type": "WebSite",
    name: opts.name,
    ...(opts.url ? { url: opts.url } : {}),
    ...(opts.description ? { description: opts.description } : {}),
  };
}

export function softwareApplicationSchema(opts: {
  name: string;
  description: string;
  applicationCategory?: string;
  url?: string;
}): JsonLd {
  return {
    "@context": BASE,
    "@type": "SoftwareApplication",
    name: opts.name,
    description: opts.description,
    applicationCategory: opts.applicationCategory ?? "UtilitiesApplication",
    ...(opts.url ? { url: opts.url } : {}),
    // 契约 §2：必须含 offers price 0 + isAccessibleForFree；禁止 aggregateRating
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
    isAccessibleForFree: true,
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function faqPageSchema(faqs: FaqEntry[]): JsonLd {
  return {
    "@context": BASE,
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    "@context": BASE,
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.path,
    })),
  };
}

export function aboutPageSchema(opts: { name: string; description?: string; url?: string }): JsonLd {
  return {
    "@context": BASE,
    "@type": "AboutPage",
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.url ? { url: opts.url } : {}),
  };
}

export function webPageSchema(opts: { name: string; description?: string; url?: string }): JsonLd {
  return {
    "@context": BASE,
    "@type": "WebPage",
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.url ? { url: opts.url } : {}),
  };
}

/**
 * ItemList。R12I-A：蓝图真名（blueprints.v1.json）接入后，契约 §8.1 的冻结
 * 守卫按 Owner 决策（r12i-wave1-owner-decision-2026-08-28）解除——ItemList 只
 * 列 40 个真实蓝图名，不含任何未发布的成本数值。
 */
export function itemListSchema(opts: {
  name: string;
  items: Array<{ name: string; path: string }>;
}): JsonLd {
  return {
    "@context": BASE,
    "@type": "ItemList",
    name: opts.name,
    itemListElement: opts.items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.path,
    })),
  };
}

/** 序列化为 <script type="application/ld+json"> 内容（React 中 dangerouslySetInnerHTML 用）。 */
export function jsonLdScript(schema: JsonLd | JsonLd[]): string {
  return JSON.stringify(schema);
}
