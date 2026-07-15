import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function getOrCreateCourseEntitlement(
  ctx: MutationCtx,
  args: {
    contactId: Id<"marketingContacts">;
    courseKey: Doc<"courseEntitlements">["courseKey"];
    courseVersion: Doc<"courseEntitlements">["courseVersion"];
    requestedAt: number;
  },
) {
  const existing = await ctx.db
    .query("courseEntitlements")
    .withIndex("by_contact_course_version", (query) =>
      query
        .eq("contactId", args.contactId)
        .eq("courseKey", args.courseKey)
        .eq("courseVersion", args.courseVersion),
    )
    .unique();

  if (existing) return existing;

  const entitlementId = await ctx.db.insert("courseEntitlements", {
    contactId: args.contactId,
    courseKey: args.courseKey,
    courseVersion: args.courseVersion,
    status: "pendingConfirmation",
    requestedAt: args.requestedAt,
    updatedAt: args.requestedAt,
  });

  return (await ctx.db.get(entitlementId)) as Doc<"courseEntitlements">;
}
