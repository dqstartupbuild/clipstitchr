import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import { uploadPostBridgeScheduleMedia } from "@/lib/clipstitchr/client/uploadPostBridgeScheduleMedia";
import type { PostBridgePostReference } from "@/lib/clipstitchr/types/PostBridgePostReference";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";
import type { PostBridgeScheduleMediaFile } from "@/lib/clipstitchr/types/PostBridgeScheduleMediaFile";
import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";
import type { PostBridgeUploadedMedia } from "@/lib/clipstitchr/types/PostBridgeUploadedMedia";

type SchedulePostBridgePostOptions = {
  caption: string;
  hasAudio: boolean;
  mediaFiles: PostBridgeScheduleMediaFile[];
  socialAccountIds: number[];
  sourceId: string;
  sourceType: PostBridgeSourceType;
  title: string;
  useQueue: boolean;
};

export async function schedulePostBridgePost({
  caption,
  hasAudio,
  mediaFiles,
  socialAccountIds,
  sourceId,
  sourceType,
  title,
  useQueue,
}: SchedulePostBridgePostOptions) {
  const uploadedMediaFiles: PostBridgeUploadedMedia[] = [];

  for (const mediaFile of mediaFiles) {
    uploadedMediaFiles.push(
      await uploadPostBridgeScheduleMedia({
        mediaFile,
        sourceId,
        sourceType,
      }),
    );
  }

  const response = await fetch("/api/post-bridge/schedule", {
    body: JSON.stringify({
      caption,
      hasAudio,
      mediaFiles: uploadedMediaFiles,
      socialAccountIds,
      sourceId,
      sourceType,
      title,
      useQueue,
    }),
    headers: {
      "Content-Type": "application/json",
    },
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
