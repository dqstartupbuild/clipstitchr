import { describe, expect, it, vi } from "vitest";
import { confirmSubscriptionCheckoutSessionReturn } from "./confirmSubscriptionCheckoutSessionReturn";

type ConfirmHandler = {
  handler: (ctx: unknown, args: Record<string, string>) => Promise<boolean>;
};

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));

const args = {
  catalogKey: "pro",
  checkoutIntentId: "intent_owner",
  now: "2026-07-16T12:00:00.000Z",
  ownerId: "owner_1",
  returnTarget: "onboarding",
  stripeCheckoutSessionId: "cs_owner",
};

describe("confirmSubscriptionCheckoutSessionReturn", () => {
  it("atomically marks an exact created Checkout as handed off", async () => {
    const patch = vi.fn();
    const ctx = {
      db: {
        patch,
        query: vi.fn(() => ({
          withIndex: vi.fn(() => ({
            unique: vi.fn(async () => ({
              _id: "checkout_1",
              ...args,
              mode: "subscription",
              status: "created",
            })),
          })),
        })),
      },
    };

    await expect(
      (
        confirmSubscriptionCheckoutSessionReturn as unknown as ConfirmHandler
      ).handler(ctx, args),
    ).resolves.toBe(true);
    expect(patch).toHaveBeenCalledWith(
      "checkout_1",
      expect.objectContaining({
        handedOffAt: args.now,
        status: "handedOff",
      }),
    );
  });

  it("accepts an identical handed-off replay without rewriting it", async () => {
    const patch = vi.fn();
    const ctx = {
      db: {
        patch,
        query: vi.fn(() => ({
          withIndex: vi.fn(() => ({
            unique: vi.fn(async () => ({
              _id: "checkout_1",
              ...args,
              mode: "subscription",
              status: "handedOff",
            })),
          })),
        })),
      },
    };

    await expect(
      (
        confirmSubscriptionCheckoutSessionReturn as unknown as ConfirmHandler
      ).handler(ctx, args),
    ).resolves.toBe(true);
    expect(patch).not.toHaveBeenCalled();
  });

  it("refuses an expiring Checkout", async () => {
    const patch = vi.fn();
    const ctx = {
      db: {
        patch,
        query: vi.fn(() => ({
          withIndex: vi.fn(() => ({
            unique: vi.fn(async () => ({
              _id: "checkout_1",
              ...args,
              mode: "subscription",
              status: "expiring",
            })),
          })),
        })),
      },
    };

    await expect(
      (
        confirmSubscriptionCheckoutSessionReturn as unknown as ConfirmHandler
      ).handler(ctx, args),
    ).resolves.toBe(false);
    expect(patch).not.toHaveBeenCalled();
  });
});
