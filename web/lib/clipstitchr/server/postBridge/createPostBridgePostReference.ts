import type { PostBridgePostReference } from "@/lib/clipstitchr/types/PostBridgePostReference";
import type { PostBridgeMediaKind } from "@/lib/clipstitchr/types/PostBridgeMediaKind";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";
import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";
import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";

type CreatePostBridgePostReferenceOptions = {
  hasAudio: boolean;
  mediaIds: string[];
  mediaKind: PostBridgeMediaKind;
  platforms: PostBridgePlatform[];
  post: PostBridgePost;
  scheduledAt: string | null;
  socialAccountIds: number[];
  sourceType: PostBridgeSourceType;
};

export function createPostBridgePostReference({
  hasAudio,
  mediaIds,
  mediaKind,
  platforms,
  post,
  scheduledAt,
  socialAccountIds,
  sourceType,
}: CreatePostBridgePostReferenceOptions): PostBridgePostReference {
  const now = new Date().toISOString();
  const postScheduledAt =
    typeof post.scheduled_at === "string" && post.scheduled_at
      ? post.scheduled_at
      : scheduledAt;

  return {
    createdAt: now,
    hasAudio,
    isDraft: post.is_draft,
    mediaIds,
    mediaKind,
    platforms,
    postId: post.id,
    ...(postScheduledAt ? { scheduledAt: postScheduledAt } : {}),
    socialAccountIds,
    sourceType,
    status: post.status,
    updatedAt: now,
  };
}
