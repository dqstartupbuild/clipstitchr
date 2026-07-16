import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { restoreGrantForCharge } from "./restoreGrantForCharge";

const mocks = vi.hoisted(() => ({
  getStripeChargeBillingContext: vi.fn(),
  getStripePaymentHasOpenHold: vi.fn(),
  recoverCreditRefillFromCharge: vi.fn(),
  recoverMonthlyGrantFromCharge: vi.fn(),
  resolveStripePaymentHold: vi.fn(),
  restoreRevokedCreditGrant: vi.fn(),
  syncBillingReviewFromPaymentHolds: vi.fn(),
}));

vi.mock("./getStripeChargeBillingContext", () => ({
  getStripeChargeBillingContext: mocks.getStripeChargeBillingContext,
}));
vi.mock("./getStripePaymentHasOpenHold", () => ({
  getStripePaymentHasOpenHold: mocks.getStripePaymentHasOpenHold,
}));
vi.mock("./recoverCreditRefillFromCharge", () => ({
  recoverCreditRefillFromCharge: mocks.recoverCreditRefillFromCharge,
}));
vi.mock("./recoverMonthlyGrantFromCharge", () => ({
  recoverMonthlyGrantFromCharge: mocks.recoverMonthlyGrantFromCharge,
}));
vi.mock("./resolveStripePaymentHold", () => ({
  resolveStripePaymentHold: mocks.resolveStripePaymentHold,
}));
vi.mock("../usage/restoreRevokedCreditGrant", () => ({
  restoreRevokedCreditGrant: mocks.restoreRevokedCreditGrant,
}));
vi.mock("./syncBillingReviewFromPaymentHolds", () => ({
  syncBillingReviewFromPaymentHolds: mocks.syncBillingReviewFromPaymentHolds,
}));

function createContext(remainingHolds: unknown[]) {
  const query = {
    collect: vi.fn(async () => remainingHolds),
    withIndex: vi.fn(() => query),
  };

  return { db: { query: vi.fn(() => query) } };
}

describe("restoreGrantForCharge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getStripeChargeBillingContext.mockResolvedValue({
      customerId: "cus_owner",
      entitlement: { planKey: "pro" },
      grants: [{ grantId: "grant_1" }],
      ownerId: "owner_1",
    });
    mocks.resolveStripePaymentHold.mockResolvedValue({
      resolvedFromOpenHold: true,
      status: "resolved",
    });
    mocks.getStripePaymentHasOpenHold.mockResolvedValue(false);
    mocks.recoverCreditRefillFromCharge.mockResolvedValue("refill:pi_1");
    mocks.recoverMonthlyGrantFromCharge.mockResolvedValue({
      creditGrant: 2_000,
      periodKey: "sub_1:period",
    });
  });

  it("does not restore while a refund hold remains on the same charge", async () => {
    const ctx = createContext([{ holdId: "refund:ch_1" }]);

    await restoreGrantForCharge(
      ctx as never,
      { created: 300, id: "evt_won" } as Stripe.Event,
      { id: "ch_1" } as Stripe.Charge,
    );

    expect(mocks.restoreRevokedCreditGrant).not.toHaveBeenCalled();
    expect(mocks.syncBillingReviewFromPaymentHolds).toHaveBeenCalledWith(
      ctx,
      "owner_1",
      expect.any(String),
    );
  });

  it("restores only after the matching charge has no open holds", async () => {
    const ctx = createContext([]);

    await restoreGrantForCharge(
      ctx as never,
      { created: 300, id: "evt_won" } as Stripe.Event,
      { id: "ch_1" } as Stripe.Charge,
    );

    expect(mocks.restoreRevokedCreditGrant).toHaveBeenCalledOnce();
  });

  it("replays a monthly grant skipped by an earlier adverse hold", async () => {
    mocks.getStripeChargeBillingContext.mockResolvedValueOnce({
      customerId: "cus_owner",
      entitlement: { planKey: "pro" },
      grants: [],
      invoiceId: "in_monthly",
      ownerId: "owner_1",
      paymentIntentId: "pi_monthly",
    });
    const ctx = createContext([]);
    const charge = { id: "ch_monthly" } as Stripe.Charge;

    await restoreGrantForCharge(
      ctx as never,
      { created: 300, id: "evt_won" } as Stripe.Event,
      charge,
    );

    expect(mocks.recoverMonthlyGrantFromCharge).toHaveBeenCalledWith(
      ctx,
      charge,
      "owner_1",
    );
    expect(mocks.recoverCreditRefillFromCharge).not.toHaveBeenCalled();
    expect(mocks.syncBillingReviewFromPaymentHolds).toHaveBeenCalledAfter(
      mocks.recoverMonthlyGrantFromCharge,
    );
  });

  it("replays a refill grant skipped by an earlier adverse hold", async () => {
    mocks.getStripeChargeBillingContext.mockResolvedValueOnce({
      customerId: "cus_owner",
      entitlement: { planKey: "pro" },
      grants: [],
      invoiceId: undefined,
      ownerId: "owner_1",
      paymentIntentId: "pi_refill",
    });
    const ctx = createContext([]);
    const event = { created: 300, id: "evt_won" } as Stripe.Event;
    const charge = { id: "ch_refill" } as Stripe.Charge;

    await restoreGrantForCharge(ctx as never, event, charge);

    expect(mocks.recoverCreditRefillFromCharge).toHaveBeenCalledWith(
      ctx,
      event,
      charge,
    );
    expect(mocks.recoverMonthlyGrantFromCharge).not.toHaveBeenCalled();
    expect(mocks.syncBillingReviewFromPaymentHolds).toHaveBeenCalledAfter(
      mocks.recoverCreditRefillFromCharge,
    );
  });

  it("waits for the last hold on the same payment before replaying", async () => {
    mocks.getStripeChargeBillingContext.mockResolvedValueOnce({
      customerId: "cus_owner",
      entitlement: { planKey: "pro" },
      grants: [],
      invoiceId: undefined,
      ownerId: "owner_1",
      paymentIntentId: "pi_refill",
    });
    mocks.getStripePaymentHasOpenHold.mockResolvedValueOnce(true);
    const ctx = createContext([]);

    await restoreGrantForCharge(
      ctx as never,
      { created: 300, id: "evt_first_resolution" } as Stripe.Event,
      { id: "ch_refill" } as Stripe.Charge,
    );

    expect(mocks.recoverCreditRefillFromCharge).not.toHaveBeenCalled();
    expect(mocks.recoverMonthlyGrantFromCharge).not.toHaveBeenCalled();
    expect(mocks.syncBillingReviewFromPaymentHolds).toHaveBeenCalledOnce();
  });
});
