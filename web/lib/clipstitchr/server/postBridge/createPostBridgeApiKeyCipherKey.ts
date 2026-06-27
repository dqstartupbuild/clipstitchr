import { createHash } from "node:crypto";
import { getPostBridgeApiKeyEncryptionSecret } from "@/lib/clipstitchr/server/postBridge/getPostBridgeApiKeyEncryptionSecret";

export function createPostBridgeApiKeyCipherKey() {
  return createHash("sha256")
    .update(getPostBridgeApiKeyEncryptionSecret())
    .digest();
}
