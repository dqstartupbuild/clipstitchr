import { createHmac } from "node:crypto";

export function createPublishingMediaQuotaIdentity(
  tenantKey: string,
  secret: string,
) {
  const normalizedTenantKey = tenantKey.trim();

  if (!normalizedTenantKey || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("Publishing media quota identity configuration is invalid.");
  }

  const digest = createHmac("sha256", secret)
    .update("clipstitchr:publishing-media-quota:v1\0", "utf8")
    .update(normalizedTenantKey, "utf8")
    .digest("base64url");

  return `pmq_${digest}`;
}
