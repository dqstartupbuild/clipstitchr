import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCreditRefillCheckout } from "./createCreditRefillCheckout";

type CreditRefillCheckoutHandler = {
  handler: (
    ctx: unknown,
    args: Record<string, never>,
  ) => Promise<{ url: string }>;
};

const mocks = vi.hoisted(() => ({
  assertStripeCatalogEntry: vi.fn(),
  createCheckoutSession: vi.fn(),
  getCanonicalPaidStripeAccessIsActive: vi.fn(),
  getEffectiveEntitlementState: vi.fn(),
  getStripeCatalogEntry: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ action: vi.fn((value) => value) }));
vi.mock("../_generated/api", () => ({
  internal: {
    billing: {
      consumeRefillCheckoutRateLimit: {
        consumeRefillCheckoutRateLimit: "billing.consumeRefillLimit",
      },
      getEntitlementForOwner: {
        getEntitlementForOwner: "billing.getEntitlementForOwner",
      },
      recordCheckoutSession: {
        recordCheckoutSession: "billing.recordCheckoutSession",
      },
    },
  },
}));
vi.mock("../../lib/clipstitchr/billing/assertStripeCatalogEntry", () => ({
  assertStripeCatalogEntry: mocks.assertStripeCatalogEntry,
}));
vi.mock("../../lib/clipstitchr/billing/createStripeSdk", () => ({
  createStripeSdk: vi.fn(() => ({})),
}));
vi.mock("../../lib/clipstitchr/billing/createCheckoutIntentId", () => ({
  createCheckoutIntentId: vi.fn(() => "checkout_intent_123"),
}));
vi.mock("../../lib/clipstitchr/billing/getBillingAppUrl", () => ({
  getBillingAppUrl: vi.fn(() => "https://clipstitchr.com"),
}));
vi.mock(
  "../../lib/clipstitchr/billing/getCanonicalPaidStripeAccessIsActive",
  () => ({
    getCanonicalPaidStripeAccessIsActive:
      mocks.getCanonicalPaidStripeAccessIsActive,
  }),
);
vi.mock("../../lib/clipstitchr/billing/getEffectiveEntitlementState", () => ({
  getEffectiveEntitlementState: mocks.getEffectiveEntitlementState,
}));
vi.mock("../../lib/clipstitchr/billing/getStripeCatalogEntry", () => ({
  getStripeCatalogEntry: mocks.getStripeCatalogEntry,
}));
vi.mock("./getStripeComponentClient", () => ({
  getStripeComponentClient: vi.fn(() => ({
    createCheckoutSession: mocks.createCheckoutSession,
  })),
}));

describe("createCreditRefillCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCanonicalPaidStripeAccessIsActive.mockReturnValue(true);
    mocks.getEffectiveEntitlementState.mockReturnValue("active");
    mocks.getStripeCatalogEntry.mockReturnValue({
      catalogKey: "creation-credit-refill",
      priceId: "price_refill",
      productId: "prod_refill",
    });
    mocks.createCheckoutSession.mockResolvedValue({
      sessionId: "cs_refill",
      url: "https://checkout.stripe.test/refill",
    });
  });

  it("rejects noncanonical access before the rate limit or Stripe call", async () => {
    mocks.getCanonicalPaidStripeAccessIsActive.mockReturnValue(false);
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({ subject: "owner_1" })),
      },
      runMutation: vi.fn(),
      runQuery: vi.fn(async () => ({
        state: "active",
        stripeCustomerId: "cus_owner",
        stripeSubscriptionId: "subscription_1",
      })),
    };

    await expect(
      (
        createCreditRefillCheckout as unknown as CreditRefillCheckoutHandler
      ).handler(ctx, {}),
    ).rejects.toThrow("subscription needs attention");

    expect(ctx.runMutation).not.toHaveBeenCalled();
    expect(mocks.assertStripeCatalogEntry).not.toHaveBeenCalled();
    expect(mocks.createCheckoutSession).not.toHaveBeenCalled();
  });

  it("rate-limits before validating or calling the refill Price", async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({ subject: "owner_1" })),
      },
      runMutation: vi.fn(async () => {
        throw new Error("Refill rate limit reached");
      }),
      runQuery: vi.fn(async () => ({
        state: "active",
        stripeCustomerId: "cus_owner",
        stripeSubscriptionId: "subscription_1",
      })),
    };

    await expect(
      (
        createCreditRefillCheckout as unknown as CreditRefillCheckoutHandler
      ).handler(ctx, {}),
    ).rejects.toThrow("Refill rate limit reached");

    expect(mocks.assertStripeCatalogEntry).not.toHaveBeenCalled();
    expect(mocks.createCheckoutSession).not.toHaveBeenCalled();
  });

  it("scopes the refill session and record to the signed-in owner", async () => {
    const runMutation = vi.fn(async () => undefined);
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({ subject: "owner_1" })),
      },
      runMutation,
      runQuery: vi.fn(async () => ({
        state: "active",
        stripeCustomerId: "cus_owner",
        stripeSubscriptionId: "subscription_1",
      })),
    };

    await expect(
      (
        createCreditRefillCheckout as unknown as CreditRefillCheckoutHandler
      ).handler(ctx, {}),
    ).resolves.toEqual({ url: "https://checkout.stripe.test/refill" });

    expect(runMutation.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.assertStripeCatalogEntry.mock.invocationCallOrder[0],
    );
    expect(mocks.createCheckoutSession).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        customerId: "cus_owner",
        metadata: {
          catalogKey: "creation-credit-refill",
          operation: "creation_credit_refill",
          ownerId: "owner_1",
        },
        paymentIntentMetadata: {
          catalogKey: "creation-credit-refill",
          checkoutIntentId: "checkout_intent_123",
          ownerId: "owner_1",
          stripeSubscriptionId: "subscription_1",
        },
        priceId: "price_refill",
      }),
    );
    expect(runMutation).toHaveBeenLastCalledWith(
      "billing.recordCheckoutSession",
      expect.objectContaining({
        checkoutIntentId: "checkout_intent_123",
        ownerId: "owner_1",
        stripePriceId: "price_refill",
        stripeCheckoutSessionId: "cs_refill",
      }),
    );
  });
});
