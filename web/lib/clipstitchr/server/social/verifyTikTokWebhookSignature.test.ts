import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { verifyTikTokWebhookSignature } from "./verifyTikTokWebhookSignature";

const originalSecret = process.env.TIKTOK_CLIENT_SECRET;

describe("verifyTikTokWebhookSignature", () => {
  afterEach(() => {
    process.env.TIKTOK_CLIENT_SECRET = originalSecret;
  });

  it("accepts a current valid signature and rejects a replayed timestamp", () => {
    process.env.TIKTOK_CLIENT_SECRET = "webhook-secret";
    const body = '{"event":"publish.complete"}';
    const timestamp = 1_785_283_200;
    const signature = createHmac("sha256", "webhook-secret")
      .update(`${timestamp}.${body}`, "utf8")
      .digest("hex");
    const header = `t=${timestamp},s=${signature}`;

    expect(
      verifyTikTokWebhookSignature({
        body,
        header,
        nowMs: timestamp * 1_000,
      }),
    ).toBe(true);
    expect(
      verifyTikTokWebhookSignature({
        body,
        header,
        nowMs: timestamp * 1_000 + 5 * 60_000 + 1,
      }),
    ).toBe(false);
  });
});
