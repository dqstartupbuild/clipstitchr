import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";
import { cliQueueListWindowHours } from "@/lib/clipstitchr/server/cli/queue/cliQueueListWindowHours";
import { getCliQueuePostScheduledAt } from "@/lib/clipstitchr/server/cli/queue/getCliQueuePostScheduledAt";

export function getCliQueuePostIsWithinWindow(
  post: PostBridgePost,
  now = new Date(),
) {
  if (post.status === "posted" || post.status === "failed") {
    return false;
  }

  const scheduledAt = getCliQueuePostScheduledAt(post);

  if (!scheduledAt) {
    return true;
  }

  const scheduledTime = Date.parse(scheduledAt);

  if (!Number.isFinite(scheduledTime)) {
    return false;
  }

  const nowTime = now.getTime();
  const windowEndTime = nowTime + cliQueueListWindowHours * 60 * 60 * 1000;

  return scheduledTime >= nowTime && scheduledTime <= windowEndTime;
}
