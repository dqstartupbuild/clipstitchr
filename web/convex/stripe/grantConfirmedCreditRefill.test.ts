import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { grantConfirmedCreditRefill } from "./grantConfirmedCreditRefill";

const mocks = vi.hoisted(() => ({
  getCanonicalPaidStripeAccessIsActive: vi.fn(),
  getEffectiveEntitlementState: vi.fn(),
  getStripeCatalogEntry: vi.fn(),
  getStripePaymentHasOpenHold: vi.fn(),
  grantCreditRefill: vi.fn(),
  resolveStripeOwnerId: vi.fn(),
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
vi.mock("../usage/grantCreditRefill", () => ({
  grantCreditRefill: mocks.grantCreditRefill,
}));
vi.mock("./getStripePaymentHasOpenHold", () => ({
  getStripePaymentHasOpenHold: mocks.getStripePaymentHasOpenHold,
}));
vi.mock("./resolveStripeOwnerId", () => ({
  resolveStripeOwnerId: mocks.resolveStripeOwnerId,
}));

function createContext({ stripePriceId = "price_refill" } = {}) {
  return {
    db: {
      query: vi.fn((table: string) => {
        const query = {
          unique: vi.fn(async () =>
            table === "billingCheckoutSessions"
              ? {
                  catalogKey: "creation-credit-refill",
                  mode: "payment",
                  ownerId: "owner_1",
                  stripePriceId,
                }
              : {
                  billingReviewRequired: false,
                  currentPeriodEnd: "2030-08-01T00:00:00.000Z",
                  currentPeriodStart: "2026-07-01T00:00:00.000Z",
                  planKey: "pro",
                  state: "active",
                  stripeCustomerId: "cus_owner",
                  stripeSubscriptionId: "sub_owner",
                },
          ),
          withIndex: vi.fn(() => query),
        };

        return query;
      }),
    },
  };
}

function createPaymentIntent() {
  return {
    amount_received: 2_000,
    currency: "usd",
    customer: "cus_owner",
    id: "pi_refill",
    latest_charge: "ch_refill",
    metadata: {
      catalogKey: "creation-credit-refill",
      checkoutIntentId: "checkout_intent_123",
      ownerId: "owner_1",
      stripeSubscriptionId: "sub_owner",
    },
  } as unknown as Stripe.PaymentIntent;
}

describe("grantConfirmedCreditRefill", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCanonicalPaidStripeAccessIsActive.mockReturnValue(true);
    mocks.getEffectiveEntitlementState.mockReturnValue("active");
    mocks.getStripeCatalogEntry.mockReturnValue({
      catalogKey: "creation-credit-refill",
      expectedUnitAmount: 2_000,
      priceId: "price_refill",
    });
    mocks.getStripePaymentHasOpenHold.mockResolvedValue(false);
    mocks.resolveStripeOwnerId.mockResolvedValue("owner_1");
    mocks.grantCreditRefill.mockResolvedValue("grant_1");
  });

  it("grants only when the PaymentIntent points to the recorded Price", async () => {
    await expect(
      grantConfirmedCreditRefill(
        createContext() as never,
        { created: 1_800_000_000, id: "evt_pi" } as Stripe.Event,
        createPaymentIntent(),
      ),
    ).resolves.toBe("grant_1");

    expect(mocks.grantCreditRefill).toHaveBeenCalledOnce();
  });

  it("rejects a PaymentIntent whose recorded Checkout used another Price", async () => {
    await expect(
      grantConfirmedCreditRefill(
        createContext({ stripePriceId: "price_other" }) as never,
        { created: 1_800_000_000, id: "evt_pi" } as Stripe.Event,
        createPaymentIntent(),
      ),
    ).rejects.toThrow("does not match the catalog");

    expect(mocks.grantCreditRefill).not.toHaveBeenCalled();
  });

  it("does not grant when an earlier adverse event opened a payment hold", async () => {
    mocks.getStripePaymentHasOpenHold.mockResolvedValueOnce(true);

    await expect(
      grantConfirmedCreditRefill(
        createContext() as never,
        { created: 1_800_000_000, id: "evt_pi" } as Stripe.Event,
        createPaymentIntent(),
      ),
    ).resolves.toBeNull();

    expect(mocks.grantCreditRefill).not.toHaveBeenCalled();
  });

  it("permits idempotent recovery while another billing hold remains", async () => {
    const ctx = createContext();

    await grantConfirmedCreditRefill(
      ctx as never,
      { created: 1_800_000_000, id: "evt_recovery" } as Stripe.Event,
      createPaymentIntent(),
      { allowBillingReviewForRecovery: true },
    );

    expect(mocks.getCanonicalPaidStripeAccessIsActive).toHaveBeenCalledWith(
      expect.objectContaining({ billingReviewRequired: false }),
      expect.any(String),
    );
    expect(mocks.grantCreditRefill).toHaveBeenCalledOnce();
  });

  it("rejects a refill paid under a replaced subscription", async () => {
    const paymentIntent = createPaymentIntent();
    paymentIntent.metadata.stripeSubscriptionId = "sub_old";

    await expect(
      grantConfirmedCreditRefill(
        createContext() as never,
        { created: 1_800_000_000, id: "evt_pi" } as Stripe.Event,
        paymentIntent,
      ),
    ).rejects.toThrow("different Stripe subscription");

    expect(mocks.grantCreditRefill).not.toHaveBeenCalled();
  });

  it("recovers an old refill with its original subscription binding", async () => {
    const paymentIntent = createPaymentIntent();
    paymentIntent.metadata.stripeSubscriptionId = "sub_old";

    await grantConfirmedCreditRefill(
      createContext() as never,
      { created: 1_800_000_000, id: "evt_recovery" } as Stripe.Event,
      paymentIntent,
      { allowBillingReviewForRecovery: true },
    );

    expect(mocks.grantCreditRefill).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ stripeSubscriptionId: "sub_old" }),
    );
  });
});
