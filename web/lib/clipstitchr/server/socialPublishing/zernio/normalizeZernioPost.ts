import { normalizeZernioPostStatus } from "@/lib/clipstitchr/server/socialPublishing/zernio/normalizeZernioPostStatus";
import type { ZernioPost } from "@/lib/clipstitchr/server/socialPublishing/zernio/ZernioPost";
import type { SocialPublishingPost } from "@/lib/clipstitchr/types/SocialPublishingPost";

export function normalizeZernioPost(post: ZernioPost): SocialPublishingPost {
  const socialAccountIds = (post.platforms ?? []).flatMap((target) => {
    const accountId =
      typeof target.accountId === "string"
        ? target.accountId
        : target.accountId?._id;

    return accountId ? [accountId] : [];
  });

  return {
    caption: post.content ?? "",
    created_at: post.createdAt ?? post.publishedAt ?? new Date(0).toISOString(),
    id: post._id,
    is_draft: post.isDraft === true || post.status === "draft",
    scheduled_at: post.scheduledFor ?? null,
    social_accounts: socialAccountIds,
    status: normalizeZernioPostStatus(post.status),
    updated_at: post.updatedAt ?? post.publishedAt ?? post.createdAt ?? new Date(0).toISOString(),
  };
}
