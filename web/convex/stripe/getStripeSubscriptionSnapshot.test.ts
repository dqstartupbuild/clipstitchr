import type Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getStripeSubscriptionSnapshot } from "./getStripeSubscriptionSnapshot";

describe("getStripeSubscriptionSnapshot", () => {
  beforeEach(() => {
    vi.stubEnv("CLIPSTITCHR_STRIPE_MODE", "test");
    vi.stubEnv("STRIPE_STARTER_PRICE_ID", "price_starter");
    vi.stubEnv("STRIPE_STARTER_PRODUCT_ID", "prod_starter");
    vi.stubEnv("STRIPE_PRO_PRICE_ID", "price_pro");
    vi.stubEnv("STRIPE_PRO_PRODUCT_ID", "prod_pro");
    vi.stubEnv("STRIPE_AGENCY_PRICE_ID", "price_agency");
    vi.stubEnv("STRIPE_AGENCY_PRODUCT_ID", "prod_agency");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the current allowlisted price when portal metadata is stale", () => {
    const subscription = {
      id: "sub_1",
      cancel_at_period_end: false,
      customer: "cus_1",
      items: {
        data: [
          {
            current_period_end: 1_789_000_000,
            current_period_start: 1_786_000_000,
            price: { id: "price_pro" },
          },
        ],
      },
      metadata: { ownerId: "owner_1", planKey: "starter" },
      status: "active",
    } as unknown as Stripe.Subscription;

    expect(getStripeSubscriptionSnapshot(subscription).planKey).toBe("pro");
  });

  it("rejects an unknown price even when metadata names a valid plan", () => {
    const subscription = {
      id: "sub_unknown",
      cancel_at_period_end: false,
      customer: "cus_1",
      items: {
        data: [
          {
            current_period_end: 1_789_000_000,
            current_period_start: 1_786_000_000,
            price: { id: "price_not_in_catalog" },
          },
        ],
      },
      metadata: { ownerId: "owner_1", planKey: "agency" },
      status: "active",
    } as unknown as Stripe.Subscription;

    expect(() => getStripeSubscriptionSnapshot(subscription)).toThrow(
      "Stripe subscription is missing ClipStitchr billing data.",
    );
  });

  it("recognizes Stripe's concrete period-end cancellation timestamp", () => {
    const subscription = {
      id: "sub_1",
      cancel_at: 1_789_000_000,
      cancel_at_period_end: false,
      customer: "cus_1",
      items: {
        data: [
          {
            current_period_end: 1_789_000_000,
            current_period_start: 1_786_000_000,
            price: { id: "price_pro" },
          },
        ],
      },
      metadata: { ownerId: "owner_1", planKey: "pro" },
      status: "active",
    } as unknown as Stripe.Subscription;

    expect(
      getStripeSubscriptionSnapshot(subscription).cancelAtPeriodEnd,
    ).toBe(true);
  });
});
