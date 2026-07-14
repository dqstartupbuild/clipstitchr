import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isPublicToolGateVisitorKey } from "@/lib/clipstitchr/tools/catalog/rollout/isPublicToolGateVisitorKey";
import { publicToolGateVisitorCookieName } from "@/lib/clipstitchr/tools/catalog/rollout/publicToolGateVisitorCookieName";

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isPublicToolRoute = createRouteMatcher([
  "/tools(.*)",
  "/api/tools/(.*)/lead",
  "/api/tools/(.*)/interaction",
]);

export default clerkMiddleware(
  async (auth, request) => {
    if (isDashboardRoute(request)) {
      await auth.protect();
    }

    if (isPublicToolRoute(request)) {
      const currentVisitorKey = request.cookies.get(
        publicToolGateVisitorCookieName,
      )?.value;

      if (!isPublicToolGateVisitorKey(currentVisitorKey)) {
        const visitorKey = crypto.randomUUID();
        request.cookies.set(publicToolGateVisitorCookieName, visitorKey);
        const response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({
          httpOnly: true,
          maxAge: 365 * 24 * 60 * 60,
          name: publicToolGateVisitorCookieName,
          path: "/",
          sameSite: "lax",
          secure: request.nextUrl.protocol === "https:",
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

export const config = {
  matcher: [
    "/((?!_next|email/confirm|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
