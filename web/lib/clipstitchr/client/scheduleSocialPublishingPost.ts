import { readSocialPublishingClientErrorMessage } from "@/lib/clipstitchr/client/readSocialPublishingClientErrorMessage";
import { uploadSocialPublishingScheduleMedia } from "@/lib/clipstitchr/client/uploadSocialPublishingScheduleMedia";
import type { SocialPublishingPostReference } from "@/lib/clipstitchr/types/SocialPublishingPostReference";
import type { SocialPublishingPost } from "@/lib/clipstitchr/types/SocialPublishingPost";
import type { SocialPublishingScheduleMediaFile } from "@/lib/clipstitchr/types/SocialPublishingScheduleMediaFile";
import type { SocialPublishingSourceType } from "@/lib/clipstitchr/types/SocialPublishingSourceType";
import type { SocialPublishingTikTokCommercialContentType } from "@/lib/clipstitchr/types/SocialPublishingTikTokCommercialContentType";
import type { SocialPublishingUploadedMedia } from "@/lib/clipstitchr/types/SocialPublishingUploadedMedia";

type ScheduleSocialPublishingPostOptions = {
  caption: string;
  hasAudio: boolean;
  mediaFiles: SocialPublishingScheduleMediaFile[];
  socialAccountIds: string[];
  sourceId: string;
  sourceType: SocialPublishingSourceType;
  title: string;
  tiktokCommercialContentType: SocialPublishingTikTokCommercialContentType;
  tiktokConsentGiven: boolean;
  tiktokPrivacyLevel: string;
  useQueue: boolean;
};

export async function scheduleSocialPublishingPost({
  caption,
  hasAudio,
  mediaFiles,
  socialAccountIds,
  sourceId,
  sourceType,
  title,
  tiktokCommercialContentType,
  tiktokConsentGiven,
  tiktokPrivacyLevel,
  useQueue,
}: ScheduleSocialPublishingPostOptions) {
  const uploadedMediaFiles: SocialPublishingUploadedMedia[] = [];

  for (const mediaFile of mediaFiles) {
    uploadedMediaFiles.push(
      await uploadSocialPublishingScheduleMedia({
        mediaFile,
        sourceId,
        sourceType,
      }),
    );
  }

  const response = await fetch("/api/social-publishing/schedule", {
    body: JSON.stringify({
      caption,
      hasAudio,
      mediaFiles: uploadedMediaFiles,
      socialAccountIds,
      sourceId,
      sourceType,
      title,
      tiktokCommercialContentType,
      tiktokConsentGiven,
      tiktokPrivacyLevel,
      useQueue,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await readSocialPublishingClientErrorMessage(
        response,
        "Unable to schedule this post.",
      ),
    );
  }

  return (await response.json()) as {
    post: SocialPublishingPost;
    postReference: SocialPublishingPostReference;
  };
}
