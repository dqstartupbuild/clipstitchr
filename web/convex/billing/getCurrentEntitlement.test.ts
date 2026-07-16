import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentEntitlement } from "./getCurrentEntitlement";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  query: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ query: mocks.query }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(state: "active" | "grace" | "inactive") {
  const indexQuery = { eq: vi.fn() };
  indexQuery.eq.mockReturnValue(indexQuery);
  const query = {
    unique: vi.fn(async () => ({
      billingReviewRequired: false,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: "2026-08-16T12:00:00.000Z",
      currentPeriodStart: "2026-07-16T10:00:00.000Z",
      graceEndsAt: state === "grace" ? "2026-07-19T12:00:00.000Z" : undefined,
      ownerId: "owner_123",
      planKey: "pro" as const,
      state,
      stripeCustomerId: "customer_123",
      stripePriceId: "price_123",
      stripeSubscriptionId: "subscription_123",
    })),
    withIndex: vi.fn(
      (_name: string, applyIndex: (value: typeof indexQuery) => unknown) => {
        applyIndex(indexQuery);
        return query;
      },
    ),
  };

  return { db: { query: vi.fn(() => query) } };
}

describe("getCurrentEntitlement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime("2026-07-16T12:00:00.000Z");
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("exposes canonical refill eligibility from server-owned billing state", async () => {
    await expect(
      getHandler<Record<string, never>, { canBuyRefill: boolean }>(
        getCurrentEntitlement,
      )(createContext("active"), {}),
    ).resolves.toMatchObject({ canBuyRefill: true, state: "active" });

    await expect(
      getHandler<Record<string, never>, { canBuyRefill: boolean }>(
        getCurrentEntitlement,
      )(createContext("grace"), {}),
    ).resolves.toMatchObject({ canBuyRefill: false, state: "grace" });
  });
});
