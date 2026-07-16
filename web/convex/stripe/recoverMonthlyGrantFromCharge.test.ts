import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { recoverMonthlyGrantFromCharge } from "./recoverMonthlyGrantFromCharge";

const mocks = vi.hoisted(() => ({
  getStripeInvoiceSnapshot: vi.fn(),
  grantMonthlyAllowance: vi.fn(),
  reconcileDailyDraftsAfterPlanChange: vi.fn(),
  reconcileProductsAfterPlanChange: vi.fn(),
}));

vi.mock("./getStripeInvoiceSnapshot", () => ({
  getStripeInvoiceSnapshot: mocks.getStripeInvoiceSnapshot,
}));
vi.mock("../usage/grantMonthlyAllowance", () => ({
  grantMonthlyAllowance: mocks.grantMonthlyAllowance,
}));
vi.mock("../automation/reconcileDailyDraftsAfterPlanChange", () => ({
  reconcileDailyDraftsAfterPlanChange:
    mocks.reconcileDailyDraftsAfterPlanChange,
}));
vi.mock("../products/reconcileProductsAfterPlanChange", () => ({
  reconcileProductsAfterPlanChange: mocks.reconcileProductsAfterPlanChange,
}));

function createContext() {
  const query = {
    unique: vi.fn(async () => ({
      latestPaidInvoiceId: "in_monthly",
      stripeCustomerId: "cus_owner",
      stripeSubscriptionId: "sub_owner",
    })),
    withIndex: vi.fn(() => query),
  };

  return { db: { query: vi.fn(() => query) } };
}

describe("recoverMonthlyGrantFromCharge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getStripeInvoiceSnapshot.mockReturnValue({
      customerId: "cus_owner",
      invoiceId: "in_monthly",
      ownerId: "owner_1",
      periodEnd: "2026-08-01T00:00:00.000Z",
      periodStart: "2026-07-01T00:00:00.000Z",
      planKey: "pro",
      subscriptionId: "sub_owner",
    });
    mocks.grantMonthlyAllowance.mockResolvedValue({
      creditGrant: 5_000,
      periodKey: "sub_owner:period",
    });
  });

  it("recreates a skipped monthly grant from the paid invoice timestamp", async () => {
    const ctx = createContext();
    const invoice = {
      created: 100,
      id: "in_monthly",
      status: "paid",
      status_transitions: { paid_at: 200 },
    } as unknown as Stripe.Invoice;
    const charge = {
      customer: "cus_owner",
      id: "ch_monthly",
      invoice,
      payment_intent: "pi_monthly",
    } as unknown as Stripe.Charge;

    await recoverMonthlyGrantFromCharge(ctx as never, charge, "owner_1");

    expect(mocks.grantMonthlyAllowance).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        eventId: "stripe-recovery:invoice:in_monthly",
        invoiceId: "in_monthly",
        now: "1970-01-01T00:03:20.000Z",
        stripeChargeId: "ch_monthly",
        stripePaymentIntentId: "pi_monthly",
      }),
    );
    expect(mocks.reconcileProductsAfterPlanChange).toHaveBeenCalledOnce();
    expect(mocks.reconcileDailyDraftsAfterPlanChange).toHaveBeenCalledOnce();
  });

  it("fails closed when the invoice owner conflicts", async () => {
    const ctx = createContext();
    mocks.getStripeInvoiceSnapshot.mockReturnValueOnce({
      customerId: "cus_owner",
      invoiceId: "in_monthly",
      ownerId: "owner_other",
      periodEnd: "2026-08-01T00:00:00.000Z",
      periodStart: "2026-07-01T00:00:00.000Z",
      planKey: "pro",
      subscriptionId: "sub_owner",
    });

    await expect(
      recoverMonthlyGrantFromCharge(
        ctx as never,
        {
          customer: "cus_owner",
          id: "ch_monthly",
          invoice: { id: "in_monthly", status: "paid" },
        } as unknown as Stripe.Charge,
        "owner_1",
      ),
    ).rejects.toThrow("owner does not match");

    expect(mocks.grantMonthlyAllowance).not.toHaveBeenCalled();
  });
});
