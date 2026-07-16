import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStitchrDraftFinalizationFromProvider } from "./mediaJobs";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
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

vi.mock("./auth/assertProviderWorkerSecret", () => ({
  assertProviderWorkerSecret: mocks.assertProviderWorkerSecret,
}));

vi.mock("./workerLaunch", () => ({
  requestWorkerLaunch: mocks.requestWorkerLaunch,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createQueryChain(existing: unknown) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    unique: vi.fn(async () => existing),
    withIndex: vi.fn(
      (_indexName: string, callback: (q: typeof indexQuery) => unknown) => {
        callback(indexQuery);

        return chain;
      },
    ),
  };

  return chain;
}

function createCtx(existing: unknown, refreshed: unknown = existing) {
  return {
    db: {
      get: vi.fn(async () => refreshed),
      insert: vi.fn(async () => "media_doc_new"),
      patch: vi.fn(async () => undefined),
      query: vi.fn(() => createQueryChain(existing)),
    },
  };
}

const createdAt = "2026-06-23T14:00:00.000Z";

describe("mediaJobs.createStitchrDraftFinalizationFromProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requeues an existing empty Stitchr finalization job and relaunches media", async () => {
    const existing = {
      _id: "media_doc_1",
      attempt: 1,
      createdAt: "2026-06-23T13:00:00.000Z",
      id: "media:stitchr-draft-finalization:task_1",
      idempotencyKey: "task_1:stitchr-draft-finalization",
      inputSnapshotJson: "{}",
      jobType: "stitchr-draft-finalization",
      outputAssetIds: [],
      ownerId: "user_123",
      stage: "failed",
      status: "failed",
      updatedAt: "2026-06-23T13:30:00.000Z",
    };
    const refreshed = {
      ...existing,
      stage: "retry-queued",
      status: "queued",
      updatedAt: createdAt,
    };
    const ctx = createCtx(existing, refreshed);
    const result = await getHandler<Record<string, string>, unknown>(
      createStitchrDraftFinalizationFromProvider,
    )(ctx, {
      createdAt,
      id: existing.id,
      idempotencyKey: existing.idempotencyKey,
      inputSnapshotJson: existing.inputSnapshotJson,
      ownerId: existing.ownerId,
      secret: "provider-secret",
    });

    expect(result).toEqual(refreshed);
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "media_doc_1",
      expect.objectContaining({
        error: undefined,
        lockedBy: undefined,
        lockedUntil: undefined,
        stage: "retry-queued",
        status: "queued",
        updatedAt: createdAt,
      }),
    );
    expect(mocks.requestWorkerLaunch).toHaveBeenCalledWith(
      expect.objectContaining({
        now: createdAt,
        worker: "media",
      }),
    );
  });
});
