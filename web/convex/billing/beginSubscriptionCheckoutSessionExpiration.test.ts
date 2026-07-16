import { describe, expect, it, vi } from "vitest";
import { beginSubscriptionCheckoutSessionExpiration } from "./beginSubscriptionCheckoutSessionExpiration";

type BeginHandler = {
  handler: (
    ctx: unknown,
    args: {
      allowHandedOff: boolean;
      now: string;
      ownerId: string;
      stripeCheckoutSessionId: string;
    },
  ) => Promise<boolean>;
};

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));

describe("beginSubscriptionCheckoutSessionExpiration", () => {
  it("does not expire a Checkout already handed to the browser implicitly", async () => {
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
              status: "handedOff",
            })),
          })),
        })),
      },
    };

    await expect(
      (
        beginSubscriptionCheckoutSessionExpiration as unknown as BeginHandler
      ).handler(ctx, {
        allowHandedOff: false,
        now: "2026-07-16T12:00:00.000Z",
        ownerId: "owner_1",
        stripeCheckoutSessionId: "cs_owner",
      }),
    ).resolves.toBe(false);
    expect(patch).not.toHaveBeenCalled();
  });

  it("lets an exact canceled return start expiration explicitly", async () => {
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
              status: "handedOff",
            })),
          })),
        })),
      },
    };

    await expect(
      (
        beginSubscriptionCheckoutSessionExpiration as unknown as BeginHandler
      ).handler(ctx, {
        allowHandedOff: true,
        now: "2026-07-16T12:00:00.000Z",
        ownerId: "owner_1",
        stripeCheckoutSessionId: "cs_owner",
      }),
    ).resolves.toBe(true);
    expect(patch).toHaveBeenCalledWith(
      "checkout_1",
      expect.objectContaining({ status: "expiring" }),
    );
  });
});
