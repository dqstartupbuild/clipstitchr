import type { PostBridgeMediaKind } from "@/lib/clipstitchr/types/PostBridgeMediaKind";
import { getAssetDownloadFileName } from "@/lib/clipstitchr/utils/getAssetDownloadFileName";
import { getPostBridgeMediaFileExtension } from "@/lib/clipstitchr/utils/getPostBridgeMediaFileExtension";

export function getPostBridgeMediaFileName(
  name: string,
  mediaKind: PostBridgeMediaKind = "video",
) {
  return getAssetDownloadFileName(
    name || "clipstitchr-post",
    getPostBridgeMediaFileExtension(mediaKind),
  );
}
