import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { getOrCreateCourseEntitlement } from "./getOrCreateCourseEntitlement";

export async function activateCourseEntitlement(
  ctx: MutationCtx,
  args: {
    activatedAt: number;
    contactId: Id<"marketingContacts">;
    courseKey: Doc<"courseEntitlements">["courseKey"];
    courseVersion: Doc<"courseEntitlements">["courseVersion"];
  },
) {
  const entitlement = await getOrCreateCourseEntitlement(ctx, {
    contactId: args.contactId,
    courseKey: args.courseKey,
    courseVersion: args.courseVersion,
    requestedAt: args.activatedAt,
  });

  if (entitlement.status === "active" && entitlement.activatedAt !== undefined) {
    return entitlement;
  }

  await ctx.db.patch(entitlement._id, {
    activatedAt: args.activatedAt,
    status: "active",
    updatedAt: args.activatedAt,
  });

  return (await ctx.db.get(entitlement._id)) as Doc<"courseEntitlements">;
}
