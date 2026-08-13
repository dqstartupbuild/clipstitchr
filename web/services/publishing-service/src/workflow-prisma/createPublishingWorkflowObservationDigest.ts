import type { PublishingReceiptResult } from "../persistence/PublishingReceiptResult.js";
import type { PublishingRemotePublication } from "../persistence/PublishingRemotePublication.js";
import { createCanonicalPublishingRequestHash } from "../persistence/createCanonicalPublishingRequestHash.js";
import type { PublishingWorkflowReceiptMetadata } from "./PublishingWorkflowReceiptMetadata.js";

export const createPublishingWorkflowObservationDigest = (
  result: PublishingReceiptResult,
  metadata: PublishingWorkflowReceiptMetadata,
  publications: readonly PublishingRemotePublication[],
): string =>
  createCanonicalPublishingRequestHash({
    schemaVersion: 1,
    result,
    metadata,
    publications: publications.map((publication) => ({
      remotePublicationId: publication.remotePublicationId,
      observableUrl: publication.observableUrl ?? null,
    })),
  });
