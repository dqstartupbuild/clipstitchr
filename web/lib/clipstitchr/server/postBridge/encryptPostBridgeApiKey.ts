import { createCipheriv, randomBytes } from "node:crypto";
import { createPostBridgeApiKeyCipherKey } from "@/lib/clipstitchr/server/postBridge/createPostBridgeApiKeyCipherKey";

export function encryptPostBridgeApiKey(apiKey: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    "aes-256-gcm",
    createPostBridgeApiKeyCipherKey(),
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
