import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createPostBridgeProviderRateLimitKey } from "@/lib/clipstitchr/server/postBridge/createPostBridgeProviderRateLimitKey";

describe("createPostBridgeProviderRateLimitKey", () => {
  it("creates a stable hash without exposing the API key", () => {
    const apiKey = "post_bridge_secret";

    const key = createPostBridgeProviderRateLimitKey(apiKey);

    expect(key).toBe(createHash("sha256").update(apiKey).digest("hex"));
    expect(key).not.toContain(apiKey);
  });
});
