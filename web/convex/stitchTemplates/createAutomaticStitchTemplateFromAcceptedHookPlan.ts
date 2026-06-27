import type { MutationCtx } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";
import { createStitchTemplateDocumentFromStitch } from "./createStitchTemplateDocumentFromStitch";
import { getAcceptedHookTemplateId } from "./getAcceptedHookTemplateId";
import { getAcceptedHookTemplateName } from "./getAcceptedHookTemplateName";
import { getStitchTemplateTextOverlaysForAcceptedHook } from "./getStitchTemplateTextOverlaysForAcceptedHook";

export async function createAutomaticStitchTemplateFromAcceptedHookPlan({
  ctx,
  hookText,
  ownerId,
  stitchId,
  updatedAt,
}: {
  ctx: MutationCtx;
  hookText: string;
  ownerId: string;
  stitchId?: string;
  updatedAt: string;
}) {
  if (!stitchId || !hookText.trim()) {
    return null;
  }

  const stitch = await ctx.db
    .query("stitches")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", ownerId).eq("id", stitchId),
    )
    .unique();

  if (!stitch) {
    return null;
  }

  const existingTemplate = await ctx.db
    .query("stitchTemplates")
    .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
    .filter((q) => q.eq(q.field("sourceStitchId"), stitch.id))
    .first();

  if (existingTemplate) {
    return existingTemplate.id;
  }

  await rateLimiter.limit(ctx, "convexRecordSave", {
    key: ownerId,
    throws: true,
  });

  const textOverlays = getStitchTemplateTextOverlaysForAcceptedHook({
    hookText,
    stitch,
  });
  const template = createStitchTemplateDocumentFromStitch({
    id: getAcceptedHookTemplateId(ownerId, stitch.id),
    name: getAcceptedHookTemplateName(hookText),
    now: updatedAt,
    ownerId,
    stitch,
  });

  await ctx.db.insert("stitchTemplates", {
    ...template,
    textOverlay: textOverlays[0],
    textOverlays,
  });

  return template.id;
}
