import { beforeEach, describe, expect, it, vi } from "vitest";
import { releaseLegacyDirectAnalysisReservationsForOwner } from "./releaseLegacyDirectAnalysisReservationsForOwner";

const mocks = vi.hoisted(() => ({
  releaseUsageReservationForOwner: vi.fn(),
}));

vi.mock("./releaseUsageReservation", () => ({
  releaseUsageReservationForOwner: mocks.releaseUsageReservationForOwner,
}));

function createContext(reservations: Record<string, unknown>[]) {
  const indexQuery = { eq: vi.fn() };
  indexQuery.eq.mockReturnValue(indexQuery);
  const query = {
    take: vi.fn(async () => reservations),
    withIndex: vi.fn(
      (_name: string, applyIndex: (value: typeof indexQuery) => unknown) => {
        applyIndex(indexQuery);
        return query;
      },
    ),
  };

  return { db: { query: vi.fn(() => query) } };
}

describe("releaseLegacyDirectAnalysisReservationsForOwner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("releases only unqueued legacy direct-analysis reservations", async () => {
    const ctx = createContext([
      {
        domainKind: "analysis",
        operation: "hook_lab_script",
        reservationId: "legacy_script",
        reservationKind: "worker",
      },
      {
        domainKind: "analysis",
        operation: "hook_lab_analysis",
        reservationId: "queued_video",
        reservationKind: "worker",
        workerQueueEntryId: "provider:post_1",
      },
      {
        domainKind: "analysis",
        operation: "hook_lab_script",
        reservationId: "server_script",
        reservationKind: "server",
      },
    ]);

    await expect(
      releaseLegacyDirectAnalysisReservationsForOwner(
        ctx as never,
        "owner_1",
        "2026-07-22T12:00:00.000Z",
      ),
    ).resolves.toBe(1);
    expect(mocks.releaseUsageReservationForOwner).toHaveBeenCalledOnce();
    expect(mocks.releaseUsageReservationForOwner).toHaveBeenCalledWith(
      ctx,
      "owner_1",
      "legacy_script",
      "2026-07-22T12:00:00.000Z",
      expect.stringContaining("legacy direct-analysis"),
    );
  });
});
