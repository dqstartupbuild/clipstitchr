import type { PublishingPostStatus } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostStatus";

export function readPublishingPostStatusSearchParam(
  value: string | string[] | undefined,
): PublishingPostStatus | "all" {
  const statuses = [
    "action-required",
    "canceled",
    "draft",
    "failed",
    "processing",
    "published",
    "queued",
    "uncertain",
  ] as const;
  return typeof value === "string" && statuses.includes(value as PublishingPostStatus)
    ? (value as PublishingPostStatus)
    : "all";
}
