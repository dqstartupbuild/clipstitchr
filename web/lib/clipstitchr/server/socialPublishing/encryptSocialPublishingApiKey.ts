import { createCipheriv, randomBytes } from "node:crypto";
import { createSocialPublishingApiKeyCipherKey } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingApiKeyCipherKey";

export function encryptSocialPublishingApiKey(apiKey: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    "aes-256-gcm",
    createSocialPublishingApiKeyCipherKey(),
    iv,
  );
  const encrypted = Buffer.concat([
    cipher.update(apiKey.trim(), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}
