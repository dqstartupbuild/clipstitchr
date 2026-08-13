import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { PublishingApiPostStateRecord } from "./publishingApiPostStateInclude.js";
import type { PublishingApiPostSummary } from "./PublishingApiPostSummary.js";
import { mapPublishingApiPostStatus } from "./mapPublishingApiPostStatus.js";
import { readPublishingApiSafeMessage } from "./readPublishingApiSafeMessage.js";

export const mapPublishingApiPostSummary = (
  record: PublishingApiPostStateRecord,
): PublishingApiPostSummary => {
  const provider =
    record.integration.providerIdentifier === "tiktok"
      ? "tiktok"
      : record.integration.providerIdentifier === "youtube"
        ? "youtube"
      : record.integration.providerIdentifier === "instagram" ||
          record.integration.providerIdentifier === "instagram-standalone"
        ? "instagram"
        : null;
  const mediaKind =
    record.sourceKind === "LIBRARY"
      ? "library-media"
      : record.sourceKind === "STITCH"
        ? "stitch"
        : record.sourceKind === "SWIPE"
          ? "swipe"
          : record.sourceKind === "STUDIO_CLIP_OUTPUT"
            ? "studio-clip-output"
            : record.sourceKind === "STUDIO_STITCH_OUTPUT"
              ? "studio-stitch-output"
          : null;
  if (
    provider === null ||
    mediaKind === null ||
    record.productId === null ||
    record.sourceRecordId === null
  ) {
    throw new PublishingResourceOwnershipError();
  }
  const publication = record.receipts
    .flatMap(({ publications }) => publications)
    .find(({ observableUrl }) => {
      if (observableUrl === null) {
        return false;
      }
      try {
        return new URL(observableUrl).protocol === "https:";
      } catch {
        return false;
      }
    });
  const status = mapPublishingApiPostStatus(record);

  return Object.freeze({
    accountName: record.integration.name.trim() || "Connected account",
    caption: record.post.content.slice(0, 10_000),
    createdAt: record.createdAt.toISOString(),
    id: record.postId,
    integrationId: record.integrationId,
    media: Object.freeze({ kind: mediaKind, recordId: record.sourceRecordId }),
    productId: record.productId,
    provider,
    resultUrl: publication?.observableUrl ?? null,
    scheduledAt:
      record.intent === "SCHEDULE" ? record.post.publishDate.toISOString() : null,
    status,
    statusMessage:
      status === "failed" || status === "uncertain" || status === "action-required"
        ? readPublishingApiSafeMessage(record.attempts[0]?.safeErrorMessage)
        : null,
    timeZone: record.scheduledTimeZone ?? "UTC",
    updatedAt: record.updatedAt.toISOString(),
  });
};
