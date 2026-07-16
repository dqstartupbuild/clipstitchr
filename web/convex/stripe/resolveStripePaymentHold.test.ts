import { describe, expect, it, vi } from "vitest";
import { resolveStripePaymentHold } from "./resolveStripePaymentHold";
import { upsertStripePaymentHold } from "./upsertStripePaymentHold";

function createContext(existing: Record<string, unknown> | null) {
  const query = {
    unique: vi.fn(async () => existing),
    withIndex: vi.fn(() => query),
  };

  return {
    db: {
      insert: vi.fn(async () => "hold_doc"),
      patch: vi.fn(),
      query: vi.fn(() => query),
    },
  };
}

const resolutionArgs = {
  chargeId: "ch_1",
  eventCreatedAt: 300,
  eventId: "evt_won",
  kind: "dispute" as const,
  now: "2026-07-16T00:00:00.000Z",
  ownerId: "owner_1",
  stripeCustomerId: "cus_1",
  stripePaymentIntentId: "pi_1",
};

describe("resolveStripePaymentHold", () => {
  it("persists a resolved tombstone when closure arrives before opening", async () => {
    const ctx = createContext(null);

    await expect(
      resolveStripePaymentHold(ctx as never, resolutionArgs),
    ).resolves.toEqual(
      expect.objectContaining({
        holdId: "dispute:ch_1",
        resolvedFromOpenHold: false,
        status: "resolved",
      }),
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "stripePaymentHolds",
      expect.objectContaining({
        sourceEventCreatedAt: 300,
        status: "resolved",
      }),
    );
  });

  it("prevents the older opening event from reopening that tombstone", async () => {
    const tombstone = {
      _id: "hold_doc",
      sourceEventCreatedAt: 300,
      status: "resolved",
    };
    const ctx = createContext(tombstone);

    await upsertStripePaymentHold(ctx as never, {
      eventCreatedAt: 200,
      eventId: "evt_open",
      kind: "dispute",
      now: "2026-07-15T00:00:00.000Z",
      ownerId: "owner_1",
      reason: "Stripe payment dispute opened",
      stripeChargeId: "ch_1",
      stripeCustomerId: "cus_1",
      stripePaymentIntentId: "pi_1",
    });

    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
