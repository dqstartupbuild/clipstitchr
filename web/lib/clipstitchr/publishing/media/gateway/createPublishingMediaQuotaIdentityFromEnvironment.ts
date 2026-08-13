import { createPublishingMediaQuotaIdentity } from "@/lib/clipstitchr/publishing/media/gateway/createPublishingMediaQuotaIdentity";
import { getPublishingMediaQuotaSecret } from "@/lib/clipstitchr/publishing/media/gateway/getPublishingMediaQuotaSecret";

export function createPublishingMediaQuotaIdentityFromEnvironment(
  tenantKey: string,
) {
  return createPublishingMediaQuotaIdentity(
    tenantKey,
    getPublishingMediaQuotaSecret(),
  );
}
