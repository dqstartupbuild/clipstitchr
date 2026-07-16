import { beforeEach, describe, expect, it, vi } from "vitest";
import { reserveAiVideoForOwner } from "./reserveAiVideo";

const mocks = vi.hoisted(() => ({
  appendUsageLedgerEntry: vi.fn(),
  assertOwnerCanGenerate: vi.fn(),
  getCurrentUsagePeriod: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../billing/assertOwnerCanGenerate", () => ({
  assertOwnerCanGenerate: mocks.assertOwnerCanGenerate,
}));
vi.mock("./appendUsageLedgerEntry", () => ({
  appendUsageLedgerEntry: mocks.appendUsageLedgerEntry,
}));
vi.mock("./getCurrentUsagePeriod", () => ({
  getCurrentUsagePeriod: mocks.getCurrentUsagePeriod,
}));

function createContext(getPeriod: () => Record<string, unknown>) {
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
      patch: vi.fn(async (id: string, fields: Record<string, unknown>) => {
        const period = getPeriod();
        if (id === period._id) {
          Object.assign(period, fields);
        }
      }),
      query: vi.fn(() => query),
    },
  };
}

function createPeriod(
  id: string,
  periodStart: string,
  periodEnd: string,
  consumed: number,
) {
  return {
    _id: id,
    aiVideosAdjusted: 0,
    aiVideosConsumed: consumed,
    aiVideosGranted: 3,
    aiVideosReserved: 0,
    periodEnd,
    periodStart,
  };
}

describe("Clipr and Swapr shared monthly video pool contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exhausts one combined pool and resets with the next monthly period", async () => {
    let period = createPeriod(
      "july_period",
      "2026-07-01T00:00:00.000Z",
      "2026-08-01T00:00:00.000Z",
      2,
    );
    let entitlement = {
      currentPeriodStart: "2026-07-01T00:00:00.000Z",
      planKey: "starter",
      stripeSubscriptionId: "subscription_1",
    };
    mocks.assertOwnerCanGenerate.mockImplementation(async () => entitlement);
    mocks.getCurrentUsagePeriod.mockImplementation(async () => period);
    const ctx = createContext(() => period);

    await expect(
      reserveAiVideoForOwner(ctx as never, "owner_123", {
        domainId: "clipr_1",
        domainKind: "clipr",
        idempotencyKey: "clipr:clipr_1",
        now: "2026-07-16T12:00:00.000Z",
        operation: "clipr_video",
        source: "user_action",
      }),
    ).resolves.toMatchObject({ amount: 1, state: "reserved" });

    await expect(
      reserveAiVideoForOwner(ctx as never, "owner_123", {
        domainId: "swapr_1",
        domainKind: "swapr",
        idempotencyKey: "swapr:swapr_1",
        now: "2026-07-16T12:01:00.000Z",
        operation: "swapr_video",
        source: "user_action",
      }),
    ).rejects.toMatchObject({
      data: { code: "AI_VIDEO_ALLOWANCE_REACHED", resetsAt: period.periodEnd },
    });

    period = createPeriod(
      "august_period",
      "2026-08-01T00:00:00.000Z",
      "2026-09-01T00:00:00.000Z",
      0,
    );
    entitlement = {
      ...entitlement,
      currentPeriodStart: "2026-08-01T00:00:00.000Z",
    };

    await expect(
      reserveAiVideoForOwner(ctx as never, "owner_123", {
        domainId: "swapr_2",
        domainKind: "swapr",
        idempotencyKey: "swapr:swapr_2",
        now: "2026-08-01T12:00:00.000Z",
        operation: "swapr_video",
        source: "user_action",
      }),
    ).resolves.toMatchObject({ amount: 1, state: "reserved" });

    const operations = ctx.db.insert.mock.calls
      .filter(([table]) => table === "usageReservations")
      .map(([, reservation]) => reservation.operation);
    expect(operations).toEqual(["clipr_video", "swapr_video"]);
  });
});
