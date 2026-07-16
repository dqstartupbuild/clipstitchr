import { describe, expect, it, vi } from "vitest";
import { syncBillingReviewFromPaymentHolds } from "./syncBillingReviewFromPaymentHolds";

function createContext(openHolds: unknown[]) {
  const entitlement = {
    _id: "entitlement_1",
    billingReviewReason: "Stripe payment review: 2 unresolved payments.",
    billingReviewRequired: true,
    version: 3,
  };

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn((table: string) => {
        const query = {
          collect: vi.fn(async () =>
            table === "stripePaymentHolds" ? openHolds : [],
          ),
          unique: vi.fn(async () =>
            table === "billingEntitlements" ? entitlement : null,
          ),
          withIndex: vi.fn(() => query),
        };

        return query;
      }),
    },
  };
}

describe("syncBillingReviewFromPaymentHolds", () => {
  it("keeps review required when another payment hold remains", async () => {
    const ctx = createContext([{ holdId: "dispute:ch_2" }]);

    await syncBillingReviewFromPaymentHolds(
      ctx as never,
      "owner_1",
      "2026-07-16T00:00:00.000Z",
    );

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "entitlement_1",
      expect.objectContaining({
        billingReviewRequired: true,
        billingReviewReason: "Stripe payment review: 1 unresolved payment.",
      }),
    );
  });

  it("clears only payment-hold-owned review after every hold resolves", async () => {
    const ctx = createContext([]);

    await syncBillingReviewFromPaymentHolds(
      ctx as never,
      "owner_1",
      "2026-07-16T00:00:00.000Z",
    );

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "entitlement_1",
      expect.objectContaining({
        billingReviewReason: undefined,
        billingReviewRequired: false,
      }),
    );
  });
});
