import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { revokeGrantForCharge } from "./revokeGrantForCharge";

const mocks = vi.hoisted(() => ({
  getStripeChargeBillingContext: vi.fn(),
  revokeCreditGrant: vi.fn(),
  syncBillingReviewFromPaymentHolds: vi.fn(),
  upsertStripePaymentHold: vi.fn(),
}));

vi.mock("./getStripeChargeBillingContext", () => ({
  getStripeChargeBillingContext: mocks.getStripeChargeBillingContext,
}));
vi.mock("../usage/revokeCreditGrant", () => ({
  revokeCreditGrant: mocks.revokeCreditGrant,
}));
vi.mock("./syncBillingReviewFromPaymentHolds", () => ({
  syncBillingReviewFromPaymentHolds: mocks.syncBillingReviewFromPaymentHolds,
}));
vi.mock("./upsertStripePaymentHold", () => ({
  upsertStripePaymentHold: mocks.upsertStripePaymentHold,
}));

describe("revokeGrantForCharge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.revokeCreditGrant.mockResolvedValue({ amountRevoked: 100 });
    mocks.upsertStripePaymentHold.mockResolvedValue({
      holdId: "hold_1",
      opened: true,
    });
  });

  it("opens a durable hold before a matching grant exists", async () => {
    mocks.getStripeChargeBillingContext.mockResolvedValue({
      customerId: "cus_owner",
      entitlement: { planKey: "pro" },
      grants: [],
      invoiceId: undefined,
      ownerId: "owner_1",
      paymentIntentId: "pi_refill",
    });

    await revokeGrantForCharge(
      {} as never,
      { created: 200, id: "evt_refund" } as Stripe.Event,
      { id: "ch_refill" } as Stripe.Charge,
      { kind: "refund", reason: "Stripe payment refunded" },
    );

    expect(mocks.upsertStripePaymentHold).toHaveBeenCalledBefore(
      mocks.syncBillingReviewFromPaymentHolds,
    );
    expect(mocks.revokeCreditGrant).not.toHaveBeenCalled();
  });

  it("revokes every monthly grant linked to the refunded invoice", async () => {
    mocks.getStripeChargeBillingContext.mockResolvedValue({
      customerId: "cus_owner",
      entitlement: { planKey: "pro" },
      grants: [{ grantId: "monthly_base" }, { grantId: "monthly_upgrade" }],
      invoiceId: "in_monthly",
      ownerId: "owner_1",
      paymentIntentId: "pi_monthly",
    });

    await revokeGrantForCharge(
      {} as never,
      { created: 200, id: "evt_refund" } as Stripe.Event,
      { id: "ch_monthly" } as Stripe.Charge,
      { kind: "refund", reason: "Stripe payment refunded" },
    );

    expect(mocks.revokeCreditGrant).toHaveBeenCalledTimes(2);
    expect(mocks.revokeCreditGrant).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ grantId: "monthly_base" }),
    );
    expect(mocks.revokeCreditGrant).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ grantId: "monthly_upgrade" }),
    );
  });

  it("does not revoke when an older opening event hits a resolved tombstone", async () => {
    mocks.getStripeChargeBillingContext.mockResolvedValue({
      customerId: "cus_owner",
      entitlement: { planKey: "pro" },
      grants: [{ grantId: "monthly_base" }],
      invoiceId: "in_monthly",
      ownerId: "owner_1",
      paymentIntentId: "pi_monthly",
    });
    mocks.upsertStripePaymentHold.mockResolvedValueOnce({
      holdId: "hold_1",
      opened: false,
    });

    await revokeGrantForCharge(
      {} as never,
      { created: 200, id: "evt_open_late" } as Stripe.Event,
      { id: "ch_monthly" } as Stripe.Charge,
      { kind: "dispute", reason: "Stripe payment dispute opened" },
    );

    expect(mocks.revokeCreditGrant).not.toHaveBeenCalled();
    expect(mocks.syncBillingReviewFromPaymentHolds).not.toHaveBeenCalled();
  });
});
