import { getAssetDownloadFileName } from "@/lib/clipstitchr/utils/getAssetDownloadFileName";

export function getPostBridgeMediaFileName(name: string) {
  return getAssetDownloadFileName(name || "clipstitchr-post", "mp4");
}
