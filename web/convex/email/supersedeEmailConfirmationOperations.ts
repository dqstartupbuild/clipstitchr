import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function supersedeEmailConfirmationOperations(
  ctx: MutationCtx,
  contactId: Id<"marketingContacts">,
  supersededAt: number,
) {
  const statuses = ["held", "pending", "claimed"] as const;

  for (const status of statuses) {
    const operations = await ctx.db
      .query("emailProviderOperations")
      .withIndex("by_contact_kind_status", (query) =>
        query
          .eq("contactId", contactId)
          .eq("kind", "transactional")
          .eq("status", status),
      )
      .collect();

    for (const operation of operations) {
      if (operation.transactionalTemplateKey !== "email-confirmation") {
        continue;
      }

      await ctx.db.patch(operation._id, {
        status: "superseded",
        leaseOwner: undefined,
        leaseExpiresAt: undefined,
        terminalAt: supersededAt,
        updatedAt: supersededAt,
      });
    }
  }
}
