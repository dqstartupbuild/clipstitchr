import { describe, expect, it, vi } from "vitest";
import { retireCompletedSubscriptionCheckoutSessions } from "./retireCompletedSubscriptionCheckoutSessions";

type RetireHandler = {
  handler: (
    ctx: unknown,
    args: { now: string; ownerId: string },
  ) => Promise<number>;
};

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));

describe("retireCompletedSubscriptionCheckoutSessions", () => {
  it("retires completed barriers only after the caller rechecks Stripe", async () => {
    const patch = vi.fn();
    const ctx = {
      db: {
        patch,
        query: vi.fn(() => ({
          withIndex: vi.fn(() => ({
            collect: vi.fn(async () => [
              { _id: "checkout_1" },
              { _id: "checkout_2" },
            ]),
          })),
        })),
      },
    };

    await expect(
      (
        retireCompletedSubscriptionCheckoutSessions as unknown as RetireHandler
      ).handler(ctx, {
        now: "2026-07-16T12:00:00.000Z",
        ownerId: "owner_1",
      }),
    ).resolves.toBe(2);
    expect(patch).toHaveBeenCalledTimes(2);
    expect(patch).toHaveBeenCalledWith(
      "checkout_1",
      expect.objectContaining({ status: "retired" }),
    );
  });
});
