import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { courseSectionItemIds } from "../../lib/clipstitchr/tools/courses/courseSectionItemIds";
import { getCourseReleasedSectionCount } from "../../lib/clipstitchr/tools/courses/getCourseReleasedSectionCount";
import { getCourseAccessEvaluationAt } from "./getCourseAccessEvaluationAt";
import { getValidCourseAccessSession } from "./getValidCourseAccessSession";

export async function getCourseWorkspaceAccess(
  ctx: MutationCtx,
  args: {
    accessedAt: number;
    courseKey: Doc<"courseEntitlements">["courseKey"];
    tokenHash: string;
  },
) {
  const sessionAccess = await getValidCourseAccessSession(ctx, {
    accessedAt: args.accessedAt,
    tokenHash: args.tokenHash,
  });

  if (!sessionAccess) return null;

  const entitlement = await ctx.db
    .query("courseEntitlements")
    .withIndex("by_contact_course_version", (query) =>
      query
        .eq("contactId", sessionAccess.contact._id)
        .eq("courseKey", args.courseKey)
        .eq("courseVersion", "v1"),
    )
    .unique();

  if (
    !entitlement ||
    entitlement.status !== "active" ||
    entitlement.activatedAt === undefined
  ) {
    return { ...sessionAccess, entitlement: null, releasedSectionCount: 0 };
  }

  const contactEvaluationAt = getCourseAccessEvaluationAt(
    sessionAccess.contact,
    args.accessedAt,
  );
  const evaluatedAt = entitlement.releaseStoppedAt
    ? Math.min(contactEvaluationAt, entitlement.releaseStoppedAt)
    : contactEvaluationAt;
  const releasedSectionCount = getCourseReleasedSectionCount({
    activatedAt: entitlement.activatedAt,
    courseKey: args.courseKey,
    evaluatedAt,
    sectionCount: courseSectionItemIds[args.courseKey].length,
  });

  return { ...sessionAccess, entitlement, releasedSectionCount };
}
