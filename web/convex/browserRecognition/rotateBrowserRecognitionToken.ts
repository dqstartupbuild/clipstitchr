import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function rotateBrowserRecognitionToken(
  ctx: MutationCtx,
  args: {
    contactId: Id<"marketingContacts">;
    expiresAt: number;
    issuedAt: number;
    previousTokenHash?: string;
    tokenHash: string;
  },
) {
  if (args.previousTokenHash) {
    const previous = await ctx.db
      .query("browserRecognitionTokens")
      .withIndex("by_token_hash", (query) =>
        query.eq("tokenHash", args.previousTokenHash as string),
      )
      .unique();

    if (previous && previous.revokedAt === undefined) {
      await ctx.db.patch(previous._id, {
        revokedAt: args.issuedAt,
        revocationReason: "rotated",
      });
    }
  }

  const duplicate = await ctx.db
    .query("browserRecognitionTokens")
    .withIndex("by_token_hash", (query) =>
      query.eq("tokenHash", args.tokenHash),
    )
    .unique();

  if (duplicate) {
    throw new Error("Invalid recognition token.");
  }

  return await ctx.db.insert("browserRecognitionTokens", {
    contactId: args.contactId,
    tokenHash: args.tokenHash,
    issuedAt: args.issuedAt,
    expiresAt: args.expiresAt,
  });
}
