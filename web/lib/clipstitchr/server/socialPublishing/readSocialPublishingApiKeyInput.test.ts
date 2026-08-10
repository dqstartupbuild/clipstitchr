import { describe, expect, it } from "vitest";
import { readSocialPublishingApiKeyInput } from "@/lib/clipstitchr/server/socialPublishing/readSocialPublishingApiKeyInput";

function createRequest(apiKey: unknown) {
  return new Request("https://clipstitchr.test/api/social-publishing/settings", {
    body: JSON.stringify({ apiKey }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

describe("readSocialPublishingApiKeyInput", () => {
  it("accepts a complete Zernio key", async () => {
    const apiKey = "sk_" + "a".repeat(64);

    await expect(
      readSocialPublishingApiKeyInput(createRequest("  " + apiKey + "  ")),
    ).resolves.toBe(apiKey);
  });

  it("rejects incomplete and non-Zernio keys", async () => {
    await expect(
      readSocialPublishingApiKeyInput(createRequest("pb_old_key")),
    ).rejects.toThrow("does not look like a Zernio API key");
  });
});

