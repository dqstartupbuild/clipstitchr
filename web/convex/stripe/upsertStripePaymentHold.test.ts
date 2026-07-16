import { describe, expect, it, vi } from "vitest";
import { upsertStripePaymentHold } from "./upsertStripePaymentHold";

function createContext(existing: Record<string, unknown> | null) {
  const query = {
    unique: vi.fn(async () => existing),
    withIndex: vi.fn(() => query),
  };

  return {
    db: {
      insert: vi.fn(),
      patch: vi.fn(),
      query: vi.fn(() => query),
    },
  };
}

describe("upsertStripePaymentHold", () => {
  it("does not reopen an equally timed hold after resolution", async () => {
    const ctx = createContext({
      _id: "hold_1",
      sourceEventCreatedAt: 200,
      status: "resolved",
    });

    await upsertStripePaymentHold(ctx as never, {
      eventCreatedAt: 200,
      eventId: "evt_open_late_delivery",
      kind: "dispute",
      now: "2026-07-16T00:00:00.000Z",
      ownerId: "owner_1",
      reason: "Stripe payment dispute opened",
      stripeChargeId: "ch_1",
      stripeCustomerId: "cus_1",
    });

    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
