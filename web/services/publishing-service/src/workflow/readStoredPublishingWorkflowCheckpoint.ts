import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import { decodeProviderPublishResult } from "./decodeProviderPublishResult.js";
import type { StoredPublishingWorkflowCheckpoint } from "./StoredPublishingWorkflowCheckpoint.js";

export const readStoredPublishingWorkflowCheckpoint = (
  value: unknown,
): StoredPublishingWorkflowCheckpoint | null => {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return invalid();
  }
  if (Object.keys(value).length === 0) {
    return null;
  }
  const checkpoint = value as Record<string, unknown>;

  if (checkpoint["schemaVersion"] !== 1 || typeof checkpoint["stage"] !== "string") {
    return invalid();
  }

  switch (checkpoint["stage"]) {
    case "instagram-ready":
      if (!("checkpoint" in checkpoint)) {
        return invalid();
      }
      return checkpoint as unknown as StoredPublishingWorkflowCheckpoint;
    case "instagram-dispatch-intent":
      if (
        typeof checkpoint["operationId"] !== "string" ||
        !("previousCheckpoint" in checkpoint)
      ) {
        return invalid();
      }
      return checkpoint as unknown as StoredPublishingWorkflowCheckpoint;
    case "instagram-progress":
      if (!("checkpoint" in checkpoint)) {
        return invalid();
      }
      return checkpoint as unknown as StoredPublishingWorkflowCheckpoint;
    case "tiktok-dispatch-intent":
      if (typeof checkpoint["operationId"] !== "string") {
        return invalid();
      }
      return checkpoint as unknown as StoredPublishingWorkflowCheckpoint;
    case "tiktok-ready":
      return checkpoint as unknown as StoredPublishingWorkflowCheckpoint;
    case "tiktok-processing":
      if (
        typeof checkpoint["publishId"] !== "string" ||
        !Number.isInteger(checkpoint["pollCount"]) ||
        !Number.isSafeInteger(checkpoint["acceptedAtEpochMilliseconds"])
      ) {
        return invalid();
      }
      return checkpoint as unknown as StoredPublishingWorkflowCheckpoint;
    case "terminal":
      try {
        decodeProviderPublishResult(checkpoint["result"]);
      } catch {
        return invalid();
      }
      return checkpoint as unknown as StoredPublishingWorkflowCheckpoint;
    default:
      return invalid();
  }
};

const invalid = (): never => {
  throw new ProviderRuntimeError("instagram", "invalid_request");
};
