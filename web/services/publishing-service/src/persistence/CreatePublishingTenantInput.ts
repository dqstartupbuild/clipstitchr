import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";

export type CreatePublishingTenantInput = Readonly<{
  tenantKey: PublishingTenantKey;
  organizationName: string;
}>;
