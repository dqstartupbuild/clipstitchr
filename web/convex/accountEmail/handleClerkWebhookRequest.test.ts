import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActionCtx } from "../_generated/server";
import { handleClerkWebhookRequest } from "./handleClerkWebhookRequest";

const mocks = vi.hoisted(() => ({ verifyWebhook: vi.fn() }));

vi.mock("@clerk/backend/webhooks", () => ({
  verifyWebhook: mocks.verifyWebhook,
}));

const timestampSeconds = 1_784_208_000;
const eventAt = timestampSeconds * 1_000;
const now = eventAt + 100;
const signingSecret = "whsec_development_only";

function createRequest(
  body = "{}",
  headerOverrides: Record<string, string> = {},
) {
  return new Request("https://convex.example/webhooks/clerk", {
    body,
    headers: {
      "content-type": "application/json",
      "svix-id": "webhook_123",
      "svix-signature": "v1,signature",
      "svix-timestamp": String(timestampSeconds),
      ...headerOverrides,
    },
    method: "POST",
  });
}

function createContext() {
  return {
    runMutation: vi.fn().mockResolvedValue({
      status: "processed",
      welcomeEligible: true,
    }),
  } as unknown as ActionCtx;
}

function createUserEvent(type: "user.created" | "user.updated" = "user.created") {
  return {
    data: {
      email_addresses: [
        {
          email_address: " Person@Example.COM ",
          id: "email_primary",
          verification: { status: "verified" },
        },
      ],
      first_name: " Person ",
      id: "user_123",
      last_name: " Example ",
      primary_email_address_id: "email_primary",
      username: null,
    },
    object: "event",
    type,
  };
}

describe("handleClerkWebhookRequest", () => {
  beforeEach(() => vi.clearAllMocks());

  it("verifies a request clone and forwards sanitized primary contact data", async () => {
    const request = createRequest(JSON.stringify({ signed: true }));
    const context = createContext();
    mocks.verifyWebhook.mockImplementationOnce(async (verifiedRequest: Request) => {
      await expect(verifiedRequest.text()).resolves.toBe('{"signed":true}');
      return createUserEvent() as never;
    });

    const response = await handleClerkWebhookRequest(context, request, {
      now,
      signingSecret,
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      accepted: true,
      status: "processed",
      welcomeEligible: true,
    });
    expect(mocks.verifyWebhook).toHaveBeenCalledWith(
      expect.any(Request),
      { signingSecret },
    );
    expect(mocks.verifyWebhook.mock.calls[0]?.[0]).not.toBe(request);
    expect(context.runMutation).toHaveBeenCalledWith(expect.anything(), {
      contact: {
        displayName: "Person Example",
        firstName: "Person",
        normalizedEmail: "person@example.com",
        primaryEmailId: "email_primary",
      },
      eventAt,
      eventType: "user.created",
      ownerId: "user_123",
      processedAt: now,
      webhookId: "webhook_123",
    });
    await expect(request.text()).resolves.toBe('{"signed":true}');
  });

  it.each([
    ["missing", ""],
    ["oversized", "x".repeat(257)],
  ])("rejects a %s svix-id before verification", async (_label, webhookId) => {
    const context = createContext();
    const response = await handleClerkWebhookRequest(
      context,
      createRequest("{}", { "svix-id": webhookId }),
      { now, signingSecret },
    );

    expect(response.status).toBe(400);
    expect(mocks.verifyWebhook).not.toHaveBeenCalled();
    expect(context.runMutation).not.toHaveBeenCalled();
  });

  it("rejects an oversized body before signature verification", async () => {
    const context = createContext();
    const response = await handleClerkWebhookRequest(
      context,
      createRequest("x".repeat(64 * 1_024 + 1)),
      { now, signingSecret },
    );

    expect(response.status).toBe(413);
    expect(mocks.verifyWebhook).not.toHaveBeenCalled();
    expect(context.runMutation).not.toHaveBeenCalled();
  });

  it("rejects a failed signature without reconciling", async () => {
    const context = createContext();
    mocks.verifyWebhook.mockRejectedValueOnce(new Error("invalid signature"));

    const response = await handleClerkWebhookRequest(
      context,
      createRequest(),
      { now, signingSecret },
    );

    expect(response.status).toBe(401);
    expect(context.runMutation).not.toHaveBeenCalled();
  });

  it("ignores a signed event outside the exact user allowlist", async () => {
    const context = createContext();
    mocks.verifyWebhook.mockResolvedValueOnce({
      data: { id: "session_123" },
      object: "event",
      type: "session.created",
    } as never);

    const response = await handleClerkWebhookRequest(
      context,
      createRequest(),
      { now, signingSecret },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      accepted: true,
      status: "ignored",
      welcomeEligible: false,
    });
    expect(context.runMutation).not.toHaveBeenCalled();
  });

  it("rejects the wrong content type before reading the body", async () => {
    const context = createContext();
    const response = await handleClerkWebhookRequest(
      context,
      createRequest("{}", { "content-type": "text/plain" }),
      { now, signingSecret },
    );

    expect(response.status).toBe(415);
    expect(mocks.verifyWebhook).not.toHaveBeenCalled();
  });
});
