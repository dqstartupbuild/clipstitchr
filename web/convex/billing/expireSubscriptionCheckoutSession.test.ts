import { describe, expect, it, vi } from "vitest";
import { expireSubscriptionCheckoutSession } from "./expireSubscriptionCheckoutSession";

type ExpireHandler = {
  handler: (
    ctx: unknown,
    args: {
      now: string;
      ownerId: string;
      stripeCheckoutSessionId: string;
    },
  ) => Promise<boolean>;
};

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));

describe("expireSubscriptionCheckoutSession", () => {
  it("does not overwrite a completed Checkout after a webhook race", async () => {
    const patch = vi.fn();
    const ctx = {
      db: {
        patch,
        query: vi.fn(() => ({
          withIndex: vi.fn(() => ({
            unique: vi.fn(async () => ({
              _id: "checkout_1",
              mode: "subscription",
              ownerId: "owner_1",
              status: "completed",
            })),
          })),
        })),
      },
    };

    await expect(
      (expireSubscriptionCheckoutSession as unknown as ExpireHandler).handler(
        ctx,
        {
          now: "2026-07-16T12:00:00.000Z",
          ownerId: "owner_1",
          stripeCheckoutSessionId: "cs_owner",
        },
      ),
    ).resolves.toBe(false);
    expect(patch).not.toHaveBeenCalled();
  });
});
