import type { PostBridgePostStatus } from "@/lib/clipstitchr/types/PostBridgePostStatus";

export function getPostBridgePostStatusLabel(status: PostBridgePostStatus) {
  if (status === "scheduled") {
    return "Scheduled";
  }

  if (status === "processing") {
    return "Processing";
  }

  if (status === "posted") {
    return "Posted";
  }

  return "Failed";
}
