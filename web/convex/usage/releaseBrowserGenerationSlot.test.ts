import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { releaseBrowserGenerationSlot } from "./releaseBrowserGenerationSlot";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  releaseGenerationSlot: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../workerQueue/releaseGenerationSlot", () => ({
  releaseGenerationSlot: mocks.releaseGenerationSlot,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(
  slot: Record<string, unknown> = {
    idempotencyKey: "browser:stitch:stitch_1",
    ownerId: "owner_123",
    provenance: "browser",
    slotId: "generation:browser:stitch:stitch_1",
  },
) {
  const indexQuery = { eq: vi.fn() };
  indexQuery.eq.mockReturnValue(indexQuery);
  const query = {
    unique: vi.fn(async () => slot),
    withIndex: vi.fn(
      (_name: string, applyIndex: (value: typeof indexQuery) => unknown) => {
        applyIndex(indexQuery);
        return query;
      },
    ),
  };

  return { db: { query: vi.fn(() => query) } };
}

describe("releaseBrowserGenerationSlot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("records slot release time from the server", async () => {
    const serverNow = "2026-07-16T12:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(serverNow);
    const ctx = createContext();

    await getHandler(releaseBrowserGenerationSlot)(ctx, {
      now: "2000-01-01T00:00:00.000Z",
      reason: "Browser generation failed",
      slotId: "generation:browser:stitch:stitch_1",
    });

    expect(mocks.releaseGenerationSlot).toHaveBeenCalledWith(
      ctx,
      "generation:browser:stitch:stitch_1",
      serverNow,
      "Browser generation failed",
    );
  });

  it("rejects a worker queue slot", async () => {
    const ctx = createContext({
      idempotencyKey: "media:media_job:job_1",
      ownerId: "owner_123",
      provenance: "worker_queue",
      slotId: "generation:media:media_job:job_1",
    });

    await expect(
      getHandler(releaseBrowserGenerationSlot)(ctx, {
        now: "2026-07-16T12:00:00.000Z",
        reason: "Release someone else's worker slot",
        slotId: "generation:media:media_job:job_1",
      }),
    ).rejects.toThrow("Browser generation slot not found");
    expect(mocks.releaseGenerationSlot).not.toHaveBeenCalled();
  });

  it("requires the browser idempotency prefix for migration-safe slots", async () => {
    const ctx = createContext({
      idempotencyKey: "stitch:stitch_1",
      ownerId: "owner_123",
      slotId: "generation:stitch:stitch_1",
    });

    await expect(
      getHandler(releaseBrowserGenerationSlot)(ctx, {
        now: "2026-07-16T12:00:00.000Z",
        reason: "Missing browser provenance",
        slotId: "generation:stitch:stitch_1",
      }),
    ).rejects.toThrow("Browser generation slot not found");
    expect(mocks.releaseGenerationSlot).not.toHaveBeenCalled();
  });
});
