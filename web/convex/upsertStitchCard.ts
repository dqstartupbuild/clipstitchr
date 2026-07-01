import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { createStitchCardFields } from "./createStitchCardFields";

export async function upsertStitchCard(
  ctx: MutationCtx,
  stitch: Doc<"stitches">,
) {
  const existingCard = await ctx.db
    .query("stitchCards")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", stitch.ownerId).eq("id", stitch.id),
    )
    .unique();
  const fields = createStitchCardFields(stitch);

  if (existingCard) {
    await ctx.db.patch(existingCard._id, fields);
    return existingCard._id;
  }

  return await ctx.db.insert("stitchCards", fields);
}
