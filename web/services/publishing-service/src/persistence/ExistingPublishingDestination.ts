import type { PublishingDestinationIntentKind } from "./PublishingDestinationIntentKind.js";

export type ExistingPublishingDestination = Readonly<{
  postId: string;
  postStateId: string;
  attemptId: string | null;
  outboxId: string | null;
  workflowId: string;
  canonicalRequestHash: string;
  publishDate: Date;
  intent: PublishingDestinationIntentKind;
  scheduledTimeZone: string | null;
  scheduledLocalTime: string | null;
  scheduledUtcOffsetMinutes: number | null;
}>;
