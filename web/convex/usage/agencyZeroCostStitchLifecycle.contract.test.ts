import { beforeEach, describe, expect, it, vi } from "vitest";
import { commitUserStitchUsage } from "./commitUserStitchUsage";
import { reserveCreationCreditsForOwner } from "./reserveCreationCredits";

const mocks = vi.hoisted(() => ({
  acquireGenerationSlot: vi.fn(),
  appendUsageLedgerEntry: vi.fn(),
  assertOwnerCanGenerate: vi.fn(),
  getCurrentUsagePeriod: vi.fn(),
  getEligibleCreditGrants: vi.fn(),
  internalMutation: vi.fn((definition) => definition),
  mutation: vi.fn((definition) => definition),
  releaseGenerationSlot: vi.fn(),
}));

vi.mock("../_generated/server", () => ({
  internalMutation: mocks.internalMutation,
  mutation: mocks.mutation,
}));
vi.mock("../billing/assertOwnerCanGenerate", () => ({
  assertOwnerCanGenerate: mocks.assertOwnerCanGenerate,
}));
vi.mock("../workerQueue/acquireGenerationSlot", () => ({
  acquireGenerationSlot: mocks.acquireGenerationSlot,
}));
vi.mock("../workerQueue/releaseGenerationSlot", () => ({
  releaseGenerationSlot: mocks.releaseGenerationSlot,
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
  const zeroCostEvents: Array<Record<string, unknown>> = [];
  const db = {
    insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
      if (table === "zeroCostUsageEvents") {
        zeroCostEvents.push({ ...value, _id: "zero_cost_doc" });
      }
      return "zero_cost_doc";
    }),
    patch: vi.fn(),
    query: vi.fn((table: string) => {
      const indexQuery = { eq: vi.fn() };
      indexQuery.eq.mockReturnValue(indexQuery);
      const query = {
        unique: vi.fn(async () =>
          table === "zeroCostUsageEvents" ? (zeroCostEvents[0] ?? null) : null,
        ),
        withIndex: vi.fn(
          (
            _name: string,
            applyIndex: (value: typeof indexQuery) => unknown,
          ) => {
            applyIndex(indexQuery);
            return query;
          },
        ),
      };
      return query;
    }),
  };

  return { ctx: { db }, db };
}

describe("Agency zero-credit Stitch reservation lifecycle contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertOwnerCanGenerate.mockResolvedValue({
      currentPeriodEnd: "2026-08-01T00:00:00.000Z",
      currentPeriodStart: "2026-07-01T00:00:00.000Z",
      planKey: "agency",
      state: "active",
      stripeSubscriptionId: "subscription_1",
    });
    mocks.acquireGenerationSlot.mockResolvedValue({ slotId: "slot_1" });
  });

  it("records zero-cost usage, skips credit reservation, and releases its slot", async () => {
    const { ctx, db } = createContext();

    const reservation = await reserveCreationCreditsForOwner(
      ctx as never,
      "owner_123",
      {
        domainId: "stitch_1",
        domainKind: "stitch",
        idempotencyKey: "stitch:stitch_1",
        now: "2026-07-16T12:00:00.000Z",
        operation: "stitch",
        reservationKind: "browser",
        source: "user_action",
      },
    );

    expect(reservation).toMatchObject({
      amount: 0,
      generationSlotId: "slot_1",
      planKey: "agency",
      reservationId: null,
      state: "committed",
    });
    expect(db.insert).toHaveBeenCalledTimes(1);
    expect(db.insert).toHaveBeenCalledWith(
      "zeroCostUsageEvents",
      expect.objectContaining({
        generationSlotId: "slot_1",
        operation: "stitch",
        planKeySnapshot: "agency",
      }),
    );
    expect(mocks.getCurrentUsagePeriod).not.toHaveBeenCalled();
    expect(mocks.getEligibleCreditGrants).not.toHaveBeenCalled();
    expect(mocks.appendUsageLedgerEntry).not.toHaveBeenCalled();

    await commitUserStitchUsage(ctx as never, {
      now: "2026-07-16T12:05:00.000Z",
      ownerId: "owner_123",
      stitchId: "stitch_1",
      usageIdempotencyKey: "stitch:stitch_1",
    });

    expect(mocks.releaseGenerationSlot).toHaveBeenCalledWith(
      ctx,
      "slot_1",
      "2026-07-16T12:05:00.000Z",
      "Browser Stitch completed",
    );
  });
});
