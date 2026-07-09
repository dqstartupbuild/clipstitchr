import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";

export function getCliQueuePostScheduledAt(post: PostBridgePost) {
  return typeof post.scheduled_at === "string" && post.scheduled_at.trim()
    ? post.scheduled_at.trim()
    : null;
}
