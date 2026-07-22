import { beforeEach, describe, expect, it, vi } from "vitest";
import { retry } from "./retry";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  rateLimiter: { limit: vi.fn() },
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: mocks.rateLimiter }));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(post: Record<string, unknown>) {
  const indexQuery = { eq: vi.fn() };
  indexQuery.eq.mockReturnValue(indexQuery);
  const query = {
    unique: vi.fn(async () => post),
    withIndex: vi.fn(
      (_name: string, applyIndex: (value: typeof indexQuery) => unknown) => {
        applyIndex(indexQuery);
        return query;
      },
    ),
  };

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn(() => query),
    },
  };
}

describe("hookLabPosts.retry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("starts a completed post again without deleting its saved report", async () => {
    const analysis = { contentSummary: "Previous report" };
    const ctx = createContext({
      _id: "post_doc",
      analysis,
      analyzedAt: "2026-07-22T12:00:00.000Z",
      id: "post_1",
      ownerId: "owner_123",
      providerDatasetId: "dataset_1",
      providerRunId: "run_1",
      status: "ready",
    });

    await expect(
      getHandler(retry)(ctx, {
        id: "post_1",
        updatedAt: "2026-07-22T13:00:00.000Z",
      }),
    ).resolves.toBe("post_1");

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "post_doc",
      expect.objectContaining({
        analysis,
        analyzedAt: "2026-07-22T12:00:00.000Z",
        providerDatasetId: "dataset_1",
        providerRunId: "run_1",
        status: "analyzing",
      }),
    );
  });

  it("rejects another request while the post is already analyzing", async () => {
    const ctx = createContext({
      _id: "post_doc",
      id: "post_1",
      ownerId: "owner_123",
      status: "analyzing",
    });

    await expect(
      getHandler(retry)(ctx, {
        id: "post_1",
        updatedAt: "2026-07-22T13:00:00.000Z",
      }),
    ).rejects.toThrow("already being analyzed");
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
