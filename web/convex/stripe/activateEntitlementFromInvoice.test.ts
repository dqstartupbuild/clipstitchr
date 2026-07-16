import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { activateEntitlementFromInvoice } from "./activateEntitlementFromInvoice";

const mocks = vi.hoisted(() => ({
  createInvoicePaidCommunication: vi.fn(),
  getStripeEntitlementSourceEvent: vi.fn(),
  getStripeInvoiceSnapshot: vi.fn(),
  grantMonthlyAllowance: vi.fn(),
  getStripePaymentHasOpenHold: vi.fn(),
  reconcileDailyDraftsAfterPlanChange: vi.fn(),
  reconcileProductsAfterPlanChange: vi.fn(),
  resolveStripeOwnerId: vi.fn(),
  writeEntitlementHistory: vi.fn(),
  markBillingReviewRequired: vi.fn(),
  syncBillingReviewFromPaymentHolds: vi.fn(),
}));

vi.mock("../accountEmail/createInvoicePaidCommunication", () => ({
  createInvoicePaidCommunication: mocks.createInvoicePaidCommunication,
}));

vi.mock("./getStripeEntitlementSourceEvent", () => ({
  getStripeEntitlementSourceEvent: mocks.getStripeEntitlementSourceEvent,
}));
vi.mock("./getStripeInvoiceSnapshot", () => ({
  getStripeInvoiceSnapshot: mocks.getStripeInvoiceSnapshot,
}));
vi.mock("../usage/grantMonthlyAllowance", () => ({
  grantMonthlyAllowance: mocks.grantMonthlyAllowance,
}));
vi.mock("./getStripePaymentHasOpenHold", () => ({
  getStripePaymentHasOpenHold: mocks.getStripePaymentHasOpenHold,
}));
vi.mock("../automation/reconcileDailyDraftsAfterPlanChange", () => ({
  reconcileDailyDraftsAfterPlanChange:
    mocks.reconcileDailyDraftsAfterPlanChange,
}));
vi.mock("../products/reconcileProductsAfterPlanChange", () => ({
  reconcileProductsAfterPlanChange: mocks.reconcileProductsAfterPlanChange,
}));
vi.mock("./resolveStripeOwnerId", () => ({
  resolveStripeOwnerId: mocks.resolveStripeOwnerId,
}));
vi.mock("./writeEntitlementHistory", () => ({
  writeEntitlementHistory: mocks.writeEntitlementHistory,
}));
vi.mock("./markBillingReviewRequired", () => ({
  markBillingReviewRequired: mocks.markBillingReviewRequired,
}));
vi.mock("./syncBillingReviewFromPaymentHolds", () => ({
  syncBillingReviewFromPaymentHolds: mocks.syncBillingReviewFromPaymentHolds,
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

describe("activateEntitlementFromInvoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveStripeOwnerId.mockResolvedValue("owner_123");
    mocks.getStripePaymentHasOpenHold.mockResolvedValue(false);
    mocks.grantMonthlyAllowance.mockResolvedValue({
      creditGrant: 2_000,
      periodKey: "sub_123:2026-07-01",
    });
    mocks.reconcileProductsAfterPlanChange.mockResolvedValue([]);
    mocks.reconcileDailyDraftsAfterPlanChange.mockResolvedValue([]);
    mocks.getStripeEntitlementSourceEvent.mockResolvedValue({
      eventType: "customer.subscription.deleted",
      state: "inactive",
    });
    mocks.getStripeInvoiceSnapshot.mockReturnValue({
      customerId: "cus_123",
      invoiceId: "in_old",
      ownerId: "owner_123",
      periodEnd: "2026-08-01T00:00:00.000Z",
      periodStart: "2026-07-01T00:00:00.000Z",
      planKey: "starter",
      priceId: "price_starter",
      subscriptionId: "sub_123",
    });
  });

  it.each([199, 201])(
    "does not let same-subscription paid state at second %i reactivate deleted state",
    async (created) => {
      const entitlement = {
        _id: "entitlement_doc",
        billingReviewRequired: false,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: "2026-08-01T00:00:00.000Z",
        currentPeriodStart: "2026-07-01T00:00:00.000Z",
        latestPaidInvoiceId: "in_previous",
        latestPaymentEventCreatedAt: 100,
        latestSubscriptionEventCreatedAt: 200,
        planKey: "starter",
        sourceEventCreatedAt: 200,
        sourceEventId: "evt_deleted",
        state: "inactive",
        stripeSubscriptionId: "sub_123",
        version: 3,
      };
      const ctx = createContext(entitlement);

      await expect(
        activateEntitlementFromInvoice(
          ctx as never,
          {
            created,
            id: `evt_paid_${created}`,
            type: "invoice.paid",
          } as Stripe.Event,
          {} as Stripe.Invoice,
        ),
      ).resolves.toBe("entitlement_doc");

      expect(mocks.grantMonthlyAllowance).not.toHaveBeenCalled();
      expect(mocks.reconcileProductsAfterPlanChange).not.toHaveBeenCalled();
      expect(mocks.reconcileDailyDraftsAfterPlanChange).not.toHaveBeenCalled();
      expect(ctx.db.patch).not.toHaveBeenCalled();
      expect(mocks.writeEntitlementHistory).not.toHaveBeenCalled();
    },
  );

  it("allows paid state for a different replacement subscription", async () => {
    mocks.getStripeInvoiceSnapshot.mockReturnValueOnce({
      customerId: "cus_123",
      invoiceId: "in_replacement",
      ownerId: "owner_123",
      periodEnd: "2026-09-01T00:00:00.000Z",
      periodStart: "2026-08-01T00:00:00.000Z",
      planKey: "pro",
      priceId: "price_pro",
      subscriptionId: "sub_replacement",
    });
    const entitlement = {
      _id: "entitlement_doc",
      billingReviewRequired: false,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: "2026-08-01T00:00:00.000Z",
      currentPeriodStart: "2026-07-01T00:00:00.000Z",
      latestPaidInvoiceId: "in_previous",
      latestPaymentEventCreatedAt: 100,
      latestSubscriptionEventCreatedAt: 200,
      planKey: "starter",
      sourceEventCreatedAt: 200,
      sourceEventId: "evt_deleted",
      state: "inactive",
      stripeSubscriptionId: "sub_123",
      version: 3,
    };
    const ctx = createContext(entitlement);

    await activateEntitlementFromInvoice(
      ctx as never,
      {
        created: 201,
        id: "evt_new_paid",
        type: "invoice.paid",
      } as Stripe.Event,
      {} as Stripe.Invoice,
    );

    expect(mocks.grantMonthlyAllowance).toHaveBeenCalledOnce();
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "entitlement_doc",
      expect.objectContaining({
        state: "active",
        stripeSubscriptionId: "sub_replacement",
      }),
    );
    expect(mocks.createInvoicePaidCommunication).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        kind: "plan-change",
        planKey: "pro",
      }),
    );
  });

  it("flags a second paid subscription without replacing the current one", async () => {
    mocks.getStripeEntitlementSourceEvent.mockResolvedValueOnce({
      eventType: "invoice.paid",
      state: "active",
    });
    mocks.getStripeInvoiceSnapshot.mockReturnValueOnce({
      customerId: "cus_123",
      invoiceId: "in_old_late",
      ownerId: "owner_123",
      periodEnd: "2026-09-01T00:00:00.000Z",
      periodStart: "2026-08-01T00:00:00.000Z",
      planKey: "starter",
      priceId: "price_starter",
      subscriptionId: "sub_old",
    });
    const entitlement = {
      _id: "entitlement_doc",
      currentPeriodEnd: "2030-08-01T00:00:00.000Z",
      currentPeriodStart: "2030-07-01T00:00:00.000Z",
      latestPaidInvoiceId: "in_new",
      latestPaymentEventCreatedAt: 200,
      latestSubscriptionEventCreatedAt: 200,
      planKey: "pro",
      sourceEventCreatedAt: 200,
      sourceEventId: "evt_new_paid",
      state: "active",
      stripeSubscriptionId: "sub_new",
      version: 3,
    };
    const ctx = createContext(entitlement);

    await activateEntitlementFromInvoice(
      ctx as never,
      {
        created: 300,
        id: "evt_old_paid",
        type: "invoice.paid",
      } as Stripe.Event,
      {} as Stripe.Invoice,
    );

    expect(mocks.markBillingReviewRequired).toHaveBeenCalledWith(
      ctx,
      "owner_123",
      expect.stringContaining("second paid Stripe subscription"),
      expect.any(String),
    );
    expect(mocks.grantMonthlyAllowance).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("does not grant a monthly allowance after an earlier invoice hold", async () => {
    mocks.getStripeEntitlementSourceEvent.mockResolvedValueOnce({
      eventType: "invoice.payment_failed",
      state: "inactive",
    });
    mocks.getStripePaymentHasOpenHold.mockResolvedValueOnce(true);
    const entitlement = {
      _id: "entitlement_doc",
      currentPeriodEnd: "2026-07-01T00:00:00.000Z",
      currentPeriodStart: "2026-06-01T00:00:00.000Z",
      latestPaidInvoiceId: undefined,
      latestPaymentEventCreatedAt: 0,
      latestSubscriptionEventCreatedAt: 100,
      planKey: "starter",
      sourceEventCreatedAt: 100,
      sourceEventId: "evt_inactive",
      state: "inactive",
      stripeSubscriptionId: "sub_123",
      version: 1,
    };
    const ctx = createContext(entitlement);

    await activateEntitlementFromInvoice(
      ctx as never,
      {
        created: 200,
        id: "evt_paid_held",
        type: "invoice.paid",
      } as Stripe.Event,
      {} as Stripe.Invoice,
    );

    expect(mocks.grantMonthlyAllowance).not.toHaveBeenCalled();
    expect(mocks.syncBillingReviewFromPaymentHolds).toHaveBeenCalledWith(
      ctx,
      "owner_123",
      expect.any(String),
    );
  });

  it("applies a same-second paid upgrade even when its event ID sorts lower", async () => {
    mocks.getStripeEntitlementSourceEvent.mockResolvedValueOnce({
      eventType: "invoice.paid",
      state: "active",
    });
    mocks.getStripeInvoiceSnapshot.mockReturnValueOnce({
      customerId: "cus_123",
      invoiceId: "in_upgrade",
      ownerId: "owner_123",
      periodEnd: "2026-08-01T00:00:00.000Z",
      periodStart: "2026-07-01T00:00:00.000Z",
      planKey: "pro",
      priceId: "price_pro",
      subscriptionId: "sub_123",
    });
    const entitlement = {
      _id: "entitlement_doc",
      currentPeriodEnd: "2026-08-01T00:00:00.000Z",
      currentPeriodStart: "2026-07-01T00:00:00.000Z",
      latestPaidInvoiceId: "in_starter",
      latestPaymentEventCreatedAt: 200,
      latestSubscriptionEventCreatedAt: 100,
      planKey: "starter",
      sourceEventCreatedAt: 200,
      sourceEventId: "evt_zzz_starter",
      state: "active",
      stripeSubscriptionId: "sub_123",
      version: 2,
    };
    const ctx = createContext(entitlement);

    await activateEntitlementFromInvoice(
      ctx as never,
      {
        created: 200,
        id: "evt_aaa_upgrade",
        type: "invoice.paid",
      } as Stripe.Event,
      {} as Stripe.Invoice,
    );

    expect(mocks.grantMonthlyAllowance).toHaveBeenCalledOnce();
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "entitlement_doc",
      expect.objectContaining({ planKey: "pro", stripePriceId: "price_pro" }),
    );
  });

  it("rejects a same-second older-plan invoice even when its event ID sorts higher", async () => {
    mocks.getStripeEntitlementSourceEvent.mockResolvedValueOnce({
      eventType: "invoice.paid",
      state: "active",
    });
    mocks.getStripeInvoiceSnapshot.mockReturnValueOnce({
      customerId: "cus_123",
      invoiceId: "in_starter",
      ownerId: "owner_123",
      periodEnd: "2026-08-01T00:00:00.000Z",
      periodStart: "2026-07-01T00:00:00.000Z",
      planKey: "starter",
      priceId: "price_starter",
      subscriptionId: "sub_123",
    });
    const entitlement = {
      _id: "entitlement_doc",
      currentPeriodEnd: "2026-08-01T00:00:00.000Z",
      currentPeriodStart: "2026-07-01T00:00:00.000Z",
      latestPaidInvoiceId: "in_upgrade",
      latestPaymentEventCreatedAt: 200,
      latestSubscriptionEventCreatedAt: 100,
      planKey: "pro",
      sourceEventCreatedAt: 200,
      sourceEventId: "evt_aaa_upgrade",
      state: "active",
      stripeSubscriptionId: "sub_123",
      version: 2,
    };
    const ctx = createContext(entitlement);

    await activateEntitlementFromInvoice(
      ctx as never,
      {
        created: 200,
        id: "evt_zzz_starter",
        type: "invoice.paid",
      } as Stripe.Event,
      {} as Stripe.Invoice,
    );

    expect(mocks.grantMonthlyAllowance).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("rejects a later-created invoice for an older paid period", async () => {
    mocks.getStripeEntitlementSourceEvent.mockResolvedValueOnce({
      eventType: "invoice.paid",
      state: "active",
    });
    mocks.getStripeInvoiceSnapshot.mockReturnValueOnce({
      customerId: "cus_123",
      invoiceId: "in_stale_period",
      ownerId: "owner_123",
      periodEnd: "2026-07-01T00:00:00.000Z",
      periodStart: "2026-06-01T00:00:00.000Z",
      planKey: "starter",
      priceId: "price_starter",
      subscriptionId: "sub_123",
    });
    const entitlement = {
      _id: "entitlement_doc",
      currentPeriodEnd: "2026-08-01T00:00:00.000Z",
      currentPeriodStart: "2026-07-01T00:00:00.000Z",
      latestPaidInvoiceId: "in_current_period",
      latestPaymentEventCreatedAt: 200,
      latestSubscriptionEventCreatedAt: 100,
      planKey: "starter",
      sourceEventCreatedAt: 200,
      sourceEventId: "evt_current_paid",
      state: "active",
      stripeSubscriptionId: "sub_123",
      version: 2,
    };
    const ctx = createContext(entitlement);

    await activateEntitlementFromInvoice(
      ctx as never,
      {
        created: 300,
        id: "evt_stale_period_delivered_late",
        type: "invoice.paid",
      } as Stripe.Event,
      {} as Stripe.Invoice,
    );

    expect(mocks.grantMonthlyAllowance).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(mocks.writeEntitlementHistory).not.toHaveBeenCalled();
  });
});
