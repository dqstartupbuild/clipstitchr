import type { PublishingApiPostDetail } from "./PublishingApiPostDetail.js";
import type { PublishingApiPostStateRecord } from "./publishingApiPostStateInclude.js";
import { isPublishingApiPostCancelable } from "./isPublishingApiPostCancelable.js";
import { isPublishingApiPostRetryable } from "./isPublishingApiPostRetryable.js";
import { mapPublishingApiPostAttempt } from "./mapPublishingApiPostAttempt.js";
import { mapPublishingApiPostSummary } from "./mapPublishingApiPostSummary.js";

export const mapPublishingApiPostDetail = (
  record: PublishingApiPostStateRecord,
): PublishingApiPostDetail =>
  Object.freeze({
    ...mapPublishingApiPostSummary(record),
    attempts: Object.freeze(record.attempts.map(mapPublishingApiPostAttempt)),
    canCancel: isPublishingApiPostCancelable(record),
    canRetry: isPublishingApiPostRetryable(record),
    providerPublicationIds: Object.freeze(
      [...new Set(
        record.receipts
          .flatMap(({ publications }) => publications)
          .map(({ remotePublicationId }) => remotePublicationId.trim())
          .filter((value) => value.length > 0 && value.length <= 256),
      )].slice(0, 100),
    ),
  });
