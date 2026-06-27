import { getPostBridgeMaxMediaBytes } from "@/lib/clipstitchr/server/postBridge/getPostBridgeMaxMediaBytes";
import { postBridgeVideoMimeTypes } from "@/lib/clipstitchr/server/postBridge/postBridgeVideoMimeTypes";

export function assertPostBridgeMediaFile(file: File) {
  if (!postBridgeVideoMimeTypes.includes(file.type)) {
    throw new Error("Post Bridge needs an MP4 video for this post.");
  }

  if (file.size <= 0) {
    throw new Error("Choose a video before scheduling.");
  }

  if (file.size > getPostBridgeMaxMediaBytes()) {
    throw new Error("That video is too large to schedule.");
  }
}
