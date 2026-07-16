import { beforeEach, describe, expect, it, vi } from "vitest";
import { reacquireUsageReservation } from "./reacquireUsageReservation";

const mocks = vi.hoisted(() => ({
  reserveAiVideoForOwner: vi.fn(),
  reserveCreationCreditsForOwner: vi.fn(),
}));

vi.mock("./reserveAiVideo", () => ({
  reserveAiVideoForOwner: mocks.reserveAiVideoForOwner,
}));

vi.mock("./reserveCreationCredits", () => ({
  reserveCreationCreditsForOwner: mocks.reserveCreationCreditsForOwner,
}));

function createContext(reservations: Array<Record<string, unknown>>) {
  const query = {
    unique: vi.fn(async () => reservations.shift() ?? null),
    withIndex: vi.fn(
      (
        _name: string,
        applyIndex: (value: { eq: () => unknown }) => unknown,
      ) => {
        const indexQuery = { eq: vi.fn(() => indexQuery) };
        applyIndex(indexQuery);
        return query;
      },
    ),
  };

  return { db: { patch: vi.fn(), query: vi.fn(() => query) } };
}

describe("reacquireUsageReservation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses a deterministic replacement before a released output can commit", async () => {
    const original = {
      batchId: undefined,
      domainId: "photo_1",
      domainKind: "provider_job",
      idempotencyKey: "background:photo_1",
      operation: "background_photo" as const,
      ownerId: "owner_1",
      reservationKind: "worker" as const,
      reservationId: "reservation_original",
      resource: "creation_credit" as const,
      state: "released" as const,
      workerQueueEntryId: "provider:provider_job:photo_1",
      workerQueueLinkedAt: "2026-07-16T11:00:00.000Z",
    };
    const replacement = {
      ...original,
      idempotencyKey: "background:photo_1:reacquire",
      reservationId: "reservation_reacquired",
      state: "reserved" as const,
      expiresAt: "2026-07-16T13:00:00.000Z",
    };
    const ctx = createContext([original, replacement, replacement]);
    mocks.reserveCreationCreditsForOwner.mockResolvedValueOnce({
      reservationId: replacement.reservationId,
      state: "committed",
    });
    const now = "2026-07-16T12:00:00.000Z";

    await expect(
      reacquireUsageReservation(
        ctx as never,
        original.ownerId,
        original.reservationId,
        now,
        {
          domainId: original.domainId,
          domainKind: original.domainKind,
          operation: original.operation,
          reservationKind: "worker",
          resource: original.resource,
        },
      ),
    ).resolves.toBe(replacement.reservationId);
    expect(mocks.reserveCreationCreditsForOwner).toHaveBeenCalledWith(
      ctx,
      original.ownerId,
      expect.objectContaining({
        idempotencyKey: "background:photo_1:reacquire",
        now,
        reservationKind: "worker",
      }),
    );
  });
});
