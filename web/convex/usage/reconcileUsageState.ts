import { internalMutation } from "../_generated/server";
import { getQueueUsageReservationIds } from "../workerQueue/getQueueUsageReservationIds";
import { patchWorkerQueueSourceFailure } from "../workerQueue/patchWorkerQueueSourceFailure";
import { patchWorkerQueueSourceForRetry } from "../workerQueue/patchWorkerQueueSourceForRetry";
import { releaseGenerationSlot } from "../workerQueue/releaseGenerationSlot";
import { updateWorkerQueueEntryStatus } from "../workerQueue/updateWorkerQueueEntryStatus";
import { releaseUsageReservationForOwner } from "./releaseUsageReservation";
import { requestWorkerLaunch } from "../workerLaunch";

const RECONCILIATION_BATCH_SIZE = 100;

export const reconcileUsageState = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();
    const expiredLocks = await ctx.db
      .query("workerQueueEntries")
      .withIndex("by_status_lock", (query) =>
        query.eq("status", "running").lte("lockedUntil", now),
      )
      .take(RECONCILIATION_BATCH_SIZE);
    let failedQueueCount = 0;
    let requeuedCount = 0;
    const requeuedWorkers = new Set<"media" | "provider">();

    for (const entry of expiredLocks) {
      await releaseGenerationSlot(
        ctx,
        entry.generationSlotId,
        now,
        "Worker claim expired",
        "expired",
      );

      if (entry.attempt >= 3) {
        const error = "This creation stopped after its final recovery attempt.";
        await updateWorkerQueueEntryStatus(ctx, {
          error,
          now,
          sourceId: entry.sourceId,
          sourceKind: entry.sourceKind,
          status: "failed",
        });
        await patchWorkerQueueSourceFailure(ctx, {
          error,
          now,
          ownerId: entry.ownerId,
          sourceId: entry.sourceId,
          sourceKind: entry.sourceKind,
        });
        failedQueueCount += 1;
        continue;
      }

      await ctx.db.patch(entry._id, {
        generationSlotId: undefined,
        lockId: undefined,
        lockedBy: undefined,
        lockedUntil: undefined,
        notBefore: new Date(Date.parse(now) + 30_000).toISOString(),
        queuedAt: now,
        status: "queued",
        updatedAt: now,
      });
      await patchWorkerQueueSourceForRetry(ctx, {
        now,
        ownerId: entry.ownerId,
        sourceId: entry.sourceId,
        sourceKind: entry.sourceKind,
      });
      requeuedWorkers.add(entry.worker);
      requeuedCount += 1;
    }

    for (const worker of requeuedWorkers) {
      await requestWorkerLaunch({ ctx, now, worker });
    }

    const expiredReservations = [];

    for (const resource of ["creation_credit", "ai_video"] as const) {
      expiredReservations.push(
        ...(await ctx.db
          .query("usageReservations")
          .withIndex("by_resource_state_expiry", (query) =>
            query
              .eq("resource", resource)
              .eq("state", "reserved")
              .lte("expiresAt", now),
          )
          .take(RECONCILIATION_BATCH_SIZE)),
      );
    }

    let expiredReservationCount = 0;

    for (const reservation of expiredReservations.slice(
      0,
      RECONCILIATION_BATCH_SIZE,
    )) {
      const activeEntries = [
        ...(await ctx.db
          .query("workerQueueEntries")
          .withIndex("by_owner_status", (query) =>
            query.eq("ownerId", reservation.ownerId).eq("status", "queued"),
          )
          .take(50)),
        ...(await ctx.db
          .query("workerQueueEntries")
          .withIndex("by_owner_status", (query) =>
            query.eq("ownerId", reservation.ownerId).eq("status", "running"),
          )
          .take(50)),
      ];
      const linkedEntry = activeEntries.find((entry) =>
        getQueueUsageReservationIds(entry).includes(reservation.reservationId),
      );

      if (linkedEntry) {
        const error = "This creation expired before it could finish.";
        await updateWorkerQueueEntryStatus(ctx, {
          error,
          now,
          sourceId: linkedEntry.sourceId,
          sourceKind: linkedEntry.sourceKind,
          status: "failed",
        });
        await patchWorkerQueueSourceFailure(ctx, {
          error,
          now,
          ownerId: linkedEntry.ownerId,
          sourceId: linkedEntry.sourceId,
          sourceKind: linkedEntry.sourceKind,
        });
      } else {
        await releaseUsageReservationForOwner(
          ctx,
          reservation.ownerId,
          reservation.reservationId,
          now,
          "Usage reservation expired",
          "expired",
        );
      }

      expiredReservationCount += 1;
    }

    const expiredSlots = await ctx.db
      .query("generationSlots")
      .withIndex("by_state_expiry", (query) =>
        query.eq("state", "active").lte("expiresAt", now),
      )
      .take(RECONCILIATION_BATCH_SIZE);

    for (const slot of expiredSlots) {
      await releaseGenerationSlot(
        ctx,
        slot.slotId,
        now,
        "Generation slot expired",
        "expired",
      );
    }

    return {
      expiredReservationCount,
      expiredSlotCount: expiredSlots.length,
      failedQueueCount,
      requeuedCount,
    };
  },
});
