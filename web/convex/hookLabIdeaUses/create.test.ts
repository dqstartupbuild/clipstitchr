import { beforeEach, describe, expect, it, vi } from "vitest";
import { create } from "./create";

type ConvexFunction = {
  handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown>;
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

function getHandler() {
  return (create as unknown as ConvexFunction).handler;
}

function createCtx({
  takes = {},
  uniques = {},
}: {
  takes?: Record<string, unknown[]>;
  uniques?: Record<string, unknown[]>;
}) {
  const queues = Object.fromEntries(
    Object.entries(uniques).map(([table, values]) => [table, [...values]]),
  ) as Record<string, unknown[]>;

  return {
    db: {
      insert: vi.fn(async () => "doc_id"),
      query: vi.fn((table: string) => {
        const indexQuery = { eq: vi.fn(() => indexQuery) };
        const chain = {
          order: vi.fn(() => chain),
          take: vi.fn(async () => takes[table] ?? []),
          unique: vi.fn(async () => queues[table]?.shift() ?? null),
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

const createdAt = "2026-07-12T12:00:00.000Z";

describe("hookLabIdeaUses.create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("returns an idempotent use and its existing versions without reserving again", async () => {
    const existing = { id: "use_existing" };
    const ctx = createCtx({
      takes: {
        hookLabIdeaVariants: [
          { id: "variant_0" },
          { id: "variant_1" },
          { id: "variant_2" },
        ],
      },
      uniques: { hookLabIdeaUses: [existing] },
    });

    await expect(
      getHandler()(ctx, {
        createdAt,
        id: "use_new",
        ideaId: "idea_1",
        idempotencyKey: "request_1",
        productId: "product_1",
        variationCount: 3,
      }),
    ).resolves.toEqual({
      existing: true,
      useId: "use_existing",
      variantIds: ["variant_0", "variant_1", "variant_2"],
    });
    expect(mocks.rateLimiter.limit).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("reserves every paid stage and creates independent requested versions", async () => {
    const ctx = createCtx({
      takes: {
        photoAssets: [
          { avatarId: "avatar_override", id: "photo_1", productId: "product_1" },
        ],
      },
      uniques: {
        avatarPreferences: [
          { defaultAvatarId: "avatar_preference" },
          { defaultAvatarId: "avatar_owner" },
        ],
        avatars: [{ id: "avatar_override", productId: "product_1" }],
        hookLabIdeas: [
          { id: "idea_1", productId: "product_1", scope: "product", status: "ready" },
        ],
        hookLabIdeaUses: [null],
        products: [
          {
            defaultAvatarId: "avatar_product",
            defaultDemoClipId: "demo_product",
            id: "product_1",
          },
        ],
        videoClips: [
          { clipType: "demo", id: "demo_override", productId: "product_1" },
        ],
      },
    });

    await expect(
      getHandler()(ctx, {
        createdAt,
        defaultAvatarId: " avatar_override ",
        defaultDemoClipId: " demo_override ",
        id: "use_1",
        ideaId: "idea_1",
        idempotencyKey: "request_2",
        productId: "product_1",
        variationCount: 3,
      }),
    ).resolves.toEqual({
      existing: false,
      useId: "use_1",
      variantIds: [
        "use_1:variant:0",
        "use_1:variant:1",
        "use_1:variant:2",
      ],
    });

    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "cliprVideoGenerate",
      { count: 24, key: "owner_1", throws: true },
    );
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "hookLabIdeaAssetSave",
      { count: 6, key: "owner_1", throws: true },
    );
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexRecordSave",
      { count: 4, key: "owner_1", throws: true },
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "hookLabIdeaUses",
      expect.objectContaining({
        defaultAvatarId: "avatar_override",
        defaultDemoClipId: "demo_override",
        variationCount: 3,
      }),
    );
    expect(ctx.db.insert).toHaveBeenCalledTimes(4);
  });
});
