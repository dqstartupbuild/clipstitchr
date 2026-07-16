import type Stripe from "stripe";
import { describe, expect, it } from "vitest";
import { getStripeFailedRefundCanResolveHold } from "./getStripeFailedRefundCanResolveHold";

describe("getStripeFailedRefundCanResolveHold", () => {
  it("allows recovery only when no refund remains on the charge", () => {
    expect(
      getStripeFailedRefundCanResolveHold({
        amount_refunded: 0,
        refunded: false,
      } as Stripe.Charge),
    ).toBe(true);
  });

  it("keeps the hold when another refund remains successful", () => {
    expect(
      getStripeFailedRefundCanResolveHold({
        amount_refunded: 1_000,
        refunded: false,
      } as Stripe.Charge),
    ).toBe(false);
  });
});
