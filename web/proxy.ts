import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(
  async (auth, request) => {
    if (isDashboardRoute(request)) {
      await auth.protect();
    }
  },
  {
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
  },
);

export const config = {
  matcher: [
    "/dashboard(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/(api|trpc)/(.*)",
    "/__clerk/(.*)",
  ],
};
