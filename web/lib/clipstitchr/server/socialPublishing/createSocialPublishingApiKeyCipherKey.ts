import { createHash } from "node:crypto";
import { getSocialPublishingApiKeyEncryptionSecret } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingApiKeyEncryptionSecret";

export function createSocialPublishingApiKeyCipherKey() {
  return createHash("sha256")
    .update(getSocialPublishingApiKeyEncryptionSecret())
    .digest();
}
