import { beforeEach, describe, expect, it, vi } from "vitest";
import { getInputForProvider } from "./getInputForProvider";

type ConvexFunction = {
  handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertProviderWorkerSecret: vi.fn(),
  query: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ query: mocks.query }));
vi.mock("../auth/assertProviderWorkerSecret", () => ({
  assertProviderWorkerSecret: mocks.assertProviderWorkerSecret,
}));

function getHandler() {
  return (getInputForProvider as unknown as ConvexFunction).handler;
}

describe("hookLabIdeaVariants.getInputForProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes generated sibling hooks into the next sequential version", async () => {
    const variant = {
      id: "variant_2",
      ideaId: "idea_1",
      productId: "product_1",
      useId: "use_1",
      variantIndex: 2,
    };
    const uniqueValues: Record<string, unknown[]> = {
      avatars: [{ id: "avatar_1" }],
      hookLabIdeas: [{ id: "idea_1" }],
      hookLabIdeaUses: [
        {
          defaultAvatarId: "avatar_1",
          defaultDemoClipId: "demo_1",
          id: "use_1",
        },
      ],
      hookLabIdeaVariants: [variant],
      products: [{ id: "product_1" }],
      videoClips: [{ id: "demo_1" }],
    };
    const ctx = {
      db: {
        query: vi.fn((table: string) => {
          const indexQuery = { eq: vi.fn(() => indexQuery) };
          const chain = {
            order: vi.fn(() => chain),
            take: vi.fn(async () =>
              table === "photoAssets"
                ? [{ id: "photo_1" }]
                : table === "hookLabIdeaVariants"
                  ? [
                      {
                        generatedHook: "The first distinct opening",
                        id: "variant_0",
                      },
                      { id: "variant_1" },
                      variant,
                    ]
                  : [],
            ),
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

    await expect(
      getHandler()(ctx, {
        id: variant.id,
        ownerId: "owner_1",
        secret: "provider-secret",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        siblingHooks: ["The first distinct opening"],
        variant,
      }),
    );
  });
});
