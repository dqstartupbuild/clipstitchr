import type { MutationCtx } from "../_generated/server";
import { upsertAutomationTaskSummary } from "../upsertAutomationTaskSummary";
import { upsertWorkerJobSummary } from "../upsertWorkerJobSummary";

export async function patchWorkerQueueSourceForRetry(
  ctx: MutationCtx,
  args: {
    now: string;
    ownerId: string;
    sourceId: string;
    sourceKind: "automation_task" | "media_job" | "provider_job";
  },
) {
  if (args.sourceKind === "automation_task") {
    const source = await ctx.db
      .query("automationTasks")
      .withIndex("by_owner_id", (query) =>
        query.eq("ownerId", args.ownerId).eq("id", args.sourceId),
      )
      .unique();

    if (!source) {
      return;
    }

    await ctx.db.patch(source._id, {
      lockedBy: undefined,
      lockedUntil: undefined,
      status: "queued",
      updatedAt: args.now,
    });
    const updated = await ctx.db.get(source._id);

    if (updated) {
      await upsertAutomationTaskSummary(ctx, updated);
    }
    return;
  }

  const source =
    args.sourceKind === "provider_job"
      ? await ctx.db
          .query("providerJobs")
          .withIndex("by_owner_id", (query) =>
            query.eq("ownerId", args.ownerId).eq("id", args.sourceId),
          )
          .unique()
      : await ctx.db
          .query("mediaJobs")
          .withIndex("by_owner_id", (query) =>
            query.eq("ownerId", args.ownerId).eq("id", args.sourceId),
          )
          .unique();

  if (!source) {
    return;
  }

  await ctx.db.patch(source._id, {
    lockedBy: undefined,
    lockedUntil: undefined,
    status: "queued",
    updatedAt: args.now,
  });
  const updated = await ctx.db.get(source._id);

  if (updated) {
    await upsertWorkerJobSummary(
      ctx,
      args.sourceKind === "provider_job" ? "provider" : "media",
      updated,
    );
  }
}
