import { beforeEach, describe, expect, it, vi } from "vitest";
import { getActiveWorkerJobSummary } from "./getActiveWorkerJobSummary";
import type { QueryCtx } from "./_generated/server";

const mocks = vi.hoisted(() => ({
  listActiveAutomationBatchJobSummaries: vi.fn(),
  listActiveWorkerJobSummaries: vi.fn(),
}));

vi.mock("./listActiveAutomationBatchJobSummaries", () => ({
  listActiveAutomationBatchJobSummaries:
    mocks.listActiveAutomationBatchJobSummaries,
}));

vi.mock("./listActiveWorkerJobSummaries", () => ({
  listActiveWorkerJobSummaries: mocks.listActiveWorkerJobSummaries,
}));

describe("getActiveWorkerJobSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes active CLI batch jobs with progress", async () => {
    mocks.listActiveWorkerJobSummaries.mockImplementation(
      async (_ctx, _ownerId, worker) =>
        worker === "media"
          ? [
              {
                createdAt: "2026-07-06T10:00:00.000Z",
                id: "media_1",
                jobType: "upload-normalization",
                stage: "queued",
                status: "queued",
              },
            ]
          : [],
    );
    mocks.listActiveAutomationBatchJobSummaries.mockResolvedValue([
      {
        createdAt: "2026-07-06T10:05:00.000Z",
        id: "stitchr-batch:owner_1:product_1:2026-07-06",
        jobType: "stitchr-batch",
        progress: 0.5,
        stage: "awaiting-media-worker",
        status: "running",
        updatedAt: "2026-07-06T10:07:00.000Z",
      },
    ]);

    await expect(
      getActiveWorkerJobSummary({} as QueryCtx, "owner_1"),
    ).resolves.toEqual({
      jobs: [
        expect.objectContaining({
          id: "stitchr-batch:owner_1:product_1:2026-07-06",
          jobType: "stitchr-batch",
          progress: 0.5,
          status: "running",
        }),
        expect.objectContaining({
          id: "media_1",
          jobType: "upload-normalization",
        }),
      ],
      totalCount: 2,
    });
  });
});
