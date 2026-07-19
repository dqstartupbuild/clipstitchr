import type { MutationCtx } from "../_generated/server";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import { getEffectiveEntitlementForOwner } from "../billing/getEffectiveEntitlementForOwner";
import { getGenerationSlotForQueue } from "./getGenerationSlotForQueue";
import { validateWorkerQueueUsageReservations } from "./validateWorkerQueueUsageReservations";
import { createWorkerQueueEntryId } from "./createWorkerQueueEntryId";

type QueueSourceKind = "provider_job" | "media_job" | "automation_task";
type QueueWorker = "provider" | "media";
const MAX_ACTIVE_QUEUE_ENTRIES_PER_OWNER = 100;

export async function enqueueWorkerQueueEntry(
  ctx: MutationCtx,
  args: {
    generationRequired: boolean;
    generationSlotId?: string;
    now: string;
    ownerId: string;
    sourceId: string;
    sourceKind: QueueSourceKind;
    tool: string;
    usageReservationId?: string;
    usageReservationIds?: string[];
    worker: QueueWorker;
  },
) {
  const queueEntryId = createWorkerQueueEntryId(
    args.worker,
    args.sourceKind,
    args.sourceId,
  );
  const existing = await ctx.db
    .query("workerQueueEntries")
    .withIndex("by_source", (query) =>
      query.eq("sourceKind", args.sourceKind).eq("sourceId", args.sourceId),
    )
    .unique();
  const inheritedSlot = args.generationSlotId
    ? await getGenerationSlotForQueue(ctx, {
        generationSlotId: args.generationSlotId,
        now: args.now,
        ownerId: args.ownerId,
        sourceKind: args.sourceKind,
        worker: args.worker,
      })
    : null;
  const usageReservationId =
    args.usageReservationId ?? existing?.usageReservationId;
  const usageReservationIdsInput =
    args.usageReservationIds ?? existing?.usageReservationIds;
  const linkedUsageReservationIds = Array.from(
    new Set([
      ...(usageReservationId ? [usageReservationId] : []),
      ...(usageReservationIdsInput ?? []),
    ]),
  );

  if (linkedUsageReservationIds.length > 0) {
    await validateWorkerQueueUsageReservations(ctx, {
      handoffGenerationSlotId:
        args.sourceKind === "media_job" && args.worker === "media"
          ? inheritedSlot?.slotId
          : undefined,
      now: args.now,
      ownerId: args.ownerId,
      queueEntryId,
      reservationIds: linkedUsageReservationIds,
    });
  }

  if (existing) {
    if (
      existing.status === "failed" ||
      existing.status === "canceled" ||
      existing.status === "completed"
    ) {
      await ctx.db.patch(existing._id, {
        completedAt: undefined,
        error: undefined,
        generationRequired: args.generationRequired,
        generationSlotId: args.generationSlotId,
        lockId: undefined,
        lockedBy: undefined,
        lockedUntil: undefined,
        notBefore: undefined,
        queuedAt: args.now,
        status: "queued",
        updatedAt: args.now,
        usageReservationId,
        usageReservationIds: usageReservationIdsInput,
      });

      return (await ctx.db.get(existing._id)) ?? existing;
    }

    if (
      existing.status === "queued" &&
      args.generationSlotId &&
      existing.generationSlotId !== args.generationSlotId
    ) {
      await ctx.db.patch(existing._id, {
        generationSlotId: args.generationSlotId,
        updatedAt: args.now,
        usageReservationId,
        usageReservationIds: usageReservationIdsInput,
      });

      return (await ctx.db.get(existing._id)) ?? existing;
    }

    return existing;
  }

  const [queuedEntries, runningEntries] = await Promise.all([
    ctx.db
      .query("workerQueueEntries")
      .withIndex("by_owner_status", (query) =>
        query.eq("ownerId", args.ownerId).eq("status", "queued"),
      )
      .take(MAX_ACTIVE_QUEUE_ENTRIES_PER_OWNER),
    ctx.db
      .query("workerQueueEntries")
      .withIndex("by_owner_status", (query) =>
        query.eq("ownerId", args.ownerId).eq("status", "running"),
      )
      .take(MAX_ACTIVE_QUEUE_ENTRIES_PER_OWNER),
  ]);

  if (
    queuedEntries.length + runningEntries.length >=
    MAX_ACTIVE_QUEUE_ENTRIES_PER_OWNER
  ) {
    throw new Error(
      "You already have 100 creations waiting or running. Let one finish before adding another.",
    );
  }

  let planKey: PlanKey;

  if (inheritedSlot) {
    planKey = inheritedSlot.planKeySnapshot;
  } else {
    const effective = await getEffectiveEntitlementForOwner(
      ctx,
      args.ownerId,
      args.now,
    );

    if (
      !effective ||
      effective.state === "inactive" ||
      effective.entitlement.billingReviewRequired
    ) {
      throw new Error("An active paid plan is required to queue this work.");
    }

    planKey = effective.entitlement.planKey;
  }

  const usageReservationExempt =
    args.sourceKind === "media_job" ||
    args.tool === "hook-lab-idea-use" ||
    (args.tool === "stitchr" && planKey === "agency");

  if (
    args.generationRequired &&
    !usageReservationExempt &&
    linkedUsageReservationIds.length === 0
  ) {
    throw new Error("Paid generation requires a usage reservation.");
  }

  const id = await ctx.db.insert("workerQueueEntries", {
    attempt: 0,
    createdAt: args.now,
    generationRequired: args.generationRequired,
    generationSlotId: args.generationSlotId,
    ownerId: args.ownerId,
    planKeySnapshot: planKey,
    queueEntryId,
    queueLane: planKey,
    queuedAt: args.now,
    sourceId: args.sourceId,
    sourceKind: args.sourceKind,
    status: "queued",
    tool: args.tool,
    updatedAt: args.now,
    usageReservationId,
    usageReservationIds: usageReservationIdsInput,
    worker: args.worker,
  });
  const entry = await ctx.db.get(id);

  if (!entry) {
    throw new Error("Unable to create worker queue entry.");
  }

  return entry;
}
