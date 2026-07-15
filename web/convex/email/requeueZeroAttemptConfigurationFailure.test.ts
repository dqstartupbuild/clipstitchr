import { describe, expect, it, vi } from "vitest";
import { requeueZeroAttemptConfigurationFailure } from "./requeueZeroAttemptConfigurationFailure";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

vi.mock("../_generated/api", () => ({
  internal: {
    email: {
      processEmailProviderOperation: {
        processEmailProviderOperation: "process-email-operation",
      },
    },
  },
}));

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("zero-attempt provider configuration recovery", () => {
  it("requeues only an unattempted confirmation operation with a live token", async () => {
    const operation = {
      acceptanceStatus: "rejected",
      acceptedAt: undefined,
      attemptCount: 0,
      confirmationTokenId: "token_1",
      deliveredAt: undefined,
      failureCategory: "configuration",
      kind: "transactional",
      providerMessageId: undefined,
      status: "deadLetter",
      transactionalTemplateKey: "email-confirmation",
    };
    const ctx = {
      db: {
        get: vi
          .fn()
          .mockResolvedValueOnce(operation)
          .mockResolvedValueOnce({ expiresAt: 200 }),
        patch: vi.fn(),
      },
      scheduler: { runAfter: vi.fn() },
    };

    await expect(
      getHandler(requeueZeroAttemptConfigurationFailure)(ctx, {
        operationId: "operation_1",
        requeuedAt: 100,
      }),
    ).resolves.toEqual({ requeued: true });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({
        acceptanceStatus: "notAttempted",
        failureCategory: undefined,
        status: "pending",
        terminalAt: undefined,
      }),
    );
    expect(ctx.scheduler.runAfter).toHaveBeenCalledWith(
      0,
      "process-email-operation",
      { operationId: "operation_1" },
    );
  });

  it("refuses any operation that reached the provider", async () => {
    const ctx = {
      db: {
        get: vi.fn(async () => ({
          acceptanceStatus: "rejected",
          attemptCount: 1,
          confirmationTokenId: "token_1",
          failureCategory: "configuration",
          kind: "transactional",
          status: "deadLetter",
          transactionalTemplateKey: "email-confirmation",
        })),
        patch: vi.fn(),
      },
      scheduler: { runAfter: vi.fn() },
    };

    await expect(
      getHandler(requeueZeroAttemptConfigurationFailure)(ctx, {
        operationId: "operation_1",
        requeuedAt: 100,
      }),
    ).resolves.toEqual({ requeued: false });
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.scheduler.runAfter).not.toHaveBeenCalled();
  });
});
