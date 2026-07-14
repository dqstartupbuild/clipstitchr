import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function revokeBrowserRecognitionTokensForContact(
  ctx: MutationCtx,
  contactId: Id<"marketingContacts">,
) {
  const tokens = await ctx.db
    .query("browserRecognitionTokens")
    .withIndex("by_contact_issued", (query) => query.eq("contactId", contactId))
    .collect();

  for (const token of tokens) {
    await ctx.db.delete(token._id);
  }

  return tokens.length;
}
