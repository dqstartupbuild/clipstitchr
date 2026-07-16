import type { UsageOperation } from "./types/UsageOperation";
import type { UsageResource } from "./types/UsageResource";

export function createUsageIdempotencyKey({
  domainId,
  operation,
  ownerId,
  resource,
}: {
  domainId: string;
  operation: UsageOperation;
  ownerId: string;
  resource: UsageResource;
}) {
  return `${ownerId}:${operation}:${resource}:${domainId}`;
}
