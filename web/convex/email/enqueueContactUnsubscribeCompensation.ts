import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { getMarketingContactNeedsProviderUnsubscribe } from "../marketingContacts/getMarketingContactNeedsProviderUnsubscribe";
import { enqueueEmailProviderOperation } from "./enqueueEmailProviderOperation";

export async function enqueueContactUnsubscribeCompensation(
  ctx: MutationCtx,
  args: {
    compensatesOperationId: Id<"emailProviderOperations">;
    contactId: Id<"marketingContacts">;
    now: number;
  },
) {
  const contact = await ctx.db.get(args.contactId);

  if (!contact || !getMarketingContactNeedsProviderUnsubscribe(contact)) {
    return null;
  }

  const compensations = await ctx.db
    .query("emailProviderOperations")
    .withIndex("by_compensated_operation", (query) =>
      query.eq("compensatesOperationId", args.compensatesOperationId),
    )
    .collect();
  const existing = compensations.find(
    (operation) =>
      operation.kind === "contactUnsubscribe" &&
      operation.compensatesOperationId === args.compensatesOperationId,
  );

  if (existing) return existing._id;

  return await enqueueEmailProviderOperation(ctx, {
    compensatesOperationId: args.compensatesOperationId,
    contactId: args.contactId,
    kind: "contactUnsubscribe",
    now: args.now,
  });
}
