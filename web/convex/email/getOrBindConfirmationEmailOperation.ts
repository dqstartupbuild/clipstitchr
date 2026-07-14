import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { getUnboundConfirmationEmailOperation } from "./getUnboundConfirmationEmailOperation";

export async function getOrBindConfirmationEmailOperation(
  ctx: MutationCtx,
  args: {
    contactId: Id<"marketingContacts">;
    eventAt: number;
    providerMessageId: string;
    receivedAt: number;
  },
) {
  const existing = await ctx.db
    .query("emailProviderOperations")
    .withIndex("by_provider_message_id", (query) =>
      query.eq("providerMessageId", args.providerMessageId),
    )
    .unique();

  if (existing) {
    return existing.contactId === args.contactId ? existing : null;
  }

  const operations = await ctx.db
    .query("emailProviderOperations")
    .withIndex("by_contact_created", (query) =>
      query.eq("contactId", args.contactId),
    )
    .collect();
  const operation = getUnboundConfirmationEmailOperation(
    operations,
    args.eventAt,
  );

  if (!operation) return null;

  await ctx.db.patch(operation._id, {
    providerMessageId: args.providerMessageId,
    updatedAt: args.receivedAt,
  });

  return { ...operation, providerMessageId: args.providerMessageId };
}
