import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reserveAiVideo } from "./reserveAiVideo";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertOwnerCanGenerate: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  getCurrentUsagePeriod: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../billing/assertOwnerCanGenerate", () => ({
  assertOwnerCanGenerate: mocks.assertOwnerCanGenerate,
}));
vi.mock("./getCurrentUsagePeriod", () => ({
  getCurrentUsagePeriod: mocks.getCurrentUsagePeriod,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext() {
  const indexQuery = { eq: vi.fn() };
  indexQuery.eq.mockReturnValue(indexQuery);
  const query = {
    unique: vi.fn(async () => null),
    withIndex: vi.fn(
      (_name: string, applyIndex: (value: typeof indexQuery) => unknown) => {
        applyIndex(indexQuery);
        return query;
      },
    ),
  };

  return { db: { query: vi.fn(() => query) } };
}

describe("reserveAiVideo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.assertOwnerCanGenerate.mockResolvedValue({
      currentPeriodStart: "2026-07-01T00:00:00.000Z",
      planKey: "pro",
      stripeSubscriptionId: "subscription_1",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cannot use a historical client timestamp to reserve after entitlement expiry", async () => {
    const serverNow = "2026-07-16T12:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(serverNow);
    mocks.assertOwnerCanGenerate.mockImplementationOnce(
      async (_ctx: unknown, _ownerId: string, checkedAt: string) => {
        expect(checkedAt).toBe(serverNow);
        throw new Error("Subscription inactive");
      },
    );

    await expect(
      getHandler(reserveAiVideo)(createContext(), {
        domainId: "clipr_1",
        domainKind: "clipr",
        idempotencyKey: "clipr:clipr_1",
        now: "2000-01-01T00:00:00.000Z",
        operation: "clipr_video",
      }),
    ).rejects.toThrow("Subscription inactive");
  });

  it.each([
    [
      "not-yet-active",
      {
        periodEnd: "2026-09-01T00:00:00.000Z",
        periodStart: "2026-08-01T00:00:00.000Z",
      },
    ],
    [
      "expired",
      {
        periodEnd: "2026-07-16T12:00:00.000Z",
        periodStart: "2026-06-16T12:00:00.000Z",
      },
    ],
  ])(
    "rejects a %s allowance period using server time",
    async (_label, period) => {
      const serverNow = "2026-07-16T12:00:00.000Z";
      vi.useFakeTimers();
      vi.setSystemTime(serverNow);
      mocks.getCurrentUsagePeriod.mockResolvedValueOnce({
        aiVideosAdjusted: 0,
        aiVideosConsumed: 0,
        aiVideosGranted: 10,
        aiVideosReserved: 0,
        ...period,
      });

      await expect(
        getHandler(reserveAiVideo)(createContext(), {
          domainId: "clipr_1",
          domainKind: "clipr",
          idempotencyKey: "clipr:clipr_1",
          now: "2000-01-01T00:00:00.000Z",
          operation: "clipr_video",
        }),
      ).rejects.toMatchObject({
        data: { code: "USAGE_RECONCILIATION_REQUIRED" },
      });
    },
  );
});
