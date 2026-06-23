import { describe, expect, it, vi } from "vitest";
import type { MutationCtx } from "./_generated/server";
import { requestWorkerLaunch } from "./workerLaunch";

const mocks = vi.hoisted(() => ({
  runWorker: "workerDispatch.runWorker",
}));

vi.mock("./_generated/api", () => ({
  internal: {
    workerDispatch: {
      runWorker: mocks.runWorker,
    },
  },
}));

type WorkerLaunchDocument = {
  _id: string;
  lastCoalescedFollowupRequestedAt?: string;
  lastRecoveryRequestedAt?: string;
  lastRequestedAt: string;
  updatedAt: string;
  worker: "media" | "provider";
};

function createCtx(existing: WorkerLaunchDocument | null = null) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const queryChain = {
    unique: vi.fn(async () => existing),
    withIndex: vi.fn(
      (_indexName: string, callback: (q: typeof indexQuery) => unknown) => {
        callback(indexQuery);

        return queryChain;
      },
    ),
  };

  return {
    db: {
      insert: vi.fn(async () => "launch_state_doc"),
      patch: vi.fn(async () => undefined),
      query: vi.fn(() => queryChain),
    },
    scheduler: {
      runAfter: vi.fn(async () => undefined),
    },
  };
}

describe("requestWorkerLaunch", () => {
  it("schedules immediate launch and delayed recovery for a new worker", async () => {
    const ctx = createCtx();

    await requestWorkerLaunch({
      ctx: ctx as unknown as MutationCtx,
      now: "2026-06-22T10:00:00.000Z",
      worker: "media",
    });

    expect(ctx.db.insert).toHaveBeenCalledWith("workerLaunchState", {
      lastRecoveryRequestedAt: "2026-06-22T10:00:00.000Z",
      lastRequestedAt: "2026-06-22T10:00:00.000Z",
      updatedAt: "2026-06-22T10:00:00.000Z",
      worker: "media",
    });
    expect(ctx.scheduler.runAfter).toHaveBeenCalledWith(
      0,
      mocks.runWorker,
      { worker: "media" },
    );
    expect(ctx.scheduler.runAfter).toHaveBeenCalledWith(
      600_000,
      mocks.runWorker,
      { worker: "media" },
    );
  });

  it("schedules a short follow-up when coalescing an immediate launch", async () => {
    const ctx = createCtx({
      _id: "launch_state_doc",
      lastRecoveryRequestedAt: "2026-06-22T09:40:00.000Z",
      lastRequestedAt: "2026-06-22T09:59:50.000Z",
      updatedAt: "2026-06-22T09:59:50.000Z",
      worker: "provider",
    });

    await requestWorkerLaunch({
      ctx: ctx as unknown as MutationCtx,
      now: "2026-06-22T10:00:00.000Z",
      worker: "provider",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith("launch_state_doc", {
      lastCoalescedFollowupRequestedAt: "2026-06-22T10:00:00.000Z",
      lastRecoveryRequestedAt: "2026-06-22T10:00:00.000Z",
      updatedAt: "2026-06-22T10:00:00.000Z",
    });
    expect(ctx.scheduler.runAfter).toHaveBeenCalledTimes(2);
    expect(ctx.scheduler.runAfter).toHaveBeenCalledWith(
      3_000,
      mocks.runWorker,
      { worker: "provider" },
    );
    expect(ctx.scheduler.runAfter).toHaveBeenCalledWith(
      600_000,
      mocks.runWorker,
      { worker: "provider" },
    );
  });

  it("coalesces immediate and recovery launches inside their windows", async () => {
    const ctx = createCtx({
      _id: "launch_state_doc",
      lastCoalescedFollowupRequestedAt: "2026-06-22T09:59:58.000Z",
      lastRecoveryRequestedAt: "2026-06-22T09:59:00.000Z",
      lastRequestedAt: "2026-06-22T09:59:50.000Z",
      updatedAt: "2026-06-22T09:59:50.000Z",
      worker: "media",
    });

    await requestWorkerLaunch({
      ctx: ctx as unknown as MutationCtx,
      now: "2026-06-22T10:00:00.000Z",
      worker: "media",
    });

    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.scheduler.runAfter).not.toHaveBeenCalled();
  });

  it("schedules delayed primary launches with a later backup", async () => {
    const ctx = createCtx({
      _id: "launch_state_doc",
      lastRecoveryRequestedAt: "2026-06-22T09:40:00.000Z",
      lastRequestedAt: "2026-06-22T09:59:55.000Z",
      updatedAt: "2026-06-22T09:59:55.000Z",
      worker: "provider",
    });

    await requestWorkerLaunch({
      ctx: ctx as unknown as MutationCtx,
      delayMs: 60_000,
      now: "2026-06-22T10:00:00.000Z",
      worker: "provider",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith("launch_state_doc", {
      lastRecoveryRequestedAt: "2026-06-22T10:00:00.000Z",
      updatedAt: "2026-06-22T10:00:00.000Z",
    });
    expect(ctx.scheduler.runAfter).toHaveBeenCalledWith(
      60_000,
      mocks.runWorker,
      { worker: "provider" },
    );
    expect(ctx.scheduler.runAfter).toHaveBeenCalledWith(
      660_000,
      mocks.runWorker,
      { worker: "provider" },
    );
  });
});
