import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function deleteCourseAccessForContact(
  ctx: MutationCtx,
  contactId: Id<"marketingContacts">,
) {
  const sessions = await ctx.db
    .query("courseAccessSessions")
    .withIndex("by_contact_issued", (query) =>
      query.eq("contactId", contactId),
    )
    .collect();

  for (const session of sessions) await ctx.db.delete(session._id);

  for (const status of ["pendingConfirmation", "active"] as const) {
    const entitlements = await ctx.db
      .query("courseEntitlements")
      .withIndex("by_contact_status", (query) =>
        query.eq("contactId", contactId).eq("status", status),
      )
      .collect();

    for (const entitlement of entitlements) {
      const progressItems = await ctx.db
        .query("courseProgressItems")
        .withIndex("by_entitlement_updated", (query) =>
          query.eq("entitlementId", entitlement._id),
        )
        .collect();

      for (const item of progressItems) await ctx.db.delete(item._id);
      await ctx.db.delete(entitlement._id);
    }
  }
}
