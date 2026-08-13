import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { LeasedPublishingOutboxRecord } from "../persistence/LeasedPublishingOutboxRecord.js";
import { hasExactObjectKeys } from "./hasExactObjectKeys.js";

const PAYLOAD_KEYS = Object.freeze([
  "schemaVersion",
  "tenantId",
  "productId",
  "postId",
  "postStateId",
  "integrationId",
  "workflowId",
  "intent",
]);

export const readPublishingWorkflowOutboxProductId = (
  lease: LeasedPublishingOutboxRecord,
): string => {
  const value = lease.payload;
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !hasExactObjectKeys(value as Readonly<Record<string, unknown>>, PAYLOAD_KEYS)
  ) {
    throw new PublishingResourceOwnershipError();
  }
  const payload = value as Readonly<Record<string, unknown>>;
  if (
    payload["schemaVersion"] !== 2 ||
    typeof payload["productId"] !== "string" ||
    payload["productId"].length < 1 ||
    payload["tenantId"] !== lease.tenantId ||
    payload["postStateId"] !== lease.postStateId ||
    payload["workflowId"] !== lease.workflowId
  ) {
    throw new PublishingResourceOwnershipError();
  }
  return payload["productId"];
};
