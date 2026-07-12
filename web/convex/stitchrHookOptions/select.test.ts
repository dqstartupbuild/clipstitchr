import { beforeEach, describe, expect, it, vi } from "vitest";
import { select } from "./select";

type ConvexFunction = {
  handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  rateLimiter: { limit: vi.fn() },
  upsertStitchCard: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: mocks.rateLimiter }));
vi.mock("../upsertStitchCard", () => ({
  upsertStitchCard: mocks.upsertStitchCard,
}));

function getHandler() {
  return (select as unknown as ConvexFunction).handler;
}

describe("stitchrHookOptions.select", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("changes sibling selection without changing independent sibling feedback", async () => {
    const option = {
      _id: "option_doc_1",
      angle: "Curiosity",
      hook: "The one detail I missed",
      id: "option_1",
      isSelected: false,
      planId: "plan_1",
      reviewState: "needs_review",
    };
    const sibling = {
      _id: "option_doc_2",
      id: "option_2",
      isSelected: true,
      planId: "plan_1",
      reviewState: "not_for_me",
      reviewedAt: "2026-07-11T12:00:00.000Z",
    };
    const plan = { _id: "plan_doc", id: "plan_1" };
    const uniqueValues: Record<string, unknown[]> = {
      stitchrHookOptions: [option],
      stitchrHookPlans: [plan],
    };
    const ctx = {
      db: {
        get: vi.fn(),
        patch: vi.fn(),
        query: vi.fn((table: string) => {
          const indexQuery = { eq: vi.fn(() => indexQuery) };
          const chain = {
            take: vi.fn(async () => [option, sibling]),
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
        id: option.id,
        updatedAt: "2026-07-12T12:00:00.000Z",
      }),
    ).resolves.toBe(option.id);

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "option_doc_2",
      expect.objectContaining({ isSelected: false }),
    );
    const siblingPatch = ctx.db.patch.mock.calls.find(
      ([documentId]) => documentId === "option_doc_2",
    )?.[1];
    expect(siblingPatch).not.toHaveProperty("reviewState");
    expect(siblingPatch).not.toHaveProperty("reviewedAt");
  });
});
