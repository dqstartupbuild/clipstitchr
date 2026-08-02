import type { MutationCtx } from "../_generated/server";
import { releaseUsageReservationForOwner } from "../usage/releaseUsageReservation";
import { getQueueUsageReservationIds } from "./getQueueUsageReservationIds";
import { patchCanceledWorkerQueueSource } from "./patchCanceledWorkerQueueSource";
import { releaseGenerationSlot } from "./releaseGenerationSlot";

export async function cancelNeverStartedQueueForOwner(
  ctx: MutationCtx,
  args: { now: string; ownerId: string; reason: string },
) {
  const queuedEntries = await ctx.db
    .query("workerQueueEntries")
    .withIndex("by_owner_status", (query) =>
      query.eq("ownerId", args.ownerId).eq("status", "queued"),
    )
    .collect();
  const cancelableEntries = queuedEntries.filter(
    (entry) =>
      !entry.startedAt &&
      !(entry.sourceKind === "media_job" && entry.generationSlotId),
  );

  for (const entry of cancelableEntries) {
    for (const reservationId of getQueueUsageReservationIds(entry)) {
      const reservation = await ctx.db
        .query("usageReservations")
        .withIndex("by_reservation", (query) =>
          query.eq("reservationId", reservationId),
        )
        .unique();

      if (reservation?.state === "reserved") {
        await releaseUsageReservationForOwner(
          ctx,
          args.ownerId,
          reservationId,
          args.now,
          args.reason,
        );
      }
    }

    await releaseGenerationSlot(
      ctx,
      entry.generationSlotId,
      args.now,
      args.reason,
    );
    await ctx.db.patch(entry._id, {
      completedAt: args.now,
      error: args.reason,
      lockId: undefined,
      lockedBy: undefined,
      lockedUntil: undefined,
      status: "canceled",
      updatedAt: args.now,
    });
    await patchCanceledWorkerQueueSource(ctx, {
      error: args.reason,
      now: args.now,
      ownerId: args.ownerId,
      sourceId: entry.sourceId,
      sourceKind: entry.sourceKind,
    });
  }

  return { canceledCount: cancelableEntries.length };
}
