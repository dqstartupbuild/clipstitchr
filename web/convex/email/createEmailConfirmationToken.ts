import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { supersedeEmailConfirmationOperations } from "./supersedeEmailConfirmationOperations";

export async function createEmailConfirmationToken(
  ctx: MutationCtx,
  args: {
    contactId: Id<"marketingContacts">;
    courseKey?: Doc<"courseEntitlements">["courseKey"];
    createdAt: number;
    expiresAt: number;
    tokenDigest: string;
    tokenRecordId: string;
  },
) {
  const duplicate = await ctx.db
    .query("emailConfirmationTokens")
    .withIndex("by_token_record_id", (query) =>
      query.eq("tokenRecordId", args.tokenRecordId),
    )
    .unique();

  if (duplicate) throw new Error("Invalid confirmation token.");

  const previousTokens = await ctx.db
    .query("emailConfirmationTokens")
    .withIndex("by_contact_generation", (query) =>
      query.eq("contactId", args.contactId),
    )
    .collect();
  const generation =
    previousTokens.reduce(
      (highest, token) => Math.max(highest, token.generation),
      0,
    ) + 1;

  for (const token of previousTokens) {
    if (token.usedAt === undefined && token.supersededAt === undefined) {
      await ctx.db.patch(token._id, { supersededAt: args.createdAt });
    }
  }

  await supersedeEmailConfirmationOperations(
    ctx,
    args.contactId,
    args.createdAt,
  );

  return await ctx.db.insert("emailConfirmationTokens", {
    contactId: args.contactId,
    ...(args.courseKey ? { courseKey: args.courseKey } : {}),
    tokenRecordId: args.tokenRecordId,
    tokenDigest: args.tokenDigest,
    generation,
    expiresAt: args.expiresAt,
    createdAt: args.createdAt,
  });
}
