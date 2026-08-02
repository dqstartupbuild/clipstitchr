import type { PrismaClient } from "@prisma/client";

import type { AppendPublishingAuditEventInput } from "./AppendPublishingAuditEventInput.js";
import { assertBoundedSafePersistenceJson } from "./assertBoundedSafePersistenceJson.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { findPublishingTenantOrThrow } from "./findPublishingTenantOrThrow.js";

export const appendPublishingAuditEvent = async (
  database: PrismaClient,
  input: AppendPublishingAuditEventInput,
) => {
  assertPublishingPersistenceIdentifier(
    input.actorClerkUserId,
    "actorClerkUserId",
  );
  assertPublishingPersistenceIdentifier(input.requestId, "requestId");
  assertPublishingPersistenceIdentifier(input.action, "action");
  assertPublishingPersistenceIdentifier(input.subjectType, "subjectType");
  assertPublishingPersistenceIdentifier(input.subjectId, "subjectId");
  assertPublishingPersistenceIdentifier(input.result, "result");
  assertBoundedSafePersistenceJson(input.safeMetadata, "safeMetadata", 16_000);
  const tenant = await findPublishingTenantOrThrow(database, input.tenantKey);

  return database.clipPublishingAuditEvent.create({
    data: {
      tenantId: tenant.id,
      actorClerkUserId: input.actorClerkUserId,
      requestId: input.requestId,
      action: input.action,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      result: input.result,
      safeMetadata: input.safeMetadata,
    },
  });
};
