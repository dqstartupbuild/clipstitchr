import { randomUUID } from "node:crypto";

export const createPublishingLeaseOwner = (
  processId = process.pid,
  createUuid: () => string = randomUUID,
): string => {
  if (!Number.isSafeInteger(processId) || processId < 1) {
    throw new TypeError("Publishing process identifier is invalid.");
  }

  const uuid = createUuid();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(uuid)) {
    throw new TypeError("Publishing lease identifier generation failed.");
  }

  return `publishing-service:${processId}:${uuid}`;
};
