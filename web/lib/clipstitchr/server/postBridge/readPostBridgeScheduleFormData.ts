import { getPostBridgeFormText } from "@/lib/clipstitchr/server/postBridge/getPostBridgeFormText";
import { getPostBridgeScheduleFiles } from "@/lib/clipstitchr/server/postBridge/getPostBridgeScheduleFiles";
import { getPostBridgeSourceType } from "@/lib/clipstitchr/server/postBridge/getPostBridgeSourceType";
import { normalizePostBridgeCaption } from "@/lib/clipstitchr/server/postBridge/normalizePostBridgeCaption";
import { normalizePostBridgeScheduledAt } from "@/lib/clipstitchr/server/postBridge/normalizePostBridgeScheduledAt";
import { normalizePostBridgeTitle } from "@/lib/clipstitchr/server/postBridge/normalizePostBridgeTitle";
import { parsePostBridgeSocialAccountIds } from "@/lib/clipstitchr/server/postBridge/parsePostBridgeSocialAccountIds";
import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";

export type PostBridgeScheduleFormData = {
  caption: string;
  files: File[];
  hasAudio: boolean;
  scheduledAt: string;
  socialAccountIds: number[];
  sourceId: string;
  sourceType: PostBridgeSourceType;
  title: string;
};

export async function readPostBridgeScheduleFormData(
  request: Request,
): Promise<PostBridgeScheduleFormData> {
  const formData = await request.formData();
  const sourceId = getPostBridgeFormText(formData, "sourceId");

  if (!sourceId) {
    throw new Error("Choose a stitch or Swipe before scheduling.");
  }

  return {
    caption: normalizePostBridgeCaption(
      getPostBridgeFormText(formData, "caption"),
    ),
    files: getPostBridgeScheduleFiles(formData),
    hasAudio: getPostBridgeFormText(formData, "hasAudio") === "true",
    scheduledAt: normalizePostBridgeScheduledAt(
      getPostBridgeFormText(formData, "scheduledAt"),
    ),
    socialAccountIds: parsePostBridgeSocialAccountIds(
      getPostBridgeFormText(formData, "socialAccountIds", "[]"),
    ),
    sourceId,
    sourceType: getPostBridgeSourceType(formData.get("sourceType")),
    title: normalizePostBridgeTitle(
      getPostBridgeFormText(formData, "title"),
      sourceId,
    ),
  };
}
