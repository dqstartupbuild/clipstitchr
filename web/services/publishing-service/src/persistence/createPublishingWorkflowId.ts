import { createHash } from "node:crypto";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";

export const createPublishingWorkflowId = (
  tenantKey: PublishingTenantKey,
  productId: string,
  integrationId: string,
  idempotencyKey: string,
): string => {
  assertPublishingPersistenceIdentifier(productId, "productId");
  assertPublishingPersistenceIdentifier(integrationId, "integrationId");
  assertPublishingPersistenceIdentifier(idempotencyKey, "idempotencyKey");

  const digest = createHash("sha256")
    .update(
      JSON.stringify([
        "clipstitchr-publishing-workflow",
        2,
        tenantKey,
        productId,
        integrationId,
        idempotencyKey,
      ]),
      "utf8",
    )
    .digest("hex");

  return `clip-publish-v2-${digest}`;
};
