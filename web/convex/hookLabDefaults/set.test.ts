import { beforeEach, describe, expect, it, vi } from "vitest";
import { set } from "./set";

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
  return (set as unknown as ConvexFunction).handler;
}

function createCtx(values: Record<string, unknown[]>) {
  const queues = Object.fromEntries(
    Object.entries(values).map(([table, entries]) => [table, [...entries]]),
  ) as Record<string, unknown[]>;

  return {
    db: {
      insert: vi.fn(),
      patch: vi.fn(),
      query: vi.fn((table: string) => {
        const indexQuery = { eq: vi.fn(() => indexQuery) };
        const chain = {
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

describe("hookLabDefaults.set", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("rejects an avatar that is not in the owner's product scope", async () => {
    const ctx = createCtx({
      avatars: [null],
      products: [{ _id: "product_doc", id: "product_1" }],
    });

    await expect(
      getHandler()(ctx, {
        defaultAvatarId: "avatar_other_owner",
        productId: "product_1",
        updatedAt: "2026-07-12T12:00:00.000Z",
      }),
    ).rejects.toThrow("Choose an avatar for this product.");
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("rejects a Demo tied to a different product", async () => {
    const ctx = createCtx({
      products: [{ _id: "product_doc", id: "product_1" }],
      videoClips: [
        { clipType: "demo", id: "demo_2", productId: "product_2" },
      ],
    });

    await expect(
      getHandler()(ctx, {
        defaultDemoClipId: "demo_2",
        productId: "product_1",
        updatedAt: "2026-07-12T12:00:00.000Z",
      }),
    ).rejects.toThrow("Choose a Demo clip for this product.");
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
