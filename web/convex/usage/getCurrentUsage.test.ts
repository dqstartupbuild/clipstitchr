import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUsage } from "./getCurrentUsage";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  getCurrentUsagePeriod: vi.fn(),
  getEffectiveEntitlementForOwner: vi.fn(),
  getEligibleCreditGrants: vi.fn(),
  query: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ query: mocks.query }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../billing/getEffectiveEntitlementForOwner", () => ({
  getEffectiveEntitlementForOwner: mocks.getEffectiveEntitlementForOwner,
}));
vi.mock("./getCurrentUsagePeriod", () => ({
  getCurrentUsagePeriod: mocks.getCurrentUsagePeriod,
}));
vi.mock("./getEligibleCreditGrants", () => ({
  getEligibleCreditGrants: mocks.getEligibleCreditGrants,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext() {
  const indexQuery = { eq: vi.fn() };
  indexQuery.eq.mockReturnValue(indexQuery);
  const query = {
    collect: vi.fn(async () => []),
    withIndex: vi.fn(
      (_name: string, applyIndex: (value: typeof indexQuery) => unknown) => {
        applyIndex(indexQuery);
        return query;
      },
    ),
  };

  return { db: { query: vi.fn(() => query) } };
}

describe("getCurrentUsage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime("2026-07-16T12:00:00.000Z");
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
    mocks.getEffectiveEntitlementForOwner.mockResolvedValue({
      entitlement: {
        currentPeriodEnd: "2026-08-01T00:00:00.000Z",
        currentPeriodStart: "2026-07-01T00:00:00.000Z",
        planKey: "pro",
        stripeSubscriptionId: "subscription_1",
      },
      state: "grace",
    });
    mocks.getCurrentUsagePeriod.mockResolvedValue(null);
    mocks.getEligibleCreditGrants.mockResolvedValue([
      {
        amountConsumed: 0,
        amountGranted: 2_000,
        amountReserved: 0,
        amountRevoked: 0,
        expiresAt: "2027-07-16T12:00:00.000Z",
        grantType: "refill",
      },
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports already-granted refill credits as spendable during grace", async () => {
    const ctx = createContext();

    await expect(
      getHandler<Record<string, never>, unknown>(getCurrentUsage)(ctx, {}),
    ).resolves.toMatchObject({
      creationCredits: { available: 2_000, refillRemaining: 2_000 },
      entitlementState: "grace",
    });
    expect(mocks.getEligibleCreditGrants).toHaveBeenCalledWith(
      ctx,
      "owner_1",
      "2026-07-16T12:00:00.000Z",
      true,
      "subscription_1",
    );
  });
});
