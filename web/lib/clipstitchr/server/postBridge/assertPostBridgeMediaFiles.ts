import { assertPostBridgeMediaFile } from "@/lib/clipstitchr/server/postBridge/assertPostBridgeMediaFile";

export function assertPostBridgeMediaFiles(files: File[]) {
  if (!files.length) {
    throw new Error("Choose media before scheduling.");
  }

  for (const file of files) {
    assertPostBridgeMediaFile(file);
  }
}
