import { beforeEach, describe, expect, it, vi } from "vitest";
import { reserveCreationCreditsForOwner } from "./reserveCreationCredits";

const mocks = vi.hoisted(() => ({
  acquireGenerationSlot: vi.fn(),
  appendUsageLedgerEntry: vi.fn(),
  assertOwnerCanGenerate: vi.fn(),
  getCurrentUsagePeriod: vi.fn(),
  getEligibleCreditGrants: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
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

  return {
    db: {
      insert: vi.fn(async (...args: [string, Record<string, unknown>]) => {
        void args;
        return "inserted_doc";
      }),
      patch: vi.fn(),
      query: vi.fn(() => query),
    },
  };
}

function createGrant(grantId: string, amountGranted: number) {
  return {
    _id: `${grantId}_doc`,
    amountConsumed: 0,
    amountGranted,
    amountReserved: 0,
    amountRevoked: 0,
    grantId,
  };
}

describe("creation credit allocation order contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertOwnerCanGenerate.mockResolvedValue({
      currentPeriodEnd: "2026-08-01T00:00:00.000Z",
      currentPeriodStart: "2026-07-01T00:00:00.000Z",
      planKey: "pro",
      state: "active",
      stripeSubscriptionId: "subscription_1",
    });
    mocks.getCurrentUsagePeriod.mockResolvedValue({
      _id: "period_doc",
      creationCreditsReserved: 0,
    });
  });

  it("allocates monthly credits before earliest-expiring refill credits", async () => {
    mocks.getEligibleCreditGrants.mockResolvedValue([
      createGrant("monthly", 10),
      createGrant("refill_early", 8),
      createGrant("refill_late", 20),
    ]);
    const ctx = createContext();

    const result = await reserveCreationCreditsForOwner(
      ctx as never,
      "owner_123",
      {
        domainId: "photo_1",
        domainKind: "photo",
        idempotencyKey: "background:photo_1",
        now: "2026-07-16T12:00:00.000Z",
        operation: "background_photo",
        reservationKind: "worker",
        source: "user_action",
      },
    );

    expect(result.amount).toBe(25);
    const allocations = ctx.db.insert.mock.calls
      .filter(([table]) => table === "usageReservationAllocations")
      .map(([, allocation]) => allocation);
    expect(allocations).toEqual([
      expect.objectContaining({ amount: 10, grantId: "monthly" }),
      expect.objectContaining({ amount: 8, grantId: "refill_early" }),
      expect.objectContaining({ amount: 7, grantId: "refill_late" }),
    ]);
  });
});
