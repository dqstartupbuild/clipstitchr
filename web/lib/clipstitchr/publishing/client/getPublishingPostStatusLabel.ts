import type { PublishingPostStatus } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostStatus";

export function getPublishingPostStatusLabel(status: PublishingPostStatus) {
  const labels: Record<PublishingPostStatus, string> = {
    "action-required": "Needs action",
    canceled: "Canceled",
    draft: "Draft",
    failed: "Failed",
    processing: "Processing",
    published: "Published",
    queued: "Queued",
    uncertain: "Checking result",
  };
  return labels[status];
}
