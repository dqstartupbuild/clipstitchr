import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyLoopsWebhookSignature } from "@/lib/clipstitchr/email/webhooks/verifyLoopsWebhookSignature";

const key = Buffer.from("a development webhook key");
const signingSecret = `whsec_${key.toString("base64")}`;
const eventId = "webhook_event_123";
const timestamp = "1783958400";
const rawBody = '{"eventName":"testing.testEvent"}';

const createSignature = (body: string, signedTimestamp = timestamp) =>
  createHmac("sha256", key)
    .update(`${eventId}.${signedTimestamp}.${body}`)
    .digest("base64");

describe("verifyLoopsWebhookSignature", () => {
  it("verifies the raw body and accepts a current signature among rotations", async () => {
    await expect(
      verifyLoopsWebhookSignature({
        eventId,
        nowSeconds: Number(timestamp),
        rawBody,
        signatureHeader: `v1,invalid v1,${createSignature(rawBody)}`,
        signingSecret,
        timestamp,
      }),
    ).resolves.toBe(true);
  });

  it("rejects changed content and stale requests", async () => {
    await expect(
      verifyLoopsWebhookSignature({
        eventId,
        nowSeconds: Number(timestamp),
        rawBody: `${rawBody} `,
        signatureHeader: `v1,${createSignature(rawBody)}`,
        signingSecret,
        timestamp,
      }),
    ).resolves.toBe(false);

    await expect(
      verifyLoopsWebhookSignature({
        eventId,
        nowSeconds: Number(timestamp) + 301,
        rawBody,
        signatureHeader: `v1,${createSignature(rawBody)}`,
        signingSecret,
        timestamp,
      }),
    ).resolves.toBe(false);
  });

  it("rejects malformed timestamp syntax even when Number would coerce it", async () => {
    for (const malformedTimestamp of [
      ` ${timestamp}`,
      `+${timestamp}`,
      "1.7839584e9",
      String(Number.MAX_SAFE_INTEGER + 1),
    ]) {
      await expect(
        verifyLoopsWebhookSignature({
          eventId,
          nowSeconds: Number(timestamp),
          rawBody,
          signatureHeader: `v1,${createSignature(rawBody, malformedTimestamp)}`,
          signingSecret,
          timestamp: malformedTimestamp,
        }),
      ).resolves.toBe(false);
    }
  });
});
