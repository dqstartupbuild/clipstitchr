import { describe, expect, it, vi } from "vitest";
import { recalculateHookLabIdeaUse } from "./recalculateHookLabIdeaUse";

function createCtx({
  idea,
  use,
  variants,
}: {
  idea?: unknown;
  use: unknown;
  variants: unknown[];
}) {
  const uniqueValues: Record<string, unknown[]> = {
    hookLabIdeas: [idea ?? null],
    hookLabIdeaUses: [use],
  };

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn((table: string) => {
        const indexQuery = { eq: vi.fn(() => indexQuery) };
        const chain = {
          take: vi.fn(async () => variants),
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

describe("recalculateHookLabIdeaUse", () => {
  it("finishes a mixed batch as partial and counts the idea exactly once", async () => {
    const use = {
      _id: "use_doc",
      ideaId: "idea_1",
      id: "use_1",
      status: "generating",
      variationCount: 3,
    };
    const idea = { _id: "idea_doc", id: "idea_1", useCount: 4 };
    const ctx = createCtx({
      idea,
      use,
      variants: [
        { status: "completed" },
        { status: "completed" },
        { status: "failed" },
      ],
    });
    const updatedAt = "2026-07-12T12:00:00.000Z";

    await recalculateHookLabIdeaUse({
      ctx: ctx as never,
      ownerId: "owner_1",
      updatedAt,
      useId: use.id,
    });

    expect(ctx.db.patch).toHaveBeenCalledWith("use_doc", {
      completedAt: updatedAt,
      completedVariantCount: 2,
      countedAt: updatedAt,
      failedVariantCount: 1,
      progress: 1,
      status: "partial",
      updatedAt,
    });
    expect(ctx.db.patch).toHaveBeenCalledWith("idea_doc", {
      lastUsedAt: updatedAt,
      updatedAt,
      useCount: 5,
    });
  });

  it("does not count a previously counted partial use again", async () => {
    const use = {
      _id: "use_doc",
      countedAt: "2026-07-11T12:00:00.000Z",
      ideaId: "idea_1",
      id: "use_1",
      status: "partial",
      variationCount: 3,
    };
    const ctx = createCtx({
      use,
      variants: [
        { status: "completed" },
        { status: "failed" },
        { status: "failed" },
      ],
    });

    await recalculateHookLabIdeaUse({
      ctx: ctx as never,
      ownerId: "owner_1",
      updatedAt: "2026-07-12T12:00:00.000Z",
      useId: use.id,
    });

    expect(ctx.db.query).toHaveBeenCalledTimes(2);
    expect(ctx.db.patch).toHaveBeenCalledTimes(1);
  });
});
