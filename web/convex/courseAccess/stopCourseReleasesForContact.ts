import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function stopCourseReleasesForContact(
  ctx: MutationCtx,
  contactId: Id<"marketingContacts">,
  stoppedAt: number,
) {
  const entitlements = await ctx.db
    .query("courseEntitlements")
    .withIndex("by_contact_status", (query) =>
      query.eq("contactId", contactId).eq("status", "active"),
    )
    .collect();

  for (const entitlement of entitlements) {
    if (
      entitlement.releaseStoppedAt === undefined ||
      stoppedAt < entitlement.releaseStoppedAt
    ) {
      await ctx.db.patch(entitlement._id, {
        releaseStoppedAt: stoppedAt,
        updatedAt: stoppedAt,
      });
    }
  }
}
