import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createSocialPublishingProviderRateLimitKey } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingProviderRateLimitKey";

describe("createSocialPublishingProviderRateLimitKey", () => {
  it("creates a stable hash without exposing the API key", () => {
    const apiKey = "zernio_secret";

    const key = createSocialPublishingProviderRateLimitKey(apiKey);

    expect(key).toBe(createHash("sha256").update(apiKey).digest("hex"));
    expect(key).not.toContain(apiKey);
  });
});
