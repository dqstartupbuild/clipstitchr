import { describe, expect, it, vi } from "vitest";
import { recordEmailProviderOperationFailure } from "./recordEmailProviderOperationFailure";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("email provider operation failure recording", () => {
  it("uses retry-limit rather than ambiguity for an explicit exhausted 429", async () => {
    const operation = {
      _id: "operation_1",
      attemptCount: 7,
      idempotencyExpiresAt: 100,
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
      getHandler(recordEmailProviderOperationFailure)(ctx, {
        acceptanceUnknown: false,
        failedAt: 200,
        failureCategory: "rateLimited",
        operationId: "operation_1",
        retryable: false,
        workerId: "worker_1",
      }),
    ).resolves.toEqual({ status: "deadLetter" });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({
        acceptanceStatus: "rejected",
        failureCategory: "retryLimit",
      }),
    );
  });
});
