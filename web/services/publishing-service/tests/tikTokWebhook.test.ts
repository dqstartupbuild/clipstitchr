import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import { claimTikTokWebhookReplay } from "../src/provider-runtime/tiktok/claimTikTokWebhookReplay.js";
import { verifyTikTokWebhook } from "../src/provider-runtime/tiktok/verifyTikTokWebhook.js";

describe("TikTok webhook verification", () => {
  it("verifies the raw body and timestamp before parsing JSON", () => {
    const secret = "tiktok-secret-placeholder";
    const timestamp = 1_785_600_000;
    const rawBody = Buffer.from('{"event":"post.publish.complete"}');
    const signature = createHmac("sha256", secret)
      .update(Buffer.concat([Buffer.from(`${timestamp}.`), rawBody]))
      .digest("hex");

    const verified = verifyTikTokWebhook(
        rawBody,
        `t=${timestamp},s=${signature}`,
        secret,
        timestamp * 1_000,
      );
    expect(verified).toEqual({
      timestampEpochSeconds: timestamp,
      dedupeKey: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/),
      body: { event: "post.publish.complete" },
    });
  });

  it("rejects an invalid or stale signature", () => {
    const body = Buffer.from("{}");
    expect(() =>
      verifyTikTokWebhook(
        body,
        `t=1785600000,s=${"0".repeat(64)}`,
        "tiktok-secret-placeholder",
        1_785_600_000_000,
      ),
    ).toThrow();
    expect(() =>
      verifyTikTokWebhook(
        body,
        `t=1,s=${"0".repeat(64)}`,
        "tiktok-secret-placeholder",
        1_785_600_000_000,
      ),
    ).toThrow();
  });

  it("rejects duplicate signature fields and exposes a replay claim seam", async () => {
    const secret = "tiktok-secret-placeholder";
    const timestamp = 1_785_600_000;
    const rawBody = Buffer.from("{}");
    const signature = createHmac("sha256", secret)
      .update(Buffer.concat([Buffer.from(`${timestamp}.`), rawBody]))
      .digest("hex");
    expect(() =>
      verifyTikTokWebhook(
        rawBody,
        `t=${timestamp},t=${timestamp},s=${signature}`,
        secret,
        timestamp * 1_000,
      ),
    ).toThrow();

    const webhook = verifyTikTokWebhook(
      rawBody,
      `t=${timestamp},s=${signature}`,
      secret,
      timestamp * 1_000,
    );
    const claimed = new Set<string>();
    const protector = {
      claim: async (key: string) => {
        if (claimed.has(key)) return false;
        claimed.add(key);
        return true;
      },
    };
    await expect(claimTikTokWebhookReplay(webhook, protector)).resolves.toBeUndefined();
    await expect(claimTikTokWebhookReplay(webhook, protector)).rejects.toMatchObject({
      code: "rejected",
    });
  });
});
