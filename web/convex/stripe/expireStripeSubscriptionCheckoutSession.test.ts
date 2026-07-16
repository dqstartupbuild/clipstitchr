import { describe, expect, it, vi } from "vitest";
import { expireStripeSubscriptionCheckoutSession } from "./expireStripeSubscriptionCheckoutSession";

vi.mock("../_generated/api", () => ({
  internal: {
    billing: {
      beginSubscriptionCheckoutSessionExpiration: {
        beginSubscriptionCheckoutSessionExpiration: "billing.beginExpiration",
      },
      expireSubscriptionCheckoutSession: {
        expireSubscriptionCheckoutSession: "billing.finishExpiration",
      },
    },
  },
}));

describe("expireStripeSubscriptionCheckoutSession", () => {
  it("expires Stripe only after winning the local expiration state", async () => {
    const runMutation = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);
    const expire = vi.fn(async () => ({ id: "cs_owner", status: "expired" }));

    await expect(
      expireStripeSubscriptionCheckoutSession(
        { runMutation } as never,
        { checkout: { sessions: { expire } } } as never,
        {
          allowHandedOff: false,
          checkoutStatus: "open",
          ownerId: "owner_1",
          stripeCheckoutSessionId: "cs_owner",
        },
      ),
    ).resolves.toBe(true);

    expect(runMutation).toHaveBeenNthCalledWith(
      1,
      "billing.beginExpiration",
      expect.objectContaining({ allowHandedOff: false }),
    );
    expect(expire).toHaveBeenCalledWith("cs_owner");
    expect(runMutation).toHaveBeenNthCalledWith(
      2,
      "billing.finishExpiration",
      expect.objectContaining({ stripeCheckoutSessionId: "cs_owner" }),
    );
  });

  it("keeps the local state expiring when Stripe returns an ambiguous error", async () => {
    const runMutation = vi.fn(async () => true);
    const expire = vi.fn(async () => {
      throw new Error("Stripe timeout");
    });

    await expect(
      expireStripeSubscriptionCheckoutSession(
        { runMutation } as never,
        { checkout: { sessions: { expire } } } as never,
        {
          allowHandedOff: true,
          checkoutStatus: "open",
          ownerId: "owner_1",
          stripeCheckoutSessionId: "cs_owner",
        },
      ),
    ).rejects.toThrow("Stripe timeout");

    expect(runMutation).toHaveBeenCalledTimes(1);
  });

  it("does not acquire expiration when Stripe omits the session status", async () => {
    const runMutation = vi.fn();

    await expect(
      expireStripeSubscriptionCheckoutSession(
        { runMutation } as never,
        { checkout: { sessions: { expire: vi.fn() } } } as never,
        {
          allowHandedOff: false,
          checkoutStatus: null,
          ownerId: "owner_1",
          stripeCheckoutSessionId: "cs_owner",
        },
      ),
    ).rejects.toThrow("safe Checkout status");
    expect(runMutation).not.toHaveBeenCalled();
  });
});
