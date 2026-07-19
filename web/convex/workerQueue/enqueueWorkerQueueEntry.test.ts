import { describe, expect, it, vi } from "vitest";
import { enqueueWorkerQueueEntry } from "./enqueueWorkerQueueEntry";

const mocks = vi.hoisted(() => ({
  getGenerationSlotForQueue: vi.fn(),
  validateWorkerQueueUsageReservations: vi.fn(),
}));

vi.mock("./getGenerationSlotForQueue", () => ({
  getGenerationSlotForQueue: mocks.getGenerationSlotForQueue,
}));

vi.mock("./validateWorkerQueueUsageReservations", () => ({
  validateWorkerQueueUsageReservations:
    mocks.validateWorkerQueueUsageReservations,
}));

describe("enqueueWorkerQueueEntry inherited slots", () => {
  it("validates an inherited slot before requeueing an existing entry", async () => {
    const existing = {
      _id: "queue_doc_1",
      sourceId: "media_job_1",
      sourceKind: "media_job",
      status: "completed",
    };
    const queryChain = {
      unique: vi.fn(async () => existing),
      withIndex: vi.fn(
        (
          _name: string,
          callback: (query: { eq: () => unknown }) => unknown,
        ) => {
          const query = { eq: vi.fn(() => query) };
          callback(query);
          return queryChain;
        },
      ),
    };
    const ctx = {
      db: {
        patch: vi.fn(),
        query: vi.fn(() => queryChain),
      },
    };
    mocks.getGenerationSlotForQueue.mockRejectedValue(
      new Error("Generation slot is not active for this queue entry."),
    );

    await expect(
      enqueueWorkerQueueEntry(ctx as never, {
        generationRequired: true,
        generationSlotId: "generation:expired",
        now: "2026-07-16T12:00:00.000Z",
        ownerId: "owner_1",
        sourceId: "media_job_1",
        sourceKind: "media_job",
        tool: "clipr-finalization",
        worker: "media",
      }),
    ).rejects.toThrow("Generation slot is not active");
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("validates and links usage before returning an existing queue entry", async () => {
    const existing = {
      _id: "queue_doc_1",
      ownerId: "owner_1",
      planKeySnapshot: "pro",
      sourceId: "provider_job_1",
      sourceKind: "provider_job",
      status: "queued",
      usageReservationId: "reservation_1",
    };
    const queryChain = {
      unique: vi.fn(async () => existing),
      withIndex: vi.fn(
        (
          _name: string,
          callback: (query: { eq: () => unknown }) => unknown,
        ) => {
          const query = { eq: vi.fn(() => query) };
          callback(query);
          return queryChain;
        },
      ),
    };
    const ctx = { db: { query: vi.fn(() => queryChain) } };
    const now = "2026-07-16T12:00:00.000Z";

    await expect(
      enqueueWorkerQueueEntry(ctx as never, {
        generationRequired: true,
        now,
        ownerId: existing.ownerId,
        sourceId: existing.sourceId,
        sourceKind: "provider_job",
        tool: "clipr",
        usageReservationId: existing.usageReservationId,
        worker: "provider",
      }),
    ).resolves.toBe(existing);
    expect(mocks.validateWorkerQueueUsageReservations).toHaveBeenCalledWith(
      ctx,
      {
        handoffGenerationSlotId: undefined,
        now,
        ownerId: existing.ownerId,
        queueEntryId: "provider:provider_job:provider_job_1",
        reservationIds: [existing.usageReservationId],
      },
    );
  });
});
