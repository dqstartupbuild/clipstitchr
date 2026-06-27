import type { PostBridgePostReference } from "@/lib/clipstitchr/types/PostBridgePostReference";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";
import type { PostBridgePlatform } from "@/lib/clipstitchr/types/PostBridgePlatform";
import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";

type CreatePostBridgePostReferenceOptions = {
  hasAudio: boolean;
  mediaIds: string[];
  platforms: PostBridgePlatform[];
  post: PostBridgePost;
  scheduledAt: string;
  socialAccountIds: number[];
  sourceType: PostBridgeSourceType;
};

export function createPostBridgePostReference({
  hasAudio,
  mediaIds,
  platforms,
  post,
  scheduledAt,
  socialAccountIds,
  sourceType,
}: CreatePostBridgePostReferenceOptions): PostBridgePostReference {
  const now = new Date().toISOString();

  return {
    createdAt: now,
    hasAudio,
    isDraft: post.is_draft,
    mediaIds,
    mediaKind: "video",
    platforms,
    postId: post.id,
    scheduledAt,
    socialAccountIds,
    sourceType,
    status: post.status,
    updatedAt: now,
  };
}
