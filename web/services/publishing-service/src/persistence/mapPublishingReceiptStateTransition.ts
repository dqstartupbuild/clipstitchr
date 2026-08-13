import type { PublishingReceiptResult } from "./PublishingReceiptResult.js";
import type { PublishingReceiptStateTransition } from "./PublishingReceiptStateTransition.js";

export const mapPublishingReceiptStateTransition = (
  result: PublishingReceiptResult,
): PublishingReceiptStateTransition => {
  switch (result) {
    case "published":
      return {
        internalState: "PUBLISHED",
        disposition: "TERMINAL",
        postState: "PUBLISHED",
      };
    case "accepted-processing":
      return {
        internalState: "PROCESSING",
        disposition: "ACTIVE",
        postState: "QUEUE",
      };
    case "user-action-required":
      return {
        internalState: "ACTION_REQUIRED",
        disposition: "ACTION_REQUIRED",
        postState: "QUEUE",
      };
    case "rejected":
      return {
        internalState: "FAILED",
        disposition: "TERMINAL",
        postState: "ERROR",
      };
    case "canceled":
      return {
        internalState: "CANCELED",
        disposition: "CANCELED",
        postState: "ERROR",
      };
    case "uncertain":
      return {
        internalState: "UNCERTAIN",
        disposition: "UNCERTAIN",
        postState: "QUEUE",
      };
  }
};
