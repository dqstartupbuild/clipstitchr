import { auth } from "@clerk/nextjs/server";
import { PublishingAuthenticationError } from "@/lib/clipstitchr/publishing/identity/PublishingAuthenticationError";
import { resolvePublishingTenantIdentity } from "@/lib/clipstitchr/publishing/identity/resolvePublishingTenantIdentity";

export async function getAuthenticatedPublishingTenantIdentity() {
  const { orgId, orgRole, userId } = await auth();
  const identity = resolvePublishingTenantIdentity({
    clerkOrganizationId: orgId,
    clerkOrganizationRole: orgRole,
    clerkUserId: userId,
  });

  if (!identity) {
    throw new PublishingAuthenticationError();
  }

  return identity;
}
