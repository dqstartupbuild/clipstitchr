import type { NextFetchEvent } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { developmentAuthBypassHeaderName } from "@/lib/clipstitchr/development/auth/developmentAuthBypassHeaderName";
import { isDevelopmentAuthBypassEnabled } from "@/lib/clipstitchr/development/auth/isDevelopmentAuthBypassEnabled";
import { runClerkProtectedProxy } from "@/lib/clipstitchr/development/auth/runClerkProtectedProxy";
import { appendVaryHeader } from "@/lib/agentReadiness/appendVaryHeader";
import { createMarkdownDocument } from "@/lib/agentReadiness/createMarkdownDocument";
import { createMarkdownNotFound } from "@/lib/agentReadiness/createMarkdownNotFound";
import { getMarkdownPathIsKnownHtmlOnly } from "@/lib/agentReadiness/getMarkdownPathIsKnownHtmlOnly";
import { getPagePathUsesContentNegotiation } from "@/lib/agentReadiness/getPagePathUsesContentNegotiation";
import { getPathIsPublicAgentResource } from "@/lib/agentReadiness/getPathIsPublicAgentResource";
import { getPreferredPageRepresentation } from "@/lib/agentReadiness/getPreferredPageRepresentation";

export default async function proxy(
  request: NextRequest,
  event: NextFetchEvent,
) {
  const isReadOnlyNavigation =
    request.method === "GET" || request.method === "HEAD";
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname === "/api" || pathname.startsWith("/api/");
  const usesContentNegotiation =
    isReadOnlyNavigation && getPagePathUsesContentNegotiation(pathname);

  if (usesContentNegotiation) {
    const availableRepresentations = getMarkdownPathIsKnownHtmlOnly(pathname)
      ? (["html"] as const)
      : (["html", "markdown"] as const);
    const preferredRepresentation = getPreferredPageRepresentation(
      request.headers.get("accept"),
      availableRepresentations,
    );

    if (preferredRepresentation === null) {
      return new Response(
        "Not Acceptable\n\nAvailable: text/html, text/markdown\n",
        {
          status: 406,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Vary": "Accept, Accept-Encoding",
          },
        },
      );
    }

    if (preferredRepresentation === "markdown") {
      const markdownDocument = createMarkdownDocument(pathname);

      return new Response(
        markdownDocument ?? createMarkdownNotFound(pathname),
        {
          status: markdownDocument ? 200 : 404,
          headers: {
            "Cache-Control":
              "public, s-maxage=300, stale-while-revalidate=3600",
            "Content-Type": "text/markdown; charset=utf-8",
            "Vary": "Accept, Accept-Encoding",
          },
        },
      );
    }
  }

  if (getPathIsPublicAgentResource(pathname)) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);

  requestHeaders.delete(developmentAuthBypassHeaderName);

  const isDashboardPageNavigation =
    request.nextUrl.pathname === "/dashboard" ||
    request.nextUrl.pathname.startsWith("/dashboard/");
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

  const response = await runClerkProtectedProxy(sanitizedRequest, event);
  if (!response) {
    return response;
  }
  if (usesContentNegotiation) {
    appendVaryHeader(response.headers, "Accept, Accept-Encoding");
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next|email/confirm|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
