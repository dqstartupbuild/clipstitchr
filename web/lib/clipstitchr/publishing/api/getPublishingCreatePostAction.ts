import type { PublishingPostIntent } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostIntent";
import type { ServiceAssertionAction } from "@clipstitchr/publishing-service";

export function getPublishingCreatePostAction(
  intent: PublishingPostIntent,
): ServiceAssertionAction {
  if (intent === "draft") {
    return "publishing.posts.write";
  }
  if (intent === "schedule") {
    return "publishing.posts.schedule";
  }
  return "publishing.posts.publish";
}
