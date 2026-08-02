import { createCipheriv, createHmac, randomBytes } from "node:crypto";

import type { PublishingMediaGatewayTokenClaims } from "./PublishingMediaGatewayTokenClaims.js";
import { validatePublishingMediaGatewayTokenClaims } from "./validatePublishingMediaGatewayTokenClaims.js";

export const sealPublishingMediaGatewayToken = (
  claims: PublishingMediaGatewayTokenClaims,
  secret: string,
  createInitializationVector: () => Buffer = () => randomBytes(12),
): string => {
  const validatedClaims = validatePublishingMediaGatewayTokenClaims(claims);
  const plaintext = Buffer.from(JSON.stringify(validatedClaims), "utf8");

  if (plaintext.byteLength > 4_096 || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("Publishing media token configuration is invalid.");
  }

  const initializationVector = createInitializationVector();

  if (initializationVector.byteLength !== 12) {
    throw new Error("Publishing media token initialization vector is invalid.");
  }

  const encryptionKey = createHmac("sha256", secret)
    .update("clipstitchr:publishing-media-encryption:v1", "utf8")
    .digest();
  const cipher = createCipheriv(
    "aes-256-gcm",
    encryptionKey,
    initializationVector,
  );
  cipher.setAAD(Buffer.from("v1", "utf8"));
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authenticationTag = cipher.getAuthTag();
  const unsignedToken = [
    "v1",
    initializationVector.toString("base64url"),
    ciphertext.toString("base64url"),
    authenticationTag.toString("base64url"),
  ].join(".");
  const signature = createHmac("sha256", secret)
    .update("clipstitchr:publishing-media-signature:v1\0", "utf8")
    .update(unsignedToken, "utf8")
    .digest("base64url");

  return `${unsignedToken}.${signature}`;
};
