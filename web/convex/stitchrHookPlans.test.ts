import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  accept,
  attachStitch,
  reject,
  saveBatchPlannerResults,
  saveManualGeneration,
  selectOption,
} from "./stitchrHookPlans";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

type QueryResult = {
  collect?: unknown[];
  take?: unknown[];
  unique?: unknown;
};

const mocks = vi.hoisted(() => ({
  assertProviderWorkerSecret: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  query: vi.fn((definition) => definition),
  rateLimiter: {
    limit: vi.fn(),
  },
}));

vi.mock("./_generated/server", () => ({
  mutation: mocks.mutation,
  query: mocks.query,
}));

vi.mock("./auth/assertProviderWorkerSecret", () => ({
  assertProviderWorkerSecret: mocks.assertProviderWorkerSecret,
}));

vi.mock("./auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));

vi.mock("./rateLimiter", () => ({
  rateLimiter: mocks.rateLimiter,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createQueryChain(results: QueryResult[] = []) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    collect: vi.fn(async () => results.shift()?.collect ?? []),
    order: vi.fn(() => chain),
    take: vi.fn(async () => results.shift()?.take ?? []),
    unique: vi.fn(async () => results.shift()?.unique ?? null),
    withIndex: vi.fn(
      (_indexName: string, callback: (q: typeof indexQuery) => void) => {
        callback(indexQuery);

        return chain;
      },
    ),
  };

  return chain;
}

function createCtx(resultsByTable: Record<string, QueryResult[]> = {}) {
  const chains = new Map<string, ReturnType<typeof createQueryChain>>();
  const ctx = {
    db: {
      insert: vi.fn(async () => "doc_inserted"),
      patch: vi.fn(async () => undefined),
      query: vi.fn((table: string) => {
        const chain =
          chains.get(table) ??
          createQueryChain([...(resultsByTable[table] ?? [])]);

        chains.set(table, chain);
        return chain;
      }),
    },
  };

  return { chains, ctx };
}

function createPlan(overrides: Record<string, unknown> = {}) {
  return {
    _id: "doc_plan",
    createdAt: "2026-06-23T00:00:00.000Z",
    hashtags: [],
    hookOptions: [
      {
        angle: "Clear pain",
        reason: "It fits the UGC.",
        text: "Hook A",
      },
      {
        angle: "Fast payoff",
        reason: "It names the demo payoff.",
        text: "Hook B",
      },
    ],
    id: "hook_plan_1",
    ownerId: "owner_123",
    productId: "product_1",
    selectedHook: "Hook A",
    source: "manual",
    status: "planned",
    updatedAt: "2026-06-23T00:00:00.000Z",
    ...overrides,
  };
}

describe("convex stitchrHookPlans", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("saves manual hook generations with owned product and clip context", async () => {
    const { ctx } = createCtx({
      products: [
        {
          unique: {
            _id: "doc_product",
            id: "product_1",
            name: "Launch Kit",
          },
        },
      ],
      stitchrHookPlans: [{ unique: null }],
      videoClips: [
        { unique: { id: "ugc_1", name: "UGC one" } },
        { unique: { id: "demo_1", name: "Demo one" } },
      ],
    });

    await expect(
      getHandler(saveManualGeneration)(ctx, {
        plan: {
          demoClipId: "demo_1",
          demoClipName: "Demo fallback",
          hashtags: ["Launch", "#UGC", "bad tag!"],
          hookOptions: [
            {
              angle: " Clear pain ",
              reason: " Names the problem. ",
              text: " Hook A ",
            },
            {
              angle: "Fast payoff",
              reason: "Names the demo payoff.",
              text: "Hook B",
            },
          ],
          id: "hook_plan_1",
          productId: "product_1",
          productName: "Fallback product",
          selectedHook: " Hook A ",
          socialCaption: " Caption ",
          ugcClipId: "ugc_1",
          ugcClipName: "UGC fallback",
        },
        updatedAt: "2026-06-23T00:00:00.000Z",
      }),
    ).resolves.toBe("hook_plan_1");

    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexRecordSave",
      {
        key: "owner_123",
        throws: true,
      },
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "stitchrHookPlans",
      expect.objectContaining({
        demoClipId: "demo_1",
        demoClipName: "Demo one",
        hashtags: ["#launch", "#ugc", "#badtag"],
        id: "hook_plan_1",
        productId: "product_1",
        productName: "Launch Kit",
        selectedHook: "Hook A",
        source: "manual",
        ugcClipId: "ugc_1",
        ugcClipName: "UGC one",
      }),
    );
  });

  it("saves batch planner results with their final stitch id", async () => {
    const { ctx } = createCtx({
      automationTasks: [
        {
          unique: {
            id: "task_1",
            runId: "run_1",
          },
        },
      ],
      stitchrHookPlans: [{ unique: null }],
    });

    await expect(
      getHandler(saveBatchPlannerResults)(ctx, {
        plans: [
          {
            automationTaskId: "task_1",
            demoClipId: "demo_1",
            demoClipName: "Demo",
            hashtags: [],
            hookOptions: [
              {
                angle: "Clear pain",
                reason: "It fits the UGC.",
                text: "Hook A",
              },
            ],
            productId: "product_1",
            productName: "Launch Kit",
            selectedHook: "Hook A",
            ugcClipId: "ugc_1",
            ugcClipName: "UGC",
          },
        ],
        updatedAt: "2026-06-23T00:00:00.000Z",
      }),
    ).resolves.toEqual({ savedCount: 1 });

    expect(ctx.db.insert).toHaveBeenCalledWith(
      "stitchrHookPlans",
      expect.objectContaining({
        automationTaskId: "task_1",
        id: "stitchr-hook-plan:owner_123:task_1",
        source: "batch_planner",
        stitchId: "task_1:stitch",
      }),
    );
  });

  it("attaches a saved stitch to a hook plan", async () => {
    const { ctx } = createCtx({
      stitchrHookPlans: [{ unique: createPlan() }],
      stitches: [
        {
          unique: {
            _id: "doc_stitch",
            id: "stitch_1",
          },
        },
      ],
    });

    await expect(
      getHandler(attachStitch)(ctx, {
        id: "hook_plan_1",
        stitchId: "stitch_1",
        updatedAt: "2026-06-23T00:00:00.000Z",
      }),
    ).resolves.toBe("hook_plan_1");

    expect(ctx.db.patch).toHaveBeenCalledWith("doc_plan", {
      stitchId: "stitch_1",
      updatedAt: "2026-06-23T00:00:00.000Z",
    });
  });

  it("selects a generated hook option and mirrors its feedback", async () => {
    const { ctx } = createCtx({
      stitchrHookPlans: [
        {
          unique: createPlan({
            hookOptions: [
              {
                angle: "Clear pain",
                reason: "It fits the UGC.",
                text: "Hook A",
              },
              {
                acceptedAt: "2026-06-22T00:00:00.000Z",
                angle: "Fast payoff",
                feedbackStatus: "accepted",
                reason: "It names the demo payoff.",
                text: "Hook B",
              },
            ],
          }),
        },
      ],
    });

    await expect(
      getHandler(selectOption)(ctx, {
        hookText: "Hook B",
        id: "hook_plan_1",
        updatedAt: "2026-06-23T00:00:00.000Z",
      }),
    ).resolves.toBe("hook_plan_1");

    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexMetadataUpdate",
      {
        key: "owner_123",
        throws: true,
      },
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "doc_plan",
      expect.objectContaining({
        acceptedAt: "2026-06-22T00:00:00.000Z",
        feedbackStatus: "accepted",
        selectedHook: "Hook B",
      }),
    );
  });

  it("accepts and rejects individual hook options", async () => {
    const product = {
      _id: "doc_product",
      id: "product_1",
      rejectedHookExamples: ["Old miss"],
      winningHookExamples: ["Old win"],
    };
    const { ctx } = createCtx({
      products: [{ unique: product }, { unique: product }],
      stitchrHookPlans: [
        { unique: createPlan() },
        { unique: createPlan({ feedbackStatus: "accepted" }) },
      ],
    });

    await getHandler(accept)(ctx, {
      hookText: "Hook B",
      id: "hook_plan_1",
      updatedAt: "2026-06-23T00:00:00.000Z",
    });
    await getHandler(reject)(ctx, {
      hookText: "Hook A",
      id: "hook_plan_1",
      updatedAt: "2026-06-23T00:01:00.000Z",
    });

    expect(ctx.db.patch).toHaveBeenNthCalledWith(
      1,
      "doc_plan",
      expect.objectContaining({
        hookOptions: expect.arrayContaining([
          expect.objectContaining({
            feedbackStatus: "accepted",
            text: "Hook B",
          }),
        ]),
      }),
    );
    expect(ctx.db.patch).toHaveBeenNthCalledWith(
      2,
      "doc_product",
      expect.objectContaining({
        winningHookExamples: ["Hook B", "Old win"],
      }),
    );
    expect(ctx.db.patch).toHaveBeenNthCalledWith(
      3,
      "doc_plan",
      expect.objectContaining({
        feedbackStatus: "rejected",
        hookOptions: expect.arrayContaining([
          expect.objectContaining({
            feedbackStatus: "rejected",
            text: "Hook A",
          }),
        ]),
      }),
    );
    expect(ctx.db.patch).toHaveBeenNthCalledWith(
      4,
      "doc_product",
      expect.objectContaining({
        rejectedHookExamples: ["Hook A", "Old miss"],
      }),
    );
  });
});
