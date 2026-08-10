import { createHash } from "node:crypto";

export function createSocialPublishingProviderRateLimitKey(apiKey: string) {
  return createHash("sha256").update(apiKey).digest("hex");
}
