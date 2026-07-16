import { describe, expect, it, vi } from "vitest";
import { createStripeSubscriptionCheckoutSession } from "./createStripeSubscriptionCheckoutSession";

describe("createStripeSubscriptionCheckoutSession", () => {
  it("uses the claimed intent as Stripe's idempotency key", async () => {
    const create = vi.fn(async () => ({
      id: "cs_owner",
      status: "open",
      url: "https://checkout.stripe.test/session",
    }));

    await createStripeSubscriptionCheckoutSession(
      { checkout: { sessions: { create } } } as never,
      {
        cancelUrl: "https://clipstitchr.com/cancel",
        checkoutIntentId: "intent_owner",
        customerId: "cus_owner",
        ownerId: "owner_1",
        planKey: "pro",
        priceId: "price_pro",
        successUrl: "https://clipstitchr.com/success",
      },
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: "cus_owner",
        line_items: [{ price: "price_pro", quantity: 1 }],
        metadata: expect.objectContaining({
          checkoutIntentId: "intent_owner",
          ownerId: "owner_1",
        }),
      }),
      {
        idempotencyKey: "clipstitchr_subscription_checkout_intent_owner",
      },
    );
  });
});
