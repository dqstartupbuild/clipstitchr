import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function resumeHeldContactDeleteOperationsForContact(
  ctx: MutationCtx,
  args: { contactId: Id<"marketingContacts">; now: number },
) {
  const operations = await ctx.db
    .query("emailProviderOperations")
    .withIndex("by_contact_created", (query) =>
      query.eq("contactId", args.contactId),
    )
    .collect();
  const heldDeletes = operations.filter(
    (operation) =>
      operation.kind === "contactDelete" && operation.status === "held",
  );

  for (const operation of heldDeletes) {
    await ctx.db.patch(operation._id, {
      failureCategory: undefined,
      nextAttemptAt: args.now,
      status: "pending",
      updatedAt: args.now,
    });
    await ctx.scheduler.runAfter(
      0,
      internal.email.processEmailProviderOperation.processEmailProviderOperation,
      { operationId: operation._id },
    );
  }

  return heldDeletes.length;
}
