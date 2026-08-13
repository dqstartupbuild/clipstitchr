import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { consumeStudioClipsCostStageRateLimits } from "../studioClipsRateLimits/consumeStudioClipsCostStageRateLimits";
import { studioClipsCostStageValidator } from "../validators/studioClipsCostStage";
import { assertStudioClipsWorkerLease } from "./assertStudioClipsWorkerLease";
import { assertStudioClipsWorkerSecret } from "./assertStudioClipsWorkerSecret";
import { getStudioClipsWorkerTask } from "./getStudioClipsWorkerTask";

export const reserveCost = mutation({
  args: {
    attempt: v.number(),
    leaseId: v.string(),
    ownerId: v.string(),
    productId: v.string(),
    secret: v.string(),
    stage: studioClipsCostStageValidator,
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    assertStudioClipsWorkerSecret(args.secret);
    const task = assertStudioClipsWorkerLease(
      await getStudioClipsWorkerTask(ctx, args),
      args,
    );
    const existing = await ctx.db
      .query("studioClipsCostReservations")
      .withIndex("by_task_attempt_stage", (query) =>
        query
          .eq("taskId", task.id)
          .eq("attempt", args.attempt)
          .eq("stage", args.stage),
      )
      .unique();
    if (existing) return { alreadyReserved: true };
    await consumeStudioClipsCostStageRateLimits(ctx, task.ownerId);
    await ctx.db.insert("studioClipsCostReservations", {
      attempt: args.attempt,
      createdAt: new Date().toISOString(),
      ownerId: task.ownerId,
      productId: task.productId,
      stage: args.stage,
      taskId: task.id,
    });
    return { alreadyReserved: false };
  },
});
