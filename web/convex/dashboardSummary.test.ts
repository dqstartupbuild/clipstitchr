import { beforeEach, describe, expect, it, vi } from "vitest";
import * as dashboardSummary from "./dashboardSummary";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

type QueryResult = {
  take?: unknown[];
  unique?: unknown;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  query: vi.fn((definition) => definition),
}));

vi.mock("./_generated/server", () => ({
  query: mocks.query,
}));

vi.mock("./auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createQueryChain(result: QueryResult = {}) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    order: vi.fn(() => chain),
    take: vi.fn(async () => result.take ?? []),
    unique: vi.fn(async () => result.unique ?? null),
    withIndex: vi.fn(
      (_index: string, callback: (q: typeof indexQuery) => void) => {
        callback(indexQuery);

        return chain;
      },
    ),
  };

  return chain;
}

function createCtx(resultsByTable: Record<string, QueryResult[]> = {}) {
  const queues = new Map(
    Object.entries(resultsByTable).map(([table, results]) => [
      table,
      [...results],
    ]),
  );
  const ctx = {
    db: {
      query: vi.fn((table: string) => {
        const queue = queues.get(table);
        const result = queue?.shift() ?? {};

        return createQueryChain(result);
      }),
    },
  };

  return ctx;
}

describe("dashboardSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
  });

  it("returns every slide-level background needed by recent Swipe cards", async () => {
    const recentSwipe = {
      backgroundId: "background_base",
      id: "swipe_1",
      slides: [
        { backgroundId: "background_slide", id: "slide_1" },
        { id: "slide_2" },
      ],
    };
    const ctx = createCtx({
      stitches: [{ take: [] }],
      swipes: [{ take: [recentSwipe] }],
      swiprBackgrounds: [
        { unique: { id: "background_base" } },
        { unique: { id: "background_slide" } },
      ],
      videoClips: [
        { take: [] },
        { take: [] },
        { take: [] },
        { take: [] },
        { take: [] },
      ],
    });

    const result = await getHandler<
      { productId?: string },
      { swipeBackgrounds: { id: string }[] }
    >(dashboardSummary.get)(ctx, {});

    expect(result.swipeBackgrounds.map((background) => background.id)).toEqual([
      "background_base",
      "background_slide",
    ]);
    expect(ctx.db.query).toHaveBeenCalledWith("swiprBackgrounds");
    expect(
      vi
        .mocked(ctx.db.query)
        .mock.calls.filter(([table]) => table === "swiprBackgrounds"),
    ).toHaveLength(2);
  });
});
