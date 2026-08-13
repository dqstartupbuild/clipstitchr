import type { PublishingDestinationIntentKind } from "./PublishingDestinationIntentKind.js";

export type ResolvedPublishingDestinationIntent = Readonly<{
  kind: PublishingDestinationIntentKind;
  postState: "DRAFT" | "QUEUE";
  internalState: "DRAFT" | "QUEUED";
  databaseIntent: "DRAFT" | "PUBLISH_NOW" | "SCHEDULE";
  publishDate: Date;
  availableAt: Date | null;
  scheduledTimeZone: string | null;
  scheduledLocalTime: string | null;
  scheduledUtcOffsetMinutes: number | null;
}>;
