import { ConvexHttpClient } from "convex/browser";

export function createAuthenticatedConvexHttpClient(token: string) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL.");
  }

  return new ConvexHttpClient(convexUrl, { auth: token });
}
