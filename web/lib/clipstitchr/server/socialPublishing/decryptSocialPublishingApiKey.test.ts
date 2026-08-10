import { afterEach, describe, expect, it } from "vitest";
import { decryptSocialPublishingApiKey } from "@/lib/clipstitchr/server/socialPublishing/decryptSocialPublishingApiKey";
import { encryptSocialPublishingApiKey } from "@/lib/clipstitchr/server/socialPublishing/encryptSocialPublishingApiKey";

const originalSecret = process.env.SOCIAL_PUBLISHING_API_KEY_ENCRYPTION_SECRET;

describe("Zernio API key encryption", () => {
  afterEach(() => {
    process.env.SOCIAL_PUBLISHING_API_KEY_ENCRYPTION_SECRET = originalSecret;
  });

  it("round trips a saved API key without storing it directly", () => {
    process.env.SOCIAL_PUBLISHING_API_KEY_ENCRYPTION_SECRET = "test-secret";

    const encrypted = encryptSocialPublishingApiKey(" pb_test_key ");

    expect(encrypted).not.toContain("pb_test_key");
    expect(decryptSocialPublishingApiKey(encrypted)).toBe("pb_test_key");
  });

  it("rejects unreadable saved values", () => {
    process.env.SOCIAL_PUBLISHING_API_KEY_ENCRYPTION_SECRET = "test-secret";

    expect(() => decryptSocialPublishingApiKey("broken")).toThrow(
      "Saved Zernio key is not readable.",
    );
  });
});
