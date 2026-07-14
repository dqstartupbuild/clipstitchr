import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { ActionCtx } from "../_generated/server";
import { handleLoopsWebhookRequest } from "./handleLoopsWebhookRequest";

const key = Buffer.from("a development webhook key");
const signingSecret = `whsec_${key.toString("base64")}`;
const webhookId = "webhook_event_123";
const now = Date.UTC(2026, 6, 13, 12);
const timestamp = String(Math.floor(now / 1_000));

function createRequest(rawBody: string, signatureBody = rawBody) {
  const signature = createHmac("sha256", key)
    .update(`${webhookId}.${timestamp}.${signatureBody}`)
    .digest("base64");

  return new Request("https://convex.example/webhooks/loops", {
    body: rawBody,
    headers: {
      "content-type": "application/json",
      "webhook-id": webhookId,
      "webhook-signature": `v1,${signature}`,
      "webhook-timestamp": timestamp,
    },
    method: "POST",
  });
}

function createContext() {
  return {
    runMutation: vi.fn().mockResolvedValue({ status: "applied" }),
  } as unknown as ActionCtx;
}

describe("handleLoopsWebhookRequest", () => {
  it("verifies and atomically forwards one supported event", async () => {
    const rawBody = JSON.stringify({
      eventName: "contact.unsubscribed",
      eventTime: Math.floor(now / 1_000),
      webhookSchemaVersion: "1.0.0",
      contactIdentity: {
        email: "person@example.com",
        id: "loops_contact_123",
        userId: "provider_opaque_key",
      },
    });
    const context = createContext();
    const response = await handleLoopsWebhookRequest(
      context,
      createRequest(rawBody),
      { now, signingSecret },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ accepted: true });
    expect(context.runMutation).toHaveBeenCalledWith(
      expect.anything(),
      {
        contactIdentity: {
          email: "person@example.com",
          id: "loops_contact_123",
          userId: "provider_opaque_key",
        },
        eventName: "contact.unsubscribed",
        eventTime: Math.floor(now / 1_000),
        mailingListId: null,
        providerEmailId: null,
        providerEmailMessageId: null,
        providerSourceId: null,
        receivedAt: now,
        sourceType: null,
        webhookId,
        webhookSchemaVersion: "1.0.0",
      },
    );
  });

  it("rejects a changed raw body before reconciliation", async () => {
    const rawBody = JSON.stringify({
      eventName: "testing.testEvent",
      eventTime: Math.floor(now / 1_000),
      message: "changed",
      webhookSchemaVersion: "1.0.0",
    });
    const context = createContext();
    const response = await handleLoopsWebhookRequest(
      context,
      createRequest(rawBody, `${rawBody} `),
      { now, signingSecret },
    );

    expect(response.status).toBe(401);
    expect(context.runMutation).not.toHaveBeenCalled();
  });

  it("rejects unsupported events after signature verification", async () => {
    const rawBody = JSON.stringify({
      eventName: "email.clicked",
      eventTime: Math.floor(now / 1_000),
      webhookSchemaVersion: "1.0.0",
    });
    const context = createContext();
    const response = await handleLoopsWebhookRequest(
      context,
      createRequest(rawBody),
      { now, signingSecret },
    );

    expect(response.status).toBe(400);
    expect(context.runMutation).not.toHaveBeenCalled();
  });

  it("returns a retryable server error when atomic reconciliation fails", async () => {
    const rawBody = JSON.stringify({
      eventName: "testing.testEvent",
      eventTime: Math.floor(now / 1_000),
      message: "test",
      webhookSchemaVersion: "1.0.0",
    });
    const context = createContext();
    vi.mocked(context.runMutation).mockRejectedValueOnce(
      new Error("database unavailable"),
    );
    const response = await handleLoopsWebhookRequest(
      context,
      createRequest(rawBody),
      { now, signingSecret },
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ accepted: false });
  });
});
