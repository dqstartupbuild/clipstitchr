import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isPublicToolGateVisitorKey } from "@/lib/clipstitchr/tools/catalog/rollout/isPublicToolGateVisitorKey";
import { publicToolGateVisitorCookieName } from "@/lib/clipstitchr/tools/catalog/rollout/publicToolGateVisitorCookieName";

export async function runClerkProtectedProxy(
  request: NextRequest,
  event: NextFetchEvent,
) {
  const { clerkMiddleware, createRouteMatcher } = await import(
    "@clerk/nextjs/server"
  );
  const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
  const isPublicToolRoute = createRouteMatcher([
    "/tools(.*)",
    "/api/tools/(.*)/lead",
    "/api/tools/(.*)/interaction",
  ]);
  const handler = clerkMiddleware(
    async (auth, clerkRequest) => {
      if (isDashboardRoute(clerkRequest)) {
        await auth.protect();
      }

      if (isPublicToolRoute(clerkRequest)) {
        const currentVisitorKey = clerkRequest.cookies.get(
          publicToolGateVisitorCookieName,
        )?.value;

        if (!isPublicToolGateVisitorKey(currentVisitorKey)) {
          const visitorKey = crypto.randomUUID();
          clerkRequest.cookies.set(publicToolGateVisitorCookieName, visitorKey);
          const response = NextResponse.next({
            request: { headers: clerkRequest.headers },
          });
          response.cookies.set({
            httpOnly: true,
            maxAge: 365 * 24 * 60 * 60,
            name: publicToolGateVisitorCookieName,
            path: "/",
            sameSite: "lax",
            secure: clerkRequest.nextUrl.protocol === "https:",
            value: visitorKey,
          });
          return response;
        }
      }
    },
    {
      signInUrl: "/sign-in",
      signUpUrl: "/sign-up",
    },
  );

  return handler(request, event);
}
