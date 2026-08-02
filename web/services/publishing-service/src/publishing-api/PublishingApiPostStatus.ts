export const PUBLISHING_API_POST_STATUSES = [
  "action-required",
  "canceled",
  "draft",
  "failed",
  "processing",
  "published",
  "queued",
  "uncertain",
] as const;

export type PublishingApiPostStatus =
  (typeof PUBLISHING_API_POST_STATUSES)[number];
