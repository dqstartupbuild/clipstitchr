import { ConvexHttpClient } from "convex/browser";

export function createStudioBetaOperatorClient() {
  const convexUrl =
    process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;

  if (!convexUrl) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL or CONVEX_URL.");
  }

  return new ConvexHttpClient(convexUrl);
}
