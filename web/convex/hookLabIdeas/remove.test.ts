import { beforeEach, describe, expect, it, vi } from "vitest";
import { remove } from "./remove";

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
  return (remove as unknown as ConvexFunction).handler;
}

describe("hookLabIdeas.remove", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it.each(["analyzing", "generating"])(
    "keeps an idea while it is %s",
    async (status) => {
      const idea = {
        _id: "idea_doc",
        id: "idea_1",
        ownerId: "owner_1",
        status,
        useCount: 0,
      };
      const ctx = {
        db: {
          delete: vi.fn(),
          query: vi.fn(() => {
            const indexQuery = { eq: vi.fn(() => indexQuery) };
            const chain = {
              unique: vi.fn(async () => idea),
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

      await expect(getHandler()(ctx, { id: idea.id })).rejects.toThrow(
        "Let it finish before deleting it",
      );
      expect(ctx.db.delete).not.toHaveBeenCalled();
    },
  );
});
