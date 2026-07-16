import type { MutationCtx } from "../_generated/server";
import { commitUsageReservationForOwner } from "../usage/commitUsageReservation";
import { reacquireUsageReservation } from "../usage/reacquireUsageReservation";
import { releaseUsageReservationForOwner } from "../usage/releaseUsageReservation";
import { heartbeatGenerationSlot } from "./heartbeatGenerationSlot";
import { releaseGenerationSlot } from "./releaseGenerationSlot";
import { getQueueUsageReservationIds } from "./getQueueUsageReservationIds";

type QueueSourceKind = "provider_job" | "media_job" | "automation_task";

export async function updateWorkerQueueEntryStatus(
  ctx: MutationCtx,
  args: {
    continuationDelayMs?: number;
    error?: string;
    handoff?: boolean;
    now: string;
    releaseLock?: boolean;
    sourceId: string;
    sourceKind: QueueSourceKind;
    status: string;
  },
) {
  const entry = await ctx.db
    .query("workerQueueEntries")
    .withIndex("by_source", (query) =>
      query.eq("sourceKind", args.sourceKind).eq("sourceId", args.sourceId),
    )
    .unique();

  if (!entry) {
    return null;
  }

  const isCompleted = args.status === "completed";
  const isFailed = args.status === "failed" || args.status === "skipped";
  const isCanceled = args.status === "canceled";
  const shouldRequeue =
    args.status === "queued" ||
    (args.status === "running" && args.releaseLock === true);

  if (args.handoff) {
    await releaseGenerationSlot(
      ctx,
      entry.generationSlotId,
      args.now,
      "Work handed off to media finalization",
    );
    await ctx.db.patch(entry._id, {
      completedAt: args.now,
      error: args.error,
      generationSlotId: undefined,
      lockId: undefined,
      lockedBy: undefined,
      lockedUntil: undefined,
      status: "completed",
      updatedAt: args.now,
    });

    return entry._id;
  }

  if (shouldRequeue) {
    await ctx.db.patch(entry._id, {
      error: args.error,
      lockId: undefined,
      lockedBy: undefined,
      lockedUntil: undefined,
      notBefore: args.continuationDelayMs
        ? new Date(
            Date.parse(args.now) + args.continuationDelayMs,
          ).toISOString()
        : undefined,
      status: "queued",
      updatedAt: args.now,
    });
    await heartbeatGenerationSlot(ctx, entry.generationSlotId, args.now);

    return entry._id;
  }

  if (args.status === "running") {
    await heartbeatGenerationSlot(ctx, entry.generationSlotId, args.now);
    await ctx.db.patch(entry._id, {
      error: args.error,
      status: "running",
      updatedAt: args.now,
    });

    return entry._id;
  }

  if (!isCompleted && !isFailed && !isCanceled) {
    return entry._id;
  }

  const usageReservationIds = getQueueUsageReservationIds(entry);

  for (const originalReservationId of usageReservationIds) {
    const reservation = await ctx.db
      .query("usageReservations")
      .withIndex("by_reservation", (query) =>
        query.eq("reservationId", originalReservationId),
      )
      .unique();

    if (!reservation || reservation.ownerId !== entry.ownerId) {
      throw new Error("Queue usage reservation was not found.");
    }

    if (isCompleted) {
      if (reservation.state === "released") {
        continue;
      }

      const usageReservationId = await reacquireUsageReservation(
        ctx,
        entry.ownerId,
        originalReservationId,
        args.now,
      );
      await commitUsageReservationForOwner(
        ctx,
        entry.ownerId,
        usageReservationId,
        args.now,
        "worker",
      );
    } else if (reservation.state === "reserved") {
      await releaseUsageReservationForOwner(
        ctx,
        entry.ownerId,
        originalReservationId,
        args.now,
        args.error ?? (isCanceled ? "Job canceled" : "Job failed"),
      );
    }
  }

  await releaseGenerationSlot(
    ctx,
    entry.generationSlotId,
    args.now,
    args.error ?? (isCompleted ? "Job completed" : "Job ended"),
  );
  await ctx.db.patch(entry._id, {
    completedAt: args.now,
    error: args.error,
    lockId: undefined,
    lockedBy: undefined,
    lockedUntil: undefined,
    status: isCompleted ? "completed" : isCanceled ? "canceled" : "failed",
    updatedAt: args.now,
  });

  return entry._id;
}
