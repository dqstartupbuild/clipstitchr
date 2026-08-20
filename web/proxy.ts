import type { NextFetchEvent } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { developmentAuthBypassHeaderName } from "@/lib/clipstitchr/development/auth/developmentAuthBypassHeaderName";
import { isDevelopmentAuthBypassEnabled } from "@/lib/clipstitchr/development/auth/isDevelopmentAuthBypassEnabled";
import { runClerkProtectedProxy } from "@/lib/clipstitchr/development/auth/runClerkProtectedProxy";

export default async function proxy(
  request: NextRequest,
  event: NextFetchEvent,
) {
  const requestHeaders = new Headers(request.headers);

  requestHeaders.delete(developmentAuthBypassHeaderName);

  const isDashboardPageNavigation =
    request.nextUrl.pathname === "/dashboard" ||
    request.nextUrl.pathname.startsWith("/dashboard/");
  const isApiRoute =
    request.nextUrl.pathname === "/api" ||
    request.nextUrl.pathname.startsWith("/api/");
  const isReadOnlyNavigation =
    request.method === "GET" || request.method === "HEAD";
  const isBypassEnabled = isDevelopmentAuthBypassEnabled({
    enabledValue: process.env.DEV_AUTH_BYPASS_ENABLED,
    hostname: request.nextUrl.hostname,
    nodeEnv: process.env.NODE_ENV,
  });

  if (isDashboardPageNavigation && isReadOnlyNavigation && isBypassEnabled) {
    requestHeaders.set(developmentAuthBypassHeaderName, "1");

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (isBypassEnabled && (isApiRoute || isDashboardPageNavigation)) {
    return NextResponse.json(
      {
        error:
          "Development preview does not authorize API or server-action access.",
      },
      { status: 401 },
    );
  }

  const sanitizedRequest = new NextRequest(request, {
    headers: requestHeaders,
  });

  return runClerkProtectedProxy(sanitizedRequest, event);
}

export const config = {
  matcher: [
    "/((?!_next|email/confirm|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
