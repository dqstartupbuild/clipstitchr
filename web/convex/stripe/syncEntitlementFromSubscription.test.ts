import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { syncEntitlementFromSubscription } from "./syncEntitlementFromSubscription";

const mocks = vi.hoisted(() => ({
  cancelNeverStartedQueueForOwner: vi.fn(),
  getStripeSubscriptionSnapshot: vi.fn(),
  getStripeEntitlementSourceEvent: vi.fn(),
  resolveStripeOwnerId: vi.fn(),
  writeEntitlementHistory: vi.fn(),
}));

vi.mock("../workerQueue/cancelNeverStartedQueueForOwner", () => ({
  cancelNeverStartedQueueForOwner: mocks.cancelNeverStartedQueueForOwner,
}));

vi.mock("./getStripeSubscriptionSnapshot", () => ({
  getStripeSubscriptionSnapshot: mocks.getStripeSubscriptionSnapshot,
}));
vi.mock("./getStripeEntitlementSourceEvent", () => ({
  getStripeEntitlementSourceEvent: mocks.getStripeEntitlementSourceEvent,
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

describe("syncEntitlementFromSubscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveStripeOwnerId.mockResolvedValue("owner_123");
    mocks.getStripeEntitlementSourceEvent.mockResolvedValue({
      eventType: "invoice.paid",
      state: "active",
    });
    mocks.getStripeSubscriptionSnapshot.mockReturnValue({
      cancelAtPeriodEnd: false,
      customerId: "cus_123",
      ownerId: "owner_123",
      periodEnd: "2026-08-01T00:00:00.000Z",
      periodStart: "2026-07-01T00:00:00.000Z",
      planKey: "starter",
      priceId: "price_starter",
      status: "incomplete",
      subscriptionId: "sub_123",
    });
  });

  it("does not let an older incomplete subscription event replace paid state", async () => {
    const entitlement = {
      _id: "entitlement_doc",
      latestPaidInvoiceId: "in_paid",
      latestPaymentEventCreatedAt: 200,
      latestSubscriptionEventCreatedAt: 0,
      sourceEventCreatedAt: 200,
      sourceEventId: "evt_paid",
      state: "active",
      stripeSubscriptionId: "sub_123",
    };
    const ctx = createContext(entitlement);

    await expect(
      syncEntitlementFromSubscription(
        ctx as never,
        {
          created: 199,
          id: "evt_subscription_created",
          type: "customer.subscription.created",
        } as Stripe.Event,
        {} as Stripe.Subscription,
      ),
    ).resolves.toBe("entitlement_doc");

    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(mocks.writeEntitlementHistory).not.toHaveBeenCalled();
  });

  it("does not let an unpaid replacement subscription take over", async () => {
    mocks.getStripeSubscriptionSnapshot.mockReturnValueOnce({
      cancelAtPeriodEnd: false,
      customerId: "cus_123",
      ownerId: "owner_123",
      periodEnd: "2026-09-01T00:00:00.000Z",
      periodStart: "2026-08-01T00:00:00.000Z",
      planKey: "pro",
      priceId: "price_pro",
      status: "past_due",
      subscriptionId: "sub_replacement",
    });
    const entitlement = {
      _id: "entitlement_doc",
      currentPeriodEnd: "2026-08-01T00:00:00.000Z",
      currentPeriodStart: "2026-07-01T00:00:00.000Z",
      graceEndsAt: undefined,
      lastPaymentAt: "2026-07-01T00:00:00.000Z",
      latestPaidInvoiceId: "in_old_subscription",
      latestPaymentEventCreatedAt: 200,
      latestSubscriptionEventCreatedAt: 100,
      planKey: "starter",
      sourceEventCreatedAt: 200,
      sourceEventId: "evt_paid",
      state: "inactive",
      stripeSubscriptionId: "sub_old",
      version: 3,
    };
    const ctx = createContext(entitlement);

    await syncEntitlementFromSubscription(
      ctx as never,
      {
        created: 201,
        id: "evt_replacement_past_due",
        type: "customer.subscription.updated",
      } as Stripe.Event,
      {} as Stripe.Subscription,
    );

    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(mocks.writeEntitlementHistory).not.toHaveBeenCalled();
  });

  it.each(["customer.subscription.updated", "customer.subscription.deleted"])(
    "ignores a later %s event for an old subscription",
    async (eventType) => {
      mocks.getStripeSubscriptionSnapshot.mockReturnValueOnce({
        cancelAtPeriodEnd: false,
        customerId: "cus_123",
        ownerId: "owner_123",
        periodEnd: "2026-08-01T00:00:00.000Z",
        periodStart: "2026-07-01T00:00:00.000Z",
        planKey: "starter",
        priceId: "price_starter",
        status: eventType.endsWith("deleted") ? "canceled" : "active",
        subscriptionId: "sub_old",
      });
      const entitlement = {
        _id: "entitlement_doc",
        latestPaidInvoiceId: "in_new",
        latestPaymentEventCreatedAt: 200,
        latestSubscriptionEventCreatedAt: 200,
        sourceEventCreatedAt: 200,
        sourceEventId: "evt_new_paid",
        state: "active",
        stripeSubscriptionId: "sub_new",
      };
      const ctx = createContext(entitlement);

      await syncEntitlementFromSubscription(
        ctx as never,
        {
          created: 300,
          id: `evt_old_${eventType}`,
          type: eventType,
        } as Stripe.Event,
        {} as Stripe.Subscription,
      );

      expect(ctx.db.patch).not.toHaveBeenCalled();
      expect(mocks.writeEntitlementHistory).not.toHaveBeenCalled();
    },
  );

  it("preserves the first grace deadline after a later past-due update", async () => {
    mocks.getStripeSubscriptionSnapshot.mockReturnValueOnce({
      cancelAtPeriodEnd: false,
      customerId: "cus_123",
      ownerId: "owner_123",
      periodEnd: "2026-09-01T00:00:00.000Z",
      periodStart: "2026-08-01T00:00:00.000Z",
      planKey: "starter",
      priceId: "price_starter",
      status: "past_due",
      subscriptionId: "sub_123",
    });
    const entitlement = {
      _id: "entitlement_doc",
      currentPeriodEnd: "2026-08-01T00:00:00.000Z",
      currentPeriodStart: "2026-07-01T00:00:00.000Z",
      graceEndsAt: "2026-07-19T12:00:00.000Z",
      latestPaidInvoiceId: "in_paid",
      latestPaymentEventCreatedAt: 100,
      latestSubscriptionEventCreatedAt: 100,
      planKey: "starter",
      sourceEventCreatedAt: 100,
      sourceEventId: "evt_failed",
      state: "grace",
      stripeSubscriptionId: "sub_123",
      version: 2,
    };
    mocks.getStripeEntitlementSourceEvent.mockResolvedValueOnce({
      eventType: "invoice.payment_failed",
      state: "grace",
    });
    const ctx = createContext(entitlement);

    await syncEntitlementFromSubscription(
      ctx as never,
      {
        created: 300,
        id: "evt_later_past_due",
        type: "customer.subscription.updated",
      } as Stripe.Event,
      {} as Stripe.Subscription,
    );

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "entitlement_doc",
      expect.objectContaining({
        graceEndsAt: "2026-07-19T12:00:00.000Z",
        state: "grace",
      }),
    );
  });

  it("does not clear grace from an active subscription update", async () => {
    mocks.getStripeSubscriptionSnapshot.mockReturnValueOnce({
      cancelAtPeriodEnd: false,
      customerId: "cus_123",
      ownerId: "owner_123",
      periodEnd: "2026-09-01T00:00:00.000Z",
      periodStart: "2026-08-01T00:00:00.000Z",
      planKey: "starter",
      priceId: "price_starter",
      status: "active",
      subscriptionId: "sub_123",
    });
    const entitlement = {
      _id: "entitlement_doc",
      currentPeriodEnd: "2026-08-01T00:00:00.000Z",
      currentPeriodStart: "2026-07-01T00:00:00.000Z",
      graceEndsAt: "2026-07-19T12:00:00.000Z",
      latestPaidInvoiceId: "in_paid",
      latestPaymentEventCreatedAt: 100,
      latestSubscriptionEventCreatedAt: 100,
      planKey: "starter",
      sourceEventCreatedAt: 100,
      sourceEventId: "evt_failed",
      state: "grace",
      stripeSubscriptionId: "sub_123",
      version: 2,
    };
    mocks.getStripeEntitlementSourceEvent.mockResolvedValueOnce({
      eventType: "invoice.payment_failed",
      state: "grace",
    });
    const ctx = createContext(entitlement);

    await syncEntitlementFromSubscription(
      ctx as never,
      {
        created: 301,
        id: "evt_active_without_payment",
        type: "customer.subscription.updated",
      } as Stripe.Event,
      {} as Stripe.Subscription,
    );

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "entitlement_doc",
      expect.objectContaining({
        graceEndsAt: "2026-07-19T12:00:00.000Z",
        state: "grace",
      }),
    );
  });

  it("cancels never-started queue entries when the subscription becomes inactive", async () => {
    mocks.getStripeSubscriptionSnapshot.mockReturnValueOnce({
      cancelAtPeriodEnd: false,
      customerId: "cus_123",
      ownerId: "owner_123",
      periodEnd: "2026-08-01T00:00:00.000Z",
      periodStart: "2026-07-01T00:00:00.000Z",
      planKey: "starter",
      priceId: "price_starter",
      status: "canceled",
      subscriptionId: "sub_123",
    });
    const entitlement = {
      _id: "entitlement_doc",
      currentPeriodEnd: "2026-08-01T00:00:00.000Z",
      currentPeriodStart: "2026-07-01T00:00:00.000Z",
      latestPaidInvoiceId: "in_paid",
      latestPaymentEventCreatedAt: 100,
      latestSubscriptionEventCreatedAt: 100,
      planKey: "starter",
      sourceEventCreatedAt: 100,
      sourceEventId: "evt_paid",
      state: "active",
      stripeSubscriptionId: "sub_123",
      version: 2,
    };
    const ctx = createContext(entitlement);

    await syncEntitlementFromSubscription(
      ctx as never,
      {
        created: 200,
        id: "evt_deleted",
        type: "customer.subscription.deleted",
      } as Stripe.Event,
      {} as Stripe.Subscription,
    );

    expect(mocks.cancelNeverStartedQueueForOwner).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ ownerId: "owner_123" }),
    );
  });

  it("applies the second authoritative plan and cancel snapshot in the same second", async () => {
    mocks.getStripeEntitlementSourceEvent.mockResolvedValueOnce({
      eventType: "customer.subscription.updated",
      state: "active",
    });
    mocks.getStripeSubscriptionSnapshot.mockReturnValueOnce({
      cancelAtPeriodEnd: true,
      customerId: "cus_123",
      ownerId: "owner_123",
      periodEnd: "2026-08-01T00:00:00.000Z",
      periodStart: "2026-07-01T00:00:00.000Z",
      planKey: "pro",
      priceId: "price_pro",
      status: "active",
      subscriptionId: "sub_123",
    });
    const entitlement = {
      _id: "entitlement_doc",
      currentPeriodEnd: "2026-08-01T00:00:00.000Z",
      currentPeriodStart: "2026-07-01T00:00:00.000Z",
      latestPaidInvoiceId: "in_paid",
      latestPaymentEventCreatedAt: 100,
      latestSubscriptionEventCreatedAt: 200,
      planKey: "starter",
      sourceEventCreatedAt: 200,
      sourceEventId: "evt_first_update",
      state: "active",
      stripeSubscriptionId: "sub_123",
      version: 2,
    };
    const ctx = createContext(entitlement);

    await syncEntitlementFromSubscription(
      ctx as never,
      {
        created: 200,
        id: "evt_second_update",
        type: "customer.subscription.updated",
      } as Stripe.Event,
      {} as Stripe.Subscription,
    );

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "entitlement_doc",
      expect.objectContaining({
        cancelAtPeriodEnd: true,
        pendingPlanKey: "pro",
        pendingStripePriceId: "price_pro",
      }),
    );
  });

  it("refreshes schedule fields without replacing same-second paid state", async () => {
    mocks.getStripeEntitlementSourceEvent.mockResolvedValueOnce({
      eventType: "invoice.paid",
      state: "active",
    });
    mocks.getStripeSubscriptionSnapshot.mockReturnValueOnce({
      cancelAtPeriodEnd: true,
      customerId: "cus_123",
      ownerId: "owner_123",
      periodEnd: "2026-08-01T00:00:00.000Z",
      periodStart: "2026-07-01T00:00:00.000Z",
      planKey: "pro",
      priceId: "price_pro",
      status: "active",
      subscriptionId: "sub_123",
    });
    const entitlement = {
      _id: "entitlement_doc",
      currentPeriodEnd: "2026-08-01T00:00:00.000Z",
      currentPeriodStart: "2026-07-01T00:00:00.000Z",
      latestPaidInvoiceId: "in_paid",
      latestPaymentEventCreatedAt: 200,
      latestSubscriptionEventCreatedAt: 100,
      planKey: "starter",
      sourceEventCreatedAt: 200,
      sourceEventId: "evt_paid",
      state: "active",
      stripeSubscriptionId: "sub_123",
      version: 2,
    };
    const ctx = createContext(entitlement);

    await syncEntitlementFromSubscription(
      ctx as never,
      {
        created: 200,
        id: "evt_schedule",
        type: "customer.subscription.updated",
      } as Stripe.Event,
      {} as Stripe.Subscription,
    );

    expect(ctx.db.patch).toHaveBeenCalledWith("entitlement_doc", {
      cancelAtPeriodEnd: true,
      latestSubscriptionEventCreatedAt: 200,
      pendingPlanKey: "pro",
      pendingStripePriceId: "price_pro",
      updatedAt: "1970-01-01T00:03:20.000Z",
      version: 3,
    });
  });
});
