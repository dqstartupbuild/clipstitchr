import { beforeEach, describe, expect, it, vi } from "vitest";
import { markNotForMe } from "./markNotForMe";

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
  return (markNotForMe as unknown as ConvexFunction).handler;
}

describe("stitchrHookOptions.markNotForMe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("rejects only the chosen option and adds one product memory entry", async () => {
    const option = {
      _id: "option_doc_1",
      hook: "Stop wasting your mornings",
      id: "option_1",
      normalizedHook: "stop wasting your mornings",
      productId: "product_1",
    };
    const product = {
      _id: "product_doc",
      id: "product_1",
      rejectedHookExamples: ["Already rejected"],
    };
    const queues: Record<string, unknown[]> = {
      products: [product],
      stitchrHookOptions: [option],
    };
    const ctx = {
      db: {
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

    await getHandler()(ctx, {
      id: option.id,
      updatedAt: "2026-07-12T12:00:00.000Z",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "option_doc_1",
      expect.objectContaining({ reviewState: "not_for_me" }),
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "product_doc",
      expect.objectContaining({
        rejectedHookExamples: [option.hook, "Already rejected"],
      }),
    );
    expect(ctx.db.query).toHaveBeenCalledTimes(2);
  });
});
