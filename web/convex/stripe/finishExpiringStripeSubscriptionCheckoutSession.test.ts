import { describe, expect, it, vi } from "vitest";
import { finishExpiringStripeSubscriptionCheckoutSession } from "./finishExpiringStripeSubscriptionCheckoutSession";

vi.mock("../_generated/api", () => ({
  internal: {
    billing: {
      expireSubscriptionCheckoutSession: {
        expireSubscriptionCheckoutSession: "billing.finishExpiration",
      },
    },
  },
}));

describe("finishExpiringStripeSubscriptionCheckoutSession", () => {
  it("reconciles a remotely expired session without opening a replacement early", async () => {
    const runMutation = vi.fn(async () => true);
    const expire = vi.fn();
    const retrieve = vi.fn(async () => ({ status: "expired" }));

    await expect(
      finishExpiringStripeSubscriptionCheckoutSession(
        { runMutation } as never,
        { checkout: { sessions: { expire, retrieve } } } as never,
        {
          ownerId: "owner_1",
          stripeCheckoutSessionId: "cs_owner",
        },
      ),
    ).resolves.toBe(true);

    expect(expire).not.toHaveBeenCalled();
    expect(runMutation).toHaveBeenCalledWith(
      "billing.finishExpiration",
      expect.objectContaining({ stripeCheckoutSessionId: "cs_owner" }),
    );
  });

  it("retries a remotely open expiration before finalizing locally", async () => {
    const runMutation = vi.fn(async () => true);
    const expire = vi.fn(async () => ({ status: "expired" }));
    const retrieve = vi.fn(async () => ({ status: "open" }));

    await expect(
      finishExpiringStripeSubscriptionCheckoutSession(
        { runMutation } as never,
        { checkout: { sessions: { expire, retrieve } } } as never,
        {
          ownerId: "owner_1",
          stripeCheckoutSessionId: "cs_owner",
        },
      ),
    ).resolves.toBe(true);
    expect(expire).toHaveBeenCalledWith("cs_owner");
  });

  it("keeps a completed Checkout for webhook synchronization", async () => {
    const runMutation = vi.fn();
    const retrieve = vi.fn(async () => ({ status: "complete" }));

    await expect(
      finishExpiringStripeSubscriptionCheckoutSession(
        { runMutation } as never,
        { checkout: { sessions: { expire: vi.fn(), retrieve } } } as never,
        {
          ownerId: "owner_1",
          stripeCheckoutSessionId: "cs_owner",
        },
      ),
    ).rejects.toThrow("payment is still syncing");
    expect(runMutation).not.toHaveBeenCalled();
  });

  it("keeps the claim expiring when Stripe omits the session status", async () => {
    const runMutation = vi.fn();
    const retrieve = vi.fn(async () => ({ status: null }));

    await expect(
      finishExpiringStripeSubscriptionCheckoutSession(
        { runMutation } as never,
        { checkout: { sessions: { expire: vi.fn(), retrieve } } } as never,
        {
          ownerId: "owner_1",
          stripeCheckoutSessionId: "cs_owner",
        },
      ),
    ).rejects.toThrow("safe Checkout status");
    expect(runMutation).not.toHaveBeenCalled();
  });
});
