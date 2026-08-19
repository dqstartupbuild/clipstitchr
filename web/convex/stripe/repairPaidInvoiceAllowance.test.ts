import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { repairPaidInvoiceAllowanceForInvoice } from "./repairPaidInvoiceAllowance";

const mocks = vi.hoisted(() => ({
  getStripeInvoiceSnapshot: vi.fn(),
  getStripePaymentHasOpenHold: vi.fn(),
  grantMonthlyAllowance: vi.fn(),
  writeEntitlementHistory: vi.fn(),
}));

vi.mock("./getStripeInvoiceSnapshot", () => ({
  getStripeInvoiceSnapshot: mocks.getStripeInvoiceSnapshot,
}));
vi.mock("./getStripePaymentHasOpenHold", () => ({
  getStripePaymentHasOpenHold: mocks.getStripePaymentHasOpenHold,
}));
vi.mock("../usage/grantMonthlyAllowance", () => ({
  grantMonthlyAllowance: mocks.grantMonthlyAllowance,
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

describe("repairPaidInvoiceAllowance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getStripeInvoiceSnapshot.mockReturnValue({
      customerId: "cus_123",
      invoiceId: "in_renewal",
      ownerId: "owner_123",
      periodEnd: "2026-09-18T00:00:00.000Z",
      periodStart: "2026-08-18T00:00:00.000Z",
      planKey: "starter",
      priceId: "price_starter",
      subscriptionId: "sub_123",
    });
    mocks.getStripePaymentHasOpenHold.mockResolvedValue(false);
    mocks.grantMonthlyAllowance.mockResolvedValue({
      creditGrant: 2_000,
      periodKey: "sub_123:2026-08-18T00:00:00.000Z",
    });
  });

  it("grants the full missing monthly allowance for the corrected renewal period", async () => {
    const ctx = createContext({
      _id: "entitlement_doc",
      currentPeriodEnd: "2026-08-18T00:00:00.000Z",
      currentPeriodStart: "2026-07-18T00:00:00.000Z",
      latestPaidInvoiceId: "in_renewal",
      ownerId: "owner_123",
      planKey: "starter",
      state: "active",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      version: 1,
    });

    await repairPaidInvoiceAllowanceForInvoice(
      ctx as never,
      {
        actor: "support-agent",
        invoiceJson: JSON.stringify({ id: "in_renewal", status: "paid" }),
        ownerId: "owner_123",
      },
    );

    expect(mocks.grantMonthlyAllowance).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        invoiceId: "in_renewal",
        ownerId: "owner_123",
        periodStart: "2026-08-18T00:00:00.000Z",
        periodEnd: "2026-09-18T00:00:00.000Z",
        planKey: "starter",
        stripeSubscriptionId: "sub_123",
      }),
    );

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "entitlement_doc",
      expect.objectContaining({
        currentPeriodStart: "2026-08-18T00:00:00.000Z",
        currentPeriodEnd: "2026-09-18T00:00:00.000Z",
      }),
    );
  });

  it("does not duplicate an allowance when the correct period already exists", async () => {
    const ctx = createContext({
      _id: "entitlement_doc",
      currentPeriodEnd: "2026-09-18T00:00:00.000Z",
      currentPeriodStart: "2026-08-18T00:00:00.000Z",
      latestPaidInvoiceId: "in_renewal",
      ownerId: "owner_123",
      planKey: "starter",
      state: "active",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      version: 1,
    });
    mocks.grantMonthlyAllowance.mockResolvedValue({
      creditGrant: 0,
      periodKey: "sub_123:2026-08-18T00:00:00.000Z",
    });

    const result = await repairPaidInvoiceAllowanceForInvoice(
      ctx as never,
      {
        actor: "support-agent",
        invoiceJson: JSON.stringify({ id: "in_renewal", status: "paid" }),
        ownerId: "owner_123",
      },
    );

    expect(result.creditsAdded).toBe(0);
    expect(result.periodCorrected).toBe(false);
    expect(mocks.writeEntitlementHistory).not.toHaveBeenCalled();
  });

  it("rejects an invoice that is not the entitlement's latest paid invoice", async () => {
    const ctx = createContext({
      _id: "entitlement_doc",
      currentPeriodEnd: "2026-09-18T00:00:00.000Z",
      currentPeriodStart: "2026-08-18T00:00:00.000Z",
      latestPaidInvoiceId: "in_previous",
      ownerId: "owner_123",
      planKey: "starter",
      state: "active",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      version: 1,
    });

    await expect(
      repairPaidInvoiceAllowanceForInvoice(
        ctx as never,
        {
          actor: "support-agent",
          invoiceJson: JSON.stringify({ id: "in_renewal", status: "paid" }),
          ownerId: "owner_123",
        },
      ),
    ).rejects.toThrow("current billing entitlement");
  });

  it("rejects an invoice with an open payment hold", async () => {
    const ctx = createContext({
      _id: "entitlement_doc",
      currentPeriodEnd: "2026-09-18T00:00:00.000Z",
      currentPeriodStart: "2026-08-18T00:00:00.000Z",
      latestPaidInvoiceId: "in_renewal",
      ownerId: "owner_123",
      planKey: "starter",
      state: "active",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      version: 1,
    });
    mocks.getStripePaymentHasOpenHold.mockResolvedValue(true);

    await expect(
      repairPaidInvoiceAllowanceForInvoice(
        ctx as never,
        {
          actor: "support-agent",
          invoiceJson: JSON.stringify({ id: "in_renewal", status: "paid" }),
          ownerId: "owner_123",
        },
      ),
    ).rejects.toThrow("open payment hold");
  });
});
