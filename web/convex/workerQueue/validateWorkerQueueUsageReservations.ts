import type { MutationCtx } from "../_generated/server";

export async function validateWorkerQueueUsageReservations(
  ctx: MutationCtx,
  args: {
    handoffGenerationSlotId?: string;
    now: string;
    ownerId: string;
    queueEntryId: string;
    reservationIds: string[];
  },
) {
  for (const reservationId of args.reservationIds) {
    const reservation = await ctx.db
      .query("usageReservations")
      .withIndex("by_reservation", (query) =>
        query.eq("reservationId", reservationId),
      )
      .unique();
    const linkedQueueEntry =
      reservation?.workerQueueEntryId &&
      reservation.workerQueueEntryId !== args.queueEntryId &&
      args.handoffGenerationSlotId
        ? await ctx.db
            .query("workerQueueEntries")
            .withIndex("by_queue_entry", (query) =>
              query.eq("queueEntryId", reservation.workerQueueEntryId!),
            )
            .unique()
        : null;
    const isProviderToMediaHandoff =
      linkedQueueEntry?.ownerId === args.ownerId &&
      linkedQueueEntry.worker === "provider" &&
      linkedQueueEntry.generationSlotId === args.handoffGenerationSlotId &&
      (linkedQueueEntry.status === "running" ||
        linkedQueueEntry.status === "completed");

    if (
      !reservation ||
      reservation.ownerId !== args.ownerId ||
      reservation.state !== "reserved" ||
      (reservation.reservationKind !== undefined &&
        reservation.reservationKind !== "worker") ||
      (reservation.workerQueueEntryId !== undefined &&
        reservation.workerQueueEntryId !== args.queueEntryId &&
        !isProviderToMediaHandoff) ||
      (reservation.workerQueueEntryId === undefined &&
        reservation.workerQueueLinkedAt !== undefined)
    ) {
      throw new Error("Queue entry usage reservation is invalid.");
    }

    if (
      reservation.reservationKind === undefined ||
      reservation.workerQueueLinkedAt === undefined ||
      reservation.workerQueueEntryId === undefined ||
      isProviderToMediaHandoff
    ) {
      await ctx.db.patch(reservation._id, {
        reservationKind: "worker",
        updatedAt: args.now,
        workerQueueEntryId: args.queueEntryId,
        workerQueueLinkedAt: reservation.workerQueueLinkedAt ?? args.now,
      });
    }
  }
}
