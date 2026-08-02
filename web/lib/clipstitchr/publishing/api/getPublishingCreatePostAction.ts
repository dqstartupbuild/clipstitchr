import type { PublishingPostIntent } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostIntent";
import type { ServiceAssertionAction } from "@/services/publishing-service/src/assertions/ServiceAssertionAction";

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
