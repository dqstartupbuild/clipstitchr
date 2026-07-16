import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateWorkerQueueEntryStatus } from "./updateWorkerQueueEntryStatus";

const mocks = vi.hoisted(() => ({
  commitUsageReservationForOwner: vi.fn(),
  prepareGenerationSlotHandoff: vi.fn(),
  reacquireUsageReservation: vi.fn(),
  releaseGenerationSlot: vi.fn(),
  requestWorkerLaunch: vi.fn(),
}));

vi.mock("../usage/commitUsageReservation", () => ({
  commitUsageReservationForOwner: mocks.commitUsageReservationForOwner,
}));

vi.mock("../usage/reacquireUsageReservation", () => ({
  reacquireUsageReservation: mocks.reacquireUsageReservation,
}));

vi.mock("./releaseGenerationSlot", () => ({
  releaseGenerationSlot: mocks.releaseGenerationSlot,
}));

vi.mock("./prepareGenerationSlotHandoff", () => ({
  prepareGenerationSlotHandoff: mocks.prepareGenerationSlotHandoff,
}));

vi.mock("../workerLaunch", () => ({
  requestWorkerLaunch: mocks.requestWorkerLaunch,
}));

describe("updateWorkerQueueEntryStatus handoff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prepareGenerationSlotHandoff.mockResolvedValue({
      slotId: "generation:provider:job_1",
    });
  });

  it("completes provider queue ownership and relaunches media without releasing the slot", async () => {
    const entry = {
      _id: "queue_doc_1",
      generationSlotId: "generation:provider:job_1",
      sourceId: "provider_job_1",
      sourceKind: "provider_job",
    };
    const queryChain = {
      unique: vi.fn(async () => entry),
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
        patch: vi.fn(async (...args: unknown[]) => {
          void args;
        }),
        query: vi.fn(() => queryChain),
      },
    };
    const now = "2026-07-16T12:00:00.000Z";

    await updateWorkerQueueEntryStatus(ctx as never, {
      handoff: true,
      now,
      sourceId: entry.sourceId,
      sourceKind: "provider_job",
      status: "running",
    });

    expect(mocks.prepareGenerationSlotHandoff).toHaveBeenCalledWith(
      ctx,
      entry.generationSlotId,
      now,
    );
    const patch = ctx.db.patch.mock.calls[0]?.[1];
    expect(patch).toEqual(
      expect.objectContaining({ completedAt: now, status: "completed" }),
    );
    expect(patch).not.toHaveProperty("generationSlotId");
    expect(mocks.requestWorkerLaunch).toHaveBeenCalledWith({
      ctx,
      now,
      worker: "media",
    });
  });

  it("does not complete handoff when the inherited provider slot is invalid", async () => {
    const entry = {
      _id: "queue_doc_1",
      generationSlotId: "generation:expired",
      sourceId: "provider_job_1",
      sourceKind: "provider_job",
    };
    const queryChain = {
      unique: vi.fn(async () => entry),
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
    mocks.prepareGenerationSlotHandoff.mockResolvedValueOnce(null);

    await expect(
      updateWorkerQueueEntryStatus(ctx as never, {
        handoff: true,
        now: "2026-07-16T12:00:00.000Z",
        sourceId: entry.sourceId,
        sourceKind: "provider_job",
        status: "running",
      }),
    ).rejects.toThrow("Provider generation slot is not active");
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(mocks.requestWorkerLaunch).not.toHaveBeenCalled();
  });

  it("reacquires and commits released usage before completing queue work", async () => {
    const entry = {
      _id: "queue_doc_1",
      generationSlotId: "generation:provider:job_1",
      ownerId: "owner_1",
      queueEntryId: "provider:provider_job:provider_job_1",
      sourceId: "provider_job_1",
      sourceKind: "provider_job",
      usageReservationId: "reservation_original",
    };
    const reservation = {
      domainId: "provider_job_1",
      domainKind: "provider_job",
      operation: "avatar_photo",
      ownerId: "owner_1",
      reservationId: "reservation_original",
      resource: "creation_credit",
      state: "released",
      workerQueueEntryId: entry.queueEntryId,
    };
    const binding = {
      domainId: reservation.domainId,
      domainKind: reservation.domainKind,
      operation: reservation.operation,
      reservationKind: "worker",
      resource: reservation.resource,
    };
    const createQuery = (result: unknown) => {
      const query = {
        unique: vi.fn(async () => result),
        withIndex: vi.fn(
          (
            _name: string,
            callback: (query: { eq: () => unknown }) => unknown,
          ) => {
            const indexQuery = { eq: vi.fn(() => indexQuery) };
            callback(indexQuery);
            return query;
          },
        ),
      };

      return query;
    };
    const ctx = {
      db: {
        patch: vi.fn(),
        query: vi
          .fn()
          .mockReturnValueOnce(createQuery(entry))
          .mockReturnValueOnce(createQuery(reservation)),
      },
    };
    const now = "2026-07-16T12:00:00.000Z";
    mocks.reacquireUsageReservation.mockResolvedValueOnce(
      "reservation_reacquired",
    );

    await updateWorkerQueueEntryStatus(ctx as never, {
      now,
      sourceId: entry.sourceId,
      sourceKind: "provider_job",
      status: "completed",
    });

    expect(mocks.reacquireUsageReservation).toHaveBeenCalledWith(
      ctx,
      entry.ownerId,
      reservation.reservationId,
      now,
      binding,
    );
    expect(mocks.commitUsageReservationForOwner).toHaveBeenCalledWith(
      ctx,
      entry.ownerId,
      "reservation_reacquired",
      now,
      "worker",
      binding,
    );
    expect(mocks.releaseGenerationSlot).toHaveBeenCalledWith(
      ctx,
      entry.generationSlotId,
      now,
      "Job completed",
    );
  });
});
