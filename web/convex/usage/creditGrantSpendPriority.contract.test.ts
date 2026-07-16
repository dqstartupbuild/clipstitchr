import { beforeEach, describe, expect, it, vi } from "vitest";
import { grantCreditRefill } from "./grantCreditRefill";
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
      query: vi.fn(() => query),
    },
  };
}

describe("credit grant spend-priority contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUsagePeriod.mockResolvedValue(null);
  });

  it("creates monthly grants ahead of refill grants in spend order", async () => {
    const ctx = createContext();

    await grantMonthlyAllowance(ctx as never, {
      eventId: "event_monthly",
      invoiceId: "invoice_1",
      now: "2026-07-16T12:00:00.000Z",
      ownerId: "owner_123",
      periodEnd: "2026-08-16T12:00:00.000Z",
      periodStart: "2026-07-16T12:00:00.000Z",
      planKey: "pro",
      stripeSubscriptionId: "subscription_1",
    });
    await grantCreditRefill(ctx as never, {
      eventId: "event_refill",
      now: "2026-07-16T12:01:00.000Z",
      ownerId: "owner_123",
      periodKey: "subscription_1:2026-07-16T12:00:00.000Z",
      planKey: "pro",
      stripePaymentIntentId: "payment_intent_1",
      stripeSubscriptionId: "subscription_1",
    });

    const grants = ctx.db.insert.mock.calls
      .filter(([table]) => table === "creditGrants")
      .map(([, grant]) => grant);
    expect(grants).toEqual([
      expect.objectContaining({ grantType: "monthly", spendPriority: 0 }),
      expect.objectContaining({ grantType: "refill", spendPriority: 10 }),
    ]);
  });
});
