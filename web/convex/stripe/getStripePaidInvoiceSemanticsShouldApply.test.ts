import { describe, expect, it } from "vitest";
import { getStripePaidInvoiceSemanticsShouldApply } from "./getStripePaidInvoiceSemanticsShouldApply";

const current = {
  currentPeriodEnd: "2026-08-01T00:00:00.000Z",
  currentPeriodStart: "2026-07-01T00:00:00.000Z",
  latestPaidInvoiceId: "in_current",
  planKey: "starter" as const,
  stripeSubscriptionId: "sub_1",
};

describe("getStripePaidInvoiceSemanticsShouldApply", () => {
  it("accepts a newer billing period and rejects an older one", () => {
    expect(
      getStripePaidInvoiceSemanticsShouldApply(current, {
        invoiceId: "in_newer",
        periodEnd: "2026-09-01T00:00:00.000Z",
        periodStart: "2026-08-01T00:00:00.000Z",
        planKey: "starter",
        subscriptionId: "sub_1",
      }),
    ).toBe(true);
    expect(
      getStripePaidInvoiceSemanticsShouldApply(current, {
        invoiceId: "in_older",
        periodEnd: "2026-07-01T00:00:00.000Z",
        periodStart: "2026-06-01T00:00:00.000Z",
        planKey: "starter",
        subscriptionId: "sub_1",
      }),
    ).toBe(false);
  });

  it("makes a same-period paid upgrade monotonic regardless of delivery order", () => {
    expect(
      getStripePaidInvoiceSemanticsShouldApply(current, {
        invoiceId: "in_upgrade",
        periodEnd: current.currentPeriodEnd,
        periodStart: current.currentPeriodStart,
        planKey: "pro",
        subscriptionId: "sub_1",
      }),
    ).toBe(true);
    expect(
      getStripePaidInvoiceSemanticsShouldApply(
        { ...current, planKey: "pro" },
        {
          invoiceId: "in_starter",
          periodEnd: current.currentPeriodEnd,
          periodStart: current.currentPeriodStart,
          planKey: "starter",
          subscriptionId: "sub_1",
        },
      ),
    ).toBe(false);
  });

  it("rejects a duplicate invoice without consulting its event ID", () => {
    expect(
      getStripePaidInvoiceSemanticsShouldApply(current, {
        invoiceId: "in_current",
        periodEnd: current.currentPeriodEnd,
        periodStart: current.currentPeriodStart,
        planKey: "starter",
        subscriptionId: "sub_1",
      }),
    ).toBe(false);
  });
});
