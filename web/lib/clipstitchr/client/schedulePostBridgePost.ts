import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import type { PostBridgePostReference } from "@/lib/clipstitchr/types/PostBridgePostReference";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";
import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";

type SchedulePostBridgePostOptions = {
  caption: string;
  fileName: string;
  hasAudio: boolean;
  mediaBlob: Blob;
  scheduledAt: string;
  socialAccountIds: number[];
  sourceId: string;
  sourceType: PostBridgeSourceType;
  title: string;
};

export async function schedulePostBridgePost({
  caption,
  fileName,
  hasAudio,
  mediaBlob,
  scheduledAt,
  socialAccountIds,
  sourceId,
  sourceType,
  title,
}: SchedulePostBridgePostOptions) {
  const formData = new FormData();

  formData.set("caption", caption);
  formData.set("hasAudio", String(hasAudio));
  formData.set("media", mediaBlob, fileName);
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
