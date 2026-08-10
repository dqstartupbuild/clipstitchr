import type { SocialPublishingPostReference } from "@/lib/clipstitchr/types/SocialPublishingPostReference";
import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";
import type { SocialPublishingPost } from "@/lib/clipstitchr/types/SocialPublishingPost";
import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";
import type { SocialPublishingSourceType } from "@/lib/clipstitchr/types/SocialPublishingSourceType";

type CreateSocialPublishingPostReferenceOptions = {
  hasAudio: boolean;
  mediaIds: string[];
  mediaKind: SocialPublishingMediaKind;
  platforms: SocialPublishingPlatform[];
  post: SocialPublishingPost;
  scheduledAt: string | null;
  socialAccountIds: string[];
  sourceType: SocialPublishingSourceType;
};

export function createSocialPublishingPostReference({
  hasAudio,
  mediaIds,
  mediaKind,
  platforms,
  post,
  scheduledAt,
  socialAccountIds,
  sourceType,
}: CreateSocialPublishingPostReferenceOptions): SocialPublishingPostReference {
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
