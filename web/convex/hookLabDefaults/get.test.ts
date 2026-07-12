import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "./get";

type ConvexFunction = {
  handler: (ctx: unknown, args: { productId: string }) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  query: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ query: mocks.query }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));

function getHandler() {
  return (get as unknown as ConvexFunction).handler;
}

function createCtx() {
  const uniqueValues: Record<string, unknown[]> = {
    avatarPreferences: [
      { defaultAvatarId: "avatar_product_stale" },
      { defaultAvatarId: "avatar_global" },
    ],
    products: [
      {
        defaultAvatarId: "avatar_deleted",
        defaultDemoClipId: "demo_other_product",
        id: "product_1",
      },
    ],
  };
  const takeValues: Record<string, unknown[]> = {
    avatars: [
      { id: "avatar_global", name: "Global avatar" },
      { id: "avatar_product", name: "Product avatar", productId: "product_1" },
      { id: "avatar_other", name: "Other avatar", productId: "product_2" },
    ],
    videoClipCards: [
      { clipType: "demo", id: "demo_product", name: "Product Demo", productId: "product_1" },
      { clipType: "demo", id: "demo_other_product", name: "Other Demo", productId: "product_2" },
      { clipType: "ugc", id: "ugc_1", name: "UGC" },
    ],
  };

  return {
    db: {
      query: vi.fn((table: string) => {
        const indexQuery = { eq: vi.fn(() => indexQuery) };
        const chain = {
          order: vi.fn(() => chain),
          take: vi.fn(async () => takeValues[table] ?? []),
          unique: vi.fn(async () => uniqueValues[table]?.shift() ?? null),
          withIndex: vi.fn(
            (_index: string, callback: (query: typeof indexQuery) => unknown) => {
              callback(indexQuery);
              return chain;
            },
          ),
        };

        return chain;
      }),
    },
  };
}

describe("hookLabDefaults.get", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
  });

  it("drops stale and cross-product defaults from the returned choices", async () => {
    const result = await getHandler()(createCtx(), { productId: " product_1 " });

    expect(result).toEqual({
      avatars: [
        { id: "avatar_global", name: "Global avatar" },
        { id: "avatar_product", name: "Product avatar" },
      ],
      defaultAvatarId: undefined,
      defaultDemoClipId: undefined,
      demoClips: [{ id: "demo_product", name: "Product Demo" }],
    });
  });
});
