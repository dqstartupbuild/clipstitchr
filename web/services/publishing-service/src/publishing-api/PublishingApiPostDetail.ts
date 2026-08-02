import type { PublishingApiPostAttempt } from "./PublishingApiPostAttempt.js";
import type { PublishingApiPostSummary } from "./PublishingApiPostSummary.js";

export type PublishingApiPostDetail = PublishingApiPostSummary &
  Readonly<{
    attempts: readonly PublishingApiPostAttempt[];
    canCancel: boolean;
    canRetry: boolean;
    providerPublicationIds: readonly string[];
  }>;
