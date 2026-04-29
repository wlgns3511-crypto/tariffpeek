import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import codeKeep from "./lib/generated/code-keep.json";
import importSlugKeep from "./lib/generated/import-slug-keep.json";

/**
 * HCU 2026-04-24 cleanup.
 *
 * tariffpeek was 1 month old, 44,640 discovered-not-indexed vs ~2,000 indexed.
 * Root cause: /code/[slug]/ pre-rendered all 6,940 HS codes (97 chapters +
 * 1,229 headings + 5,613 leaves). GSC 1-month data: 0 clicks on /code/*, all
 * earning queries on /import/[country]/[slug]/. So we cut /code/ down to the
 * 97 real-hub chapter pages and let Google deindex the rest fast via 410.
 *
 * Kill list:
 *   /code/<slug>/*                     slug ∉ CODE_KEEP_SET        → 410
 *   /es/code/*                         (Spanish code pages)         → 410
 *   /es/*  deeper paths                                             → 410
 *   /import/<country>/<slug>/          slug ∉ IMPORT_SLUG_KEEP_SET  → 410
 *     (2026-04-28 — CF analytics shows ~30 hits/24h on legacy
 *      /import/{country}/{hs-code-slug}/ that's not in the top 500.
 *      Was 404 from dynamicParams=false; now 410 = faster deindex.)
 *   /compare/<slug>/                   slug not pre-rendered        → handled
 *     by route-level dynamicParams=false (404 → 410 conversion not
 *     wired here yet; volumes are tiny per CF)
 *
 * Keep list:
 *   /es/                                                            → 200
 *   /import/<country>/                                              → 200
 *   /import/<country>/top-imports-from-us/                          → 200
 *   /import/<country>/<slug>/         slug ∈ IMPORT_SLUG_KEEP_SET   → 200
 *   /code/<L2-slug>/                                                → 200
 *   /code/<L2-slug>/by-fta/                                         → 200
 */

const CODE_KEEP_SET = new Set(codeKeep as string[]);
const IMPORT_SLUG_KEEP_SET = new Set(importSlugKeep as string[]);

export function middleware(request: NextRequest) {
  // www → non-www canonical 301 (GSC impression split fix)
  const host = request.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = host.replace(/^www\./, "");
    return NextResponse.redirect(url, 301);
  }

  const { pathname } = request.nextUrl;

  // /es/* except /es/ root → 410 (drops /es/code/*, /es/blog/* and any legacy)
  if (pathname.startsWith("/es/") && pathname !== "/es/" && pathname !== "/es") {
    return new NextResponse("Gone", { status: 410 });
  }

  // /code/<slug>/  and  /code/<slug>/by-fta/  → 410 if slug not in keep-set
  const codeMatch = pathname.match(/^\/code\/([^/]+)(?:\/(?:by-fta\/?)?)?$/);
  if (codeMatch) {
    const slug = codeMatch[1];
    if (!CODE_KEEP_SET.has(slug)) {
      return new NextResponse("Gone", { status: 410 });
    }
  }

  // /import/<country>/<slug>/ → 410 if slug not in keep-set. Skips
  // 'top-imports-from-us' (sub-route, valid for every country).
  const importMatch = pathname.match(/^\/import\/([^/]+)\/([^/]+)\/?$/);
  if (importMatch) {
    const slug = importMatch[2];
    if (slug !== "top-imports-from-us" && !IMPORT_SLUG_KEEP_SET.has(slug)) {
      return new NextResponse("Gone", { status: 410 });
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml|api).*)"],
};
