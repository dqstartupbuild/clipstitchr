import type { MutationCtx } from "../_generated/server";
import { internal } from "../_generated/api";

export async function resumeHeldAccountEmailOperationsForOwner(
  ctx: MutationCtx,
  args: { now: number; ownerId: string },
) {
  const operations = await ctx.db
    .query("accountEmailOperations")
    .withIndex("by_owner_created", (query) =>
      query.eq("ownerId", args.ownerId),
    )
    .order("asc")
    .take(100);
  const held = operations.filter((operation) => operation.status === "held");

  for (const operation of held) {
    await ctx.db.patch(operation._id, {
      failureCategory: undefined,
      nextAttemptAt: args.now,
      status: "pending",
      updatedAt: args.now,
    });
    await ctx.scheduler.runAfter(
      0,
      internal.accountEmail.processAccountEmailOperation
        .processAccountEmailOperation,
      { operationId: operation._id },
    );
  }

  return held.length;
}
