import { decodeProviderPublishResult } from "./decodeProviderPublishResult.js";
import type { StoredPublishingWorkflowCheckpoint } from "./StoredPublishingWorkflowCheckpoint.js";
import { throwInvalidStoredPublishingWorkflowCheckpoint } from "./throwInvalidStoredPublishingWorkflowCheckpoint.js";

export const readStoredPublishingWorkflowCheckpoint = (
  value: unknown,
): StoredPublishingWorkflowCheckpoint | null => {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return throwInvalidStoredPublishingWorkflowCheckpoint();
  }
  if (Object.keys(value).length === 0) {
    return null;
  }
  const checkpoint = value as Record<string, unknown>;

  if (checkpoint["schemaVersion"] !== 1 || typeof checkpoint["stage"] !== "string") {
    return throwInvalidStoredPublishingWorkflowCheckpoint();
  }

  switch (checkpoint["stage"]) {
    case "instagram-ready":
      if (!("checkpoint" in checkpoint)) {
        return throwInvalidStoredPublishingWorkflowCheckpoint();
      }
      return checkpoint as unknown as StoredPublishingWorkflowCheckpoint;
    case "instagram-dispatch-intent":
      if (
        typeof checkpoint["operationId"] !== "string" ||
        !("previousCheckpoint" in checkpoint)
      ) {
        return throwInvalidStoredPublishingWorkflowCheckpoint();
      }
      return checkpoint as unknown as StoredPublishingWorkflowCheckpoint;
    case "instagram-progress":
      if (!("checkpoint" in checkpoint)) {
        return throwInvalidStoredPublishingWorkflowCheckpoint();
      }
      return checkpoint as unknown as StoredPublishingWorkflowCheckpoint;
    case "tiktok-dispatch-intent":
      if (typeof checkpoint["operationId"] !== "string") {
        return throwInvalidStoredPublishingWorkflowCheckpoint();
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
        return throwInvalidStoredPublishingWorkflowCheckpoint();
      }
      return checkpoint as unknown as StoredPublishingWorkflowCheckpoint;
    case "youtube-ready":
      if (!Number.isSafeInteger(checkpoint["totalBytes"]) ||
        (checkpoint["totalBytes"] as number) < 1) {
        return throwInvalidStoredPublishingWorkflowCheckpoint();
      }
      return checkpoint as unknown as StoredPublishingWorkflowCheckpoint;
    case "youtube-session-intent":
      if (
        typeof checkpoint["operationId"] !== "string" ||
        !Number.isSafeInteger(checkpoint["totalBytes"]) ||
        (checkpoint["totalBytes"] as number) < 1
      ) {
        return throwInvalidStoredPublishingWorkflowCheckpoint();
      }
      return checkpoint as unknown as StoredPublishingWorkflowCheckpoint;
    case "youtube-upload":
      if (
        typeof checkpoint["sessionUri"] !== "string" ||
        !Number.isSafeInteger(checkpoint["totalBytes"]) ||
        !Number.isSafeInteger(checkpoint["committedOffset"]) ||
        (checkpoint["totalBytes"] as number) < 1 ||
        (checkpoint["committedOffset"] as number) < 0 ||
        (checkpoint["committedOffset"] as number) >
          (checkpoint["totalBytes"] as number) ||
        (checkpoint["videoId"] !== null &&
          typeof checkpoint["videoId"] !== "string") ||
        (checkpoint["thumbnailState"] !== "not-requested" &&
          checkpoint["thumbnailState"] !== "pending" &&
          checkpoint["thumbnailState"] !== "complete" &&
          checkpoint["thumbnailState"] !== "outcome-unknown")
      ) {
        return throwInvalidStoredPublishingWorkflowCheckpoint();
      }
      return checkpoint as unknown as StoredPublishingWorkflowCheckpoint;
    case "terminal":
      try {
        decodeProviderPublishResult(checkpoint["result"]);
      } catch {
        return throwInvalidStoredPublishingWorkflowCheckpoint();
      }
      return checkpoint as unknown as StoredPublishingWorkflowCheckpoint;
    default:
      return throwInvalidStoredPublishingWorkflowCheckpoint();
  }
};
