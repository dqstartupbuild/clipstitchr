import { api } from "@/convex/_generated/api";
import { getAuthenticatedPublishingTenantIdentity } from "@/lib/clipstitchr/publishing/identity/getAuthenticatedPublishingTenantIdentity";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";
import type { StudioPublishingAuthenticatedScope } from "@/lib/clipstitchr/types/studioPublishing/StudioPublishingAuthenticatedScope";

export async function requirePublishingProxyAuthentication(): Promise<StudioPublishingAuthenticatedScope> {
  const access = await assertStudioBetaApiAccess();
  const [identity, token] = await Promise.all([
    getAuthenticatedPublishingTenantIdentity(),
    getAuthenticatedConvexToken(),
  ]);

  if (!token) {
    throw new Error("Unable to verify this Postiz Beta request.");
  }

  const convex = createAuthenticatedConvexHttpClient(token);
  const product = await convex.mutation(
    api.studioPublishingScope.getActiveProductScope.getActiveProductScope,
    {},
  );

  return {
    ...product,
    convex,
    identity,
    userId: access.userId,
  };
}
