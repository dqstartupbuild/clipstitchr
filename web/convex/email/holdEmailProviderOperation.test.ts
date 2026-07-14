import { describe, expect, it, vi } from "vitest";
import { holdEmailProviderOperation } from "./holdEmailProviderOperation";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("provider-disabled email hold", () => {
  it("fails closed without creating a recurring disabled-mode schedule", async () => {
    const ctx = {
      db: {
        get: vi.fn(async () => ({ status: "pending" })),
        patch: vi.fn(),
      },
    };

    await expect(
      getHandler(holdEmailProviderOperation)(ctx, {
        heldAt: 100,
        operationId: "operation_1",
      }),
    ).resolves.toEqual({ held: true });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({
        failureCategory: "configuration",
        status: "held",
      }),
    );
  });

  it("holds an expired crashed claim and records an unknown started attempt", async () => {
    const ctx = {
      db: {
        get: vi.fn(async () => ({
          acceptanceStatus: "notAttempted",
          attemptLeaseOwner: "old_worker",
          leaseExpiresAt: 99,
          leaseOwner: "old_worker",
          status: "claimed",
        })),
        patch: vi.fn(),
      },
    };

    await expect(
      getHandler(holdEmailProviderOperation)(ctx, {
        heldAt: 100,
        operationId: "operation_1",
      }),
    ).resolves.toEqual({ held: true });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({
        acceptanceStatus: "unknown",
        attemptLeaseOwner: undefined,
        leaseExpiresAt: undefined,
        leaseOwner: undefined,
        status: "held",
      }),
    );
  });

  it("never steals a live claim", async () => {
    const ctx = {
      db: {
        get: vi.fn(async () => ({
          leaseExpiresAt: 101,
          leaseOwner: "live_worker",
          status: "claimed",
        })),
        patch: vi.fn(),
      },
    };

    await expect(
      getHandler(holdEmailProviderOperation)(ctx, {
        heldAt: 100,
        operationId: "operation_1",
      }),
    ).resolves.toEqual({ held: false });
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
