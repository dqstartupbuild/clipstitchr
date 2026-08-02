import type { ClipPublishingReceiptResult } from "@prisma/client";

import type { PublishingReceiptResult } from "./PublishingReceiptResult.js";

export const mapPublishingReceiptResult = (
  result: PublishingReceiptResult,
): ClipPublishingReceiptResult => {
  switch (result) {
    case "published":
      return "PUBLISHED";
    case "accepted-processing":
      return "ACCEPTED_PROCESSING";
    case "user-action-required":
      return "USER_ACTION_REQUIRED";
    case "rejected":
      return "REJECTED";
    case "canceled":
      return "CANCELED";
    case "uncertain":
      return "UNCERTAIN";
  }
};
