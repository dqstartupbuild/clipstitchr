import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function getOrCreateMarketingWorkflowEnrollment(
  ctx: MutationCtx,
  args: {
    contactId: Id<"marketingContacts">;
    createdAt: number;
    workflowKey: Doc<"marketingWorkflowEnrollments">["workflowKey"];
    workflowVersion: Doc<"marketingWorkflowEnrollments">["workflowVersion"];
  },
) {
  const existing = await ctx.db
    .query("marketingWorkflowEnrollments")
    .withIndex("by_contact_workflow_version", (query) =>
      query
        .eq("contactId", args.contactId)
        .eq("workflowKey", args.workflowKey)
        .eq("workflowVersion", args.workflowVersion),
    )
    .unique();

  if (existing) {
    return { created: false as const, enrollmentId: existing._id };
  }

  const enrollmentId = await ctx.db.insert("marketingWorkflowEnrollments", {
    contactId: args.contactId,
    workflowKey: args.workflowKey,
    workflowVersion: args.workflowVersion,
    status: "pending",
    createdAt: args.createdAt,
    updatedAt: args.createdAt,
  });

  return {
    created: true as const,
    enrollmentId: enrollmentId as Id<"marketingWorkflowEnrollments">,
  };
}
