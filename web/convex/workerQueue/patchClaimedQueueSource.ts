import type { MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { upsertAutomationTaskSummary } from "../upsertAutomationTaskSummary";
import { upsertWorkerJobSummary } from "../upsertWorkerJobSummary";

type QueueEntry = Doc<"workerQueueEntries">;

export async function patchClaimedQueueSource(
  ctx: MutationCtx,
  entry: QueueEntry,
  args: { lockedBy: string; lockedUntil: string; now: string },
) {
  if (entry.sourceKind === "provider_job") {
    const source = await ctx.db
      .query("providerJobs")
      .withIndex("by_owner_id", (query) =>
        query.eq("ownerId", entry.ownerId).eq("id", entry.sourceId),
      )
      .unique();

    if (!source) {
      throw new Error("Queued provider job was not found.");
    }

    await ctx.db.patch(source._id, {
      attempt: source.attempt + 1,
      generationSlotId: entry.generationSlotId,
      lockedBy: args.lockedBy,
      lockedUntil: args.lockedUntil,
      status: "running",
      updatedAt: args.now,
    });

    const updated = await ctx.db.get(source._id);
    if (updated) {
      await upsertWorkerJobSummary(ctx, "provider", updated);
    }
    return updated;
  }

  if (entry.sourceKind === "media_job") {
    const source = await ctx.db
      .query("mediaJobs")
      .withIndex("by_owner_id", (query) =>
        query.eq("ownerId", entry.ownerId).eq("id", entry.sourceId),
      )
      .unique();

    if (!source) {
      throw new Error("Queued media job was not found.");
    }

    await ctx.db.patch(source._id, {
      attempt: source.attempt + 1,
      generationSlotId: entry.generationSlotId,
      lockedBy: args.lockedBy,
      lockedUntil: args.lockedUntil,
      stage: "claimed",
      status: "running",
      updatedAt: args.now,
    });

    const updated = await ctx.db.get(source._id);
    if (updated) {
      await upsertWorkerJobSummary(ctx, "media", updated);
    }
    return updated;
  }

  const source = await ctx.db
    .query("automationTasks")
    .withIndex("by_owner_id", (query) =>
      query.eq("ownerId", entry.ownerId).eq("id", entry.sourceId),
    )
    .unique();

  if (!source) {
    throw new Error("Queued automation task was not found.");
  }

  await ctx.db.patch(source._id, {
    attempt: source.attempt + 1,
    generationSlotId: entry.generationSlotId,
    lockedBy: args.lockedBy,
    lockedUntil: args.lockedUntil,
    status: "running",
    updatedAt: args.now,
  });

  const updated = await ctx.db.get(source._id);
  if (updated) {
    await upsertAutomationTaskSummary(ctx, updated);
  }
  return updated;
}
