import type { PublishingPostAttempt } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostAttempt";

export function formatPublishingPostAttemptStatus(
  status: PublishingPostAttempt["status"],
) {
  const labels: Record<PublishingPostAttempt["status"], string> = {
    canceled: "Canceled",
    failed: "Failed",
    intent: "Saved",
    started: "Started",
    succeeded: "Succeeded",
    uncertain: "Checking result",
  };
  return labels[status];
}
