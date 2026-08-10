import type { SocialPublishingPostStatus } from "@/lib/clipstitchr/types/SocialPublishingPostStatus";

export function getSocialPublishingPostStatusLabel(status: SocialPublishingPostStatus) {
  if (status === "scheduled") {
    return "Scheduled";
  }

  if (status === "processing") {
    return "Processing";
  }

  if (status === "posted") {
    return "Posted";
  }

  if (status === "partial") {
    return "Partly posted";
  }

  return "Failed";
}
