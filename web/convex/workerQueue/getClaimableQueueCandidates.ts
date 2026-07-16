import type { MutationCtx } from "../_generated/server";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import { getEffectiveEntitlementForOwner } from "../billing/getEffectiveEntitlementForOwner";
import { canAssignGenerationSlotWorker } from "./canAssignGenerationSlotWorker";
import { canAcquireGenerationSlot } from "./canAcquireGenerationSlot";
import { getQueueUsageReservationIds } from "./getQueueUsageReservationIds";
import { getOldestQueueCandidatePerOwner } from "./getOldestQueueCandidatePerOwner";

const CANDIDATE_SCAN_LIMIT = 250;

export async function getClaimableQueueCandidates(
  ctx: MutationCtx,
  args: {
    allowedTools?: string[];
    lane: PlanKey;
    now: string;
    worker: "provider" | "media";
  },
) {
  const allowedTools = args.allowedTools?.length
    ? new Set(args.allowedTools)
    : null;
  const nowMs = Date.parse(args.now);
  const candidates = await ctx.db
    .query("workerQueueEntries")
    .withIndex("by_worker_status_lane_created", (query) =>
      query
        .eq("worker", args.worker)
        .eq("status", "queued")
        .eq("queueLane", args.lane),
    )
    .order("asc")
    .take(CANDIDATE_SCAN_LIMIT);
  const claimable = [];

  for (const candidate of candidates) {
    if (
      (allowedTools && !allowedTools.has(candidate.tool)) ||
      (candidate.notBefore && Date.parse(candidate.notBefore) > nowMs) ||
      candidate.attempt >= 3
    ) {
      continue;
    }

    let hasInvalidUsageReservation = false;

    for (const usageReservationId of getQueueUsageReservationIds(candidate)) {
      const reservation = await ctx.db
        .query("usageReservations")
        .withIndex("by_reservation", (query) =>
          query.eq("reservationId", usageReservationId),
        )
        .unique();

      if (
        !reservation ||
        reservation.ownerId !== candidate.ownerId ||
        (reservation.state !== "reserved" &&
          reservation.state !== "committed") ||
        (reservation.state === "reserved" &&
          Date.parse(reservation.expiresAt) <= nowMs)
      ) {
        hasInvalidUsageReservation = true;
        break;
      }
    }

    if (hasInvalidUsageReservation) {
      continue;
    }

    const existingSlot = candidate.generationSlotId
      ? await ctx.db
          .query("generationSlots")
          .withIndex("by_slot", (query) =>
            query.eq("slotId", candidate.generationSlotId!),
          )
          .unique()
      : null;
    const hasActiveSlot = Boolean(
      existingSlot &&
      existingSlot.state === "active" &&
      Date.parse(existingSlot.expiresAt) > nowMs &&
      existingSlot.worker === args.worker,
    );
    const hasTransferableSlot = Boolean(
      existingSlot &&
      existingSlot.state === "active" &&
      Date.parse(existingSlot.expiresAt) > nowMs &&
      existingSlot.worker === undefined,
    );
    const hasWrongActiveWorker = Boolean(
      existingSlot &&
      existingSlot.state === "active" &&
      Date.parse(existingSlot.expiresAt) > nowMs &&
      existingSlot.worker !== undefined &&
      existingSlot.worker !== args.worker,
    );

    if (candidate.generationRequired && hasWrongActiveWorker) {
      continue;
    }

    if (candidate.generationRequired && !hasActiveSlot) {
      if (hasTransferableSlot && existingSlot) {
        const canAssign = await canAssignGenerationSlotWorker(ctx, {
          now: args.now,
          slotId: existingSlot.slotId,
          tool: candidate.tool,
          worker: args.worker,
        });

        if (!canAssign) {
          continue;
        }
      } else {
        const entitlement = await getEffectiveEntitlementForOwner(
          ctx,
          candidate.ownerId,
          args.now,
        );

        if (
          !entitlement ||
          entitlement.state === "inactive" ||
          entitlement.entitlement.billingReviewRequired ||
          !(await canAcquireGenerationSlot(ctx, {
            now: args.now,
            ownerId: candidate.ownerId,
            planKey: candidate.planKeySnapshot,
            tool: candidate.tool,
            worker: args.worker,
          }))
        ) {
          continue;
        }
      }
    }

    claimable.push(candidate);
  }

  return getOldestQueueCandidatePerOwner(claimable);
}
