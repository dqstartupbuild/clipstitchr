import { beforeEach, describe, expect, it, vi } from "vitest";
import { claimNextForProvider } from "./providerJobs";

type ConvexFunction = {
  handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertProviderWorkerSecret: vi.fn(),
  mutation: vi.fn((definition) => definition),
  query: vi.fn((definition) => definition),
  requestWorkerLaunch: vi.fn(),
  upsertWorkerJobSummary: vi.fn(),
}));

vi.mock("./_generated/server", () => ({
  internalMutation: mocks.mutation,
  mutation: mocks.mutation,
  query: mocks.query,
}));
vi.mock("./auth/assertProviderWorkerSecret", () => ({
  assertProviderWorkerSecret: mocks.assertProviderWorkerSecret,
}));
vi.mock("./upsertWorkerJobSummary", () => ({
  upsertWorkerJobSummary: mocks.upsertWorkerJobSummary,
}));
vi.mock("./workerLaunch", () => ({
  requestWorkerLaunch: mocks.requestWorkerLaunch,
}));

function createCtx(runningJob: Record<string, unknown>) {
  let currentJob = { ...runningJob };
  let queryCount = 0;
  const db = {
    get: vi.fn(async () => currentJob),
    patch: vi.fn(async (_id: unknown, fields: Record<string, unknown>) => {
      currentJob = { ...currentJob, ...fields };
    }),
    query: vi.fn(() => {
      const currentQuery = queryCount;
      queryCount += 1;
      const indexQuery = { eq: vi.fn(() => indexQuery) };
      const chain = {
        order: vi.fn(() => chain),
        take: vi.fn(async () => (currentQuery === 0 ? [] : [currentJob])),
        withIndex: vi.fn(
          (_name: string, callback: (query: typeof indexQuery) => unknown) => {
            callback(indexQuery);
            return chain;
          },
        ),
      };

      return chain;
    }),
  };

  return { ctx: { db }, db };
}

describe("providerJobs.claimNextForProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reclaims an expired generic running job and increments its attempt", async () => {
    const { ctx, db } = createCtx({
      _id: "job_doc",
      attempt: 1,
      jobType: "hook-lab-post-analysis",
      lockedUntil: "2026-07-12T11:59:00.000Z",
      stage: "awaiting-provider",
      status: "running",
    });

    await expect(
      (claimNextForProvider as unknown as ConvexFunction).handler(ctx, {
        jobType: "hook-lab-post-analysis",
        lockedUntil: "2026-07-12T12:05:00.000Z",
        secret: "provider-secret",
        updatedAt: "2026-07-12T12:00:00.000Z",
        workerId: "worker_2",
      }),
    ).resolves.toEqual(
      expect.objectContaining({ attempt: 2, lockedBy: "worker_2" }),
    );
    expect(db.patch).toHaveBeenCalledWith(
      "job_doc",
      expect.objectContaining({ attempt: 2, status: "running" }),
    );
  });

  it("returns a failed job at the retry limit so downstream state can terminate", async () => {
    const { ctx, db } = createCtx({
      _id: "job_doc",
      attempt: 3,
      jobType: "hook-lab-post-analysis",
      lockedUntil: "2026-07-12T11:59:00.000Z",
      stage: "awaiting-provider",
      status: "running",
    });

    await expect(
      (claimNextForProvider as unknown as ConvexFunction).handler(ctx, {
        jobType: "hook-lab-post-analysis",
        lockedUntil: "2026-07-12T12:05:00.000Z",
        secret: "provider-secret",
        updatedAt: "2026-07-12T12:00:00.000Z",
        workerId: "worker_2",
      }),
    ).resolves.toEqual(
      expect.objectContaining({ stage: "retry-limit", status: "failed" }),
    );
    expect(db.patch).toHaveBeenCalledWith(
      "job_doc",
      expect.objectContaining({
        lockedBy: undefined,
        lockedUntil: undefined,
        stage: "retry-limit",
        status: "failed",
      }),
    );
  });
});
