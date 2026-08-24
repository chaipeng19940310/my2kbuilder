/**
 * My2KBuilder — next.config 边缘层片段（架构 v1 §9；契约 §2 路由硬规则）。
 * 集成方式：在站点根 next.config.ts 中
 *   import { edgeRedirects, edgeHeaders } from "./edge/next.config.edge";
 *   const nextConfig: NextConfig = { redirects: edgeRedirects, headers: edgeHeaders, ... };
 *
 * 契约落点：
 *  - §2 规则 1：带尾斜杠 301 → 无尾斜杠（canonical 唯一）。
 *  - §2 规则 2：HTTP→HTTPS、www/非 www 统一为 Workers/域名层行为（R10.5 上线时配置），不在构建产物内。
 *  - 架构 v1 §9：静态资产长缓存、HTML 短缓存；安全 headers 取代 Pages `_headers`。
 */
import type { NextConfig } from "next";

type Redirects = NonNullable<NextConfig["redirects"]>;
type Headers = NonNullable<NextConfig["headers"]>;

export const edgeRedirects: Redirects = async () => [
  {
    // 尾斜杠 301；"/:path+/" 要求至少一段路径，不命中根 "/"
    source: "/:path+/",
    destination: "/:path+",
    permanent: true,
  },
];

export const edgeHeaders: Headers = async () => [
  {
    source: "/_next/static/:path*",
    headers: [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ],
  },
  {
    // 数据 bundle：短缓存，随 DATA_LAST_VERIFIED 复核节奏更新
    source: "/data/:path*",
    headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
  },
  {
    source: "/assets/:path*",
    headers: [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ],
  },
  {
    source: "/:path*",
    headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
    ],
  },
];
