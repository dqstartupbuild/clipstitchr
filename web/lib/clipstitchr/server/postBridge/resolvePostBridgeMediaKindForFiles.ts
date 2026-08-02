import { getPostBridgeMediaKindFromMimeType } from "@/lib/clipstitchr/server/postBridge/getPostBridgeMediaKindFromMimeType";
import type { PostBridgeMediaKind } from "@/lib/clipstitchr/types/PostBridgeMediaKind";

export function resolvePostBridgeMediaKindForFiles(
  files: File[],
): PostBridgeMediaKind {
  const mediaKinds = files.map((file) =>
    getPostBridgeMediaKindFromMimeType(file.type),
  );
  const mediaKind = mediaKinds[0];

  if (!mediaKind || mediaKinds.some((kind) => kind !== mediaKind)) {
    throw new Error("Schedule either images or one video, not both.");
  }

  if (mediaKind === "video" && files.length > 1) {
    throw new Error("Schedule one video at a time.");
  }

  return mediaKind;
}
