import { createSocialPublishingUploadedMedia } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingUploadedMedia";
import { getSocialPublishingSourceType } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingSourceType";
import { normalizeSocialPublishingCaption } from "@/lib/clipstitchr/server/socialPublishing/normalizeSocialPublishingCaption";
import { normalizeSocialPublishingScheduledAt } from "@/lib/clipstitchr/server/socialPublishing/normalizeSocialPublishingScheduledAt";
import { normalizeSocialPublishingTitle } from "@/lib/clipstitchr/server/socialPublishing/normalizeSocialPublishingTitle";
import type { SocialPublishingSourceType } from "@/lib/clipstitchr/types/SocialPublishingSourceType";
import type { SocialPublishingTikTokCommercialContentType } from "@/lib/clipstitchr/types/SocialPublishingTikTokCommercialContentType";
import type { SocialPublishingUploadedMedia } from "@/lib/clipstitchr/types/SocialPublishingUploadedMedia";

type SocialPublishingScheduleRequestBody = {
  caption?: unknown;
  hasAudio?: unknown;
  mediaFiles?: unknown;
  scheduledAt?: unknown;
  socialAccountIds?: unknown;
  sourceId?: unknown;
  sourceType?: unknown;
  title?: unknown;
  tiktokCommercialContentType?: unknown;
  tiktokConsentGiven?: unknown;
  tiktokPrivacyLevel?: unknown;
  useQueue?: unknown;
};

type SocialPublishingUploadedMediaBody = {
  mediaId?: unknown;
  mimeType?: unknown;
  name?: unknown;
  sizeBytes?: unknown;
};

export type SocialPublishingScheduleRequest = {
  caption: string;
  hasAudio: boolean;
  mediaFiles: SocialPublishingUploadedMedia[];
  scheduledAt: string | null;
  socialAccountIds: string[];
  sourceId: string;
  sourceType: SocialPublishingSourceType;
  title: string;
  tiktokCommercialContentType: SocialPublishingTikTokCommercialContentType;
  tiktokConsentGiven: boolean;
  tiktokPrivacyLevel: string;
  useQueue: boolean;
};

export async function readSocialPublishingScheduleRequest(
  request: Request,
): Promise<SocialPublishingScheduleRequest> {
  const body = (await request.json()) as SocialPublishingScheduleRequestBody;
  const sourceId = typeof body.sourceId === "string" ? body.sourceId.trim() : "";
  const useQueue = body.useQueue === true;
  const scheduledAtInput =
    typeof body.scheduledAt === "string" ? body.scheduledAt : "";

  if (!sourceId) {
    throw new Error("Choose a stitch or Swipe before scheduling.");
  }

  if (!Array.isArray(body.mediaFiles) || !body.mediaFiles.length) {
    throw new Error("Choose media before scheduling.");
  }

  if (useQueue && scheduledAtInput) {
    throw new Error("Use either the queue or a custom post time, not both.");
  }

  const tiktokCommercialContentType =
    body.tiktokCommercialContentType ?? "none";

  if (
    tiktokCommercialContentType !== "none" &&
    tiktokCommercialContentType !== "brand_organic" &&
    tiktokCommercialContentType !== "brand_content"
  ) {
    throw new Error("Choose how TikTok should label promotional content.");
  }

  return {
    caption: normalizeSocialPublishingCaption(
      typeof body.caption === "string" ? body.caption : "",
    ),
    hasAudio: body.hasAudio === true,
    mediaFiles: body.mediaFiles.map((mediaFile) => {
      const item = mediaFile as SocialPublishingUploadedMediaBody;

      if (
        typeof item.mediaId !== "string" ||
        typeof item.mimeType !== "string" ||
        typeof item.sizeBytes !== "number"
      ) {
        throw new Error("Unable to prepare this media upload.");
      }

      return createSocialPublishingUploadedMedia({
        mediaId: item.mediaId,
        mimeType: item.mimeType,
        name: typeof item.name === "string" ? item.name : "",
        sizeBytes: item.sizeBytes,
      });
    }),
    scheduledAt: useQueue
      ? null
      : normalizeSocialPublishingScheduledAt(scheduledAtInput),
    socialAccountIds: Array.isArray(body.socialAccountIds)
      ? body.socialAccountIds
          .filter((accountId): accountId is string => typeof accountId === "string")
          .map((accountId) => accountId.trim())
          .filter(Boolean)
      : [],
    sourceId,
    sourceType: getSocialPublishingSourceType(
      typeof body.sourceType === "string" ? body.sourceType : null,
    ),
    title: normalizeSocialPublishingTitle(
      typeof body.title === "string" ? body.title : "",
      sourceId,
    ),
    tiktokCommercialContentType,
    tiktokConsentGiven: body.tiktokConsentGiven === true,
    tiktokPrivacyLevel:
      typeof body.tiktokPrivacyLevel === "string"
        ? body.tiktokPrivacyLevel.trim()
        : "",
    useQueue,
  };
}
