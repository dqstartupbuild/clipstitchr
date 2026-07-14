import { describe, expect, it, vi } from "vitest";
import { startEmailProviderAttempt } from "./startEmailProviderAttempt";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("email provider attempt start", () => {
  it("counts one actual dispatch attempt at most once per lease", async () => {
    const operation = {
      attemptCount: 2,
      idempotencyExpiresAt: 10_000,
      leaseExpiresAt: 200,
      leaseOwner: "worker_1",
      status: "claimed",
    };
    const ctx = {
      db: {
        get: vi.fn(async () => operation),
        patch: vi.fn(
          async (_id: string, fields: Record<string, unknown>) =>
            Object.assign(operation, fields),
        ),
      },
    };
    const args = {
      operationId: "operation_1",
      startedAt: 100,
      workerId: "worker_1",
    };

    await expect(getHandler(startEmailProviderAttempt)(ctx, args)).resolves.toEqual({
      attemptCount: 3,
      idempotencyExpiresAt: 10_000,
      started: true,
    });
    await expect(getHandler(startEmailProviderAttempt)(ctx, args)).resolves.toEqual({
      attemptCount: 3,
      idempotencyExpiresAt: 10_000,
      started: false,
    });
    expect(ctx.db.patch).toHaveBeenCalledTimes(1);
  });

  it("starts the idempotency window at a delayed first provider attempt", async () => {
    const day = 24 * 60 * 60 * 1_000;
    const operation = {
      attemptCount: 0,
      idempotencyExpiresAt: 1,
      leaseExpiresAt: 3 * day,
      leaseOwner: "worker_1",
      status: "claimed",
    };
    const ctx = {
      db: {
        get: vi.fn(async () => operation),
        patch: vi.fn(
          async (_id: string, fields: Record<string, unknown>) =>
            Object.assign(operation, fields),
        ),
      },
    };

    await expect(
      getHandler(startEmailProviderAttempt)(ctx, {
        operationId: "operation_1",
        startedAt: 2 * day,
        workerId: "worker_1",
      }),
    ).resolves.toEqual({
      attemptCount: 1,
      idempotencyExpiresAt: 3 * day,
      started: true,
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({ idempotencyExpiresAt: 3 * day }),
    );
  });
});
