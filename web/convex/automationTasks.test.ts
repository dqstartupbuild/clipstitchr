import { beforeEach, describe, expect, it, vi } from "vitest";
import { claimNextForProvider } from "./automationTasks";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

type QueryResult = {
  collect?: unknown[];
  take?: unknown[];
  unique?: unknown;
};

const mocks = vi.hoisted(() => ({
  assertAutomationWorkerSecret: vi.fn(),
  assertMediaWorkerSecret: vi.fn(),
  assertProviderWorkerSecret: vi.fn(),
  mutation: vi.fn((definition) => definition),
  query: vi.fn((definition) => definition),
  requestWorkerLaunch: vi.fn(),
}));

vi.mock("./_generated/server", () => ({
  internalMutation: mocks.mutation,
  mutation: mocks.mutation,
  query: mocks.query,
}));

vi.mock("./auth/assertAutomationWorkerSecret", () => ({
  assertAutomationWorkerSecret: mocks.assertAutomationWorkerSecret,
}));

vi.mock("./auth/assertMediaWorkerSecret", () => ({
  assertMediaWorkerSecret: mocks.assertMediaWorkerSecret,
}));

vi.mock("./auth/assertProviderWorkerSecret", () => ({
  assertProviderWorkerSecret: mocks.assertProviderWorkerSecret,
}));

vi.mock("./workerLaunch", () => ({
  requestWorkerLaunch: mocks.requestWorkerLaunch,
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
    order: vi.fn(() => chain),
    take: vi.fn(async () => result.take ?? []),
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
      get: vi.fn(async () => null),
      patch: vi.fn(async () => undefined),
      query: vi.fn((table: string) => {
        const queue = queues.get(table);
        const result = queue?.shift() ?? {};

        return createQueryChain(result);
      }),
    },
  };
}

const now = "2026-06-21T10:00:00.000Z";
const queuedTask = {
  _id: "task_doc",
  attempt: 0,
  createdAt: "2026-06-21T09:00:00.000Z",
  id: "task_1",
  idempotencyKey: "task_1:key",
  inputSnapshotJson: "{}",
  mediaJobIds: [],
  outputAssetIds: [],
  ownerId: "owner_1",
  providerJobIds: [],
  runId: "run_1",
  stage: "awaiting-text-provider",
  status: "queued",
  taskType: "stitchr-draft",
  tool: "stitchr",
  updatedAt: "2026-06-21T09:00:00.000Z",
};
const productRun = {
  _id: "run_doc",
  id: "run_1",
  ownerId: "owner_1",
  productId: "product_1",
  status: "running",
};
const disabledProductPreference = {
  _id: "preference_doc",
  enabled: false,
  enabledTools: [],
  ownerId: "owner_1",
  productId: "product_1",
};

describe("automationTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips an old queued task when its product automation is disabled", async () => {
    const ctx = createCtx({
      automationPreferences: [{ unique: disabledProductPreference }],
      automationRuns: [{ unique: productRun }, { unique: productRun }],
      automationTasks: [{ take: [queuedTask] }],
    });

    await expect(
      getHandler<Record<string, string>, unknown>(claimNextForProvider)(ctx, {
        lockedUntil: "2026-06-21T10:05:00.000Z",
        secret: "provider_secret",
        tool: "stitchr",
        updatedAt: now,
        workerId: "provider_worker_1",
      }),
    ).resolves.toBeNull();

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "task_doc",
      expect.objectContaining({
        error: "Stitchr automation is disabled.",
        lockedBy: undefined,
        lockedUntil: undefined,
        stage: "disabled",
        status: "skipped",
        updatedAt: now,
      }),
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "run_doc",
      expect.objectContaining({
        error: "Stitchr automation is disabled.",
        skippedAt: now,
        status: "skipped",
        updatedAt: now,
      }),
    );
    expect(ctx.db.get).toHaveBeenCalledWith("task_doc");
    expect(ctx.db.get).toHaveBeenCalledWith("run_doc");
  });
});
