import { describe, expect, it, vi } from "vitest";
import { deferEmailProviderOperation } from "./deferEmailProviderOperation";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("email provider pacing deferral", () => {
  it("releases and reschedules a lease without consuming an attempt", async () => {
    const operation = {
      _id: "operation_1",
      attemptCount: 3,
      leaseOwner: "worker_1",
      status: "claimed",
    };
    const ctx = {
      db: {
        get: vi.fn(async () => operation),
        patch: vi.fn(),
      },
      scheduler: { runAt: vi.fn() },
    };

    await expect(
      getHandler(deferEmailProviderOperation)(ctx, {
        deferredAt: 100,
        delayMs: 10_000,
        operationId: "operation_1",
        workerId: "worker_1",
      }),
    ).resolves.toEqual({ deferred: true, retryAt: 10_100 });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({ nextAttemptAt: 10_100, status: "pending" }),
    );
    expect(ctx.db.patch.mock.calls[0]?.[1]).not.toHaveProperty("attemptCount");
    expect(operation.attemptCount).toBe(3);
  });
});
