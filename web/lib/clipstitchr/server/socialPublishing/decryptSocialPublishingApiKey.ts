import { createDecipheriv } from "node:crypto";
import { createSocialPublishingApiKeyCipherKey } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingApiKeyCipherKey";

export function decryptSocialPublishingApiKey(encryptedApiKey: string) {
  const [version, ivValue, tagValue, encryptedValue] = encryptedApiKey.split(":");

  if (
    version !== "v1" ||
    !ivValue ||
    !tagValue ||
    !encryptedValue
  ) {
    throw new Error("Saved Zernio key is not readable.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    createSocialPublishingApiKeyCipherKey(),
    Buffer.from(ivValue, "base64"),
  );

  decipher.setAuthTag(Buffer.from(tagValue, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
