import { afterEach, describe, expect, it } from "vitest";
import { GET } from "./route";

const originalPublishingProvider = process.env.SOCIAL_PUBLISHING_PROVIDER;
const originalVerifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;

afterEach(() => {
  if (originalPublishingProvider === undefined) {
    delete process.env.SOCIAL_PUBLISHING_PROVIDER;
  } else {
    process.env.SOCIAL_PUBLISHING_PROVIDER = originalPublishingProvider;
  }

  if (originalVerifyToken === undefined) {
    delete process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
  } else {
    process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN = originalVerifyToken;
  }
});

describe("Instagram webhook verification", () => {
  it("answers Meta's challenge while in-house publishing is staged off", async () => {
    process.env.SOCIAL_PUBLISHING_PROVIDER = "post_bridge";
    process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN = "verify-me";

    const response = await GET(
      new Request(
        "https://clipstitchr.com/api/social/webhooks/instagram?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=challenge-123",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("challenge-123");
  });

  it("rejects an invalid verification token", async () => {
    process.env.SOCIAL_PUBLISHING_PROVIDER = "post_bridge";
    process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN = "verify-me";

    const response = await GET(
      new Request(
        "https://clipstitchr.com/api/social/webhooks/instagram?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=challenge-123",
      ),
    );

    expect(response.status).toBe(403);
  });
});
