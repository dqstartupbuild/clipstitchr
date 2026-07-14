import type { MutationCtx } from "../_generated/server";
import { cancelEmailProviderOperationsForContact } from "../email/cancelEmailProviderOperationsForContact";

export async function applyProviderDeletionTombstone(
  ctx: MutationCtx,
  args: {
    appliedAt: number;
    eventAt: number;
    providerContactId?: string;
    providerContactKey: string;
    webhookId: string;
  },
) {
  const contactByKey = await ctx.db
    .query("marketingContacts")
    .withIndex("by_provider_contact_key", (query) =>
      query.eq("providerContactKey", args.providerContactKey),
    )
    .unique();
  const contactById =
    !contactByKey && args.providerContactId
      ? await ctx.db
          .query("marketingContacts")
          .withIndex("by_provider_contact_id", (query) =>
            query.eq("providerContactId", args.providerContactId),
          )
          .unique()
      : null;
  const contact = contactByKey ?? contactById;
  const isPrivacyDeleted = contact?.deletionStatus === "privacyDeleted";
  const isStale = Boolean(
    contact?.deletionChangedAt !== undefined &&
      contact.deletionChangedAt > args.eventAt,
  );

  const tombstoneId = await ctx.db.insert("providerDeletionTombstones", {
    providerContactKey: args.providerContactKey,
    ...(args.providerContactId
      ? { providerContactId: args.providerContactId }
      : {}),
    ...(contact ? { contactId: contact._id } : {}),
    webhookId: args.webhookId,
    eventAt: args.eventAt,
    deletedAt: args.appliedAt,
    ...(isStale || isPrivacyDeleted ? { clearedAt: args.appliedAt } : {}),
    createdAt: args.appliedAt,
    updatedAt: args.appliedAt,
  });

  if (!contact || isStale || isPrivacyDeleted) {
    return { applied: false as const, contactId: contact?._id, tombstoneId };
  }

  await ctx.db.patch(contact._id, {
    deletionStatus: "providerDeleted",
    deletionChangedAt: args.eventAt,
    marketingEligible: false,
    providerContactId: args.providerContactId ?? contact.providerContactId,
    updatedAt: args.appliedAt,
  });
  await cancelEmailProviderOperationsForContact(
    ctx,
    contact._id,
    args.appliedAt,
  );

  return { applied: true as const, contactId: contact._id, tombstoneId };
}
