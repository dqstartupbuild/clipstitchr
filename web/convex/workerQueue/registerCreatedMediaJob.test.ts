import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerCreatedMediaJob } from "./registerCreatedMediaJob";

const mocks = vi.hoisted(() => ({
  enqueueWorkerQueueEntry: vi.fn(),
  requestWorkerLaunch: vi.fn(),
  upsertWorkerJobSummary: vi.fn(),
}));

vi.mock("./enqueueWorkerQueueEntry", () => ({
  enqueueWorkerQueueEntry: mocks.enqueueWorkerQueueEntry,
}));

vi.mock("../workerLaunch", () => ({
  requestWorkerLaunch: mocks.requestWorkerLaunch,
}));

vi.mock("../upsertWorkerJobSummary", () => ({
  upsertWorkerJobSummary: mocks.upsertWorkerJobSummary,
}));

describe("registerCreatedMediaJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queues normal media work behind owner and media capacity", async () => {
    const ctx = {} as never;
    const mediaJob = {
      _creationTime: 1,
      _id: "media_doc_1",
      attempt: 0,
      createdAt: "2026-07-16T12:00:00.000Z",
      generationSlotId: "generation:provider:job_1",
      id: "media_1",
      idempotencyKey: "media_1",
      inputSnapshotJson: "{}",
      jobType: "clipr-finalization",
      outputAssetIds: [],
      ownerId: "owner_1",
      stage: "queued",
      status: "queued",
      updatedAt: "2026-07-16T12:00:00.000Z",
      usageReservationId: "reservation_1",
    } as const;

    await registerCreatedMediaJob(ctx, mediaJob as never);

    expect(mocks.enqueueWorkerQueueEntry).toHaveBeenCalledWith(ctx, {
      generationRequired: true,
      generationSlotId: "generation:provider:job_1",
      now: mediaJob.updatedAt,
      ownerId: "owner_1",
      sourceId: "media_1",
      sourceKind: "media_job",
      tool: "clipr-finalization",
      usageReservationId: "reservation_1",
      worker: "media",
    });
    expect(mocks.requestWorkerLaunch).toHaveBeenCalledWith({
      ctx,
      now: mediaJob.updatedAt,
      worker: "media",
    });
  });
});
