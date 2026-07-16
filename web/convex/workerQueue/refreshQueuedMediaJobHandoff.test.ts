import { describe, expect, it, vi } from "vitest";
import { refreshQueuedMediaJobHandoff } from "./refreshQueuedMediaJobHandoff";

describe("refreshQueuedMediaJobHandoff", () => {
  it("moves a queued retry to the provider's current owner slot", async () => {
    const mediaJob = {
      _id: "media_doc_1",
      generationSlotId: "generation:old",
      status: "queued",
    };
    const refreshed = {
      ...mediaJob,
      generationSlotId: "generation:current",
    };
    const ctx = {
      db: {
        get: vi.fn(async () => refreshed),
        patch: vi.fn(async () => undefined),
      },
    };

    await expect(
      refreshQueuedMediaJobHandoff(ctx as never, mediaJob as never, {
        generationSlotId: "generation:current",
        updatedAt: "2026-07-16T12:00:00.000Z",
        usageReservationId: "reservation_1",
      }),
    ).resolves.toEqual(refreshed);
    expect(ctx.db.patch).toHaveBeenCalledWith("media_doc_1", {
      generationSlotId: "generation:current",
      updatedAt: "2026-07-16T12:00:00.000Z",
      usageReservationId: "reservation_1",
    });
  });
});
