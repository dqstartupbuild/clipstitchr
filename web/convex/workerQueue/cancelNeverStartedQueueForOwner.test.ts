import { beforeEach, describe, expect, it, vi } from "vitest";
import { cancelNeverStartedQueueForOwner } from "./cancelNeverStartedQueueForOwner";

const mocks = vi.hoisted(() => ({
  patchCanceledWorkerQueueSource: vi.fn(),
  releaseGenerationSlot: vi.fn(),
  releaseUsageReservationForOwner: vi.fn(),
}));

vi.mock("./patchCanceledWorkerQueueSource", () => ({
  patchCanceledWorkerQueueSource: mocks.patchCanceledWorkerQueueSource,
}));
vi.mock("./releaseGenerationSlot", () => ({
  releaseGenerationSlot: mocks.releaseGenerationSlot,
}));
vi.mock("../usage/releaseUsageReservation", () => ({
  releaseUsageReservationForOwner: mocks.releaseUsageReservationForOwner,
}));

function createContext(entries: Record<string, unknown>[]) {
  return {
    db: {
      patch: vi.fn(),
      query: vi.fn((table: string) => {
        const query = {
          collect: vi.fn(async () =>
            table === "workerQueueEntries" ? entries : [],
          ),
          unique: vi.fn(async () =>
            table === "usageReservations" ? { state: "reserved" } : null,
          ),
          withIndex: vi.fn(() => query),
        };

        return query;
      }),
    },
  };
}

describe("cancelNeverStartedQueueForOwner", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cancels queued work and releases its reservation", async () => {
    const entry = {
      _id: "queue_1",
      generationSlotId: undefined,
      sourceId: "provider_1",
      sourceKind: "provider_job",
      usageReservationId: "reservation_1",
    };
    const ctx = createContext([entry]);

    await expect(
      cancelNeverStartedQueueForOwner(ctx as never, {
        now: "2026-07-16T00:00:00.000Z",
        ownerId: "owner_1",
        reason: "Subscription ended before this work started.",
      }),
    ).resolves.toEqual({ canceledCount: 1 });

    expect(mocks.releaseUsageReservationForOwner).toHaveBeenCalledWith(
      ctx,
      "owner_1",
      "reservation_1",
      expect.any(String),
      expect.stringContaining("Subscription ended"),
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "queue_1",
      expect.objectContaining({ status: "canceled" }),
    );
  });

  it("preserves a queued media continuation with an inherited slot", async () => {
    const ctx = createContext([
      {
        _id: "queue_media",
        generationSlotId: "slot_provider_handoff",
        sourceId: "media_1",
        sourceKind: "media_job",
        usageReservationId: "reservation_1",
      },
    ]);

    await expect(
      cancelNeverStartedQueueForOwner(ctx as never, {
        now: "2026-07-16T00:00:00.000Z",
        ownerId: "owner_1",
        reason: "Subscription ended before this work started.",
      }),
    ).resolves.toEqual({ canceledCount: 0 });

    expect(mocks.releaseUsageReservationForOwner).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
