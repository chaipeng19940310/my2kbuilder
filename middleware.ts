import { NextRequest, NextResponse } from "next/server";

const CANONICAL_HOST = "my2kbuilder.com";

/**
 * Collapse public domain variants at the application edge.
 *
 * Cloudflare forwards the visitor-facing protocol in x-forwarded-proto. Keep
 * the redirect conditional so canonical HTTPS requests pass through unchanged.
 */
export function middleware(request: NextRequest) {
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",", 1)[0]
    .trim();
  const host = (forwardedHost ?? request.headers.get("host"))
    ?.split(":", 1)[0]
    .toLowerCase();
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",", 1)[0]
    .trim()
    .toLowerCase();

  if (host !== `www.${CANONICAL_HOST}` && forwardedProto !== "http") {
    return NextResponse.next();
  }

  const destination = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    `https://${CANONICAL_HOST}`,
  );

  return new NextResponse(null, {
    status: 301,
    headers: { Location: destination.toString() },
  });
}
