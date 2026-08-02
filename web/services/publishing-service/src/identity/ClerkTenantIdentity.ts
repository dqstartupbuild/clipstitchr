import type { PublishingTenantKey } from "./PublishingTenantKey.js";

export type ClerkTenantIdentity = Readonly<{
  kind: "personal" | "organization";
  tenantKey: PublishingTenantKey;
  actorUserId: string;
  organizationId: string | undefined;
}>;
