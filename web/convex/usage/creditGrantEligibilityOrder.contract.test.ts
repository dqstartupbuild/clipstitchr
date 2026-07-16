import { describe, expect, it, vi } from "vitest";
import { getEligibleCreditGrants } from "./getEligibleCreditGrants";

function createGrant(
  grantId: string,
  grantType: "monthly" | "refill",
  spendPriority: number,
  expiresAt: string,
) {
  return {
    amountConsumed: 0,
    amountGranted: 100,
    amountReserved: 0,
    amountRevoked: 0,
    availableFrom: "2026-07-01T00:00:00.000Z",
    expiresAt,
    grantId,
    grantType,
    requiresActiveSubscription: grantType === "refill",
    spendPriority,
    stripeSubscriptionId:
      grantType === "refill" ? "subscription_current" : undefined,
  };
}

describe("credit grant eligibility order contract", () => {
  it("queries monthly priority first and refill expiry ascending", async () => {
    const orderedGrants = [
      createGrant("monthly", "monthly", 0, "2026-08-01T00:00:00.000Z"),
      createGrant("refill_early", "refill", 10, "2026-10-01T00:00:00.000Z"),
      createGrant("refill_late", "refill", 10, "2027-01-01T00:00:00.000Z"),
    ];
    const indexQuery = { eq: vi.fn() };
    indexQuery.eq.mockReturnValue(indexQuery);
    const query = {
      order: vi.fn(),
      take: vi.fn(async () => orderedGrants),
      withIndex: vi.fn(
        (_name: string, applyIndex: (value: typeof indexQuery) => unknown) => {
          applyIndex(indexQuery);
          return query;
        },
      ),
    };
    query.order.mockReturnValue(query);
    const ctx = { db: { query: vi.fn(() => query) } };

    const result = await getEligibleCreditGrants(
      ctx as never,
      "owner_123",
      "2026-07-16T12:00:00.000Z",
      true,
      "subscription_current",
    );

    expect(query.withIndex).toHaveBeenCalledWith(
      "by_owner_status_priority_expiry",
      expect.any(Function),
    );
    expect(query.order).toHaveBeenCalledWith("asc");
    expect(result.map((grant) => grant.grantId)).toEqual([
      "monthly",
      "refill_early",
      "refill_late",
    ]);
  });

  it("keeps subscription-bound refill grants behind the supplied access decision", async () => {
    const orderedGrants = [
      createGrant("monthly", "monthly", 0, "2026-08-01T00:00:00.000Z"),
      createGrant("refill", "refill", 10, "2027-01-01T00:00:00.000Z"),
    ];
    const indexQuery = { eq: vi.fn() };
    indexQuery.eq.mockReturnValue(indexQuery);
    const query = {
      order: vi.fn(),
      take: vi.fn(async () => orderedGrants),
      withIndex: vi.fn(
        (_name: string, applyIndex: (value: typeof indexQuery) => unknown) => {
          applyIndex(indexQuery);
          return query;
        },
      ),
    };
    query.order.mockReturnValue(query);
    const ctx = { db: { query: vi.fn(() => query) } };

    const withoutSubscriptionAccess = await getEligibleCreditGrants(
      ctx as never,
      "owner_123",
      "2026-07-16T12:00:00.000Z",
      false,
      "subscription_current",
    );

    expect(withoutSubscriptionAccess.map((grant) => grant.grantId)).toEqual([
      "monthly",
    ]);
  });

  it("does not revive a refill from a replaced subscription", async () => {
    const orderedGrants = [
      {
        ...createGrant("refill_old", "refill", 10, "2027-01-01T00:00:00.000Z"),
        stripeSubscriptionId: "subscription_old",
      },
      {
        ...createGrant(
          "refill_legacy",
          "refill",
          10,
          "2027-01-01T00:00:00.000Z",
        ),
        stripeSubscriptionId: undefined,
      },
    ];
    const indexQuery = { eq: vi.fn() };
    indexQuery.eq.mockReturnValue(indexQuery);
    const query = {
      order: vi.fn(),
      take: vi.fn(async () => orderedGrants),
      withIndex: vi.fn(
        (_name: string, applyIndex: (value: typeof indexQuery) => unknown) => {
          applyIndex(indexQuery);
          return query;
        },
      ),
    };
    query.order.mockReturnValue(query);
    const ctx = { db: { query: vi.fn(() => query) } };

    const result = await getEligibleCreditGrants(
      ctx as never,
      "owner_123",
      "2026-07-16T12:00:00.000Z",
      true,
      "subscription_new",
    );

    expect(result).toEqual([]);
  });
});
