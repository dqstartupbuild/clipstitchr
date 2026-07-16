import { beforeEach, describe, expect, it, vi } from "vitest";
import { grantMonthlyAllowance } from "./grantMonthlyAllowance";

const mocks = vi.hoisted(() => ({
  appendUsageLedgerEntry: vi.fn(),
  getCurrentUsagePeriod: vi.fn(),
}));

vi.mock("./appendUsageLedgerEntry", () => ({
  appendUsageLedgerEntry: mocks.appendUsageLedgerEntry,
}));
vi.mock("./getCurrentUsagePeriod", () => ({
  getCurrentUsagePeriod: mocks.getCurrentUsagePeriod,
}));

function createContext() {
  return {
    db: {
      insert: vi.fn(async (...args: [string, Record<string, unknown>]) => {
        void args;
        return "inserted_doc";
      }),
    },
  };
}

describe("monthly AI-video allowance reset contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUsagePeriod.mockResolvedValue(null);
  });

  it("starts each new Starter period with a fresh shared allowance", async () => {
    const ctx = createContext();

    await grantMonthlyAllowance(ctx as never, {
      eventId: "event_july",
      invoiceId: "invoice_july",
      now: "2026-07-01T00:00:00.000Z",
      ownerId: "owner_123",
      periodEnd: "2026-08-01T00:00:00.000Z",
      periodStart: "2026-07-01T00:00:00.000Z",
      planKey: "starter",
      stripeSubscriptionId: "subscription_1",
    });
    await grantMonthlyAllowance(ctx as never, {
      eventId: "event_august",
      invoiceId: "invoice_august",
      now: "2026-08-01T00:00:00.000Z",
      ownerId: "owner_123",
      periodEnd: "2026-09-01T00:00:00.000Z",
      periodStart: "2026-08-01T00:00:00.000Z",
      planKey: "starter",
      stripeSubscriptionId: "subscription_1",
    });

    const periods = ctx.db.insert.mock.calls
      .filter(([table]) => table === "usagePeriods")
      .map(([, period]) => period);
    expect(periods).toEqual([
      expect.objectContaining({
        aiVideosConsumed: 0,
        aiVideosGranted: 3,
        aiVideosReserved: 0,
        periodStart: "2026-07-01T00:00:00.000Z",
      }),
      expect.objectContaining({
        aiVideosConsumed: 0,
        aiVideosGranted: 3,
        aiVideosReserved: 0,
        periodStart: "2026-08-01T00:00:00.000Z",
      }),
    ]);
  });
});
