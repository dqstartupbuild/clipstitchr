import type { PublishingPostAttempt } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostAttempt";
import type { PublishingPostSummary } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostSummary";

export type PublishingPostDetail = PublishingPostSummary & {
  attempts: PublishingPostAttempt[];
  canCancel: boolean;
  canRetry: boolean;
  providerPublicationIds: string[];
};
