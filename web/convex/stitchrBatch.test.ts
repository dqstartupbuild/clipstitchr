import { beforeEach, describe, expect, it, vi } from "vitest";
import { plan } from "./stitchrBatch";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

type QueryResult = {
  collect?: unknown[];
  first?: unknown;
  take?: unknown[];
  unique?: unknown;
};

const mocks = vi.hoisted(() => ({
  assertAutomationWorkerSecret: vi.fn(),
  enqueueWorkerQueueEntry: vi.fn(),
  mutation: vi.fn((definition) => definition),
  requestWorkerLaunch: vi.fn(),
  rateLimiter: {
    limit: vi.fn(),
  },
  tryReserveCreationCreditsForAutomation: vi.fn(),
}));

vi.mock("./_generated/server", () => ({
  mutation: mocks.mutation,
}));

vi.mock("./auth/assertAutomationWorkerSecret", () => ({
  assertAutomationWorkerSecret: mocks.assertAutomationWorkerSecret,
}));

vi.mock("./workerLaunch", () => ({
  requestWorkerLaunch: mocks.requestWorkerLaunch,
}));

vi.mock("./rateLimiter", () => ({
  rateLimiter: mocks.rateLimiter,
}));

vi.mock("./usage/tryReserveCreationCreditsForAutomation", () => ({
  tryReserveCreationCreditsForAutomation:
    mocks.tryReserveCreationCreditsForAutomation,
}));

vi.mock("./workerQueue/enqueueWorkerQueueEntry", () => ({
  enqueueWorkerQueueEntry: mocks.enqueueWorkerQueueEntry,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createQueryChain(result: QueryResult = {}) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    collect: vi.fn(async () => result.collect ?? []),
    first: vi.fn(async () => result.first ?? null),
    order: vi.fn(() => chain),
    take: vi.fn(async () => result.take ?? result.collect ?? []),
    unique: vi.fn(async () => result.unique ?? null),
    withIndex: vi.fn(
      (_indexName: string, callback: (q: typeof indexQuery) => unknown) => {
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

  return {
    db: {
      get: vi.fn(async (_id: string) => createTask({ _id })),
      insert: vi.fn(
        async (table: string, value: unknown) => {
          void table;
          void value;

          return "inserted_doc";
        },
      ),
      patch: vi.fn(async () => undefined),
      query: vi.fn((table: string) => {
        const queue = queues.get(table);
        const result = queue?.shift() ?? {};

        return createQueryChain(result);
      }),
    },
  };
}

const now = "2026-06-23T14:00:00.000Z";

function createTask(
  overrides: Partial<{
    _id: string;
    completedAt: string;
    error: string;
    id: string;
    lockedBy: string;
    lockedUntil: string;
    mediaJobIds: string[];
    outputAssetIds: string[];
    stage: string;
    status: string;
  }> = {},
) {
  return {
    _id: overrides._id ?? "task_doc_1",
    attempt: 0,
    createdAt: "2026-06-23T13:00:00.000Z",
    id: overrides.id ?? "task_1",
    idempotencyKey: `${overrides.id ?? "task_1"}:key`,
    inputSnapshotJson: "{}",
    mediaJobIds: overrides.mediaJobIds ?? [],
    outputAssetIds: overrides.outputAssetIds ?? [],
    ownerId: "user_123",
    productId: "product_1",
    providerJobIds: [],
    runId: "stitchr-batch:user_123:product_1:2026-06-23",
    stage: overrides.stage ?? "awaiting-text-provider",
    status: overrides.status ?? "queued",
    taskType: "stitchr-draft",
    tool: "stitchr",
    updatedAt: "2026-06-23T13:00:00.000Z",
    ...(overrides.completedAt ? { completedAt: overrides.completedAt } : {}),
    ...(overrides.error ? { error: overrides.error } : {}),
    ...(overrides.lockedBy ? { lockedBy: overrides.lockedBy } : {}),
    ...(overrides.lockedUntil ? { lockedUntil: overrides.lockedUntil } : {}),
  };
}

function createClip(id: string, clipType: "demo" | "ugc") {
  return {
    _id: `${id}_doc`,
    clipType,
    createdAt: "2026-06-20T00:00:00.000Z",
    duration: 8,
    hasAudio: true,
    id,
    libraryKind: "user",
    name: clipType === "ugc" ? "UGC" : "Demo",
    ownerId: "user_123",
    productId: "product_1",
    videoObject: {
      contentType: "video/mp4",
      key: `users/user_123/${id}.mp4`,
      size: 100,
    },
  };
}

function createProduct() {
  return {
    _id: "product_doc_1",
    createdAt: "2026-06-20T00:00:00.000Z",
    id: "product_1",
    name: "Launch Kit",
    ownerId: "user_123",
    productDetails: "Helps creators make better short-form ads.",
    updatedAt: "2026-06-20T00:00:00.000Z",
  };
}

async function planBatch(
  existingTasks: unknown[],
  overrides: Partial<Record<string, string | number>> = {},
) {
  const ctx = createCtx({
    automationTasks: [{ collect: existingTasks }],
    products: [{ unique: createProduct() }],
  });
  const result = await getHandler<Record<string, string | number>, unknown>(
    plan,
  )(ctx, {
    batchDate: "2026-06-23",
    now,
    ownerId: "user_123",
    productId: "product_1",
    runKey: "run_1",
    ...overrides,
    secret: "automation-secret",
  });

  return { ctx, result };
}

describe("stitchrBatch.plan existing runs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
    mocks.tryReserveCreationCreditsForAutomation.mockResolvedValue({
      planKey: "pro",
      reservationId: "reservation_123",
    });
  });

  it("returns active queued task IDs and relaunches the provider worker", async () => {
    const { result } = await planBatch([createTask()], {
      providerLaunchDelayMs: 60000,
    });

    expect(result).toEqual(
      expect.objectContaining({
        hookPlanningTaskIds: ["task_1"],
        status: "running",
        taskIds: ["task_1"],
      }),
    );
    expect(mocks.requestWorkerLaunch).toHaveBeenCalledWith(
      expect.objectContaining({
        delayMs: 60000,
        now,
        worker: "provider",
      }),
    );
  });

  it("relaunches the media worker for media-stage tasks", async () => {
    const { result } = await planBatch([
      createTask({
        id: "task_2",
        mediaJobIds: ["media_1"],
        stage: "awaiting-media-worker",
        status: "running",
      }),
    ]);

    expect(result).toEqual(
      expect.objectContaining({
        hookPlanningTaskIds: [],
        status: "running",
        taskIds: ["task_2"],
      }),
    );
    expect(mocks.requestWorkerLaunch).toHaveBeenCalledWith(
      expect.objectContaining({
        now,
        worker: "media",
      }),
    );
  });

  it("repairs completed tasks without output and relaunches provider work", async () => {
    const { ctx, result } = await planBatch([
      createTask({
        completedAt: "2026-06-23T13:30:00.000Z",
        id: "task_3",
        outputAssetIds: [],
        stage: "completed",
        status: "completed",
      }),
    ]);

    expect(result).toEqual(
      expect.objectContaining({
        hookPlanningTaskIds: ["task_3"],
        status: "running",
        taskIds: ["task_3"],
      }),
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "task_doc_1",
      expect.objectContaining({
        completedAt: undefined,
        error: undefined,
        lockedBy: undefined,
        lockedUntil: undefined,
        stage: "awaiting-text-provider",
        status: "queued",
        updatedAt: now,
      }),
    );
    expect(mocks.requestWorkerLaunch).toHaveBeenCalledWith(
      expect.objectContaining({
        now,
        worker: "provider",
      }),
    );
  });

  it("keeps completed runs terminal when every task has an output", async () => {
    const { result } = await planBatch([
      createTask({
        id: "task_4",
        outputAssetIds: ["task_4:stitch"],
        stage: "completed",
        status: "completed",
      }),
    ]);

    expect(result).toEqual(
      expect.objectContaining({
        hookPlanningTaskIds: [],
        status: "completed",
        taskIds: [],
      }),
    );
    expect(mocks.requestWorkerLaunch).not.toHaveBeenCalled();
  });

  it("fills a new run and keys its user quota by the local batch date", async () => {
    const product = createProduct();
    const ctx = createCtx({
      automationTasks: [{ take: [] }, { unique: null }],
      productPreferences: [{ unique: null }],
      products: [{ unique: product }],
      stitchrBatchPairHistory: [{ take: [] }],
      videoClips: [
        { take: [createClip("ugc_1", "ugc")] },
        { take: [createClip("demo_1", "demo")] },
      ],
    });

    await getHandler<Record<string, string | number>, unknown>(plan)(ctx, {
      batchDate: "2026-06-22",
      now,
      ownerId: "user_123",
      productId: "product_1",
      providerLaunchDelayMs: 60000,
      runKey: "run_2",
      secret: "automation-secret",
    });

    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      expect.anything(),
      "stitchrBatchDaily",
      expect.objectContaining({
        count: 10,
        key: "user_123:2026-06-22",
        throws: true,
      }),
    );
    expect(
      ctx.db.insert.mock.calls.filter(([table]) => table === "automationTasks"),
    ).toHaveLength(10);
    expect(mocks.requestWorkerLaunch).toHaveBeenCalledWith(
      expect.objectContaining({
        delayMs: 60000,
        now,
        worker: "provider",
      }),
    );
  });
});
