import { getAuthenticatedPublishingTenantIdentity } from "@/lib/clipstitchr/publishing/identity/getAuthenticatedPublishingTenantIdentity";

export async function requirePublishingProxyAuthentication(): Promise<void> {
  await getAuthenticatedPublishingTenantIdentity();
}
