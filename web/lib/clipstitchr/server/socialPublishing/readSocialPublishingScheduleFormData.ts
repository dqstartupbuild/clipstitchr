import { getSocialPublishingFormText } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingFormText";
import { getSocialPublishingScheduleFiles } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingScheduleFiles";
import { getSocialPublishingSourceType } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingSourceType";
import { normalizeSocialPublishingCaption } from "@/lib/clipstitchr/server/socialPublishing/normalizeSocialPublishingCaption";
import { normalizeSocialPublishingScheduledAt } from "@/lib/clipstitchr/server/socialPublishing/normalizeSocialPublishingScheduledAt";
import { normalizeSocialPublishingTitle } from "@/lib/clipstitchr/server/socialPublishing/normalizeSocialPublishingTitle";
import { parseSocialPublishingSocialAccountIds } from "@/lib/clipstitchr/server/socialPublishing/parseSocialPublishingSocialAccountIds";
import type { SocialPublishingSourceType } from "@/lib/clipstitchr/types/SocialPublishingSourceType";

export type SocialPublishingScheduleFormData = {
  caption: string;
  files: File[];
  hasAudio: boolean;
  scheduledAt: string | null;
  socialAccountIds: string[];
  sourceId: string;
  sourceType: SocialPublishingSourceType;
  title: string;
};

export async function readSocialPublishingScheduleFormData(
  request: Request,
): Promise<SocialPublishingScheduleFormData> {
  const formData = await request.formData();
  const sourceId = getSocialPublishingFormText(formData, "sourceId");

  if (!sourceId) {
    throw new Error("Choose a stitch or Swipe before scheduling.");
  }

  return {
    caption: normalizeSocialPublishingCaption(
      getSocialPublishingFormText(formData, "caption"),
    ),
    files: getSocialPublishingScheduleFiles(formData),
    hasAudio: getSocialPublishingFormText(formData, "hasAudio") === "true",
    scheduledAt: normalizeSocialPublishingScheduledAt(
      getSocialPublishingFormText(formData, "scheduledAt"),
    ),
    socialAccountIds: parseSocialPublishingSocialAccountIds(
      getSocialPublishingFormText(formData, "socialAccountIds", "[]"),
    ),
    sourceId,
    sourceType: getSocialPublishingSourceType(formData.get("sourceType")),
    title: normalizeSocialPublishingTitle(
      getSocialPublishingFormText(formData, "title"),
      sourceId,
    ),
  };
}
