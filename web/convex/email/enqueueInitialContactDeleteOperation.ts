import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { getEmailProviderOperationIsTerminal } from "./getEmailProviderOperationIsTerminal";
import { enqueueEmailProviderOperation } from "./enqueueEmailProviderOperation";

export async function enqueueInitialContactDeleteOperation(
  ctx: MutationCtx,
  args: { contactId: Id<"marketingContacts">; now: number },
) {
  const operations = await ctx.db
    .query("emailProviderOperations")
    .withIndex("by_contact_created", (query) =>
      query.eq("contactId", args.contactId),
    )
    .collect();
  const existing = operations.find(
    (operation) =>
      operation.kind === "contactDelete" &&
      operation.compensatesOperationId === undefined &&
      (operation.status === "accepted" ||
        operation.status === "delivered" ||
        !getEmailProviderOperationIsTerminal(operation.status)),
  );

  if (!existing) {
    return await enqueueEmailProviderOperation(ctx, {
      contactId: args.contactId,
      kind: "contactDelete",
      now: args.now,
    });
  }

  if (existing.status === "held") {
    await ctx.db.patch(existing._id, {
      failureCategory: undefined,
      nextAttemptAt: args.now,
      status: "pending",
      terminalAt: undefined,
      updatedAt: args.now,
    });
    await ctx.scheduler.runAfter(
      0,
      internal.email.processEmailProviderOperation.processEmailProviderOperation,
      { operationId: existing._id },
    );
  }

  return existing._id;
}
