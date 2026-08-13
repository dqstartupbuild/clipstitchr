import type { ConvexHttpClient } from "convex/browser";

export type ResolvePublishingApiMediaOptions = Readonly<{
  convex: ConvexHttpClient;
  descriptor: unknown;
  productId: string;
}>;
