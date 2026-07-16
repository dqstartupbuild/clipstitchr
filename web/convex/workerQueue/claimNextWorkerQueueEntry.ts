import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertMediaWorkerSecret } from "../auth/assertMediaWorkerSecret";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { workerQueueWorkerValidator } from "../validators/workerQueueWorker";
import { acquireGenerationSlot } from "./acquireGenerationSlot";
import { assignGenerationSlotWorker } from "./assignGenerationSlotWorker";
import { getClaimableQueueCandidates } from "./getClaimableQueueCandidates";
import { getWeightedQueueLane } from "./getWeightedQueueLane";
import { heartbeatGenerationSlot } from "./heartbeatGenerationSlot";
import { patchClaimedQueueSource } from "./patchClaimedQueueSource";
import { updateWorkerQueueDeficits } from "./updateWorkerQueueDeficits";
import { getQueueUsageReservationIds } from "./getQueueUsageReservationIds";

export const claimNextWorkerQueueEntry = mutation({
  args: {
    allowedTools: v.optional(v.array(v.string())),
    lockedUntil: v.string(),
    secret: v.string(),
    updatedAt: v.string(),
    worker: workerQueueWorkerValidator,
    workerId: v.string(),
  },
  handler: async (
    ctx,
    { allowedTools, lockedUntil, secret, updatedAt, worker, workerId },
  ) => {
    if (worker === "provider") {
      assertProviderWorkerSecret(secret);
    } else {
      assertMediaWorkerSecret(secret);
    }

    const candidatesByLane = {
      starter: await getClaimableQueueCandidates(ctx, {
        allowedTools,
        lane: "starter",
        now: updatedAt,
        worker,
      }),
      pro: await getClaimableQueueCandidates(ctx, {
        allowedTools,
        lane: "pro",
        now: updatedAt,
        worker,
      }),
      agency: await getClaimableQueueCandidates(ctx, {
        allowedTools,
        lane: "agency",
        now: updatedAt,
        worker,
      }),
    };
    const availableLanes = (["starter", "pro", "agency"] as const).filter(
      (lane) => candidatesByLane[lane].length > 0,
    );

    if (!availableLanes.length) {
      return null;
    }

    const schedulingState = await ctx.db
      .query("workerQueueSchedulingState")
      .withIndex("by_worker", (query) => query.eq("worker", worker))
      .unique();
    const deficits = {
      agency: schedulingState?.agencyDeficit ?? 0,
      pro: schedulingState?.proDeficit ?? 0,
      starter: schedulingState?.starterDeficit ?? 0,
    };
    const lane = getWeightedQueueLane({
      availableLanes,
      deficits,
      laneQueuedAt: {
        agency: candidatesByLane.agency[0]?.queuedAt,
        pro: candidatesByLane.pro[0]?.queuedAt,
        starter: candidatesByLane.starter[0]?.queuedAt,
      },
      now: updatedAt,
    });

    if (!lane) {
      return null;
    }

    const candidate = candidatesByLane[lane][0];
    let generationSlotId = candidate.generationSlotId;

    if (generationSlotId) {
      const existingSlot = await ctx.db
        .query("generationSlots")
        .withIndex("by_slot", (query) => query.eq("slotId", generationSlotId!))
        .unique();

      if (
        !existingSlot ||
        existingSlot.state !== "active" ||
        Date.parse(existingSlot.expiresAt) <= Date.parse(updatedAt)
      ) {
        generationSlotId = undefined;
      } else if (existingSlot.worker === undefined) {
        const assigned = await assignGenerationSlotWorker(ctx, {
          domainJobId: candidate.sourceId,
          now: updatedAt,
          ownerId: candidate.ownerId,
          slotId: existingSlot.slotId,
          tool: candidate.tool,
          worker,
        });

        if (!assigned) {
          return null;
        }
      } else if (existingSlot.worker !== worker) {
        return null;
      }
    }

    if (candidate.generationRequired && !generationSlotId) {
      const slot = await acquireGenerationSlot(ctx, {
        domainJobId: candidate.sourceId,
        idempotencyKey: candidate.queueEntryId,
        now: updatedAt,
        ownerId: candidate.ownerId,
        planKey: candidate.planKeySnapshot,
        provenance: "worker_queue",
        tool: candidate.tool,
        worker,
      });

      if (!slot) {
        return null;
      }

      generationSlotId = slot.slotId;
    }

    const nextDeficits = updateWorkerQueueDeficits(
      deficits,
      availableLanes,
      lane,
    );

    if (schedulingState) {
      await ctx.db.patch(schedulingState._id, {
        agencyDeficit: nextDeficits.agency,
        lastLane: lane,
        proDeficit: nextDeficits.pro,
        starterDeficit: nextDeficits.starter,
        updatedAt,
      });
    } else {
      await ctx.db.insert("workerQueueSchedulingState", {
        agencyDeficit: nextDeficits.agency,
        lastLane: lane,
        proDeficit: nextDeficits.pro,
        starterDeficit: nextDeficits.starter,
        updatedAt,
        worker,
      });
    }

    const lockId = `${candidate.queueEntryId}:${candidate.attempt + 1}`;
    await ctx.db.patch(candidate._id, {
      attempt: candidate.attempt + 1,
      generationSlotId,
      lockId,
      lockedBy: workerId,
      lockedUntil,
      startedAt: candidate.startedAt ?? updatedAt,
      status: "running",
      updatedAt,
    });

    for (const usageReservationId of getQueueUsageReservationIds(candidate)) {
      const reservation = await ctx.db
        .query("usageReservations")
        .withIndex("by_reservation", (query) =>
          query.eq("reservationId", usageReservationId),
        )
        .unique();

      if (reservation?.state === "reserved") {
        await ctx.db.patch(reservation._id, {
          expiresAt: new Date(
            Date.parse(updatedAt) + 24 * 60 * 60_000,
          ).toISOString(),
          updatedAt,
        });
      }
    }

    await heartbeatGenerationSlot(ctx, generationSlotId, updatedAt);

    const claimedEntry = await ctx.db.get(candidate._id);

    if (!claimedEntry) {
      throw new Error("Claimed queue entry was not found.");
    }

    const source = await patchClaimedQueueSource(ctx, claimedEntry, {
      lockedBy: workerId,
      lockedUntil,
      now: updatedAt,
    });

    return {
      queueEntryId: candidate.queueEntryId,
      source: source
        ? { ...source, planKeySnapshot: claimedEntry.planKeySnapshot }
        : source,
      sourceKind: candidate.sourceKind,
    };
  },
});
