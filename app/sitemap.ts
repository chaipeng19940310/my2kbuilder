// My2KBuilder — sitemap.xml（契约 §2 规则 4/6）。
// - 含 8 条 index 路由（/terms 于 R10.2 加入；/badge-requirements 于 R12I-C 加入，
//   Owner 决策 r12i-wave1-owner-decision-2026-08-28 批准建页）；noindex 三页
//   （/signature-blueprints/compare、/build-card、/b/[id]）永不进入。
// - CANONICAL_HOST 为空（R10.5 前）时用本地占位 host，仅用于结构验证；
//   任何情况下不得指向 my2kbuilder.com（除非 R10.5 批准后显式设置 CANONICAL_HOST）。
import type { MetadataRoute } from "next";
import { CANONICAL_HOST } from "../lib/canonical";

export const INDEXABLE_ROUTES = [
  "/",
  "/badge-token-planner",
  "/badge-requirements",
  "/signature-blueprints",
  "/methodology",
  "/disclaimer",
  "/privacy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const host = CANONICAL_HOST ? `https://${CANONICAL_HOST}` : "http://localhost:3000";
  return INDEXABLE_ROUTES.map((route) => ({
    url: `${host}${route === "/" ? "/" : route}`,
    lastModified: process.env.DATA_LAST_VERIFIED ?? "2026-08-24",
    changeFrequency: "weekly",
    priority: route === "/" ? 1.0 : 0.8,
  }));
}
