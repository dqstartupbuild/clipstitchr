import { beforeEach, describe, expect, it, vi } from "vitest";
import { getForProvider } from "./getForProvider";

const mocks = vi.hoisted(() => ({
  assertProviderWorkerSecret: vi.fn(),
  query: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({
  query: mocks.query,
}));

vi.mock("../auth/assertProviderWorkerSecret", () => ({
  assertProviderWorkerSecret: mocks.assertProviderWorkerSecret,
}));

type GetForProviderHandler = {
  handler: (
    ctx: unknown,
    args: { id: string; ownerId: string; secret: string },
  ) => Promise<unknown>;
};

describe("cliprJobs.getForProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("authorizes the worker and scopes the checkpoint lookup to the owner", async () => {
    const job = { id: "job-456", ownerId: "owner-123" };
    const indexQuery = {
      eq: vi.fn(() => indexQuery),
    };
    const queryChain = {
      unique: vi.fn().mockResolvedValue(job),
      withIndex: vi.fn(
        (
          _indexName: string,
          callback: (query: typeof indexQuery) => unknown,
        ) => {
          callback(indexQuery);
          return queryChain;
        },
      ),
    };
    const ctx = {
      db: {
        query: vi.fn(() => queryChain),
      },
    };

    await expect(
      (getForProvider as unknown as GetForProviderHandler).handler(ctx, {
        id: "job-456",
        ownerId: "owner-123",
        secret: "provider-secret",
      }),
    ).resolves.toEqual(job);

    expect(mocks.assertProviderWorkerSecret).toHaveBeenCalledWith(
      "provider-secret",
    );
    expect(ctx.db.query).toHaveBeenCalledWith("cliprJobs");
    expect(queryChain.withIndex).toHaveBeenCalledWith(
      "by_owner_id",
      expect.any(Function),
    );
    expect(indexQuery.eq).toHaveBeenCalledWith("ownerId", "owner-123");
    expect(indexQuery.eq).toHaveBeenCalledWith("id", "job-456");
  });
});
