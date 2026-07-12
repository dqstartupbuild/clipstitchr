import { beforeEach, describe, expect, it, vi } from "vitest";
import { retryAfterFailure } from "./retryAfterFailure";

type ConvexFunction = {
  handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertProviderWorkerSecret: vi.fn(),
  mutation: vi.fn((definition) => definition),
  requestWorkerLaunch: vi.fn(),
  upsertWorkerJobSummary: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertProviderWorkerSecret", () => ({
  assertProviderWorkerSecret: mocks.assertProviderWorkerSecret,
}));
vi.mock("../upsertWorkerJobSummary", () => ({
  upsertWorkerJobSummary: mocks.upsertWorkerJobSummary,
}));
vi.mock("../workerLaunch", () => ({
  requestWorkerLaunch: mocks.requestWorkerLaunch,
}));

function getHandler() {
  return (retryAfterFailure as unknown as ConvexFunction).handler;
}

function createContext(job: Record<string, unknown>) {
  const index = { eq: vi.fn() };
  index.eq.mockReturnValue(index);
  const chain = {
    unique: vi.fn(async () => job),
    withIndex: vi.fn(
      (_name: string, callback: (value: typeof index) => unknown) => {
        callback(index);
        return chain;
      },
    ),
  };
  const patchedJob = { ...job, stage: "retry-queued", status: "queued" };

  return {
    db: {
      get: vi.fn(async () => patchedJob),
      patch: vi.fn(),
      query: vi.fn(() => chain),
    },
  };
}

describe("providerJobAttempts.retryAfterFailure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requeues a transient failure before the final attempt", async () => {
    const ctx = createContext({
      _id: "job-document",
      attempt: 1,
      id: "job-1",
      ownerId: "owner-1",
      status: "running",
    });

    await expect(
      getHandler()(ctx, {
        error: "Temporary provider error",
        id: "job-1",
        ownerId: "owner-1",
        secret: "secret",
        updatedAt: "2026-07-12T12:00:00.000Z",
      }),
    ).resolves.toBe(true);
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "job-document",
      expect.objectContaining({
        stage: "retry-queued",
        status: "queued",
        lockedBy: undefined,
        lockedUntil: undefined,
      }),
    );
    expect(mocks.requestWorkerLaunch).toHaveBeenCalledOnce();
  });

  it("leaves the final attempt for terminal failure propagation", async () => {
    const ctx = createContext({
      _id: "job-document",
      attempt: 3,
      id: "job-1",
      ownerId: "owner-1",
      status: "running",
    });

    await expect(
      getHandler()(ctx, {
        error: "Permanent provider error",
        id: "job-1",
        ownerId: "owner-1",
        secret: "secret",
        updatedAt: "2026-07-12T12:00:00.000Z",
      }),
    ).resolves.toBe(false);
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(mocks.requestWorkerLaunch).not.toHaveBeenCalled();
  });
});
