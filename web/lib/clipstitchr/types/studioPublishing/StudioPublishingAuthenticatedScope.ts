import type { ConvexHttpClient } from "convex/browser";
import type { PublishingTenantIdentity } from "@/lib/clipstitchr/publishing/identity/PublishingTenantIdentity";

export type StudioPublishingAuthenticatedScope = Readonly<{
  convex: ConvexHttpClient;
  identity: PublishingTenantIdentity;
  ownerId: string;
  productId: string;
  productName: string;
  userId: string;
}>;
