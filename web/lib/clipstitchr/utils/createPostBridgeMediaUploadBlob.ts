import type { PostBridgeScheduleMediaFile } from "@/lib/clipstitchr/types/PostBridgeScheduleMediaFile";
import { getPostBridgeMediaFallbackMimeType } from "@/lib/clipstitchr/utils/getPostBridgeMediaFallbackMimeType";

export function createPostBridgeMediaUploadBlob({
  blob,
  mediaKind,
}: PostBridgeScheduleMediaFile) {
  return blob.type
    ? blob
    : new Blob([blob], {
        type: getPostBridgeMediaFallbackMimeType(mediaKind),
      });
}
