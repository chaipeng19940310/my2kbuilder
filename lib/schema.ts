/**
 * My2KBuilder — JSON-LD schema 构建期注入（契约 §2 Schema 列；架构 v1 §9）。
 *
 * 路由 → schema 映射（契约 §2 冻结）：
 *   /                        WebSite + SoftwareApplication（offers price 0 USD + isAccessibleForFree，禁 aggregateRating）
 *   /badge-token-planner     SoftwareApplication + FAQPage + BreadcrumbList
 *   /signature-blueprints    ItemList* + FAQPage + BreadcrumbList（*ItemList 冻结前不输出 → gatedItemList 守卫）
 *   /methodology             AboutPage
 *   /disclaimer, /privacy, /terms    WebPage（/terms 于 R10.2 新增）
 *   compare / build-card / /b/[id]   无或 WebPage（noindex）
 *
 * 硬闸门（契约 §8.1）：ItemList/数据类 schema 在成本矩阵冻结前不得输出；
 * gatedItemList 在 dataFrozen !== true 时直接抛错，防止静默泄漏。
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
 * ItemList（契约 §8.1 冻结硬闸门守卫）。
 * dataFrozen !== true 时抛错：冻结前调用即构建期失败，不给静默输出留路径。
 */
export function gatedItemListSchema(opts: {
  dataFrozen: boolean;
  name: string;
  items: Array<{ name: string; path: string }>;
}): JsonLd {
  if (opts.dataFrozen !== true) {
    throw new Error(
      "ItemList schema is FROZEN-GATED (contract §8.1): badge cost matrix / blueprint data are not collected + dual-reviewed + frozen. Do not emit ItemList before freeze v0.",
    );
  }
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
