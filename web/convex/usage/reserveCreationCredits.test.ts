import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reserveCreationCredits } from "./reserveCreationCredits";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  acquireGenerationSlot: vi.fn(),
  appendUsageLedgerEntry: vi.fn(),
  assertOwnerCanGenerate: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  getCurrentUsagePeriod: vi.fn(),
  getEligibleCreditGrants: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../billing/assertOwnerCanGenerate", () => ({
  assertOwnerCanGenerate: mocks.assertOwnerCanGenerate,
}));
vi.mock("../workerQueue/acquireGenerationSlot", () => ({
  acquireGenerationSlot: mocks.acquireGenerationSlot,
}));
vi.mock("./appendUsageLedgerEntry", () => ({
  appendUsageLedgerEntry: mocks.appendUsageLedgerEntry,
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
  const query = {
    unique: vi.fn(async () => null),
    withIndex: vi.fn(
      (
        _name: string,
        applyIndex: (value: {
          eq: (field: string, value: string) => unknown;
        }) => unknown,
      ) => {
        const indexQuery = {
          eq: vi.fn(),
        };
        indexQuery.eq.mockReturnValue(indexQuery);
        applyIndex(indexQuery);
        return query;
      },
    ),
  };

  return {
    db: {
      insert: vi.fn(async () => "inserted_doc"),
      patch: vi.fn(),
      query: vi.fn(() => query),
    },
  };
}

function createArgs(now: string) {
  return {
    domainId: "photo_1",
    domainKind: "photo",
    idempotencyKey: "background:photo_1",
    now,
    operation: "background_photo",
    reservationKind: "worker",
  };
}

const entitlement = {
  billingReviewRequired: false,
  cancelAtPeriodEnd: false,
  currentPeriodEnd: "2026-08-01T00:00:00.000Z",
  currentPeriodStart: "2026-07-01T00:00:00.000Z",
  planKey: "pro",
  state: "active",
  stripeSubscriptionId: "subscription_1",
};

const period = {
  _id: "period_doc",
  aiVideosAdjusted: 0,
  aiVideosConsumed: 0,
  aiVideosGranted: 10,
  aiVideosReserved: 0,
  creationCreditsConsumed: 0,
  creationCreditsReserved: 0,
  periodEnd: "2026-08-01T00:00:00.000Z",
};

describe("reserveCreationCredits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.assertOwnerCanGenerate.mockResolvedValue(entitlement);
    mocks.getCurrentUsagePeriod.mockResolvedValue(period);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cannot use a historical client timestamp to bypass an expired entitlement", async () => {
    const serverNow = "2026-07-16T12:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(serverNow);
    mocks.assertOwnerCanGenerate.mockImplementationOnce(
      async (_ctx: unknown, _ownerId: string, checkedAt: string) => {
        expect(checkedAt).toBe(serverNow);
        throw new Error("Subscription inactive");
      },
    );
    const ctx = createContext();

    await expect(
      getHandler(reserveCreationCredits)(
        ctx,
        createArgs("2000-01-01T00:00:00.000Z"),
      ),
    ).rejects.toThrow("Subscription inactive");
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("cannot use a historical client timestamp to spend an expired credit grant", async () => {
    const serverNow = "2026-07-16T12:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(serverNow);
    mocks.getEligibleCreditGrants.mockImplementationOnce(
      async (_ctx: unknown, _ownerId: string, checkedAt: string) => {
        expect(checkedAt).toBe(serverNow);
        return [];
      },
    );
    const ctx = createContext();

    await expect(
      getHandler(reserveCreationCredits)(
        ctx,
        createArgs("2000-01-01T00:00:00.000Z"),
      ),
    ).rejects.toMatchObject({
      data: { code: "INSUFFICIENT_CREATION_CREDITS" },
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("cannot use a future client timestamp to extend a reservation", async () => {
    const serverNow = "2026-07-16T12:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(serverNow);
    mocks.getEligibleCreditGrants.mockResolvedValueOnce([
      {
        _id: "grant_doc",
        amountConsumed: 0,
        amountGranted: 2_000,
        amountReserved: 0,
        amountRevoked: 0,
        grantId: "grant_1",
      },
    ]);
    const ctx = createContext();

    await getHandler(reserveCreationCredits)(
      ctx,
      createArgs("2099-01-01T00:00:00.000Z"),
    );

    expect(ctx.db.insert).toHaveBeenCalledWith(
      "usageReservations",
      expect.objectContaining({
        createdAt: serverNow,
        expiresAt: "2026-07-17T12:00:00.000Z",
        updatedAt: serverNow,
      }),
    );
  });

  it("keeps already-granted refill credits spendable during payment grace", async () => {
    const serverNow = "2026-07-16T12:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(serverNow);
    mocks.assertOwnerCanGenerate.mockResolvedValueOnce({
      ...entitlement,
      graceEndsAt: "2026-07-19T12:00:00.000Z",
      state: "grace",
    });
    mocks.getEligibleCreditGrants.mockResolvedValueOnce([
      {
        _id: "refill_grant_doc",
        amountConsumed: 0,
        amountGranted: 2_000,
        amountReserved: 0,
        amountRevoked: 0,
        grantId: "refill_grant_1",
      },
    ]);
    const ctx = createContext();

    await getHandler(reserveCreationCredits)(ctx, createArgs(serverNow));

    expect(mocks.getEligibleCreditGrants).toHaveBeenCalledWith(
      ctx,
      "owner_123",
      serverNow,
      true,
      "subscription_1",
    );
  });

  it("rejects browser provenance outside browser Stitchr", async () => {
    const ctx = createContext();

    await expect(
      getHandler(reserveCreationCredits)(ctx, {
        ...createArgs("2026-07-16T12:00:00.000Z"),
        reservationKind: "browser",
      }),
    ).rejects.toThrow("provenance is invalid");
    expect(mocks.assertOwnerCanGenerate).not.toHaveBeenCalled();
  });

  it("does not let browser Stitchr omit browser slot provenance", async () => {
    const ctx = createContext();

    await expect(
      getHandler(reserveCreationCredits)(ctx, {
        domainId: "stitch_1",
        domainKind: "stitch",
        idempotencyKey: "stitch:stitch_1",
        now: "2026-07-16T12:00:00.000Z",
        operation: "stitch",
        reservationKind: "worker",
      }),
    ).rejects.toThrow("provenance is invalid");
    expect(mocks.assertOwnerCanGenerate).not.toHaveBeenCalled();
  });
});
