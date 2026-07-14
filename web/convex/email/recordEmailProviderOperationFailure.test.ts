import { describe, expect, it, vi } from "vitest";
import { recordEmailProviderOperationFailure } from "./recordEmailProviderOperationFailure";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  enqueueContactDeleteCompensation: vi.fn(),
}));

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));
vi.mock("./enqueueContactDeleteCompensation", () => ({
  enqueueContactDeleteCompensation:
    mocks.enqueueContactDeleteCompensation,
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

  it("retries ambiguous contact deletion after the email idempotency window", async () => {
    const operation = {
      _id: "operation_1",
      attemptCount: 1,
      idempotencyExpiresAt: 100,
      kind: "contactDelete",
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
        acceptanceUnknown: true,
        failedAt: 200,
        failureCategory: "network",
        operationId: "operation_1",
        retryable: true,
        workerId: "worker_1",
      }),
    ).resolves.toMatchObject({ status: "pending" });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({ status: "pending" }),
    );
  });

  it("queues deletion after an ambiguous provider call finishes late", async () => {
    mocks.enqueueContactDeleteCompensation.mockResolvedValueOnce(
      "delete_operation_1",
    );
    const operation = {
      _id: "operation_1",
      attemptCount: 1,
      contactId: "contact_1",
      kind: "contactSync",
      leaseOwner: undefined,
      status: "canceled",
    };
    const ctx = {
      db: { get: vi.fn(async () => operation) },
      scheduler: { runAt: vi.fn() },
    };

    await expect(
      getHandler(recordEmailProviderOperationFailure)(ctx, {
        acceptanceUnknown: true,
        failedAt: 200,
        failureCategory: "network",
        operationId: "operation_1",
        retryable: true,
        workerId: "worker_1",
      }),
    ).resolves.toEqual({
      compensationQueued: true,
      status: "ignored",
    });
    expect(mocks.enqueueContactDeleteCompensation).toHaveBeenCalledWith(ctx, {
      compensatesOperationId: "operation_1",
      contactId: "contact_1",
      now: 200,
    });
  });
});
