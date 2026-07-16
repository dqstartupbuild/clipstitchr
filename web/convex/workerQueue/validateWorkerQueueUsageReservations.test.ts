import { describe, expect, it, vi } from "vitest";
import { validateWorkerQueueUsageReservations } from "./validateWorkerQueueUsageReservations";

function createContext(reservation: Record<string, unknown>) {
  const indexQuery = { eq: vi.fn() };
  indexQuery.eq.mockReturnValue(indexQuery);
  const query = {
    unique: vi.fn(async () => reservation),
    withIndex: vi.fn(
      (_name: string, applyIndex: (value: typeof indexQuery) => unknown) => {
        applyIndex(indexQuery);
        return query;
      },
    ),
  };

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn(() => query),
    },
  };
}

const now = "2026-07-16T12:00:00.000Z";
const queueEntryId = "provider:provider_job:provider_job_1";

describe("validateWorkerQueueUsageReservations", () => {
  it("atomically records exclusive worker queue linkage", async () => {
    const ctx = createContext({
      _id: "reservation_doc_1",
      ownerId: "owner_1",
      reservationKind: "worker",
      state: "reserved",
    });

    await validateWorkerQueueUsageReservations(ctx as never, {
      now,
      ownerId: "owner_1",
      queueEntryId,
      reservationIds: ["reservation_1"],
    });

    expect(ctx.db.patch).toHaveBeenCalledWith("reservation_doc_1", {
      reservationKind: "worker",
      updatedAt: now,
      workerQueueEntryId: queueEntryId,
      workerQueueLinkedAt: now,
    });
  });

  it("allows the same reserved reservation on its original queue", async () => {
    const ctx = createContext({
      _id: "reservation_doc_1",
      ownerId: "owner_1",
      reservationKind: "worker",
      state: "reserved",
      workerQueueEntryId: queueEntryId,
      workerQueueLinkedAt: now,
    });

    await validateWorkerQueueUsageReservations(ctx as never, {
      now,
      ownerId: "owner_1",
      queueEntryId,
      reservationIds: ["reservation_1"],
    });

    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it.each([
    [
      "a released reservation",
      { reservationKind: "worker", state: "released" },
    ],
    [
      "a committed reservation",
      { reservationKind: "worker", state: "committed" },
    ],
    [
      "a browser reservation",
      { reservationKind: "browser", state: "reserved" },
    ],
    [
      "a reservation linked to another queue",
      {
        reservationKind: "worker",
        state: "reserved",
        workerQueueEntryId: "provider:provider_job:provider_job_2",
        workerQueueLinkedAt: now,
      },
    ],
    [
      "an ambiguously linked legacy reservation",
      {
        reservationKind: "worker",
        state: "reserved",
        workerQueueLinkedAt: now,
      },
    ],
  ])("rejects %s before queue creation", async (_label, override) => {
    const ctx = createContext({
      _id: "reservation_doc_1",
      ownerId: "owner_1",
      ...override,
    });

    await expect(
      validateWorkerQueueUsageReservations(ctx as never, {
        now,
        ownerId: "owner_1",
        queueEntryId,
        reservationIds: ["reservation_1"],
      }),
    ).rejects.toThrow("usage reservation is invalid");
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
