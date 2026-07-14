import { afterEach, describe, expect, it, vi } from "vitest";
import { recoverEmailProviderOperations } from "./recoverEmailProviderOperations";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext() {
  const pendingOperations = [{ _id: "pending_1" }];
  const expiredClaims = [{ _id: "claimed_1" }];
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
    lte: vi.fn(() => indexQuery),
  };
  const db = {
    query: vi.fn(() => ({
      withIndex: vi.fn((indexName, callback) => {
        callback(indexQuery);

        return {
          take: vi.fn(async () =>
            indexName === "by_status_next_attempt"
              ? pendingOperations
              : expiredClaims,
          ),
        };
      }),
    })),
  };

  return { db, scheduler: { runAfter: vi.fn() } };
}

describe("email provider operation recovery", () => {
  afterEach(() => vi.useRealTimers());

  it("reschedules due pending work and expired claims in bounded batches", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);
    const ctx = createContext();

    await expect(
      getHandler(recoverEmailProviderOperations)(ctx, {}),
    ).resolves.toEqual({ hasMore: false, recoveredCount: 2 });
    expect(ctx.scheduler.runAfter).toHaveBeenCalledTimes(2);
    expect(ctx.scheduler.runAfter).toHaveBeenCalledWith(
      0,
      expect.anything(),
      { operationId: "pending_1" },
    );
    expect(ctx.scheduler.runAfter).toHaveBeenCalledWith(
      0,
      expect.anything(),
      { operationId: "claimed_1" },
    );
  });
});
