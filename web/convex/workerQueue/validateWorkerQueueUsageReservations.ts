import type { MutationCtx } from "../_generated/server";

export async function validateWorkerQueueUsageReservations(
  ctx: MutationCtx,
  args: {
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

    if (
      !reservation ||
      reservation.ownerId !== args.ownerId ||
      reservation.state !== "reserved" ||
      reservation.reservationKind === "browser" ||
      (reservation.workerQueueEntryId !== undefined &&
        reservation.workerQueueEntryId !== args.queueEntryId) ||
      (reservation.workerQueueEntryId === undefined &&
        reservation.workerQueueLinkedAt !== undefined)
    ) {
      throw new Error("Queue entry usage reservation is invalid.");
    }

    if (
      reservation.reservationKind === undefined ||
      reservation.workerQueueLinkedAt === undefined ||
      reservation.workerQueueEntryId === undefined
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
