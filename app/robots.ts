// My2KBuilder — robots.txt（架构 v1 §9；契约 §2 规则 4/6）。
// - 全站 allow；noindex 通过页面级 metadata robots 表达（compare/build-card//b/[id]）。
// - sitemap 行仅在 CANONICAL_HOST 已批准（R10.5）时输出绝对地址；
//   未批准时不引用 my2kbuilder.com。
import type { MetadataRoute } from "next";
import { CANONICAL_HOST } from "../lib/canonical";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    ...(CANONICAL_HOST ? { sitemap: `https://${CANONICAL_HOST}/sitemap.xml` } : {}),
  };
}
