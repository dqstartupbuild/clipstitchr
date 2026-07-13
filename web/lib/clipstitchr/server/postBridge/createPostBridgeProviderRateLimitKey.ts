import { createHash } from "node:crypto";

export function createPostBridgeProviderRateLimitKey(apiKey: string) {
  return createHash("sha256").update(apiKey).digest("hex");
}
