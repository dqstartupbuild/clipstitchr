import type { ProviderPublishResult } from "../provider-runtime/contracts/ProviderPublishResult.js";
import type { PublishingReceiptResult } from "../persistence/PublishingReceiptResult.js";

export const mapPublishingWorkflowReceiptResult = (
  kind: ProviderPublishResult["kind"],
): PublishingReceiptResult => {
  switch (kind) {
    case "published":
      return "published";
    case "accepted":
    case "media_transfer_pending":
    case "processing":
      return "accepted-processing";
    case "requires_user_action":
      return "user-action-required";
    case "rejected":
      return "rejected";
    case "published_not_public":
    case "outcome_unknown":
      return "uncertain";
  }
};
