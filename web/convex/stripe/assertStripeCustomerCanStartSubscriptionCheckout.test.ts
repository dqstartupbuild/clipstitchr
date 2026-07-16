import type Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import { assertStripeCustomerCanStartSubscriptionCheckout } from "./assertStripeCustomerCanStartSubscriptionCheckout";

function createStripe(statuses: Stripe.Subscription.Status[]) {
  return {
    subscriptions: {
      list: vi.fn(async () => ({
        data: statuses.map((status, index) => ({ id: `sub_${index}`, status })),
      })),
    },
  };
}

describe("assertStripeCustomerCanStartSubscriptionCheckout", () => {
  it("allows customers whose previous subscriptions are terminal", async () => {
    const stripe = createStripe(["canceled", "incomplete_expired"]);

    await expect(
      assertStripeCustomerCanStartSubscriptionCheckout(
        stripe as never,
        "cus_owner",
      ),
    ).resolves.toBeUndefined();
  });

  it.each(["active", "trialing", "past_due", "unpaid", "incomplete"] as const)(
    "rejects a customer with a %s subscription",
    async (status) => {
      const stripe = createStripe([status]);

      await expect(
        assertStripeCustomerCanStartSubscriptionCheckout(
          stripe as never,
          "cus_owner",
        ),
      ).rejects.toThrow("already exists");
    },
  );
});
