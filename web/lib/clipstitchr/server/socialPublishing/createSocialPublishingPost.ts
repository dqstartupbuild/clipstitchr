import { createSocialPublishingPlatformConfigurations } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingPlatformConfigurations";
import { normalizeSocialPublishingTikTokPhotoTitle } from "@/lib/clipstitchr/server/socialPublishing/normalizeSocialPublishingTikTokPhotoTitle";
import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";
import { normalizeZernioPost } from "@/lib/clipstitchr/server/socialPublishing/zernio/normalizeZernioPost";
import type { ZernioPost } from "@/lib/clipstitchr/server/socialPublishing/zernio/ZernioPost";
import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";
import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";
import type { SocialPublishingPost } from "@/lib/clipstitchr/types/SocialPublishingPost";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";
import type { SocialPublishingTikTokCommercialContentType } from "@/lib/clipstitchr/types/SocialPublishingTikTokCommercialContentType";

type CreateSocialPublishingPostOptions = {
  accounts: SocialPublishingSocialAccount[];
  apiKey: string;
  caption: string;
  customMediaIdsByPlatform?: Partial<Record<SocialPublishingPlatform, string[]>>;
  mediaIds: string[];
  mediaKind: SocialPublishingMediaKind;
  scheduledAt: string | null;
  tiktokCaption?: string;
  tiktokCommercialContentType: SocialPublishingTikTokCommercialContentType;
  tiktokConsentGiven: boolean;
  tiktokPrivacyLevel: string;
  title: string;
  useQueue: boolean;
};

type CreateZernioPostResponse = {
  existingPost?: ZernioPost;
  post?: ZernioPost;
};

export async function createSocialPublishingPost({
  accounts,
  apiKey,
  caption,
  customMediaIdsByPlatform = {},
  mediaIds,
  mediaKind,
  scheduledAt,
  tiktokCaption,
  tiktokCommercialContentType,
  tiktokConsentGiven,
  tiktokPrivacyLevel,
  title,
  useQueue,
}: CreateSocialPublishingPostOptions) {
  const profileIds = [...new Set(accounts.map((account) => account.profileId))];

  if (useQueue && profileIds.length !== 1) {
    throw new Error("Choose accounts from one Zernio profile when using its queue.");
  }

  const includesTikTok = accounts.some((account) => account.platform === "tiktok");
  const isTikTokPhotoPost = includesTikTok && mediaKind === "image";

  if (includesTikTok && (!tiktokConsentGiven || !tiktokPrivacyLevel)) {
    throw new Error("Review the TikTok settings and approve this post first.");
  }

  const response = await requestSocialPublishing<CreateZernioPostResponse>("/v1/posts", {
    apiKey,
    body: {
      content: isTikTokPhotoPost
        ? normalizeSocialPublishingTikTokPhotoTitle(title)
        : caption,
      mediaItems: mediaIds.map((url) => ({ type: mediaKind, url })),
      platforms: createSocialPublishingPlatformConfigurations({
        accounts,
        caption,
        customMediaIdsByPlatform,
        isTikTokPhotoPost,
        mediaKind,
        title,
      }),
      ...(includesTikTok
        ? {
            tiktokSettings: {
              allowComment: true,
              allowDuet: mediaKind === "video",
              allowStitch: mediaKind === "video",
              commercialContentType: tiktokCommercialContentType,
              contentPreviewConfirmed: tiktokConsentGiven,
              expressConsentGiven: tiktokConsentGiven,
              privacyLevel: tiktokPrivacyLevel,
              ...(isTikTokPhotoPost
                ? {
                    description: tiktokCaption ?? "",
                    mediaType: "photo",
                  }
                : {}),
            },
          }
        : {}),
      title,
      ...(useQueue
        ? { queuedFromProfile: profileIds[0] }
        : scheduledAt
          ? { scheduledFor: scheduledAt, timezone: "UTC" }
          : { publishNow: true }),
    },
    method: "POST",
    requestId: crypto.randomUUID(),
  });

  const post = response.post ?? response.existingPost;

  if (!post) {
    throw new Error("Zernio accepted the request without returning a post.");
  }

  return normalizeZernioPost(post) satisfies SocialPublishingPost;
}
