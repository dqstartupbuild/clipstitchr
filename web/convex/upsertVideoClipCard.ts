import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { createVideoClipCardFields } from "./createVideoClipCardFields";

export async function upsertVideoClipCard(
  ctx: MutationCtx,
  clip: Doc<"videoClips">,
) {
  const existingCard = await ctx.db
    .query("videoClipCards")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", clip.ownerId).eq("id", clip.id),
    )
    .unique();
  const fields = createVideoClipCardFields(clip);

  if (existingCard) {
    await ctx.db.patch(existingCard._id, fields);
    return existingCard._id;
  }

  return await ctx.db.insert("videoClipCards", fields);
}
