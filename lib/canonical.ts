/**
 * My2KBuilder — canonical 注入（契约 §5：CANONICAL_HOST build-time 注入，
 * R10.5 生产批准前必须为空/相对路径）。
 *
 * 规则：
 *  - CANONICAL_HOST 为空 → canonicalFor 返回相对路径（不输出绝对 canonical，
 *    不得指向 my2kbuilder.com）。
 *  - CANONICAL_HOST 仅在 R10.5 Peng Chai 批准后在构建环境设置。
 */

export const CANONICAL_HOST = process.env.CANONICAL_HOST ?? "";

/** 返回该路由的 canonical；host 未批准时返回相对路径。 */
export function canonicalFor(path: string): string {
  const normalized = path === "/" ? "/" : path.replace(/\/+$/, "");
  if (!CANONICAL_HOST) return normalized;
  return `https://${CANONICAL_HOST}${normalized}`;
}

/** 是否有权输出绝对 canonical/sitemap（R10.5 闸门）。 */
export function hasCanonicalHost(): boolean {
  return CANONICAL_HOST.length > 0;
}
