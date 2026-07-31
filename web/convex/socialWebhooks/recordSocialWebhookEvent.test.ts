import { beforeEach, describe, expect, it, vi } from "vitest";
import { recordSocialWebhookEvent } from "./recordSocialWebhookEvent";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));

function createContext(
  existingExternalEvent: unknown,
  existingPayload: unknown,
) {
  return {
    db: {
      insert: vi.fn(),
      query: vi.fn(() => {
        const index = { eq: vi.fn(() => index) };
        const chain = {
          unique: vi.fn(async () => null),
          withIndex: vi.fn(
            (name: string, callback: (value: typeof index) => void) => {
              callback(index);
              return {
                unique: vi.fn(async () =>
                  name === "by_platform_external_event"
                    ? existingExternalEvent
                    : existingPayload,
                ),
              };
            },
          ),
        };

        return chain;
      }),
    },
  };
}

const event = {
  secret: "rate-secret",
  platform: "tiktok" as const,
  id: "event_1",
  externalEventId: "external_1",
  eventType: "publish.complete",
  signatureTimestamp: "1785283200",
  payloadHash: "payload_hash",
  now: "2026-08-01T00:00:00.000Z",
};

describe("recordSocialWebhookEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a repeated external event or payload without storing it again", async () => {
    const ctx = createContext(null, {
      _id: "existing_event",
      id: "event_existing",
      disposition: "failed",
    });
    const handler = (recordSocialWebhookEvent as unknown as ConvexFunction)
      .handler;

    await expect(handler(ctx, event)).resolves.toEqual({
      duplicate: true,
      disposition: "failed",
      id: "event_existing",
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("stores only a payload hash for a new event", async () => {
    const ctx = createContext(null, null);
    const handler = (recordSocialWebhookEvent as unknown as ConvexFunction)
      .handler;

    await expect(handler(ctx, event)).resolves.toEqual({
      duplicate: false,
      disposition: "received",
      id: "event_1",
    });
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "socialWebhookEvents",
      expect.objectContaining({
        payloadHash: "payload_hash",
        disposition: "received",
      }),
    );
    expect(ctx.db.insert).not.toHaveBeenCalledWith(
      "socialWebhookEvents",
      expect.objectContaining({ payloadJson: expect.anything() }),
    );
  });
});
