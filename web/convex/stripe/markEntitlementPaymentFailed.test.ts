import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { markEntitlementPaymentFailed } from "./markEntitlementPaymentFailed";

const mocks = vi.hoisted(() => ({
  getStripeEntitlementSourceEvent: vi.fn(),
  getStripeInvoiceSnapshot: vi.fn(),
  resolveStripeOwnerId: vi.fn(),
  writeEntitlementHistory: vi.fn(),
}));

vi.mock("./getStripeEntitlementSourceEvent", () => ({
  getStripeEntitlementSourceEvent: mocks.getStripeEntitlementSourceEvent,
}));
vi.mock("./getStripeInvoiceSnapshot", () => ({
  getStripeInvoiceSnapshot: mocks.getStripeInvoiceSnapshot,
}));
vi.mock("./resolveStripeOwnerId", () => ({
  resolveStripeOwnerId: mocks.resolveStripeOwnerId,
}));
vi.mock("./writeEntitlementHistory", () => ({
  writeEntitlementHistory: mocks.writeEntitlementHistory,
}));

function createContext(entitlement: Record<string, unknown>) {
  const query = {
    unique: vi.fn(async () => entitlement),
    withIndex: vi.fn(() => query),
  };

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn(() => query),
    },
  };
}

describe("markEntitlementPaymentFailed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveStripeOwnerId.mockResolvedValue("owner_123");
    mocks.getStripeEntitlementSourceEvent.mockResolvedValue({
      eventType: "invoice.paid",
      state: "active",
    });
    mocks.getStripeInvoiceSnapshot.mockReturnValue({
      customerId: "cus_123",
      invoiceId: "in_failed",
      ownerId: "owner_123",
      periodEnd: "2026-08-01T00:00:00.000Z",
      periodStart: "2026-07-01T00:00:00.000Z",
      planKey: "starter",
      priceId: "price_starter",
      subscriptionId: "sub_123",
    });
  });

  it("does not grant grace after an initial invoice failure", async () => {
    const entitlement = {
      _id: "entitlement_doc",
      latestPaidInvoiceId: undefined,
      latestPaymentEventCreatedAt: 0,
      sourceEventCreatedAt: 100,
      sourceEventId: "evt_subscription_created",
      state: "inactive",
      stripeSubscriptionId: "sub_123",
    };
    const ctx = createContext(entitlement);

    await markEntitlementPaymentFailed(
      ctx as never,
      {
        created: 101,
        id: "evt_initial_failure",
        type: "invoice.payment_failed",
      } as Stripe.Event,
      {} as Stripe.Invoice,
    );

    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(mocks.writeEntitlementHistory).not.toHaveBeenCalled();
  });

  it("does not use a previous subscription payment to grant grace", async () => {
    const entitlement = {
      _id: "entitlement_doc",
      latestPaidInvoiceId: "in_old_subscription",
      latestPaymentEventCreatedAt: 100,
      sourceEventCreatedAt: 100,
      sourceEventId: "evt_old_paid",
      state: "inactive",
      stripeSubscriptionId: "sub_old",
    };
    const ctx = createContext(entitlement);

    await markEntitlementPaymentFailed(
      ctx as never,
      {
        created: 101,
        id: "evt_replacement_failure",
        type: "invoice.payment_failed",
      } as Stripe.Event,
      {} as Stripe.Invoice,
    );

    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(mocks.writeEntitlementHistory).not.toHaveBeenCalled();
  });

  it.each([99, 100])(
    "does not replace paid state with a failure at Stripe second %i",
    async (created) => {
      const entitlement = {
        _id: "entitlement_doc",
        latestPaidInvoiceId: "in_paid",
        latestPaymentEventCreatedAt: 100,
        sourceEventCreatedAt: 100,
        sourceEventId: "evt_paid",
        state: "active",
        stripeSubscriptionId: "sub_123",
      };
      const ctx = createContext(entitlement);

      await markEntitlementPaymentFailed(
        ctx as never,
        {
          created,
          id: `evt_failure_${created}`,
          type: "invoice.payment_failed",
        } as Stripe.Event,
        {} as Stripe.Invoice,
      );

      expect(ctx.db.patch).not.toHaveBeenCalled();
      expect(mocks.writeEntitlementHistory).not.toHaveBeenCalled();
    },
  );

  it("does not extend grace after a later retry failure", async () => {
    const entitlement = {
      _id: "entitlement_doc",
      graceEndsAt: "2026-07-19T12:00:00.000Z",
      latestPaidInvoiceId: "in_paid",
      latestPaymentEventCreatedAt: 100,
      planKey: "starter",
      sourceEventCreatedAt: 100,
      sourceEventId: "evt_first_failure",
      state: "grace",
      stripeSubscriptionId: "sub_123",
      version: 2,
    };
    mocks.getStripeEntitlementSourceEvent.mockResolvedValueOnce({
      eventType: "invoice.payment_failed",
      state: "grace",
    });
    const ctx = createContext(entitlement);

    await markEntitlementPaymentFailed(
      ctx as never,
      {
        created: 200,
        id: "evt_retry_failure",
        type: "invoice.payment_failed",
      } as Stripe.Event,
      {} as Stripe.Invoice,
    );

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "entitlement_doc",
      expect.objectContaining({
        graceEndsAt: "2026-07-19T12:00:00.000Z",
        state: "grace",
      }),
    );
  });
});
