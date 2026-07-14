import { describe, expect, it, vi } from "vitest";
import { resumeHeldEmailProviderOperations } from "./resumeHeldEmailProviderOperations";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

vi.mock("../_generated/server", () => ({ mutation: vi.fn((value) => value) }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: vi.fn(),
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("held email operation resume", () => {
  it("provides a bounded operator sweep after provider readiness", async () => {
    const indexQuery = { eq: vi.fn(() => indexQuery) };
    const chain = {
      take: vi.fn(async () => [{ _id: "operation_1" }]),
      withIndex: vi.fn((
        _name: string,
        callback: (query: typeof indexQuery) => unknown,
      ) => {
        callback(indexQuery);
        return chain;
      }),
    };
    const ctx = {
      db: {
        patch: vi.fn(),
        query: vi.fn(() => chain),
      },
      scheduler: { runAfter: vi.fn() },
    };

    await expect(
      getHandler(resumeHeldEmailProviderOperations)(ctx, {
        resumedAt: 100,
        secret: "rate-limit-secret",
      }),
    ).resolves.toEqual({ hasMore: false, resumedCount: 1 });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({ status: "pending" }),
    );
    expect(ctx.scheduler.runAfter).toHaveBeenCalledOnce();
  });
});
