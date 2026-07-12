import { beforeEach, describe, expect, it, vi } from "vitest";
import { migrateWinningHooksToHookLabIdeas } from "./migrateWinningHooksToHookLabIdeas";

type ConvexFunction = {
  handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));

function getHandler() {
  return (migrateWinningHooksToHookLabIdeas as unknown as ConvexFunction)
    .handler;
}

describe("migrateWinningHooksToHookLabIdeas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes winners and skips hooks with an existing migration key", async () => {
    const page = {
      continueCursor: "cursor_2",
      isDone: true,
      page: [
        {
          id: "product_1",
          name: "Daily Brew",
          ownerId: "owner_1",
          updatedAt: "2026-07-01T00:00:00.000Z",
          winningHookExamples: [
            "  The morning   change I actually kept  ",
            "Already migrated",
            "   ",
          ],
        },
      ],
    };
    const existingIdeas = [null, { id: "idea_existing" }];
    const ctx = {
      db: {
        insert: vi.fn(),
        query: vi.fn((table: string) => {
          const indexQuery = { eq: vi.fn(() => indexQuery) };
          const chain = {
            paginate: vi.fn(async () => page),
            unique: vi.fn(async () =>
              table === "hookLabIdeas" ? existingIdeas.shift() ?? null : null,
            ),
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
        paginationOpts: { cursor: null, numItems: 100 },
        secret: "rate-secret",
      }),
    ).resolves.toEqual({
      continueCursor: "cursor_2",
      createdCount: 1,
      isDone: true,
      processedCount: 1,
    });
    expect(ctx.db.insert).toHaveBeenCalledTimes(1);
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "hookLabIdeas",
      expect.objectContaining({
        migrationKey: "winning-hook:product_1:0",
        originalText: "The morning change I actually kept",
        productId: "product_1",
        scope: "product",
        status: "ready",
        textBlueprint: expect.objectContaining({
          reusablePattern: "The morning change I actually kept",
          sourceText: "The morning change I actually kept",
        }),
      }),
    );
  });
});
