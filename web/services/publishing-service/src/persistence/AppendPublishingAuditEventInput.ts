import type { Prisma } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";

export type AppendPublishingAuditEventInput = Readonly<{
  tenantKey: PublishingTenantKey;
  actorClerkUserId: string;
  requestId: string;
  action: string;
  subjectType: string;
  subjectId: string;
  result: string;
  safeMetadata: Prisma.InputJsonValue;
}>;
