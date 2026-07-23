import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLatestForSourcePost } from "./getLatestForSourcePost";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  getProductForOwner: vi.fn(),
  query: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ query: mocks.query }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../getProductForOwner", () => ({
  getProductForOwner: mocks.getProductForOwner,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(brief: unknown) {
  const indexQuery = { eq: vi.fn(() => indexQuery) };
  const filterQuery = {
    eq: vi.fn(() => true),
    field: vi.fn((fieldName: string) => fieldName),
  };
  const queryChain = {
    filter: vi.fn((applyFilter: (query: typeof filterQuery) => unknown) => {
      applyFilter(filterQuery);
      return queryChain;
    }),
    first: vi.fn(async () => brief),
    order: vi.fn(() => queryChain),
    withIndex: vi.fn(
      (_indexName: string, applyIndex: (query: typeof indexQuery) => unknown) => {
        applyIndex(indexQuery);
        return queryChain;
      },
    ),
  };

  return {
    ctx: { db: { query: vi.fn(() => queryChain) } },
    filterQuery,
    indexQuery,
    queryChain,
  };
}

describe("getLatestForSourcePost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.getProductForOwner.mockResolvedValue({
      id: "product_1",
      name: "Guppy Calisthenics",
    });
  });

  it("returns the newest owner-scoped script and its product name", async () => {
    const brief = {
      id: "brief_1",
      ownerId: "owner_123",
      productId: "product_1",
      sourcePostIds: ["post_1"],
    };
    const { ctx, filterQuery, indexQuery, queryChain } = createContext(brief);

    const result = await getHandler<
      { sourcePostId: string },
      { brief: typeof brief; productName: string | null } | null
    >(getLatestForSourcePost)(ctx, { sourcePostId: " post_1 " });

    expect(indexQuery.eq).toHaveBeenCalledWith("ownerId", "owner_123");
    expect(filterQuery.field).toHaveBeenCalledWith("sourcePostIds");
    expect(filterQuery.eq).toHaveBeenCalledWith("sourcePostIds", ["post_1"]);
    expect(queryChain.order).toHaveBeenCalledWith("desc");
    expect(mocks.getProductForOwner).toHaveBeenCalledWith(
      ctx,
      "owner_123",
      "product_1",
    );
    expect(result).toEqual({
      brief,
      productName: "Guppy Calisthenics",
    });
  });

  it("returns null when this source post has no saved script", async () => {
    const { ctx } = createContext(null);

    await expect(
      getHandler<{ sourcePostId: string }, unknown>(getLatestForSourcePost)(
        ctx,
        { sourcePostId: "post_1" },
      ),
    ).resolves.toBeNull();
    expect(mocks.getProductForOwner).not.toHaveBeenCalled();
  });
});
