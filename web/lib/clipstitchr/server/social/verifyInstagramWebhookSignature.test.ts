import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { verifyInstagramWebhookSignature } from "./verifyInstagramWebhookSignature";

const originalSecret = process.env.INSTAGRAM_CLIENT_SECRET;

describe("verifyInstagramWebhookSignature", () => {
  afterEach(() => {
    process.env.INSTAGRAM_CLIENT_SECRET = originalSecret;
  });

  it("accepts only an HMAC made with the configured app secret", () => {
    process.env.INSTAGRAM_CLIENT_SECRET = "webhook-secret";
    const body = '{"object":"instagram"}';
    const signature = createHmac("sha256", "webhook-secret")
      .update(body, "utf8")
      .digest("hex");

    expect(
      verifyInstagramWebhookSignature(body, `sha256=${signature}`),
    ).toBe(true);
    expect(
      verifyInstagramWebhookSignature(body, `sha256=${"0".repeat(64)}`),
    ).toBe(false);
  });
});
