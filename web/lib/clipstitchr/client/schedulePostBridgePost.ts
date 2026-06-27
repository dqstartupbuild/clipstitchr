import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import type { PostBridgePostReference } from "@/lib/clipstitchr/types/PostBridgePostReference";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";
import type { PostBridgeScheduleMediaFile } from "@/lib/clipstitchr/types/PostBridgeScheduleMediaFile";
import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";
import { createPostBridgeMediaUploadBlob } from "@/lib/clipstitchr/utils/createPostBridgeMediaUploadBlob";

type SchedulePostBridgePostOptions = {
  caption: string;
  hasAudio: boolean;
  mediaFiles: PostBridgeScheduleMediaFile[];
  scheduledAt: string;
  socialAccountIds: number[];
  sourceId: string;
  sourceType: PostBridgeSourceType;
  title: string;
};

export async function schedulePostBridgePost({
  caption,
  hasAudio,
  mediaFiles,
  scheduledAt,
  socialAccountIds,
  sourceId,
  sourceType,
  title,
}: SchedulePostBridgePostOptions) {
  const formData = new FormData();

  formData.set("caption", caption);
  formData.set("hasAudio", String(hasAudio));
  for (const mediaFile of mediaFiles) {
    formData.append(
      "media",
      createPostBridgeMediaUploadBlob(mediaFile),
      mediaFile.fileName,
    );
  }
  formData.set("scheduledAt", scheduledAt);
  formData.set("socialAccountIds", JSON.stringify(socialAccountIds));
  formData.set("sourceId", sourceId);
  formData.set("sourceType", sourceType);
  formData.set("title", title);

  const response = await fetch("/api/post-bridge/schedule", {
    body: formData,
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await readPostBridgeClientErrorMessage(
        response,
        "Unable to schedule this post.",
      ),
    );
  }

  return (await response.json()) as {
    post: PostBridgePost;
    postReference: PostBridgePostReference;
  };
}
