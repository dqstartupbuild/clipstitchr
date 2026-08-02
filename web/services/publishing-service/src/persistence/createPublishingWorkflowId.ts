import { createHash } from "node:crypto";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";

export const createPublishingWorkflowId = (
  tenantKey: PublishingTenantKey,
  integrationId: string,
  idempotencyKey: string,
): string => {
  assertPublishingPersistenceIdentifier(integrationId, "integrationId");
  assertPublishingPersistenceIdentifier(idempotencyKey, "idempotencyKey");

  const digest = createHash("sha256")
    .update(
      JSON.stringify([
        "clipstitchr-publishing-workflow",
        1,
        tenantKey,
        integrationId,
        idempotencyKey,
      ]),
      "utf8",
    )
    .digest("hex");

  return `clip-publish-v1-${digest}`;
};
