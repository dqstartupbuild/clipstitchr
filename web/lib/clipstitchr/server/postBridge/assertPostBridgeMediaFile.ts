import { getPostBridgeMediaKindFromMimeType } from "@/lib/clipstitchr/server/postBridge/getPostBridgeMediaKindFromMimeType";
import { getPostBridgeMaxMediaBytes } from "@/lib/clipstitchr/server/postBridge/getPostBridgeMaxMediaBytes";

export function assertPostBridgeMediaFile(file: File) {
  if (!getPostBridgeMediaKindFromMimeType(file.type)) {
    throw new Error("Post Bridge supports PNG, JPEG, MP4, or MOV media.");
  }

  if (file.size <= 0) {
    throw new Error("Choose media before scheduling.");
  }

  if (file.size > getPostBridgeMaxMediaBytes()) {
    throw new Error("That media file is too large to schedule.");
  }
}
