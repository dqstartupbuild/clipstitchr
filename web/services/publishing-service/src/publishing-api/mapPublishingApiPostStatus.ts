import type { PublishingApiPostStateRecord } from "./publishingApiPostStateInclude.js";
import type { PublishingApiPostStatus } from "./PublishingApiPostStatus.js";

export const mapPublishingApiPostStatus = (
  record: PublishingApiPostStateRecord,
): PublishingApiPostStatus => {
  if (record.disposition === "CANCELED" || record.internalState === "CANCELED") {
    return "canceled";
  }
  if (record.disposition === "UNCERTAIN" || record.internalState === "UNCERTAIN") {
    return "uncertain";
  }
  if (
    record.disposition === "ACTION_REQUIRED" ||
    record.internalState === "ACTION_REQUIRED"
  ) {
    return "action-required";
  }
  switch (record.internalState) {
    case "DRAFT":
      return "draft";
    case "PUBLISHED":
      return "published";
    case "FAILED":
      return "failed";
    case "DISPATCHING":
    case "PROCESSING":
      return "processing";
    case "QUEUED":
      return "queued";
    case "CANCELED":
      return "canceled";
    case "ACTION_REQUIRED":
      return "action-required";
    case "UNCERTAIN":
      return "uncertain";
  }
};
