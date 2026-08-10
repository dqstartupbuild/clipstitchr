import type { SocialPublishingPostStatus } from "@/lib/clipstitchr/types/SocialPublishingPostStatus";

export function normalizeZernioPostStatus(
  status: string | undefined,
): SocialPublishingPostStatus {
  if (status === "published") {
    return "posted";
  }

  if (status === "scheduled") {
    return "scheduled";
  }

  if (status === "partial") {
    return "partial";
  }

  if (status === "failed") {
    return "failed";
  }

  return "processing";
}
